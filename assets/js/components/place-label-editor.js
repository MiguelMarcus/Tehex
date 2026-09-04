(function () {
  "use strict";

  const styleKeys = ["textScale", "labelPosition", "showLabel", "labelFont", "textColor", "labelBorder", "borderColor", "type", "iconScale", "iconPosition"];
  const fonts = [["Georgia, serif", "Georgia"], ["Palatino Linotype, Palatino, serif", "Palatino"], ["Times New Roman, serif", "Times New Roman"]];

  function field(label, control) {
    const element = document.createElement("label");
    element.className = "place-label-editor__field";
    const caption = document.createElement("span");
    caption.textContent = label;
    element.append(caption, control);
    return element;
  }

  function select(options, value) {
    const input = document.createElement("select");
    options.forEach(([id, label]) => input.add(new Option(label, id)));
    input.value = value;
    return input;
  }

  function create(place, { icons, onChange }) {
    const editor = document.createElement("section");
    editor.className = "place-label-editor";
    const title = document.createElement("div");
    title.className = "place-label-editor__title";
    title.textContent = "Rótulo e ícone";
    const name = document.createElement("input");
    name.type = "text";
    name.maxLength = 42;
    name.value = place.name || "";
    name.placeholder = "Nome exibido no mapa";

    const scale = document.createElement("input");
    scale.type = "range";
    scale.min = "60";
    scale.max = "160";
    const scaleNumber = document.createElement("input");
    scaleNumber.type = "number";
    scaleNumber.min = "60";
    scaleNumber.max = "160";
    scaleNumber.step = "1";
    const scaleWrap = document.createElement("div");
    scaleWrap.className = "place-label-editor__range";
    scaleWrap.append(scale, scaleNumber);

    const position = select([["bottom", "Abaixo do ícone"], ["top", "Acima do ícone"]], place.labelPosition || "bottom");
    const font = select(fonts, place.labelFont || fonts[0][0]);
    const icon = select(icons.map(item => [item.id, item.label]), place.type);
    const iconPosition = select([["auto", "Automática"], ["center", "Centralizada"], ["top", "Acima do texto"]], place.iconPosition || "auto");
    const iconScale = document.createElement("input");
    iconScale.type = "range";
    iconScale.min = "60";
    iconScale.max = "180";
    const iconNumber = document.createElement("input");
    iconNumber.type = "number";
    iconNumber.min = "60";
    iconNumber.max = "180";
    iconNumber.step = "1";
    const iconScaleWrap = document.createElement("div");
    iconScaleWrap.className = "place-label-editor__range";
    iconScaleWrap.append(iconScale, iconNumber);

    const textColor = document.createElement("input");
    textColor.type = "color";
    const borderColor = document.createElement("input");
    borderColor.type = "color";
    const borderEnabled = document.createElement("input");
    borderEnabled.type = "checkbox";
    const visible = document.createElement("input");
    visible.type = "checkbox";
    const borderField = document.createElement("label");
    borderField.className = "place-label-editor__visibility";
    borderField.append(borderEnabled, document.createTextNode("Usar borda no texto"));
    const visibleField = document.createElement("label");
    visibleField.className = "place-label-editor__visibility";
    visibleField.append(visible, document.createTextNode("Mostrar rótulo no mapa"));

    function setValues(data) {
      const textSize = Math.round((Number(data.textScale) || 1) * 100);
      const iconSize = Math.round((Number(data.iconScale) || 1) * 100);
      scale.value = scaleNumber.value = textSize;
      iconScale.value = iconNumber.value = iconSize;
      position.value = data.labelPosition || "bottom";
      font.value = data.labelFont || fonts[0][0];
      icon.value = data.type || icons[0]?.id || "";
      iconPosition.value = data.iconPosition || "auto";
      textColor.value = data.textColor || "#3b2318";
      borderColor.value = data.borderColor || "#fff9f0";
      borderEnabled.checked = data.labelBorder !== false;
      visible.checked = data.showLabel !== false;
    }

    function value() {
      return { name: name.value, textScale: Number(scale.value) / 100, labelPosition: position.value, showLabel: visible.checked, labelFont: font.value, textColor: textColor.value, labelBorder: borderEnabled.checked, borderColor: borderColor.value, type: icon.value, iconScale: Number(iconScale.value) / 100, iconPosition: iconPosition.value };
    }

    function syncSize(source, target, max) {
      source.addEventListener("input", () => {
        const next = Math.max(60, Math.min(max, Number(source.value) || 60));
        source.value = next;
        target.value = next;
        onChange(value());
      });
    }

    setValues(place);
    [name, position, font, icon, iconPosition, textColor, borderColor, borderEnabled, visible].forEach(control => control.addEventListener(control.type === "checkbox" || control.tagName === "SELECT" ? "change" : "input", () => onChange(value())));
    syncSize(scale, scaleNumber, 160);
    syncSize(scaleNumber, scale, 160);
    syncSize(iconScale, iconNumber, 180);
    syncSize(iconNumber, iconScale, 180);

    const styleName = document.createElement("input");
    styleName.type = "text";
    styleName.maxLength = 30;
    styleName.placeholder = "Nome do estilo";
    const savedStyles = document.createElement("select");
    const saveStyle = document.createElement("button");
    saveStyle.type = "button";
    saveStyle.textContent = "Salvar estilo";
    const applyStyle = document.createElement("button");
    applyStyle.type = "button";
    applyStyle.textContent = "Usar estilo";
    const styleActions = document.createElement("div");
    styleActions.className = "place-label-editor__style-actions";
    styleActions.append(saveStyle, applyStyle);
    function refreshStyles() {
      savedStyles.replaceChildren(new Option("Estilos salvos", ""));
      PlaceLabelStyleStore.list().forEach(item => savedStyles.add(new Option(item.name, item.id)));
    }
    saveStyle.addEventListener("click", () => {
      const nameValue = styleName.value.trim() || "Estilo " + (PlaceLabelStyleStore.list().length + 1);
      const current = value();
      const style = Object.fromEntries(styleKeys.map(key => [key, current[key]]));
      const saved = PlaceLabelStyleStore.save(nameValue, style);
      styleName.value = saved.name;
      refreshStyles();
      savedStyles.value = saved.id;
    });
    applyStyle.addEventListener("click", () => {
      const saved = PlaceLabelStyleStore.list().find(item => item.id === savedStyles.value);
      if (!saved) return;
      setValues({ ...value(), ...saved.style });
      onChange(value());
    });
    refreshStyles();

    const colors = document.createElement("div");
    colors.className = "place-label-editor__colors";
    colors.append(field("Cor do texto", textColor), field("Cor da borda", borderColor));
    const styles = document.createElement("div");
    styles.className = "place-label-editor__styles";
    styles.append(field("Salvar estilo", styleName), savedStyles, styleActions);
    editor.append(title, field("Texto", name), field("Tamanho do texto (%)", scaleWrap), field("Posição do texto", position), field("Fonte", font), colors, borderField, visibleField, field("Ícone", icon), field("Tamanho do ícone (%)", iconScaleWrap), field("Posição do ícone", iconPosition), styles);
    return editor;
  }

  window.PlaceLabelEditor = Object.freeze({ create });
})();
