# Formatos, reenquadramento e safe zones

## Alvos

| Nome | Resolução | Proporção | Onde |
|---|---|---|---|
| `reels` / `shorts` / `tiktok` | 1080×1920 | 9:16 | Reels, Shorts, TikTok |
| `youtube` | 1920×1080 | 16:9 | YouTube, site, LinkedIn |
| `feed` | 1080×1350 | 4:5 | feed do Instagram |
| `square` | 1080×1080 | 1:1 | feed, carrossel |
| `4k` | 3840×2160 | 16:9 | master de arquivo |

## Reenquadrar sem esticar

```bash
va reframe entrada.mp4 -o saida.mp4 --format reels --mode crop --anchor top
```

**Nunca use `scale=W:H` sozinho.** Isso muda a proporção do pixel e alarga os
rostos. Os três modos disponíveis, em ordem de preferência:

- **`crop`** — corte duro para a proporção alvo, ancorado onde está o assunto.
  Perde pixels nas laterais. Correto para talking head.
- **`blurpad`** — encaixa o frame inteiro e preenche o resto com uma cópia
  escalada e desfocada de si mesmo. Não perde nada. Correto para gravação de
  tela, slide, documento — qualquer frame onde cortar apagaria informação.
- **`pad`** — barras de cor lisa. Só quando a estética pedir.

### Âncora

`--anchor center|top|upper|bottom|left|right` ou um número 0.0–1.0.

**`top` é o padrão certo para talking head horizontal indo para 9:16.** Um
crop centralizado de um frame 16:9 costuma cair no peito, não no rosto.

De 1920×1080 para 1080×1920 o crop descarta ~68% da imagem. O `reframe` avisa
quando a perda passa de 1%. Se houver informação útil nas bordas, use
`blurpad`.

## Safe zones

### Vertical (Reels / Shorts / TikTok)

A interface da plataforma cobre aproximadamente:

- **topo ~12%** — barra de status, header, botão de voltar
- **base ~25–30%** — legenda do post, @usuário, áudio, botão de seguir
- **direita ~15%** — coluna de ações (curtir, comentar, compartilhar)

Nada essencial nessas faixas. As margens dos estilos de legenda vertical
(360–440 de 1080) já respeitam isso.

Deixe o rosto na faixa vertical entre ~15% e ~65% da altura.

### Horizontal (YouTube)

Sem UI sobreposta no player de desktop, mas:

- os controles aparecem nos ~10% de baixo durante o hover
- a barra de progresso ocupa os ~5% inferiores
- no mobile, título e canal cobrem o topo em tela cheia

Margem inferior de 90–130 (de 1080) resolve.

### Universal

Não coloque informação essencial colada em nenhuma borda. Uma margem de 5% em
cada lado é o mínimo em qualquer formato.

## Render final

MP4 / H.264 / AAC:

```
-c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -movflags +faststart
-c:a aac -b:a 192k -ar 48000
```

- **`yuv420p` é obrigatório.** Outros pix_fmt não decodificam em player móvel.
  O `va qc` marca como FALHA.
- **`+faststart`** move o índice para o começo do arquivo: o vídeo começa a
  tocar antes de baixar inteiro.
- **CRF 18** para entrega, 23 para preview. Abaixo de 16 o ganho é invisível e
  o arquivo dobra.
- **Dimensões pares** em ambos os eixos — exigência do H.264.
- Mantenha o mesmo fps em todos os segmentos, ou o concat dessincroniza áudio e
  vídeo. Se as fontes têm fps diferentes, converta antes.

## Estrutura de entrega

```
exports/final.mp4          <- o vídeo
edit/transcripts/*.json    <- transcrição bruta, palavra a palavra
edit/master.srt            <- legenda sidecar
captions/captions.ass      <- legenda estilizada
edit/edl.json              <- o "projeto": todas as decisões de corte
edit/project.md            <- relatório da edição
```

O `edl.json` é o arquivo editável: mudar um `start`/`end` e re-renderizar
refaz o corte sem refazer nada mais.
