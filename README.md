# Mapa Hex Local

Editor local de mapas hexagonais para criar terrenos, lugares, ruas e rios.

## Uso

Abra `https://miguelmarcus.github.io/Tehex/` em um navegador. O editor salva os mapas neste navegador e permite exportar ou importar JSON e PNG.

## Estrutura

- `index.html`: estrutura semantica da aplicacao.
- `assets/css/app.css`: estilos e layout.
- `assets/js/app.js`: interface, desenho do mapa e ferramentas.
- `assets/js/state/map-state.js`: estado inicial compartilhado do mapa.
- `assets/js/services/map-geometry.js`: coordenadas, hit-test e encaixe de traçados nos hexes.
- `assets/js/components/path-tool-controller.js`: criação, seleção e remoção de ruas e rios.
- `assets/js/data/local-map-store.js`: camada de dados local, responsavel pelos mapas salvos.
- `assets/hex-icons/`: icones SVG de terrenos e lugares.
- `.github/workflows/deploy-pages.yml`: publicacao automatica no GitHub Pages.

## Recursos

- Estilos Moderno e Old School.
- Terrenos organizados por familia.
- Lugares com icones, nomes e tamanhos independentes.
- Ruas e rios livres, com assistencia opcional nas arestas.
- Camadas visuais independentes para terreno, grade, relevo, lugares, nomes, ruas e rios.
- Biblioteca reutilizavel de estilos e legenda automatica do mapa.
- Exportacao configuravel em PNG, JPEG ou WebP, com titulo, fundo, coordenadas e legenda.
- Atalhos de teclado e painel de ajuda contextual.
- Mapas salvos localmente no navegador.

