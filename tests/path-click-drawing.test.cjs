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