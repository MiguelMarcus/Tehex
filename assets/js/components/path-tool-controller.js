(function () {
  "use strict";

  function create({ state, els, pixelToWorld, snapPathPoint, worldToPixel, recordHistory, scheduleSave, draw }) {
    function findPathAt(pos, type) {
      return MapPathGeometry.findPathAt(state.paths || [], pos, type, worldToPixel, Math.max(10, state.hexSize * state.scale * .34));
    }

    function findPathEndpointAt(pos, type) {
      return MapPathGeometry.findPathEndpointAt(state.paths || [], pos, type, worldToPixel, Math.max(13, state.hexSize * state.scale * .42));
    }

    function updateSelectionUi() {
      const path = state.paths[state.selectedPathIndex];
      els.deleteSelectedPathBtn.disabled = !path;
      els.pathSelectionHint.textContent = path
        ? (path.type === "river" ? "Rio selecionado." : "Rua selecionada.") + " Clique em uma bolinha para continuar por uma ponta ou arraste o desenho para mover."
        : state.currentPath
          ? (state.currentPath.type === "river" ? "Continuando o rio." : "Continuando a rua.") + " Arraste para adicionar novos pontos."
          : "Clique em um desenho para selecioná-lo. Clique em uma área vazia para iniciar ou continuar o traço.";
    }

    function startFreePath(pos) {
      const selected = state.paths[state.selectedPathIndex];
      const useEdges = selected && selected.type === state.tool ? Boolean(selected.snapToEdges) : state.snapToEdges;
      const snapped = snapPathPoint(pos, useEdges);
      const point = pixelToWorld(snapped.x, snapped.y);
      if (selected && selected.type === state.tool) {
        recordHistory();
        state.currentPath = state.paths.splice(state.selectedPathIndex, 1)[0];
        state.selectedPathIndex = null;
        const last = state.currentPath.points[state.currentPath.points.length - 1];
        if (Math.hypot(point[0] - last[0], point[1] - last[1]) > .16) state.currentPath.points.push(point);
      } else {
        recordHistory();
        state.currentPath = { type: state.tool, style: state.tool === "road" ? state.roadStyle : undefined, snapToEdges: state.snapToEdges, snapToCenters: !state.snapToEdges, points: [point] };
      }
      updateSelectionUi();
      draw();
    }

    function addFreePathPoint(pos) {
      if (!state.currentPath) return;
      const snapped = snapPathPoint(pos, state.currentPath.snapToEdges);
      const point = pixelToWorld(snapped.x, snapped.y);
      const points = state.currentPath.points;
      const last = points[points.length - 1];
      if (Math.hypot(point[0] - last[0], point[1] - last[1]) < .16) return;
      recordHistory();
      points.push(point);
      scheduleSave();
      draw();
    }

    function finishFreePath() {
      if (!state.currentPath) return;
      if (state.currentPath.points.length > 1) {
        state.paths = state.paths || [];
        state.paths.push(state.currentPath);
        scheduleSave();
      }
      state.currentPath = null;
      updateSelectionUi();
      draw();
    }

    function startPathFromEndpoint(index, endpointIndex) {
      recordHistory();
      const path = state.paths.splice(index, 1)[0];
      if (endpointIndex === 0) path.points.reverse();
      state.currentPath = path;
      state.selectedPathIndex = null;
      state.pathDrag = null;
      updateSelectionUi();
      draw();
    }

    function selectPath(index) {
      state.selectedPathIndex = index;
      updateSelectionUi();
      draw();
    }

    function deleteSelectedPath() {
      if (state.selectedPathIndex === null) return;
      recordHistory();
      state.paths.splice(state.selectedPathIndex, 1);
      state.selectedPathIndex = null;
      updateSelectionUi();
      scheduleSave();
      draw();
    }

    function eraseNear(pos) {
      const point = pixelToWorld(pos.x, pos.y);
      const radius = .45;
      const before = (state.paths || []).length;
      const willErase = (state.paths || []).some(path => path.points.some(p => Math.hypot(p[0] - point[0], p[1] - point[1]) < radius));
      if (willErase) recordHistory();
      state.paths = (state.paths || []).filter(path => !path.points.some(p => Math.hypot(p[0] - point[0], p[1] - point[1]) < radius));
      if (state.paths.length !== before) scheduleSave();
    }

    return Object.freeze({ addFreePathPoint, deleteSelectedPath, eraseNear, findPathAt, findPathEndpointAt, finishFreePath, selectPath, startFreePath, startPathFromEndpoint, updateSelectionUi });
  }

  window.PathToolController = Object.freeze({ create });
})();
