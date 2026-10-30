---
name: template-post
description: Cria a especificação de um post estático único para feed (1080 x 1350 ou 1080 x 1080), com grade, margens seguras, hierarquia de texto, cores em hex com contraste conferido, e um HTML ou SVG editável que o usuário abre no navegador e exporta. Use quando o lançamento precisar de um post de imagem única, como anúncio de data, convite para aula ou chamada para a lista, ou de um modelo reutilizável para vários posts iguais.
---

# Template de post

Esta skill entrega um post de imagem única pronto para editar: medidas, grade, posição de cada elemento, texto de rascunho e um arquivo HTML ou SVG com as camadas no lugar. O usuário abre no navegador, troca o texto e exporta por captura de tela ou pelo próprio editor de imagem. Nenhuma imagem é gerada por API paga.

## Quando usar

- Um post isolado: data do evento, convite, chamada para a lista, frase de autoridade.
- Um modelo fixo para repetir com textos diferentes ao longo do lançamento.

Para sequência de vários slides, use criar-carrossel. Para a capa vertical de vídeo, use capa-reels. Se ainda não existem cores e fontes do lançamento, rode paleta-tipografia antes.

## O que pedir antes

- Objetivo do post e a ação esperada (salvar, comentar, clicar no link da bio).
- Formato: 1080 x 1350 (retrato, padrão recomendado para feed) ou 1080 x 1080.
- Paleta e fontes. Sem elas, usar neutros e fonte do sistema e avisar.
- Texto principal ou tema. Fotos e logotipo, se houver, com caminho do arquivo.
- Área regulada: regra do conselho que limita o que pode aparecer.

## Passo a passo

1. **Defina uma mensagem.** Uma ideia por post, com título de até oito palavras e apoio de até vinte. Pronto quando o título sozinho já entrega a ideia.
2. **Monte a grade.** Margem segura de 80 px em todos os lados, grade de 6 colunas com 24 px de espaço entre elas, e área de texto que não passa de 920 px de largura. Pronto quando cada elemento tem x, y, largura e altura definidos.
3. **Defina a hierarquia.** Título de 72 a 96 px, apoio de 32 a 40 px, marca ou @ de 24 a 28 px. Um único ponto de entrada visual. Pronto quando a ordem de leitura é título, apoio, ação.
4. **Aplique as cores e confira o contraste.** Use a paleta do lançamento. Calcule a razão de cada par texto/fundo com a fórmula de luminância relativa do WCAG; mínimo 4,5:1 para o apoio e 3:1 para título acima de 24 px. Texto sobre foto precisa de camada escura ou clara por baixo, com o contraste calculado sobre a cor dessa camada. Pronto quando cada par tem razão anotada.
5. **Escreva o texto de rascunho.** Sem urgência falsa e sem número ou depoimento inventado; usar [NÚMERO REAL] e [DEPOIMENTO REAL] quando faltar. Pronto quando o texto cabe nas caixas da grade sem reduzir a fonte abaixo do mínimo.
6. **Gere o arquivo.** HTML com um `div` de 1080 x 1350 px e posição absoluta, ou SVG com `viewBox="0 0 1080 1350"`. Textos editáveis, variáveis de cor no topo, comentário indicando onde trocar foto e texto. Pronto quando abre no navegador e o texto não estoura as margens.
7. **Explique a exportação.** No navegador, DevTools, captura de nó em tamanho real; ou abrir o SVG em editor gratuito e exportar PNG. Pronto quando o passo está escrito para o usuário.

## Saída

```text
Post: [objetivo]  |  Formato: 1080 x 1350
Título: [texto]  |  Apoio: [texto]  |  Ação: [texto]

Grade: margem 80 px, 6 colunas, espaço 24 px
| Elemento | x | y | largura | altura | fonte | cor |
|---|---|---|---|---|---|---|

Contraste: [par] [razão]
Legenda sugerida: [rascunho, sem envio]
Arquivo: [caminho]/post.html ou post.svg
```

Esqueleto SVG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <rect width="1080" height="1350" fill="#FFFFFF"/>
  <text x="80" y="300" font-family="system-ui, sans-serif" font-size="88" font-weight="700" fill="#1A1A2E">[TÍTULO]</text>
</svg>
```

## Erros comuns

- Colocar texto colado na borda, onde o feed corta na pré-visualização.
- Usar quatro tamanhos de fonte e três cores de texto no mesmo post.
- Escrever texto sobre foto sem camada e sem calcular contraste.
- Encher o post com o texto da legenda.
- Inventar prova social para preencher espaço.
