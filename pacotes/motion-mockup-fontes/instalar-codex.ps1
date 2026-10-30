# Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.
# Instala o pacote "Motion, mockup e fontes" no Codex.
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

Instalar "greensock/gsap-skills" "gsap-core"
Instalar "greensock/gsap-skills" "gsap-timeline"
Instalar "greensock/gsap-skills" "gsap-scrolltrigger"
Instalar "greensock/gsap-skills" "gsap-react"
Instalar "greensock/gsap-skills" "gsap-plugins"
Instalar "greensock/gsap-skills" "gsap-performance"
Instalar "heygen-com/hyperframes" "hyperframes"
Instalar "heygen-com/hyperframes" "hyperframes-cli"
Instalar "emilkowalski/skills" "review-animations"
Instalar "emilkowalski/skills" "animation-vocabulary"
Instalar "emilkowalski/skills" "improve-animations"
Instalar "emilkowalski/skills" "find-animation-opportunities"
Instalar "emilkowalski/skills" "apple-design"
Instalar "pbakaus/impeccable" "impeccable"
Instalar "Owl-Listener/designer-skills" "animation-principles"
Instalar "Owl-Listener/designer-skills" "motion-system"
Instalar "secondsky/claude-skills" "aceternity-ui"
Instalar "freshtechbro/claudedesignskills" "motion-framer"
Instalar "lottiefiles/motion-design-skill" "motion-design"
Instalar "diffusionstudio/lottie" "text-to-lottie"
Instalar "cloudai-x/threejs-skills" "threejs-animation"
Instalar "jakubkrehel/skills" "better-typography"
Instalar "jakubkrehel/skills" "better-colors"
Instalar "wondelai/skills" "web-typography"
Instalar "anthropics/skills" "canvas-design"
Instalar "coreyhaines31/marketingskills" "image"

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
