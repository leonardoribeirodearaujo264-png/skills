# Edição de vídeo por skills

Depois de instalar, você pede em português ao Claude Code ou ao Codex e ele corta, legenda e monta seus vídeos no seu computador. Gravou falando para a câmera? Ele tira os silêncios e os erros, traz a frase mais forte para os 3 primeiros segundos, coloca legenda e exporta o Reels em 1080x1920. Sem gravação? Ele monta uma aula sem câmera a partir das suas anotações, ou um Reels 100% animado, com mascote, narração, legenda palavra por palavra e efeitos sonoros. O coração do pacote é a skill `video-editor-pro`: ela analisa o vídeo, transcreve no seu computador, propõe a estratégia em português e só corta depois do seu OK. Um time de agentes divide o trabalho e um revisor confere o vídeo antes da entrega.

## O que vem no pacote

- 10 skills de terceiros, gratuitas e de código aberto, instaladas direto do repositório de cada autor: HyperFrames (porta de entrada, CLI de transcrição e render, efeitos prontos, mídia e slides), FFmpeg e MoviePy, social e video-use (opcional).
- Fluxos de trabalho do HyperFrames (legenda, cartões sobre talking head, aula sem câmera e outros), instalados pela própria CLI do HyperFrames num passo depois do instalador.
- 3 skills autorais:
  - `video-editor-pro`, o editor de vídeo profissional: análise técnica, transcrição local com faster-whisper, plano aprovado por você, montagem por lista de cortes (EDL), 26 estilos de legenda com prévia, 6 modos de edição (Reels, YouTube, anúncio, jurídico, podcast e institucional), reenquadramento e controle de qualidade antes de entregar. Vem com o instalador do ambiente (`agente/instalar_ambiente.py`).
  - `video-animado-narrado`, o vídeo 100% animado com narração, mascote, legenda palavra por palavra e efeitos sonoros, com os scripts prontos.
  - `reels-do-bruto-ao-post`, o fluxo do vídeo bruto ao Reels pronto.
- Time autoral de 6 agentes, para Claude Code e para Codex: lider-edicao, roteirista-de-video, editor-de-cortes, especialista-em-legendas, motion-designer-de-video e revisor-de-video.
- 8 prompts prontos para copiar e colar.
- Aula passo a passo mostrando a instalação e cada etapa da edição.

## Instalação no Claude Code

Instale antes o Node.js 22 ou mais novo e o FFmpeg (veja Custos e requisitos).

Windows (PowerShell, dentro da pasta do pacote):

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar-claude.ps1
```

Mac ou Linux (no Windows, também funciona no Git Bash):

```bash
bash instalar-claude.sh
```

O instalador baixa cada skill de terceiro com `npx skills add`, copia as skills autorais para `~/.claude/skills` e o time para `~/.claude/agents`.

Depois, monte o ambiente da `video-editor-pro` (precisa do Python 3.10 ou mais novo e do FFmpeg). Ele cria `~/.video-agent` com os helpers, os modos de edição, um Python isolado e o video-use, e testa tudo no fim:

```bash
python ~/.claude/skills/video-editor-pro/agente/instalar_ambiente.py
```

No Mac e no Linux, use `python3`. No Codex, a skill fica em `~/.agents/skills/video-editor-pro/`.

Depois do instalador, instale os fluxos de trabalho do HyperFrames. Eles não são instaláveis por `npx skills add`; quem instala é a CLI do HyperFrames, que grava em `~/.claude/skills` e em `~/.agents/skills` de uma vez:

```bash
npx hyperframes skills update talking-head-recut embedded-captions faceless-explainer general-video graphic-overlays music-to-video
```

Para ver quais fluxos estão disponíveis, rode `npx hyperframes skills check`. Feche e abra o Claude Code de novo para ele carregar tudo.

Para instalar uma skill sozinha, à mão:

```bash
npx skills add heygen-com/hyperframes --skill hyperframes -a claude-code -g -y
```

## Instalação no Codex

Windows (PowerShell, dentro da pasta do pacote):

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar-codex.ps1
```

Mac ou Linux (ou Git Bash no Windows):

```bash
bash instalar-codex.sh
```

O Codex lê skills de `~/.agents/skills` e não lê `~/.claude/skills`, por isso o pacote tem um instalador próprio para ele. O instalador coloca as skills em `~/.agents/skills` e o time em `~/.codex/agents`, no formato `.toml`. Se ainda não instalou os fluxos de trabalho do HyperFrames, rode o mesmo comando da seção do Claude Code (`npx hyperframes skills update ...`): ele também grava em `~/.agents/skills`. Abra o Codex de novo depois de instalar.

Para instalar uma skill sozinha, à mão:

```bash
npx skills add heygen-com/hyperframes --skill hyperframes -a codex -g -y
```

## Como usar o time de agentes

Fale com o líder. Ele divide o trabalho nesta ordem: roteiro, cortes, legenda, motion e revisão. Você só recebe o vídeo depois que o revisor aprovar.

| Agente | O que faz |
|---|---|
| lider-edicao | Recebe o pedido, combina formato, duração e disco de trabalho, chama cada especialista e entrega o que foi aprovado |
| roteirista-de-video | Escolhe o gancho dos 3 primeiros segundos, marca o que sai, escreve o texto de tela e a legenda do post |
| editor-de-cortes | Transcreve, corta silêncio, erros e repetições, reenquadra para 1080x1920 |
| especialista-em-legendas | Legenda o vídeo já cortado, em português, dentro da área segura |
| motion-designer-de-video | Títulos, cartões, sobreposições e aula sem câmera |
| revisor-de-video | Confere duração, legenda, áudio, enquadramento 9:16 e cortes secos, sem editar nada |

No Claude Code, escreva "Use o agente lider-edicao para..." e descreva o vídeo. No Codex, cite cada agente pelo nome no pedido, como no prompt 06.

Nenhum agente publica, envia arquivo ou gasta crédito de API sem você aprovar.

## Skills incluídas

| Skill | Para que serve | Fonte | Licença |
|---|---|---|---|
| video-editor-pro | Editor profissional: analisa, transcreve local, planeja com você, corta, legenda, revisa e renderiza | Autoral | Uso pessoal |
| reels-do-bruto-ao-post | Do vídeo bruto ao Reels pronto, apontando a skill de cada passo | Autoral | Uso pessoal |
| video-animado-narrado | Vídeo 100% animado: narração com tempo por palavra, cenas em código, mascote, legenda, efeitos sonoros e render | Autoral | Uso pessoal |
| hyperframes | Porta de entrada: escolhe a skill certa para cada vídeo | heygen-com/hyperframes | Apache-2.0 |
| hyperframes-cli | Transcrição local, checagem, prévia e render | heygen-com/hyperframes | Apache-2.0 |
| hyperframes-registry | Efeitos, transições e blocos prontos | heygen-com/hyperframes | Apache-2.0 |
| media-use | Imagens, áudio, legendas e tratamento de mídia | heygen-com/hyperframes | Apache-2.0 |
| slideshow | Apresentação e slides em vídeo | heygen-com/hyperframes | Apache-2.0 |
| remotion-to-hyperframes | Converte um projeto Remotion para HyperFrames | heygen-com/hyperframes | Apache-2.0 |
| ffmpeg | Cortes, conversão, reenquadramento e conferência | digitalsamba/claude-code-video-toolkit | MIT |
| moviepy | Edição por script Python | digitalsamba/claude-code-video-toolkit | MIT |
| social | Gancho, legenda do post e chamada para ação | coreyhaines31/marketingskills | MIT |
| video-use | Montagem por lista de cortes, usada pela video-editor-pro com transcrição local | browser-use/video-use | MIT |

Fluxos de trabalho do HyperFrames, instalados à parte com `npx hyperframes skills update <nome-do-fluxo>` (veja a instalação acima). Mesma fonte, heygen-com/hyperframes, licença Apache-2.0:

| Fluxo | Para que serve |
|---|---|
| talking-head-recut | Cartões e títulos sincronizados com a fala |
| embedded-captions | Legenda em vídeo de fala, do simples ao cinematográfico |
| faceless-explainer | Aula ou explicação sem câmera a partir de texto |
| general-video | Edição livre: cortes, montagens e vídeos longos |
| graphic-overlays | Sobreposições gráficas no vídeo |
| music-to-video | Vídeo no ritmo de uma música |

Se um fluxo não aparecer em `npx hyperframes skills check`, a skill hyperframes cobre a mesma tarefa pelas referências dela (legendas, sobreposições, explicação e vídeo vertical).

## Prompts prontos

Estão na pasta `prompts/`. Copie, troque o que está entre colchetes e cole no seu agente.

- `01-editar-talking-head.md`: vídeo falando para a câmera vira Reels com cortes, gancho e legenda.
- `02-legendar-video-pronto.md`: legenda em português para um vídeo já editado.
- `03-aula-sem-camera.md`: aula ou explicação montada a partir das suas anotações.
- `04-cortes-de-video-longo.md`: Shorts tirados de uma live, aula ou podcast.
- `05-time-pelo-lider-claude-code.md`: o time inteiro trabalhando, no Claude Code.
- `06-time-pelo-lider-codex.md`: o mesmo time no Codex, com cada agente citado pelo nome.
- `07-video-animado-narrado.md`: Reels 100% animado, com personagem, narração e legenda, sem gravar nada.
- `08-editor-pro-modo-por-modo.md`: a video-editor-pro num modo pronto (Reels, YouTube, anúncio, jurídico, podcast ou institucional).

## Custos e requisitos

- Node.js 22 ou mais novo. Os instaladores e o HyperFrames dependem dele.
- Para a skill video-animado-narrado: Python 3 com numpy, scipy e soundfile, e faster-whisper para conferir a pronúncia. O agente pede autorização antes de instalar.
- FFmpeg e ffprobe instalados e no PATH.
- Python 3.10 ou mais novo, para o ambiente da `video-editor-pro`.
- Espaço em disco. Transcrição, recortes intermediários e render ocupam várias vezes o tamanho do vídeo bruto. Escolha um disco com bastante espaço livre para a pasta de trabalho, os temporários e o render, e diga esse caminho no pedido.
- Git Bash no Windows, só se você quiser rodar os arquivos `.sh`. Os `.ps1` rodam no PowerShell.
- Na primeira transcrição, o Whisper baixa o modelo de voz para o computador (o `small`, padrão, tem cerca de 460 MB).
- Fora daqui, pode haver custo em: transcrição da ElevenLabs, opcional no video-use (a video-editor-pro transcreve de graça no computador) e usada na narração da skill video-animado-narrado (opcional: dá para gravar a própria voz); recursos da HeyGen que algumas skills do HyperFrames oferecem para voz e música, com motor local como alternativa; e a licença do Remotion para empresas acima de certo porte, caso você use Remotion. Os agentes pedem sua aprovação antes de qualquer gasto.

## Créditos

A lista de autores, repositórios e licenças está em `CREDITOS.md`. As skills de terceiros são gratuitas e de código aberto e não estão copiadas neste pacote: o instalador baixa cada uma do repositório original. Este pacote é curadoria, guia, instalador e time autoral, sem parceria nem vínculo com os autores das skills.
