# EDL — o formato de corte

`edit/edl.json` é a decisão editorial inteira num arquivo. Editar um número e
re-renderizar refaz o corte.

```json
{
  "version": 1,
  "sources": {
    "bruto": "~/.video-agent/projects/x/original/bruto.mp4"
  },
  "ranges": [
    {"source": "bruto", "start": 0.55, "end": 4.70,
     "beat": "HOOK",
     "quote": "O prazo para entrar com o recurso é de 15 dias.",
     "reason": "Abre com a afirmação que a correção resolve. Cria curiosidade."},
    {"source": "bruto", "start": 13.60, "end": 17.00,
     "beat": "CORRECAO",
     "quote": "O prazo correto é de 30 dias corridos.",
     "reason": "Pula 6,36–11,64, que é o falso início."}
  ],
  "grade": "subtle",
  "overlays": [
    {"file": "C:/.../project/slot_1/render.webm",
     "start_in_output": 0.4, "duration": 3.0}
  ],
  "subtitles": "edit/master.srt",
  "total_duration_s": 16.3
}
```

## Armadilhas — todas já encontradas em uso real

**A chave em `sources` tem que ser o nome do arquivo sem extensão.**
Se o arquivo é `bruto.mp4`, a chave é `"bruto"`. Com qualquer outra coisa o
`render.py` não acha `edit/transcripts/bruto.json` e o resultado é
`master SRT → master.srt (0 cues)` — legenda vazia, sem erro nenhum.

**Overlay tem que ser WebM com alpha.** Um MP4 opaco cobre o vídeo. O `va qc`
detecta como "frames pretos no meio do vídeo".

**`start_in_output` é na timeline de saída**, não na fonte. É o segundo do
vídeo já montado em que o overlay aparece.

**Caminhos com barra normal.** O JSON aceita as duas, mas barra normal evita
problema de escape em toda a cadeia.

## Campos

| Campo | Obrigatório | Observação |
|---|---|---|
| `sources` | sim | chave = nome do arquivo; valor = caminho absoluto |
| `ranges[].source` | sim | tem que existir em `sources` |
| `ranges[].start` / `end` | sim | segundos na **fonte**; sempre em fronteira de palavra |
| `ranges[].beat` | não | nome do momento narrativo; aparece no log do render |
| `ranges[].quote` | não | o que é dito ali; para revisão humana |
| `ranges[].reason` | não | **por que** este trecho; é o registro da decisão |
| `grade` | não | `subtle`, `neutral_punch`, `warm_cinematic`, `none`, `auto`, ou filtro ffmpeg cru |
| `overlays` | não | lista de `{file, start_in_output, duration}` |
| `subtitles` | não | caminho do SRT; aplicado **por último** |
| `total_duration_s` | não | soma esperada; sirva de conferência no `va qc --expect-duration` |

`quote` e `reason` não afetam o render. Preencha mesmo assim: são o que
permite revisar uma decisão semanas depois, e o que o usuário lê quando
pergunta "por que você cortou isso".

## Renderizar

```bash
vu render edit/edl.json -o preview/preview.mp4 --preview --build-subtitles
vu render edit/edl.json -o exports/final.mp4 --build-subtitles
```

`--preview` gera 720p rápido para validar. `--build-subtitles` monta o
`master.srt` a partir dos transcripts aplicando os offsets da timeline de
saída — é a única forma correta de legendar um corte que reordenou trechos.

O que o `render.py` faz, nesta ordem (não altere):

1. extrai cada range com a grade e fades de 30ms já embutidos
2. concat sem perda com `-c copy` para `base.mp4`
3. um único filtergraph: overlays com PTS deslocado, e **legenda por último**
4. normalização de loudness em duas passadas

## Padding

Todo corte precisa de folga: 30–200ms. Timestamps de ASR desviam 50–100ms; a
folga absorve. Os valores por modo estão nos presets
(`cortes.padding_antes_s` / `padding_depois_s`).

Mais apertado para montagem enérgica, mais folgado para documentário.
Nunca zero.
