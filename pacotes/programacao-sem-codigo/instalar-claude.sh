#!/usr/bin/env bash
# Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.
# Instala o pacote "Programação para quem não programa" no Claude Code. No Windows, rode no Git Bash ou use o .ps1.
set -uo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"

if ! command -v npx >/dev/null 2>&1; then
  echo "Node.js não encontrado. Instale o Node.js 22 ou mais novo e rode de novo."
  exit 1
fi

falhas=()
instalar() {
  echo "Instalando $2 ($1)"
  npx -y skills add "$1" --skill "$2" -a claude-code -g -y || falhas+=("$1 --skill $2")
}

instalar mattpocock/skills grill-me
instalar mattpocock/skills to-spec
instalar mattpocock/skills tdd
instalar mattpocock/skills diagnosing-bugs
instalar mattpocock/skills code-review
instalar mattpocock/skills improve-codebase-architecture
instalar mattpocock/skills setup-pre-commit
instalar mattpocock/skills git-guardrails-claude-code
instalar obra/superpowers brainstorming
instalar obra/superpowers writing-plans
instalar obra/superpowers systematic-debugging
instalar obra/superpowers test-driven-development
instalar obra/superpowers verification-before-completion
instalar obra/superpowers requesting-code-review
instalar obra/superpowers using-git-worktrees
instalar addyosmani/agent-skills security-and-hardening
instalar addyosmani/agent-skills code-review-and-quality
instalar addyosmani/agent-skills shipping-and-launch
instalar addyosmani/agent-skills ci-cd-and-automation
instalar addyosmani/agent-skills browser-testing-with-devtools
instalar getsentry/skills security-review
instalar getsentry/skills find-bugs
instalar anthropics/skills webapp-testing
instalar anthropics/skills mcp-builder
instalar anthropics/skills skill-creator
instalar microsoft/playwright-cli playwright-cli
instalar supabase/agent-skills supabase-postgres-best-practices
instalar supabase/agent-skills supabase
instalar stripe/ai stripe-best-practices
instalar vercel-labs/skills find-skills
instalar vercel-labs/agent-skills deploy-to-vercel

mkdir -p "$HOME/.claude/skills"
cp -R "$AQUI/skills/." "$HOME/.claude/skills/"
echo "Skills autorais copiadas para ~/.claude/skills"
mkdir -p "$HOME/.claude/agents"
cp "$AQUI/agents/claude/"*.md "$HOME/.claude/agents/"
echo "Time de agentes copiado para ~/.claude/agents"

if [ ${#falhas[@]} -gt 0 ]; then
  echo ""
  echo "Não foi possível instalar:"
  printf '  npx skills add %s -a claude-code -g -y\n' "${falhas[@]}"
  echo "Rode esses comandos de novo mais tarde."
  exit 1
fi
echo ""
echo "Pronto. Abra o Claude Code de novo para carregar as skills e o time."
