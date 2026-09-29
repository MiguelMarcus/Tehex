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
      roadSelectExisting: false,
      riverSelectExisting: false,
      selectExistingPaths: false,
      roadStyle: "simple",
      roadColor: "#b78b4b",
      roadWidth: 1,
      reliefLevel: 1,
      layers: { terrain: true, terrainIcons: true, relief: true, places: true, labels: true, roads: true, rivers: true, grid: true, coordinates: false },
      legendNotes: "",
      exportBackground: true,
      cells: {},
      paths: [],
      texts: [],
      selectedTextIndex: null,
      textDrag: null,
      clipboard: null,
      currentPath: null,
      pathContinuation: null,
      selectedPathIndex: null,
      selected: null,
      lastPathCell: null,
      pathDrag: null,
      placeDrag: null,
      activePathKey: null,
      hoveredBrush: null,
      isPainting: false,
      isPanning: false,
      panStart: null
    };
  }

  window.MapState = Object.freeze({ create });
})();
