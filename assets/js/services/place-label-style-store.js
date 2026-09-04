(function () {
  "use strict";

  const key = "mapa-hex-place-label-styles-v1";

  function list() {
    const styles = SafeJsonStorage.read(key, []);
    return Array.isArray(styles) ? styles : [];
  }

  function save(name, style) {
    const styles = list().filter(item => item.name !== name);
    const item = { id: window.crypto?.randomUUID?.() || "style-" + Date.now(), name, style };
    SafeJsonStorage.write(key, [...styles, item]);
    return item;
  }

  window.PlaceLabelStyleStore = Object.freeze({ list, save });
})();
