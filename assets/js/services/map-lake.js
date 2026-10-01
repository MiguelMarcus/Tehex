(function () {
  "use strict";

  function randomFromSeed(seed) {
    let value = Number(seed) >>> 0;
    return function random() {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function createOutline(seed, size, lakeSize = "medium") {
    const random = randomFromSeed(seed);
    const count = 10 + Math.floor(random() * 11);
    const phase = random() * Math.PI * 2;
    const settings = {
      small: { coverage: .32, roughness: .1 },
      medium: { coverage: .62, roughness: .14 },
      large: { coverage: .909, roughness: .045 }
    }[lakeSize] || { coverage: .62, roughness: .09 };
    return Array.from({ length: count }, (_, index) => {
      const angle = phase + index * Math.PI * 2 / count + (random() - .5) * .62;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const hexRadius = Math.min(
        1 / (Math.abs(cosine) + Math.abs(sine) / Math.sqrt(3)),
        Math.abs(sine) > 0 ? Math.sqrt(3) / (2 * Math.abs(sine)) : Infinity
      );
      const radius = hexRadius * (settings.coverage + (random() - .5) * 2 * settings.roughness);
      return {
        x: cosine * size * radius,
        y: sine * size * radius
      };
    });
  }

  function paintCell(cell, seed, lakeSize = "medium") {
    if (!cell || typeof cell.terrain !== "string") return false;
    cell.lakeSeed = Number(seed) >>> 0;
    cell.lakeSize = ["small", "medium", "large"].includes(lakeSize) ? lakeSize : "medium";
    cell.showIcon = false;
    return true;
  }

  function clearCell(cell) {
    if (cell) {
      delete cell.lakeSeed;
      delete cell.lakeSize;
    }
  }

  function draw(context, centerX, centerY, size, seed, fillColor, edgeColor, lineWidth, lakeSize = "medium") {
    const points = createOutline(seed, size, lakeSize);
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

  function drawConnection(context, startX, startY, endX, endY, size, fillColor) {
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.hypot(dx, dy);
    if (!length) return;
    const radius = size * .1;
    const taper = Math.min(radius * 1.2, length * .4);
    context.save();
    context.translate(startX, startY);
    context.rotate(Math.atan2(dy, dx));
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(taper, -radius);
    context.lineTo(length - taper, -radius);
    context.lineTo(length, 0);
    context.lineTo(length - taper, radius);
    context.lineTo(taper, radius);
    context.closePath();
    context.fillStyle = fillColor;
    context.fill();
    context.restore();
  }

  window.MapLake = Object.freeze({ clearCell, createOutline, draw, drawConnection, paintCell });
})();