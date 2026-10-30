#!/usr/bin/env bash
# Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.
# Instala o pacote "Edição de vídeo por skills" no Codex. No Windows, rode no Git Bash ou use o .ps1.
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
