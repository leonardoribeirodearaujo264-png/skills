# Design, copy, anúncios e velocidade

Depois de instalar, você pede em português e o Claude Code ou o Codex monta a página com visual profissional, escreve o texto da oferta, prepara anúncios para Facebook e Instagram, mede a velocidade do site e revisa tudo antes de você publicar. Você não precisa saber design nem programação: precisa saber o que vende e para quem.

## O que vem no pacote

- **27 skills de terceiros**, gratuitas e de código aberto, instaladas direto dos repositórios dos autores: design, identidade visual, texto de venda, anúncios, testes e velocidade.
- **1 skill autoral:** `checklist-pagina-que-vende`, que revisa uma página em hierarquia, prova, oferta, CTA, velocidade e acessibilidade e devolve a lista do que corrigir primeiro.
- **Time autoral de 6 agentes**, para Claude Code e Codex: lider-lancamento, designer-de-interface, copywriter-de-conversao, gestor-de-anuncios, especialista-em-velocidade e revisor-de-entrega.
- **6 prompts prontos** para os pedidos mais comuns.
- **Instaladores** para Windows, Mac e Linux.

## Instalação no Claude Code

Você precisa do Node.js 22 ou mais novo. Baixe e descompacte o pacote, abra o terminal dentro da pasta e rode:

Windows (PowerShell):

```text
powershell -ExecutionPolicy Bypass -File .\instalar-claude.ps1
```

Mac ou Linux:

```text
bash instalar-claude.sh
```

O instalador baixa cada skill de terceiro, copia a skill autoral para `~/.claude/skills` e o time para `~/.claude/agents`. Se alguma skill falhar, ele mostra o comando para tentar de novo. Para instalar uma skill sozinha, o comando é este:

```text
npx skills add coreyhaines31/marketingskills --skill copywriting -a claude-code -g -y
```

Feche e abra o Claude Code de novo para ele carregar tudo.

## Instalação no Codex

O Codex lê skills de outra pasta: `~/.agents/skills`. Ele não enxerga `~/.claude/skills`, então rode o instalador do Codex mesmo que já tenha instalado no Claude Code.

Windows (PowerShell):

```text
powershell -ExecutionPolicy Bypass -File .\instalar-codex.ps1
```

Mac ou Linux:

```text
bash instalar-codex.sh
```

O instalador coloca as skills em `~/.agents/skills` e o time em `~/.codex/agents`, um arquivo `.toml` por agente. Uma skill sozinha:

```text
npx skills add coreyhaines31/marketingskills --skill copywriting -a codex -g -y
```

Abra o Codex de novo depois de instalar.

## Como usar o time de agentes

Comece pelo líder. Ele lê o seu pedido, monta um plano, chama cada especialista na ordem certa (texto, design, velocidade, anúncio) e só entrega o que passou pelo revisor.

- **No Claude Code:** escreva "Use o agente lider-lancamento para..." e descreva o negócio, o público, a oferta e a ação que o visitante deve fazer. Se quiser que o líder seja a própria sessão, abra com `claude --agent lider-lancamento`.
- **No Codex:** cite o agente pelo nome no pedido, por exemplo "Chame o agente lider-lancamento para...". O Codex só usa um agente quando ele é citado.
- **Especialista direto:** para uma tarefa só, chame o especialista pelo nome. Exemplo: "Use o agente especialista-em-velocidade para medir a minha página".

Nenhum agente publica página, sobe campanha, envia mensagem ou gasta crédito sem perguntar a você antes. Depoimentos e números entram só se você fornecer; onde faltar, o time deixa o espaço marcado.

## Skills incluídas

| Skill | Para que serve | Fonte | Licença |
|---|---|---|---|
| ui-ux-pro-max | Escolhe estilo, paleta e fontes para o tipo de negócio | nextlevelbuilder/ui-ux-pro-max-skill | MIT |
| design-system | Organiza cores, fontes e espaçamentos em padrão reutilizável | nextlevelbuilder/ui-ux-pro-max-skill | MIT |
| brand | Voz e identidade visual da marca | nextlevelbuilder/ui-ux-pro-max-skill | MIT |
| banner-design | Banners para site e redes sociais | nextlevelbuilder/ui-ux-pro-max-skill | MIT |
| ui-styling | Estilo de componentes de interface | nextlevelbuilder/ui-ux-pro-max-skill | MIT |
| impeccable | Direção, crítica, auditoria e acabamento de interfaces (subcomandos polish, critique e audit) | pbakaus/impeccable | Apache-2.0 |
| frontend-design | Visual com personalidade, longe do genérico | anthropics/skills | Apache-2.0 |
| theme-factory | Aplica temas prontos a materiais | anthropics/skills | Apache-2.0 |
| design-taste-frontend | Bom gosto visual em páginas e componentes | leonxlnx/taste-skill | MIT |
| emil-design-eng | Detalhes de interação e animação | emilkowalski/skills | MIT |
| better-ui | Melhorias práticas de interface | jakubkrehel/skills | MIT |
| accessibility | Acessibilidade (contraste, teclado, leitores de tela) | addyosmani/web-quality-skills | MIT |
| performance | Diagnóstico de carregamento | addyosmani/web-quality-skills | MIT |
| core-web-vitals | LCP, INP e CLS | addyosmani/web-quality-skills | MIT |
| shadcn | Componentes shadcn em React com Tailwind | shadcn-ui/ui | MIT |
| copywriting | Texto de página que vende | coreyhaines31/marketingskills | MIT |
| copy-editing | Revisão de texto existente | coreyhaines31/marketingskills | MIT |
| marketing-psychology | Argumentos de decisão do cliente | coreyhaines31/marketingskills | MIT |
| offers | Montagem da oferta | coreyhaines31/marketingskills | MIT |
| cro | Por que a página não converte | coreyhaines31/marketingskills | MIT |
| ad-creative | Ângulos e variações de anúncio | coreyhaines31/marketingskills | MIT |
| ab-testing | Planejamento de teste A/B | coreyhaines31/marketingskills | MIT |
| emails | Sequências e campanhas de e-mail | coreyhaines31/marketingskills | MIT |
| seo-audit | Auditoria para busca no Google | coreyhaines31/marketingskills | MIT |
| ads-meta | Auditoria de campanhas no Facebook e no Instagram | agricidaniel/claude-ads | MIT |
| vercel-react-best-practices | Velocidade em sites React e Next.js | vercel-labs/agent-skills | Sem licença no repositório |
| web-design-guidelines | Boas práticas de interface web | vercel-labs/agent-skills | Sem licença no repositório |
| checklist-pagina-que-vende | Revisão priorizada da página antes de publicar | autoral | Uso pessoal |

A impeccable é uma skill só. Acabamento, crítica, auditoria e os demais modos são subcomandos dela: peça, por exemplo, "use a skill impeccable com o subcomando polish nesta página" ou digite `/impeccable polish` no Claude Code. Os subcomandos critique e audit funcionam do mesmo jeito.

## Prompts prontos

Os prompts estão na pasta `prompts/`. Copie, troque o que está entre colchetes e cole no Claude Code ou no Codex.

- `01-lancar-pagina-com-o-time.md`: página do zero com o time inteiro, no Claude Code e no Codex.
- `02-revisar-pagina-que-vende.md`: lista do que corrigir numa página pronta.
- `03-texto-e-oferta.md`: manchete, texto e oferta.
- `04-anuncios-meta.md`: variações de anúncio e plano de teste.
- `05-site-mais-rapido.md`: medir e acelerar a página.
- `06-identidade-e-banners.md`: cores, fontes e banners.

## Custos e requisitos

- **Assinatura do agente:** Claude Code ou Codex, cobrados pela Anthropic ou pela OpenAI conforme o seu plano.
- **Node.js 22 ou mais novo:** necessário para os instaladores.
- **Python 3:** usado pelos scripts de busca da ui-ux-pro-max.
- **FFmpeg:** não é necessário neste pacote.
- **Git Bash ou WSL no Windows:** só se quiser rodar os arquivos `.sh`. No Windows, os `.ps1` bastam.
- **Fora daqui e pagos à parte:** a verba dos anúncios na Meta e qualquer API de geração de imagem que você escolha ligar no banner-design. Os agentes perguntam antes de usar qualquer serviço pago.

## Créditos

A lista completa de autores, repositórios e licenças está em `CREDITOS.md`. As skills de terceiros são gratuitas e de código aberto, e o instalador baixa cada uma do repositório original. Este pacote é curadoria, guia, instalador e time autoral. Não há parceria nem vínculo com os autores das skills de terceiros.
