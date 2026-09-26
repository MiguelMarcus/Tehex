(function () {
  "use strict";

  function create() {
    return {
      cols: 28,
      rows: 20,
      hexSize: 31,
      scale: 1,
      isExporting: false,
      offsetX: 80,
      offsetY: 70,
      mapName: "Mapa Hex Local",
      mapStyle: "modern",
      mapId: null,
      tool: "paint",
      terrain: "grass",
      paintShowIcon: true,
      brushSize: 1,
      borderColor: "#77664b",
      terrainIconScale: 1,
      terrainIconScales: {},
      placeIconScales: {},
      snapToEdges: false,
      roadSnapToEdges: false,
      riverSnapToEdges: false,
      cells: {},
      paths: [],
      currentPath: null,
      selectedPathIndex: null,
      selected: null,
      lastPathCell: null,
      pathDrag: null,
      activePathKey: null,
      hoveredBrush: null,
      isPainting: false,
      isPanning: false,
      panStart: null
    };
  }

  window.MapState = Object.freeze({ create });
})();
