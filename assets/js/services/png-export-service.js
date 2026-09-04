(function () {
  "use strict";

  const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

  async function renderInTiles({ canvas, ctx, width, height, renderTile, onProgress, tileSize = 1024 }) {
    const output = document.createElement("canvas");
    output.width = width;
    output.height = height;
    const outputCtx = output.getContext("2d");
    const columns = Math.ceil(width / tileSize);
    const rows = Math.ceil(height / tileSize);
    const total = columns * rows;
    let completed = 0;

    for (let y = 0; y < height; y += tileSize) {
      for (let x = 0; x < width; x += tileSize) {
        const tileWidth = Math.min(tileSize, width - x);
        const tileHeight = Math.min(tileSize, height - y);
        canvas.style.width = tileWidth + "px";
        canvas.style.height = tileHeight + "px";
        canvas.width = tileWidth;
        canvas.height = tileHeight;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        renderTile(x, y);
        outputCtx.drawImage(canvas, 0, 0, tileWidth, tileHeight, x, y, tileWidth, tileHeight);
        completed += 1;
        if (onProgress) onProgress(completed, total);
        await nextFrame();
      }
    }
    return output;
  }

  function toBlob(canvas) {
    const dataUrl = canvas.toDataURL("image/png");
    if (dataUrl === "data:," || dataUrl.length < 64) throw new Error("O navegador nao conseguiu codificar a imagem PNG.");
    const encoded = dataUrl.split(",")[1];
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    const blob = new Blob([bytes], { type: "image/png" });
    if (!blob.size) throw new Error("O PNG gerado esta vazio.");
    return Promise.resolve(blob);
  }

  window.PngExportService = Object.freeze({ renderInTiles, toBlob });
}());
