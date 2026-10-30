#!/usr/bin/env bash
# Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.
# Instala o pacote "Programação para quem não programa" no Codex. No Windows, rode no Git Bash ou use o .ps1.
set -uo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"

if ! command -v npx >/dev/null 2>&1; then
  echo "Node.js não encontrado. Instale o Node.js 22 ou mais novo e rode de novo."
  exit 1
fi

falhas=()
instalar() {
  echo "Instalando $2 ($1)"
  npx -y skills add "$1" --skill "$2" -a codex -g -y || falhas+=("$1 --skill $2")
}

instalar mattpocock/skills grill-me
instalar mattpocock/skills to-spec
instalar mattpocock/skills tdd
instalar mattpocock/skills diagnosing-bugs
instalar mattpocock/skills code-review
instalar mattpocock/skills improve-codebase-architecture
instalar mattpocock/skills setup-pre-commit
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

mkdir -p "$HOME/.agents/skills"
cp -R "$AQUI/skills/." "$HOME/.agents/skills/"
echo "Skills autorais copiadas para ~/.agents/skills"
mkdir -p "$HOME/.codex/agents"
cp "$AQUI/agents/codex/"*.toml "$HOME/.codex/agents/"
echo "Time de agentes copiado para ~/.codex/agents"

if [ ${#falhas[@]} -gt 0 ]; then
  echo ""
  echo "Não foi possível instalar:"
  printf '  npx skills add %s -a codex -g -y\n' "${falhas[@]}"
  echo "Rode esses comandos de novo mais tarde."
  exit 1
fi
echo ""
echo "Pronto. Abra o Codex de novo para carregar as skills e o time."
