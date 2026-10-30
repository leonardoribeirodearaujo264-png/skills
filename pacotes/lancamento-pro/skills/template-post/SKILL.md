---
name: template-post
description: Cria a especificação de um post estático único para feed (1080 x 1350 ou 1080 x 1080), com grade, margens seguras, hierarquia de texto, cores em hex com contraste conferido, e um HTML ou SVG editável que o usuário abre no navegador e exporta. Use quando o lançamento precisar de um post de imagem única, como anúncio de data, convite para aula ou chamada para a lista, ou de um modelo reutilizável para vários posts iguais.
---

# Template de post

Esta skill entrega um post de imagem única pronto para editar: medidas, grade, posição de cada elemento, texto de rascunho e um arquivo HTML ou SVG com as camadas no lugar, as fontes importadas e cada linha de texto já quebrada. O usuário abre no navegador, troca o texto e exporta pelo navegador ou pelo Inkscape, editor gratuito. Nenhuma imagem é gerada por API paga.

## Quando usar

- Um post isolado: data do evento, convite, chamada para a lista, frase de autoridade.
- Um modelo fixo para repetir com textos diferentes ao longo do lançamento.

Para sequência de vários slides, use criar-carrossel. Para a capa vertical de vídeo, use capa-reels. Se ainda não existem cores e fontes do lançamento, rode paleta-tipografia antes.

## O que pedir antes

- Objetivo do post e a ação esperada (salvar, comentar, clicar no link da bio).
- Formato: 1080 x 1350 (retrato, padrão recomendado para feed) ou 1080 x 1080.
- Paleta e fontes, com o nome exato da fonte no Google Fonts ou o arquivo dela. Sem elas, usar neutros e fonte do sistema e avisar.
- Texto principal ou tema. Fotos e logotipo, se houver, com caminho do arquivo.
- Área regulada: regra do conselho que limita o que pode aparecer.

## Passo a passo

1. **Defina uma mensagem.** Uma ideia por post, com título de até oito palavras e apoio de até vinte. Pronto quando o título sozinho já entrega a ideia.
2. **Monte a grade.** Margem segura de 80 px em todos os lados, grade de 6 colunas com 24 px de espaço entre elas (colunas de 133 px, arredondando para baixo), e área de texto que não passa de 920 px de largura. Pronto quando cada elemento tem x, y, largura e altura definidos.
3. **Defina a hierarquia.** Título de 72 a 96 px, apoio de 32 a 40 px, marca ou @ de 24 a 28 px. Um único ponto de entrada visual. No máximo 3 cores de texto no post inteiro, contando a cor usada sobre bloco escuro. Pronto quando a ordem de leitura é título, apoio, ação e há no máximo 3 cores de texto.
4. **Aplique as cores e confira o contraste.** Use a paleta do lançamento. Calcule a razão de cada par texto/fundo com a fórmula de luminância relativa do WCAG; mínimo 4,5:1 para o apoio e 3:1 para título acima de 24 px. Texto sobre foto precisa de camada escura ou clara por baixo, com o contraste calculado sobre a cor dessa camada. Pronto quando cada par tem razão anotada.
5. **Escreva o texto de rascunho.** Sem urgência falsa e sem número ou depoimento inventado; usar [NÚMERO REAL] e [DEPOIMENTO REAL] quando faltar. Pronto quando o texto existe e está dividido por bloco.
6. **Quebre as linhas à mão.** SVG não quebra linha sozinho. Estime a largura de cada linha como número de caracteres x 0,55 x tamanho da fonte (fonte sem serifa em negrito) e quebre antes de passar de 920 px. Um título a 88 px cabe em cerca de 19 caracteres por linha. Entrelinha de 1,1 a 1,2 vez o tamanho da fonte. Pronto quando cada linha está listada com a largura estimada abaixo de 920 px.
7. **Gere o arquivo.** HTML com um `div` de 1080 x 1350 px e posição absoluta (quebra linha sozinho dentro de `width: 920px`), ou SVG com `viewBox="0 0 1080 1350"` e uma linha por `<text>` ou por `<tspan>`, como no esqueleto. Importe as fontes no próprio arquivo (`@import` do Google Fonts ou `@font-face` com o arquivo local) e avise que, sem a fonte carregada, a fonte de reserva muda a largura do texto. Variáveis de cor no topo e comentário indicando onde trocar foto e texto. Pronto quando o arquivo abre no navegador com a fonte certa e nenhuma linha passa da margem.
8. **Explique a exportação.** Duas opções, escritas para o usuário:
   - Navegador: zoom em 100% e escala da tela do sistema em 100%. Com escala de 125% ou 150%, a captura sai maior que 1080 px; nesse caso, ative a emulação de dispositivo das DevTools com proporção de pixel 1. Depois use "Capturar captura de tela do nó" no elemento do post.
   - Inkscape, editor gratuito: abrir o SVG, Arquivo > Exportar, PNG com largura 1080 px. A fonte precisa estar instalada no computador, porque o Inkscape não lê o `@import`.
   Pronto quando o passo está escrito e inclui conferir que o PNG final tem 1080 x 1350 px.

## Saída

```text
Post: [objetivo]  |  Formato: 1080 x 1350
Título: [texto]  |  Apoio: [texto]  |  Ação: [texto]

Grade: margem 80 px, 6 colunas de 133 px, espaço 24 px
| Elemento | x | y | largura | altura | fonte | cor |
|---|---|---|---|---|---|---|

Linhas de texto: [linha] ([N] caracteres, cerca de [N] px)
Cores de texto: [até 3]
Contraste: [par] [razão]
Fontes: [nome, importada por @import ou arquivo]
Legenda sugerida: [rascunho, sem envio]
Arquivo: [caminho]/post.html ou post.svg
Exportação: [navegador com escala 100% | Inkscape] e conferir 1080 x 1350 px
```

Esqueleto SVG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=[FONTE+TITULO]:wght@700&amp;family=[FONTE+APOIO]:wght@400&amp;display=swap');
    .titulo { font-family: '[FONTE TÍTULO]', system-ui, sans-serif; font-size: 88px; font-weight: 700; fill: #1A1A2E; }
    .apoio { font-family: '[FONTE APOIO]', system-ui, sans-serif; font-size: 36px; fill: #33334D; }
  </style>
  <rect width="1080" height="1350" fill="#FFFFFF"/>
  <!-- Troque o texto linha por linha; cada linha até cerca de 19 caracteres no título -->
  <text class="titulo" x="80" y="300">
    <tspan x="80" dy="0">[TÍTULO LINHA 1]</tspan>
    <tspan x="80" dy="100">[TÍTULO LINHA 2]</tspan>
  </text>
  <text class="apoio" x="80" y="520">[APOIO LINHA 1]</text>
</svg>
```

## Erros comuns

- Colocar texto colado na borda, onde o feed corta na pré-visualização.
- Escrever o título inteiro num único `<text>` e deixar estourar a margem.
- Não importar a fonte e conferir o tamanho com a fonte de reserva.
- Escrever texto sobre foto sem camada e sem calcular contraste.
- Inventar prova social para preencher espaço.
