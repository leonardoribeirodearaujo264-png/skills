// Gera instalar-claude/instalar-codex (.ps1 e .sh), CREDITOS.md e COMECE-AQUI.md de cada pacote a partir do pacote.json.
// Uso: node scripts/gerar-instaladores.mjs [slug]
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("../pacotes/", import.meta.url));
const AVISO = "Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.";
const FONTE_VALIDA = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const NOME_VALIDO = /^[a-z0-9][a-z0-9-]*$/;

const ALVOS = {
  claude: {
    rotulo: "Claude Code",
    agente: "claude-code",
    pastaSkills: ".claude/skills",
    pastaAgentes: ".claude/agents",
    origemAgentes: "agents/claude",
    extensao: "md",
  },
  codex: {
    rotulo: "Codex",
    agente: "codex",
    pastaSkills: ".agents/skills",
    pastaAgentes: ".codex/agents",
    origemAgentes: "agents/codex",
    extensao: "toml",
  },
};

function lerPacote(slug) {
  const dados = JSON.parse(readFileSync(join(RAIZ, slug, "pacote.json"), "utf8"));
  if (dados.slug !== slug) throw new Error(`${slug}: pacote.json tem slug "${dados.slug}"`);
  for (const t of dados.terceiros ?? []) {
    if (!FONTE_VALIDA.test(t.fonte)) throw new Error(`${slug}: fonte inválida "${t.fonte}"`);
    if (!["MIT", "Apache-2.0"].includes(t.licenca) && t.licenca !== "Sem licença") {
      throw new Error(`${slug}: licença "${t.licenca}" fora da lista (MIT, Apache-2.0, Sem licença)`);
    }
    for (const s of t.skills) if (!NOME_VALIDO.test(s)) throw new Error(`${slug}: skill inválida "${s}"`);
  }
  return dados;
}

function comandos(dados, alvo) {
  return (dados.terceiros ?? [])
    .filter((t) => alvo === "claude" || t.codex !== false)
    .flatMap((t) => t.skills.map((s) => ({ fonte: t.fonte, skill: s })));
}

function temSkillsAutorais(slug) {
  const pasta = join(RAIZ, slug, "skills");
  return existsSync(pasta) && readdirSync(pasta).length > 0;
}

function gerarSh(dados, alvo) {
  const a = ALVOS[alvo];
  const linhas = comandos(dados, alvo).map((c) => `instalar ${c.fonte} ${c.skill}`);
  const copiaSkills = temSkillsAutorais(dados.slug)
    ? `mkdir -p "$HOME/${a.pastaSkills}"\ncp -R "$AQUI/skills/." "$HOME/${a.pastaSkills}/"\necho "Skills autorais copiadas para ~/${a.pastaSkills}"`
    : "";
  return `#!/usr/bin/env bash
# ${AVISO}
# Instala o pacote "${dados.titulo}" no ${a.rotulo}. No Windows, rode no Git Bash ou use o .ps1.
set -uo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"

if ! command -v npx >/dev/null 2>&1; then
  echo "Node.js não encontrado. Instale o Node.js 22 ou mais novo e rode de novo."
  exit 1
fi

falhas=()
instalar() {
  echo "Instalando $2 ($1)"
  npx -y skills add "$1" --skill "$2" -a ${a.agente} -g -y || falhas+=("$1 --skill $2")
}

${linhas.join("\n")}

${copiaSkills}
mkdir -p "$HOME/${a.pastaAgentes}"
cp "$AQUI/${a.origemAgentes}/"*.${a.extensao} "$HOME/${a.pastaAgentes}/"
echo "Time de agentes copiado para ~/${a.pastaAgentes}"

if [ \${#falhas[@]} -gt 0 ]; then
  echo ""
  echo "Não foi possível instalar:"
  printf '  npx skills add %s -a ${a.agente} -g -y\\n' "\${falhas[@]}"
  echo "Rode esses comandos de novo mais tarde."
  exit 1
fi
echo ""
echo "Pronto. Abra o ${a.rotulo} de novo para carregar as skills e o time."
`;
}

function gerarPs1(dados, alvo) {
  const a = ALVOS[alvo];
  const linhas = comandos(dados, alvo).map((c) => `Instalar "${c.fonte}" "${c.skill}"`);
  const pastaSkills = a.pastaSkills.replace("/", "\\");
  const pastaAgentes = a.pastaAgentes.replace("/", "\\");
  const origem = a.origemAgentes.replace("/", "\\");
  const copiaSkills = temSkillsAutorais(dados.slug)
    ? `New-Item -ItemType Directory -Force (Join-Path $HOME "${pastaSkills}") | Out-Null
Copy-Item -Recurse -Force (Join-Path $Aqui "skills\\*") (Join-Path $HOME "${pastaSkills}")
Write-Host "Skills autorais copiadas para ~\\${pastaSkills}"`
    : "";
  return `# ${AVISO}
# Instala o pacote "${dados.titulo}" no ${a.rotulo}.
# Uso: powershell -ExecutionPolicy Bypass -File .\\instalar-${alvo}.ps1
$ErrorActionPreference = "Continue"
$Aqui = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js não encontrado. Instale o Node.js 22 ou mais novo e rode de novo."
  exit 1
}

$Falhas = @()
function Instalar([string]$Fonte, [string]$Skill) {
  Write-Host "Instalando $Skill ($Fonte)"
  npx -y skills add $Fonte --skill $Skill -a ${a.agente} -g -y
  if ($LASTEXITCODE -ne 0) { $script:Falhas += "$Fonte --skill $Skill" }
}

${linhas.join("\n")}

${copiaSkills}
New-Item -ItemType Directory -Force (Join-Path $HOME "${pastaAgentes}") | Out-Null
Copy-Item -Force (Join-Path $Aqui "${origem}\\*.${a.extensao}") (Join-Path $HOME "${pastaAgentes}")
Write-Host "Time de agentes copiado para ~\\${pastaAgentes}"

if ($Falhas.Count -gt 0) {
  Write-Host ""
  Write-Host "Não foi possível instalar:"
  foreach ($f in $Falhas) { Write-Host "  npx skills add $f -a ${a.agente} -g -y" }
  Write-Host "Rode esses comandos de novo mais tarde."
  exit 1
}
Write-Host ""
Write-Host "Pronto. Abra o ${a.rotulo} de novo para carregar as skills e o time."
`;
}

function gerarCreditosAutorais() {
  return `<!-- ${AVISO} -->
# Créditos

Este pacote não usa skill, plugin nem arquivo de terceiros. O instalador não baixa nada da internet: ele só copia as skills e os agentes que já estão dentro do pacote.

## Conteúdo autoral

O guia, os prompts, as skills da pasta \`skills/\` e o time de agentes da pasta \`agents/\` são de autoria de Leonardo Araujo. Veja \`LICENSES/\`.
`;
}

function gerarCreditos(dados) {
  if (!(dados.terceiros ?? []).length && !(dados.plugins ?? []).length) return gerarCreditosAutorais();
  const linhas = (dados.terceiros ?? []).map(
    (t) => `| [${t.fonte}](${t.url}) | ${t.licenca} | ${t.skills.join(", ")} | ${t.codex === false ? "Só Claude Code" : "Claude Code e Codex"} |`,
  );
  const plugins = (dados.plugins ?? []).map(
    (p) => `| [${p.fonte}](${p.url}) | ${p.licenca} | plugin: ${p.nome} | ${p.comandoCodex ? "Claude Code e Codex" : "Só Claude Code"} |`,
  );
  return `<!-- ${AVISO} -->
# Créditos

As skills de terceiros abaixo são gratuitas e de código aberto. Elas não estão copiadas neste pacote: o instalador baixa cada uma direto do repositório do autor, com o comando \`npx skills add\`. A licença de cada uma vale como está no repositório original. Este pacote não tem parceria nem vínculo com esses autores.

| Fonte | Licença | Skills | Funciona em |
|---|---|---|---|
${[...linhas, ...plugins].join("\n")}

## Conteúdo autoral

O guia, os prompts, as skills da pasta \`skills/\` e o time de agentes da pasta \`agents/\` são de autoria de Leonardo Araujo. Veja \`LICENSES/\`.
`;
}

function nomesDe(slug, pasta, extensao) {
  const dir = join(RAIZ, slug, pasta);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => (extensao ? d.isFile() && d.name.endsWith(extensao) : d.isDirectory()))
    .map((d) => (extensao ? d.name.slice(0, -extensao.length) : d.name))
    .sort();
}

// Programas que o cliente precisa antes do pacote. App do Claude e Node.js sempre; os extras vêm de
// pacote.json (posInstalacao.programas). Instalados por um arquivo de dois cliques: winget no Windows,
// Homebrew no Mac. Linux recebe os comandos do apt para rodar.
const PROGRAMAS = {
  claude: { nome: "App do Claude", winget: "Anthropic.Claude", brew: "--cask claude", apt: null, teste: null },
  node: { nome: "Node.js LTS", winget: "OpenJS.NodeJS.LTS", brew: "node", apt: "nodejs npm", teste: "node" },
  python: { nome: "Python 3.12", winget: "Python.Python.3.12", brew: "python", apt: "python3 python3-venv", teste: "python" },
  ffmpeg: { nome: "FFmpeg", winget: "Gyan.FFmpeg", brew: "ffmpeg", apt: "ffmpeg", teste: "ffmpeg" },
};

function programasDo(dados) {
  return ["claude", "node", ...(dados.posInstalacao?.programas ?? [])].map((p) => {
    if (!PROGRAMAS[p]) throw new Error(`${dados.slug}: programa desconhecido "${p}"`);
    return PROGRAMAS[p];
  });
}

function gerarRequisitosPs1(dados) {
  const itens = programasDo(dados)
    .map((p) => `Garantir "${p.nome}" "${p.winget}" ${p.teste ? `"${p.teste}"` : "$null"}`)
    .join("\n");
  return `# ${AVISO}
# Instala o que o pacote "${dados.titulo}" precisa: ${programasDo(dados).map((p) => p.nome).join(", ")}.
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

${itens}

Write-Host ""
if ($Faltou.Count -gt 0) {
  Write-Host "Faltou: $($Faltou -join ', ')"
  if (-not $Conferir) { Write-Host "Rode de novo. Se continuar, instale pelo site de cada programa." }
  exit 1
}
Write-Host "Pronto. Abra o app do Claude, entre com a sua conta (plano Pro ou Max) e siga o COMECE-AQUI.md."
`;
}

function gerarRequisitosBat() {
  return `@echo off
rem ${AVISO}
rem Dois cliques: instala o app do Claude e os programas que o pacote precisa.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar-requisitos.ps1"
echo.
pause
`;
}

function gerarRequisitosMac(dados) {
  const progs = programasDo(dados);
  const brew = progs.map((p) => `garantir "${p.nome}" ${p.brew} ${p.teste ?? "-"}`).join("\n");
  const apt = progs.filter((p) => p.apt).map((p) => p.apt).join(" ");
  return `#!/usr/bin/env bash
# ${AVISO}
# Mac: dois cliques neste arquivo. Linux: bash instalar-requisitos.command
# Instala o que o pacote "${dados.titulo}" precisa: ${progs.map((p) => p.nome).join(", ")}.
set -u

if [ "$(uname)" != "Darwin" ]; then
  echo "Linux: rode  sudo apt install ${apt}"
  echo "O app do Claude para Linux ainda não existe; use o Claude Code no terminal (claude.ai/download)."
  exit 0
fi

if ! command -v brew >/dev/null 2>&1; then
  echo "Falta o Homebrew. Abra brew.sh, copie o comando de instalação, cole no Terminal e rode este arquivo de novo."
  exit 1
fi

faltou=()
garantir() {
  local nome="$1" pacote="$2" teste="\${@: -1}"
  if [ "$teste" != "-" ] && command -v "$teste" >/dev/null 2>&1; then echo "[ok]   $nome já está instalado"; return; fi
  echo "Instalando $nome..."
  # shellcheck disable=SC2086
  if brew install \${@:2:$#-2}; then echo "[ok]   $nome instalado"; else faltou+=("$nome"); fi
}

${brew}

echo ""
if [ \${#faltou[@]} -gt 0 ]; then echo "Faltou: \${faltou[*]}. Rode de novo."; exit 1; fi
echo "Pronto. Abra o app do Claude, entre com a sua conta (plano Pro ou Max) e siga o COMECE-AQUI.md."
`;
}

// Passo a passo para quem nunca usou o Claude: instalar o app, baixar o pacote e colar um pedido que faz
// o próprio Claude Code instalar, conferir e testar tudo
function gerarComeceAqui(dados) {
  const skillsAutorais = nomesDe(dados.slug, "skills");
  const terceiras = comandos(dados, "claude").map((c) => c.skill);
  const agentes = nomesDe(dados.slug, "agents/claude", ".md");
  const prompts = nomesDe(dados.slug, "prompts", ".md");
  const lista = (xs) => (xs.length ? xs.map((x) => `\`${x}\``).join(", ") : "nenhuma");
  // posInstalacao (pacote.json): passo extra depois do instalador, como montar o ambiente de uma skill
  const pos = dados.posInstalacao;
  return `<!-- ${AVISO} -->
# Comece aqui: como instalar o pacote "${dados.titulo}"

São 4 passos. Você não precisa saber programar: o passo 2 instala os programas com dois cliques, e no passo 4 o próprio Claude instala e testa o pacote por você.

## 1. Baixe e extraia o pacote

1. Na sua área de membros, clique em **Baixar o pacote**. Vem um arquivo \`.zip\`.
2. Clique com o botão direito no \`.zip\` e escolha **Extrair tudo** (no Mac, basta dar dois cliques).
3. Guarde a pasta extraída num lugar fácil, como **Documentos**.

## 2. Instale os programas com dois cliques

Dentro da pasta do pacote:

- **Windows:** dê dois cliques em \`instalar-requisitos.bat\`. Se o Windows perguntar se pode abrir, clique em **Mais informações** e **Executar assim mesmo**.
- **Mac:** clique com o botão direito em \`instalar-requisitos.command\`, escolha **Abrir** e confirme. Ele usa o Homebrew (brew.sh).

Ele confere e instala só o que faltar: ${programasDo(dados).map((p) => `**${p.nome}**`).join(", ")}. Quando terminar, abra o app do Claude e entre com a sua conta. O Claude Code (a aba **Code** do app) precisa de um plano pago do Claude, como o Pro ou o Max.

Prefere instalar à mão? App do Claude em **claude.ai/download** e Node.js LTS em **nodejs.org**${pos ? `; este pacote também precisa de **${pos.requisito}**` : ""}.

## 3. Abra a pasta no Claude

Abra o app **Claude**, vá na aba **Code** e escolha a pasta extraída do pacote como pasta de trabalho.

## 4. Peça ao Claude para instalar e testar

1. Copie o pedido abaixo inteiro, cole na conversa e envie.
2. Quando o Claude pedir permissão para rodar o instalador, confira e aceite.

\`\`\`text
Instale o pacote desta pasta no meu Claude Code e confira se deu certo.

1. Veja qual é o meu sistema. No Windows, rode: powershell -ExecutionPolicy Bypass -File .\\instalar-claude.ps1
   No Mac ou no Linux, rode: bash ./instalar-claude.sh
2. Se aparecer "Node.js não encontrado", pare e me explique como instalar o Node.js 22.${pos ? `
   ${pos.pedido}` : ""}
3. Depois de instalar, confira se estas pastas existem:
   - em ~/.claude/skills: ${[...skillsAutorais, ...terceiras].join(", ") || "(este pacote não tem skills)"}
   - em ~/.claude/agents: ${agentes.map((a) => `${a}.md`).join(", ")}
4. Me mostre uma lista com o que foi instalado e o que faltou. Se algo falhou, rode de novo só o que faltou.
5. No fim, me diga para fechar e abrir o Claude de novo, e qual prompt da pasta prompts/ eu devo testar primeiro.
Não apague, não publique e não pague nada sem me perguntar.
\`\`\`

## Depois de instalar

- Feche e abra o Claude de novo para ele carregar as skills e o time.
- Teste com o primeiro prompt da pasta \`prompts/\`${prompts.length ? ` (\`${prompts[0]}.md\`)` : ""}: abra o arquivo, copie, troque o que estiver entre colchetes e envie.
- Usa o Codex? Na pasta do pacote, rode \`instalar-codex.ps1\` (Windows) ou \`instalar-codex.sh\` (Mac e Linux). O passo a passo completo está no \`README.md\`.

## O que este pacote instala

- Skills autorais: ${lista(skillsAutorais)}
- Skills de terceiros (baixadas do autor na hora): ${lista(terceiras)}
- Agentes: ${lista(agentes)}
- Prompts prontos: ${prompts.length} arquivos na pasta \`prompts/\`
`;
}

const slugs = process.argv[2]
  ? [process.argv[2]]
  : readdirSync(RAIZ, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(RAIZ, d.name, "pacote.json")))
      .map((d) => d.name);

for (const slug of slugs) {
  const dados = lerPacote(slug);
  for (const alvo of Object.keys(ALVOS)) {
    writeFileSync(join(RAIZ, slug, `instalar-${alvo}.sh`), gerarSh(dados, alvo));
    // BOM: o Windows PowerShell 5.1 lê .ps1 sem BOM como ANSI e estraga os acentos
    writeFileSync(join(RAIZ, slug, `instalar-${alvo}.ps1`), "﻿" + gerarPs1(dados, alvo).replace(/\n/g, "\r\n"));
  }
  writeFileSync(join(RAIZ, slug, "CREDITOS.md"), gerarCreditos(dados));
  writeFileSync(join(RAIZ, slug, "COMECE-AQUI.md"), gerarComeceAqui(dados));
  writeFileSync(join(RAIZ, slug, "instalar-requisitos.ps1"), "﻿" + gerarRequisitosPs1(dados).replace(/\n/g, "\r\n"));
  writeFileSync(join(RAIZ, slug, "instalar-requisitos.bat"), gerarRequisitosBat().replace(/\n/g, "\r\n"));
  writeFileSync(join(RAIZ, slug, "instalar-requisitos.command"), gerarRequisitosMac(dados), { mode: 0o755 });
  console.log(`${slug}: instaladores, CREDITOS.md e COMECE-AQUI.md gerados`);
}
