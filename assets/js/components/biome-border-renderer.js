(function () {
  "use strict";

  function cssNumber(canvas, property, fallback) {
    const value = Number.parseFloat(getComputedStyle(canvas).getPropertyValue(property));
    return Number.isFinite(value) ? value : fallback;
  }

  function pointToward(point, target, amount) {
    return [
      point[0] + (target.x - point[0]) * amount,
      point[1] + (target.y - point[1]) * amount
    ];
  }

  function edgePoints(a, b, target, amount, seed, hash) {
    const points = [];
    const segments = 10;
    for (let index = 0; index <= segments; index++) {
      const progress = index / segments;
      const point = [a[0] + (b[0] - a[0]) * progress, a[1] + (b[1] - a[1]) * progress];
      const organicAmount = amount * (0.72 + hash(seed, index, 17) * 0.42);
      points.push(pointToward(point, target, organicAmount));
    }
    return points;
  }

  function fillBand(ctx, a, b, firstCenter, secondCenter, firstDepth, secondDepth, color, alpha, seed, hash) {
    const first = edgePoints(a, b, firstCenter, firstDepth, seed, hash);
    const second = edgePoints(a, b, secondCenter, secondDepth, seed + 29, hash).reverse();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(first[0][0], first[0][1]);
    first.slice(1).forEach(point => ctx.lineTo(point[0], point[1]));
    second.forEach(point => ctx.lineTo(point[0], point[1]));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function fillJunction(ctx, point, colors, size, alpha, hash, blendColors) {
    if (colors.length < 2) return;
    const color = colors.slice(1).reduce((mixed, next, index) =>
      blendColors(mixed, next, 1 / (index + 2)), colors[0]);
    const vertices = 9;
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    for (let index = 0; index < vertices; index++) {
      const angle = index / vertices * Math.PI * 2;
      const radius = size * (0.82 + hash(point[0], point[1], index + 600) * 0.28);
      const x = point[0] + Math.cos(angle) * radius;
      const y = point[1] + Math.sin(angle) * radius;
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /** Draws one soft, shared wash for each terrain boundary. */
  function draw(ctx, options) {
    const {
      state, cellAt, terrainById, neighborEdges, hexToPixel, hexCorners,
      displayColor, blendColors, hash, isOldSchool, range, quality
    } = options;
    if (isOldSchool() || quality === "overview") return;

    const washOpacity = cssNumber(ctx.canvas, "--biome-border-wash-opacity", 0.2);
    const coreOpacity = cssNumber(ctx.canvas, "--biome-border-core-opacity", 0.13);
    const inset = cssNumber(ctx.canvas, "--biome-border-inset", 1);
    const junctionOpacity = cssNumber(ctx.canvas, "--biome-border-junction-opacity", 0.2);
    const size = state.hexSize * state.scale - 0.8;
    const seenEdges = new Set();
    const junctions = new Map();

    const minR = range ? range.minR : 0;
    const maxR = range ? range.maxR : state.rows - 1;
    const minQ = range ? range.minQ : 0;
    const maxQ = range ? range.maxQ : state.cols - 1;
    for (let r = minR; r <= maxR; r++) {
      for (let q = minQ; q <= maxQ; q++) {
        const terrain = terrainById(cellAt(q, r).terrain);
        neighborEdges(q, r).forEach(({ q: nq, r: nr, edge }) => {
          if (nq < 0 || nr < 0 || nq >= state.cols || nr >= state.rows) return;
          const currentId = r * state.cols + q;
          const neighborId = nr * state.cols + nq;
          const edgeId = Math.min(currentId, neighborId) + ":" + Math.max(currentId, neighborId);
          if (seenEdges.has(edgeId)) return;
          seenEdges.add(edgeId);
          const neighbor = terrainById(cellAt(nq, nr).terrain);
          if (terrain.id === neighbor.id) return;

          const center = hexToPixel(q, r);
          const neighborCenter = hexToPixel(nq, nr);
          const corners = hexCorners(center.x, center.y, size);
          const a = corners[edge];
          const b = corners[(edge + 1) % 6];
          const seed = q * 173 + r * 67 + nq * 31 + nr * 11 + edge;
          const terrainColor = displayColor(terrain.color);
          const neighborColor = displayColor(neighbor.color);
          const terrainEdge = displayColor(terrain.edge || terrain.color);
          const neighborEdge = displayColor(neighbor.edge || neighbor.color);
          [a, b].forEach(point => {
            const id = Math.round(point[0] * 100) + ":" + Math.round(point[1] * 100);
            const junction = junctions.get(id) || { point, colors: [] };
            junction.colors.push(terrainColor, neighborColor);
            junctions.set(id, junction);
          });

          // The outer wash belongs to the shared edge—not to either hex—so it
          // reads as one terrain transition instead of six isolated petals.
          fillBand(ctx, a, b, center, neighborCenter, 0.22 * inset, 0.22 * inset,
            blendColors(terrainColor, neighborColor, 0.5), washOpacity, seed, hash);
          fillBand(ctx, a, b, center, neighborCenter, 0.11 * inset, 0.11 * inset,
            blendColors(terrainEdge, neighborEdge, 0.5), coreOpacity, seed + 101, hash);
        });
      }
    }

    junctions.forEach(({ point, colors }) => {
      fillJunction(ctx, point, colors, size * 0.15 * inset, junctionOpacity, hash, blendColors);
      fillJunction(ctx, point, colors, size * 0.08 * inset, junctionOpacity * 0.9, hash, blendColors);
    });
  }

  window.BiomeBorderRenderer = { draw };
}());
