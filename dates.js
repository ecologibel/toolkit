// ---- Shared dates ----
//
// The to-dos' @date reading, for pages that show to-dos without being
// the to-dos page (the dashboard). Exposed as window.ToolkitDates.

(function () {

  const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec"];
  const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  // Month names, full or short, not followed by more letters
  const MONTH_RE = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?'
    + '|apr(?:il)?|may|june?|july?|aug(?:ust)?'
    + '|sep(?:t(?:ember)?)?|oct(?:ober)?'
    + '|nov(?:ember)?|dec(?:ember)?)(?![a-z])';

  // Weekday names, full or short, not followed by more letters
  const WEEKDAY_RE = '(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?'
    + '|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)(?![a-z])';

  // One date or period, without the @
  const DATE_CORE = '(?:'
    + '(?:today|tomorrow|yesterday)(?![a-z])'
    + '|(?:this|next)\\s+(?:week|month)(?![a-z])'
    + '|(?:next\\s+)?' + WEEKDAY_RE
    + '|\\d{1,2}\\s+' + MONTH_RE + '(?:,?\\s+\\d{4})?'
    + '|' + MONTH_RE + '\\s+\\d{1,2}(?!\\d)(?:,?\\s*\\d{4})?'
    + '|\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4}'
    + '|' + MONTH_RE + '(?:\\s+\\d{4})?'
    + ')';

  // @ then a date or period, optionally "to" another one
  const DATE_PATTERN = new RegExp(
    '@' + DATE_CORE
    + '(?:\\s*(?:–|—|-|to(?![a-z]))\\s*' + DATE_CORE + ')?',
    'gi'
  );

  // Tags (#), and any word with an @ in it (names, emails, a lone @)
  const MARK_PATTERN = /(^|\s)(#[^\s#]+|[^\s#]*@[^\s]*)/g;

  function dayStart(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  // Monday of the week containing a day
  function weekStart(d) {
    const day = d.getDay();
    return addDays(dayStart(d), day === 0 ? -6 : 1 - day);
  }

  function monthRange(y, m) {
    return { end: new Date(y, m + 1, 0), start: new Date(y, m, 1) };
  }

  function oneDay(d) {
    return { end: d, start: d };
  }

  // The to-dos' calendar keys, as they store them
  function dateKey(d) {
    return d.toISOString().slice(0, 10);
  }

  function keyToDate(key) {
    const [y, m, d] = key.split("-").map(Number);
    for (const off of [0, 1, -1]) {
      const c = new Date(y, m - 1, d + off);
      if (dateKey(c) === key) return c;
    }
    return new Date(y, m - 1, d);
  }

  // A single date or period as a day range, relative to an anchor day
  function parseOne(str, anchor) {
    const s = str.trim().toLowerCase().replace(/\s+/g, " ");
    const mon = name => MONTHS.indexOf(name.slice(0, 3));
    let m;

    if (s === "today") return oneDay(anchor);
    if (s === "tomorrow") return oneDay(addDays(anchor, 1));
    if (s === "yesterday") return oneDay(addDays(anchor, -1));
    if ((m = s.match(/^(this|next) (week|month)$/))) {
      const next = m[1] === "next";
      if (m[2] === "week") {
        const start = addDays(weekStart(anchor), next ? 7 : 0);
        return { end: addDays(start, 6), start };
      }
      return monthRange(
        anchor.getFullYear(), anchor.getMonth() + (next ? 1 : 0)
      );
    }
    if ((m = s.match(new RegExp('^(next )?' + WEEKDAY_RE + '$')))) {
      const wd = WEEKDAYS.indexOf(s.replace("next ", "").slice(0, 3));
      if (m[1]) {
        const start = addDays(weekStart(anchor), 7);
        return oneDay(addDays(start, (wd + 6) % 7));
      }
      return oneDay(addDays(anchor, (wd - anchor.getDay() + 7) % 7));
    }

    let day, month, year;
    if ((m = s.match(new RegExp(
      '^(\\d{1,2}) ' + MONTH_RE + '(?:,? (\\d{4}))?$')))) {
      [day, month, year] = [+m[1], mon(m[2]), m[3]];
    } else if ((m = s.match(new RegExp(
      '^' + MONTH_RE + ' (\\d{1,2})(?:,? ?(\\d{4}))?$')))) {
      [day, month, year] = [+m[2], mon(m[1]), m[3]];
    } else if ((m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/))) {
      [day, month, year] = [+m[1], +m[2] - 1, m[3]];
    } else if ((m = s.match(new RegExp('^' + MONTH_RE + '(?: (\\d{4}))?$')))) {
      const y = m[2] ? +m[2] : anchor.getFullYear();
      let r = monthRange(y, mon(m[1]));
      if (!m[2] && r.end < anchor) r = monthRange(y + 1, mon(m[1]));
      return r;
    } else {
      return null;
    }
    let y = year ? +year : anchor.getFullYear();
    if (y < 100) y += 2000;
    let d = new Date(y, month, day);
    if (d.getMonth() !== month || d.getDate() !== day) return null;
    if (!year && d < addDays(anchor, -31)) d = new Date(y + 1, month, day);
    return oneDay(d);
  }

  // A date, period, or "A to B" range as a day range
  function parseSpec(str, anchor) {
    const one = parseOne(str, anchor);
    if (one) return one;
    const parts = str.split(/\s*(?:–|—|\bto\b)\s*|\s+-\s+|-/i);
    if (parts.length !== 2) return null;
    const a = parseOne(parts[0], anchor), b = parseOne(parts[1], anchor);
    if (!a || !b || b.end < a.start) return null;
    return { end: b.end, start: a.start };
  }

  function firstToken(text) {
    DATE_PATTERN.lastIndex = 0;
    const m = DATE_PATTERN.exec(text || "");
    return m ? m[0].toLowerCase() : "";
  }

  // The first date in some text that resolves, as a day range
  function textRange(text, anchor) {
    DATE_PATTERN.lastIndex = 0;
    let m;
    while ((m = DATE_PATTERN.exec(text || ""))) {
      const r = parseSpec(m[0].slice(1), anchor);
      if (r) return r;
    }
    return null;
  }

  // A task's date: from its text, else from the calendar cell it is in
  function taskRange(task, listKey) {
    const anchor = dayStart(
      task.anchorAt ? new Date(task.anchorAt) : new Date()
    );
    const r = textRange(task.text, anchor);
    if (r) return r;
    if (listKey && /^\d{4}-\d{2}-\d{2}$/.test(listKey)) {
      return oneDay(keyToDate(listKey));
    }
    if (listKey && listKey.startsWith("_ym-")) {
      const [, y, mm] = listKey.split("-");
      return monthRange(+y, +mm);
    }
    return null;
  }

  // Note when a task's date was written, so relative dates stay put
  function stampAnchor(task) {
    const tok = firstToken(task.text);
    if (tok !== task.anchorTok || !task.anchorAt) {
      task.anchorTok = tok;
      task.anchorAt = Date.now();
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlightTags(seg) {
    let out = "", last = 0, m;
    MARK_PATTERN.lastIndex = 0;
    while ((m = MARK_PATTERN.exec(seg))) {
      const start = m.index + m[1].length;
      const isTag = m[2][0] === "#";
      const mark = m[2].replace(/[.,;:!?)\]]+$/, "") || m[2];
      if (isTag && mark.length < 2) continue;
      out += escapeHtml(seg.slice(last, start)) + '<span class="'
        + (isTag ? "tag-token" : "mention-token") + '">'
        + escapeHtml(mark) + "</span>";
      last = start + mark.length;
    }
    return out + escapeHtml(seg.slice(last));
  }

  // Task text as html with dates, tags and names coloured
  function highlight(text) {
    let out = "", last = 0, m;
    DATE_PATTERN.lastIndex = 0;
    while ((m = DATE_PATTERN.exec(text || ""))) {
      out += highlightTags(text.slice(last, m.index))
        + '<span class="date-token">' + escapeHtml(m[0]) + "</span>";
      last = m.index + m[0].length;
    }
    return out + highlightTags((text || "").slice(last));
  }

  window.ToolkitDates = {
    addDays, dateKey, dayStart, firstToken, highlight, keyToDate,
    parseSpec, stampAnchor, taskRange, textRange
  };

})();
