// Gera instalar-claude/instalar-codex (.ps1 e .sh) e CREDITOS.md de cada pacote a partir do pacote.json.
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
  console.log(`${slug}: instaladores e CREDITOS.md gerados`);
}
