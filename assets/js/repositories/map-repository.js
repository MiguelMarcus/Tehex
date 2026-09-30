(function () {
  "use strict";

  const projectKey = "mapa-hex-local-v1";
  const libraryKey = "mapa-hex-local-library-v1";

  function itemKey(id) {
    return projectKey + ":" + id;
  }

  function list() {
    const library = SafeJsonStorage.read(libraryKey, []);
    return Array.isArray(library) ? library : [];
  }

  function load(id) {
    return id ? SafeJsonStorage.read(itemKey(id), null) : null;
  }

  function loadCurrent() {
    return SafeJsonStorage.read(projectKey, null);
  }

  function save(project) {
    if (!project || !project.mapId) return { ok: false, error: new Error("Projeto sem identificador") };
    const projectResult = SafeJsonStorage.write(itemKey(project.mapId), project);
    if (!projectResult.ok) return projectResult;
    return SafeJsonStorage.write(projectKey, project);
  }

  function saveLibrary(items) {
    return SafeJsonStorage.write(libraryKey, Array.isArray(items) ? items : []);
  }

  function remove(id) {
    if (!id) return { ok: false, error: new Error("Mapa sem identificador") };
    try {
      window.localStorage.removeItem(itemKey(id));
    } catch (error) {
      return { ok: false, error };
    }
    return saveLibrary(list().filter(item => item && item.id !== id));
  }

  window.MapRepository = Object.freeze({ list, load, loadCurrent, remove, save, saveLibrary });
})();
