# Motion, mockup e fontes

Depois de instalar, você pede ao Claude Code ou ao Codex o que antes exigia um programa de design: o print do seu site dentro de um notebook, o app num celular, o post como vai aparecer no feed, a capa do curso em pé com sombra, uma animação de entrada na sua página e um par de fontes com escala pronta. Os mockups saem em PNG 1x e 2x nos tamanhos de post, story e slide, gerados no seu computador, com a sua imagem sem sair da máquina.

## O que vem no pacote

- **26 skills de terceiros**, gratuitas e de código aberto, para animação (GSAP, HyperFrames, Lottie, Three.js, CSS), revisão de movimento, tipografia e cor. O instalador baixa cada uma do repositório do autor.
- **2 skills autorais:**
  - `mockup`: gera mockups com HTML e CSS locais e exporta PNG pelo navegador que você já tem. Vem com 3 modelos prontos (notebook, celular e post no feed) e receitas de capa de curso e caixa;
  - `par-de-fontes`: escolhe 2 fontes do Google Fonts pelo objetivo, monta a escala e confere a legibilidade.
- **Time visual de 5 agentes**, nos formatos do Claude Code e do Codex: `lider-visual`, `motion-designer`, `especialista-em-mockup`, `tipografo` e `revisor-visual`.
- **6 prompts prontos** na pasta `prompts/`.

## Instalação no Claude Code

Abra o terminal na pasta do pacote e rode o instalador do seu sistema.

Windows (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar-claude.ps1
```

Mac ou Linux:

```bash
bash instalar-claude.sh
```

O instalador:
- instala as skills de terceiros em `~/.claude/skills`;
- copia as skills autorais para a mesma pasta;
- copia o time para `~/.claude/agents`.

Depois do instalador, instale o fluxo de motion graphics do HyperFrames. Ele não é instalável por `npx skills add`; quem instala é a CLI do HyperFrames, que grava em `~/.claude/skills` e em `~/.agents/skills` de uma vez:

```bash
npx hyperframes skills update motion-graphics
```

Para ver quais fluxos estão disponíveis, rode `npx hyperframes skills check`. Feche e abra o Claude Code para carregar tudo.

Para instalar uma skill sozinha, use o comando manual. Exemplo:

```bash
npx skills add greensock/gsap-skills --skill gsap-core -a claude-code -g -y
```

## Instalação no Codex

Windows (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar-codex.ps1
```

Mac ou Linux:

```bash
bash instalar-codex.sh
```

O Codex usa pastas próprias:
- `~/.agents/skills` para as skills, porque ele não lê `~/.claude/skills`;
- `~/.codex/agents` para o time, em arquivos `.toml`.

O instalador preenche as duas. Se ainda não instalou o fluxo motion-graphics, rode `npx hyperframes skills update motion-graphics`: ele também grava em `~/.agents/skills`. Feche e abra o Codex depois.

Comando manual de uma skill:

```bash
npx skills add greensock/gsap-skills --skill gsap-core -a codex -g -y
```

## Como usar o time de agentes

Fale com o `lider-visual`. Ele lê o pedido, divide o trabalho e só entrega o que o `revisor-visual` aprovou:

- `tipografo` define as fontes primeiro, porque mockup e animação usam a mesma tipografia;
- `especialista-em-mockup` gera os PNG;
- `motion-designer` cria as animações.

No Claude Code, peça pelo nome: "Use o agente lider-visual para...".

No Codex, cite o agente pelo nome no começo do pedido: "lider-visual, coordene este pedido com...". O Codex só aciona um agente quando ele é citado.

Diga sempre o que vai entregar, em quais formatos e onde estão os seus arquivos (print, arte, cores). O exemplo completo está em `prompts/06-acionar-o-time.md`.

Nenhum agente publica, envia, compra ou gasta crédito de API sem você aprovar.

## Skills incluídas

| Skill | Para que serve | Fonte | Licença |
|---|---|---|---|
| mockup | Mockups de notebook, celular, post, capa e caixa em PNG 1x e 2x | Autoral | Ver LICENSES/ |
| par-de-fontes | Par de fontes do Google Fonts, escala e checagem de legibilidade | Autoral | Ver LICENSES/ |
| gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-react, gsap-plugins, gsap-performance | Animação web com GSAP: básico, sequências, rolagem, React, plugins e desempenho | greensock/gsap-skills | MIT |
| hyperframes, hyperframes-cli | Vídeo e post animado em HTML renderizado no computador, com prévia e render pela CLI | heygen-com/hyperframes | Apache-2.0 |
| review-animations, animation-vocabulary, improve-animations, find-animation-opportunities, apple-design | Revisar e melhorar animações e achar onde o movimento ajuda | emilkowalski/skills | MIT |
| impeccable | Movimento, detalhes de encanto, tipografia e cor em interfaces (subcomandos animate, delight, typeset e colorize) | pbakaus/impeccable | Apache-2.0 |
| animation-principles, motion-system | Princípios de animação e sistema de durações e curvas | Owl-Listener/designer-skills | MIT |
| aceternity-ui | Componentes React animados para seções de destaque | secondsky/claude-skills | MIT |
| motion-framer | Animação em React com a biblioteca Motion | freshtechbro/claudedesignskills | MIT |
| motion-design | Direção de motion design | lottiefiles/motion-design-skill | MIT |
| text-to-lottie | Animação Lottie a partir de descrição em texto | diffusionstudio/lottie | MIT |
| threejs-animation | Animação 3D com Three.js | cloudai-x/threejs-skills | MIT |
| better-typography, better-colors | Ajuste fino de tipografia e de cores | jakubkrehel/skills | MIT |
| web-typography | Tipografia para a web | wondelai/skills | MIT |
| canvas-design | Peças visuais estáticas, como pôster e arte | anthropics/skills | Apache-2.0 |
| image | Imagens para marketing | coreyhaines31/marketingskills | MIT |

A impeccable é uma skill só. animate, delight, typeset e colorize são subcomandos dela: peça, por exemplo, "use a skill impeccable com o subcomando animate nesta seção" ou digite `/impeccable typeset` no Claude Code.

O motion-graphics é um fluxo de trabalho do HyperFrames, instalado à parte com `npx hyperframes skills update motion-graphics` (veja a instalação acima). Se ele não aparecer em `npx hyperframes skills check`, a skill hyperframes cobre o mesmo trabalho pelas referências de movimento dela.

## Prompts prontos

Todos em `prompts/`. Troque o que está entre colchetes pelos seus dados.

- `01-mockup-site-notebook.md`: site ou sistema dentro do notebook.
- `02-mockup-app-e-post.md`: app no celular e post no feed.
- `03-animacao-gsap.md`: animação de entrada e de rolagem numa página.
- `04-par-de-fontes.md`: fontes da marca com escala e amostra.
- `05-post-animado.md`: post transformado em vídeo curto.
- `06-acionar-o-time.md`: o time inteiro, no Claude Code e no Codex.

## Custos e requisitos

- **Nada pago dentro do pacote.** As skills são gratuitas e os mockups usam o seu navegador. Este pacote não exige nenhuma API paga.
- **Node.js 22 ou mais novo**, para o instalador (`npx skills`) e para o HyperFrames.
- **FFmpeg**, para renderizar vídeo com as skills do HyperFrames.
- **Google Chrome ou Microsoft Edge**, para exportar os PNG dos mockups.
- **Internet**, para instalar as skills e carregar as fontes do Google Fonts.
- **Git Bash ou WSL no Windows**, só se você quiser rodar os instaladores `.sh`. Os `.ps1` funcionam direto no PowerShell.
- Assinatura do Claude Code ou do Codex, contratada à parte.

## Créditos

A lista completa de autores, repositórios e licenças está em `CREDITOS.md`. As skills de terceiros são gratuitas e de código aberto: o instalador baixa cada uma do repositório original e nenhum arquivo delas está copiado aqui. Este pacote é curadoria, guia, instalador, skills autorais e time autoral. Não há parceria nem vínculo com os autores das skills de terceiros.
