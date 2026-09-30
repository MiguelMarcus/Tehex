(function () {
  "use strict";

  const layerOptions = [
    ["terrain", "Terrenos"], ["terrainIcons", "Ícones de terreno"], ["relief", "Relevo"],
    ["places", "Ícones de lugares"], ["labels", "Nomes dos lugares"], ["roads", "Ruas"],
    ["rivers", "Rios"], ["grid", "Grade hexagonal"], ["coordinates", "Coordenadas"]
  ];

  function modal(id, title, body, actions = "") {
    return `<div id="${id}" class="modal" hidden><section class="new-map-dialog feature-dialog" role="dialog" aria-modal="true" aria-labelledby="${id}Heading"><div class="dialog-head"><h2 id="${id}Heading">${title}</h2><button class="dialog-close" data-close-modal="${id}" title="Fechar">×</button></div><div class="dialog-body">${body}</div>${actions ? `<div class="dialog-actions">${actions}</div>` : ""}</section></div>`;
  }

  function mount() {
    const optionsMenu = document.getElementById("optionsMenu");
    const buttons = [
      ["layersBtn", "layers", "Camadas"], ["legendBtn", "list-ul", "Legenda"],
      ["styleLibraryBtn", "palette", "Biblioteca de estilos"], ["helpBtn", "question-circle", "Atalhos e ajuda"]
    ];
    buttons.forEach(([id, icon, label]) => {
      const button = document.createElement("button");
      button.id = id;
      button.innerHTML = `<i class="bi bi-${icon}" aria-hidden="true"></i><span>${label}</span>`;
      button.className = "button-icon";
      optionsMenu.appendChild(button);
    });

    const layers = layerOptions.map(([id, label]) => `<label class="feature-check"><input type="checkbox" data-layer="${id}"><span>${label}</span></label>`).join("");
    const shortcuts = [["N", "Navegar"], ["P", "Pintar"], ["H", "Relevo"], ["L", "Lugar"], ["T", "Texto"], ["E", "Rua/estrada"], ["I", "Rio"], ["A", "Apagar"], ["D", "Editar"], ["Ctrl/⌘ + C / V", "Copiar/colar local ou texto"], ["Ctrl/⌘ + Z", "Desfazer"], ["Ctrl/⌘ + Shift + Z", "Refazer"], ["F1 ou ?", "Abrir esta ajuda"], ["Esc", "Fechar janela"]]
      .map(([key, action]) => `<div class="shortcut-row"><kbd>${key}</kbd><span>${action}</span></div>`).join("");
    const html = [
      modal("layersModal", "Camadas visuais", `<p class="hint">Escolha o que aparece no mapa e nas exportações.</p><div class="feature-check-grid">${layers}</div>`),
      modal("legendModal", "Legenda do mapa", `<p class="hint">A legenda automática usa apenas elementos presentes no mapa.</p><div id="legendPreview" class="legend-preview"></div><div class="form-row"><label for="legendNotes">Itens personalizados, um por linha</label><textarea id="legendNotes" placeholder="Norte — Terras geladas"></textarea></div>`),
      modal("styleLibraryModal", "Biblioteca de estilos", `<div class="library-tabs" role="tablist"><button id="styleTab" class="active" type="button" role="tab" aria-selected="true">Estilos</button><button id="colorsTab" type="button" role="tab" aria-selected="false">Cores</button></div><div id="stylePanel"><p class="hint">Salve a aparência atual para reutilizar em outros mapas.</p><div class="inline"><div class="form-row"><label for="styleProfileName">Nome do estilo</label><input id="styleProfileName" maxlength="40" placeholder="Campanha clássica"></div><button id="saveStyleProfileBtn" class="primary">Salvar estilo atual</button></div><div id="styleProfileList" class="style-profile-list"></div></div><div id="colorsPanel" hidden><p class="hint">Salve cores para reutilizar nas ferramentas do mapa.</p><div class="inline"><div class="form-row"><label for="colorName">Nome da cor</label><input id="colorName" maxlength="30" placeholder="Verde floresta"></div><div class="form-row"><label for="colorValue">Cor</label><input id="colorValue" type="color" value="#3d602e"></div><button id="saveColorBtn" class="primary">Adicionar cor</button></div><div id="colorLibraryList" class="color-library-list"></div></div>`),
      modal("exportOptionsModal", "Exportar imagem", `<div class="feature-form-grid"><div class="form-row"><label for="exportFormat">Formato</label><select id="exportFormat"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></div><div class="form-row"><label for="exportResolution">Resolução</label><select id="exportResolution"><option value="1.25">Normal</option><option value="2.25" selected>Alta</option><option value="3">Muito alta</option></select></div></div><div class="feature-check-grid"><label class="feature-check"><input id="exportTitle" type="checkbox" checked><span>Incluir título</span></label><label class="feature-check"><input id="exportLegend" type="checkbox"><span>Incluir legenda</span></label><label class="feature-check"><input id="exportBackground" type="checkbox" checked><span>Incluir fundo</span></label><label class="feature-check"><input id="exportCoordinates" type="checkbox"><span>Incluir coordenadas</span></label><label class="feature-check"><input id="exportGrid" type="checkbox" checked><span>Incluir grade</span></label></div>`, `<button data-close-modal="exportOptionsModal">Cancelar</button><button id="confirmExportBtn" class="primary">Exportar</button>`),
      modal("helpModal", "Atalhos e ajuda", `<p class="hint">Os atalhos funcionam quando nenhum campo de texto está ativo.</p><div class="shortcut-list">${shortcuts}</div><p class="hint">Botão direito ou Shift: mover o mapa. Roda do mouse: zoom. Duplo clique: editar o hex.</p>`)
    ].join("");
    document.body.insertAdjacentHTML("beforeend", html);
  }

  window.WorkspaceFeatures = Object.freeze({ layerOptions, mount });
})();
