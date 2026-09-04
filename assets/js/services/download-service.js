(function () {
  "use strict";

  function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function saveText(text, filename, type = "text/plain;charset=utf-8") {
    saveBlob(new Blob([text], { type }), filename);
  }

  function saveCanvas(canvas, filename) {
    if (!canvas || typeof canvas.toDataURL !== "function") throw new Error("Este navegador nao suporta a exportacao de imagens.");
    const dataUrl = canvas.toDataURL("image/png");
    if (dataUrl === "data:," || dataUrl.length < 32) throw new Error("O navegador nao conseguiu gerar a imagem PNG.");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function requestPngFile(filename) {
    if (typeof window.showSaveFilePicker !== "function") return null;
    return window.showSaveFilePicker({
      suggestedName: filename,
      types: [{ description: "Imagem PNG", accept: { "image/png": [".png"] } }]
    });
  }

  async function savePng(blob, filename, fileHandle) {
    if (!blob || !blob.size) throw new Error("Nenhum dado de imagem foi gerado para salvar.");
    if (fileHandle) {
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
    saveBlob(blob, filename);
  }

  window.DownloadService = Object.freeze({ saveBlob, saveText, saveCanvas, requestPngFile, savePng });
}());
