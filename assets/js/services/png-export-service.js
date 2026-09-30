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

  function toBlob(canvas, type = "image/png", quality = 0.92) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob || !blob.size) {
          reject(new Error("A imagem gerada esta vazia."));
          return;
        }
        resolve(blob);
      }, type, quality);
    });
  }

  window.PngExportService = Object.freeze({ renderInTiles, toBlob });
}());
