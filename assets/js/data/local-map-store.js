(function () {
  "use strict";

  const storageKey = "mapa-hex-local-v1";
  const libraryKey = "mapa-hex-local-library-v1";

  function parse(value, fallback) {
    try {
      return JSON.parse(value || "");
    } catch (error) {
      return fallback;
    }
  }

  window.LocalMapStore = {
    list() {
      return parse(localStorage.getItem(libraryKey), []);
    },

    saveLibrary(items) {
      localStorage.setItem(libraryKey, JSON.stringify(items));
    },

    load(id) {
      return parse(localStorage.getItem(storageKey + ":" + id), null);
    },

    loadCurrent() {
      return parse(localStorage.getItem(storageKey), null);
    },

    save(project) {
      localStorage.setItem(storageKey + ":" + project.mapId, JSON.stringify(project));
      localStorage.setItem(storageKey, JSON.stringify(project));
    }
  };
})();

