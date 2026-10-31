(function () {
  "use strict";
  const R = window.ToolkitRecovery;
  const lines = [];
  let passed = 0, failed = 0;
  function assert(condition, message) {
    if (!condition) throw new Error(message || "assertion failed");
  }
  function test(name, run) {
    try {
      run();
      passed++;
      lines.push("PASS  " + name);
    } catch (error) {
      failed++;
      lines.push("FAIL  " + name + ": " + error.message);
    }
  }

  test("healthy Notes data does not trigger recovery", () => {
    const data = { folders: [{ id: "f1" }],
      notes: [{ id: "n1", blocks: [{ type: "text" }] }] };
    let backedUp = false;
    assert(R.recoverNotes(data, "healthy", () => { backedUp = true; }) === data);
    assert(!backedUp, "healthy data should not create a recovery copy");
  });

  test("malformed Notes records are backed up before repair", () => {
    const raw = '{"notes":[{"id":"keep","blocks":[{"type":"text"}]},null,{"title":"lost"}]}';
    const data = JSON.parse(raw);
    let backup = null;
    const repaired = R.recoverNotes(data, raw, value => {
      backup = value;
      assert(data.notes[1] === null, "preserve callback must run before repair");
    });
    assert(backup === raw, "backup must contain the exact original JSON");
    assert(repaired.notes.length === 1 && repaired.notes[0].id === "keep");
    assert(repaired.notes[0].blocks.length === 1);
  });

  test("malformed Note blocks are backed up and valid blocks retained", () => {
    const raw = '{"notes":[{"id":"n1","blocks":[{"type":"text"},null]}]}';
    const repaired = R.recoverNotes(JSON.parse(raw), raw, () => {});
    assert(repaired.notes[0].blocks.length === 1);
  });

  test("malformed to-do tasks and date sections are backed up and repaired", () => {
    const raw = '{"simple":[{"text":"keep"},null,{"done":true}],"weekly":{"2026-10-31":[{"text":"dated"}],"broken":"bad","empty":null}}';
    const data = JSON.parse(raw);
    let backup = null;
    const repaired = R.recoverTodos(data, raw, value => {
      backup = value;
      assert(data.simple[1] === null, "preserve callback must run before repair");
    });
    assert(backup === raw, "backup must contain the exact original JSON");
    assert(repaired.simple.length === 1 && repaired.simple[0].text === "keep");
    assert(repaired.weekly["2026-10-31"][0].text === "dated");
    assert(Array.isArray(repaired.weekly.broken)
      && repaired.weekly.broken.length === 0);
    assert(Array.isArray(repaired.weekly.empty)
      && repaired.weekly.empty.length === 0);
  });

  test("healthy to-do data does not trigger recovery", () => {
    const data = { simple: [{ text: "keep" }],
      weekly: { "2026-10-31": [{ text: "dated" }] }, toggleData: {} };
    let backedUp = false;
    assert(R.recoverTodos(data, "healthy", () => { backedUp = true; }) === data);
    assert(!backedUp, "healthy data should not create a recovery copy");
  });

  document.getElementById("results").textContent =
    lines.join("\n") + "\n\n" + passed + " passed, " + failed + " failed.";
  document.body.dataset.testStatus = failed ? "failed" : "passed";
})();
