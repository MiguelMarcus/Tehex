const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(require.resolve("../assets/js/services/png-export-service.js"), "utf8"), context);
const { gridPlan } = context.window.PngExportService;

test("all export resolutions use round Foundry hex sizes", () => {
  for (const [resolution, expected] of [[1.25, 70], [2.25, 120], [3, 160]]) {
    const plan = gridPlan({ resolution, cols: 28, rows: 20, hexSize: 31 });
    assert.equal(plan.pixelsPerGrid, expected);
    assert.ok(Math.abs(plan.scale * 31 * Math.sqrt(3) - expected) < 1e-10);
    assert.equal(plan.limited, false);
  }
});

test("large maps reduce to a round size instead of silently using a fraction", () => {
  const plan = gridPlan({ resolution: 3, cols: 120, rows: 100, hexSize: 31 });
  assert.equal(plan.limited, true);
  assert.ok(plan.pixelsPerGrid < 160);
  assert.equal(plan.pixelsPerGrid % 10, 0);
});
