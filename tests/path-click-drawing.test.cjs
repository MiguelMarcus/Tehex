const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("click drawing keeps one path open until double-click finishes it", () => {
  const listeners = {};
  const canvas = {
    addEventListener: (type, listener) => { listeners[type] = listener; },
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
    setPointerCapture: () => {}
  };
  const context = { window: { addEventListener: () => {} } };
  vm.runInNewContext(fs.readFileSync(require.resolve("../assets/js/components/map-canvas-controller.js"), "utf8"), context);

  const state = { tool: "road", drawPathByClicks: true, selectExistingPaths: false, paths: [], isPainting: false };
  const actions = [];
  context.window.MapCanvasController.bind({
    canvas, state, key: () => "", pixelToHex: () => null, pixelToWorld: () => [0, 0],
    findPathAt: () => -1, findPathEndpointAt: () => null,
    startFreePath: pos => { actions.push(["start", pos.x, pos.y]); state.currentPath = { type: "road" }; },
    startPathFromEndpoint: () => {},
    addFreePathPoint: pos => actions.push(["point", pos.x, pos.y]),
    finishFreePath: () => { actions.push(["finish"]); state.currentPath = null; },
    beginMapTextInteraction: () => {}, editMapTextAt: () => {}, moveMapText: () => {}, eraseMapTextNear: () => false,
    recordHistory: () => {}, scheduleSave: () => {}, draw: () => {}, handleCell: () => {}, movePlace: () => false,
    eraseFreePathsNear: () => false, selectPath: () => {}, clearPathSelection: () => {}, setTool: () => {},
    syncDetails: () => {}, setZoom: () => {}, focusSelectedName: () => {}, showSelectedPanel: () => {}, resizeCanvas: () => {}
  });

  const pointer = (type, x, y) => ({ type, pointerId: 1, clientX: x, clientY: y, button: 0 });
  listeners.pointerdown(pointer("pointerdown", 10, 20));
  listeners.pointerup(pointer("pointerup", 10, 20));
  listeners.lostpointercapture(pointer("lostpointercapture", 10, 20));
  assert.ok(state.currentPath);

  listeners.pointerdown(pointer("pointerdown", 30, 40));
  listeners.pointerup(pointer("pointerup", 30, 40));
  listeners.dblclick(pointer("dblclick", 30, 40));
  assert.deepEqual(actions, [["start", 10, 20], ["point", 30, 40], ["finish"]]);
  assert.equal(state.currentPath, null);
});

test("right-click finalizes and deselects the active river before panning", () => {
  const listeners = {};
  const canvas = {
    addEventListener: (type, listener) => { listeners[type] = listener; },
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
    setPointerCapture: () => {}
  };
  const context = { window: { addEventListener: () => {} } };
  vm.runInNewContext(fs.readFileSync(require.resolve("../assets/js/components/map-canvas-controller.js"), "utf8"), context);
  const state = { tool: "river", drawPathByClicks: false, paths: [], isPainting: true, currentPath: { type: "river" }, selectedPathIndex: 2 };
  const actions = [];
  context.window.MapCanvasController.bind({
    canvas, state, key: () => "", pixelToHex: () => null, pixelToWorld: () => [0, 0],
    findPathAt: () => -1, findPathEndpointAt: () => null,
    startFreePath: () => {}, startPathFromEndpoint: () => {}, addFreePathPoint: () => {},
    finishFreePath: () => {
      if (!state.currentPath) return;
      actions.push("finish");
      state.currentPath = null;
    },
    beginMapTextInteraction: () => {}, editMapTextAt: () => {}, moveMapText: () => {}, eraseMapTextNear: () => false,
    recordHistory: () => {}, scheduleSave: () => {}, draw: () => {}, handleCell: () => {}, movePlace: () => false,
    eraseFreePathsNear: () => false, selectPath: () => {}, clearPathSelection: () => {
      if (state.selectedPathIndex === null) return;
      actions.push("deselect");
      state.selectedPathIndex = null;
    }, setTool: () => {}, syncDetails: () => {}, setZoom: () => {}, focusSelectedName: () => {},
    showSelectedPanel: () => {}, resizeCanvas: () => {}
  });

  const rightClick = { type: "pointerdown", pointerId: 1, clientX: 50, clientY: 50, button: 2 };
  listeners.pointerdown(rightClick);
  listeners.pointerup({ ...rightClick, type: "pointerup" });
  assert.deepEqual(actions, ["finish", "deselect"]);
  assert.equal(state.currentPath, null);
  assert.equal(state.selectedPathIndex, null);
});