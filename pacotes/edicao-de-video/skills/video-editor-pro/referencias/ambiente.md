# Ambiente — o que é instalado, como atualizar, como remover

Pasta do agente: `~/.video-agent/` (no Windows, `C:\Users\<você>\.video-agent\`).
Quem cria é o instalador desta skill:

```bash
python ~/.claude/skills/video-editor-pro/agente/instalar_ambiente.py   # Mac/Linux: python3
```

```
.video-agent/
  bin/              helpers próprios (probe, audio_analyze, audio_master,
                    transcribe_local, transcribe_long, captions, captions_anim,
                    caption_preview, reframe, face_track, qc, style_probe)
  tools/video-use/  video-use (browser-use/video-use, MIT), baixado do GitHub
  models/           modelos do faster-whisper, baixados no primeiro uso
  presets/          os 6 modos de edição e os estilos de legenda, editáveis
  projects/         um diretório por vídeo
  .venv/            Python isolado do agente
  env.sh            carrega PYTHONUTF8 e as funções va/vu
```

## Sempre no início da sessão

```bash
source ~/.video-agent/env.sh
```

`PYTHONUTF8=1` não é opcional. Sem ele o Python no Windows lê arquivos como
cp1252 e corrompe acentos ao passar transcrições entre os helpers do video-use
(sintoma: "não" vira "nÃ£o" no `takes_packed.md`).

## Requisitos

| Componente | Versão | Papel |
|---|---|---|
| Python | 3.10 ou mais novo | helpers (o instalador cria o `.venv`) |
| FFmpeg e FFprobe | qualquer versão recente, no PATH | corte, filtro, áudio, render |
| Node.js | 22 ou mais novo | HyperFrames (motion graphics) |
| faster-whisper, numpy, Pillow, OpenCV, librosa, matplotlib | instalados no `.venv` | transcrição e helpers |

FFmpeg: no Windows `winget install Gyan.FFmpeg`; no Mac `brew install ffmpeg`;
no Linux `sudo apt install ffmpeg`.

## Desempenho

Sem placa de vídeo, transcrição e render rodam na CPU. Em um computador comum,
a transcrição `small` leva de 1 a 2 vezes a duração do vídeo. Avise o usuário
antes de transcrever vídeo longo e nunca transcreva de novo o que já está em cache.

## Correção aplicada ao video-use

Uma só, em `helpers/render.py`: no Windows a barra invertida é caractere de
escape no filtergraph do ffmpeg, então `C:\Users\...` chegava como
`C:Users...` e o arquivo de legenda nunca era encontrado. O instalador troca
por barra normal e escapa os dois-pontos. No Mac e no Linux não faz diferença.

## Atualizar

Rode o instalador de novo. Ele atualiza os helpers, as bibliotecas e o video-use
(reaplicando a correção) e mantém projetos, modelos e os modos que você editou.

```bash
npx --yes hyperframes@latest skills update   # skills do HyperFrames
```

## Desinstalar

Peça confirmação ao usuário antes. Apaga projetos e modelos junto.

```bash
rm -rf ~/.video-agent
rm -rf ~/.claude/skills/video-editor-pro ~/.agents/skills/video-editor-pro
```

## Opcionais não instalados

| Item | Para quê | Custo de disco | Instalar |
|---|---|---|---|
| Modelo Whisper `medium` | precisão maior em número e nome próprio | ~1,5 GB | baixa sozinho no primeiro `--model medium` |
| Modelo Whisper `large-v3` | máxima precisão, lento em CPU | ~3 GB | idem |
| `yt-dlp` | baixar vídeo de URL | ~30 MB | `pip install yt-dlp` no `.venv` |
| Manim | diagrama e animação matemática | ~500 MB | `pip install manim` no `.venv` |

Nenhum é necessário para o pipeline padrão. Peça antes de instalar qualquer um.
