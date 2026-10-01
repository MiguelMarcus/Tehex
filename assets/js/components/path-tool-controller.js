(function () {
  "use strict";

  function create({ state, els, pixelToWorld, snapPathPoint, worldToPixel, recordHistory, scheduleSave, draw, onSelectionChange }) {
    function findPathAt(pos, type) {
      return MapPathGeometry.findPathAt(state.paths || [], pos, type, worldToPixel, Math.max(10, state.hexSize * state.scale * .34));
    }

    function findPathEndpointAt(pos, type) {
      return MapPathGeometry.findPathEndpointAt(state.paths || [], pos, type, worldToPixel, Math.max(13, state.hexSize * state.scale * .42));
    }

    function updateSelectionUi() {
      const path = state.paths[state.selectedPathIndex];
      els.deleteSelectedPathBtn.disabled = !path;
      onSelectionChange?.(path);
      els.pathSelectionHint.textContent = path
        ? (path.type === "river" ? "Rio selecionado." : "Rua selecionada.") + " Arraste-o para mover. Puxe uma bolinha na direção do traço para encurtá-lo, ou para fora para continuar."
        : state.currentPath
          ? (state.currentPath.type === "river" ? "Continuando o rio." : "Continuando a rua.") + (state.drawPathByClicks ? " Clique para adicionar pontos; duplo clique para terminar." : " Arraste para adicionar novos pontos.")
          : state.selectExistingPaths
            ? "Clique em um desenho para selecioná-lo. Clique em uma área vazia para iniciar um novo traço."
            : state.drawPathByClicks
              ? "Clique para iniciar e adicionar pontos; duplo clique para terminar."
              : "Modo de desenho ativo. Marque “Selecionar” para editar um traçado existente.";
    }

    function startFreePath(pos) {
      const selected = state.paths[state.selectedPathIndex];
      const useEdges = selected && selected.type === state.tool ? Boolean(selected.snapToEdges) : state.snapToEdges;
      const useCenters = selected && selected.type === state.tool
        ? (selected.snapToCenters === undefined ? !useEdges : Boolean(selected.snapToCenters))
        : state.snapToCenters;
      const snapped = useEdges || useCenters ? snapPathPoint(pos, useEdges) : pos;
      const point = pixelToWorld(snapped.x, snapped.y);
      if (selected && selected.type === state.tool) {
        recordHistory();
        state.currentPath = state.paths.splice(state.selectedPathIndex, 1)[0];
        state.currentPath.snapToCenters = useCenters;
        state.selectedPathIndex = null;
        const last = state.currentPath.points[state.currentPath.points.length - 1];
        if (Math.hypot(point[0] - last[0], point[1] - last[1]) > .16) state.currentPath.points.push(point);
        state.pathContinuation = null;
      } else {
        recordHistory();
        state.currentPath = {
          type: state.tool,
          style: state.tool === "road" ? state.roadStyle : undefined,
          color: state.tool === "road" ? state.roadColor : undefined,
          width: state.roadWidth,
          snapToEdges: useEdges,
          snapToCenters: useCenters,
          points: [point]
        };
        state.pathContinuation = null;
      }
      updateSelectionUi();
      draw();
    }

    function addFreePathPoint(pos) {
      if (!state.currentPath) return;
      const useEdges = Boolean(state.currentPath.snapToEdges);
      const useCenters = state.currentPath.snapToCenters === undefined ? !useEdges : Boolean(state.currentPath.snapToCenters);
      const snapped = useEdges || useCenters ? snapPathPoint(pos, useEdges) : pos;
      const point = pixelToWorld(snapped.x, snapped.y);
      const points = state.currentPath.points;
      const last = points[points.length - 1];
      if (state.pathContinuation && points.length > 1) {
        const previous = points[points.length - 2];
        const moved = [point[0] - last[0], point[1] - last[1]];
        const towardPath = [previous[0] - last[0], previous[1] - last[1]];
        if (moved[0] * towardPath[0] + moved[1] * towardPath[1] > 0) {
          let nearestIndex = points.length - 2;
          let nearestDistance = Infinity;
          points.slice(0, -1).forEach((candidate, index) => {
            const distance = Math.hypot(point[0] - candidate[0], point[1] - candidate[1]);
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestIndex = index;
            }
          });
          recordHistory();
          if (nearestDistance < .45) points.splice(nearestIndex + 1);
          else points.pop();
          scheduleSave();
          draw();
          return;
        }
      }
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
      state.pathContinuation = null;
      updateSelectionUi();
      draw();
    }

    function startPathFromEndpoint(index, endpointIndex) {
      recordHistory();
      const path = state.paths.splice(index, 1)[0];
      if (endpointIndex === 0) path.points.reverse();
      state.currentPath = path;
      state.pathContinuation = true;
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

    function clearSelection() {
      if (state.selectedPathIndex === null) return;
      state.selectedPathIndex = null;
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

    function eraseNear(pos, allowed = { roads: true, rivers: true }) {
      const roadIndex = allowed.roads ? findPathAt(pos, "road") : -1;
      const riverIndex = roadIndex === -1 && allowed.rivers ? findPathAt(pos, "river") : -1;
      const eraseIndex = roadIndex !== -1 ? roadIndex : riverIndex;
      const before = (state.paths || []).length;
      if (eraseIndex === -1) return false;
      recordHistory();
      state.paths = (state.paths || []).filter((path, index) => index !== eraseIndex);
      if (state.paths.length !== before) scheduleSave();
      draw();
      return true;
    }

    return Object.freeze({ addFreePathPoint, clearSelection, deleteSelectedPath, eraseNear, findPathAt, findPathEndpointAt, finishFreePath, selectPath, startFreePath, startPathFromEndpoint, updateSelectionUi });
  }

  window.PathToolController = Object.freeze({ create });
})();
