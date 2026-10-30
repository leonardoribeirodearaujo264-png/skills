# Contexto da equipe: site-skills

## Mapa atual (antes da migração)
- Site estático na Vercel (skills-sandy-seven.vercel.app), repo público github.com/leonardoribeirodearaujo264-png/skills.
- Páginas: `/` (index.html), `/agentes/`, `/clonadora/`, `/harvey/`, `/banca/`, `/conselho/`, `/freellm/`, `/ranking/`, `/pagina-agentes/` (redireciona para /agentes/).
- `assets/estilo.css` (tokens: Bricolage Grotesque, Inter, JetBrains Mono, azul #2F5BFF, fundo #F6F5F1, tema escuro) e `assets/pagina.js` (bloco de oferta "Em breve" e botão copiar).
- A automação de DM do Instagram (C:\Users\leona\automacao-leo\comentarios) manda esses links todos os dias. Os endereços e o conteúdo não podem mudar.
- Supabase compartilhado com a automação (tabelas dela: videos, palavras_chave etc.). As tabelas da loja usam o prefixo `loja_`.
- Migrações são rodadas pelo dono no SQL Editor do Supabase (padrão da automação). Não há psql nem CLI do Supabase.

## Plano aprovado (decisões do dono vindas da sessão principal)
- Next.js 16 App Router, TypeScript estrito, pasta `src/`. Mesmas dependências da automação: next, react, react-dom, @supabase/supabase-js, zod; dev: typescript, @types/*, eslint, eslint-config-next, vitest. Nada além disso.
- Páginas antigas: copiadas sem alteração para `public/` e servidas por rewrites (`trailingSlash: true`), respondendo 200 nos mesmos endereços. Só `pagina.js` muda: o botão da oferta passa a apontar para `/loja/`.
- Loja em `/loja/`, área de membros em `/membros/`, login em `/entrar/`.
- Preços e composição dos combos só no banco (`loja_ofertas`, `loja_oferta_itens`). Backend calcula e valida a oferta; a tela só exibe.
  - avulso R$37 (1 produto à escolha), leve3 R$67 (3 produtos à escolha), video R$97 (composição fixa no banco), combo R$127 (todos).
- Auth: Supabase Auth com link mágico (PKCE). Cookies httpOnly com access e refresh token; consultas da área de membros com o JWT do usuário, RLS decide.
- Conteúdo dos produtos em `loja_conteudos` com RLS por `loja_acessos`. Vídeos e .zip em buckets privados do Storage, entregues por URL assinada curta depois da checagem de acesso.
- Mercado Pago Checkout Pro: preferência criada no servidor, webhook com x-signature validado, consulta do pagamento na API, liberação atômica e idempotente por função SQL (`loja_liberar_pedido`). Unique em (user_id, produto_slug) e em mp_payment_id.
- Produtos em `pacotes/<slug>/` no repo: README.md, skills/, agents/claude/*.md, agents/codex/*.toml, prompts/, instalar-claude.ps1/.sh, instalar-codex.ps1/.sh, CREDITOS.md, LICENSES/.
- Terceiros só como comando `npx skills add ... -a claude-code -a codex`. Nenhum arquivo de terceiro copiado.
- Aulas HyperFrames de até 60 s, render e temporários no D: (`D:\automacao-leo\tmp`).

## Comandos
- Ordem validada (todos exit 0): tipos `npm run tipos` (tsc --noEmit); lint `npm run lint` (eslint .); testes `npm test` (vitest run); build `npm run build` (next build).
- Páginas antigas: `npx next start -p 3101` em segundo plano, depois (Git Bash) `SITE_TESTE=http://localhost:3101 npm test` (não usar BASE_URL, o Vite sobrescreve); encerrar com `taskkill //PID <pid> //T //F`. Sem SITE_TESTE: 18 passam, 30 pulados; com: 46 passam, 2 pulados.
- Outros: `npm run pacotes:zip`, `npm run pacotes:publicar` (usa .env.local).
- Ambiente: TEMP/TMP em `D:\automacao-leo\tmp`, cache npm em `D:\npm-cache`.

## Skills escolhidas
Catálogo lido em 30/10/2026. Não há skill instalada de Supabase, RLS, Mercado Pago, Stripe nem segurança; nessas etapas a regra vem do plano e do cacador-de-bugs/revisor. Ordem = ordem de carga.
- Migração (Next.js 16): vercel-react-best-practices (regras de React/Next; ignorar o que conflitar com rewrites e trailingSlash). Só 1 serve.
- Banco/RLS: nenhuma skill de Supabase instalada. Opcional: domain-modeling (nomes e ADR das tabelas loja_*).
- Pagamento (Mercado Pago): nenhuma skill serve. Usar docs oficiais e test-driven-development para webhook, assinatura e idempotência.
- Telas (loja, membros, entrar): 1) frontend-design, 2) form-design (login e checkout), 3) loading-states (estados carregando, vazio, erro, sucesso). Revisão visual no fim: web-design-guidelines.
- Conteúdo dos produtos e skills autorais: 1) writing-for-agents (SKILL.md, agents e AGENTS.md/CLAUDE.md), 2) skill-creator (estrutura e evals das skills), 3) copywriting (README e textos de venda). Autorização: nenhuma é externa.
- Vídeo HyperFrames: 1) hyperframes (entrada obrigatória), 2) hyperframes-core (contrato da composição), 3) faceless-explainer (aula de texto sem filmagem). Se precisar de áudio ou legenda: hyperframes-audio / embedded-captions, em etapa à parte. Render só no D:. Pedir autorização se instalar algo ou gastar API (voz).
- Validação/revisão: 1) verification-before-completion, 2) mp-code-review, 3) systematic-debugging só se falhar algo. TDD em lib/pagamento e RLS: test-driven-development.
- Dono digita /nome (disable-model-invocation): to-spec, to-tickets, triage, wayfinder, handoff, claude-handoff. Nenhuma foi escolhida.
- Descartadas: remotion-* (projeto usa HyperFrames), ads-* (não há anúncio nesta tarefa), impeccable e ui-ux-pro-max (sobrepõem frontend-design), tdd (duplica test-driven-development), brainstorming/briefing (plano já aprovado), vercel-composition-patterns (pouco necessário).
