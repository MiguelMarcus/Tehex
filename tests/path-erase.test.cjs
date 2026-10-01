const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("eraser respects separate road and river filters", () => {
  const context = {
    window: {},
    MapPathGeometry: {
      findPathAt: (paths, pos, type) => paths.findIndex(path => path.type === type),
      findPathEndpointAt: () => null
    }
  };
  vm.runInNewContext(fs.readFileSync(require.resolve("../assets/js/components/path-tool-controller.js"), "utf8"), context);
  const state = {
    paths: [{ type: "road", points: [[0, 0], [1, 1]] }, { type: "river", points: [[0, 0], [1, 1]] }],
    selectedPathIndex: null, hexSize: 30, scale: 1
  };
  const els = { deleteSelectedPathBtn: {}, pathSelectionHint: {} };
  let saves = 0;
  const controller = context.window.PathToolController.create({ state, els, pixelToWorld: () => [0, 0], snapPathPoint: () => ({ x: 0, y: 0 }), worldToPixel: () => ({ x: 0, y: 0 }), recordHistory: () => {}, scheduleSave: () => saves++, draw: () => {} });
  assert.equal(controller.eraseNear({}, { roads: false, rivers: true }), true);
  assert.deepEqual(Array.from(state.paths, path => path.type), ["road"]);
  assert.equal(controller.eraseNear({}, { roads: false, rivers: true }), false);
  assert.equal(saves, 1);
});

test("paths can snap to centers, edges, or remain freehand", () => {
  function startPath(snapToCenters, snapToEdges) {
    const context = { window: {}, MapPathGeometry: { findPathAt: () => -1, findPathEndpointAt: () => null } };
    vm.runInNewContext(fs.readFileSync(require.resolve("../assets/js/components/path-tool-controller.js"), "utf8"), context);
    const state = {
      tool: "road", paths: [], selectedPathIndex: null, hexSize: 31, scale: 1,
      snapToCenters, snapToEdges, roadStyle: "simple", roadColor: "#b78b4b", roadWidth: 1
    };
    const controller = context.window.PathToolController.create({
      state,
      els: { deleteSelectedPathBtn: {}, pathSelectionHint: {} },
      pixelToWorld: (x, y) => [x, y],
      snapPathPoint: (point, useEdges) => useEdges ? { x: point.x * 10, y: point.y * 10 } : { x: Math.round(point.x), y: Math.round(point.y) },
      worldToPixel: point => ({ x: point[0], y: point[1] }),
      recordHistory: () => {}, scheduleSave: () => {}, draw: () => {}
    });
    controller.startFreePath({ x: 1.4, y: .4 });
    return Array.from(state.currentPath.points[0]);
  }

  assert.deepEqual(startPath(true, false), [1, 0]);
  assert.deepEqual(startPath(false, true), [14, 4]);
  assert.deepEqual(startPath(false, false), [1.4, .4]);
});
