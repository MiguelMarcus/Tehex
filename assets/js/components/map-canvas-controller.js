(function () {
  "use strict";

  function bind({ canvas, state, key, pixelToHex, pixelToWorld, findPathAt, findPathEndpointAt, startFreePath, startPathFromEndpoint, addFreePathPoint, finishFreePath, beginMapTextInteraction, editMapTextAt, moveMapText, eraseMapTextNear, recordHistory, scheduleSave, draw, handleCell, movePlace, eraseFreePathsNear, selectPath, clearPathSelection, setTool, syncDetails, setZoom, focusSelectedName, showSelectedPanel, resizeCanvas }) {
    let pendingSelectedHex = false;
    function pointerPos(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function eraseAt(pos, cell) {
      const targets = state.eraseTargets;
      if (targets.texts && eraseMapTextNear(pos)) { state.activePathKey = cell && key(cell.q, cell.r); return; }
      if ((targets.roads || targets.rivers) && eraseFreePathsNear(pos, targets)) { state.activePathKey = cell && key(cell.q, cell.r); return; }
      if (!cell || !["terrain", "relief", "places", "details", "roads", "rivers"].some(type => targets[type])) return;
      const cellKey = key(cell.q, cell.r);
      if (cellKey === state.activePathKey) return;
      state.activePathKey = cellKey;
      recordHistory();
      handleCell(cell);
    }

    canvas.addEventListener("pointerdown", event => {
      canvas.setPointerCapture(event.pointerId);
      const pos = pointerPos(event);
      if (state.tool === "navigate") {
        state.isPanning = true;
        state.panStart = { x: event.clientX, y: event.clientY, ox: state.offsetX, oy: state.offsetY };
        return;
      }
      if (event.button === 2 && (state.tool === "road" || state.tool === "river")) {
        if (state.currentPath && state.currentPath.type === state.tool) finishFreePath();
        clearPathSelection();
      }
      if (event.button === 2 || event.shiftKey || event.ctrlKey || event.code === "Space") {
        state.isPanning = true;
        state.panStart = { x: event.clientX, y: event.clientY, ox: state.offsetX, oy: state.offsetY };
        return;
      }
      state.isPainting = true;
      state.activePathKey = null;
      if (state.tool === "select") {
        const road = findPathAt(pos, "road");
        const river = road === -1 ? findPathAt(pos, "river") : -1;
        if (road !== -1 || river !== -1) {
          selectPath(road !== -1 ? road : river);
          state.isPainting = false;
          return;
        }
      }
      if (state.tool === "text") {
        beginMapTextInteraction(pos);
        state.isPainting = false;
        return;
      }
      if (state.tool === "road" || state.tool === "river") {
        if (state.selectExistingPaths) {
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
        }
        if (state.drawPathByClicks) {
          if (state.currentPath && state.currentPath.type === state.tool) addFreePathPoint(pos);
          else startFreePath(pos);
          state.isPainting = false;
          return;
        }
        startFreePath(pos);
      } else {
        const cell = pixelToHex(pos.x, pos.y);
        if (state.tool === "paint" || state.tool === "relief") state.hoveredBrush = cell;
        if (cell && state.tool !== "erase") state.activePathKey = key(cell.q, cell.r);
        if (state.tool === "select" && cell && state.cells[key(cell.q, cell.r)]?.place) {
          state.placeDrag = { source: { q: cell.q, r: cell.r }, start: pos, historyRecorded: false };
        }
        if (cell && (state.tool === "paint" || state.tool === "place" || state.tool === "relief")) recordHistory();
        if (state.tool === "erase") {
          eraseAt(pos, cell);
          return;
        }
        handleCell(cell);
        if (state.tool === "select" && cell) pendingSelectedHex = true;
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
      if (state.textDrag) {
        moveMapText(pos);
        return;
      }
      if (state.placeDrag) {
        const drag = state.placeDrag;
        if (!cell || (cell.q === drag.source.q && cell.r === drag.source.r)) return;
        if (Math.hypot(pos.x - drag.start.x, pos.y - drag.start.y) <= 3) return;
        const targetKey = key(cell.q, cell.r);
        if (state.cells[targetKey]?.place) return;
        if (!drag.historyRecorded) {
          recordHistory();
          drag.historyRecorded = true;
        }
        if (movePlace(drag.source, cell)) drag.source = { q: cell.q, r: cell.r };
        return;
      }
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
      if (state.tool === "paint" || state.tool === "relief") {
        const changed = !cell || !state.hoveredBrush || cell.q !== state.hoveredBrush.q || cell.r !== state.hoveredBrush.r;
        state.hoveredBrush = cell;
        if (changed) draw();
      }
      if (!state.isPainting) return;
      if (state.tool === "erase") { eraseAt(pos, cell); return; }
      if (state.tool === "road" || state.tool === "river") {
        addFreePathPoint(pos);
        return;
      }
      if (!cell) return;
      const hoveredKey = key(cell.q, cell.r);
      if ((state.tool === "paint" || state.tool === "relief") && hoveredKey !== state.activePathKey) {
        state.activePathKey = hoveredKey;
        handleCell(cell);
      }
    });

    function finishPointer(event) {
      const wasRightClick = event && event.button === 2 && state.panStart && Math.hypot(event.clientX - state.panStart.x, event.clientY - state.panStart.y) < 5;
      const clickDrawing = state.drawPathByClicks && ["road", "river"].includes(state.tool);
      if (event && (event.type === "pointercancel" || (event.type === "lostpointercapture" && !clickDrawing))) {
        state.currentPath = null;
        state.pathContinuation = null;
      } else if (!clickDrawing) {
        finishFreePath();
      }
      state.isPainting = false;
      state.isPanning = false;
      state.panStart = null;
      state.pathDrag = null;
      state.textDrag = null;
      state.placeDrag = null;
      state.activePathKey = null;
      if (pendingSelectedHex) {
        pendingSelectedHex = false;
        showSelectedPanel();
      }
      if (wasRightClick) clearPathSelection();
    }

    canvas.addEventListener("pointerup", finishPointer);
    canvas.addEventListener("pointercancel", finishPointer);
    canvas.addEventListener("lostpointercapture", finishPointer);

    canvas.addEventListener("pointerleave", () => {
      if (!state.hoveredBrush) return;
      state.hoveredBrush = null;
      draw();
    });

    canvas.addEventListener("dblclick", event => {
      if (state.tool === "navigate") return;
      if ((state.tool === "road" || state.tool === "river") && state.drawPathByClicks) {
        finishFreePath();
        return;
      }
      const pos = pointerPos(event);
      if (state.tool === "text") { editMapTextAt(pos); return; }
      const cell = pixelToHex(pos.x, pos.y);
      if (cell) {
        state.selected = cell;
        setTool("select");
        syncDetails();
        showSelectedPanel();
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
