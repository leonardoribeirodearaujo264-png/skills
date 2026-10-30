#!/usr/bin/env bash
# Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.
# Instala o pacote "Edição de vídeo por skills" no Claude Code. No Windows, rode no Git Bash ou use o .ps1.
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

instalar heygen-com/hyperframes hyperframes
instalar heygen-com/hyperframes hyperframes-cli
instalar heygen-com/hyperframes hyperframes-registry
instalar heygen-com/hyperframes media-use
instalar heygen-com/hyperframes slideshow
instalar heygen-com/hyperframes remotion-to-hyperframes
instalar digitalsamba/claude-code-video-toolkit ffmpeg
instalar digitalsamba/claude-code-video-toolkit moviepy
instalar coreyhaines31/marketingskills social
instalar browser-use/video-use video-use

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
