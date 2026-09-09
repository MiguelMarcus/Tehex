(function () {
  "use strict";

  function create({ capture, restore, onChange, limit = 200 }) {
    const past = [];
    const future = [];
    let restoring = false;

    function update() {
      onChange({ canUndo: past.length > 0, canRedo: future.length > 0 });
    }

    function record() {
      if (restoring) return;
      past.push(capture());
      if (past.length > limit) past.shift();
      future.length = 0;
      update();
    }

    function restoreSnapshot(snapshot) {
      restoring = true;
      try {
        restore(snapshot);
      } finally {
        restoring = false;
        update();
      }
    }

    function undo() {
      if (!past.length) return;
      future.push(capture());
      restoreSnapshot(past.pop());
    }

    function redo() {
      if (!future.length) return;
      past.push(capture());
      restoreSnapshot(future.pop());
    }

    function clear() {
      past.length = 0;
      future.length = 0;
      update();
    }

    return Object.freeze({ clear, isRestoring: () => restoring, record, redo, undo, update });
  }

  window.MapHistory = Object.freeze({ create });
})();
