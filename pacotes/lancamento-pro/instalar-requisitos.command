#!/usr/bin/env bash
# Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.
# Mac: dois cliques neste arquivo. Linux: bash instalar-requisitos.command
# Instala o que o pacote "Lançamento Pro" precisa: App do Claude, Node.js LTS.
set -u

if [ "$(uname)" != "Darwin" ]; then
  echo "Linux: rode  sudo apt install nodejs npm"
  echo "O app do Claude para Linux ainda não existe; use o Claude Code no terminal (claude.ai/download)."
  exit 0
fi

if ! command -v brew >/dev/null 2>&1; then
  echo "Falta o Homebrew. Abra brew.sh, copie o comando de instalação, cole no Terminal e rode este arquivo de novo."
  exit 1
fi

faltou=()
garantir() {
  local nome="$1" pacote="$2" teste="${@: -1}"
  if [ "$teste" != "-" ] && command -v "$teste" >/dev/null 2>&1; then echo "[ok]   $nome já está instalado"; return; fi
  echo "Instalando $nome..."
  # shellcheck disable=SC2086
  if brew install ${@:2:$#-2}; then echo "[ok]   $nome instalado"; else faltou+=("$nome"); fi
}

garantir "App do Claude" --cask claude -
garantir "Node.js LTS" node node

echo ""
if [ ${#faltou[@]} -gt 0 ]; then echo "Faltou: ${faltou[*]}. Rode de novo."; exit 1; fi
echo "Pronto. Abra o app do Claude, entre com a sua conta (plano Pro ou Max) e siga o COMECE-AQUI.md."
