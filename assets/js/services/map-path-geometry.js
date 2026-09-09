(function () {
  "use strict";

  function distanceToSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length));
    return Math.hypot(point.x - (a.x + dx * t), point.y - (a.y + dy * t));
  }

  function findPathAt(paths, pos, type, worldToPixel, threshold) {
    let match = -1;
    let distance = Infinity;
    paths.forEach((path, index) => {
      if (path.type !== type) return;
      for (let pointIndex = 1; pointIndex < path.points.length; pointIndex++) {
        const current = distanceToSegment(pos, worldToPixel(path.points[pointIndex - 1]), worldToPixel(path.points[pointIndex]));
        if (current < threshold && current < distance) {
          match = index;
          distance = current;
        }
      }
    });
    return match;
  }

  function findPathEndpointAt(paths, pos, type, worldToPixel, threshold) {
    let match = null;
    let distance = Infinity;
    paths.forEach((path, index) => {
      if (path.type !== type || path.points.length < 2) return;
      [0, path.points.length - 1].forEach(endpointIndex => {
        const endpoint = worldToPixel(path.points[endpointIndex]);
        const current = Math.hypot(pos.x - endpoint.x, pos.y - endpoint.y);
        if (current <= threshold && current < distance) {
          match = { index, endpointIndex };
          distance = current;
        }
      });
    });
    return match;
  }

  window.MapPathGeometry = Object.freeze({ distanceToSegment, findPathAt, findPathEndpointAt });
})();
