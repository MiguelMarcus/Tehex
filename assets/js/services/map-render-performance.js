(function () {
  "use strict";

  function detailLevel(scale) {
    if (scale < 0.65) return "overview";
    if (scale < 0.9) return "standard";
    return "detail";
  }

  function visibleRange(rect, state, pixelToWorld, padding = 3) {
    const corners = [
      pixelToWorld(-padding, -padding),
      pixelToWorld(rect.width + padding, -padding),
      pixelToWorld(-padding, rect.height + padding),
      pixelToWorld(rect.width + padding, rect.height + padding)
    ];
    const xs = corners.map(point => point[0]);
    const ys = corners.map(point => point[1]);
    return {
      minQ: Math.max(0, Math.floor(Math.min(...xs)) - padding),
      maxQ: Math.min(state.cols - 1, Math.ceil(Math.max(...xs)) + padding),
      minR: Math.max(0, Math.floor(Math.min(...ys)) - padding),
      maxR: Math.min(state.rows - 1, Math.ceil(Math.max(...ys)) + padding)
    };
  }

  function forEachCell(range, callback) {
    for (let r = range.minR; r <= range.maxR; r++) {
      for (let q = range.minQ; q <= range.maxQ; q++) callback(q, r);
    }
  }

  function createFrameScheduler(render) {
    let queued = false;
    return function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        render();
      });
    };
  }

  window.MapRenderPerformance = Object.freeze({ detailLevel, visibleRange, forEachCell, createFrameScheduler });
}());
