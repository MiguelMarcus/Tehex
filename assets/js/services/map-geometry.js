(function () {
  "use strict";

  function migratePointFromPointyGrid(point) {
    const [x, y] = point.map(Number);
    const row = Math.round(y);
    let nearest = null;
    for (let r = row - 1; r <= row + 1; r++) {
      const column = Math.round(x - .5 * (r & 1));
      for (let q = column - 1; q <= column + 1; q++) {
        const dx = (x - q - .5 * (r & 1)) * Math.sqrt(3);
        const dy = (y - r) * 1.5;
        const distance = dx * dx + dy * dy;
        if (!nearest || distance < nearest.distance) nearest = { q, r, dx, dy, distance };
      }
    }
    return [nearest.q + nearest.dx / 1.5, nearest.r + .5 * (nearest.q & 1) + nearest.dy / Math.sqrt(3)];
  }

  function create(state) {
    function key(q, r) { return q + "," + r; }
    function parseKey(value) { return value.split(",").map(Number); }

    function hexToPixel(q, r) {
      const size = state.hexSize;
      const x = size * 1.5 * q;
      const y = size * Math.sqrt(3) * (r + .5 * (q & 1));
      return { x: x * state.scale + state.offsetX, y: y * state.scale + state.offsetY };
    }

    function worldToPixel(point) {
      return {
        x: point[0] * state.hexSize * 1.5 * state.scale + state.offsetX,
        y: point[1] * state.hexSize * Math.sqrt(3) * state.scale + state.offsetY
      };
    }

    function pixelToWorld(px, py) {
      return [
        (px - state.offsetX) / (state.hexSize * 1.5 * state.scale),
        (py - state.offsetY) / (state.hexSize * Math.sqrt(3) * state.scale)
      ];
    }

    function pixelToHex(px, py) {
      const size = state.hexSize;
      const x = (px - state.offsetX) / state.scale;
      const y = (py - state.offsetY) / state.scale;
      let best = null;
      let bestDistance = Infinity;
      const approxQ = Math.round(x / (size * 1.5));
      const approxR = Math.round(y / (size * Math.sqrt(3)) - .5 * (approxQ & 1));
      for (let r = approxR - 2; r <= approxR + 2; r++) {
        for (let q = approxQ - 2; q <= approxQ + 2; q++) {
          if (q < 0 || r < 0 || q >= state.cols || r >= state.rows) continue;
          const point = hexToPixel(q, r);
          const distance = Math.hypot(px - point.x, py - point.y);
          if (distance < bestDistance) {
            bestDistance = distance;
            best = { q, r };
          }
        }
      }
      if (!best) return null;
      const center = hexToPixel(best.q, best.r);
      const localX = Math.abs(px - center.x) / (size * state.scale);
      const localY = Math.abs(py - center.y) / (size * state.scale);
      return localX <= 1 && localY <= Math.sqrt(3) / 2 && Math.sqrt(3) * localX + localY <= Math.sqrt(3) ? best : null;
    }

    function hexCorners(x, y, size) {
      const points = [];
      for (let index = 0; index < 6; index++) {
        const angle = Math.PI / 180 * (60 * index);
        points.push([x + size * Math.cos(angle), y + size * Math.sin(angle)]);
      }
      return points;
    }

    function snapToNearestHexEdge(pos) {
      const cell = pixelToHex(pos.x, pos.y);
      if (!cell) return pos;
      let closest = null;
      for (let r = cell.r - 1; r <= cell.r + 1; r++) {
        for (let q = cell.q - 1; q <= cell.q + 1; q++) {
          if (q < 0 || r < 0 || q >= state.cols || r >= state.rows) continue;
          const center = hexToPixel(q, r);
          const corners = hexCorners(center.x, center.y, state.hexSize * state.scale - .8);
          for (let index = 0; index < 6; index++) {
            const a = corners[index];
            const b = corners[(index + 1) % 6];
            const dx = b[0] - a[0];
            const dy = b[1] - a[1];
            const lengthSq = dx * dx + dy * dy || 1;
            const t = Math.max(0, Math.min(1, ((pos.x - a[0]) * dx + (pos.y - a[1]) * dy) / lengthSq));
            const x = a[0] + dx * t;
            const y = a[1] + dy * t;
            const distance = Math.hypot(pos.x - x, pos.y - y);
            if (!closest || distance < closest.distance) closest = { x, y, distance };
          }
        }
      }
      return closest && closest.distance <= Math.max(12, state.hexSize * state.scale * .34) ? closest : pos;
    }

    function snapPathPoint(pos, useEdges) {
      if (!useEdges) {
        const cell = pixelToHex(pos.x, pos.y);
        return cell ? hexToPixel(cell.q, cell.r) : pos;
      }
      return snapToNearestHexEdge(pos);
    }

    function hexPath(x, y, size) {
      const path = new Path2D();
      hexCorners(x, y, size).forEach(([px, py], index) => {
        if (index === 0) path.moveTo(px, py);
        else path.lineTo(px, py);
      });
      path.closePath();
      return path;
    }

    function neighborEdges(q, r) {
      const even = [{ edge: 0, q: q + 1, r }, { edge: 1, q, r: r + 1 }, { edge: 2, q: q - 1, r }, { edge: 3, q: q - 1, r: r - 1 }, { edge: 4, q, r: r - 1 }, { edge: 5, q: q + 1, r: r - 1 }];
      const odd = [{ edge: 0, q: q + 1, r: r + 1 }, { edge: 1, q, r: r + 1 }, { edge: 2, q: q - 1, r: r + 1 }, { edge: 3, q: q - 1, r }, { edge: 4, q, r: r - 1 }, { edge: 5, q: q + 1, r }];
      return (q & 1) ? odd : even;
    }

    function hash(q, r, salt = 0) {
      const value = Math.sin(q * 127.1 + r * 311.7 + salt * 74.7) * 43758.5453;
      return value - Math.floor(value);
    }

    return Object.freeze({ hash, hexCorners, hexPath, hexToPixel, key, neighborEdges, parseKey, pixelToHex, pixelToWorld, snapPathPoint, worldToPixel });
  }

  window.MapGeometry = Object.freeze({ create, migratePointFromPointyGrid });
})();
