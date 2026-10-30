# Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.
# Instala o pacote "Design, copy, anúncios e velocidade" no Codex.
# Uso: powershell -ExecutionPolicy Bypass -File .\instalar-codex.ps1
$ErrorActionPreference = "Continue"
$Aqui = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js não encontrado. Instale o Node.js 22 ou mais novo e rode de novo."
  exit 1
}

$Falhas = @()
function Instalar([string]$Fonte, [string]$Skill) {
  Write-Host "Instalando $Skill ($Fonte)"
  npx -y skills add $Fonte --skill $Skill -a codex -g -y
  if ($LASTEXITCODE -ne 0) { $script:Falhas += "$Fonte --skill $Skill" }
}

Instalar "nextlevelbuilder/ui-ux-pro-max-skill" "ui-ux-pro-max"
Instalar "nextlevelbuilder/ui-ux-pro-max-skill" "design-system"
Instalar "nextlevelbuilder/ui-ux-pro-max-skill" "brand"
Instalar "nextlevelbuilder/ui-ux-pro-max-skill" "banner-design"
Instalar "nextlevelbuilder/ui-ux-pro-max-skill" "ui-styling"
Instalar "pbakaus/impeccable" "impeccable"
Instalar "anthropics/skills" "frontend-design"
Instalar "anthropics/skills" "theme-factory"
Instalar "leonxlnx/taste-skill" "design-taste-frontend"
Instalar "emilkowalski/skills" "emil-design-eng"
Instalar "jakubkrehel/skills" "better-ui"
Instalar "addyosmani/web-quality-skills" "accessibility"
Instalar "addyosmani/web-quality-skills" "performance"
Instalar "addyosmani/web-quality-skills" "core-web-vitals"
Instalar "shadcn-ui/ui" "shadcn"
Instalar "coreyhaines31/marketingskills" "copywriting"
Instalar "coreyhaines31/marketingskills" "copy-editing"
Instalar "coreyhaines31/marketingskills" "marketing-psychology"
Instalar "coreyhaines31/marketingskills" "offers"
Instalar "coreyhaines31/marketingskills" "cro"
Instalar "coreyhaines31/marketingskills" "ad-creative"
Instalar "coreyhaines31/marketingskills" "ab-testing"
Instalar "coreyhaines31/marketingskills" "emails"
Instalar "coreyhaines31/marketingskills" "seo-audit"
Instalar "agricidaniel/claude-ads" "ads-meta"
Instalar "vercel-labs/agent-skills" "vercel-react-best-practices"
Instalar "vercel-labs/agent-skills" "web-design-guidelines"

New-Item -ItemType Directory -Force (Join-Path $HOME ".agents\skills") | Out-Null
Copy-Item -Recurse -Force (Join-Path $Aqui "skills\*") (Join-Path $HOME ".agents\skills")
Write-Host "Skills autorais copiadas para ~\.agents\skills"
New-Item -ItemType Directory -Force (Join-Path $HOME ".codex\agents") | Out-Null
Copy-Item -Force (Join-Path $Aqui "agents\codex\*.toml") (Join-Path $HOME ".codex\agents")
Write-Host "Time de agentes copiado para ~\.codex\agents"

if ($Falhas.Count -gt 0) {
  Write-Host ""
  Write-Host "Não foi possível instalar:"
  foreach ($f in $Falhas) { Write-Host "  npx skills add $f -a codex -g -y" }
  Write-Host "Rode esses comandos de novo mais tarde."
  exit 1
}
Write-Host ""
Write-Host "Pronto. Abra o Codex de novo para carregar as skills e o time."
