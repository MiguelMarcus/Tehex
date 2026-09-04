(function () {
  "use strict";

  function mount() {
    const overlay = document.createElement("div");
    overlay.id = "exportProgressOverlay";
    overlay.className = "export-progress-overlay";
    overlay.hidden = true;
    overlay.innerHTML = '<section class="export-progress-card" role="status" aria-live="polite"><span class="export-progress-kicker">EXPORTANDO MAPA</span><strong id="exportProgressLabel">Preparando renderizacao...</strong><div class="export-progress-track"><span id="exportProgressBar"></span></div></section>';
    document.body.appendChild(overlay);
    const label = overlay.querySelector("#exportProgressLabel");
    const bar = overlay.querySelector("#exportProgressBar");
    return {
      show() { overlay.hidden = false; this.update(0, "Preparando renderizacao..."); },
      update(progress, message) {
        bar.style.width = Math.max(0, Math.min(100, progress)) + "%";
        label.textContent = message || "Renderizando " + Math.round(progress) + "%";
      },
      hide() { overlay.hidden = true; }
    };
  }

  window.ExportProgressOverlay = { mount };
}());
