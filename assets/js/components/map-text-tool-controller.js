(function () {
  "use strict";

  function create({ state, els, pixelToWorld, worldToPixel, recordHistory, scheduleSave, draw }) {
    function syncControls() {
      const item = state.texts[state.selectedTextIndex];
      els.deleteSelectedTextBtn.disabled = !item;
      if (!item) return;
      els.mapTextValue.value = item.text;
      els.mapTextColor.value = item.color || "#287a45";
      els.mapTextSize.value = item.size || 26;
      els.mapTextSizeValue.textContent = (item.size || 26) + " px";
      els.mapTextBackground.checked = item.background !== false;
      els.mapTextShape.value = item.shape || "banner";
      els.mapTextBackgroundColor.value = item.backgroundColor || "#fff4d6";
      els.mapTextBorderColor.value = item.borderColor || "#6f572f";
      els.mapTextFont.value = item.font || "Georgia, serif";
    }

    function findAt(pos) {
      return (state.texts || []).findIndex(item => {
        const point = worldToPixel(item.point);
        const radius = Math.max(24, ((Number(item.size) || 26) * (item.text || "").length * .34 + 16) * state.scale);
        return Math.hypot(pos.x - point.x, pos.y - point.y) < radius;
      });
    }

    function createAt(pos) {
      recordHistory();
      state.texts.push({
        text: els.mapTextValue.value.trim() || "Novo texto",
        point: pixelToWorld(pos.x, pos.y), color: els.mapTextColor.value, size: Number(els.mapTextSize.value),
        background: els.mapTextBackground.checked, shape: els.mapTextShape.value,
        backgroundColor: els.mapTextBackgroundColor.value, borderColor: els.mapTextBorderColor.value, font: els.mapTextFont.value
      });
      state.selectedTextIndex = state.texts.length - 1;
      syncControls(); scheduleSave(); draw();
    }

    function beginInteraction(pos) {
      const index = findAt(pos);
      if (index === -1) return createAt(pos);
      state.selectedTextIndex = index;
      state.textDrag = { index, start: pos, original: [...state.texts[index].point], historyRecorded: false };
      syncControls(); draw();
    }

    function move(pos) {
      const drag = state.textDrag;
      if (!drag || Math.hypot(pos.x - drag.start.x, pos.y - drag.start.y) < 3) return;
      if (!drag.historyRecorded) { recordHistory(); drag.historyRecorded = true; }
      const from = pixelToWorld(drag.start.x, drag.start.y), to = pixelToWorld(pos.x, pos.y);
      state.texts[drag.index].point = [drag.original[0] + to[0] - from[0], drag.original[1] + to[1] - from[1]];
      scheduleSave(); draw();
    }

    function updateSelected() {
      const item = state.texts[state.selectedTextIndex];
      if (!item) return;
      item.text = els.mapTextValue.value || "Novo texto";
      item.color = els.mapTextColor.value; item.size = Number(els.mapTextSize.value);
      item.background = els.mapTextBackground.checked; item.shape = els.mapTextShape.value;
      item.backgroundColor = els.mapTextBackgroundColor.value; item.borderColor = els.mapTextBorderColor.value; item.font = els.mapTextFont.value;
      scheduleSave(); draw();
    }

    function eraseNear(pos) {
      const index = findAt(pos);
      if (index === -1) return false;
      recordHistory(); state.texts.splice(index, 1); state.selectedTextIndex = null;
      syncControls(); scheduleSave(); draw(); return true;
    }

    function deleteSelected() {
      if (state.selectedTextIndex === null) return;
      recordHistory(); state.texts.splice(state.selectedTextIndex, 1); state.selectedTextIndex = null;
      syncControls(); scheduleSave(); draw();
    }

    return Object.freeze({ beginInteraction, deleteSelected, eraseNear, move, syncControls, updateSelected });
  }

  window.MapTextToolController = Object.freeze({ create });
})();
