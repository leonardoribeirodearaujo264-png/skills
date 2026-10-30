// Gera src/lib/loja/conteudo-pacotes.json a partir de pacotes/<slug>/: os prompts de demonstração
// (escolhidos em "demonstracoes" do pacote.json), a função do agente ou da skill de cada um (do frontmatter)
// e o conteúdo de venda (venda.json, quando existe). A página pública lê só esse JSON: nada é escrito à mão nela.
// Uso: node scripts/gerar-vitrine-pacotes.mjs           (gera)
//      node scripts/gerar-vitrine-pacotes.mjs --conferir (falha se o JSON estiver desatualizado)
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const PACOTES = join(RAIZ, "pacotes");
const DESTINO = join(RAIZ, "src", "lib", "loja", "conteudo-pacotes.json");

function frontmatter(arquivo) {
  const texto = readFileSync(arquivo, "utf8").replace(/\r\n/g, "\n");
  const m = texto.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error(`sem frontmatter: ${arquivo}`);
  return Object.fromEntries(
    m[1].split("\n").filter((l) => l.includes(": ")).map((l) => [l.slice(0, l.indexOf(": ")), l.slice(l.indexOf(": ") + 2).trim()]),
  );
}

// Título, "Use quando ..." e o bloco do Claude Code de um prompt do pacote
function lerPrompt(pasta, nome) {
  const texto = readFileSync(join(pasta, "prompts", `${nome}.md`), "utf8").replace(/\r\n/g, "\n");
  const titulo = texto.match(/^# (.+)$/m)?.[1]?.trim();
  const quando = texto.match(/^(Use quando .+)$/m)?.[1]?.trim();
  const bloco = texto.split(/^Codex/m)[0].match(/```text\n([\s\S]*?)\n```/)?.[1]?.trim();
  if (!titulo || !quando || !bloco) throw new Error(`prompt incompleto: ${nome}`);
  return { titulo, quando, texto: bloco };
}

function gerar() {
  const saida = {};
  for (const slug of readdirSync(PACOTES).sort()) {
    const pasta = join(PACOTES, slug);
    const json = join(pasta, "pacote.json");
    if (!existsSync(json)) continue;
    const pacote = JSON.parse(readFileSync(json, "utf8"));
    const venda = existsSync(join(pasta, "venda.json")) ? JSON.parse(readFileSync(join(pasta, "venda.json"), "utf8")) : null;
    const ganhoDe = (nome) => venda?.agentes?.find((a) => a.nome === nome)?.ganho ?? venda?.skills?.find((s) => s.nome === nome)?.ganho;
    const demonstracoes = (pacote.demonstracoes ?? []).map((d) => {
      const tipo = d.skill ? "skill" : "agente";
      const nome = d.skill ?? d.agente;
      const arquivo = tipo === "skill" ? join(pasta, "skills", nome, "SKILL.md") : join(pasta, "agents", "claude", `${nome}.md`);
      const resultado = d.resultado ?? ganhoDe(nome);
      if (!resultado) throw new Error(`${slug}/${nome}: sem resultado na demonstração nem no venda.json`);
      return { ...lerPrompt(pasta, d.prompt), tipo, nome, funcao: frontmatter(arquivo).description, resultado };
    });
    if (demonstracoes.length || venda) saida[slug] = { demonstracoes, venda };
  }
  return `${JSON.stringify(saida, null, 2)}\n`;
}

const novo = gerar();
if (process.argv.includes("--conferir")) {
  const atual = existsSync(DESTINO) ? readFileSync(DESTINO, "utf8").replace(/\r\n/g, "\n") : "";
  if (atual !== novo) {
    console.error("src/lib/loja/conteudo-pacotes.json está desatualizado: rode npm run pacotes:vitrine");
    process.exit(1);
  }
  console.log("conteudo-pacotes.json em dia");
} else {
  writeFileSync(DESTINO, novo);
  console.log("gerado", DESTINO);
}
