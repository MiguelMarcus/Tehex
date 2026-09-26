(function () {
  "use strict";

  const storageKey = "mapa-hex-style-library-v1";
  const builtIns = [
    { id: "builtin-natural", name: "Atlas natural", builtIn: true, settings: { mapStyle: "modern", borderColor: "#77664b", roadStyle: "simple", roadSnapToEdges: false, riverSnapToEdges: false, reliefLevel: 1 } },
    { id: "builtin-classic", name: "Cartografia clássica", builtIn: true, settings: { mapStyle: "oldschool", borderColor: "#77664b", roadStyle: "trail", roadSnapToEdges: false, riverSnapToEdges: true, reliefLevel: 2 } },
    { id: "builtin-routes", name: "Rotas comerciais", builtIn: true, settings: { mapStyle: "modern", borderColor: "#8c7655", roadStyle: "main", roadSnapToEdges: true, riverSnapToEdges: true, reliefLevel: 1 } }
  ];

  function stored() {
    const items = SafeJsonStorage.read(storageKey, []);
    return Array.isArray(items) ? items : [];
  }

  function list() { return [...builtIns, ...stored()]; }

  function save(name, settings) {
    const items = stored().filter(item => item.name !== name);
    const item = { id: window.crypto?.randomUUID?.() || "map-style-" + Date.now(), name, settings };
    SafeJsonStorage.write(storageKey, [...items, item]);
    return item;
  }

  function remove(id) {
    return SafeJsonStorage.write(storageKey, stored().filter(item => item.id !== id));
  }

  window.MapStyleLibrary = Object.freeze({ list, remove, save });
})();
