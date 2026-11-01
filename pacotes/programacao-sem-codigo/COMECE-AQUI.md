<!-- Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão. -->
# Comece aqui: como instalar o pacote "Programação para quem não programa"

São 4 passos. Você não precisa saber programar: o passo 2 instala os programas com dois cliques, e no passo 4 o próprio Claude instala e testa o pacote por você.

## 1. Baixe e extraia o pacote

1. Na sua área de membros, clique em **Baixar o pacote**. Vem um arquivo `.zip`.
2. Clique com o botão direito no `.zip` e escolha **Extrair tudo** (no Mac, basta dar dois cliques).
3. Guarde a pasta extraída num lugar fácil, como **Documentos**.

## 2. Instale os programas com dois cliques

Dentro da pasta do pacote:

- **Windows:** dê dois cliques em `instalar-requisitos.bat`. Se o Windows perguntar se pode abrir, clique em **Mais informações** e **Executar assim mesmo**.
- **Mac:** clique com o botão direito em `instalar-requisitos.command`, escolha **Abrir** e confirme. Ele usa o Homebrew (brew.sh).

Ele confere e instala só o que faltar: **App do Claude**, **Node.js LTS**. Quando terminar, abra o app do Claude e entre com a sua conta. O Claude Code (a aba **Code** do app) precisa de um plano pago do Claude, como o Pro ou o Max.

Prefere instalar à mão? App do Claude em **claude.ai/download** e Node.js LTS em **nodejs.org**.

## 3. Abra a pasta no Claude

Abra o app **Claude**, vá na aba **Code** e escolha a pasta extraída do pacote como pasta de trabalho.

## 4. Peça ao Claude para instalar e testar

1. Copie o pedido abaixo inteiro, cole na conversa e envie.
2. Quando o Claude pedir permissão para rodar o instalador, confira e aceite.

```text
Instale o pacote desta pasta no meu Claude Code e confira se deu certo.

1. Veja qual é o meu sistema. No Windows, rode: powershell -ExecutionPolicy Bypass -File .\instalar-claude.ps1
   No Mac ou no Linux, rode: bash ./instalar-claude.sh
2. Se aparecer "Node.js não encontrado", pare e me explique como instalar o Node.js 22.
3. Depois de instalar, confira se estas pastas existem:
   - em ~/.claude/skills: do-pedido-ao-ar, grill-me, to-spec, tdd, diagnosing-bugs, code-review, improve-codebase-architecture, setup-pre-commit, git-guardrails-claude-code, brainstorming, writing-plans, systematic-debugging, test-driven-development, verification-before-completion, requesting-code-review, using-git-worktrees, security-and-hardening, code-review-and-quality, shipping-and-launch, ci-cd-and-automation, browser-testing-with-devtools, security-review, find-bugs, webapp-testing, mcp-builder, skill-creator, playwright-cli, supabase-postgres-best-practices, supabase, stripe-best-practices, find-skills, deploy-to-vercel
   - em ~/.claude/agents: arquiteto-de-solucao.md, desenvolvedor.md, lider-projeto.md, revisor-de-seguranca.md, testador.md
4. Me mostre uma lista com o que foi instalado e o que faltou. Se algo falhou, rode de novo só o que faltou.
5. No fim, me diga para fechar e abrir o Claude de novo, e qual prompt da pasta prompts/ eu devo testar primeiro.
Não apague, não publique e não pague nada sem me perguntar.
```

## Depois de instalar

- Feche e abra o Claude de novo para ele carregar as skills e o time.
- Teste com o primeiro prompt da pasta `prompts/` (`01-comecar-projeto-do-zero.md`): abra o arquivo, copie, troque o que estiver entre colchetes e envie.
- Usa o Codex? Na pasta do pacote, rode `instalar-codex.ps1` (Windows) ou `instalar-codex.sh` (Mac e Linux). O passo a passo completo está no `README.md`.

## O que este pacote instala

- Skills autorais: `do-pedido-ao-ar`
- Skills de terceiros (baixadas do autor na hora): `grill-me`, `to-spec`, `tdd`, `diagnosing-bugs`, `code-review`, `improve-codebase-architecture`, `setup-pre-commit`, `git-guardrails-claude-code`, `brainstorming`, `writing-plans`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `requesting-code-review`, `using-git-worktrees`, `security-and-hardening`, `code-review-and-quality`, `shipping-and-launch`, `ci-cd-and-automation`, `browser-testing-with-devtools`, `security-review`, `find-bugs`, `webapp-testing`, `mcp-builder`, `skill-creator`, `playwright-cli`, `supabase-postgres-best-practices`, `supabase`, `stripe-best-practices`, `find-skills`, `deploy-to-vercel`
- Agentes: `arquiteto-de-solucao`, `desenvolvedor`, `lider-projeto`, `revisor-de-seguranca`, `testador`
- Prompts prontos: 7 arquivos na pasta `prompts/`
