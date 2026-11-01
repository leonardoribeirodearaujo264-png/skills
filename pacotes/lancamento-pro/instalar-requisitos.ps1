# Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.
# Instala o que o pacote "Lançamento Pro" precisa: App do Claude, Node.js LTS.
# Uso: dois cliques em instalar-requisitos.bat. Para só conferir, sem instalar: -Conferir
param([switch]$Conferir)
$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [Text.Encoding]::UTF8

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "O winget não está neste Windows. Atualize o 'Instalador de Aplicativo' pela Microsoft Store e rode de novo."
  exit 1
}

$Faltou = @()
function Garantir([string]$Nome, [string]$Id, $Comando) {
  $tem = $false
  # O "python" de WindowsApps é só um atalho para a Microsoft Store, não conta como instalado
  if ($Comando) { $c = Get-Command $Comando -ErrorAction SilentlyContinue; $tem = [bool]($c -and $c.Source -notmatch "WindowsApps") }
  if (-not $tem) {
    winget list --id $Id -e --accept-source-agreements *> $null
    $tem = ($LASTEXITCODE -eq 0)
  }
  if ($tem) { Write-Host "[ok]   $Nome já está instalado"; return }
  if ($Conferir) { Write-Host "[falta] $Nome"; $script:Faltou += $Nome; return }
  Write-Host "Instalando $Nome..."
  winget install --id $Id -e --silent --accept-source-agreements --accept-package-agreements
  if ($LASTEXITCODE -ne 0) { $script:Faltou += $Nome; Write-Host "[erro] não deu para instalar $Nome" }
  else { Write-Host "[ok]   $Nome instalado" }
}

Garantir "App do Claude" "Anthropic.Claude" $null
Garantir "Node.js LTS" "OpenJS.NodeJS.LTS" "node"

Write-Host ""
if ($Faltou.Count -gt 0) {
  Write-Host "Faltou: $($Faltou -join ', ')"
  if (-not $Conferir) { Write-Host "Rode de novo. Se continuar, instale pelo site de cada programa." }
  exit 1
}
Write-Host "Pronto. Abra o app do Claude, entre com a sua conta (plano Pro ou Max) e siga o COMECE-AQUI.md."
