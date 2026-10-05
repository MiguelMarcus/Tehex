# Mapa Hex Local

Editor local de mapas hexagonais para criar terrenos, lugares, ruas e rios.

## Uso

Abra `https://miguelmarcus.github.io/Tehex/` em um navegador. O editor salva os mapas neste navegador e permite exportar ou importar JSON, além de exportar PNG e UVTT.

## Foundry VTT v14

Em **Opções → Exportar e importar → Foundry: UVTT + macro**, escolha a resolução e clique em **Exportar UVTT e copiar macro**. O arquivo será baixado e a macro será copiada. No Foundry, instale e habilite o módulo **Universal Battlemap Importer**, importe o `.uvtt` pela aba de Cenas e abra a cena criada. O arquivo inclui a imagem e a escala em pixels da grade.

O formato UVTT não define o tipo de grade. Para ter hexágonos interativos alinhados ao mapa, crie uma macro do tipo Script no Foundry, cole o código copiado e execute-a com a cena importada aberta. É necessário fazer essa etapa uma vez para cada cena importada. A macro define **Hexagonal Columns, Odd** e o tamanho exato da exportação. O exportador deixa a grade visual fora da imagem UVTT para evitar linhas duplicadas.

As resoluções Normal, Alta e Muito alta usam, respectivamente, **70, 120 e 160 pixels por hex** no PNG e no UVTT. Em mapas muito grandes, o tamanho pode ser reduzido para caber no limite de imagem; o valor efetivo é mostrado antes de exportar. Para um PNG comum, o diálogo de exportação também informa o deslocamento exato da imagem no Foundry; ele compensa a margem do PNG e evita calibragem manual.

## Recursos

- Estilos Moderno e Old School.
- Terrenos organizados por familia.
- Lugares com icones, nomes e tamanhos independentes.
- Ruas e rios livres, com assistencia opcional nas arestas.
- Camadas visuais independentes para terreno, grade, relevo, lugares, nomes, ruas e rios.
- Biblioteca reutilizavel de estilos e legenda automatica do mapa.
- Exportacao configuravel com titulo, fundo, coordenadas e etc.
- Atalhos de teclado e painel de ajuda contextual.
- Mapas salvos localmente no navegador.

