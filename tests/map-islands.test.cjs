const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(require.resolve("../assets/js/services/map-island.js"), "utf8"), context);
const islands = context.window.MapIsland;

test("island paint only applies to water and removes terrain icons", () => {
  const landCell = { terrain: "grass", showIcon: true };
  const waterCell = { terrain: "water", showIcon: true };
  const oceanCell = { terrain: "ocean", showIcon: true };

  assert.equal(islands.paintCell(landCell, 17), false);
  assert.deepEqual({ ...landCell }, { terrain: "grass", showIcon: true });
  assert.equal(islands.paintCell(waterCell, 17), true);
  assert.equal(islands.paintCell(oceanCell, 23), true);
  assert.equal(waterCell.terrain, "water");
  assert.equal(waterCell.islandSeed, 17);
  assert.equal(waterCell.islandCount, 1);
  assert.equal(waterCell.showIcon, false);
});

test("island outlines are stable per seed and vary between seeds", () => {
  const first = islands.createOutline(108, 30);
  assert.deepEqual(first, islands.createOutline(108, 30));
  assert.notDeepEqual(first, islands.createOutline(109, 30));
  assert.ok(first.length >= 6 && first.length <= 12);
});

test("island sizes vary widely and stay inside their hex", () => {
  const widths = Array.from({ length: 60 }, (_, seed) => {
    const points = islands.createOutline(seed, 30);
    const xValues = points.map(point => point.x);
    const width = Math.max(...xValues) - Math.min(...xValues);
    points.forEach(point => assert.ok(Math.abs(point.x) + Math.abs(point.y) / Math.sqrt(3) <= 30));
    return width;
  });

  assert.ok(Math.min(...widths) < 30 * .5);
  assert.ok(Math.max(...widths) / Math.min(...widths) > 2);
});

test("two- and three-island formations keep small shapes close together", () => {
  [2, 3].forEach(count => {
    const formation = islands.createFormation(281, 30, count);
    assert.equal(formation.length, count);
    assert.deepEqual(formation, islands.createFormation(281, 30, count));
    formation.forEach(island => {
      assert.ok(island.scale < 1);
      islands.createOutline(island.seed, 30 * island.scale).forEach(point => {
        const x = point.x + island.offsetX;
        const y = point.y + island.offsetY;
        assert.ok(Math.abs(x) / 30 + Math.abs(y) / (30 * Math.sqrt(3)) <= 1);
      });
    });
    for (let first = 0; first < formation.length; first++) {
      for (let second = first + 1; second < formation.length; second++) {
        const distance = Math.hypot(formation[first].offsetX - formation[second].offsetX, formation[first].offsetY - formation[second].offsetY);
        assert.ok(distance < 30);
      }
    }
  });
});

test("painting stores the selected island count and clearing removes it", () => {
  const cell = { terrain: "water", showIcon: true };
  assert.equal(islands.paintCell(cell, 29, 3), true);
  assert.equal(cell.islandCount, 3);
  islands.clearCell(cell);
  assert.equal("islandSeed" in cell, false);
  assert.equal("islandCount" in cell, false);
});