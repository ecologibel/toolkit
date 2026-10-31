(function (root) {
  "use strict";

  const isRecord = value => value !== null
    && typeof value === "object" && !Array.isArray(value);
  const hasId = value => isRecord(value) && !!value.id;
  const validTask = value => isRecord(value)
    && typeof value.text === "string";

  function notesNeedRecovery(data) {
    if (!isRecord(data) || !Array.isArray(data.notes)) return false;
    if (data.folders != null && !Array.isArray(data.folders)) return true;
    const folders = Array.isArray(data.folders) ? data.folders : [];
    return folders.some(folder => !hasId(folder))
      || data.notes.some(note => !hasId(note)
        || (note.blocks != null && (!Array.isArray(note.blocks)
          || note.blocks.some(block => !isRecord(block)))));
  }

  function repairNotesData(data) {
    return Object.assign({}, data, {
      folders: Array.isArray(data.folders)
        ? data.folders.filter(hasId) : [],
      notes: data.notes.filter(hasId).map(note => Object.assign({}, note, {
        blocks: Array.isArray(note.blocks)
          ? note.blocks.filter(isRecord) : []
      }))
    });
  }

  function todoNeedsRecovery(data) {
    if (!isRecord(data)) return false;
    let malformed = false;
    const inspectList = (list, optional = false) => {
      if (list == null) {
        if (!optional) malformed = true;
        return;
      }
      if (!Array.isArray(list)) {
        malformed = true;
        return;
      }
      if (list.some(task => !validTask(task))) malformed = true;
    };
    const inspectMap = map => {
      if (map == null) return;
      if (!isRecord(map)) {
        malformed = true;
        return;
      }
      Object.values(map).forEach(list => inspectList(list));
    };
    inspectList(data.simple, true);
    inspectMap(data.weekly);
    inspectMap(data.toggleData);
    return malformed;
  }

  function repairTodoData(data) {
    const repairList = list => Array.isArray(list)
      ? list.filter(validTask) : [];
    const repairMap = map => {
      if (!isRecord(map)) return {};
      return Object.fromEntries(Object.entries(map)
        .map(([key, list]) => [key, repairList(list)]));
    };
    return Object.assign({}, data, {
      simple: repairList(data.simple),
      weekly: repairMap(data.weekly),
      toggleData: repairMap(data.toggleData)
    });
  }

  function recoverNotes(data, raw, preserve) {
    if (!notesNeedRecovery(data)) return data;
    if (typeof preserve === "function") preserve(raw);
    return repairNotesData(data);
  }

  function recoverTodos(data, raw, preserve) {
    if (!todoNeedsRecovery(data)) return data;
    if (typeof preserve === "function") preserve(raw);
    return repairTodoData(data);
  }

  const api = { notesNeedRecovery, repairNotesData, recoverNotes,
    todoNeedsRecovery, repairTodoData, recoverTodos };
  root.ToolkitRecovery = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
