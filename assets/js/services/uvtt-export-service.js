(function () {
  "use strict";

  function createPayload(image, pixelsPerGrid) {
    if (!image || !image.width || !image.height) throw new Error("A imagem do mapa esta vazia.");
    if (!Number.isInteger(pixelsPerGrid) || pixelsPerGrid <= 0) throw new Error("Escala da grade invalida.");
    const dataUrl = image.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    if (!base64) throw new Error("Nao foi possivel codificar a imagem do mapa.");
    return {
      format: 1,
      resolution: {
        map_origin: { x: 0, y: 0 },
        map_size: { x: image.width / pixelsPerGrid, y: image.height / pixelsPerGrid },
        pixels_per_grid: pixelsPerGrid
      },
      line_of_sight: [],
      objects_line_of_sight: [],
      portals: [],
      environment: { baked_lighting: false, ambient_light: "ffffffff" },
      lights: [],
      image: base64,
      // Extensao Tehex: importadores UVTT comuns ignoram este campo.
      tehex: { grid_type: "hex_odd_q", grid_size: pixelsPerGrid }
    };
  }

  // Executar como macro de script no Foundry v14 apos importar o .uvtt.
  // Em uma grade hexagonal plana o tamanho do Foundry e a distancia curta
  // (topo a base). Fixar o valor aqui evita que o importador escolha um
  // tamanho padrao diferente do usado para renderizar a imagem.
  function foundryMacro(pixelsPerGrid) {
    if (!Number.isInteger(pixelsPerGrid) || pixelsPerGrid <= 0) {
      throw new Error("Escala da grade invalida.");
    }
    return `const scene = canvas.scene;
if (!scene) return ui.notifications.warn("Abra a cena importada antes de executar a macro.");
await scene.update({
  "grid.type": CONST.GRID_TYPES.HEXODDQ,
  "grid.size": ${pixelsPerGrid},
  "padding": 0,
  "shiftX": 0,
  "shiftY": 0
});
ui.notifications.info("Grade Tehex alinhada: Columns, Odd, ${pixelsPerGrid} px, sem padding ou offset.");`;
  }

  window.UvttExportService = Object.freeze({ createPayload, foundryMacro });
}());
