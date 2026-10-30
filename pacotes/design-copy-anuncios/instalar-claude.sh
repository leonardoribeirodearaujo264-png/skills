#!/usr/bin/env bash
# Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.
# Instala o pacote "Design, copy, anúncios e velocidade" no Claude Code. No Windows, rode no Git Bash ou use o .ps1.
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

instalar nextlevelbuilder/ui-ux-pro-max-skill ui-ux-pro-max
instalar nextlevelbuilder/ui-ux-pro-max-skill design-system
instalar nextlevelbuilder/ui-ux-pro-max-skill brand
instalar nextlevelbuilder/ui-ux-pro-max-skill banner-design
instalar nextlevelbuilder/ui-ux-pro-max-skill ui-styling
instalar pbakaus/impeccable impeccable
instalar anthropics/skills frontend-design
instalar anthropics/skills theme-factory
instalar leonxlnx/taste-skill design-taste-frontend
instalar emilkowalski/skills emil-design-eng
instalar jakubkrehel/skills better-ui
instalar addyosmani/web-quality-skills accessibility
instalar addyosmani/web-quality-skills performance
instalar addyosmani/web-quality-skills core-web-vitals
instalar shadcn-ui/ui shadcn
instalar coreyhaines31/marketingskills copywriting
instalar coreyhaines31/marketingskills copy-editing
instalar coreyhaines31/marketingskills marketing-psychology
instalar coreyhaines31/marketingskills offers
instalar coreyhaines31/marketingskills cro
instalar coreyhaines31/marketingskills ad-creative
instalar coreyhaines31/marketingskills ab-testing
instalar coreyhaines31/marketingskills emails
instalar coreyhaines31/marketingskills seo-audit
instalar agricidaniel/claude-ads ads-meta
instalar vercel-labs/agent-skills vercel-react-best-practices
instalar vercel-labs/agent-skills web-design-guidelines

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
