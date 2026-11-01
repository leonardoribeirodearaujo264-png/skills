# Legendas

Gerador: `va captions <transcript.json> --out-dir <dir> --style <estilo>`

Saídas:
- `master.srt` — texto simples, para sidecar e upload nas plataformas
- `captions.ass` — estilizado, com destaque por palavra, para queimar no vídeo

SRT só carrega um estilo para o arquivo inteiro. Destacar um número ou termo
dentro da linha exige tags inline, que só o ASS tem. Por isso os dois.

## Estilos

| Estilo | Palavras/linha | Caixa | Margem inferior (de 1080) |
|---|---|---|---|
| `reels` | 3 | ALTA | 420 |
| `anuncio` | 2 | ALTA | 440 |
| `juridico` | 4 | normal | 380 |
| `podcast` | 4 | normal | 360 |
| `youtube` | 7 | normal | 90 |
| `institucional` | 6 | normal | 130 |

O `PlayResY` do ASS é fixo em 1080, então as margens são independentes da
resolução real — o libass reescala linearmente.

## Safe zones — regra, não gosto

A UI de Reels/Shorts/TikTok (legenda do post, @usuário, música, coluna de
ações à direita) cobre aproximadamente os 25–30% de baixo de um frame
1080×1920. Legenda colada no rodapé é cortada ou tapada.

Por isso `margem_inferior >= 360` nos formatos verticais. Não baixe de 300 sem
um motivo específico.

Em 16:9 a margem pode ser pequena (90–130) porque não há UI sobreposta no
player de desktop.

Nunca coloque informação essencial:
- colada nas bordas
- muito no topo (a barra de status e o header da plataforma ficam ali)
- muito no rodapé
- sobre olhos, boca ou qualquer coisa que o espectador precise ver

## Quebra de linha

O `captions.py` quebra por, nesta ordem de prioridade:

1. pontuação final de frase (`. ? ! :`) — vence o orçamento de palavras, para
   a linha nunca terminar no meio de uma frase quando a fronteira natural está
   a uma palavra de distância
2. silêncio >= `--max-gap` (padrão 0,45s)
3. orçamento de palavras do estilo
4. tempo máximo na tela (`--max-duration`, padrão 3,2s)

Linha com mais de 42 caracteres é sinalizada pelo `va qc`. Acima disso a
leitura em tela pequena quebra.

## Destaque de palavras

```bash
va captions ... --highlight-numbers --highlight "prazo,recurso,artigo"
```

`--highlight-numbers` pega números, valores (`R$`), percentuais, `art.` e `§`.

Destaque **apenas** o que é relevante: números, valores, nomes, conceitos,
palavras-chave, chamadas importantes.

**Não transforme cada palavra numa animação.** Se tudo está destacado, nada
está. Um destaque a cada 8–12 palavras já é bastante.

## Fillers

Por padrão `eh, ah, ahn, hum, ne, tipo, assim, então` saem do **texto da
legenda** — nunca do áudio. A fala continua natural; a legenda fica limpa.

`--keep-fillers` desativa. Útil em PODCAST-PRO, onde a hesitação faz parte da
personagem.

## Sincronia com corte

Se o EDL reordenou ou removeu trechos, as legendas **têm que** vir do render:

```bash
vu render edl.json -o saida.mp4 --build-subtitles
```

Ele aplica `tempo_saida = palavra.inicio - segmento.inicio + offset_do_segmento`.
Gerar legenda com `captions.py` sobre um corte montado sem esse offset produz
dessincronização crescente ao longo do vídeo.

`captions.py` serve para: vídeo na ordem original, ou legenda estilizada que
você queima por cima de um corte já montado usando os timestamps daquele corte.

## Ortografia

O Whisper local erra nomes próprios, termos técnicos e jargão jurídico.
Antes de queimar, leia o SRT inteiro. Corrija à mão o que estiver errado —
principalmente número, artigo de lei, nome e valor.

Isto não é opcional em JURIDICO-PRO.
