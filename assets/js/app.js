const { borderColors, placeTypes, terrainGroups, terrains } = window.MapCatalog;

    window.AppShell.mountApp(document.getElementById("app"));
    WorkspaceFeatures.mount();

    const reliefTool = document.createElement("button");
    reliefTool.dataset.tool = "relief";
    reliefTool.title = "Ajustar a altura visual dos hexes";
    reliefTool.textContent = "Relevo";
    document.querySelector('[data-tool="paint"]').after(reliefTool);
    const reliefSection = document.createElement("section");
    reliefSection.id = "reliefSection";
    reliefSection.className = "section context-section";
    reliefSection.hidden = true;
    reliefSection.innerHTML = '<h2>Relevo</h2><label class="range-row" for="reliefLevel">Altura: <span id="reliefLevelValue">1 nível</span><input id="reliefLevel" type="range" min="0" max="3" step="1" value="1"></label><p class="hint">Clique ou arraste pelos hexes desejados. Use 0 para remover o relevo.</p>';
    document.getElementById("terrainSection").after(reliefSection);
    const roadStyleRow = document.createElement("div");
    roadStyleRow.className = "form-row";
    roadStyleRow.innerHTML = '<label for="roadStyle">Estilo</label><select id="roadStyle"><option value="trail">Trilha</option><option value="simple" selected>Estrada simples</option><option value="main">Estrada principal</option></select>';
    document.getElementById("roadOptionsSection").prepend(roadStyleRow);
    const roadColorRow = document.createElement("div");
    roadColorRow.className = "form-row";
    roadColorRow.innerHTML = '<label for="roadColor">Cor da rua</label><input id="roadColor" type="color" value="#b78b4b">';
    roadStyleRow.after(roadColorRow);
    const roadWidthRow = document.createElement("label");
    roadWidthRow.className = "range-row";
    roadWidthRow.htmlFor = "roadWidth";
    roadWidthRow.innerHTML = 'Largura: <span id="roadWidthValue">100%</span><input id="roadWidth" type="range" min="50" max="220" value="100">';
    roadColorRow.after(roadWidthRow);
    const textStyleOptions = document.createElement("div");
    textStyleOptions.className = "feature-form-grid";
    textStyleOptions.innerHTML = '<div class="form-row"><label for="mapTextPreset">Preset</label><select id="mapTextPreset"><option value="region">Região</option><option value="city">Cidade</option><option value="subtle">Discreto</option></select></div><div class="form-row"><label for="mapTextBackgroundColor">Fundo</label><input id="mapTextBackgroundColor" type="color" value="#fff4d6"></div><div class="form-row"><label for="mapTextBorderColor">Borda</label><input id="mapTextBorderColor" type="color" value="#6f572f"></div><div class="form-row"><label for="mapTextFont">Fonte</label><select id="mapTextFont"><option value="Georgia, serif">Georgia</option><option value="Palatino Linotype, Palatino, serif">Palatino</option><option value="Times New Roman, serif">Times New Roman</option></select></div><label class="range-row" for="mapTextOutline">Contorno: <span id="mapTextOutlineValue">0 px</span><input id="mapTextOutline" type="range" min="0" max="8" value="0"></label><div class="form-row"><label for="mapTextOutlineColor">Cor do contorno</label><input id="mapTextOutlineColor" type="color" value="#fff9f0"></div><label class="range-row" for="mapTextGlow">Brilho: <span id="mapTextGlowValue">0 px</span><input id="mapTextGlow" type="range" min="0" max="16" value="0"></label><div class="form-row"><label for="mapTextGlowColor">Cor do brilho</label><input id="mapTextGlowColor" type="color" value="#ffffff"></div><div class="form-row"><label for="mapTextAlign">Alinhamento</label><select id="mapTextAlign"><option value="left">Esquerda</option><option value="center" selected>Centro</option><option value="right">Direita</option></select></div><label class="range-row" for="mapTextCurvature">Curvatura: <span id="mapTextCurvatureValue">0</span><input id="mapTextCurvature" type="range" min="-40" max="40" value="0"></label><label class="range-row" for="mapTextLetterSpacing">Espaçamento: <span id="mapTextLetterSpacingValue">0 px</span><input id="mapTextLetterSpacing" type="range" min="-4" max="16" value="0"></label><div class="toggle-row"><input id="mapTextSharp" type="checkbox"><label for="mapTextSharp">Nitidez de fonte</label></div><button id="deleteSelectedTextBtn" type="button" disabled>Excluir texto selecionado</button>';
    document.getElementById("textSection").querySelector(".hint").before(textStyleOptions);
    document.getElementById("mapTextShape").appendChild(new Option("Placa retangular", "rectangle"));
    document.getElementById("mapTextSharp").closest(".toggle-row").remove();

    const brand = document.querySelector(".brand");
    brand.querySelector(".mark + div").classList.add("brand-copy");
    brand.appendChild(document.querySelector(".options-wrap"));

    function addButtonIcon(id, icon) {
      const button = document.getElementById(id);
      if (!button) return;
      const label = button.textContent.trim();
      button.innerHTML = `<i class="bi bi-${icon}" aria-hidden="true"></i><span>${label}</span>`;
      button.classList.add("button-icon");
    }

    {
      const icons = {
        optionsBtn: "sliders2",
        menuNewMapBtn: "file-earmark-plus",
        mapOptionsBtn: "gear",
        savedMapsBtn: "collection",
        saveBtn: "floppy",
        exportJsonBtn: "filetype-json",
        undoBtn: "arrow-counterclockwise",
        redoBtn: "arrow-clockwise",
        exportPngBtn: "image",
        importBtn: "box-arrow-in-down",
        zoomOut: "dash-lg",
        zoomIn: "plus-lg",
        centerBtn: "bullseye"
      };
      Object.entries(icons).forEach(([id, icon]) => addButtonIcon(id, icon));
      document.querySelectorAll("[data-tool]").forEach(button => {
        const iconsByTool = { navigate: "arrows-move", paint: "brush", relief: "layers", place: "geo-alt", text: "type", road: "signpost-split", river: "water", erase: "eraser", select: "pencil-square" };
        const shortcutsByTool = { navigate: "N", paint: "P", relief: "H", place: "L", text: "T", road: "E", river: "I", erase: "A", select: "D" };
        const label = button.textContent.trim();
        button.innerHTML = `<i class="bi bi-${iconsByTool[button.dataset.tool]}" aria-hidden="true"></i><span>${label}</span>`;
        button.title += ` (${shortcutsByTool[button.dataset.tool]})`;
      });
    }

    const headerActions = document.createElement("div");
    headerActions.className = "options-menu-actions";
    ["saveBtn", "exportJsonBtn", "exportPngBtn", "importBtn", "importFile"].forEach(id => {
      headerActions.appendChild(document.getElementById(id));
    });
    document.getElementById("optionsMenu").appendChild(headerActions);

    document.querySelector('label[for="selectedName"]').textContent = "Texto no mapa";
    const textScaleRow = document.createElement("label");
    textScaleRow.className = "range-row text-size-control";
    textScaleRow.htmlFor = "selectedTextScale";
    textScaleRow.innerHTML = 'Tamanho do texto: <span id="selectedTextScaleValue">100%</span><input id="selectedTextScale" type="range" min="60" max="300" value="100">';
    document.getElementById("selectedName").closest(".form-row").after(textScaleRow);

    function addPercentInput(rangeId) {
      const range = document.getElementById(rangeId);
      const input = document.createElement("input");
      input.id = rangeId + "Input";
      input.type = "number";
      input.min = range.min;
      input.max = range.max;
      input.step = range.step || "1";
      input.value = range.value;
      input.setAttribute("aria-label", "Valor percentual");
      range.after(input);
      range.addEventListener("input", () => { input.value = range.value; });
      input.addEventListener("change", () => {
        const value = Math.max(Number(range.min), Math.min(Number(range.max), Number(input.value) || Number(range.min)));
        range.value = input.value = value;
        range.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }

    ["terrainIconScale", "placeIconScale", "roadWidth", "selectedTextScale"].forEach(addPercentInput);

    const editLabelSection = document.createElement("section");
    editLabelSection.id = "editLabelSection";
    editLabelSection.className = "section context-section";
    editLabelSection.hidden = true;
    editLabelSection.innerHTML = '<h2>Rótulo do local</h2><div id="editLabelEditor"></div>';
    document.querySelector(".left-panel > .section").after(editLabelSection);

    const canvas = document.getElementById("mapCanvas");
    const ctx = canvas.getContext("2d");
    const exportProgress = ExportProgressOverlay.mount();

    const iconImages = {};
    const iconLoadTasks = [];
    function loadCanvasSafeIcon(src) {
      const img = new Image();
      let finishLoading;
      iconLoadTasks.push(new Promise(resolve => { finishLoading = resolve; }));
      img.onload = () => { finishLoading(); draw(); };
      img.onerror = () => { finishLoading(); console.warn("Nao foi possivel carregar o icone", src); };
      // SVGs convertidos em data URL nao contaminam o canvas. No GitHub Pages
      // o fetch e same-origin; o fallback preserva os icones em file://.
      fetch(src)
        .then(response => {
          if (!response.ok) throw new Error("Icone indisponivel");
          return response.text();
        })
        .then(svg => { img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); })
        .catch(() => { img.src = src; });
      return img;
    }

    function waitForIcons() {
      return Promise.all(iconLoadTasks);
    }
    [...terrains, ...Object.values(placeTypes)].forEach(item => {
      iconImages[item.icon] = loadCanvasSafeIcon(item.icon);
    });

    const state = MapState.create();
    const defaultLayers = () => ({ terrain: true, terrainIcons: true, relief: true, places: true, labels: true, roads: true, rivers: true, grid: true, coordinates: false });

    let history;

    const els = {
      terrainGrid: document.getElementById("terrainGrid"),
      paintShowIcon: document.getElementById("paintShowIcon"),
      brushSize: document.getElementById("brushSize"),
      brushSizeValue: document.getElementById("brushSizeValue"),
      terrainIconScale: document.getElementById("terrainIconScale"),
      terrainIconScaleInput: document.getElementById("terrainIconScaleInput"),
      terrainIconScaleValue: document.getElementById("terrainIconScaleValue"),
      terrainIconScaleLabel: document.getElementById("terrainIconScaleLabel"),
      toolGrid: document.getElementById("toolGrid"),
      toolHint: document.getElementById("toolHint"),
      terrainSection: document.getElementById("terrainSection"),
      reliefSection: document.getElementById("reliefSection"),
      reliefLevel: document.getElementById("reliefLevel"),
      reliefLevelValue: document.getElementById("reliefLevelValue"),
      placeSection: document.getElementById("placeSection"),
      textSection: document.getElementById("textSection"),
      mapTextValue: document.getElementById("mapTextValue"),
      mapTextColor: document.getElementById("mapTextColor"),
      mapTextSize: document.getElementById("mapTextSize"),
      mapTextSizeValue: document.getElementById("mapTextSizeValue"),
      mapTextBackground: document.getElementById("mapTextBackground"),
      mapTextShape: document.getElementById("mapTextShape"),
      mapTextBackgroundColor: document.getElementById("mapTextBackgroundColor"),
      mapTextBorderColor: document.getElementById("mapTextBorderColor"),
      mapTextFont: document.getElementById("mapTextFont"),
      mapTextPreset: document.getElementById("mapTextPreset"),
      mapTextOutline: document.getElementById("mapTextOutline"),
      mapTextOutlineValue: document.getElementById("mapTextOutlineValue"),
      mapTextOutlineColor: document.getElementById("mapTextOutlineColor"),
      mapTextGlow: document.getElementById("mapTextGlow"),
      mapTextGlowValue: document.getElementById("mapTextGlowValue"),
      mapTextGlowColor: document.getElementById("mapTextGlowColor"),
      mapTextAlign: document.getElementById("mapTextAlign"),
      mapTextCurvature: document.getElementById("mapTextCurvature"),
      mapTextCurvatureValue: document.getElementById("mapTextCurvatureValue"),
      mapTextLetterSpacing: document.getElementById("mapTextLetterSpacing"),
      mapTextLetterSpacingValue: document.getElementById("mapTextLetterSpacingValue"),
      mapTextSharp: document.getElementById("mapTextSharp"),
      deleteSelectedTextBtn: document.getElementById("deleteSelectedTextBtn"),
      pathAssistSection: document.getElementById("pathAssistSection"),
      roadOptionsSection: document.getElementById("roadOptionsSection"),
      riverOptionsSection: document.getElementById("riverOptionsSection"),
      editLabelSection: document.getElementById("editLabelSection"),
      editLabelEditor: document.getElementById("editLabelEditor"),
      placeType: document.getElementById("placeType"),
      placePreviewIcon: document.getElementById("placePreviewIcon"),
      placePreviewName: document.getElementById("placePreviewName"),
      placeGrid: document.getElementById("placeGrid"),
      placeIconScale: document.getElementById("placeIconScale"),
      placeIconScaleInput: document.getElementById("placeIconScaleInput"),
      placeIconScaleValue: document.getElementById("placeIconScaleValue"),
      placeIconScaleLabel: document.getElementById("placeIconScaleLabel"),
      roadSnapToEdges: document.getElementById("roadSnapToEdges"),
      riverSnapToEdges: document.getElementById("riverSnapToEdges"),
      roadSelectExisting: document.getElementById("roadSelectExisting"),
      riverSelectExisting: document.getElementById("riverSelectExisting"),
      roadStyle: document.getElementById("roadStyle"),
      roadColor: document.getElementById("roadColor"),
      roadWidth: document.getElementById("roadWidth"),
      roadWidthInput: document.getElementById("roadWidthInput"),
      roadWidthValue: document.getElementById("roadWidthValue"),
      optionsBtn: document.getElementById("optionsBtn"),
      optionsMenu: document.getElementById("optionsMenu"),
      menuNewMapBtn: document.getElementById("menuNewMapBtn"),
      mapOptionsBtn: document.getElementById("mapOptionsBtn"),
      savedMapsBtn: document.getElementById("savedMapsBtn"),
      mapTitle: document.getElementById("mapTitle"),
      newMapModal: document.getElementById("newMapModal"),
      newMapName: document.getElementById("newMapName"),
      newMapCols: document.getElementById("newMapCols"),
      newMapRows: document.getElementById("newMapRows"),
      styleOptions: document.getElementById("styleOptions"),
      closeNewMapBtn: document.getElementById("closeNewMapBtn"),
      cancelNewMapBtn: document.getElementById("cancelNewMapBtn"),
      createMapBtn: document.getElementById("createMapBtn"),
      savedMapsModal: document.getElementById("savedMapsModal"),
      closeSavedMapsBtn: document.getElementById("closeSavedMapsBtn"),
      savedMapList: document.getElementById("savedMapList"),
      mapOptionsModal: document.getElementById("mapOptionsModal"),
      closeMapOptionsBtn: document.getElementById("closeMapOptionsBtn"),
      borderColorPalette: document.getElementById("borderColorPalette"),
      mapSizeLabel: document.getElementById("mapSizeLabel"),
      deleteSelectedPathBtn: document.getElementById("deleteSelectedPathBtn"),
      pathSelectionHint: document.getElementById("pathSelectionHint"),
      saveBtn: document.getElementById("saveBtn"),
      undoBtn: document.getElementById("undoBtn"),
      redoBtn: document.getElementById("redoBtn"),
      saveStatus: document.getElementById("saveStatus"),
      exportJsonBtn: document.getElementById("exportJsonBtn"),
      exportPngBtn: document.getElementById("exportPngBtn"),
      importBtn: document.getElementById("importBtn"),
      importFile: document.getElementById("importFile"),
      zoomIn: document.getElementById("zoomIn"),
      zoomOut: document.getElementById("zoomOut"),
      zoomBadge: document.getElementById("zoomBadge"),
      centerBtn: document.getElementById("centerBtn"),
      rightPanel: document.getElementById("rightPanel"),
      toggleRightPanelBtn: document.getElementById("toggleRightPanelBtn"),
      selectedCoord: document.getElementById("selectedCoord"),
      selectedName: document.getElementById("selectedName"),
      selectedTextScale: document.getElementById("selectedTextScale"),
      selectedTextScaleInput: document.getElementById("selectedTextScaleInput"),
      selectedTextScaleValue: document.getElementById("selectedTextScaleValue"),
      selectedType: document.getElementById("selectedType"),
      selectedNotes: document.getElementById("selectedNotes"),
      applyDetailsBtn: document.getElementById("applyDetailsBtn"),
      placeList: document.getElementById("placeList")
    };
    Object.assign(els, {
      layersBtn: document.getElementById("layersBtn"),
      layersModal: document.getElementById("layersModal"),
      legendBtn: document.getElementById("legendBtn"),
      legendModal: document.getElementById("legendModal"),
      legendPreview: document.getElementById("legendPreview"),
      legendNotes: document.getElementById("legendNotes"),
      styleLibraryBtn: document.getElementById("styleLibraryBtn"),
      styleLibraryModal: document.getElementById("styleLibraryModal"),
      styleProfileName: document.getElementById("styleProfileName"),
      saveStyleProfileBtn: document.getElementById("saveStyleProfileBtn"),
      styleProfileList: document.getElementById("styleProfileList"),
      helpBtn: document.getElementById("helpBtn"),
      helpModal: document.getElementById("helpModal"),
      exportOptionsModal: document.getElementById("exportOptionsModal"),
      exportFormat: document.getElementById("exportFormat"),
      exportResolution: document.getElementById("exportResolution"),
      exportTitle: document.getElementById("exportTitle"),
      exportLegend: document.getElementById("exportLegend"),
      exportBackground: document.getElementById("exportBackground"),
      exportCoordinates: document.getElementById("exportCoordinates"),
      exportGrid: document.getElementById("exportGrid"),
      confirmExportBtn: document.getElementById("confirmExportBtn")
    });

    els.newMapCols.max = 300;
    els.newMapRows.max = 200;

    const { hash, hexCorners, hexPath, hexToPixel, key, neighborEdges, parseKey, pixelToHex, pixelToWorld, snapPathPoint, worldToPixel } = MapGeometry.create(state);
    function terrainById(id) {
      const legacyId = { hill: "hills", desert: "sand" }[id] || id;
      return terrains.find(t => t.id === legacyId) || terrains[0];
    }
    function terrainGroupFor(id) { return terrainGroups.find(group => group.terrains.includes(id)) || terrainGroups[0]; }
    function isOldSchool() { return state.mapStyle === "oldschool"; }
    function displayColor(color) {
      return isOldSchool() ? "#ffffff" : color;
    }

    function oldSchoolTerrainColor(terrain) {
      const tones = {
        grass: "#d0d0d0",
        forest: "#bcbcbc",
        denseForest: "#aaaaaa",
        willowForest: "#c4c4c4",
        deadForest: "#a6a6a6",
        hills: "#c0c0c0",
        mountain: "#969696",
        volcano: "#858585",
        water: "#b8b8b8",
        ocean: "#a0a0a0",
        swamp: "#b2b2b2",
        mushroom: "#bebebe",
        sand: "#dddddd",
        snow: "#e5e5e5"
      };
      return tones[terrain.id] || "#d0d0d0";
    }
    function cellAt(q, r) {
      const k = key(q, r);
      if (!state.cells[k]) state.cells[k] = { terrain: "grass", showIcon: true, place: null, roads: [], rivers: [], notes: "", elevation: 0 };
      return state.cells[k];
    }

    function seedMap() {
      state.cells = {};
      for (let r = 0; r < state.rows; r++) {
        for (let q = 0; q < state.cols; q++) {
          let terrain = "grass";
          const cx = q / state.cols;
          const cy = r / state.rows;
          if (cy < .16 && Math.sin(q * .9) > -.2) terrain = "mountain";
          if (cx < .22 && cy > .25 && cy < .75) terrain = "forest";
          if (cx > .72 && cy > .62) terrain = "sand";
          if (Math.abs(q - (10 + Math.sin(r * .7) * 2)) < 1 && r > 2) terrain = "water";
          cellAt(q, r).terrain = terrain;
        }
      }
      cellAt(8, 9).place = { name: "Porto Velho", type: "settlement" };
      cellAt(15, 6).place = { name: "Torre Alta", type: "tower" };
      state.paths = [
        { type: "road", points: [[8.1, 9.05], [9.25, 8.85], [10.4, 8.35], [11.55, 8.05], [12.7, 7.5], [13.85, 7.1], [15.0, 6.05]] },
        { type: "river", points: [[10.2, 3.0], [11.0, 4.2], [10.25, 5.65], [9.55, 7.0], [10.4, 8.2], [11.25, 9.5], [10.4, 11.2], [9.8, 13.1], [10.65, 15.0]] }
      ];
    }

    function addConnection(q1, r1, q2, r2, type) {
      const a = cellAt(q1, r1);
      const b = cellAt(q2, r2);
      const listA = type === "road" ? a.roads : a.rivers;
      const listB = type === "road" ? b.roads : b.rivers;
      const k2 = key(q2, r2);
      const k1 = key(q1, r1);
      if (!listA.includes(k2)) listA.push(k2);
      if (!listB.includes(k1)) listB.push(k1);
    }

    function removeCellConnections(q, r) {
      const target = key(q, r);
      Object.entries(state.cells).forEach(([k, cell]) => {
        cell.roads = (cell.roads || []).filter(x => x !== target);
        cell.rivers = (cell.rivers || []).filter(x => x !== target);
        if (k === target) {
          cell.roads = [];
          cell.rivers = [];
        }
      });
    }

    function shade(hex, amount) {
      const n = parseInt(hex.slice(1), 16);
      let r = (n >> 16) + amount;
      let g = ((n >> 8) & 255) + amount;
      let b = (n & 255) + amount;
      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function renderNow() {
      const rect = canvas.getBoundingClientRect();
      const range = MapRenderPerformance.visibleRange(rect, state, pixelToWorld);
      const quality = state.isExporting ? "detail" : MapRenderPerformance.detailLevel(state.scale);
      ctx.clearRect(0, 0, rect.width, rect.height);
      if (!state.isExporting || state.exportBackground !== false) {
        ctx.fillStyle = isOldSchool() ? "#d8d8d8" : "#f4ecd9";
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
      MapRenderPerformance.forEachCell(range, (q, r) => drawHex(q, r, quality));
      if (state.layers.terrain) {
        BiomeBorderRenderer.draw(ctx, {
          state, cellAt, terrainById, neighborEdges, hexToPixel, hexCorners,
          displayColor, blendColors, hash, isOldSchool, range, quality
        });
      }
      if (state.layers.relief) drawElevationEdges(range);
      ctx.save();
      clipToMap(range);
      if (state.layers.rivers) {
        drawLegacyConnections("river", range);
        drawFreePaths("river");
      }
      if (state.layers.roads) {
        drawLegacyConnections("road", range);
        drawFreePaths("road");
      }
      if (state.layers.places) drawPlaces(range);
      ctx.restore();
      drawSelectedHex();
      drawMapTexts();
      drawBrushPreview();
      if (state.layers.labels) drawPlaceLabels(range);
      if (state.layers.coordinates) drawCoordinates(range);
    }

    const scheduleRender = MapRenderPerformance.createFrameScheduler(renderNow);
    function draw() { scheduleRender(); }

    function clipToMap(range) {
      ctx.beginPath();
      MapRenderPerformance.forEachCell(range, (q, r) => {
          const p = hexToPixel(q, r);
          hexCorners(p.x, p.y, state.hexSize * state.scale - .8).forEach(([x, y], index) => {
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
      });
      ctx.clip();
    }

    function drawLegacyConnections(type, range) {
      ctx.save();
      ctx.lineCap = "butt";
      ctx.lineJoin = "round";
      ctx.strokeStyle = isOldSchool() ? "#000000" : (type === "road" ? blendColors(state.roadColor, "#28170b", .55) : "rgba(36, 111, 174, .92)");
      ctx.lineWidth = (type === "road" ? 6 : 8) * state.scale;
      const seen = new Set();
      MapRenderPerformance.forEachCell(range, (q1, r1) => {
        const from = key(q1, r1);
        const cell = cellAt(q1, r1);
        const list = type === "road" ? cell.roads || [] : cell.rivers || [];
        const p1 = hexToPixel(q1, r1);
        list.forEach(to => {
          const id = [from, to].sort().join("|");
          if (seen.has(id)) return;
          seen.add(id);
          const [q2, r2] = parseKey(to);
          const p2 = hexToPixel(q2, r2);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          if (type === "river") {
            ctx.quadraticCurveTo(mx + Math.sin((q1 + r1) * 2) * 8, my + Math.cos((q2 + r2) * 2) * 8, p2.x, p2.y);
          } else {
            ctx.lineTo(p2.x, p2.y);
          }
          ctx.stroke();
          if (type === "road") {
            ctx.strokeStyle = isOldSchool() ? "#ffffff" : blendColors(state.roadColor, "#ffffff", .48);
            ctx.lineWidth = 2.2 * state.scale;
            ctx.stroke();
            ctx.strokeStyle = isOldSchool() ? "#000000" : blendColors(state.roadColor, "#28170b", .55);
            ctx.lineWidth = 6 * state.scale;
          }
        });
      });
      ctx.restore();
    }

    function drawFreePaths(type) {
      const paths = [...(state.paths || []), state.currentPath].filter(path => path && path.type === type && path.points.length > 1);
      paths.forEach(path => {
        ctx.save();
        ctx.lineCap = "butt";
        ctx.lineJoin = "round";
        const strokePath = path.snapToEdges ? strokeLinearPath : strokeSmoothPath;
        if (type === "river") {
          strokePath(path.points, isOldSchool() ? "#000000" : "rgba(31, 82, 128, .78)", 9 * state.scale);
          strokePath(path.points, isOldSchool() ? "#ffffff" : "rgba(83, 157, 205, .95)", 3 * state.scale);
          if (!isOldSchool()) strokePath(path.points, "rgba(168, 220, 238, .85)", 2.2 * state.scale);
        } else {
          const style = path.style || "simple";
          const width = Math.max(.5, Math.min(2.2, Number(path.width) || state.roadWidth || 1));
          const color = /^#[0-9a-f]{6}$/i.test(path.color || "") ? path.color : state.roadColor;
          if (style === "trail") {
            ctx.setLineDash([2 * state.scale, 6 * state.scale]);
            strokePath(path.points, isOldSchool() ? "#000000" : blendColors(color, "#382311", .45), 3 * width * state.scale);
          } else if (style === "main") {
            strokePath(path.points, isOldSchool() ? "#000000" : blendColors(color, "#28170b", .6), 12 * width * state.scale);
            strokePath(path.points, isOldSchool() ? "#ffffff" : color, 7 * width * state.scale);
            strokePath(path.points, isOldSchool() ? "#000000" : blendColors(color, "#ffffff", .62), 1.6 * width * state.scale);
          } else {
            strokePath(path.points, isOldSchool() ? "#000000" : blendColors(color, "#28170b", .55), 7 * width * state.scale);
            strokePath(path.points, isOldSchool() ? "#ffffff" : color, 3 * width * state.scale);
            if (!isOldSchool()) strokePath(path.points, blendColors(color, "#ffffff", .45), 1.6 * width * state.scale);
          }
        }
        ctx.restore();
      });
      if (state.selectedPathIndex !== null) {
        const selected = state.paths[state.selectedPathIndex];
        if (selected && selected.type === type) {
          (selected.snapToEdges ? strokeLinearPath : strokeSmoothPath)(selected.points, "rgba(255,255,255,.94)", 1.5 * state.scale);
          drawPathEndpoints(selected, type);
        }
      } else if (state.currentPath && state.currentPath.type === type) {
        drawPathEndpoints(state.currentPath, type);
      }
    }

    function drawMapTexts() {
      MapTextRenderer.draw(ctx, { state, worldToPixel });
    }

    function drawPathEndpoints(path, type) {
      if (!path.points || path.points.length < 2) return;
      ctx.save();
      path.points.slice(0, 1).concat(path.points.slice(-1)).forEach(point => {
        const pixel = worldToPixel(point);
        ctx.beginPath();
        ctx.fillStyle = type === "river" ? "#4e9bd0" : "#c18a42";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(2, 2 * state.scale);
        ctx.arc(pixel.x, pixel.y, Math.max(6, 6 * state.scale), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    }

    function strokeSmoothPath(points, color, width) {
      if (points.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      const pixels = points.map(worldToPixel);
      ctx.moveTo(pixels[0].x, pixels[0].y);
      for (let i = 0; i < pixels.length - 1; i++) {
        const previous = pixels[Math.max(0, i - 1)];
        const current = pixels[i];
        const next = pixels[i + 1];
        const following = pixels[Math.min(pixels.length - 1, i + 2)];
        const control1 = {
          x: current.x + (next.x - previous.x) / 6,
          y: current.y + (next.y - previous.y) / 6
        };
        const control2 = {
          x: next.x - (following.x - current.x) / 6,
          y: next.y - (following.y - current.y) / 6
        };
        ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, next.x, next.y);
      }
      ctx.stroke();
    }

    function strokeLinearPath(points, color, width) {
      if (points.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      const first = worldToPixel(points[0]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < points.length; i++) {
        const point = worldToPixel(points[i]);
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    }

    function drawHex(q, r, quality) {
      const cell = cellAt(q, r);
      const p = hexToPixel(q, r);
      const size = state.hexSize * state.scale - .8;
      const terrain = terrainById(cell.terrain);
      const path = hexPath(p.x, p.y, size);
      const baseColor = isOldSchool() ? oldSchoolTerrainColor(terrain) : displayColor(terrain.color);
      const variation = Math.round((hash(q, r, 1) - .5) * (isOldSchool() ? 10 : 8));
      ctx.fillStyle = state.layers.terrain ? shade(baseColor, variation) : (isOldSchool() ? "#eeeeee" : "#efe9de");
      ctx.fill(path);
      if (quality === "detail") drawPaperTexture(q, r, p.x, p.y, size);
      const isLargeMap = !state.isExporting && state.cols * state.rows > 40 * 40;
      const iconDensity = isLargeMap ? .2 : quality === "standard" ? .5 : 1;
      const previewIcon = quality !== "overview" && hash(q, r, 703) < iconDensity;
      if (state.layers.terrainIcons && previewIcon && cell.showIcon !== false && !(isOldSchool() && terrain.id === "grass")) {
        const iconQualityScale = isLargeMap ? .72 : quality === "detail" ? 1 : .7;
        const iconOpacity = isLargeMap ? .46 : .78;
        drawSvgIcon(terrain.icon, p.x, p.y, size * .48 * iconQualityScale * (state.terrainIconScales[terrainGroupFor(terrain.id).id] || state.terrainIconScales[terrain.id] || state.terrainIconScale), iconOpacity);
      }
      if (state.layers.grid && state.borderColor !== "none") {
        ctx.strokeStyle = isOldSchool() ? "#000000" : state.borderColor;
        ctx.lineWidth = Math.max(.6, .75 * state.scale);
        ctx.stroke(path);
      }
    }

    function drawElevationEdges(range) {
      const size = state.hexSize * state.scale - .8;
      MapRenderPerformance.forEachCell(range, (q, r) => {
        const cell = cellAt(q, r);
        const elevation = Math.max(0, Math.min(3, Number(cell.elevation) || 0));
        if (!elevation) return;
        const center = hexToPixel(q, r);
        const corners = hexCorners(center.x, center.y, size);
        const terrain = terrainById(cell.terrain);
        const terrainColor = isOldSchool() ? oldSchoolTerrainColor(terrain) : displayColor(terrain.color);
        neighborEdges(q, r).forEach(({ q: neighborQ, r: neighborR, edge }) => {
          if (neighborQ < 0 || neighborR < 0 || neighborQ >= state.cols || neighborR >= state.rows) return;
          const neighborElevation = Math.max(0, Math.min(3, Number(cellAt(neighborQ, neighborR).elevation) || 0));
          const difference = elevation - neighborElevation;
          if (difference <= 0) return;
          const neighborCenter = hexToPixel(neighborQ, neighborR);
          const offset = Math.min(size * .22, difference * 3.4 * state.scale);
          const dx = (neighborCenter.x - center.x) / Math.max(1, Math.hypot(neighborCenter.x - center.x, neighborCenter.y - center.y)) * offset;
          const dy = (neighborCenter.y - center.y) / Math.max(1, Math.hypot(neighborCenter.x - center.x, neighborCenter.y - center.y)) * offset;
          const a = corners[edge];
          const b = corners[(edge + 1) % 6];
          ctx.save();
          const midpointX = (a[0] + b[0]) / 2;
          const midpointY = (a[1] + b[1]) / 2;
          const gradient = ctx.createLinearGradient(midpointX, midpointY, midpointX + dx, midpointY + dy);
          gradient.addColorStop(0, isOldSchool() ? "#b8b8b8" : shade(terrainColor, -8));
          gradient.addColorStop(1, isOldSchool() ? "#686868" : shade(terrainColor, -42));
          ctx.globalAlpha = isOldSchool() ? .72 : .42;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.lineTo(b[0] + dx, b[1] + dy);
          ctx.lineTo(a[0] + dx, a[1] + dy);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = isOldSchool() ? .8 : .58;
          ctx.strokeStyle = isOldSchool() ? "#303030" : shade(terrainColor, -32);
          ctx.lineWidth = Math.max(.9, 1.1 * state.scale);
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.stroke();
          ctx.globalAlpha = isOldSchool() ? .35 : .25;
          ctx.strokeStyle = isOldSchool() ? "#f0f0f0" : shade(terrainColor, 24);
          ctx.lineWidth = Math.max(.65, .75 * state.scale);
          ctx.beginPath();
          ctx.moveTo(a[0] + dx, a[1] + dy);
          ctx.lineTo(b[0] + dx, b[1] + dy);
          ctx.stroke();
          ctx.restore();
        });
      });
    }

    function drawOrganicTexture(q, r, x, y, size, terrain) {
      const path = hexPath(x, y, size);
      ctx.save();
      ctx.clip(path);
      ctx.globalAlpha = .14;
      for (let i = 0; i < 7; i++) {
        const px = x + (hash(q, r, i + 10) - .5) * size * 1.55;
        const py = y + (hash(q, r, i + 30) - .5) * size * 1.2;
        const radius = size * (.18 + hash(q, r, i + 50) * .34);
        ctx.fillStyle = i % 2 ? "#fff7d8" : "#352b1e";
        ctx.beginPath();
        ctx.ellipse(px, py, radius * 1.4, radius, hash(q, r, i + 80) * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = .22;
      ctx.strokeStyle = shade(terrain.edge, -10);
      ctx.lineWidth = Math.max(1, size * .035);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const yy = y - size * .35 + i * size * .28 + (hash(q, r, i + 100) - .5) * 8;
        ctx.moveTo(x - size * .55, yy);
        ctx.bezierCurveTo(x - size * .2, yy + 8, x + size * .15, yy - 8, x + size * .55, yy + 3);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawPaperTexture(q, r, x, y, size) {
      const path = hexPath(x, y, size);
      ctx.save();
      ctx.clip(path);
      const oldSchool = isOldSchool();
      const count = oldSchool ? 20 : 12;
      for (let i = 0; i < count; i++) {
        const px = x + (hash(q, r, i + 500) - .5) * size * 1.45;
        const py = y + (hash(q, r, i + 700) - .5) * size * 1.25;
        const radius = oldSchool ? .55 + hash(q, r, i + 900) * 1.05 : .42 + hash(q, r, i + 900) * .9;
        ctx.globalAlpha = oldSchool ? .045 + hash(q, r, i + 1000) * .035 : .035 + hash(q, r, i + 1000) * .025;
        ctx.fillStyle = oldSchool
          ? (i % 3 === 0 ? "#4a4a4a" : "#f4f4f4")
          : (i % 3 === 0 ? "#2a2418" : "#fff2c8");
        ctx.beginPath();
        ctx.arc(px, py, radius * state.scale, 0, Math.PI * 2);
        ctx.fill();
      }
      if (oldSchool) {
        ctx.globalAlpha = .08;
        ctx.strokeStyle = "#666666";
        ctx.lineWidth = Math.max(.35, state.scale * .35);
        for (let i = 0; i < 3; i++) {
          const yy = y - size * .45 + (i + 1) * size * .3 + (hash(q, r, i + 1200) - .5) * 4;
          ctx.beginPath();
          ctx.moveTo(x - size * .7, yy);
          ctx.bezierCurveTo(x - size * .3, yy - 2, x + size * .15, yy + 2, x + size * .7, yy - 1);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function blendColors(a, b, amount) {
      const pa = parseInt(a.slice(1), 16);
      const pb = parseInt(b.slice(1), 16);
      const ar = pa >> 16, ag = (pa >> 8) & 255, ab = pa & 255;
      const br = pb >> 16, bg = (pb >> 8) & 255, bb = pb & 255;
      const r = Math.round(ar + (br - ar) * amount);
      const g = Math.round(ag + (bg - ag) * amount);
      const bl = Math.round(ab + (bb - ab) * amount);
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
    }

    function drawSelectedHex() {
      if (!state.selected) return;
      const { q, r } = state.selected;
      const p = hexToPixel(q, r);
      const size = state.hexSize * state.scale - .8;
      const path = hexPath(p.x, p.y, size);
      ctx.save();
      ctx.strokeStyle = "#f7f3ea";
      ctx.lineWidth = 5;
      ctx.stroke(path);
      ctx.strokeStyle = isOldSchool() ? "#33322f" : "#1f6e69";
      ctx.lineWidth = 2;
      ctx.stroke(path);
      ctx.restore();
    }

    function drawBrushPreview() {
      if ((state.tool !== "paint" && state.tool !== "relief") || !state.hoveredBrush) return;
      ctx.save();
      ctx.strokeStyle = state.tool === "relief" ? "rgba(123, 79, 32, .95)" : "rgba(214, 47, 47, .95)";
      ctx.lineWidth = Math.max(2, 2.5 * state.scale);
      ctx.setLineDash([6 * state.scale, 4 * state.scale]);
      cellsInBrush(state.hoveredBrush.q, state.hoveredBrush.r).forEach(({ q, r }) => {
        const p = hexToPixel(q, r);
        ctx.stroke(hexPath(p.x, p.y, state.hexSize * state.scale - 2));
      });
      ctx.restore();
    }

    function drawSvgIcon(src, x, y, size, alpha = .85) {
      const img = iconImages[src];
      if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      ctx.restore();
    }

    function drawPlace(place, x, y, size) {
      const type = placeTypes[place.type] || placeTypes.settlement;
      ctx.save();
      const hasVisibleLabel = Boolean(place.name) && place.showLabel !== false;
      const badgeY = place.iconPosition === "center" || (place.iconPosition !== "top" && !hasVisibleLabel) ? y : y - size * .2;
      const iconScale = place.iconScale || state.placeIconScales[place.type] || 1;
      const radius = size * .34 * Math.max(1, iconScale * .92);
      if (place.iconBackgroundEnabled !== false) {
        ctx.shadowColor = "rgba(58, 35, 18, .28)";
        ctx.shadowBlur = 4 * state.scale;
        ctx.fillStyle = place.iconBackgroundColor || (isOldSchool() ? "#ffffff" : "rgba(209, 173, 102, .7)");
        ctx.beginPath();
        ctx.arc(x, badgeY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = Math.max(2, 3 * state.scale);
        ctx.strokeStyle = place.iconBorderColor || (isOldSchool() ? "#000000" : "rgba(88, 54, 27, .74)");
        ctx.stroke();
        ctx.lineWidth = Math.max(1, 1.3 * state.scale);
        ctx.strokeStyle = place.iconBorderColor || (isOldSchool() ? "#000000" : "rgba(255, 234, 176, .72)");
        ctx.beginPath();
        ctx.arc(x, badgeY, radius - 4 * state.scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      drawSvgIcon(type.icon, x, badgeY, size * .48 * iconScale, .96);
      ctx.restore();
    }

    function drawPlaces(range) {
      MapRenderPerformance.forEachCell(range, (q, r) => {
        const cell = cellAt(q, r);
        if (!cell.place) return;
        const p = hexToPixel(q, r);
        drawPlace(cell.place, p.x, p.y, state.hexSize * state.scale - .8);
      });
    }

    function drawPlaceLabels(range) {
      if (state.scale <= .6) return;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      MapRenderPerformance.forEachCell(range, (q, r) => {
        const cell = cellAt(q, r);
        if (!cell.place || !cell.place.name) return;
        const p = hexToPixel(q, r);
        const text = cell.place.name;
        const textScale = Math.max(.6, Math.min(3, Number(cell.place.textScale) || 1));
        const fontSize = Math.max(12, Math.min(96, 24 * state.scale * textScale));
        if (cell.place.showLabel === false) return;
        const isAbove = cell.place.labelPosition === "top";
        const y = isAbove ? p.y - state.hexSize * state.scale * .58 : p.y + state.hexSize * state.scale * .18;
        ctx.textBaseline = isAbove ? "bottom" : "top";
        ctx.font = "600 " + fontSize + "px " + (cell.place.labelFont || "Georgia, serif");
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.shadowColor = "transparent";
        if (cell.place.labelBorder !== false) {
          ctx.lineWidth = Math.max(5, fontSize * .3);
          ctx.strokeStyle = cell.place.borderColor || (isOldSchool() ? "#ffffff" : "#fff9f0");
          ctx.strokeText(text, p.x, y);
        }
        ctx.fillStyle = cell.place.textColor || (isOldSchool() ? "#151513" : "#3b2318");
        ctx.fillText(text, p.x, y);
      });
      ctx.restore();
    }

    function drawCoordinates(range) {
      if (state.scale < .55 && !state.isExporting) return;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.max(8, 9 * state.scale)}px Inter, sans-serif`;
      ctx.fillStyle = isOldSchool() ? "rgba(0,0,0,.58)" : "rgba(62,48,32,.55)";
      MapRenderPerformance.forEachCell(range, (q, r) => {
        const point = hexToPixel(q, r);
        ctx.fillText(columnLabel(q) + (r + 1), point.x, point.y + state.hexSize * state.scale * .62);
      });
      ctx.restore();
    }

    function columnLabel(index) {
      let value = index + 1;
      let label = "";
      while (value > 0) {
        value -= 1;
        label = String.fromCharCode(65 + value % 26) + label;
        value = Math.floor(value / 26);
      }
      return label;
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    }

    function setTool(tool) {
      state.tool = tool;
      state.lastPathCell = null;
      state.activePathKey = null;
      const selectedPath = state.paths[state.selectedPathIndex];
      if (!["select", "road", "river"].includes(tool) || (tool !== "select" && selectedPath && selectedPath.type !== tool)) {
        clearPathSelection();
      }
      if (tool !== "paint") state.hoveredBrush = null;
      document.querySelectorAll("[data-tool]").forEach(btn => btn.classList.toggle("active", btn.dataset.tool === tool));
      els.terrainSection.hidden = tool !== "paint";
      els.reliefSection.hidden = tool !== "relief";
      els.placeSection.hidden = tool !== "place";
      els.textSection.hidden = tool !== "text";
      els.pathAssistSection.hidden = tool !== "road" && tool !== "river";
      els.roadOptionsSection.hidden = tool !== "road";
      els.riverOptionsSection.hidden = tool !== "river";
      if (tool === "road") state.snapToEdges = state.roadSnapToEdges;
      if (tool === "river") state.snapToEdges = state.riverSnapToEdges;
      state.selectExistingPaths = tool === "road" ? state.roadSelectExisting : tool === "river" ? state.riverSelectExisting : false;
      els.editLabelSection.hidden = tool !== "select";
      els.toolHint.textContent = tool === "navigate"
        ? "Arraste para navegar pelo mapa. Esta ferramenta não seleciona nem altera elementos."
        : tool === "relief"
          ? "Clique ou arraste para aplicar a altura escolhida aos hexes."
          : tool === "select"
            ? "Clique para editar um local ou arraste-o para um hex vazio."
            : tool === "text"
              ? "Escreva um título e clique no mapa para criar um texto de região."
            : "Arraste para pintar. Em rua ou rio, arraste livremente para desenhar curvas.";
      updatePathSelectionUi();
      if (tool === "select") renderSelectedLabelEditor();
      draw();
    }

    function makeSectionsCollapsible() {
      document.querySelectorAll("aside .section > h2").forEach(heading => {
        const section = heading.parentElement;
        const content = document.createElement("div");
        content.className = "section-content";
        while (heading.nextSibling) content.appendChild(heading.nextSibling);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "section-toggle";
        button.textContent = heading.textContent;
        button.setAttribute("aria-expanded", "true");
        button.addEventListener("click", () => {
          const collapsed = section.classList.toggle("is-collapsed");
          button.setAttribute("aria-expanded", String(!collapsed));
        });
        heading.replaceChildren(button);
        section.appendChild(content);
      });
    }

    function toggleRightPanel() {
      const minimized = els.rightPanel.classList.toggle("is-minimized");
      document.querySelector(".app").classList.toggle("right-panel-minimized", minimized);
      els.toggleRightPanelBtn.innerHTML = `<i class="bi bi-chevron-${minimized ? "left" : "right"}" aria-hidden="true"></i>`;
      const label = minimized ? "Mostrar painel lateral" : "Minimizar painel lateral";
      els.toggleRightPanelBtn.title = label;
      els.toggleRightPanelBtn.setAttribute("aria-label", label);
      els.toggleRightPanelBtn.setAttribute("aria-expanded", String(!minimized));
      resizeCanvas();
    }

    function setTerrain(id) {
      state.terrain = id;
      document.querySelectorAll("[data-terrain]").forEach(btn => btn.classList.toggle("active", btn.dataset.terrain === id));
      updateTerrainScaleControl();
    }

    function updateTerrainScaleControl() {
      const terrain = terrainById(state.terrain);
      const group = terrainGroupFor(terrain.id);
      const value = Math.round((state.terrainIconScales[group.id] || state.terrainIconScales[terrain.id] || state.terrainIconScale) * 100);
      els.terrainIconScaleLabel.textContent = "Tamanho dos icones de " + group.name;
      els.terrainIconScale.value = value;
      els.terrainIconScaleInput.value = value;
      els.terrainIconScaleValue.textContent = value + "%";
    }

    function updatePlacePreview() {
      const type = placeTypes[els.placeType.value] || placeTypes.settlement;
      els.placePreviewIcon.src = type.icon;
      els.placePreviewName.textContent = type.label;
      document.querySelectorAll("[data-place]").forEach(button => button.classList.toggle("active", button.dataset.place === els.placeType.value));
      const value = Math.round((state.placeIconScales[els.placeType.value] || 1) * 100);
      els.placeIconScaleLabel.textContent = "Tamanho do icone de " + type.label;
      els.placeIconScale.value = value;
      els.placeIconScaleInput.value = value;
      els.placeIconScaleValue.textContent = value + "%";
    }

    function populatePlaceTypes() {
      const fill = (select) => {
        const selected = select.value;
        select.replaceChildren();
        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = "Sem construcao";
        select.appendChild(empty);
        Object.entries(placeTypes).forEach(([id, type]) => {
          const option = document.createElement("option");
          option.value = id;
          option.textContent = type.label;
          select.appendChild(option);
        });
        select.value = placeTypes[selected] || selected === "" ? selected : "";
      };
      fill(els.selectedType);
    }

    function createChoice(item, attribute, onClick) {
      const button = document.createElement("button");
      button.className = "terrain icon-choice";
      button.dataset[attribute] = item.id;
      button.innerHTML = '<img alt=""><span></span>';
      button.querySelector("img").src = item.icon;
      button.querySelector("img").alt = item.name || item.label;
      button.querySelector("span").textContent = item.name || item.label;
      button.addEventListener("click", onClick);
      return button;
    }

    function buildTerrainPalette() {
      els.terrainGrid.replaceChildren();
      terrainGroups.forEach(groupData => {
        const group = document.createElement("div");
        group.className = "palette-group";
        const title = document.createElement("h3");
        title.textContent = groupData.name;
        const grid = document.createElement("div");
        grid.className = "terrain-grid";
        groupData.terrains.map(terrainById).forEach(terrain => grid.appendChild(createChoice(terrain, "terrain", () => { setTerrain(terrain.id); setTool("paint"); })));
        group.append(title, grid);
        els.terrainGrid.appendChild(group);
      });
    }

    function buildPlacePalette() {
      const groups = [
        ["Assentamentos", ["settlement", "hut", "house", "camp", "windmill"]],
        ["Fortificacoes", ["castle", "citadel", "tower"]],
        ["Marcos", ["temple", "ruins", "mine", "pier", "bridge", "signpost", "galleon"]]
      ];
      els.placeGrid.replaceChildren();
      groups.forEach(([name, ids]) => {
        const group = document.createElement("div");
        group.className = "palette-group";
        const title = document.createElement("h3");
        title.textContent = name;
        const grid = document.createElement("div");
        grid.className = "terrain-grid";
        ids.map(id => ({ id, ...placeTypes[id] })).forEach(place => grid.appendChild(createChoice(place, "place", () => {
          els.placeType.value = place.id;
          updatePlacePreview();
          document.querySelectorAll("[data-place]").forEach(button => button.classList.toggle("active", button.dataset.place === place.id));
        })));
        group.append(title, grid);
        els.placeGrid.appendChild(group);
      });
    }

    function handleCell(cellPos) {
      if (!cellPos) return;
      const { q, r } = cellPos;
      state.selected = { q, r };
      if (state.tool === "paint") {
        cellsInBrush(q, r).forEach(({ q: brushQ, r: brushR }) => {
          const cell = cellAt(brushQ, brushR);
          cell.terrain = state.terrain;
          cell.showIcon = state.paintShowIcon;
        });
      } else if (state.tool === "place") {
        const cell = cellAt(q, r);
        cell.place = { name: "", type: els.placeType.value };
      } else if (state.tool === "relief") {
        cellsInBrush(q, r).forEach(({ q: brushQ, r: brushR }) => {
          cellAt(brushQ, brushR).elevation = state.reliefLevel;
        });
      } else if (state.tool === "erase") {
        cellsInBrush(q, r).forEach(({ q: brushQ, r: brushR }) => {
          const cell = cellAt(brushQ, brushR);
          cell.place = null;
          cell.notes = "";
          cell.terrain = "grass";
          cell.elevation = 0;
          removeCellConnections(brushQ, brushR);
        });
      }
      syncDetails();
      updatePlaces();
      scheduleSave();
      draw();
    }

    function movePlace(source, target) {
      if (source.q === target.q && source.r === target.r) return false;
      const sourceCell = cellAt(source.q, source.r);
      const targetCell = cellAt(target.q, target.r);
      if (!sourceCell.place || targetCell.place) return false;
      targetCell.place = sourceCell.place;
      sourceCell.place = null;
      state.selected = { q: target.q, r: target.r };
      syncDetails();
      updatePlaces();
      scheduleSave();
      draw();
      return true;
    }

    function cellsInBrush(q, r) {
      if (state.brushSize === 1) return [{ q, r }];
      const origin = hexToPixel(q, r);
      const reach = state.hexSize * state.scale * Math.sqrt(3) * (state.brushSize - .35);
      const cells = [];
      for (let row = 0; row < state.rows; row++) {
        for (let col = 0; col < state.cols; col++) {
          const point = hexToPixel(col, row);
          if (Math.hypot(point.x - origin.x, point.y - origin.y) <= reach) cells.push({ q: col, r: row });
        }
      }
      return cells;
    }

    function syncRoadAppearanceControls(path) {
      const road = path?.type === "road" ? path : null;
      els.roadColor.disabled = !road;
      els.roadWidth.disabled = !road;
      if (!road) return;
      els.roadColor.value = /^#[0-9a-f]{6}$/i.test(road.color || "") ? road.color : state.roadColor;
      const width = Math.round((Number(road.width) || state.roadWidth || 1) * 100);
      els.roadWidth.value = width;
      els.roadWidthInput.value = width;
      els.roadWidthValue.textContent = width + "%";
    }

    const textTool = MapTextToolController.create({
      state, els, pixelToWorld, worldToPixel, recordHistory, scheduleSave, draw
    });
    const {
      applyPreset: applyMapTextPreset,
      beginInteraction: beginMapTextInteraction,
      deleteSelected: deleteSelectedMapText,
      eraseNear: eraseMapTextNear,
      move: moveMapText,
      syncControls: syncTextControls,
      updateSelected: updateSelectedMapText
    } = textTool;

    const pathTools = PathToolController.create({
      state, els, pixelToWorld, snapPathPoint, worldToPixel,
      recordHistory, scheduleSave, draw, onSelectionChange: syncRoadAppearanceControls
    });
    const {
      addFreePathPoint, clearSelection: clearPathSelection, deleteSelectedPath, eraseNear: eraseFreePathsNear,
      findPathAt, findPathEndpointAt, finishFreePath, selectPath,
      startFreePath, startPathFromEndpoint, updateSelectionUi: updatePathSelectionUi
    } = pathTools;

    function syncDetails() {
      if (!state.selected) {
        els.selectedCoord.value = "-";
        els.selectedName.value = "";
        els.selectedTextScale.value = 100;
        els.selectedTextScaleInput.value = 100;
        els.selectedTextScaleValue.textContent = "100%";
        els.selectedType.value = "";
        els.selectedNotes.value = "";
        if (state.tool === "select") renderSelectedLabelEditor();
        return;
      }
      const { q, r } = state.selected;
      const cell = cellAt(q, r);
      els.selectedCoord.value = q + ", " + r;
      els.selectedName.value = cell.place ? cell.place.name : "";
      const textScale = cell.place ? Math.round((Number(cell.place.textScale) || 1) * 100) : 100;
      els.selectedTextScale.value = textScale;
      els.selectedTextScaleInput.value = textScale;
      els.selectedTextScaleValue.textContent = textScale + "%";
      els.selectedType.value = cell.place ? cell.place.type : "";
      els.selectedNotes.value = cell.notes || "";
      if (state.tool === "select") renderSelectedLabelEditor();
    }

    function renderSelectedLabelEditor() {
      els.editLabelEditor.replaceChildren();
      if (!state.selected) {
        els.editLabelEditor.textContent = "Selecione um local no mapa para editar o rótulo.";
        els.editLabelEditor.className = "hint";
        return;
      }
      const cell = cellAt(state.selected.q, state.selected.r);
      if (!cell.place) {
        els.editLabelEditor.textContent = "Este hex não possui um local. Adicione um usando a ferramenta Lugar.";
        els.editLabelEditor.className = "hint";
        return;
      }
      els.editLabelEditor.className = "";
      els.editLabelEditor.appendChild(PlaceLabelEditor.create(cell.place, {
        icons: Object.entries(placeTypes).map(([id, item]) => ({ id, label: item.label })),
        onChange: changes => {
        recordHistory();
        cell.place = { ...cell.place, ...changes };
        els.selectedName.value = changes.name;
        els.selectedTextScale.value = Math.round(changes.textScale * 100);
        els.selectedTextScaleInput.value = els.selectedTextScale.value;
        els.selectedTextScaleValue.textContent = els.selectedTextScale.value + "%";
        els.selectedType.value = changes.type;
        updatePlaces();
        scheduleSave();
        draw();
        }
      }));
    }

    function applyDetails() {
      if (!state.selected) return;
      recordHistory();
      const { q, r } = state.selected;
      const cell = cellAt(q, r);
      const name = els.selectedName.value.trim();
      const type = els.selectedType.value;
      cell.notes = els.selectedNotes.value;
      cell.place = type ? { ...cell.place, name, type, textScale: Number(els.selectedTextScale.value) / 100 } : null;
      updatePlaces();
      scheduleSave();
      draw();
    }

    function updatePlaces() {
      const places = Object.entries(state.cells)
        .filter(([, cell]) => cell.place)
        .map(([k, cell]) => ({ coord: k, place: cell.place }));
      els.placeList.innerHTML = "";
      if (!places.length) {
        const empty = document.createElement("p");
        empty.className = "hint";
        empty.textContent = "Nenhum lugar marcado ainda.";
        els.placeList.appendChild(empty);
        return;
      }
      places.forEach(item => {
        const div = document.createElement("button");
        div.className = "place-item";
        div.innerHTML = "<strong></strong><span></span>";
        div.querySelector("strong").textContent = item.place.name || "Lugar sem nome";
        div.querySelector("span").textContent = (placeTypes[item.place.type]?.label || "Lugar") + " - " + item.coord;
        div.addEventListener("click", () => {
          const [q, r] = parseKey(item.coord);
          state.selected = { q, r };
          const p = hexToPixel(q, r);
          const rect = canvas.getBoundingClientRect();
          state.offsetX += rect.width / 2 - p.x;
          state.offsetY += rect.height / 2 - p.y;
          setTool("select");
          syncDetails();
          updatePlaces();
          draw();
        });
        els.placeList.appendChild(div);
      });
    }

    let saveTimer = null;
    function scheduleSave() {
      els.saveStatus.textContent = "Alteracoes pendentes";
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveLocal, 500);
    }

    function createMapId() {
      return window.crypto && crypto.randomUUID ? crypto.randomUUID() : "map-" + Date.now() + "-" + Math.random().toString(16).slice(2);
    }

    function getSavedMaps() {
      return MapPersistence.list();
    }

    function updateSavedMapList() {
      const maps = getSavedMaps().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      els.savedMapList.replaceChildren();
      if (!maps.length) {
        const empty = document.createElement("p");
        empty.className = "saved-map-empty";
        empty.textContent = "Nenhum mapa salvo ainda.";
        els.savedMapList.appendChild(empty);
        return;
      }
      maps.forEach(map => {
        const row = document.createElement("div");
        row.className = "saved-map-item";
        const info = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = map.name || "Mapa sem nome";
        const meta = document.createElement("span");
        meta.textContent = map.cols + " x " + map.rows + " hexes - " + (map.style === "oldschool" ? "Old School" : "Moderno");
        info.append(name, meta);
        const open = document.createElement("button");
        open.textContent = map.id === state.mapId ? "Aberto" : "Abrir";
        open.disabled = map.id === state.mapId;
        open.addEventListener("click", () => {
          const saved = MapPersistence.load(map.id);
          if (!saved) return;
          importState(saved);
          els.savedMapsModal.hidden = true;
        });
        row.append(info, open);
        els.savedMapList.appendChild(row);
      });
    }

    function openSavedMaps() {
      els.optionsMenu.hidden = true;
      updateSavedMapList();
      els.savedMapsModal.hidden = false;
    }

    function buildBorderPalette() {
      els.borderColorPalette.replaceChildren();
      borderColors.forEach(color => {
        const button = document.createElement("button");
        button.className = "color-swatch";
        button.style.background = color === "none" ? "repeating-linear-gradient(135deg, #fffaf0 0 5px, #d6bd87 5px 7px)" : color;
        button.title = color === "none" ? "Sem borda" : "Usar esta cor na borda";
        if (color === "none") button.textContent = "/";
        button.dataset.color = color;
        button.addEventListener("click", () => {
          state.borderColor = color;
          buildBorderPalette();
          scheduleSave();
          draw();
        });
        button.classList.toggle("active", color === state.borderColor);
        els.borderColorPalette.appendChild(button);
      });
    }

    function openMapOptions() {
      els.optionsMenu.hidden = true;
      els.mapSizeLabel.textContent = state.cols + " x " + state.rows;
      buildBorderPalette();
      els.mapOptionsModal.hidden = false;
    }

    function resizeMap(side, delta) {
      const isColumn = side === "left" || side === "right";
      if (delta < 0 && (isColumn ? state.cols : state.rows) <= 4) return;
      const shiftQ = side === "left" && delta > 0 ? 1 : side === "left" && delta < 0 ? -1 : 0;
      const shiftR = side === "top" && delta > 0 ? 1 : side === "top" && delta < 0 ? -1 : 0;
      const nextCells = {};
      Object.entries(state.cells).forEach(([cellKey, cell]) => {
        let [q, r] = parseKey(cellKey);
        q += shiftQ;
        r += shiftR;
        const nextCols = state.cols + (isColumn ? delta : 0);
        const nextRows = state.rows + (!isColumn ? delta : 0);
        if (q >= 0 && r >= 0 && q < nextCols && r < nextRows) nextCells[key(q, r)] = cell;
      });
      state.cols += isColumn ? delta : 0;
      state.rows += !isColumn ? delta : 0;
      state.cells = nextCells;
      state.paths = state.paths.map(path => ({ ...path, points: path.points.map(([q, r]) => [q + shiftQ, r + shiftR]) }));
      state.texts = (state.texts || []).map(item => ({ ...item, point: [item.point[0] + shiftQ, item.point[1] + shiftR] }));
      if (state.selected) {
        const selected = { q: state.selected.q + shiftQ, r: state.selected.r + shiftR };
        state.selected = selected.q >= 0 && selected.r >= 0 && selected.q < state.cols && selected.r < state.rows ? selected : null;
      }
      els.mapSizeLabel.textContent = state.cols + " x " + state.rows;
      centerMap();
      syncDetails();
      updatePlaces();
      scheduleSave();
    }

    function exportState() {
      return {
        mapId: state.mapId,
        mapName: state.mapName,
        mapStyle: state.mapStyle,
        snapToEdges: state.snapToEdges,
        roadSnapToEdges: state.roadSnapToEdges,
        riverSnapToEdges: state.riverSnapToEdges,
        roadSelectExisting: state.roadSelectExisting,
        riverSelectExisting: state.riverSelectExisting,
        roadStyle: state.roadStyle,
        roadColor: state.roadColor,
        roadWidth: state.roadWidth,
        reliefLevel: state.reliefLevel,
        layers: state.layers,
        legendNotes: state.legendNotes,
        brushSize: state.brushSize,
        borderColor: state.borderColor,
        terrainIconScale: state.terrainIconScale,
        terrainIconScales: state.terrainIconScales,
        placeIconScales: state.placeIconScales,
        cols: state.cols,
        rows: state.rows,
        cells: state.cells,
        paths: state.paths || [],
        texts: state.texts || [],
        savedAt: new Date().toISOString()
      };
    }

    function updateHistoryUi() {
      return ({ canUndo, canRedo }) => {
        els.undoBtn.disabled = !canUndo;
        els.redoBtn.disabled = !canRedo;
      };
    }

    function historySnapshot() {
      return JSON.stringify({
        project: exportState(),
        currentPath: state.currentPath,
        selected: state.selected,
        selectedPathIndex: state.selectedPathIndex
      });
    }

    history = MapHistory.create({
      capture: historySnapshot,
      limit: 200,
      onChange: updateHistoryUi(),
      restore: snapshot => {
        const saved = JSON.parse(snapshot);
        importState(saved.project || saved);
        state.currentPath = saved.currentPath || null;
        state.selected = saved.selected || null;
        state.selectedPathIndex = saved.selectedPathIndex ?? null;
        syncDetails();
      }
    });

    function recordHistory() { history.record(); }
    function clearHistory() { history.clear(); }
    function undo() { history.undo(); }
    function redo() { history.redo(); }

    function importState(data) {
      if (data && data.settings && data.hexes) {
        importHexerMap(data);
        return;
      }
      if (!history.isRestoring()) clearHistory();
      state.mapId = data.mapId || state.mapId || createMapId();
      state.mapName = data.mapName || "Mapa Hex Local";
      state.mapStyle = data.mapStyle === "oldschool" ? "oldschool" : "modern";
      state.snapToEdges = Boolean(data.snapToEdges);
      state.roadSnapToEdges = Boolean(data.roadSnapToEdges ?? data.snapToEdges);
      state.riverSnapToEdges = Boolean(data.riverSnapToEdges ?? data.snapToEdges);
      state.roadSelectExisting = Boolean(data.roadSelectExisting);
      state.riverSelectExisting = Boolean(data.riverSelectExisting);
      state.roadStyle = ["trail", "simple", "main"].includes(data.roadStyle) ? data.roadStyle : "simple";
      state.roadColor = /^#[0-9a-f]{6}$/i.test(data.roadColor || "") ? data.roadColor : "#b78b4b";
      state.roadWidth = Math.max(.5, Math.min(2.2, Number(data.roadWidth) || 1));
      state.reliefLevel = Math.max(0, Math.min(3, Number(data.reliefLevel ?? 1)));
      state.layers = { ...defaultLayers(), ...(data.layers || {}) };
      state.legendNotes = typeof data.legendNotes === "string" ? data.legendNotes : "";
      if (state.tool === "road") state.snapToEdges = state.roadSnapToEdges;
      if (state.tool === "river") state.snapToEdges = state.riverSnapToEdges;
      state.selectExistingPaths = state.tool === "road" ? state.roadSelectExisting : state.tool === "river" ? state.riverSelectExisting : false;
      state.brushSize = Math.max(1, Math.min(4, Number(data.brushSize) || 1));
      state.borderColor = borderColors.includes(data.borderColor) ? data.borderColor : "#77664b";
      state.terrainIconScale = Math.max(.6, Math.min(1.6, Number(data.terrainIconScale) || 1));
      state.terrainIconScales = data.terrainIconScales || {};
      state.placeIconScales = data.placeIconScales || {};
      state.cols = Number(data.cols) || 28;
      state.rows = Number(data.rows) || 20;
      state.cells = data.cells || {};
      state.paths = data.paths || [];
      state.texts = Array.isArray(data.texts) ? data.texts : [];
      state.selectedTextIndex = null;
      state.textDrag = null;
      state.currentPath = null;
      state.pathContinuation = null;
      state.selected = null;
      state.lastPathCell = null;
      els.mapTitle.textContent = state.mapName;
      els.roadSnapToEdges.checked = state.roadSnapToEdges;
      els.riverSnapToEdges.checked = state.riverSnapToEdges;
      els.roadSelectExisting.checked = state.roadSelectExisting;
      els.riverSelectExisting.checked = state.riverSelectExisting;
      els.roadStyle.value = state.roadStyle;
      els.roadColor.value = state.roadColor;
      els.roadWidth.value = Math.round(state.roadWidth * 100);
      els.roadWidthInput.value = els.roadWidth.value;
      els.roadWidthValue.textContent = Math.round(state.roadWidth * 100) + "%";
      els.reliefLevel.value = state.reliefLevel;
      els.reliefLevelValue.textContent = state.reliefLevel + (state.reliefLevel === 1 ? " nível" : " níveis");
      els.brushSize.value = state.brushSize;
      els.brushSizeValue.textContent = state.brushSize + (state.brushSize === 1 ? " hex" : " hexes");
      updateTerrainScaleControl();
      updatePlacePreview();
      if (!history.isRestoring()) centerMap();
      syncDetails();
      updatePlaces();
      saveLocal();
      draw();
    }

    function importHexerMap(data) {
      const terrainMap = {
        plains: "grass",
        grass: "grass",
        forest: "forest",
        hill: "hills",
        hills: "hills",
        mountain: "mountain",
        lake: "water",
        water: "water",
        marsh: "swamp",
        swamp: "swamp",
        desert: "sand",
        snow: "snow"
      };
      const placeMap = { city: "settlement", town: "settlement", village: "settlement", temple: "temple", castle: "castle", tower: "tower", ruins: "ruins", mine: "mine" };
      if (!history.isRestoring()) clearHistory();
      state.cols = Number(data.settings.width) || 24;
      state.rows = Number(data.settings.height) || 24;
      state.mapId = createMapId();
      state.mapName = data.name || "Mapa Hex Local";
      state.mapStyle = "modern";
      state.snapToEdges = false;
      state.roadSnapToEdges = false;
      state.riverSnapToEdges = false;
      state.roadSelectExisting = false;
      state.riverSelectExisting = false;
      state.selectExistingPaths = false;
      state.roadStyle = "simple";
      state.roadColor = "#b78b4b";
      state.roadWidth = 1;
      state.reliefLevel = 1;
      state.layers = defaultLayers();
      state.legendNotes = "";
      state.brushSize = 1;
      state.borderColor = "#77664b";
      state.terrainIconScale = 1;
      state.terrainIconScales = {};
      state.placeIconScales = {};
      state.cells = {};
      for (let r = 0; r < state.rows; r++) {
        for (let q = 0; q < state.cols; q++) cellAt(q, r);
      }
      Object.values(data.hexes || {}).forEach(hex => {
        if (hex.layer && hex.layer !== "surface") return;
        if (hex.q < 0 || hex.r < 0 || hex.q >= state.cols || hex.r >= state.rows) return;
        cellAt(hex.q, hex.r).terrain = terrainMap[hex.hexType] || "grass";
      });
      (data.pois || []).forEach(poi => {
        if (!poi.hex || poi.layer && poi.layer !== "surface") return;
        const { q, r } = poi.hex;
        if (q < 0 || r < 0 || q >= state.cols || r >= state.rows) return;
        cellAt(q, r).place = { name: poi.label || "", type: placeMap[poi.type] || "settlement" };
      });
      state.paths = (data.paths || []).filter(path => path.points && path.points.length > 1).map(path => ({
        type: path.type === "water" ? "river" : "road",
        points: path.points.map(point => [Number(point.x) - Number(point.y) / 2, Number(point.y)])
      }));
      state.texts = [];
      state.selectedTextIndex = null;
      state.currentPath = null;
      state.pathContinuation = null;
      state.selected = null;
      state.lastPathCell = null;
      state.scale = 1;
      els.mapTitle.textContent = state.mapName;
      els.roadSnapToEdges.checked = state.roadSnapToEdges;
      els.riverSnapToEdges.checked = state.riverSnapToEdges;
      els.roadSelectExisting.checked = false;
      els.riverSelectExisting.checked = false;
      els.roadStyle.value = state.roadStyle;
      els.roadColor.value = state.roadColor;
      els.roadWidth.value = "100";
      els.roadWidthInput.value = "100";
      els.roadWidthValue.textContent = "100%";
      els.reliefLevel.value = state.reliefLevel;
      els.reliefLevelValue.textContent = "1 nível";
      updateTerrainScaleControl();
      updatePlacePreview();
      fitMap();
      syncDetails();
      updatePlaces();
      saveLocal();
      draw();
    }

    function saveLocal() {
      if (!state.mapId) state.mapId = createMapId();
      const project = exportState();
      const result = MapPersistence.save(project);
      els.saveStatus.textContent = result.ok ? "Salvo neste navegador" : "Nao foi possivel salvar neste navegador";
    }

    function loadLocal() {
      const current = MapPersistence.loadCurrent();
      if (!current) {
        const recent = getSavedMaps().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
        if (recent) {
          const saved = MapPersistence.load(recent.id);
          if (saved) {
            importState(saved);
            return;
          }
        }
        seedMap();
        state.mapId = createMapId();
        saveLocal();
        return;
      }
      try {
        importState(current);
      } catch (err) {
        seedMap();
      }
    }

    function download(filename, content, type) {
      DownloadService.saveText(content, filename, type);
    }

    function legendGroups() {
      const groups = [];
      const usedTerrains = new Set();
      const usedPlaces = new Set();
      Object.values(state.cells).forEach(cell => {
        if (cell.terrain) usedTerrains.add(cell.terrain);
        if (cell.place?.type) usedPlaces.add(cell.place.type);
      });
      if (state.layers.terrain) {
        const terrainItems = terrains
          .filter(terrain => usedTerrains.has(terrain.id))
          .filter(terrain => terrain.id !== "grass" || usedTerrains.size === 1)
          .map(terrain => ({ label: terrain.name, color: displayColor(terrain.color) }));
        if (terrainItems.length) groups.push({ title: "Terrenos", items: terrainItems });
      }
      if (state.layers.places) {
        const placeItems = Object.entries(placeTypes)
          .filter(([id]) => usedPlaces.has(id))
          .map(([, place]) => ({ label: place.label, color: "#a9793f" }));
        if (placeItems.length) groups.push({ title: "Lugares", items: placeItems });
      }
      const featureItems = [];
      if (state.layers.roads && state.paths.some(path => path.type === "road")) featureItems.push({ label: "Ruas e estradas", color: "#b78b4b" });
      if (state.layers.rivers && state.paths.some(path => path.type === "river")) featureItems.push({ label: "Rios", color: "#539dcd" });
      if (state.layers.relief && Object.values(state.cells).some(cell => Number(cell.elevation) > 0)) featureItems.push({ label: "Relevo elevado", color: "#705235" });
      if (featureItems.length) groups.push({ title: "Elementos", items: featureItems });
      const customItems = state.legendNotes.split("\n").map(line => line.trim()).filter(Boolean).map(label => ({ label, color: "#817568" }));
      if (customItems.length) groups.push({ title: "Anotações", items: customItems });
      return groups;
    }

    function renderLegendPreview() {
      els.legendPreview.replaceChildren();
      const groups = legendGroups();
      if (!groups.length) {
        els.legendPreview.textContent = "A legenda aparecerá quando o mapa possuir elementos.";
        return;
      }
      groups.forEach(group => {
        const section = document.createElement("section");
        section.className = "legend-preview-group";
        const heading = document.createElement("strong");
        heading.textContent = group.title;
        const entries = document.createElement("div");
        entries.className = "legend-preview-group-items";
        group.items.forEach(item => {
          const row = document.createElement("div");
          row.className = "legend-preview-item";
          const swatch = document.createElement("span");
          swatch.className = "legend-preview-swatch";
          swatch.style.background = item.color;
          const label = document.createElement("span");
          label.textContent = item.label;
          row.append(swatch, label);
          entries.appendChild(row);
        });
        section.append(heading, entries);
        els.legendPreview.appendChild(section);
      });
    }

    function getLegendHeight(groups, scale) {
      return groups.reduce((height, group) => height + 21 * scale + Math.ceil(group.items.length / 3) * 25 * scale + 8 * scale, 26 * scale);
    }

    function drawExportLegend(imageCtx, width, startY, groups, scale) {
      if (!groups.length) return;
      const columns = 3;
      const columnWidth = (width - 48 * scale) / columns;
      const rowHeight = 25 * scale;
      imageCtx.save();
      imageCtx.fillStyle = isOldSchool() ? "#171717" : "#4b3620";
      imageCtx.font = `700 ${Math.round(15 * scale)}px Georgia, serif`;
      imageCtx.fillText("Legenda", 24 * scale, startY + 23 * scale);
      let yOffset = startY + 44 * scale;
      groups.forEach(group => {
        imageCtx.fillStyle = isOldSchool() ? "#333333" : "#6b5233";
        imageCtx.font = `700 ${Math.round(11 * scale)}px Inter, sans-serif`;
        imageCtx.fillText(group.title, 24 * scale, yOffset);
        yOffset += 16 * scale;
        imageCtx.font = `500 ${Math.round(11 * scale)}px Inter, sans-serif`;
        group.items.forEach((item, index) => {
          const column = index % columns;
          const row = Math.floor(index / columns);
          const x = 24 * scale + column * columnWidth;
          const y = yOffset + row * rowHeight;
          imageCtx.fillStyle = item.color;
          imageCtx.fillRect(x, y - 11 * scale, 14 * scale, 14 * scale);
          imageCtx.strokeStyle = "rgba(0,0,0,.25)";
          imageCtx.strokeRect(x, y - 11 * scale, 14 * scale, 14 * scale);
          imageCtx.fillStyle = isOldSchool() ? "#171717" : "#4b3620";
          imageCtx.fillText(item.label, x + 21 * scale, y);
        });
        yOffset += Math.ceil(group.items.length / columns) * rowHeight + 8 * scale;
      });
      imageCtx.restore();
    }

    async function exportImage(options) {
      const type = options.type || "image/png";
      const extension = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }[type] || "png";
      const filename = (state.mapName || "mapa-hex").trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-").toLowerCase() + "." + extension;
      const dpr = window.devicePixelRatio || 1;
      const old = {
        width: canvas.width,
        height: canvas.height,
        styleWidth: canvas.style.width,
        styleHeight: canvas.style.height,
        scale: state.scale,
        offsetX: state.offsetX,
        offsetY: state.offsetY,
        selected: state.selected,
        currentPath: state.currentPath,
        isExporting: state.isExporting,
        layers: { ...state.layers },
        exportBackground: state.exportBackground
      };
      const requestedScale = Number(options.resolution) || 2.25;
      const maxExportSide = 6144;
      const maxScaleByWidth = maxExportSide / (state.hexSize * (Math.sqrt(3) * state.cols + 1.8));
      const maxScaleByHeight = maxExportSide / (state.hexSize * (1.5 * (state.rows - 1) + 3.8));
      const exportScale = Math.min(requestedScale, maxScaleByWidth, maxScaleByHeight);
      const size = state.hexSize * exportScale;
      const margin = Math.round(size * .9);
      const titleHeight = options.title ? 82 : 0;
      const groups = options.legend ? legendGroups() : [];
      const legendHeight = groups.length ? getLegendHeight(groups, exportScale) : 0;
      const width = Math.ceil(size * Math.sqrt(3) * state.cols + margin * 2);
      const mapHeight = Math.ceil(titleHeight + size * 1.5 * (state.rows - 1) + size * 2 + margin * 2);
      const height = Math.ceil(mapHeight + legendHeight);
      try {
        exportProgress.show();
        exportProgress.update(0, "Carregando todos os icones...");
        await waitForIcons();
        state.isExporting = true;
        state.scale = exportScale;
        state.selected = null;
        state.currentPath = null;
        state.exportBackground = options.background || type === "image/jpeg";
        state.layers = { ...state.layers, coordinates: Boolean(options.coordinates), grid: Boolean(options.grid) };
        // Confirma visualmente a previsualizacao completa antes de iniciar a
        // varredura por blocos usada para montar a imagem final.
        renderNow();
        await new Promise(resolve => requestAnimationFrame(resolve));
        exportProgress.update(0, "Iniciando renderizacao completa...");
        els.saveStatus.textContent = "Gerando imagem em partes...";
        const image = await PngExportService.renderInTiles({
          canvas,
          ctx,
          width,
          height,
          renderTile: (tileX, tileY) => {
            state.offsetX = margin + size * Math.sqrt(3) / 2 - tileX;
            state.offsetY = titleHeight + margin + size - tileY;
            renderNow();
          },
          onProgress: (completed, total) => {
            const progress = Math.round(completed / total * 100);
            exportProgress.update(progress, "Renderizando mapa: " + progress + "%");
          }
        });
        const imageCtx = image.getContext("2d");
        if (options.title) {
          imageCtx.save();
          imageCtx.fillStyle = isOldSchool() ? "#171717" : "#4b3620";
          imageCtx.textAlign = "center";
          imageCtx.textBaseline = "middle";
          imageCtx.font = "800 " + Math.round(24 * exportScale) + "px Georgia, 'Times New Roman', serif";
          imageCtx.fillText(state.mapName || "Mapa Hex", width / 2, titleHeight / 2);
          imageCtx.restore();
        }
        if (groups.length) drawExportLegend(imageCtx, width, mapHeight, groups, exportScale);
        const blob = await PngExportService.toBlob(image, type);
        exportProgress.update(100, "Preparando download...");
        const link = DownloadService.createDownloadLink(blob, filename);
        els.saveStatus.replaceChildren(link);
        link.click();
      } catch (error) {
        console.error("Falha ao exportar imagem", error);
        els.saveStatus.textContent = "Nao foi possivel exportar a imagem";
      } finally {
        canvas.style.width = old.styleWidth;
        canvas.style.height = old.styleHeight;
        canvas.width = old.width;
        canvas.height = old.height;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        state.scale = old.scale;
        state.offsetX = old.offsetX;
        state.offsetY = old.offsetY;
        state.selected = old.selected;
        state.currentPath = old.currentPath;
        state.isExporting = old.isExporting;
        state.layers = old.layers;
        state.exportBackground = old.exportBackground;
        exportProgress.hide();
        draw();
      }
    }

    function centerMap() {
      const rect = canvas.getBoundingClientRect();
      const mapW = state.hexSize * Math.sqrt(3) * (state.cols + .5) * state.scale;
      const mapH = state.hexSize * 1.5 * (state.rows - 1) * state.scale + state.hexSize * 2 * state.scale;
      state.offsetX = Math.max(28, (rect.width - mapW) / 2 + state.hexSize * state.scale);
      state.offsetY = Math.max(28, (rect.height - mapH) / 2 + state.hexSize * state.scale);
      draw();
    }

    function fitMap() {
      const rect = canvas.getBoundingClientRect();
      const naturalW = state.hexSize * Math.sqrt(3) * (state.cols + .5);
      const naturalH = state.hexSize * 1.5 * (state.rows - 1) + state.hexSize * 2;
      state.scale = Math.max(.38, Math.min(1, (rect.width - 48) / naturalW, (rect.height - 48) / naturalH));
      els.zoomBadge.textContent = Math.round(state.scale * 100) + "%";
      centerMap();
    }

    function setZoom(nextScale, anchor) {
      const prev = state.scale;
      const clamped = Math.max(.45, Math.min(2.4, nextScale));
      if (anchor) {
        state.offsetX = anchor.x - (anchor.x - state.offsetX) * (clamped / prev);
        state.offsetY = anchor.y - (anchor.y - state.offsetY) * (clamped / prev);
      }
      state.scale = clamped;
      els.zoomBadge.textContent = Math.round(state.scale * 100) + "%";
      draw();
    }

    function openNewMapDialog() {
      els.newMapName.value = state.mapName === "Mapa Hex Local" ? "Mapa sem nome" : state.mapName;
      els.newMapCols.value = state.cols;
      els.newMapRows.value = state.rows;
      els.styleOptions.querySelectorAll("[data-style]").forEach(button => {
        button.classList.toggle("active", button.dataset.style === state.mapStyle);
      });
      els.newMapModal.hidden = false;
      els.newMapName.focus();
    }

    function closeNewMapDialog() {
      els.newMapModal.hidden = true;
    }

    function createNewMap() {
      clearHistory();
      state.cols = Math.max(6, Math.min(300, Number(els.newMapCols.value) || 28));
      state.rows = Math.max(6, Math.min(200, Number(els.newMapRows.value) || 20));
      state.mapName = els.newMapName.value.trim() || "Mapa sem nome";
      state.mapId = createMapId();
      const chosen = els.styleOptions.querySelector("[data-style].active");
      state.mapStyle = chosen ? chosen.dataset.style : "modern";
      state.snapToEdges = false;
      state.roadSnapToEdges = false;
      state.riverSnapToEdges = false;
      state.roadSelectExisting = false;
      state.riverSelectExisting = false;
      state.selectExistingPaths = false;
      state.roadStyle = "simple";
      state.roadColor = "#b78b4b";
      state.roadWidth = 1;
      state.reliefLevel = 1;
      state.layers = defaultLayers();
      state.legendNotes = "";
      state.brushSize = 1;
      state.borderColor = "#77664b";
      state.terrainIconScale = 1;
      state.terrainIconScales = {};
      state.placeIconScales = {};
      state.cells = {};
      state.paths = [];
      state.texts = [];
      state.selectedTextIndex = null;
      state.currentPath = null;
      state.pathContinuation = null;
      for (let r = 0; r < state.rows; r++) {
        for (let q = 0; q < state.cols; q++) cellAt(q, r);
      }
      state.selected = null;
      els.mapTitle.textContent = state.mapName;
      els.roadSnapToEdges.checked = state.roadSnapToEdges;
      els.riverSnapToEdges.checked = state.riverSnapToEdges;
      els.roadSelectExisting.checked = false;
      els.riverSelectExisting.checked = false;
      els.roadStyle.value = state.roadStyle;
      els.roadColor.value = state.roadColor;
      els.roadWidth.value = "100";
      els.roadWidthInput.value = "100";
      els.roadWidthValue.textContent = "100%";
      els.reliefLevel.value = state.reliefLevel;
      els.reliefLevelValue.textContent = "1 nível";
      updateTerrainScaleControl();
      updatePlacePreview();
      closeNewMapDialog();
      centerMap();
      syncDetails();
      updatePlaces();
      saveLocal();
    }

    function openFeatureModal(modal) {
      els.optionsMenu.hidden = true;
      modal.hidden = false;
    }

    function syncLayerControls() {
      document.querySelectorAll("[data-layer]").forEach(input => {
        input.checked = state.layers[input.dataset.layer] !== false;
      });
    }

    function currentStyleSettings() {
      return {
        mapStyle: state.mapStyle,
        borderColor: state.borderColor,
        terrainIconScale: state.terrainIconScale,
        terrainIconScales: { ...state.terrainIconScales },
        placeIconScales: { ...state.placeIconScales },
        roadStyle: state.roadStyle,
        roadColor: state.roadColor,
        roadWidth: state.roadWidth,
        roadSnapToEdges: state.roadSnapToEdges,
        riverSnapToEdges: state.riverSnapToEdges,
        reliefLevel: state.reliefLevel
      };
    }

    function applyStyleSettings(settings) {
      state.mapStyle = settings.mapStyle === "oldschool" ? "oldschool" : "modern";
      state.borderColor = borderColors.includes(settings.borderColor) ? settings.borderColor : state.borderColor;
      state.terrainIconScale = Number(settings.terrainIconScale) || 1;
      state.terrainIconScales = { ...(settings.terrainIconScales || {}) };
      state.placeIconScales = { ...(settings.placeIconScales || {}) };
      state.roadStyle = ["trail", "simple", "main"].includes(settings.roadStyle) ? settings.roadStyle : "simple";
      state.roadColor = /^#[0-9a-f]{6}$/i.test(settings.roadColor || "") ? settings.roadColor : "#b78b4b";
      state.roadWidth = Math.max(.5, Math.min(2.2, Number(settings.roadWidth) || 1));
      state.roadSnapToEdges = Boolean(settings.roadSnapToEdges);
      state.riverSnapToEdges = Boolean(settings.riverSnapToEdges);
      if (state.tool === "road") state.snapToEdges = state.roadSnapToEdges;
      if (state.tool === "river") state.snapToEdges = state.riverSnapToEdges;
      state.reliefLevel = Math.max(0, Math.min(3, Number(settings.reliefLevel ?? 1)));
      els.roadStyle.value = state.roadStyle;
      els.roadColor.value = state.roadColor;
      els.roadWidth.value = Math.round(state.roadWidth * 100);
      els.roadWidthInput.value = els.roadWidth.value;
      els.roadWidthValue.textContent = Math.round(state.roadWidth * 100) + "%";
      els.roadSnapToEdges.checked = state.roadSnapToEdges;
      els.riverSnapToEdges.checked = state.riverSnapToEdges;
      els.reliefLevel.value = state.reliefLevel;
      els.reliefLevelValue.textContent = state.reliefLevel + (state.reliefLevel === 1 ? " nível" : " níveis");
      updateTerrainScaleControl();
      updatePlacePreview();
      scheduleSave();
      draw();
    }

    function renderStyleProfiles() {
      els.styleProfileList.replaceChildren();
      const profiles = MapStyleLibrary.list();
      if (!profiles.length) {
        const empty = document.createElement("p");
        empty.className = "hint";
        empty.textContent = "Nenhum estilo salvo ainda.";
        els.styleProfileList.appendChild(empty);
        return;
      }
      profiles.forEach(profile => {
        const row = document.createElement("div");
        row.className = "style-profile-item";
        const name = document.createElement("strong");
        name.textContent = profile.name;
        const apply = document.createElement("button");
        apply.textContent = "Aplicar";
        apply.addEventListener("click", () => applyStyleSettings(profile.settings || {}));
        const remove = document.createElement("button");
        remove.textContent = "Excluir";
        remove.hidden = Boolean(profile.builtIn);
        remove.addEventListener("click", () => {
          MapStyleLibrary.remove(profile.id);
          renderStyleProfiles();
        });
        row.append(name, apply, remove);
        els.styleProfileList.appendChild(row);
      });
    }

    function openExportOptions() {
      els.exportCoordinates.checked = state.layers.coordinates;
      els.exportGrid.checked = state.layers.grid;
      els.exportBackground.checked = true;
      openFeatureModal(els.exportOptionsModal);
    }

    function handleToolShortcut(event) {
      const target = event.target;
      if (event.key === "Escape") {
        document.querySelectorAll(".modal:not([hidden])").forEach(modal => { modal.hidden = true; });
        return;
      }
      if (target.matches("input, textarea, select") || target.isContentEditable) return;
      if (event.key === "?" || event.key === "F1") {
        event.preventDefault();
        openFeatureModal(els.helpModal);
        return;
      }
      if (document.querySelector(".modal:not([hidden])")) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const tool = { n: "navigate", p: "paint", h: "relief", l: "place", t: "text", e: "road", i: "river", a: "erase", d: "select" }[event.key.toLowerCase()];
      if (!tool) return;
      event.preventDefault();
      setTool(tool);
    }

    function initControls() {
      els.toggleRightPanelBtn.innerHTML = '<i class="bi bi-chevron-right" aria-hidden="true"></i>';
      makeSectionsCollapsible();
      populatePlaceTypes();
      buildTerrainPalette();
      buildPlacePalette();
      setTerrain("grass");
      updatePlacePreview();
      updatePathSelectionUi();
      syncRoadAppearanceControls();
      els.paintShowIcon.addEventListener("change", () => { state.paintShowIcon = els.paintShowIcon.checked; });
      els.reliefLevel.addEventListener("input", () => {
        state.reliefLevel = Number(els.reliefLevel.value);
        els.reliefLevelValue.textContent = state.reliefLevel + (state.reliefLevel === 1 ? " nível" : " níveis");
        scheduleSave();
      });
      els.selectedTextScale.addEventListener("input", () => {
        els.selectedTextScaleValue.textContent = els.selectedTextScale.value + "%";
      });
      els.brushSize.addEventListener("input", () => {
        state.brushSize = Number(els.brushSize.value);
        els.brushSizeValue.textContent = state.brushSize + (state.brushSize === 1 ? " hex" : " hexes");
        scheduleSave();
        draw();
      });
      els.terrainIconScale.addEventListener("input", () => {
        state.terrainIconScales[terrainGroupFor(state.terrain).id] = Number(els.terrainIconScale.value) / 100;
        els.terrainIconScaleValue.textContent = els.terrainIconScale.value + "%";
        scheduleSave();
        draw();
      });
      els.placeIconScale.addEventListener("input", () => {
        state.placeIconScales[els.placeType.value] = Number(els.placeIconScale.value) / 100;
        els.placeIconScaleValue.textContent = els.placeIconScale.value + "%";
        scheduleSave();
        draw();
      });
      els.roadSnapToEdges.addEventListener("change", () => {
        state.roadSnapToEdges = els.roadSnapToEdges.checked;
        if (state.tool === "road") state.snapToEdges = state.roadSnapToEdges;
        scheduleSave();
      });
      els.riverSnapToEdges.addEventListener("change", () => {
        state.riverSnapToEdges = els.riverSnapToEdges.checked;
        if (state.tool === "river") state.snapToEdges = state.riverSnapToEdges;
        scheduleSave();
      });
      els.roadSelectExisting.addEventListener("change", () => {
        state.roadSelectExisting = els.roadSelectExisting.checked;
        if (state.tool === "road") state.selectExistingPaths = state.roadSelectExisting;
        if (!state.roadSelectExisting) clearPathSelection();
        updatePathSelectionUi();
        scheduleSave();
      });
      els.riverSelectExisting.addEventListener("change", () => {
        state.riverSelectExisting = els.riverSelectExisting.checked;
        if (state.tool === "river") state.selectExistingPaths = state.riverSelectExisting;
        if (!state.riverSelectExisting) clearPathSelection();
        updatePathSelectionUi();
        scheduleSave();
      });
      els.roadStyle.addEventListener("change", () => {
        state.roadStyle = els.roadStyle.value;
        scheduleSave();
      });
      els.roadColor.addEventListener("input", () => {
        const path = state.paths[state.selectedPathIndex];
        if (!path || path.type !== "road") return;
        recordHistory();
        path.color = els.roadColor.value;
        scheduleSave();
        draw();
      });
      els.roadWidth.addEventListener("input", () => {
        const path = state.paths[state.selectedPathIndex];
        if (!path || path.type !== "road") return;
        recordHistory();
        path.width = Number(els.roadWidth.value) / 100;
        els.roadWidthValue.textContent = els.roadWidth.value + "%";
        scheduleSave();
        draw();
      });
      els.mapTextSize.addEventListener("input", () => {
        els.mapTextSizeValue.textContent = els.mapTextSize.value + " px";
        updateSelectedMapText();
      });
      [els.mapTextValue, els.mapTextColor, els.mapTextBackground, els.mapTextShape, els.mapTextBackgroundColor, els.mapTextBorderColor, els.mapTextFont].forEach(control => {
        control.addEventListener(control.type === "text" ? "input" : "change", updateSelectedMapText);
      });
      [els.mapTextOutline, els.mapTextOutlineColor, els.mapTextGlow, els.mapTextGlowColor, els.mapTextAlign, els.mapTextCurvature, els.mapTextLetterSpacing].forEach(control => {
        control.addEventListener(control.type === "range" ? "input" : "change", () => {
          els.mapTextOutlineValue.textContent = els.mapTextOutline.value + " px";
          els.mapTextGlowValue.textContent = els.mapTextGlow.value + " px";
          els.mapTextCurvatureValue.textContent = els.mapTextCurvature.value;
          els.mapTextLetterSpacingValue.textContent = els.mapTextLetterSpacing.value + " px";
          updateSelectedMapText();
        });
      });
      els.mapTextPreset.addEventListener("change", () => applyMapTextPreset(els.mapTextPreset.value));
      els.deleteSelectedTextBtn.addEventListener("click", deleteSelectedMapText);
      els.deleteSelectedPathBtn.addEventListener("click", deleteSelectedPath);
      els.undoBtn.addEventListener("click", undo);
      els.redoBtn.addEventListener("click", redo);

      document.querySelectorAll("[data-tool]").forEach(btn => {
        btn.addEventListener("click", () => setTool(btn.dataset.tool));
      });

      els.applyDetailsBtn.addEventListener("click", applyDetails);
      els.toggleRightPanelBtn.addEventListener("click", toggleRightPanel);
      els.saveBtn.addEventListener("click", saveLocal);
      els.exportJsonBtn.addEventListener("click", () => download("mapa-hex.json", JSON.stringify(exportState(), null, 2), "application/json"));
      els.exportPngBtn.addEventListener("click", openExportOptions);
      els.confirmExportBtn.addEventListener("click", () => {
        els.exportOptionsModal.hidden = true;
        exportImage({
          type: els.exportFormat.value,
          resolution: Number(els.exportResolution.value),
          title: els.exportTitle.checked,
          legend: els.exportLegend.checked,
          background: els.exportBackground.checked,
          coordinates: els.exportCoordinates.checked,
          grid: els.exportGrid.checked
        });
      });
      els.importBtn.addEventListener("click", () => els.importFile.click());
      els.importFile.addEventListener("change", async () => {
        const file = els.importFile.files[0];
        if (!file) return;
        importState(JSON.parse(await file.text()));
        els.importFile.value = "";
      });
      els.optionsBtn.addEventListener("click", () => {
        els.optionsMenu.hidden = !els.optionsMenu.hidden;
      });
      els.menuNewMapBtn.addEventListener("click", () => {
        els.optionsMenu.hidden = true;
        openNewMapDialog();
      });
      els.mapOptionsBtn.addEventListener("click", openMapOptions);
      els.savedMapsBtn.addEventListener("click", openSavedMaps);
      els.layersBtn.addEventListener("click", () => {
        syncLayerControls();
        openFeatureModal(els.layersModal);
      });
      els.legendBtn.addEventListener("click", () => {
        els.legendNotes.value = state.legendNotes;
        renderLegendPreview();
        openFeatureModal(els.legendModal);
      });
      els.styleLibraryBtn.addEventListener("click", () => {
        renderStyleProfiles();
        openFeatureModal(els.styleLibraryModal);
      });
      els.helpBtn.addEventListener("click", () => openFeatureModal(els.helpModal));
      document.querySelectorAll("[data-layer]").forEach(input => {
        input.addEventListener("change", () => {
          state.layers[input.dataset.layer] = input.checked;
          scheduleSave();
          draw();
        });
      });
      els.legendNotes.addEventListener("input", () => {
        state.legendNotes = els.legendNotes.value;
        renderLegendPreview();
        scheduleSave();
      });
      els.saveStyleProfileBtn.addEventListener("click", () => {
        const name = els.styleProfileName.value.trim() || "Estilo " + (MapStyleLibrary.list().filter(item => !item.builtIn).length + 1);
        MapStyleLibrary.save(name, currentStyleSettings());
        els.styleProfileName.value = "";
        renderStyleProfiles();
      });
      document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", () => { document.getElementById(button.dataset.closeModal).hidden = true; });
      });
      [els.layersModal, els.legendModal, els.styleLibraryModal, els.exportOptionsModal, els.helpModal].forEach(modal => {
        modal.addEventListener("click", event => { if (event.target === modal) modal.hidden = true; });
      });
      els.closeNewMapBtn.addEventListener("click", closeNewMapDialog);
      els.cancelNewMapBtn.addEventListener("click", closeNewMapDialog);
      els.createMapBtn.addEventListener("click", createNewMap);
      els.styleOptions.querySelectorAll("[data-style]").forEach(button => {
        button.addEventListener("click", () => {
          els.styleOptions.querySelectorAll("[data-style]").forEach(option => option.classList.toggle("active", option === button));
        });
      });
      els.newMapModal.addEventListener("click", event => {
        if (event.target === els.newMapModal) closeNewMapDialog();
      });
      els.closeSavedMapsBtn.addEventListener("click", () => { els.savedMapsModal.hidden = true; });
      els.savedMapsModal.addEventListener("click", event => {
        if (event.target === els.savedMapsModal) els.savedMapsModal.hidden = true;
      });
      els.closeMapOptionsBtn.addEventListener("click", () => { els.mapOptionsModal.hidden = true; });
      els.mapOptionsModal.addEventListener("click", event => {
        if (event.target === els.mapOptionsModal) els.mapOptionsModal.hidden = true;
      });
      document.querySelectorAll("[data-resize]").forEach(button => {
        button.addEventListener("click", () => resizeMap(button.dataset.resize, Number(button.dataset.delta)));
      });
      document.addEventListener("click", event => {
        if (!event.target.closest(".options-wrap")) els.optionsMenu.hidden = true;
      });
      els.zoomIn.addEventListener("click", () => setZoom(state.scale + .15));
      els.zoomOut.addEventListener("click", () => setZoom(state.scale - .15));
      els.centerBtn.addEventListener("click", centerMap);
      document.addEventListener("keydown", handleToolShortcut);
          document.addEventListener("keydown", event => {
            if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
            if (event.target.matches("input, textarea, select") || event.target.isContentEditable) return;
            event.preventDefault();
            if (event.shiftKey) redo();
            else undo();
          });
    }

    MapCanvasController.bind({
      canvas, state, key, pixelToHex, pixelToWorld, worldToPixel,
      findPathAt, findPathEndpointAt, startFreePath, startPathFromEndpoint, addFreePathPoint, finishFreePath, beginMapTextInteraction, moveMapText, eraseMapTextNear,
      recordHistory, scheduleSave, draw, handleCell, movePlace, eraseFreePathsNear, selectPath, clearPathSelection,
      setTool, syncDetails, setZoom, focusSelectedName: () => els.selectedName.focus(), resizeCanvas
    });

    initControls();
    loadLocal();
    resizeCanvas();
    centerMap();
    syncDetails();
    updatePlaces();
