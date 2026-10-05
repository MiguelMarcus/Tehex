const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(require.resolve("../assets/js/services/uvtt-export-service.js"), "utf8"), context);
const service = context.window.UvttExportService;

test("UVTT keeps image size and grid scale consistent", () => {
  const image = { width: 600, height: 450, toDataURL: () => "data:image/png;base64,cG5n" };
  const data = service.createPayload(image, 75);
  assert.equal(data.format, 1);
  assert.equal(data.resolution.pixels_per_grid, 75);
  assert.equal(data.resolution.map_size.x * 75, image.width);
  assert.equal(data.resolution.map_size.y * 75, image.height);
  assert.equal(data.image, "cG5n");
  assert.equal(data.tehex.grid_type, "hex_odd_q");
  const macro = service.foundryMacro(75);
  assert.ok(macro.includes("CONST.GRID_TYPES.HEXODDQ"));
  assert.ok(macro.includes('"grid.size": 75'));
  assert.ok(macro.includes('"padding": 0'));
  assert.ok(macro.includes('"shiftX": 0'));
  assert.ok(macro.includes('"shiftY": 0'));
});

test("UVTT refuses invalid grid size and empty image", () => {
  const image = { width: 100, height: 100, toDataURL: () => "data:image/png;base64,cG5n" };
  assert.throws(() => service.createPayload(image, 0));
  assert.throws(() => service.createPayload({ width: 0, height: 0 }, 75));
});
