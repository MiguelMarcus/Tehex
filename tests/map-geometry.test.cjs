const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = { window: {}, Path2D: class {} };
vm.runInNewContext(fs.readFileSync(require.resolve("../assets/js/services/map-geometry.js"), "utf8"), context);
const geometry = context.window.MapGeometry;
const map = geometry.create({ cols: 8, rows: 8, hexSize: 30, scale: 1, offsetX: 0, offsetY: 0 });

test("hexes have flat top and bottom and column staggering", () => {
  const corners = map.hexCorners(0, 0, 30);
  assert.ok(Math.abs(corners[1][1] - corners[2][1]) < 1e-10);
  assert.ok(Math.abs(corners[4][1] - corners[5][1]) < 1e-10);
  assert.ok(Math.abs(map.hexToPixel(1, 0).y - map.hexToPixel(0, 0).y - 15 * Math.sqrt(3)) < 1e-10);
});

test("centers and edges hit their correct hex", () => {
  for (let q = 0; q < 8; q++) for (let r = 0; r < 8; r++) {
    const center = map.hexToPixel(q, r);
    const hit = map.pixelToHex(center.x, center.y);
    assert.deepEqual([hit.q, hit.r], [q, r]);
    for (const neighbor of map.neighborEdges(q, r)) {
      if (neighbor.q < 0 || neighbor.r < 0 || neighbor.q >= 8 || neighbor.r >= 8) continue;
      const next = map.hexToPixel(neighbor.q, neighbor.r);
      const corners = map.hexCorners(center.x, center.y, 30);
      const a = corners[neighbor.edge], b = corners[(neighbor.edge + 1) % 6];
      assert.ok(Math.abs((a[0] + b[0]) / 2 - (center.x + next.x) / 2) < 1e-9);
      assert.ok(Math.abs((a[1] + b[1]) / 2 - (center.y + next.y) / 2) < 1e-9);
    }
  }
});

test("old center coordinates migrate to matching cell centers", () => {
  for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) {
    const point = geometry.migratePointFromPointyGrid([q + .5 * (r & 1), r]);
    const pixel = map.worldToPixel(point);
    const center = map.hexToPixel(q, r);
    assert.ok(Math.hypot(pixel.x - center.x, pixel.y - center.y) < 1e-9);
  }
});
