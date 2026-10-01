const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("duplicated, overlapping text is selected from the top and can be dragged", () => {
  const context = {
    window: {},
    MapTextRenderer: {
      getBounds: item => ({ left: item.point[0] - 20, width: 40, height: 20, point: { y: item.point[1] } })
    }
  };
  vm.runInNewContext(fs.readFileSync(require.resolve("../assets/js/components/map-text-tool-controller.js"), "utf8"), context);
  const state = {
    texts: [{ text: "Cidade", point: [50, 50] }, { text: "Cidade", point: [55, 55] }],
    selectedTextIndex: null,
    textDrag: null
  };
  const values = {};
  for (const id of ["mapTextValue", "mapTextColor", "mapTextSize", "mapTextSizeValue", "mapTextBackground", "mapTextShape", "mapTextBackgroundColor", "mapTextBorderColor", "mapTextFont", "mapTextOutline", "mapTextOutlineValue", "mapTextOutlineColor", "mapTextGlow", "mapTextGlowValue", "mapTextGlowColor", "mapTextAlign", "mapTextCurvature", "mapTextCurvatureValue", "mapTextLetterSpacing", "mapTextLetterSpacingValue", "deleteSelectedTextBtn", "duplicateTextBtn"]) values[id] = {};
  let history = 0;
  const controller = context.window.MapTextToolController.create({
    state, els: values, pixelToWorld: (x, y) => [x, y], worldToPixel: point => ({ x: point[0], y: point[1] }),
    recordHistory: () => history++, scheduleSave: () => {}, draw: () => {}
  });
  controller.beginInteraction({ x: 55, y: 55 });
  assert.equal(state.selectedTextIndex, 1);
  controller.move({ x: 75, y: 65 });
  assert.deepEqual(Array.from(state.texts[1].point), [75, 65]);
  assert.deepEqual(Array.from(state.texts[0].point), [50, 50]);
  assert.equal(history, 1);
});

test("double-click editor updates the selected map text as the user types", () => {
  let editor;
  const context = {
    window: {},
    document: { createElement: () => {
      const listeners = {};
      editor = {
        style: {}, value: "", setAttribute: () => {}, addEventListener: (name, callback) => { listeners[name] = callback; },
        emit: name => listeners[name](), focus: () => {}, select: () => {}, remove: () => {}, blur: () => listeners.blur()
      };
      return editor;
    } },
    MapTextRenderer: { getBounds: item => ({ left: 30, width: 100, height: 24, point: { y: 50 } }) }
  };
  vm.runInNewContext(fs.readFileSync(require.resolve("../assets/js/components/map-text-tool-controller.js"), "utf8"), context);
  const state = { texts: [{ text: "Bosque", point: [50, 50] }], selectedTextIndex: null };
  const els = {};
  for (const id of ["mapTextValue", "mapTextColor", "mapTextSize", "mapTextSizeValue", "mapTextBackground", "mapTextShape", "mapTextBackgroundColor", "mapTextBorderColor", "mapTextFont", "mapTextOutline", "mapTextOutlineValue", "mapTextOutlineColor", "mapTextGlow", "mapTextGlowValue", "mapTextGlowColor", "mapTextAlign", "mapTextCurvature", "mapTextCurvatureValue", "mapTextLetterSpacing", "mapTextLetterSpacingValue", "deleteSelectedTextBtn", "duplicateTextBtn"]) els[id] = {};
  let history = 0;
  const controller = context.window.MapTextToolController.create({
    state, els, canvas: { parentElement: { appendChild: () => {} } },
    pixelToWorld: (x, y) => [x, y], worldToPixel: point => ({ x: point[0], y: point[1] }),
    recordHistory: () => history++, scheduleSave: () => {}, draw: () => {}
  });
  assert.equal(controller.editAt({ x: 50, y: 50 }), true);
  editor.value = "Bosque Escarlate";
  editor.emit("input");
  assert.equal(state.texts[0].text, "Bosque Escarlate");
  assert.equal(els.mapTextValue.value, "Bosque Escarlate");
  assert.equal(history, 1);
});
