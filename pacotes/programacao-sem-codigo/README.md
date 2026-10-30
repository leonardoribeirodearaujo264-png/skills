# Programação para quem não programa

Com este pacote, você pede em português o site, o sistema simples, a automação ou o SaaS que quer construir, e o Claude Code ou o Codex conduz o caminho com você: entrevista, plano em linguagem simples, uma etapa por vez, teste como cliente e revisão de segurança antes de publicar. Nada é apagado, instalado, publicado ou pago sem o seu sim, e o que já funciona continua funcionando.

## O que vem no pacote

- **Skills de terceiros**: 31 skills gratuitas e de código aberto para planejar, testar, achar bugs, revisar segurança, usar banco de dados e publicar. O instalador baixa cada uma direto do autor.
- **Skill autoral**: `do-pedido-ao-ar`, que leva quem nunca programou da ideia ao projeto publicado.
- **Time de agentes**: `lider-projeto`, `arquiteto-de-solucao`, `desenvolvedor`, `testador` e `revisor-de-seguranca`, nos formatos do Claude Code e do Codex.
- **Modelos de instrução global**: `modelos/CLAUDE.md` e `modelos/AGENTS.md`, com as regras de segurança para o agente seguir em todo projeto.
- **7 prompts prontos** na pasta `prompts/`.

## Instalação no Claude Code

Abra o terminal na pasta do pacote e rode o instalador.

Windows (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar-claude.ps1
```

Mac ou Linux:

```bash
bash instalar-claude.sh
```

O instalador baixa as skills de terceiros para `~/.claude/skills`, copia a skill autoral para a mesma pasta e copia o time para `~/.claude/agents`. Se uma skill falhar, ele mostra o comando para rodar de novo.

Para instalar uma skill sozinha, à mão:

```bash
npx skills add mattpocock/skills --skill grill-me -a claude-code -g -y
```

Depois, copie as regras globais. Se você ainda não tem o arquivo `~/.claude/CLAUDE.md`, copie `modelos/CLAUDE.md` para lá. Se já tem, cole o conteúdo do modelo no fim do seu arquivo, sem apagar o que existe.

Feche e abra o Claude Code de novo para ele carregar tudo.

## Instalação no Codex

Windows (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar-codex.ps1
```

Mac ou Linux:

```bash
bash instalar-codex.sh
```

O Codex lê as skills em `~/.agents/skills` (ele não lê a pasta do Claude Code) e os agentes em `~/.codex/agents`. O instalador coloca as skills e o time nessas pastas. A skill `git-guardrails-claude-code` fica de fora, porque só funciona no Claude Code.

Para instalar uma skill sozinha, à mão:

```bash
npx skills add mattpocock/skills --skill grill-me -a codex -g -y
```

As regras globais do Codex ficam em `~/.codex/AGENTS.md`. Copie `modelos/AGENTS.md` para lá, ou cole o conteúdo no fim do arquivo que você já tem.

Feche e abra o Codex de novo.

## Como usar o time de agentes

Você fala só com o líder. Ele conversa com você em linguagem simples e chama os outros na hora certa.

| Agente | O que faz |
|---|---|
| `lider-projeto` | Entrevista você, transforma o pedido em plano e só segue com a sua aprovação. Divide o trabalho e só entrega o que passou no teste e na revisão. |
| `arquiteto-de-solucao` | Escolhe a forma mais simples de construir e diz quais arquivos vão mudar e o que tem custo. |
| `desenvolvedor` | Implementa uma etapa aprovada por vez, sem quebrar o que já funciona. |
| `testador` | Roda os testes e usa o projeto como um cliente, inclusive errando de propósito. |
| `revisor-de-seguranca` | Procura segredos no código, dados expostos, entrada sem validação e permissões frouxas. Não altera nada, só aponta. |

No Claude Code, escreva no começo do pedido: `Use o agente lider-projeto para conduzir este pedido:` e descreva o que você quer.

No Codex, o agente precisa ser citado pelo nome: comece com `lider-projeto, conduza este pedido:`. Quando o líder passar uma etapa adiante, ele cita o especialista pelo nome.

Os prompts `06` e `07` da pasta `prompts/` trazem o texto completo para cada um.

Para ir da ideia até o ar sem o time, peça: `Use a skill do-pedido-ao-ar`.

### Glossário curto

- **Terminal**: a janela onde você digita comandos para o computador. No Windows, o PowerShell. No Mac, o app Terminal.
- **Repositório**: a pasta do projeto com o histórico de todas as mudanças, guardado pelo Git. Permite voltar a uma versão que funcionava.
- **Deploy**: colocar o projeto no ar, num endereço que qualquer pessoa abre no navegador.
- **Variável de ambiente**: um valor secreto, como uma chave de API ou senha do banco, guardado fora do código para não vazar.

## Skills incluídas

| Skill | Para que serve | Fonte | Licença |
|---|---|---|---|
| do-pedido-ao-ar | Da ideia ao projeto publicado, em etapas pequenas e explicadas | Autoral | Ver LICENSES/ |
| grill-me | Faz perguntas até o plano ficar claro | mattpocock/skills | MIT |
| to-spec | Transforma a conversa em especificação (você chama digitando o nome) | mattpocock/skills | MIT |
| tdd | Escreve o teste antes do código | mattpocock/skills | MIT |
| diagnosing-bugs | Investiga erros e lentidão até a causa | mattpocock/skills | MIT |
| code-review | Revisa as mudanças em busca de erros | mattpocock/skills | MIT |
| improve-codebase-architecture | Aponta onde a estrutura do código pode melhorar | mattpocock/skills | MIT |
| git-guardrails-claude-code | Bloqueia comandos do Git que apagam histórico (só Claude Code) | mattpocock/skills | MIT |
| setup-pre-commit | Configura verificações automáticas antes de cada commit | mattpocock/skills | MIT |
| brainstorming | Explora a ideia antes de construir | obra/superpowers | MIT |
| writing-plans | Escreve o plano de implementação em etapas | obra/superpowers | MIT |
| systematic-debugging | Método para achar a causa de um bug | obra/superpowers | MIT |
| test-driven-development | Desenvolvimento guiado por testes | obra/superpowers | MIT |
| verification-before-completion | Confere antes de dizer que terminou | obra/superpowers | MIT |
| requesting-code-review | Pede revisão das mudanças | obra/superpowers | MIT |
| using-git-worktrees | Trabalha numa cópia separada sem mexer na principal | obra/superpowers | MIT |
| security-and-hardening | Boas práticas de segurança | addyosmani/agent-skills | MIT |
| code-review-and-quality | Revisão de qualidade do código | addyosmani/agent-skills | MIT |
| shipping-and-launch | Preparação para colocar no ar | addyosmani/agent-skills | MIT |
| ci-cd-and-automation | Testes e publicação automáticos | addyosmani/agent-skills | MIT |
| browser-testing-with-devtools | Testa a página no navegador | addyosmani/agent-skills | MIT |
| security-review | Revisão de segurança do código | getsentry/skills | Apache-2.0 |
| find-bugs | Procura bugs nas mudanças | getsentry/skills | Apache-2.0 |
| webapp-testing | Testa aplicações web no navegador | anthropics/skills | Apache-2.0 |
| mcp-builder | Cria conectores MCP para ligar o agente a outros sistemas | anthropics/skills | Apache-2.0 |
| skill-creator | Cria suas próprias skills | anthropics/skills | Apache-2.0 |
| playwright-cli | Controla o navegador para testar páginas | microsoft/playwright-cli | Apache-2.0 |
| supabase-postgres-best-practices | Boas práticas de banco Postgres no Supabase | supabase/agent-skills | MIT |
| supabase | Uso do Supabase (banco, login e arquivos) | supabase/agent-skills | MIT |
| stripe-best-practices | Boas práticas para pagamentos com Stripe | stripe/ai | MIT |
| find-skills | Encontra outras skills quando você precisa | vercel-labs/skills | MIT |
| deploy-to-vercel | Publica o projeto na Vercel | vercel-labs/agent-skills | Sem licença: entra só como comando de instalação |

## Prompts prontos

Cada arquivo traz quando usar e o texto para copiar. Troque o que está entre colchetes.

- `prompts/01-comecar-projeto-do-zero.md`
- `prompts/02-corrigir-erro-colando-a-mensagem.md`
- `prompts/03-mudar-sem-quebrar.md`
- `prompts/04-revisar-seguranca-antes-de-publicar.md`
- `prompts/05-publicar-na-vercel.md`
- `prompts/06-acionar-o-time-no-claude-code.md`
- `prompts/07-acionar-o-time-no-codex.md`

## Custos e requisitos

- **Claude Code ou Codex**: cada um exige a própria assinatura ou plano pago do fornecedor. Não está incluído aqui.
- **Node.js 22 ou mais novo**: necessário para o instalador (`npx skills add`).
- **Git**: necessário para guardar o histórico do projeto.
- **Git Bash no Windows**: só se você quiser rodar os instaladores `.sh`. Os `.ps1` funcionam no PowerShell sem nada extra.
- **FFmpeg**: não é necessário neste pacote.
- **Serviços externos**: Vercel, Supabase, Stripe e APIs de IA têm planos gratuitos com limites e cobram acima deles. Confira o preço de cada um no site do fornecedor antes de usar. O time pede sua aprovação antes de qualquer gasto.

## Créditos

A lista completa das fontes e licenças está em `CREDITOS.md`. As skills de terceiros são gratuitas e de código aberto, e o instalador baixa cada uma direto do repositório do autor. Este pacote é curadoria, guia, instalador e time autoral. Não há parceria nem vínculo com os autores das skills de terceiros.
