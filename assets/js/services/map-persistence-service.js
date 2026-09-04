(function () {
  "use strict";

  function summary(project) {
    return {
      id: project.mapId,
      name: project.mapName,
      style: project.mapStyle,
      cols: project.cols,
      rows: project.rows,
      updatedAt: new Date().toISOString()
    };
  }

  function save(project) {
    const projectResult = MapRepository.save(project);
    if (!projectResult.ok) return projectResult;
    const library = MapRepository.list().filter(item => item && item.id !== project.mapId);
    const libraryResult = MapRepository.saveLibrary([...library, summary(project)]);
    return libraryResult.ok ? { ok: true } : libraryResult;
  }

  function list() {
    return MapRepository.list();
  }

  function load(id) {
    return MapRepository.load(id);
  }

  function loadCurrent() {
    return MapRepository.loadCurrent();
  }

  window.MapPersistence = Object.freeze({ save, list, load, loadCurrent });
})();
