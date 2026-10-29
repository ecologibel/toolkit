// ---- Google Drive sync ----
//
// Each tool keeps working from localStorage. This script copies a tool's
// synced keys to a hidden app folder in the user's own Google Drive, so the
// data follows them across devices. The newest edit wins.
//
// Usage (after the tool's own script has loaded its data):
//   ToolSync.init({
//     file: "to-dos.json",
//     keys: ["todo-data"],
//     onRemote: () => renderCurrentView()
//   });

(function () {

  // Paste the OAuth client ID from Google Cloud here
  const CLIENT_ID = "162961094882-4v360khh8d3hohj1arp3g80lgkoipdc9.apps.googleusercontent.com";
  const API        = "https://www.googleapis.com/drive/v3/files";
  const POLL_EVERY = 60000;
  const PUSH_DELAY = 2000;
  const SCOPE      = "https://www.googleapis.com/auth/drive.appdata";
  const TOKEN_KEY  = "sync-google-token";
  const UPLOAD     = "https://www.googleapis.com/upload/drive/v3/files";

  const LABELS = {
    error:     "Sync failed, retry",
    pending:   "Saving…",
    reconnect: "Reconnect sync",
    signedOut: "Sign in to sync",
    synced:    "Synced",
    syncing:   "Syncing…"
  };

  const nativeRemove = Storage.prototype.removeItem;
  const nativeSet    = Storage.prototype.setItem;

  let again = false, applying = false, busy = false;
  let btn = null, cfg = null, pushTimer = null, tokenClient = null;

  // ---- Local metadata ----

  function metaKey() {
    return "sync-meta-" + cfg.file;
  }

  function loadMeta() {
    try {
      const m = JSON.parse(localStorage.getItem(metaKey()));
      if (m) return m;
    } catch {}
    return { fileId: null, synced: 0, updated: 0 };
  }

  function saveMeta(m) {
    nativeSet.call(localStorage, metaKey(), JSON.stringify(m));
  }

  function collect() {
    const data = {};
    cfg.keys.forEach(k => {
      const v = localStorage.getItem(k);
      if (v !== null) data[k] = v;
    });
    return data;
  }

  // Record real edits to synced keys, ignoring re-saves of the same value
  function watch(fn) {
    return function (key, ...rest) {
      const tracked = this === localStorage && cfg && !applying
        && cfg.keys.includes(String(key));
      const before = tracked ? this.getItem(key) : null;
      fn.call(this, key, ...rest);
      if (tracked && this.getItem(key) !== before) markChanged();
    };
  }

  Storage.prototype.removeItem = watch(nativeRemove);
  Storage.prototype.setItem    = watch(nativeSet);

  function markChanged() {
    const m = loadMeta();
    m.updated = Date.now();
    saveMeta(m);
    if (!getToken()) return;
    setStatus("pending");
    clearTimeout(pushTimer);
    pushTimer = setTimeout(sync, PUSH_DELAY);
  }

  // ---- Auth ----

  function getToken() {
    try {
      const t = JSON.parse(localStorage.getItem(TOKEN_KEY));
      if (t && t.expires > Date.now() + 60000) return t.token;
    } catch {}
    return null;
  }

  function onToken(resp) {
    if (resp.error) {
      setStatus("signedOut");
      return;
    }
    nativeSet.call(localStorage, TOKEN_KEY, JSON.stringify({
      expires: Date.now() + resp.expires_in * 1000,
      token:   resp.access_token
    }));
    sync();
  }

  function connect() {
    if (!window.google || !google.accounts) {
      setStatus("error");
      return;
    }
    if (!tokenClient) {
      tokenClient = google.accounts.oauth2.initTokenClient({
        callback:       onToken,
        client_id:      CLIENT_ID,
        error_callback: () => setStatus(signedOutState()),
        scope:          SCOPE
      });
    }
    tokenClient.requestAccessToken({ prompt: "" });
  }

  function signOut() {
    const token = getToken();
    if (token && window.google) google.accounts.oauth2.revoke(token);
    nativeRemove.call(localStorage, TOKEN_KEY);
    setStatus("signedOut");
  }

  function signedOutState() {
    return loadMeta().synced ? "reconnect" : "signedOut";
  }

  // ---- Drive requests ----

  async function drive(url, opts = {}) {
    const token = getToken();
    if (!token) throw new Error("auth");
    const headers = Object.assign(
      {}, opts.headers, { Authorization: "Bearer " + token }
    );
    const res = await fetch(url, Object.assign({}, opts, { headers }));
    if (res.status === 401) {
      nativeRemove.call(localStorage, TOKEN_KEY);
      throw new Error("auth");
    }
    if (!res.ok) throw new Error("http " + res.status);
    return res;
  }

  async function findFile() {
    const q = encodeURIComponent("name = '" + cfg.file + "'");
    const res = await drive(
      API + "?fields=files(id)&spaces=appDataFolder&q=" + q
    );
    const { files } = await res.json();
    return files.length ? files[0].id : null;
  }

  async function readRemote(m) {
    if (!m.fileId) m.fileId = await findFile();
    if (!m.fileId) return null;
    try {
      const res = await drive(API + "/" + m.fileId + "?alt=media");
      return await res.json();
    } catch (err) {
      if (err.message !== "http 404") throw err;
      m.fileId = null;
      return readRemote(m);
    }
  }

  async function writeRemote(m, payload, keepalive = false) {
    const body = JSON.stringify(payload);
    if (m.fileId) {
      await drive(UPLOAD + "/" + m.fileId + "?uploadType=media", {
        body,
        headers:   { "Content-Type": "application/json" },
        keepalive,
        method:    "PATCH"
      });
      return;
    }

    // Create the file in the hidden app folder
    const b = "sync-" + Math.random().toString(36).slice(2);
    const fileMeta = JSON.stringify({
      name:    cfg.file,
      parents: ["appDataFolder"]
    });
    const multipart =
      "--" + b + "\r\nContent-Type: application/json\r\n\r\n" +
      fileMeta + "\r\n--" + b +
      "\r\nContent-Type: application/json\r\n\r\n" +
      body + "\r\n--" + b + "--";
    const res = await drive(UPLOAD + "?fields=id&uploadType=multipart", {
      body:    multipart,
      headers: { "Content-Type": "multipart/related; boundary=" + b },
      method:  "POST"
    });
    m.fileId = (await res.json()).id;
  }

  // ---- Sync ----

  function applyRemote(m, remote) {
    const incoming = remote.data || {};
    const before = collect();
    const changed =
      JSON.stringify(before) !== JSON.stringify(incoming);

    // Keep the overwritten local copy as a one-step backup
    if (changed && Object.keys(before).length) {
      nativeSet.call(
        localStorage, "sync-backup-" + cfg.file,
        JSON.stringify({ data: before, saved: Date.now() })
      );
    }

    applying = true;
    try {
      cfg.keys.forEach(k => {
        if (k in incoming) localStorage.setItem(k, incoming[k]);
        else localStorage.removeItem(k);
      });
    } finally {
      applying = false;
    }

    m.synced = m.updated = remote.updated;
    saveMeta(m);
    if (changed && cfg.onRemote) cfg.onRemote();
  }

  async function sync() {
    if (!getToken()) {
      setStatus(signedOutState());
      return;
    }
    if (busy) {
      again = true;
      return;
    }
    busy = true;
    clearTimeout(pushTimer);
    pushTimer = null;
    setStatus("syncing");
    try {
      const m = loadMeta();
      const startUpdated = m.updated;
      const remote = await readRemote(m);

      // Skip this round if the tool saved while the request ran
      if (loadMeta().updated !== startUpdated) {
        again = true;
      } else if (!remote) {
        if (Object.keys(collect()).length) {
          m.updated = m.updated || Date.now();
          await writeRemote(m, { data: collect(), updated: m.updated });
          m.synced = m.updated;
        }
        saveMeta(m);

      // A device's first sync takes the Drive copy
      } else if (!m.synced || remote.updated > m.updated) {
        applyRemote(m, remote);
      } else if (m.updated > remote.updated) {
        await writeRemote(m, { data: collect(), updated: m.updated });
        m.synced = m.updated;
        saveMeta(m);
      } else {
        saveMeta(m);
      }
      setStatus("synced");
    } catch (err) {
      console.warn("Sync:", err);
      setStatus(err.message === "auth" ? signedOutState() : "error");
    } finally {
      busy = false;
      if (again) {
        again = false;
        sync();
      }
    }
  }

  // Send a pending save before the page is hidden or closed
  function flush() {
    if (!pushTimer || !getToken()) return;
    clearTimeout(pushTimer);
    pushTimer = null;
    const m = loadMeta();
    if (!m.fileId) return;
    writeRemote(m, { data: collect(), updated: m.updated }, true)
      .then(() => {
        m.synced = m.updated;
        saveMeta(m);
      })
      .catch(() => {});
  }

  // ---- Status button ----

  function setStatus(state) {
    if (!btn) return;
    btn.dataset.state = state;
    btn.textContent = LABELS[state];
    const last = loadMeta().synced;
    btn.title = getToken()
      ? "Click to sync now, alt-click to sign out" +
        (last ? "\nLast change: " + new Date(last).toLocaleString() : "")
      : "Sync with your Google Drive";
  }

  function addButton() {
    const style = document.createElement("style");
    style.textContent = `
      #tool-sync {
        background: rgba(127, 127, 127, 0.12);
        border: 1px solid rgba(127, 127, 127, 0.3);
        border-radius: 999px;
        bottom: 12px;
        color: #8a96a3;
        cursor: pointer;
        font: 12px -apple-system, "Segoe UI", sans-serif;
        padding: 4px 10px;
        position: fixed;
        right: 12px;
        z-index: 1000;
      }
      #tool-sync:hover { border-color: #8a96a3; }
      #tool-sync[data-state="error"] { color: #e06c75; }
      #tool-sync[data-state="synced"] { opacity: 0.6; }
    `;
    document.head.appendChild(style);

    btn = document.createElement("button");
    btn.id = "tool-sync";
    btn.type = "button";
    btn.addEventListener("click", e => {
      if (e.altKey) signOut();
      else if (getToken()) sync();
      else connect();
    });
    document.body.appendChild(btn);
  }

  // ---- Init ----

  function init(options) {
    cfg = options;

    // Google sign-in needs a hosted page, not file://
    if (location.protocol === "file:") return;
    if (CLIENT_ID.startsWith("YOUR_")) {
      console.info("Sync: add a client ID to sync.js to enable it");
      return;
    }

    const gis = document.createElement("script");
    gis.async = true;
    gis.src = "https://accounts.google.com/gsi/client";
    document.head.appendChild(gis);

    addButton();
    setStatus(getToken() ? "syncing" : signedOutState());
    if (getToken()) sync();

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
      else if (getToken()) sync();
    });
    window.addEventListener("pagehide", flush);
    setInterval(() => {
      if (document.visibilityState === "visible" && getToken()) sync();
    }, POLL_EVERY);
  }

  window.ToolSync = { init, signOut, sync };

})();
