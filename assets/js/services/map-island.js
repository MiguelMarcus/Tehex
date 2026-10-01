(function () {
  "use strict";

  function randomFromSeed(seed) {
    let value = Number(seed) >>> 0;
    return function random() {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function createOutline(seed, size) {
    const random = randomFromSeed(seed);
    const count = 6 + Math.floor(random() * 7);
    const phase = random() * Math.PI * 2;
    const islandScale = .22 + random() * .48;
    const horizontalScale = .86 + random() * .28;
    const verticalScale = .86 + random() * .28;
    const offsetX = (random() - .5) * size * islandScale * .2;
    const offsetY = (random() - .5) * size * islandScale * .2;
    return Array.from({ length: count }, (_, index) => {
      const angle = phase + index * Math.PI * 2 / count + (random() - .5) * .45;
      const radius = .66 + random() * .58;
      return {
        x: offsetX + Math.cos(angle) * size * .6 * islandScale * horizontalScale * radius,
        y: offsetY + Math.sin(angle) * size * .46 * islandScale * verticalScale * radius
      };
    });
  }

  function createFormation(seed, size, count = 1) {
    const islandCount = [2, 3].includes(Number(count)) ? Number(count) : 1;
    if (islandCount === 1) return [{ seed: Number(seed) >>> 0, offsetX: 0, offsetY: 0, scale: 1 }];

    const random = randomFromSeed(seed);
    const rotation = random() * Math.PI * 2;
    const distance = size * .22;
    return Array.from({ length: islandCount }, (_, index) => {
      const angle = rotation + index * Math.PI * 2 / islandCount;
      return {
        seed: Math.floor(random() * 4294967296),
        offsetX: Math.cos(angle) * distance,
        offsetY: Math.sin(angle) * distance,
        scale: .48 + random() * .14
      };
    });
  }

  function paintCell(cell, seed, count = 1) {
    if (!cell || !["water", "ocean"].includes(cell.terrain)) return false;
    cell.islandSeed = Number(seed) >>> 0;
    cell.islandCount = [2, 3].includes(Number(count)) ? Number(count) : 1;
    cell.showIcon = false;
    return true;
  }

  function clearCell(cell) {
    if (cell) {
      delete cell.islandSeed;
      delete cell.islandCount;
    }
  }

  function drawOutline(context, centerX, centerY, size, seed, fillColor, edgeColor, lineWidth) {
    const points = createOutline(seed, size);
    const first = points[0];
    const last = points[points.length - 1];
    context.save();
    context.beginPath();
    context.moveTo(centerX + (last.x + first.x) / 2, centerY + (last.y + first.y) / 2);
    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      context.quadraticCurveTo(
        centerX + point.x,
        centerY + point.y,
        centerX + (point.x + next.x) / 2,
        centerY + (point.y + next.y) / 2
      );
    });
    context.closePath();
    context.fillStyle = fillColor;
    context.fill();
    if (lineWidth > 0) {
      context.strokeStyle = edgeColor;
      context.lineWidth = lineWidth;
      context.stroke();
    }
    context.restore();
  }

  function draw(context, centerX, centerY, size, seed, fillColor, edgeColor, lineWidth, count = 1) {
    createFormation(seed, size, count).forEach(island => {
      drawOutline(context, centerX + island.offsetX, centerY + island.offsetY, size * island.scale, island.seed, fillColor, edgeColor, lineWidth);
    });
  }

  window.MapIsland = Object.freeze({ clearCell, createFormation, createOutline, draw, paintCell });
})();