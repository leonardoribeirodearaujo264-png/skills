---
name: par-de-fontes
description: Escolhe 2 fontes do Google Fonts por objetivo (título e texto), monta a escala tipográfica e confere legibilidade antes de entregar. Use quando o pedido for escolher fonte, combinar fontes ou definir a tipografia de um post, página, apresentação ou marca.
---

# Par de fontes

Entrega um **par**: uma fonte de título, que carrega a personalidade, e uma fonte de texto, que carrega a leitura. Duas famílias bastam para quase tudo; a terceira só entra para código ou números tabulares.

## Passo a passo

1. **Defina o objetivo.** Descubra onde o texto vai aparecer (post, página, slide, vídeo) e o tom da marca em três adjetivos. Se o usuário já tem uma fonte, ela entra no par e você escolhe só a outra. Pronto quando você tem a mídia, os três adjetivos e as fontes já fixadas, se houver.

2. **Escolha o par.** Parta da tabela abaixo e adapte ao tom. Para cada fonte, confirme na página `https://fonts.google.com/specimen/<Nome+Da+Fonte>` que ela existe, tem os pesos que você vai usar e suporta o subconjunto `latin-ext` ou pelo menos os acentos do português (á, ã, â, ç, é, ê, í, ó, õ, ô, ú). Pronto quando as duas fontes têm página no Google Fonts e os pesos estão anotados.

   | Objetivo | Título | Texto | Por que funciona |
   |---|---|---|---|
   | Sistema, SaaS, painel | Inter (700) | Inter (400) | Uma família só, com pesos bem separados; o contraste vem do peso, não da forma |
   | Tecnologia com personalidade | Space Grotesk (600) | IBM Plex Sans (400) | Formas geométricas no título, texto neutro e muito legível |
   | Editorial, blog, revista | Fraunces (600) | Source Sans 3 (400) | Serifa expressiva contra sem serifa calma |
   | Premium, beleza, moda | Cormorant Garamond (600) | Manrope (400) | Serifa de alto contraste com texto limpo e arejado |
   | Jurídico, consultoria, finanças | Libre Baskerville (700) | Source Sans 3 (400) | Serifa tradicional transmite seriedade sem perder leitura |
   | Curso, educação | DM Serif Display (400) | DM Sans (400) | Mesma origem de desenho, contraste de estilo garantido |
   | Post de impacto, anúncio | Bebas Neue (400) | Inter (500) | Título condensado ocupa a largura; texto firme abaixo |
   | Marca jovem, criadores | Bricolage Grotesque (700) | Plus Jakarta Sans (400) | Título com caráter, texto amigável |
   | Alimentação, varejo local | Playfair Display (700) | Nunito (400) | Serifa clássica com texto arredondado e acolhedor |

   O contraste do par vem de **uma** diferença clara: serifa contra sem serifa, condensada contra larga, ou peso muito diferente. Duas sem serifas parecidas brigam entre si.

3. **Monte a escala.** Escolha a razão pela mídia e multiplique a partir do tamanho do texto:
   - página e sistema: base 16 px, razão 1,25;
   - apresentação 1920x1080: base 28 px, razão 1,333;
   - post 1080x1080 ou 1080x1350: base 32 px, razão 1,5;
   - story 1080x1920: base 36 px, razão 1,5.

   Arredonde para inteiro e entregue de 5 a 6 degraus nomeados (`legenda`, `texto`, `subtitulo`, `titulo`, `destaque`). Altura de linha: 1,05 a 1,2 nos títulos, 1,4 a 1,6 no texto. Pronto quando cada degrau tem tamanho, peso, altura de linha e fonte.

4. **Confira a legibilidade.** Monte uma página HTML de amostra com as duas fontes carregadas por `<link>` do Google Fonts, aplique a escala com um título, um parágrafo de verdade em português e os caracteres `Il1 O0 ç ã õ R$ 1.234,56`. Fotografe com o navegador headless (`--headless=new --screenshot`, como na skill mockup) e passe por cada item:
   - texto corrido no tamanho da mídia é lido sem esforço no PNG em 1x;
   - `I`, `l` e `1` se distinguem, assim como `O` e `0`;
   - acentos e cedilha aparecem na fonte certa, sem trocar para a fonte do sistema;
   - contraste de cor de pelo menos 4,5:1 no texto e 3:1 em título grande (WCAG);
   - linhas de texto com 45 a 75 caracteres em página; em post, no máximo 7 palavras por linha de título.

   Pronto quando todos os itens passam. Se um falhar, troque a fonte de texto antes de mexer na de título.

5. **Entregue.** Devolva o par com o motivo da escolha em uma frase, a escala em tabela, o `<link>` do Google Fonts com só os pesos usados, as variáveis CSS e o PNG de amostra. Lembre que as fontes do Google Fonts têm licença aberta (a maioria OFL): o usuário confere a licença na página de cada fonte. Para usar em apresentação ou programa no computador, a fonte precisa estar instalada na máquina.

## Regras de qualidade

- No máximo 2 famílias e 4 pesos no total, para a página carregar rápido e o visual ficar coeso.
- Título e texto se diferenciam à primeira vista; se for preciso olhar duas vezes, aumente o contraste.
- Texto corrido nunca em fonte decorativa, condensada ou de pincel.
- Peso de texto entre 400 e 500. Peso 300 só em tamanhos grandes.
- Os números do par vêm de fontes reais e da escala calculada, conferidos no PNG.

## Exemplo de pedido

> Quero as fontes para os posts do meu escritório de advocacia. Sério, mas não antiquado. Posts em 1080x1350.

Resposta esperada: Libre Baskerville 700 no título e Source Sans 3 400 e 600 no texto; escala com base 32 px e razão 1,5 (legenda 21, texto 32, subtítulo 48, título 72, destaque 108); `<link>` com os três pesos; variáveis `--fonte-titulo` e `--fonte-texto`; e o PNG de amostra 1080x1350 conferido.
