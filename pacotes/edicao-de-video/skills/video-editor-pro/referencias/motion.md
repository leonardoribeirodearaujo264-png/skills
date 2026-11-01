# Motion graphics

Motor: **HyperFrames** (HTML/CSS/JS → MP4 determinístico). Instalado, renderiza
localmente com Chrome Headless. Node 22+ e FFmpeg já atendidos.

Entre sempre pela skill roteadora `hyperframes` — ela carrega a workflow certa
e conhece a versão instalada. Não presuma comandos de documentação antiga.

## Regra que já quebrou aqui

**Overlay tem que ser WebM com alpha.** Um MP4 opaco cobre o vídeo inteiro.
Isso foi testado: o `va qc` acusou "frames pretos 0.43–3.43s" —
exatamente a janela do overlay.

```bash
npx --yes hyperframes render . --format webm -o render.webm
```

E no EDL aponte `overlays[].file` para o `.webm`.

MP4 só serve para overlay se ele for de tela cheia por design (um card que
substitui a imagem, não que se sobrepõe a ela).

## Fluxo de um slot

Um slot por animação, isolado, dentro do projeto:

```bash
cd <projeto>/project/slot_1
npx --yes hyperframes init . --example blank --non-interactive --skip-skills
# construir a composição em index.html
npx --yes hyperframes check .
npx --yes hyperframes render . --format webm -o render.webm
```

`check` roda lint de movimento, contraste WCAG e validação da composição.
Rode antes de renderizar — capturar 300 frames leva cerca de 30 s num computador comum e
descobrir o erro depois é desperdício.

Comandos disponíveis na versão instalada: `init`, `add`, `catalog`, `capture`,
`lint`, `check`, `snapshot`, `compare`, `preview`, `play`, `render`, `doctor`,
`browser`, `keyframes`, `beats`. (`validate` e `inspect` são aliases obsoletos
de `check`.)

Se houver mais de uma animação, construa em **sub-agentes paralelos**, um por
slot. Cada prompt precisa ser autossuficiente: caminho absoluto de saída,
resolução, fps, codec, duração, paleta em valores concretos, fonte, timeline
quadro a quadro, e uma anti-lista do que não fazer.

## O que criar

Títulos, subtítulos, cards, callouts, bullets, listas, lower thirds, gráficos,
números, comparações, tabelas simples, timelines, setas, indicadores, molduras,
destaques, animação tipográfica.

Cada preset limita o que cabe naquele modo (`motion.elementos_permitidos`).

## Duração

- **Sincronizado com narração:** o espectador precisa ler em 1×. Piso ~3s,
  típico 5–7s para card simples, 8–14s para diagrama complexo.
- **Acento no ritmo** (música, montagem rápida): 0,5–2s. Aqui a regra vira
  "reconhecível em 1×", não "totalmente legível".
- **Segure o frame final >= 1s** antes do corte. Universal.
- **Sobre locução:** duração total >= narração + 1s. Universal.

## Sincronia com a fala

Pegue o timestamp da palavra de payoff. Comece o overlay
`duracao_da_revelacao` segundos antes, para o frame de chegada coincidir com a
palavra falada. Sem isso a animação parece descolada do áudio.

## Regras de composição

- **Nunca revele dois elementos independentes em paralelo.** O olho não
  acompanha duas novidades ao mesmo tempo. Uma coisa, pausa, próxima.
- **Easing sempre cúbico**, nunca linear.
- **Texto que digita:** centralize pela largura da string **completa**, não da
  parcial, ou o texto desliza para a esquerda enquanto cresce.
- Máximo 2 cores de acento. ~40% de espaço vazio. Cromo mínimo.

## Paleta e tipografia

Vêm da conversa, nunca de um padrão assumido. Se o usuário não definiu,
proponha na fase de estratégia e espere confirmação antes de construir.

Para JURIDICO-PRO existe uma direção sugerida em `juridico.md`.

## Alternativas ao HyperFrames

- **PIL + sequência PNG + ffmpeg** — cards simples: contador, texto que digita,
  barra que preenche. Rápido de iterar, qualquer estética. Já disponível
  (Pillow está no venv).
- **Manim** — diagrama formal, máquina de estados, derivação de equação, morph
  de grafo. O video-use traz `skills/manim-video/`. Instalação sob demanda.
- **Remotion** — só se o usuário pedir React/Remotion explicitamente.

Nenhuma é obrigatória. O critério é qual autoria é mais simples para aquele
slot.

## Princípio

**CLAREZA > EFEITO.** Se a animação não deixa a informação mais clara, ela está
competindo com a informação.
