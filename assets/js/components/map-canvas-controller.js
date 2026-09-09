(function () {
  "use strict";

  function bind({ canvas, state, key, pixelToHex, pixelToWorld, findPathAt, findPathEndpointAt, startFreePath, startPathFromEndpoint, addFreePathPoint, finishFreePath, recordHistory, scheduleSave, draw, handleCell, eraseFreePathsNear, selectPath, setTool, syncDetails, setZoom, focusSelectedName, resizeCanvas }) {
    function pointerPos(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    canvas.addEventListener("pointerdown", event => {
      canvas.setPointerCapture(event.pointerId);
      const pos = pointerPos(event);
      if (event.button === 2 || event.shiftKey || event.ctrlKey || event.code === "Space") {
        state.isPanning = true;
        state.panStart = { x: event.clientX, y: event.clientY, ox: state.offsetX, oy: state.offsetY };
        return;
      }
      state.isPainting = true;
      state.activePathKey = null;
      if (state.tool === "road" || state.tool === "river") {
        const endpoint = findPathEndpointAt(pos, state.tool);
        if (endpoint) {
          state.isPainting = true;
          startPathFromEndpoint(endpoint.index, endpoint.endpointIndex);
          return;
        }
        const existing = findPathAt(pos, state.tool);
        if (existing !== -1) {
          selectPath(existing);
          state.isPainting = true;
          state.pathDrag = { index: existing, start: pos, moved: false, historyRecorded: false };
          return;
        }
        startFreePath(pos);
      } else {
        const cell = pixelToHex(pos.x, pos.y);
        if (state.tool === "paint") state.hoveredBrush = cell;
        if (cell) state.activePathKey = key(cell.q, cell.r);
        if (cell && (state.tool === "paint" || state.tool === "place" || state.tool === "erase")) recordHistory();
        if (state.tool === "erase") {
          const existing = findPathAt(pos, "road");
          const river = existing === -1 ? findPathAt(pos, "river") : -1;
          if (existing !== -1 || river !== -1) {
            state.isPainting = false;
            selectPath(existing !== -1 ? existing : river);
            return;
          }
          eraseFreePathsNear(pos);
        }
        handleCell(cell);
      }
    });

    canvas.addEventListener("pointermove", event => {
      if (state.isPanning && state.panStart) {
        state.offsetX = state.panStart.ox + event.clientX - state.panStart.x;
        state.offsetY = state.panStart.oy + event.clientY - state.panStart.y;
        draw();
        return;
      }
      const pos = pointerPos(event);
      const cell = pixelToHex(pos.x, pos.y);
      if (state.pathDrag) {
        const drag = state.pathDrag;
        const path = state.paths[drag.index];
        if (path) {
          const dx = pos.x - drag.start.x;
          const dy = pos.y - drag.start.y;
          if (Math.hypot(dx, dy) > 3) drag.moved = true;
          if (drag.moved) {
            if (!drag.historyRecorded) {
              recordHistory();
              drag.historyRecorded = true;
            }
            const worldStart = pixelToWorld(drag.start.x, drag.start.y);
            const worldNow = pixelToWorld(pos.x, pos.y);
            const worldDelta = [worldNow[0] - worldStart[0], worldNow[1] - worldStart[1]];
            if (!drag.originalPoints) drag.originalPoints = path.points.map(point => [...point]);
            path.points = drag.originalPoints.map(point => [point[0] + worldDelta[0], point[1] + worldDelta[1]]);
            scheduleSave();
            draw();
          }
        }
        return;
      }
      if (state.tool === "paint") {
        const changed = !cell || !state.hoveredBrush || cell.q !== state.hoveredBrush.q || cell.r !== state.hoveredBrush.r;
        state.hoveredBrush = cell;
        if (changed) draw();
      }
      if (!state.isPainting) return;
      if (state.tool === "road" || state.tool === "river") {
        addFreePathPoint(pos);
        return;
      }
      if (!cell) return;
      const hoveredKey = key(cell.q, cell.r);
      if ((state.tool === "paint" || state.tool === "erase") && hoveredKey !== state.activePathKey) {
        state.activePathKey = hoveredKey;
        if (state.tool === "erase") eraseFreePathsNear(pos);
        handleCell(cell);
      }
    });

    canvas.addEventListener("pointerup", () => {
      finishFreePath();
      state.isPainting = false;
      state.isPanning = false;
      state.panStart = null;
      state.pathDrag = null;
      state.activePathKey = null;
    });

    canvas.addEventListener("pointerleave", () => {
      if (!state.hoveredBrush) return;
      state.hoveredBrush = null;
      draw();
    });

    canvas.addEventListener("dblclick", event => {
      const pos = pointerPos(event);
      const cell = pixelToHex(pos.x, pos.y);
      if (cell) {
        state.selected = cell;
        setTool("select");
        syncDetails();
        draw();
        focusSelectedName();
      }
    });

    canvas.addEventListener("wheel", event => {
      event.preventDefault();
      const pos = pointerPos(event);
      setZoom(state.scale + (event.deltaY > 0 ? -.08 : .08), pos);
    }, { passive: false });

    canvas.addEventListener("contextmenu", event => event.preventDefault());
    window.addEventListener("resize", resizeCanvas);
  }

  window.MapCanvasController = Object.freeze({ bind });
})();
