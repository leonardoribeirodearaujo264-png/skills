---
name: capa-reels
description: Especifica a capa de um Reels ou vídeo vertical em 1080 x 1920, respeitando o recorte de 1080 x 1350 do feed e o recorte central da grade do perfil, com título, cores em hex com contraste conferido e um HTML ou SVG para montar e exportar. Use quando o lançamento tiver vídeos curtos que precisam de capa legível no perfil e no feed, ou de uma série de capas com padrão visual único.
---

# Capa de Reels

Esta skill entrega a capa de um vídeo vertical que continua legível nos três lugares onde aparece: tela cheia, feed e grade do perfil. O resultado é a especificação com zonas seguras, o título, as cores com contraste calculado e um arquivo HTML ou SVG com guias de recorte. Nenhuma imagem é gerada por API paga; a foto, se houver, vem do usuário ou de um quadro do próprio vídeo.

## Quando usar

- Cada vídeo do lançamento precisa de capa.
- O perfil está com capas desencontradas e o usuário quer um padrão para a série.
- O título da capa aparece cortado na grade do perfil.

Para post estático de feed, use template-post. Para sequência de slides, use criar-carrossel. Para definir cores e fontes do lançamento, use paleta-tipografia.

## O que pedir antes

- Tema do vídeo e a promessa em uma frase.
- Foto ou quadro do vídeo a usar (caminho do arquivo), se houver.
- Paleta e fontes do lançamento. Se a fonte não estiver instalada, ela entra por link do Google Fonts no HTML, ou a capa usa uma fonte de reserva declarada.
- Se é capa única ou série, e quantos vídeos terá a série.
- Se há navegador para abrir o arquivo. Arquivo local costuma precisar de servidor local para abrir no visualizador (por exemplo, `python -m http.server 8000` na pasta do arquivo, e abrir `http://localhost:8000/capa.svg`).

## Zonas

| Zona | Medida | Por quê |
|---|---|---|
| Quadro completo | 1080 x 1920 | tela cheia |
| Recorte do feed | 1080 x 1350, centralizado (y de 285 a 1635) | pré-visualização no feed |
| Recorte da grade | região central próxima de 1080 x 1440 (y de 240 a 1680) | miniatura do perfil |
| Zona segura de texto | x de 90 a 990, y de 420 a 1280 | dentro dos dois recortes e acima do terço inferior, onde ficam legenda e botões |

A zona segura termina em y 1280 porque o terço inferior do quadro (y 1280 a 1920) fica coberto por legenda e botões na tela cheia. Abaixo de y 1280 só entra fundo ou foto, nada essencial. As proporções de recorte mudam com atualizações da plataforma. Se o usuário tiver um print recente do perfil, confira antes de fechar a grade.

## Passo a passo

1. **Escreva o título da capa.** Até seis palavras, que digam o assunto ou o benefício. Sem caixa alta no texto inteiro se a fonte ficar pesada demais. Pronto quando o título cabe em até três linhas na zona segura.
2. **Posicione dentro da zona segura.** Título, rosto, selo e elementos principais entre x 90 e 990 e entre y 420 e y 1280. Pronto quando as coordenadas de cada elemento essencial estão anotadas e todas ficam dentro da zona.
3. **Defina os tamanhos.** Título de 100 a 130 px, peso forte, entrelinha 1,1. Número do episódio ou selo da série de 40 a 56 px. Critério da miniatura: tamanho do título x 120 / 1080 deve dar pelo menos 11 px (título de 100 px vira cerca de 11 px na miniatura de 120 px de largura). Meça ou estime a largura da linha mais longa na fonte escolhida e na de reserva. Pronto quando a conta da miniatura está escrita e a linha mais longa cabe nos 900 px da zona.
4. **Trate o fundo.** Com foto, use sob o texto uma camada ou faixa 100% opaca e calcule o contraste sobre a cor dessa camada. Se a camada for semitransparente ou gradiente, calcule sobre a cor misturada no ponto mais claro da foto atrás do texto (cor = camada x opacidade + foto x (1 - opacidade)). Sem foto, use fundo sólido da paleta. Pronto quando o par texto/fundo tem razão de pelo menos 4,5:1 calculada pela fórmula de luminância do WCAG, sobre a cor real atrás do texto.
5. **Padronize a série.** Mesma posição de título, mesma faixa de cor, numeração no mesmo canto. Pronto quando trocar só o texto e a foto basta para criar a próxima capa.
6. **Gere o arquivo.** HTML de 1080 x 1920 ou SVG com `viewBox="0 0 1080 1920"`, com as três guias (feed, grade e zona segura) em camada que pode ser ocultada (classe `.guia`). Foto referenciada por caminho relativo, na mesma pasta do arquivo. Pronto quando o arquivo tem as três guias e o título está dentro das três áreas.
7. **Confira.** Com navegador, abra o arquivo (por servidor local, se for arquivo solto), veja as guias e confirme que nada essencial sai da zona segura. Sem navegador, confira pelas coordenadas do código e registre "estimado pelo código" ou "não verificado" na saída. Pronto quando o estado da conferência está escrito.
8. **Explique a exportação.** Ocultar as guias, capturar o nó em tamanho real (no Chrome ou Edge: DevTools, "Capture node screenshot" no elemento, zoom em 100%) e enviar a imagem como capa no app. Pronto quando o passo está escrito.

## Saída

```text
Capa: [tema]  |  Série: [nome e número ou "única"]
Título: [texto em até 3 linhas]
Fonte: [família] [tamanho] [peso] | Reserva: [família] | Miniatura: [tamanho x 120 / 1080] px
Posições: [elemento: x de .. a .., y de .. a ..] (todos entre y 420 e 1280)
Cores: texto [hex] sobre [hex]  |  Razão: [valor]
Foto: [arquivo ou "sem foto"]  |  Camada: [hex e opacidade]
Arquivo: [caminho]/capa.html ou capa.svg
Conferência visual: [verificada no navegador | estimado pelo código | não verificado]
```

Guias no SVG (as três áreas):

```svg
<g class="guia" fill="none" stroke="#C2410C" stroke-width="4" stroke-dasharray="12 8">
  <rect x="0" y="285" width="1080" height="1350"/>  <!-- recorte do feed -->
  <rect x="0" y="240" width="1080" height="1440"/>  <!-- recorte da grade -->
  <rect x="90" y="420" width="900" height="860"/>   <!-- zona segura de texto, y 420 a 1280 -->
</g>
```

## Erros comuns

- Título no topo do quadro, cortado no feed e na grade.
- Texto no terço inferior, coberto pela legenda e pelos botões.
- Contraste calculado sobre a cor pura de uma camada semitransparente.
- Cada vídeo com um estilo, o que faz a grade parecer bagunçada.
- Esquecer de ocultar as guias antes de exportar.
