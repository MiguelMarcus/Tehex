(function () {
  "use strict";

  const tools = {
    navigate: { icon: "arrows-move", shortcut: "N" },
    select: { icon: "pencil-square", shortcut: "D" },
    erase: { icon: "eraser", shortcut: "A" },
    paint: { icon: "brush", shortcut: "P" },
    relief: { icon: "layers", shortcut: "H" },
    place: { icon: "geo-alt", shortcut: "L" },
    text: { icon: "type", shortcut: "T" },
    road: { icon: "signpost-split", shortcut: "E" },
    river: { icon: "water", shortcut: "I" }
  };

  function mount(grid, hint) {
    grid.setAttribute("role", "toolbar");
    grid.setAttribute("aria-label", "Ferramentas do mapa");
    grid.closest(".section").classList.add("tool-menu-section");
    const buttons = new Map();

    grid.querySelectorAll("[data-tool]").forEach(button => {
      const type = button.dataset.tool;
      const meta = tools[type];
      if (!meta) return;
      const label = button.textContent.trim();
      const icon = document.createElement("i");
      icon.className = "bi bi-" + meta.icon;
      icon.setAttribute("aria-hidden", "true");
      const name = document.createElement("span");
      name.className = "tool-name";
      name.textContent = label;
      const shortcut = document.createElement("kbd");
      shortcut.className = "tool-shortcut";
      shortcut.textContent = meta.shortcut;
      shortcut.setAttribute("aria-hidden", "true");
      button.replaceChildren(icon, name, shortcut);
      button.type = "button";
      button.classList.add("tool-button");
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-keyshortcuts", meta.shortcut);
      button.title += " (" + meta.shortcut + ")";
      buttons.set(type, button);
    });

    const groups = [
      ["Explorar e corrigir", ["navigate", "select", "erase"]],
      ["Criar no mapa", ["paint", "relief", "place", "text", "road", "river"]]
    ];
    groups.forEach(([label, entries]) => {
      const group = document.createElement("div");
      group.className = "tool-group";
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", label);
      const heading = document.createElement("div");
      heading.className = "tool-group-title";
      heading.textContent = label;
      const controls = document.createElement("div");
      controls.className = "tool-group-buttons";
      entries.forEach(type => controls.appendChild(buttons.get(type)));
      group.append(heading, controls);
      grid.appendChild(group);
    });

    const summary = document.createElement("div");
    summary.className = "tool-summary";
    summary.setAttribute("aria-live", "polite");
    const icon = document.createElement("i");
    icon.className = "bi";
    icon.setAttribute("aria-hidden", "true");
    const copy = document.createElement("div");
    copy.className = "tool-summary-copy";
    const kicker = document.createElement("span");
    kicker.className = "tool-summary-kicker";
    kicker.textContent = "Ferramenta ativa";
    const title = document.createElement("strong");
    title.className = "tool-summary-title";
    copy.append(kicker, title, hint);
    summary.append(icon, copy);
    grid.after(summary);

    grid.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      const current = event.target.closest("[data-tool]");
      if (!current || !grid.contains(current)) return;
      const ordered = [...grid.querySelectorAll("[data-tool]")];
      const index = ordered.indexOf(current);
      const next = event.key === "Home" ? 0 : event.key === "End" ? ordered.length - 1
        : (index + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) + ordered.length) % ordered.length;
      event.preventDefault();
      ordered[next].focus();
    });

    function update(type, description) {
      const active = buttons.get(type);
      if (!active) return;
      buttons.forEach((button, entry) => {
        const selected = entry === type;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      icon.className = "bi bi-" + tools[type].icon;
      title.textContent = active.querySelector(".tool-name").textContent;
      hint.textContent = description;
      summary.dataset.tool = type;
    }

    return Object.freeze({ update });
  }

  window.ToolMenu = Object.freeze({ mount });
})();
