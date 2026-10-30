#!/usr/bin/env bash
# Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.
# Instala o pacote "Motion, mockup e fontes" no Codex. No Windows, rode no Git Bash ou use o .ps1.
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

instalar greensock/gsap-skills gsap-core
instalar greensock/gsap-skills gsap-timeline
instalar greensock/gsap-skills gsap-scrolltrigger
instalar greensock/gsap-skills gsap-react
instalar greensock/gsap-skills gsap-plugins
instalar greensock/gsap-skills gsap-performance
instalar heygen-com/hyperframes hyperframes
instalar heygen-com/hyperframes hyperframes-cli
instalar emilkowalski/skills review-animations
instalar emilkowalski/skills animation-vocabulary
instalar emilkowalski/skills improve-animations
instalar emilkowalski/skills find-animation-opportunities
instalar emilkowalski/skills apple-design
instalar pbakaus/impeccable impeccable
instalar Owl-Listener/designer-skills animation-principles
instalar Owl-Listener/designer-skills motion-system
instalar secondsky/claude-skills aceternity-ui
instalar freshtechbro/claudedesignskills motion-framer
instalar lottiefiles/motion-design-skill motion-design
instalar diffusionstudio/lottie text-to-lottie
instalar cloudai-x/threejs-skills threejs-animation
instalar jakubkrehel/skills better-typography
instalar jakubkrehel/skills better-colors
instalar wondelai/skills web-typography
instalar anthropics/skills canvas-design
instalar coreyhaines31/marketingskills image

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
