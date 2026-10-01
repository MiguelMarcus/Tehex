(function () {
const terrains = [
  { id: "grass", name: "Campo", color: "#9cab58", edge: "#81954d", icon: "assets/hex-icons/catalog/high-grass.svg" },
  { id: "island", name: "Ilha", color: "#9cab58", edge: "#81954d" },
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

Object.assign(placeTypes, {
  woodenDoor: { label: "Porta de madeira", color: "#653f24", icon: "assets/hex-icons/catalog/wooden-door.svg" },
  medievalVillage: { label: "Aldeia medieval", color: "#653f24", icon: "assets/hex-icons/catalog/medieval-village-01.svg" },
  whiteTower: { label: "Torre branca", color: "#d8d8d2", icon: "assets/hex-icons/catalog/white-tower.svg" },
  danger: { label: "Sinal de perigo", color: "#9b2f2f", icon: "assets/hex-icons/catalog/cancel.svg" },
  dolmen: { label: "Dolmen", color: "#6f6250", icon: "assets/hex-icons/catalog/dolmen.svg" },
  diabloSkull: { label: "Caveira demoníaca", color: "#3c3b36", icon: "assets/hex-icons/catalog/diablo-skull.svg" },
  mayanPyramid: { label: "Pirâmide maia", color: "#ad8c4b", icon: "assets/hex-icons/catalog/mayan-pyramid.svg" },
  church: { label: "Igreja", color: "#d8d8d2", icon: "assets/hex-icons/catalog/church.svg?v=20260930-2" },
  goblinCamp: { label: "Acampamento goblin", color: "#4b5f32", icon: "assets/hex-icons/catalog/goblin-camp.svg?v=20260930-2" },
  deathSkull: { label: "Caveira", color: "#3c3b36", icon: "assets/hex-icons/catalog/death-skull.svg" },
  tombstone: { label: "Lápide", color: "#82796a", icon: "assets/hex-icons/catalog/tombstone.svg" },
  graveyard: { label: "Cemitério", color: "#5a4b3d", icon: "assets/hex-icons/catalog/graveyard.svg?v=20260930-2" }
  , totem: { label: "Totem", color: "#6f6250", icon: "assets/hex-icons/catalog/totem.svg" }
  , axeInStump: { label: "Machado no tronco", color: "#653f24", icon: "assets/hex-icons/catalog/axe-in-stump.svg" }
  , grainBundle: { label: "Feixe de grãos", color: "#ad8c4b", icon: "assets/hex-icons/catalog/grain-bundle.svg" }
  , chest: { label: "Baú", color: "#ad8c4b", icon: "assets/hex-icons/catalog/chest.svg" }
  , campfire: { label: "Fogueira", color: "#9b2f2f", icon: "assets/hex-icons/catalog/campfire.svg" }
  , twoCoins: { label: "Duas moedas", color: "#ad8c4b", icon: "assets/hex-icons/catalog/two-coins.svg" }
  , horseshoe: { label: "Ferradura", color: "#82796a", icon: "assets/hex-icons/catalog/horseshoe.svg" }
});

const terrainGroups = [
  { id: "lowlands", name: "Planicies", terrains: ["grass", "island", "sand", "snow", "mushroom"] }, { id: "forests", name: "Florestas", terrains: ["forest", "denseForest", "willowForest", "deadForest"] }, { id: "highlands", name: "Altitudes", terrains: ["hills", "mountain", "volcano"] }, { id: "waters", name: "Aguas", terrains: ["water", "ocean", "swamp"] }
];

const borderColors = ["none", "#000000", "#55493b", "#77664b", "#9a7c49", "#2f6f78", "#6d4f69", "#ffffff"];

window.MapCatalog = { terrains, placeTypes, terrainGroups, borderColors };
})();
