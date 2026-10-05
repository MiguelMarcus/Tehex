# Mapa Hex Local

Editor local de mapas hexagonais para criar terrenos, lugares, ruas e rios.

## Uso

Abra `https://miguelmarcus.github.io/Tehex/` em um navegador. O editor salva os mapas neste navegador e permite exportar ou importar JSON, além de exportar PNG e UVTT.

## Foundry VTT v14

Em **PNG → Formato**, escolha **UVTT (Foundry)** e exporte o mapa. No Foundry, instale e habilite o módulo **Universal Battlemap Importer**, importe o `.uvtt` pela aba de Cenas e abra a cena criada. O arquivo inclui a imagem e a escala em pixels da grade.

O formato UVTT não define o tipo de grade. Para ter hexágonos interativos alinhados ao mapa, clique em **Copiar macro da grade hexagonal** no editor, crie uma macro do tipo Script no Foundry, cole o código e execute-a com a cena importada aberta. É necessário fazer essa etapa uma vez para cada cena importada. O exportador deixa a grade visual fora da imagem UVTT para evitar linhas duplicadas.

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

