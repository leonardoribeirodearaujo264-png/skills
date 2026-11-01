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

São 4 passos. Você não precisa saber programar: no passo 4, o próprio Claude instala e testa tudo por você.

## 1. Instale o app do Claude no seu computador

1. Abra **claude.ai/download** no navegador do seu PC ou Mac e baixe o app **Claude** para o seu sistema.
2. Instale e entre com a sua conta. O Claude Code (a aba **Code** do app) precisa de um plano pago do Claude, como o Pro ou o Max.

## 2. Instale o Node.js

O instalador do pacote usa o Node.js. Abra **nodejs.org**, baixe a versão LTS (22 ou mais nova) e instale com as opções padrão. Se já tiver, pule este passo.${pos ? `

Este pacote também precisa de: **${pos.requisito}**. O Claude confere no passo 4 e explica como instalar o que faltar.` : ""}

## 3. Baixe e extraia o pacote

1. Na sua área de membros, clique em **Baixar o pacote**. Vem um arquivo \`.zip\`.
2. Clique com o botão direito no \`.zip\` e escolha **Extrair tudo** (no Mac, basta dar dois cliques).
3. Guarde a pasta extraída num lugar fácil, como **Documentos**.

## 4. Peça ao Claude para instalar e testar

1. Abra o app **Claude**, vá na aba **Code** e escolha a pasta extraída do pacote como pasta de trabalho.
2. Copie o pedido abaixo inteiro, cole na conversa e envie.
3. Quando o Claude pedir permissão para rodar o instalador, confira e aceite.

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
  console.log(`${slug}: instaladores, CREDITOS.md e COMECE-AQUI.md gerados`);
}
