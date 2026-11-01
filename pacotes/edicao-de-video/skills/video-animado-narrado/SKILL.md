---
name: video-animado-narrado
description: Faz um vídeo vertical animado e narrado do zero, sem gravação: roteiro, narração com o tempo de cada palavra, cenas animadas em código com HyperFrames, mascote que fala, legenda palavra por palavra, efeitos sonoros e render em 1080x1920. Use quando pedirem um Reels animado, um vídeo explicativo com personagem ou um vídeo no estilo dos perfis de IA, sem câmera.
---

# Vídeo animado narrado

Fluxo completo para um vídeo vertical 100% animado: nada de câmera, nada de timeline. Cada cena entra no tempo exato de uma palavra da narração. A pasta `modelo/` desta skill traz os scripts prontos; copie a pasta inteira para o projeto e troque o roteiro e as cenas.

## O que vem em `modelo/`

| Arquivo | Para que serve |
|---|---|
| `narracao.py` | Narração e tempo de cada palavra: ElevenLabs (`eleven`) ou narração gravada (`alinhar`), depois `compactar` e `acelerar` |
| `hf/gerar.py` | Monta `hf/index.html` a partir do template, da narração e da lista de cenas |
| `hf/template.html.tpl` | Composição HyperFrames de exemplo: faixa de título, cartões, legenda palavra por palavra e as cenas presas às palavras com `tw()` |
| `hf/mascote.js` | Mascote em SVG com poses (parado, aponta, joinha, aceno), piscada e boca que mexe a cada palavra |
| `sfx.py` | Efeitos sonoros gerados no computador (whoosh, pop, click, impacto), sem licença de terceiros |
| `mix.py` | Junta voz e efeitos nos tempos das palavras, normaliza em -14 LUFS e coloca o áudio no vídeo |

Requisitos: Node 22+, FFmpeg e Python 3 com `numpy`, `scipy`, `soundfile` e, para conferir a pronúncia ou alinhar narração gravada, `faster-whisper`. Peça autorização ao usuário antes de instalar qualquer biblioteca.

## Regras que não mudam

- **Fatos conferidos.** Todo número, nome de projeto ou afirmação do roteiro tem fonte que você abriu agora. Se as fontes divergem, o número sai do roteiro. Nada de inventar dado para a cena ficar mais bonita.
- **Gasto só com aprovação.** A ElevenLabs é paga. Antes de narrar, diga ao usuário quantos caracteres o roteiro tem e espere o OK. A chave fica só na variável de ambiente `ELEVENLABS_API_KEY`; nunca escreva a chave em arquivo.
- **Um render por vez.** Dois renders ao mesmo tempo esgotam memória e quebram os dois. Se houver mais de um vídeo, use uma trava (por exemplo, criar uma pasta `.trava` antes e apagar depois).
- **Disco com espaço.** Render com disco cheio falha sem mensagem clara. Aponte `TEMP` e `TMP` para uma pasta num disco com vários GB livres antes de renderizar.

## Passo a passo

### 1. Roteiro

Escreva as falas em `narracao.py` (lista `FALAS`): uma fala por ideia, frases curtas, gancho forte na primeira, pedido de comentário na última. Cada fala tem um nome de cena.

- A palavra do comentário ("Comenta PALAVRA") precisa ser única entre os vídeos do perfil, senão a automação de direct mistura as entregas.
- Se uma palavra sai com pronúncia errada (nome em inglês, sigla), preencha o texto falado com grafia fonética, mantendo o mesmo número de palavras do texto exibido.

Concluído quando: o usuário aprovou o roteiro.

### 2. Narração

Com ElevenLabs (paga, com aprovação):

```bash
python narracao.py eleven
python narracao.py compactar
python narracao.py acelerar
```

Rode cada comando uma vez só: `compactar` e `acelerar` mudam o áudio e os tempos de novo a cada execução.

Sem ElevenLabs: grave a narração, salve como `vo.wav` na pasta e rode `python narracao.py alinhar`.

Concluído quando: existem `vo.wav`, `falas.json` e `palavras.json`.

### 3. Conferir a pronúncia

Transcreva o `vo.wav` (faster-whisper, modelo `small`, idioma `pt`) e compare com o roteiro. Nome próprio escrito "do jeito que soa" na transcrição é normal; palavra trocada não é. Se uma palavra saiu errada, corrija com grafia fonética e narre só de novo, com aprovação.

Concluído quando: a transcrição bate com o roteiro, inclusive a palavra do comentário.

### 4. Montar as cenas

Em `hf/gerar.py`, liste as cenas (`CENAS`): cada uma começa numa fala ou numa palavra dela. No `hf/template.html.tpl`, escreva cada cena com `cena(id, titulo)` e faça cada elemento entrar na palavra certa com `tw("nome-da-fala", "palavra")`. Use o mascote com `m.pose(tl, tempo, "aponta")`, sempre em ordem de tempo.

```bash
cd hf
npm install
python gerar.py
```

Concluído quando: `python gerar.py` roda sem erro (ele avisa se uma âncora não existe).

### 5. Prévia e correções

```bash
npx hyperframes lint
npx hyperframes snapshot --at 2,6,10
```

Abra a folha de prévias e corrija antes do render:

- nada cortado na borda (personagem, mão levantada, cartão);
- nada sobreposto (texto em cima de texto, cartão em cima da legenda);
- sem metade da tela vazia;
- cada elemento aparece quando a narração fala dele.

Concluído quando: `hyperframes lint` dá 0 erros e as prévias de todas as cenas estão boas.

### 6. Render

```bash
npx hyperframes render --quality delivery --fps 30 --output video_mudo.mp4
```

Concluído quando: o MP4 existe com a duração da narração.

### 7. Som e entrega

Em `mix.py`, ajuste `EVENTOS` com as mesmas palavras que disparam animação (troca de cena = whoosh, elemento que entra = pop, botão = click, revelação = impacto). Depois:

```bash
python mix.py hf/video_mudo.mp4 video_final.mp4
```

Confira com `ffprobe` (1080x1920, áudio e vídeo com a mesma duração) e a loudness (`ffmpeg -i video_final.mp4 -af ebur128 -f null -`, alvo perto de -14 LUFS). Faça uma folha de quadros do vídeo final e olhe de novo antes de entregar.

Concluído quando: o vídeo final está conferido e o usuário recebeu o caminho do arquivo.
