const { borderColors, placeTypes, terrainGroups, terrains } = window.MapCatalog;

    window.AppShell.mountApp(document.getElementById("app"));

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
        exportPngBtn: "image",
        importBtn: "box-arrow-in-down",
        zoomOut: "dash-lg",
        zoomIn: "plus-lg",
        centerBtn: "bullseye"
      };
      Object.entries(icons).forEach(([id, icon]) => addButtonIcon(id, icon));
      document.querySelectorAll("[data-tool]").forEach(button => {
        const iconsByTool = { paint: "brush", place: "geo-alt", road: "signpost-split", river: "water", erase: "eraser", select: "pencil-square" };
        const label = button.textContent.trim();
        button.innerHTML = `<i class="bi bi-${iconsByTool[button.dataset.tool]}" aria-hidden="true"></i><span>${label}</span>`;
      });
    }

    const headerActions = document.createElement("div");
    headerActions.className = "options-menu-actions";
    ["saveBtn", "exportJsonBtn", "exportPngBtn", "importBtn", "importFile"].forEach(id => {
      headerActions.appendChild(document.getElementById(id));
    });
    document.getElementById("optionsMenu").appendChild(headerActions);

    const canvas = document.getElementById("mapCanvas");
    const ctx = canvas.getContext("2d");

    const iconImages = {};
    [...terrains, ...Object.values(placeTypes)].forEach(item => {
      const img = new Image();
      img.onload = draw;
      img.src = item.icon;
      iconImages[item.icon] = img;
    });

    const state = {
      cols: 28,
      rows: 20,
      hexSize: 31,
      scale: 1,
      offsetX: 80,
      offsetY: 70,
      mapName: "Mapa Hex Local",
      mapStyle: "modern",
      mapId: null,
      tool: "paint",
      terrain: "grass",
      paintShowIcon: true,
      brushSize: 1,
      borderColor: "#77664b",
      terrainIconScale: 1,
      terrainIconScales: {},
      placeIconScales: {},
      snapToEdges: false,
      cells: {},
      paths: [],
      currentPath: null,
      selectedPathIndex: null,
      selected: null,
      lastPathCell: null,
      activePathKey: null,
      hoveredBrush: null,
      isPainting: false,
      isPanning: false,
      panStart: null
    };

    const els = {
      terrainGrid: document.getElementById("terrainGrid"),
      paintShowIcon: document.getElementById("paintShowIcon"),
      brushSize: document.getElementById("brushSize"),
      brushSizeValue: document.getElementById("brushSizeValue"),
      terrainIconScale: document.getElementById("terrainIconScale"),
      terrainIconScaleValue: document.getElementById("terrainIconScaleValue"),
      terrainIconScaleLabel: document.getElementById("terrainIconScaleLabel"),
      toolGrid: document.getElementById("toolGrid"),
      terrainSection: document.getElementById("terrainSection"),
      placeSection: document.getElementById("placeSection"),
      pathAssistSection: document.getElementById("pathAssistSection"),
      placeName: document.getElementById("placeName"),
      placeType: document.getElementById("placeType"),
      placePreviewIcon: document.getElementById("placePreviewIcon"),
      placePreviewName: document.getElementById("placePreviewName"),
      placeGrid: document.getElementById("placeGrid"),
      placeIconScale: document.getElementById("placeIconScale"),
      placeIconScaleValue: document.getElementById("placeIconScaleValue"),
      placeIconScaleLabel: document.getElementById("placeIconScaleLabel"),
      snapToEdges: document.getElementById("snapToEdges"),
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
      selectedType: document.getElementById("selectedType"),
      selectedNotes: document.getElementById("selectedNotes"),
      applyDetailsBtn: document.getElementById("applyDetailsBtn"),
      placeList: document.getElementById("placeList")
    };

    function key(q, r) { return q + "," + r; }
    function parseKey(k) { return k.split(",").map(Number); }
    function terrainById(id) { return terrains.find(t => t.id === id) || terrains[0]; }
    function terrainGroupFor(id) { return terrainGroups.find(group => group.terrains.includes(id)) || terrainGroups[0]; }
    function isOldSchool() { return state.mapStyle === "oldschool"; }
    function displayColor(color) {
      return isOldSchool() ? "#ffffff" : color;
    }
    function cellAt(q, r) {
      const k = key(q, r);
      if (!state.cells[k]) state.cells[k] = { terrain: "grass", showIcon: true, place: null, roads: [], rivers: [], notes: "" };
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

    function hexToPixel(q, r) {
      const s = state.hexSize;
      const x = s * Math.sqrt(3) * (q + .5 * (r & 1));
      const y = s * 1.5 * r;
      return { x: x * state.scale + state.offsetX, y: y * state.scale + state.offsetY };
    }

    function worldToPixel(point) {
      return {
        x: point[0] * state.hexSize * Math.sqrt(3) * state.scale + state.offsetX,
        y: point[1] * state.hexSize * 1.5 * state.scale + state.offsetY
      };
    }

    function pixelToWorld(px, py) {
      return [
        (px - state.offsetX) / (state.hexSize * Math.sqrt(3) * state.scale),
        (py - state.offsetY) / (state.hexSize * 1.5 * state.scale)
      ];
    }

    function pixelToHex(px, py) {
      const s = state.hexSize;
      const x = (px - state.offsetX) / state.scale;
      const y = (py - state.offsetY) / state.scale;
      let best = null;
      let bestDist = Infinity;
      const approxR = Math.round(y / (s * 1.5));
      const approxQ = Math.round(x / (s * Math.sqrt(3)) - .5 * (approxR & 1));
      for (let r = approxR - 2; r <= approxR + 2; r++) {
        for (let q = approxQ - 2; q <= approxQ + 2; q++) {
          if (q < 0 || r < 0 || q >= state.cols || r >= state.rows) continue;
          const p = hexToPixel(q, r);
          const d = Math.hypot(px - p.x, py - p.y);
          if (d < bestDist) {
            bestDist = d;
            best = { q, r };
          }
        }
      }
      return bestDist <= state.hexSize * state.scale ? best : null;
    }

    function snapToNearestHexEdge(pos) {
      if (!state.snapToEdges) return pos;
      const cell = pixelToHex(pos.x, pos.y);
      if (!cell) return pos;
      let closest = null;
      for (let r = cell.r - 1; r <= cell.r + 1; r++) {
        for (let q = cell.q - 1; q <= cell.q + 1; q++) {
          if (q < 0 || r < 0 || q >= state.cols || r >= state.rows) continue;
          const center = hexToPixel(q, r);
          const corners = hexCorners(center.x, center.y, state.hexSize * state.scale - .8);
          for (let i = 0; i < 6; i++) {
            const a = corners[i];
            const b = corners[(i + 1) % 6];
            const dx = b[0] - a[0];
            const dy = b[1] - a[1];
            const lengthSq = dx * dx + dy * dy || 1;
            const t = Math.max(0, Math.min(1, ((pos.x - a[0]) * dx + (pos.y - a[1]) * dy) / lengthSq));
            const x = a[0] + dx * t;
            const y = a[1] + dy * t;
            const distance = Math.hypot(pos.x - x, pos.y - y);
            if (!closest || distance < closest.distance) closest = { x, y, distance };
          }
        }
      }
      return closest && closest.distance <= Math.max(12, state.hexSize * state.scale * .34) ? closest : pos;
    }

    function hexPath(x, y, size) {
      const p = new Path2D();
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 180 * (60 * i - 30);
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) p.moveTo(px, py);
        else p.lineTo(px, py);
      }
      p.closePath();
      return p;
    }

    function hash(q, r, salt = 0) {
      let n = Math.sin(q * 127.1 + r * 311.7 + salt * 74.7) * 43758.5453;
      return n - Math.floor(n);
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

    function neighborEdges(q, r) {
      const even = [
        { edge: 0, q: q + 1, r },
        { edge: 1, q, r: r + 1 },
        { edge: 2, q: q - 1, r: r + 1 },
        { edge: 3, q: q - 1, r },
        { edge: 4, q: q - 1, r: r - 1 },
        { edge: 5, q, r: r - 1 }
      ];
      const odd = [
        { edge: 0, q: q + 1, r },
        { edge: 1, q: q + 1, r: r + 1 },
        { edge: 2, q, r: r + 1 },
        { edge: 3, q: q - 1, r },
        { edge: 4, q, r: r - 1 },
        { edge: 5, q: q + 1, r: r - 1 }
      ];
      return (r & 1) ? odd : even;
    }

    function hexCorners(x, y, size) {
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 180 * (60 * i - 30);
        points.push([x + size * Math.cos(angle), y + size * Math.sin(angle)]);
      }
      return points;
    }

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = isOldSchool() ? "#ffffff" : "#f4ecd9";
      ctx.fillRect(0, 0, rect.width, rect.height);
      for (let r = 0; r < state.rows; r++) {
        for (let q = 0; q < state.cols; q++) drawHex(q, r);
      }
      ctx.save();
      clipToMap();
      drawLegacyConnections("river");
      drawLegacyConnections("road");
      drawFreePaths("river");
      drawFreePaths("road");
      drawPlacesAndLabels();
      ctx.restore();
      drawSelectedHex();
      drawBrushPreview();
    }

    function clipToMap() {
      ctx.beginPath();
      for (let r = 0; r < state.rows; r++) {
        for (let q = 0; q < state.cols; q++) {
          const p = hexToPixel(q, r);
          hexCorners(p.x, p.y, state.hexSize * state.scale - .8).forEach(([x, y], index) => {
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
        }
      }
      ctx.clip();
    }

    function drawLegacyConnections(type) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = isOldSchool() ? "#000000" : (type === "road" ? "rgba(111, 71, 32, .9)" : "rgba(36, 111, 174, .92)");
      ctx.lineWidth = (type === "road" ? 6 : 8) * state.scale;
      const seen = new Set();
      Object.entries(state.cells).forEach(([from, cell]) => {
        const list = type === "road" ? cell.roads || [] : cell.rivers || [];
        const [q1, r1] = parseKey(from);
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
            ctx.strokeStyle = isOldSchool() ? "#ffffff" : "rgba(234, 202, 136, .9)";
            ctx.lineWidth = 2.2 * state.scale;
            ctx.stroke();
            ctx.strokeStyle = isOldSchool() ? "#000000" : "rgba(111, 71, 32, .9)";
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
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const strokePath = path.snapToEdges ? strokeLinearPath : strokeSmoothPath;
        if (type === "river") {
          strokePath(path.points, isOldSchool() ? "#000000" : "rgba(31, 82, 128, .78)", 9 * state.scale);
          strokePath(path.points, isOldSchool() ? "#ffffff" : "rgba(83, 157, 205, .95)", 3 * state.scale);
          if (!isOldSchool()) strokePath(path.points, "rgba(168, 220, 238, .85)", 2.2 * state.scale);
        } else {
          strokePath(path.points, isOldSchool() ? "#000000" : "rgba(78, 48, 23, .72)", 7 * state.scale);
          strokePath(path.points, isOldSchool() ? "#ffffff" : "rgba(183, 139, 75, .95)", 3 * state.scale);
          if (!isOldSchool()) strokePath(path.points, "rgba(226, 197, 132, .92)", 1.6 * state.scale);
        }
        ctx.restore();
      });
      if (state.selectedPathIndex !== null) {
        const selected = state.paths[state.selectedPathIndex];
        if (selected && selected.type === type) (selected.snapToEdges ? strokeLinearPath : strokeSmoothPath)(selected.points, "rgba(255,255,255,.94)", 1.5 * state.scale);
      }
    }

    function strokeSmoothPath(points, color, width) {
      if (points.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      const first = worldToPixel(points[0]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < points.length - 1; i++) {
        const current = worldToPixel(points[i]);
        const next = worldToPixel(points[i + 1]);
        ctx.quadraticCurveTo(current.x, current.y, (current.x + next.x) / 2, (current.y + next.y) / 2);
      }
      const last = worldToPixel(points[points.length - 1]);
      ctx.lineTo(last.x, last.y);
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

    function drawHex(q, r) {
      const cell = cellAt(q, r);
      const p = hexToPixel(q, r);
      const size = state.hexSize * state.scale - .8;
      const terrain = terrainById(cell.terrain);
      const path = hexPath(p.x, p.y, size);
      const variation = Math.round((hash(q, r, 1) - .5) * 8);
      ctx.fillStyle = shade(displayColor(terrain.color), variation);
      ctx.fill(path);
      drawPaperTexture(q, r, p.x, p.y, size);
      drawTerrainEdges(q, r, p.x, p.y, size, terrain);
      if (cell.showIcon !== false && !(isOldSchool() && terrain.id === "grass")) {
        drawSvgIcon(terrain.icon, p.x, p.y, size * .48 * (state.terrainIconScales[terrainGroupFor(terrain.id).id] || state.terrainIconScales[terrain.id] || state.terrainIconScale), .78);
      }
      if (state.borderColor !== "none") {
        ctx.strokeStyle = isOldSchool() ? "#000000" : state.borderColor;
        ctx.lineWidth = Math.max(.6, .75 * state.scale);
        ctx.stroke(path);
      }
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

    function drawTerrainEdges(q, r, x, y, size, terrain) {
      if (isOldSchool()) return;
      const corners = hexCorners(x, y, size);
      const hex = hexPath(x, y, size);
      neighborEdges(q, r).forEach(({ q: nq, r: nr, edge }) => {
        if (nq < 0 || nr < 0 || nq >= state.cols || nr >= state.rows) return;
        const neighbor = cellAt(nq, nr);
        if (neighbor.terrain === terrain.id) return;
        const a = corners[edge];
        const b = corners[(edge + 1) % 6];
        const neighborTerrain = terrainById(neighbor.terrain);
        ctx.save();
        ctx.clip(hex);
        const sharedQ = q + nq;
        const sharedR = r + nr;
        const sharedEdge = Math.min(edge, (edge + 3) % 6);
        const neighborColor = displayColor(neighborTerrain.color);
        drawOrganicEdgePatch(sharedQ, sharedR, sharedEdge, a, b, x, y, size, neighborColor, .19, .15);
        drawOrganicEdgePatch(sharedQ, sharedR, sharedEdge + 17, a, b, x, y, size, shade(neighborColor, -8), .10, .08);
        ctx.restore();
      });
    }

    function drawOrganicEdgePatch(q, r, edge, a, b, x, y, size, color, alpha, depth) {
      const steps = 6;
      const inner = [];
      const amplitude = .72 + hash(q, r, edge * 11 + 301) * .25;
      const frequency = 1 + Math.floor(hash(q, r, edge * 13 + 503) * 2);
      const phase = hash(q, r, edge * 17 + 701) * Math.PI * 2;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const edgeX = a[0] + (b[0] - a[0]) * t;
        const edgeY = a[1] + (b[1] - a[1]) * t;
        const envelope = Math.sin(t * Math.PI);
        const wave = 1 + Math.sin(t * Math.PI * frequency + phase) * .14;
        const noisyDepth = Math.max(0, depth * envelope * amplitude * wave + (hash(q, r, edge * 43 + i) - .5) * .009);
        inner.push([
          edgeX + (x - edgeX) * noisyDepth,
          edgeY + (y - edgeY) * noisyDepth
        ]);
      }
      ctx.save();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(inner[inner.length - 1][0], inner[inner.length - 1][1]);
      for (let i = inner.length - 2; i >= 0; i--) {
        const current = inner[i + 1];
        const next = inner[i];
        const midX = (current[0] + next[0]) / 2;
        const midY = (current[1] + next[1]) / 2;
        ctx.quadraticCurveTo(current[0], current[1], midX, midY);
      }
      ctx.quadraticCurveTo(inner[0][0], inner[0][1], a[0], a[1]);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawPaperTexture(q, r, x, y, size) {
      if (isOldSchool()) return;
      const path = hexPath(x, y, size);
      ctx.save();
      ctx.clip(path);
      for (let i = 0; i < 12; i++) {
        const px = x + (hash(q, r, i + 500) - .5) * size * 1.45;
        const py = y + (hash(q, r, i + 700) - .5) * size * 1.25;
        const radius = .42 + hash(q, r, i + 900) * .9;
        ctx.globalAlpha = .035 + hash(q, r, i + 1000) * .025;
        ctx.fillStyle = i % 3 === 0 ? "#2a2418" : "#fff2c8";
        ctx.beginPath();
        ctx.arc(px, py, radius * state.scale, 0, Math.PI * 2);
        ctx.fill();
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
      if (state.tool !== "paint" || !state.hoveredBrush) return;
      ctx.save();
      ctx.strokeStyle = "rgba(214, 47, 47, .95)";
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
      if (!img || !img.complete) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      ctx.restore();
    }

    function drawPlace(place, x, y, size) {
      const type = placeTypes[place.type] || placeTypes.settlement;
      ctx.save();
      const badgeY = y - size * .2;
      const radius = size * .34;
      ctx.shadowColor = "rgba(58, 35, 18, .28)";
      ctx.shadowBlur = 4 * state.scale;
      ctx.fillStyle = isOldSchool() ? "#ffffff" : "rgba(209, 173, 102, .7)";
      ctx.beginPath();
      ctx.arc(x, badgeY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = Math.max(2, 3 * state.scale);
      ctx.strokeStyle = isOldSchool() ? "#000000" : "rgba(88, 54, 27, .74)";
      ctx.stroke();
      ctx.lineWidth = Math.max(1, 1.3 * state.scale);
      ctx.strokeStyle = isOldSchool() ? "#000000" : "rgba(255, 234, 176, .72)";
      ctx.beginPath();
      ctx.arc(x, badgeY, radius - 4 * state.scale, 0, Math.PI * 2);
      ctx.stroke();
      drawSvgIcon(type.icon, x, badgeY, size * .48 * (state.placeIconScales[place.type] || 1), .96);
      ctx.restore();
    }

    function drawPlacesAndLabels() {
      Object.entries(state.cells).forEach(([k, cell]) => {
        if (!cell.place) return;
        const [q, r] = parseKey(k);
        const p = hexToPixel(q, r);
        drawPlace(cell.place, p.x, p.y, state.hexSize * state.scale - .8);
      });
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      Object.entries(state.cells).forEach(([k, cell]) => {
        if (!cell.place || !cell.place.name) return;
        const [q, r] = parseKey(k);
        const p = hexToPixel(q, r);
        const text = cell.place.name;
        const fontSize = Math.max(16, Math.min(34, 24 * state.scale));
        const y = p.y + state.hexSize * state.scale * .18;
        ctx.font = "800 " + fontSize + "px Georgia, 'Times New Roman', serif";
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.shadowColor = "rgba(70, 42, 20, .42)";
        ctx.shadowBlur = 2 * state.scale;
        ctx.shadowOffsetY = 2 * state.scale;
        ctx.lineWidth = Math.max(5, fontSize * .24);
        ctx.strokeStyle = isOldSchool() ? "#252522" : "#5a321f";
        ctx.strokeText(text, p.x, y);
        ctx.lineWidth = Math.max(2, fontSize * .11);
        ctx.strokeStyle = isOldSchool() ? "#f5f5ee" : "#f3dfba";
        ctx.strokeText(text, p.x, y);
        ctx.shadowColor = "transparent";
        ctx.fillStyle = isOldSchool() ? "#151513" : "#3b2318";
        ctx.fillText(text, p.x, y);
      });
      ctx.restore();
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
      if (tool !== "paint") state.hoveredBrush = null;
      document.querySelectorAll("[data-tool]").forEach(btn => btn.classList.toggle("active", btn.dataset.tool === tool));
      els.terrainSection.hidden = tool !== "paint";
      els.placeSection.hidden = tool !== "place";
      els.pathAssistSection.hidden = tool !== "road" && tool !== "river";
      updatePathSelectionUi();
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
        cell.place = { name: els.placeName.value.trim(), type: els.placeType.value };
      } else if (state.tool === "erase") {
        cellsInBrush(q, r).forEach(({ q: brushQ, r: brushR }) => {
          const cell = cellAt(brushQ, brushR);
          cell.place = null;
          cell.notes = "";
          cell.terrain = "grass";
          removeCellConnections(brushQ, brushR);
        });
      }
      syncDetails();
      updatePlaces();
      scheduleSave();
      draw();
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

    function startFreePath(pos) {
      const snapped = snapToNearestHexEdge(pos);
      const point = pixelToWorld(snapped.x, snapped.y);
      const selected = state.paths[state.selectedPathIndex];
      if (selected && selected.type === state.tool) {
        state.currentPath = state.paths.splice(state.selectedPathIndex, 1)[0];
        state.selectedPathIndex = null;
        const last = state.currentPath.points[state.currentPath.points.length - 1];
        if (Math.hypot(point[0] - last[0], point[1] - last[1]) > .16) state.currentPath.points.push(point);
      } else {
        state.currentPath = { type: state.tool, snapToEdges: state.snapToEdges, points: [point] };
      }
      updatePathSelectionUi();
      draw();
    }

    function addFreePathPoint(pos) {
      if (!state.currentPath) return;
      const snapped = snapToNearestHexEdge(pos);
      const point = pixelToWorld(snapped.x, snapped.y);
      const points = state.currentPath.points;
      const last = points[points.length - 1];
      const minDistance = .16;
      if (Math.hypot(point[0] - last[0], point[1] - last[1]) < minDistance) return;
      points.push(point);
      scheduleSave();
      draw();
    }

    function finishFreePath() {
      if (!state.currentPath) return;
      if (state.currentPath.points.length > 1) {
        state.paths = state.paths || [];
        state.paths.push(state.currentPath);
        scheduleSave();
      }
      state.currentPath = null;
      updatePathSelectionUi();
      draw();
    }

    function distanceToSegment(point, a, b) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length));
      return Math.hypot(point.x - (a.x + dx * t), point.y - (a.y + dy * t));
    }

    function findPathAt(pos, type) {
      const threshold = Math.max(10, state.hexSize * state.scale * .34);
      let match = -1;
      let distance = Infinity;
      (state.paths || []).forEach((path, index) => {
        if (path.type !== type) return;
        for (let i = 1; i < path.points.length; i++) {
          const current = distanceToSegment(pos, worldToPixel(path.points[i - 1]), worldToPixel(path.points[i]));
          if (current < threshold && current < distance) {
            match = index;
            distance = current;
          }
        }
      });
      return match;
    }

    function selectPath(index) {
      state.selectedPathIndex = index;
      updatePathSelectionUi();
      draw();
    }

    function updatePathSelectionUi() {
      const path = state.paths[state.selectedPathIndex];
      els.deleteSelectedPathBtn.disabled = !path;
      els.pathSelectionHint.textContent = path
        ? (path.type === "river" ? "Rio selecionado." : "Rua selecionada.") + " Clique em uma area vazia para continuar pelo final do desenho."
        : "Clique em um desenho para selecioná-lo. Clique em uma área vazia para iniciar ou continuar o traço.";
    }

    function deleteSelectedPath() {
      if (state.selectedPathIndex === null) return;
      state.paths.splice(state.selectedPathIndex, 1);
      state.selectedPathIndex = null;
      updatePathSelectionUi();
      scheduleSave();
      draw();
    }

    function eraseFreePathsNear(pos) {
      const point = pixelToWorld(pos.x, pos.y);
      const radius = .45;
      const before = (state.paths || []).length;
      state.paths = (state.paths || []).filter(path => !path.points.some(p => Math.hypot(p[0] - point[0], p[1] - point[1]) < radius));
      if (state.paths.length !== before) scheduleSave();
    }

    function areNeighbors(q1, r1, q2, r2) {
      const dirsEven = [[1,0],[-1,0],[0,-1],[-1,-1],[0,1],[-1,1]];
      const dirsOdd = [[1,0],[-1,0],[1,-1],[0,-1],[1,1],[0,1]];
      const dirs = (r1 & 1) ? dirsOdd : dirsEven;
      return dirs.some(([dq, dr]) => q1 + dq === q2 && r1 + dr === r2);
    }

    function pointerPos(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function syncDetails() {
      if (!state.selected) {
        els.selectedCoord.value = "-";
        els.selectedName.value = "";
        els.selectedType.value = "";
        els.selectedNotes.value = "";
        return;
      }
      const { q, r } = state.selected;
      const cell = cellAt(q, r);
      els.selectedCoord.value = q + ", " + r;
      els.selectedName.value = cell.place ? cell.place.name : "";
      els.selectedType.value = cell.place ? cell.place.type : "";
      els.selectedNotes.value = cell.notes || "";
    }

    function applyDetails() {
      if (!state.selected) return;
      const { q, r } = state.selected;
      const cell = cellAt(q, r);
      const name = els.selectedName.value.trim();
      const type = els.selectedType.value;
      cell.notes = els.selectedNotes.value;
      cell.place = type ? { name, type } : null;
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
          syncDetails();
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
        brushSize: state.brushSize,
        borderColor: state.borderColor,
        terrainIconScale: state.terrainIconScale,
        terrainIconScales: state.terrainIconScales,
        placeIconScales: state.placeIconScales,
        cols: state.cols,
        rows: state.rows,
        cells: state.cells,
        paths: state.paths || [],
        savedAt: new Date().toISOString()
      };
    }

    function importState(data) {
      if (data && data.settings && data.hexes) {
        importHexerMap(data);
        return;
      }
      state.mapId = data.mapId || state.mapId || createMapId();
      state.mapName = data.mapName || "Mapa Hex Local";
      state.mapStyle = data.mapStyle === "oldschool" ? "oldschool" : "modern";
      state.snapToEdges = Boolean(data.snapToEdges);
      state.brushSize = Math.max(1, Math.min(4, Number(data.brushSize) || 1));
      state.borderColor = borderColors.includes(data.borderColor) ? data.borderColor : "#77664b";
      state.terrainIconScale = Math.max(.6, Math.min(1.6, Number(data.terrainIconScale) || 1));
      state.terrainIconScales = data.terrainIconScales || {};
      state.placeIconScales = data.placeIconScales || {};
      state.cols = Number(data.cols) || 28;
      state.rows = Number(data.rows) || 20;
      state.cells = data.cells || {};
      state.paths = data.paths || [];
      state.currentPath = null;
      state.selected = null;
      state.lastPathCell = null;
      els.mapTitle.textContent = state.mapName;
      els.snapToEdges.checked = state.snapToEdges;
      els.brushSize.value = state.brushSize;
      els.brushSizeValue.textContent = state.brushSize + (state.brushSize === 1 ? " hex" : " hexes");
      updateTerrainScaleControl();
      updatePlacePreview();
      centerMap();
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
      state.cols = Number(data.settings.width) || 24;
      state.rows = Number(data.settings.height) || 24;
      state.mapId = createMapId();
      state.mapName = data.name || "Mapa Hex Local";
      state.mapStyle = "modern";
      state.snapToEdges = false;
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
      state.currentPath = null;
      state.selected = null;
      state.lastPathCell = null;
      state.scale = 1;
      els.mapTitle.textContent = state.mapName;
      els.snapToEdges.checked = state.snapToEdges;
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
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }

    function exportPng() {
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
        currentPath: state.currentPath
      };
      const exportScale = 2.5;
      const size = state.hexSize * exportScale;
      const margin = Math.round(size * .9);
      const titleHeight = 82;
      const width = Math.ceil(size * Math.sqrt(3) * state.cols + margin * 2);
      const height = Math.ceil(titleHeight + size * 1.5 * (state.rows - 1) + size * 2 + margin * 2);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = width;
      canvas.height = height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      state.scale = exportScale;
      state.offsetX = margin + size * Math.sqrt(3) / 2;
      state.offsetY = titleHeight + margin + size;
      state.selected = null;
      state.currentPath = null;
      draw();
      ctx.save();
      ctx.fillStyle = isOldSchool() ? "#171717" : "#4b3620";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "800 " + Math.round(24 * exportScale) + "px Georgia, 'Times New Roman', serif";
      ctx.fillText(state.mapName || "Mapa Hex", width / 2, titleHeight / 2);
      ctx.restore();
      const href = canvas.toDataURL("image/png");
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
      draw();
      const a = document.createElement("a");
      const filename = (state.mapName || "mapa-hex").trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-").toLowerCase();
      a.download = filename + ".png";
      a.href = href;
      a.click();
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
      state.cols = Math.max(6, Math.min(80, Number(els.newMapCols.value) || 28));
      state.rows = Math.max(6, Math.min(60, Number(els.newMapRows.value) || 20));
      state.mapName = els.newMapName.value.trim() || "Mapa sem nome";
      state.mapId = createMapId();
      const chosen = els.styleOptions.querySelector("[data-style].active");
      state.mapStyle = chosen ? chosen.dataset.style : "modern";
      state.snapToEdges = false;
      state.brushSize = 1;
      state.borderColor = "#77664b";
      state.terrainIconScale = 1;
      state.terrainIconScales = {};
      state.placeIconScales = {};
      state.cells = {};
      state.paths = [];
      state.currentPath = null;
      for (let r = 0; r < state.rows; r++) {
        for (let q = 0; q < state.cols; q++) cellAt(q, r);
      }
      state.selected = null;
      els.mapTitle.textContent = state.mapName;
      els.snapToEdges.checked = state.snapToEdges;
      updateTerrainScaleControl();
      updatePlacePreview();
      closeNewMapDialog();
      centerMap();
      syncDetails();
      updatePlaces();
      saveLocal();
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
      els.paintShowIcon.addEventListener("change", () => { state.paintShowIcon = els.paintShowIcon.checked; });
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
      els.snapToEdges.addEventListener("change", () => {
        state.snapToEdges = els.snapToEdges.checked;
        scheduleSave();
      });
      els.deleteSelectedPathBtn.addEventListener("click", deleteSelectedPath);

      document.querySelectorAll("[data-tool]").forEach(btn => {
        btn.addEventListener("click", () => setTool(btn.dataset.tool));
      });

      els.applyDetailsBtn.addEventListener("click", applyDetails);
      els.toggleRightPanelBtn.addEventListener("click", toggleRightPanel);
      els.saveBtn.addEventListener("click", saveLocal);
      els.exportJsonBtn.addEventListener("click", () => download("mapa-hex.json", JSON.stringify(exportState(), null, 2), "application/json"));
      els.exportPngBtn.addEventListener("click", exportPng);
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
    }

    canvas.addEventListener("pointerdown", event => {
      canvas.setPointerCapture(event.pointerId);
      const pos = pointerPos(event);
      if (event.button === 2 || event.shiftKey || event.ctrlKey || event.code === "Space") {
        state.isPanning = true;
        state.panStart = { x: event.clientX, y: event.clientY, ox: state.offsetX, oy: state.offsetY };
        return;
      }
      state.isPainting = true;
      state.activePathKey = null;
      if (state.tool === "road" || state.tool === "river") {
        const existing = findPathAt(pos, state.tool);
        if (existing !== -1) {
          state.isPainting = false;
          selectPath(existing);
          return;
        }
        startFreePath(pos);
      } else {
        const cell = pixelToHex(pos.x, pos.y);
        if (state.tool === "paint") state.hoveredBrush = cell;
        if (cell) state.activePathKey = key(cell.q, cell.r);
        if (state.tool === "erase") {
          const existing = findPathAt(pos, "road");
          const river = existing === -1 ? findPathAt(pos, "river") : -1;
          if (existing !== -1 || river !== -1) {
            state.isPainting = false;
            selectPath(existing !== -1 ? existing : river);
            return;
          }
          eraseFreePathsNear(pos);
        }
        handleCell(cell);
      }
    });

    canvas.addEventListener("pointermove", event => {
      if (state.isPanning && state.panStart) {
        state.offsetX = state.panStart.ox + event.clientX - state.panStart.x;
        state.offsetY = state.panStart.oy + event.clientY - state.panStart.y;
        draw();
        return;
      }
      const pos = pointerPos(event);
      const cell = pixelToHex(pos.x, pos.y);
      if (state.tool === "paint") {
        const changed = !cell || !state.hoveredBrush || cell.q !== state.hoveredBrush.q || cell.r !== state.hoveredBrush.r;
        state.hoveredBrush = cell;
        if (changed) draw();
      }
      if (!state.isPainting) return;
      if (state.tool === "road" || state.tool === "river") {
        addFreePathPoint(pos);
        return;
      }
      if (!cell) return;
      const hoveredKey = key(cell.q, cell.r);
      if ((state.tool === "paint" || state.tool === "erase") && hoveredKey !== state.activePathKey) {
        state.activePathKey = hoveredKey;
        if (state.tool === "erase") eraseFreePathsNear(pos);
        handleCell(cell);
      }
    });

    canvas.addEventListener("pointerup", () => {
      finishFreePath();
      state.isPainting = false;
      state.isPanning = false;
      state.panStart = null;
      state.activePathKey = null;
    });

    canvas.addEventListener("pointerleave", () => {
      if (!state.hoveredBrush) return;
      state.hoveredBrush = null;
      draw();
    });

    canvas.addEventListener("dblclick", event => {
      const pos = pointerPos(event);
      const cell = pixelToHex(pos.x, pos.y);
      if (cell) {
        state.selected = cell;
        setTool("select");
        syncDetails();
        draw();
        els.selectedName.focus();
      }
    });

    canvas.addEventListener("wheel", event => {
      event.preventDefault();
      const pos = pointerPos(event);
      setZoom(state.scale + (event.deltaY > 0 ? -.08 : .08), pos);
    }, { passive: false });

    canvas.addEventListener("contextmenu", event => event.preventDefault());
    window.addEventListener("resize", resizeCanvas);

    initControls();
    loadLocal();
    resizeCanvas();
    centerMap();
    syncDetails();
    updatePlaces();

