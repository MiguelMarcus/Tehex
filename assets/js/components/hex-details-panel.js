(function () {
  "use strict";

  function mount(section) {
    section.classList.add("selected-hex-section");
    const coordinateRow = section.querySelector("#selectedCoord").closest(".form-row");
    const placeName = section.querySelector("#selectedName");
    const placeNameRow = placeName.closest(".form-row");
    placeNameRow.querySelector("label").textContent = "Nome no mapa";
    const scaleRow = section.querySelector(".text-size-control");
    const placeTypeRow = section.querySelector("#selectedType").closest(".form-row");
    const notesInput = section.querySelector("#selectedNotes");
    const notesRow = notesInput.closest(".form-row");
    notesRow.classList.add("hex-notes-row");
    notesRow.querySelector("label").textContent = "Anotações";
    notesInput.rows = 8;
    notesInput.placeholder = "Descrição, encontros, pistas, segredos ou qualquer detalhe deste hex...";
    notesInput.setAttribute("aria-describedby", "selectedNotesHelp selectedNotesStatus");

    const privateCard = document.createElement("div");
    privateCard.className = "hex-private-card";
    privateCard.innerHTML = '<div class="hex-card-heading"><i class="bi bi-journal-text" aria-hidden="true"></i><div><h3>Registro do hex</h3><p id="selectedNotesHelp">Título e notas privados. Não aparecem na imagem do mapa.</p></div></div>';

    const titleRow = document.createElement("div");
    titleRow.className = "form-row hex-title-row";
    const titleLabel = document.createElement("label");
    titleLabel.htmlFor = "selectedHexTitle";
    titleLabel.textContent = "Título do hex";
    const titleInput = document.createElement("input");
    titleInput.id = "selectedHexTitle";
    titleInput.type = "text";
    titleInput.maxLength = 80;
    titleInput.placeholder = "Ex.: Passagem esquecida";
    titleRow.append(titleLabel, titleInput);

    const prompts = document.createElement("div");
    prompts.className = "hex-notes-prompts";
    prompts.setAttribute("aria-label", "Inserir seção nas anotações");
    ["Descrição", "Encontros", "Segredos"].forEach(label => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "+ " + label;
      button.title = "Inserir seção " + label.toLowerCase();
      button.addEventListener("click", () => {
        notesInput.value += (notesInput.value.trim() ? "\n\n" : "") + label + "\n";
        notesInput.dispatchEvent(new Event("input", { bubbles: true }));
        notesInput.focus();
        notesInput.setSelectionRange(notesInput.value.length, notesInput.value.length);
      });
      prompts.appendChild(button);
    });
    notesInput.before(prompts);

    const footer = document.createElement("div");
    footer.className = "hex-notes-footer";
    const count = document.createElement("span");
    count.className = "hex-notes-count";
    const status = document.createElement("span");
    status.id = "selectedNotesStatus";
    status.className = "hex-notes-status";
    status.setAttribute("role", "status");
    footer.append(count, status);
    privateCard.append(titleRow, notesRow, footer);

    const placeCard = document.createElement("div");
    placeCard.className = "hex-place-card";
    placeCard.innerHTML = '<div class="hex-card-heading"><i class="bi bi-geo-alt" aria-hidden="true"></i><div><h3>Local no mapa</h3><p>Escolha um tipo para habilitar o nome visível no mapa.</p></div></div>';
    section.querySelector("#applyDetailsBtn").textContent = "Aplicar local";
    placeCard.append(placeNameRow, scaleRow, placeTypeRow, section.querySelector("#applyDetailsBtn"), section.querySelector("#duplicatePlaceBtn"));

    const fields = document.createElement("div");
    fields.className = "selected-details-fields";
    fields.append(coordinateRow, privateCard, placeCard);
    const empty = document.createElement("div");
    empty.className = "selected-empty-state";
    empty.innerHTML = '<i class="bi bi-cursor" aria-hidden="true"></i><span>Escolha <strong>Editar</strong> e clique em um hex para ver seus detalhes.</span>';
    section.append(empty, fields);

    let onEdit = null;
    let currentKey = null;
    const editing = { title: false, notes: false };
    function updateCount() {
      count.textContent = notesInput.value.length + (notesInput.value.length === 1 ? " caractere" : " caracteres");
    }
    function connect(input, field) {
      input.addEventListener("input", () => {
        if (!currentKey || !onEdit) return;
        if (field === "notes") updateCount();
        if (onEdit(field, input.value, !editing[field])) {
          editing[field] = true;
          status.textContent = "Salvando…";
          status.dataset.state = "pending";
        }
      });
      input.addEventListener("blur", () => { editing[field] = false; });
    }
    connect(titleInput, "title");
    connect(notesInput, "notes");

    function sync(selected) {
      empty.hidden = Boolean(selected);
      fields.hidden = !selected;
      const nextKey = selected?.key || null;
      if (nextKey !== currentKey) {
        editing.title = false;
        editing.notes = false;
        currentKey = nextKey;
      }
      titleInput.value = selected?.title || "";
      notesInput.value = selected?.notes || "";
      updateCount();
      status.textContent = selected ? "Salvamento automático" : "";
      status.dataset.state = "idle";
    }

    function markSaved(ok) {
      if (!currentKey) return;
      status.textContent = ok ? "Salvo" : "Falha ao salvar";
      status.dataset.state = ok ? "saved" : "error";
    }

    return Object.freeze({
      titleInput,
      bindSave(callback) { onEdit = callback; },
      markSaved,
      sync
    });
  }

  window.HexDetailsPanel = Object.freeze({ mount });
})();
