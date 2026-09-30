(function () {
  "use strict";

  const storageKey = "mapa-hex-color-library-v1";

  function list() {
    const items = SafeJsonStorage.read(storageKey, []);
    return Array.isArray(items) ? items.filter(item => /^#[0-9a-f]{6}$/i.test(item?.value || "")) : [];
  }

  function save(name, value) {
    if (!/^#[0-9a-f]{6}$/i.test(value || "")) return { ok: false, error: new Error("Cor invalida") };
    const items = list().filter(item => item.name !== name);
    const item = { id: window.crypto?.randomUUID?.() || "color-" + Date.now(), name: name || value, value: value.toLowerCase() };
    const result = SafeJsonStorage.write(storageKey, [...items, item]);
    return result.ok ? { ok: true, item } : result;
  }

  function remove(id) {
    return SafeJsonStorage.write(storageKey, list().filter(item => item.id !== id));
  }

  window.ColorLibrary = Object.freeze({ list, remove, save });
})();
