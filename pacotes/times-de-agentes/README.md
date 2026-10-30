# Times de agentes por área do negócio

Depois de instalar, você tem seis times de agentes trabalhando no seu Claude Code e no seu Codex: marketing, vendas, financeiro, atendimento, operações e conteúdo. Cada time tem um líder que divide o trabalho, dois especialistas que executam e um revisor que confere antes de chegar até você. Um diretor-geral recebe o seu pedido, escolhe o time e cobra a entrega. Nenhum agente publica, envia, compra ou paga nada sem o seu OK. E quando faltar uma área, uma skill entrevista você e monta o time novo.

## O que vem no pacote

- **25 agentes autorais**, nos formatos do Claude Code (`agents/claude/`) e do Codex (`agents/codex/`): o diretor-geral e seis times com líder, dois especialistas e revisor.
- **1 skill autoral**: `montar-time-de-agentes`, que cria um time novo para qualquer área.
- **2 skills de terceiros**, gratuitas e de código aberto, que ensinam o agente principal a distribuir tarefas entre subagentes.
- **4 coleções de agentes e plugins de terceiros**, com o comando ou o caminho para instalar cada uma.
- **8 prompts prontos**, um por time, um para o diretor-geral e um para criar um time novo.

## Instalação no Claude Code

O instalador baixa as skills de terceiros direto do repositório de cada autor, copia a skill autoral para `~/.claude/skills` e o time para `~/.claude/agents`.

Windows (PowerShell, dentro da pasta do pacote):

```text
powershell -ExecutionPolicy Bypass -File .\instalar-claude.ps1
```

Mac e Linux (terminal, dentro da pasta do pacote):

```text
bash instalar-claude.sh
```

Para instalar uma skill de terceiro à mão:

```text
npx skills add obra/superpowers --skill subagent-driven-development -a claude-code -g -y
```

Plugin do wshobson/agents (opcional, o instalador não roda plugin):

```text
claude plugin marketplace add wshobson/agents
```

Depois de adicionar, abra o Claude Code, digite `/plugin` e escolha os plugins que quiser. Os que combinam com este pacote são agent-teams, business-analytics, startup-business-analyst, customer-sales-automation, content-marketing e seo-content-creation.

As outras coleções não têm comando de plugin confirmado. Para usar, abra o repositório, siga a instalação descrita no README dele e copie para `~/.claude/agents` só os agentes que você quer:

- VoltAgent/awesome-claude-code-subagents: github.com/VoltAgent/awesome-claude-code-subagents
- msitarzewski/agency-agents: github.com/msitarzewski/agency-agents
- anthropics/knowledge-work-plugins: github.com/anthropics/knowledge-work-plugins

Feche e abra o Claude Code de novo para ele carregar o time.

## Instalação no Codex

O Codex usa outras pastas: as skills ficam em `~/.agents/skills` (ele não lê `~/.claude/skills`) e os agentes ficam em `~/.codex/agents`, em arquivos `.toml`. O instalador do Codex cuida das duas.

Windows (PowerShell, dentro da pasta do pacote):

```text
powershell -ExecutionPolicy Bypass -File .\instalar-codex.ps1
```

Mac e Linux (terminal, dentro da pasta do pacote):

```text
bash instalar-codex.sh
```

Para instalar uma skill de terceiro à mão:

```text
npx skills add obra/superpowers --skill dispatching-parallel-agents -a codex -g -y
```

Plugin do wshobson/agents (opcional):

```text
codex plugin marketplace add wshobson/agents
```

Versão Codex das outras coleções, sem comando de plugin confirmado:

- VoltAgent: a versão para o Codex está em outro repositório, github.com/VoltAgent/awesome-codex-subagents. Siga o README dele e copie os `.toml` que quiser para `~/.codex/agents`.
- msitarzewski/agency-agents: o repositório tem o script `convert.sh`, que gera a versão Codex dos agentes. Rode conforme o README dele (no Windows, pelo Git Bash).
- anthropics/knowledge-work-plugins: não tem versão Codex indicada. Use só no Claude Code.

Abra uma sessão nova do Codex para ele carregar o time.

## Como usar o time de agentes

Você fala com o líder do time, ou com o diretor-geral quando não sabe qual time resolve. O líder confere se o pedido tem o que precisa, pergunta o que falta, divide a tarefa entre os especialistas, manda o resultado ao revisor e só entrega o que passou. Tudo sai como rascunho, em `rascunhos/<área>/` quando vira arquivo.

| Time | Líder | Especialistas | Revisor |
|---|---|---|---|
| Marketing | lider-marketing | estrategista-marketing (público, posicionamento, plano de campanha), redator-marketing (anúncios, página, e-mail) | revisor-marketing |
| Vendas | lider-vendas | prospector-vendas (cliente ideal, primeira abordagem), negociador-vendas (proposta, objeções, follow-up) | revisor-vendas |
| Financeiro | lider-financeiro | analista-financeiro (fluxo de caixa, resultado, custos), precificador-financeiro (preço, margem, ponto de equilíbrio) | revisor-financeiro |
| Atendimento | lider-atendimento | redator-atendimento (respostas, modelos de mensagem), analista-atendimento (perguntas frequentes, motivos de contato) | revisor-atendimento |
| Operações | lider-operacoes | mapeador-operacoes (processos, checklists), planejador-operacoes (rotinas, estoque, fornecedores, agenda) | revisor-operacoes |
| Conteúdo | lider-conteudo | pauteiro-conteudo (pautas, calendário), roteirista-conteudo (roteiros, posts, textos) | revisor-conteudo |
| Todos | diretor-geral | escolhe o time, escreve o briefing e cobra o líder | revisor de cada time |

**No Claude Code**, peça na conversa: "Use o agente lider-marketing para [SEU PEDIDO]". A conversa principal chama o líder, os especialistas e o revisor na ordem do plano.

**No Codex**, cite cada agente pelo nome no pedido: "Use os agentes lider-marketing, estrategista-marketing, redator-marketing e revisor-marketing para [SEU PEDIDO]". Sem o nome, o Codex não aciona o agente.

Regras que todos os agentes seguem:

- Usam só os números que você deu. O que falta aparece como `[A CONFIRMAR]` e vira pergunta.
- Perguntam antes de começar quando falta informação que muda o resultado.
- Não publicam, não enviam, não compram e não pagam nada sem a sua aprovação para aquela ação.
- O time financeiro não recomenda investimento e manda dúvidas de imposto ou contrato para o seu contador ou advogado.

Para uma área que não está na tabela, use a skill `montar-time-de-agentes` (prompt 08). Ela entrevista você, propõe o time, espera o seu OK e cria os arquivos nos dois formatos.

## Skills incluídas

| Skill | Para que serve | Fonte | Licença |
|---|---|---|---|
| montar-time-de-agentes | Entrevista você e cria um time novo (líder, especialistas, revisor) no Claude Code e no Codex | Autoral (pasta `skills/`) | Própria, veja `LICENSES/` |
| subagent-driven-development | Faz o agente principal executar um plano passando cada tarefa a um subagente | obra/superpowers | MIT |
| dispatching-parallel-agents | Faz o agente principal rodar tarefas independentes em paralelo com subagentes | obra/superpowers | MIT |
| Plugins do wshobson/agents | Times e agentes prontos, como agent-teams, business-analytics e customer-sales-automation | wshobson/agents | MIT |
| Coleção VoltAgent | Coleção de subagentes por especialidade, com repositório separado para o Codex | VoltAgent/awesome-claude-code-subagents e VoltAgent/awesome-codex-subagents | MIT |
| Agency agents | Agentes de marketing, vendas, design, testes, suporte e mídia paga | msitarzewski/agency-agents | MIT |
| Knowledge work plugins | Plugins da Anthropic para trabalho do conhecimento | anthropics/knowledge-work-plugins | Apache-2.0 |

## Prompts prontos

Os prompts ficam na pasta `prompts/`. Cada arquivo mostra a forma para o Claude Code e para o Codex. Troque o que está entre colchetes.

- `01-marketing.md`: campanha com o time de marketing.
- `02-vendas.md`: abordagem e proposta com o time de vendas.
- `03-financeiro.md`: números do mês com o time financeiro.
- `04-atendimento.md`: respostas e perguntas frequentes com o time de atendimento.
- `05-operacoes.md`: processo e rotina com o time de operações.
- `06-conteudo.md`: calendário e roteiros com o time de conteúdo.
- `07-diretor-geral.md`: pedido que envolve mais de uma área.
- `08-criar-time-novo.md`: time novo com a skill montar-time-de-agentes.

## Custos e requisitos

- O pacote não cobra nada além da compra. Os agentes rodam dentro do Claude Code e do Codex, que exigem conta própria com plano ou créditos de API, pagos à parte para a Anthropic e para a OpenAI.
- Node.js 22 ou mais novo, para o comando `npx skills` dos instaladores.
- FFmpeg não é necessário neste pacote.
- No Windows, os arquivos `.sh` precisam do Git Bash ou do WSL. Os arquivos `.ps1` rodam no PowerShell.
- Os agentes não gastam crédito de API externa nem contratam serviço sem a sua aprovação.

## Créditos

A lista completa de fontes e licenças está em `CREDITOS.md`. As skills, coleções e plugins de terceiros são gratuitos e de código aberto. Eles não estão copiados aqui: o instalador e os comandos acima baixam cada um direto do repositório do autor. Este pacote é curadoria, guia, instalador e times autorais, sem parceria nem vínculo com esses autores.
