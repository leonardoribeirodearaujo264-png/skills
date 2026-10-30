# Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.
# Instala o pacote "Lançamento Pro" no Claude Code.
# Uso: powershell -ExecutionPolicy Bypass -File .\instalar-claude.ps1
$ErrorActionPreference = "Continue"
$Aqui = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js não encontrado. Instale o Node.js 22 ou mais novo e rode de novo."
  exit 1
}

$Falhas = @()
function Instalar([string]$Fonte, [string]$Skill) {
  Write-Host "Instalando $Skill ($Fonte)"
  npx -y skills add $Fonte --skill $Skill -a claude-code -g -y
  if ($LASTEXITCODE -ne 0) { $script:Falhas += "$Fonte --skill $Skill" }
}



New-Item -ItemType Directory -Force (Join-Path $HOME ".claude\skills") | Out-Null
Copy-Item -Recurse -Force (Join-Path $Aqui "skills\*") (Join-Path $HOME ".claude\skills")
Write-Host "Skills autorais copiadas para ~\.claude\skills"
New-Item -ItemType Directory -Force (Join-Path $HOME ".claude\agents") | Out-Null
Copy-Item -Force (Join-Path $Aqui "agents\claude\*.md") (Join-Path $HOME ".claude\agents")
Write-Host "Time de agentes copiado para ~\.claude\agents"

if ($Falhas.Count -gt 0) {
  Write-Host ""
  Write-Host "Não foi possível instalar:"
  foreach ($f in $Falhas) { Write-Host "  npx skills add $f -a claude-code -g -y" }
  Write-Host "Rode esses comandos de novo mais tarde."
  exit 1
}
Write-Host ""
Write-Host "Pronto. Abra o Claude Code de novo para carregar as skills e o time."
