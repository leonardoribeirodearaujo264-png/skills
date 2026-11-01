# Transcrição local

```bash
va transcribe_local video.mp4 --edit-dir <projeto>/edit --language pt --model small
```

Motor: **faster-whisper 1.2.1** (CTranslate2 4.8.2), CPU, int8. Zero custo,
zero rede.

Saída: `edit/transcripts/<nome>.json`, no schema do ElevenLabs Scribe — o que
torna todos os helpers do video-use compatíveis sem alteração.

```json
{"language_code": "pt", "language_probability": 1.0, "text": "...",
 "words": [
   {"text": "prazo", "start": 0.9, "end": 1.42, "type": "word",
    "speaker_id": "speaker_0", "logprob": 0.897},
   {"text": " ", "start": 1.42, "end": 1.55, "type": "spacing",
    "speaker_id": "speaker_0"}
 ]}
```

As entradas `spacing` carregam o intervalo entre palavras — é o que o
`pack_transcripts.py` lê para quebrar em frases.

## Modelos

| Modelo | Disco | Velocidade em CPU comum | Quando |
|---|---|---|---|
| `tiny` | 75 MB | ~0,5× duração | teste de encanamento |
| `base` | 145 MB | ~0,9× | rascunho, primeira leitura |
| `small` | 464 MB ✅ | ~1,6× | **padrão de produção** |
| `medium` | ~1,5 GB | ~4× | número, artigo de lei, nome próprio |
| `large-v3` | ~3 GB | ~10× | inviável em CPU na prática |

Cada modelo baixa sozinho no primeiro uso — avise o
usuário do tempo e do disco antes.

Um vídeo de 10 min com `small` leva ~16 min. Com `medium`, ~40 min. Planeje.

## Cache

O arquivo já existente é reusado. **Nunca re-transcreva** — é a operação mais
cara do pipeline. `--force` ignora o cache; use só se o arquivo de origem
mudou.

## Limites — e o que fazer

### 1. Whisper normaliza disfluência

Ele foi treinado para limpar hesitação. Parte dos "ahn", repetições e falsos
inícios pode simplesmente não aparecer no texto.

O `transcribe_local.py` combate com `initial_prompt` cheio de hesitações
("Ahn... então, tipo assim, eh... quer dizer, não, espera, deixa eu começar de
novo"), `condition_on_previous_text=False` e temperatura escalonada. Funciona
razoavelmente — num teste real o "AHN" do falso início foi preservado —
mas não é verbatim garantido.

**Mitigação real:** silêncio, pausa e ar morto vêm do `va audio_analyze`, que
mede o waveform e não depende de ASR. O sinal editorial mais importante fica
exato mesmo quando o texto foi limpo.

Quando o texto não mostrar um falso início que você suspeita existir, cruze com
os silêncios: uma pausa de 1,2s seguida de uma frase que recomeça o mesmo
assunto é falso início, mesmo que o texto pareça contínuo.

### 2. Sem diarização

Todos os `speaker_id` saem `speaker_0`. Em podcast com dois participantes:

- se a gravação tem faixas separadas, transcreva cada uma com
  `--audio-track 0` e `--audio-track 1`
- se não tem, a identificação de locutor é manual

### 3. Erra número, nome próprio e jargão

Medido aqui: "começar" virou "comer car", "você" virou "Volte". Números
sobreviveram, mas não conte com isso.

Whisper também converte por extenso para dígito ("quinze" → "15"). Para
legenda isso normalmente é bom.

**Sempre leia o SRT antes de queimar.** Em JURIDICO-PRO isso é obrigatório e
está detalhado em `juridico.md`.

### 4. Idioma

`--language pt` é o padrão. `--language auto` detecta, mas custa tempo e às
vezes erra em áudio curto ou com ruído. Se você sabe o idioma, informe.

## Depois de transcrever

```bash
vu pack_transcripts --edit-dir <projeto>/edit
```

Gera `takes_packed.md`: nível de frase, com `[início-fim]`, quebrando em
silêncio >= 0,5s ou troca de locutor. É a visão de leitura primária — dá
precisão de fronteira de palavra a 1/10 dos tokens do JSON bruto.

Leia esse arquivo inteiro antes de planejar qualquer corte.
