(function () {
const terrains = [
  { id: "grass", name: "Campo", color: "#9cab58", edge: "#81954d", icon: "assets/hex-icons/catalog/high-grass.svg" },
  { id: "forest", name: "Floresta", color: "#3d602e", edge: "#5f7e3f", icon: "assets/hex-icons/catalog/pine-tree.svg" },
  { id: "denseForest", name: "Bosque", color: "#315124", edge: "#4f7137", icon: "assets/hex-icons/catalog/beech.svg" },
  { id: "willowForest", name: "Salgueiral", color: "#486d3d", edge: "#668956", icon: "assets/hex-icons/catalog/willow-tree.svg" },
  { id: "deadForest", name: "Floresta morta", color: "#5a4b3d", edge: "#7a6954", icon: "assets/hex-icons/catalog/dead-wood.svg" },
  { id: "hills", name: "Colina", color: "#ad8c4b", edge: "#ba9b57", icon: "assets/hex-icons/catalog/peaks.svg" },
  { id: "mountain", name: "Montanha", color: "#82796a", edge: "#aaa08d", icon: "assets/hex-icons/catalog/peaks.svg" },
  { id: "volcano", name: "Vulcao", color: "#742f36", edge: "#964951", icon: "assets/hex-icons/catalog/caldera.svg" },
  { id: "water", name: "Agua", color: "#376f9e", edge: "#4e8eb9", icon: "assets/hex-icons/catalog/waves.svg" },
  { id: "ocean", name: "Oceano", color: "#214b70", edge: "#366c93", icon: "assets/hex-icons/catalog/waves.svg" },
  { id: "swamp", name: "Pantano", color: "#4b5f32", edge: "#748344", icon: "assets/hex-icons/catalog/reed.svg" },
  { id: "mushroom", name: "Cogumelos", color: "#76527d", edge: "#94669c", icon: "assets/hex-icons/catalog/mushroom-gills.svg" },
  { id: "sand", name: "Areia", color: "#c0a565", edge: "#d2bd7d", icon: "assets/hex-icons/catalog/cactus.svg" },
  { id: "snow", name: "Neve", color: "#c5cfca", edge: "#aebbb5", icon: "assets/hex-icons/catalog/snowing.svg" }
];

const placeTypes = {
  settlement: { label: "Povoado", color: "#653f24", icon: "assets/hex-icons/catalog/village.svg" }, castle: { label: "Castelo", color: "#3f4751", icon: "assets/hex-icons/catalog/castle.svg" }, temple: { label: "Templo", color: "#7c5a24", icon: "assets/hex-icons/temple.svg" }, tower: { label: "Torre", color: "#4d5360", icon: "assets/hex-icons/catalog/tower-flag.svg" }, ruins: { label: "Ruinas", color: "#6f6250", icon: "assets/hex-icons/catalog/dead-wood.svg" }, mine: { label: "Mina", color: "#3c3b36", icon: "assets/hex-icons/catalog/cave-entrance.svg" }, hut: { label: "Cabana", color: "#653f24", icon: "assets/hex-icons/catalog/hut.svg" }, house: { label: "Casa", color: "#653f24", icon: "assets/hex-icons/catalog/house.svg" }, camp: { label: "Acampamento", color: "#653f24", icon: "assets/hex-icons/catalog/camping-tent.svg" }, windmill: { label: "Moinho", color: "#653f24", icon: "assets/hex-icons/catalog/windmill.svg" }, pier: { label: "Pier", color: "#653f24", icon: "assets/hex-icons/catalog/wooden-pier.svg" }, bridge: { label: "Ponte", color: "#653f24", icon: "assets/hex-icons/catalog/tall-bridge.svg" }, signpost: { label: "Placa", color: "#653f24", icon: "assets/hex-icons/catalog/direction-signs.svg" }, galleon: { label: "Galeao", color: "#653f24", icon: "assets/hex-icons/catalog/galleon.svg" }, citadel: { label: "Cidadela", color: "#653f24", icon: "assets/hex-icons/catalog/qaitbay-citadel.svg" }
};

const terrainGroups = [
  { id: "lowlands", name: "Planicies", terrains: ["grass", "sand", "snow", "mushroom"] }, { id: "forests", name: "Florestas", terrains: ["forest", "denseForest", "willowForest", "deadForest"] }, { id: "highlands", name: "Altitudes", terrains: ["hills", "mountain", "volcano"] }, { id: "waters", name: "Aguas", terrains: ["water", "ocean", "swamp"] }
];

const borderColors = ["none", "#000000", "#55493b", "#77664b", "#9a7c49", "#2f6f78", "#6d4f69", "#ffffff"];

window.MapCatalog = { terrains, placeTypes, terrainGroups, borderColors };
})();
