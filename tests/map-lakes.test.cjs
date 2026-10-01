const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(require.resolve("../assets/js/services/map-lake.js"), "utf8"), context);
const lakes = context.window.MapLake;

test("lake paint overlays any existing terrain without changing its base", () => {
  const cell = { terrain: "mountain", showIcon: true };
  assert.equal(lakes.paintCell(cell, 37), true);
  assert.equal(cell.terrain, "mountain");
  assert.equal(cell.lakeSeed, 37);
  assert.equal(cell.lakeSize, "medium");
  assert.equal(cell.showIcon, false);
});

test("lake outlines stay stable per seed and within the hex", () => {
  [1, 9, 24, 63, 108].forEach(seed => {
    const points = lakes.createOutline(seed, 30, "medium");
    assert.deepEqual(points, lakes.createOutline(seed, 30, "medium"));
    points.forEach(point => {
      assert.ok(Math.abs(point.x) / 30 + Math.abs(point.y) / (30 * Math.sqrt(3)) <= 1);
      assert.ok(Math.abs(point.y) <= 30 * Math.sqrt(3) / 2);
    });
  });
  assert.notDeepEqual(lakes.createOutline(37, 30, "medium"), lakes.createOutline(38, 30, "medium"));
});

test("large lakes fill between 70% and 80% of the hex area with varied outlines", () => {
  function coveredArea(seed, size) {
    const points = lakes.createOutline(seed, size, "large");
    const curvePoints = [{ x: (points.at(-1).x + points[0].x) / 2, y: (points.at(-1).y + points[0].y) / 2 }];
    for (let index = 0; index < points.length; index++) {
      const control = points[index];
      const next = points[(index + 1) % points.length];
      const end = { x: (control.x + next.x) / 2, y: (control.y + next.y) / 2 };
      const start = curvePoints[curvePoints.length - 1];
      for (let step = 1; step <= 12; step++) {
        const t = step / 12;
        const inverse = 1 - t;
        curvePoints.push({
          x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
          y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y
        });
      }
    }
    const polygonArea = Math.abs(curvePoints.reduce((total, point, index) => {
      const next = curvePoints[(index + 1) % curvePoints.length];
      return total + point.x * next.y - next.x * point.y;
    }, 0)) / 2;
    return polygonArea / (3 * Math.sqrt(3) * size * size / 2);
  }

  for (let seed = 0; seed < 100; seed++) {
    const area = coveredArea(seed, 30);
    assert.ok(area >= .7 && area <= .8, `seed ${seed} covers ${(area * 100).toFixed(1)}%`);
  }
});

test("clearing a lake leaves the underlying terrain and icon setting intact", () => {
  const cell = { terrain: "grass", lakeSeed: 42, showIcon: false };
  lakes.clearCell(cell);
  assert.deepEqual({ ...cell }, { terrain: "grass", showIcon: false });
});

test("small, medium, and large lake choices are saved distinctly", () => {
  const cells = ["small", "medium", "large"].map((lakeSize, seed) => {
    const cell = { terrain: "grass", showIcon: true };
    assert.equal(lakes.paintCell(cell, seed, lakeSize), true);
    return cell;
  });
  assert.deepEqual(cells.map(cell => cell.lakeSize), ["small", "medium", "large"]);
  assert.notDeepEqual(lakes.createOutline(17, 30, "small"), lakes.createOutline(17, 30, "medium"));
  assert.notDeepEqual(lakes.createOutline(17, 30, "medium"), lakes.createOutline(17, 30, "large"));
});

test("lake fill uses only its water shape and shoreline", () => {
  const draws = { fill: 0, stroke: 0, clip: 0 };
  const context = {
    save: () => {}, restore: () => {},
    beginPath: () => {}, moveTo: () => {}, quadraticCurveTo: () => {}, closePath: () => {},
    clip: () => draws.clip++, fill: () => draws.fill++, stroke: () => draws.stroke++
  };
  lakes.draw(context, 0, 0, 30, 84, "#5798ca", "#2f6f9e", .5, "large");
  assert.deepEqual(draws, { fill: 1, stroke: 1, clip: 0 });
});

test("lake connector is a short tapered bridge without round endpoint bulges", () => {
  const points = [];
  const context = {
    save: () => {}, restore: () => {},
    translate: (x, y) => points.push(["start", x, y]), rotate: () => {},
    beginPath: () => {}, moveTo: (...args) => points.push(["move", ...args]),
    lineTo: (...args) => points.push(["line", ...args]), arc: () => assert.fail("connector should not use rounded caps"),
    closePath: () => {}, fill: () => {}
  };
  lakes.drawConnection(context, 12, 24, 18.6, 24, 30, "#5798ca");
  assert.deepEqual(points[0], ["start", 12, 24]);
  const start = points.find(point => point[0] === "move");
  const ends = points.filter(point => point[0] === "line").map(point => point.slice(1));
  assert.ok(Math.hypot(start[1], start[2]) < 1);
  assert.ok(ends.some(([x, y]) => Math.hypot(x - 6.6, y) < 1));
  assert.ok(Math.min(...ends.map(([x]) => x)) >= 0);
  assert.ok(Math.max(...ends.map(([x]) => x)) <= 6.600001);
});