# Mapa Hex Local

Editor local de mapas hexagonais para criar terrenos, lugares, ruas e rios.

## Uso

Abra `index.html` em um navegador ou acesse a versao publicada pelo GitHub Pages. O editor salva os mapas neste navegador e permite exportar ou importar JSON e PNG.

## Estrutura

- `index.html`: estrutura semantica da aplicacao.
- `assets/css/app.css`: estilos e layout.
- `assets/js/app.js`: interface, desenho do mapa e ferramentas.
- `assets/js/data/local-map-store.js`: camada de dados local, responsavel pelos mapas salvos.
- `assets/hex-icons/`: icones SVG de terrenos e lugares.
- `.github/workflows/deploy-pages.yml`: publicacao automatica no GitHub Pages.

## Recursos

- Estilos Moderno e Old School.
- Terrenos organizados por familia.
- Lugares com icones, nomes e tamanhos independentes.
- Ruas e rios livres, com assistencia opcional nas arestas.
- Mapas salvos localmente no navegador.

