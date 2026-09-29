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
      els.mapTextOutline.value = item.outline || 0;
      els.mapTextOutlineValue.textContent = (item.outline || 0) + " px";
      els.mapTextOutlineColor.value = item.outlineColor || "#fff9f0";
      els.mapTextGlow.value = item.glow || 0;
      els.mapTextGlowValue.textContent = (item.glow || 0) + " px";
      els.mapTextGlowColor.value = item.glowColor || "#ffffff";
      els.mapTextAlign.value = item.align || "center";
      els.mapTextCurvature.value = item.curvature || 0;
      els.mapTextCurvatureValue.textContent = item.curvature || "0";
      els.mapTextLetterSpacing.value = item.letterSpacing || 0;
      els.mapTextLetterSpacingValue.textContent = (item.letterSpacing || 0) + " px";
      els.mapTextSharp.checked = Boolean(item.sharp);
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
      item.outline = Number(els.mapTextOutline.value); item.outlineColor = els.mapTextOutlineColor.value;
      item.glow = Number(els.mapTextGlow.value); item.glowColor = els.mapTextGlowColor.value;
      item.align = els.mapTextAlign.value; item.curvature = Number(els.mapTextCurvature.value);
      item.letterSpacing = Number(els.mapTextLetterSpacing.value); item.sharp = els.mapTextSharp.checked;
      scheduleSave(); draw();
    }

    function applyPreset(id) {
      const presets = {
        region: { size: 30, color: "#287a45", font: "Georgia, serif", background: true, shape: "banner", outline: 0, glow: 0, align: "center", curvature: 0, letterSpacing: 0 },
        city: { size: 22, color: "#3b2318", font: "Palatino Linotype, Palatino, serif", background: true, shape: "pill", outline: 1, glow: 0, align: "center", curvature: 0, letterSpacing: 1 },
        subtle: { size: 18, color: "#3b2318", font: "Times New Roman, serif", background: false, shape: "rectangle", outline: 1, glow: 0, align: "center", curvature: 0, letterSpacing: 0 }
      };
      const preset = presets[id];
      if (!preset) return;
      els.mapTextSize.value = preset.size; els.mapTextColor.value = preset.color; els.mapTextFont.value = preset.font;
      els.mapTextBackground.checked = preset.background; els.mapTextShape.value = preset.shape;
      els.mapTextOutline.value = preset.outline; els.mapTextGlow.value = preset.glow;
      els.mapTextAlign.value = preset.align; els.mapTextCurvature.value = preset.curvature; els.mapTextLetterSpacing.value = preset.letterSpacing;
      els.mapTextSizeValue.textContent = preset.size + " px";
      els.mapTextOutlineValue.textContent = preset.outline + " px";
      els.mapTextGlowValue.textContent = preset.glow + " px";
      els.mapTextCurvatureValue.textContent = preset.curvature;
      els.mapTextLetterSpacingValue.textContent = preset.letterSpacing + " px";
      updateSelected();
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

    return Object.freeze({ applyPreset, beginInteraction, deleteSelected, eraseNear, move, syncControls, updateSelected });
  }

  window.MapTextToolController = Object.freeze({ create });
})();
