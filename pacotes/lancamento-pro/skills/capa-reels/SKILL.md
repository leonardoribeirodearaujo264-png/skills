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
- Paleta e fontes do lançamento.
- Se é capa única ou série, e quantos vídeos terá a série.

## Zonas

| Zona | Medida | Por quê |
|---|---|---|
| Quadro completo | 1080 x 1920 | tela cheia |
| Recorte do feed | 1080 x 1350, centralizado (y de 285 a 1635) | pré-visualização no feed |
| Recorte da grade | região central próxima de 1080 x 1440 (y de 240 a 1680) | miniatura do perfil |
| Zona segura de texto | x de 90 a 990, y de 420 a 1500 | fica visível nos recortes e longe dos ícones |

As proporções de recorte mudam com atualizações da plataforma. Se o usuário tiver um print recente do perfil, confira antes de fechar a grade.

## Passo a passo

1. **Escreva o título da capa.** Até seis palavras, que digam o assunto ou o benefício. Sem caixa alta no texto inteiro se a fonte ficar pesada demais. Pronto quando o título cabe em até três linhas na zona segura.
2. **Posicione dentro da zona segura.** Título, rosto e elementos principais entre y 420 e y 1500. Nada importante no terço inferior, onde ficam legenda e botões. Pronto quando nenhum elemento essencial sai da zona segura.
3. **Defina os tamanhos.** Título de 96 a 130 px, peso forte, entrelinha 1,1. Número do episódio ou selo da série de 40 a 56 px. Pronto quando o título é legível em miniatura de cerca de 120 px de largura.
4. **Trate o fundo.** Com foto, aplique camada de cor sólida ou gradiente sob o texto e calcule o contraste sobre a cor dessa camada. Sem foto, use fundo sólido da paleta. Pronto quando o par texto/fundo tem razão de pelo menos 4,5:1 calculada pela fórmula de luminância do WCAG.
5. **Padronize a série.** Mesma posição de título, mesma faixa de cor, numeração no mesmo canto. Pronto quando trocar só o texto e a foto basta para criar a próxima capa.
6. **Gere o arquivo.** HTML de 1080 x 1920 ou SVG com `viewBox="0 0 1080 1920"`, com as guias dos recortes em camada que pode ser ocultada (classe `.guia`). Pronto quando abre no navegador e, com as guias visíveis, o título está dentro das três áreas.
7. **Explique a exportação.** Ocultar as guias, capturar o nó em tamanho real e enviar a imagem como capa no app. Pronto quando o passo está escrito.

## Saída

```text
Capa: [tema]  |  Série: [nome e número ou "única"]
Título: [texto em até 3 linhas]
Fonte: [família] [tamanho] [peso]
Cores: texto [hex] sobre [hex]  |  Razão: [valor]
Foto: [arquivo ou "sem foto"]  |  Camada: [hex e opacidade]
Arquivo: [caminho]/capa.html ou capa.svg
```

Guias no SVG:

```svg
<g class="guia" fill="none" stroke="#C2410C" stroke-dasharray="12 8">
  <rect x="0" y="285" width="1080" height="1350"/>
  <rect x="90" y="420" width="900" height="1080"/>
</g>
```

## Erros comuns

- Título no topo do quadro, cortado no feed e na grade.
- Texto sobre rosto ou sobre área clara da foto, sem camada.
- Capa que repete a legenda inteira em vez de um título curto.
- Cada vídeo com um estilo, o que faz a grade parecer bagunçada.
- Esquecer de ocultar as guias antes de exportar.
