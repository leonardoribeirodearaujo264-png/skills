// Publica os pacotes na área de membros: conteúdo em loja_conteudos, .zip e aula no Storage, números em loja_produtos.
// A pasta pacotes/<slug>/ é a fonte; o banco é a cópia que o RLS protege.
// Uso: npm run pacotes:publicar            (lê .env.local)
//      node scripts/publicar-pacotes.mjs --seco [slug]   (só monta e confere, sem rede)
// Aulas: AULAS_DIR/<slug>/aula.mp4 e aula.vtt (padrão D:\automacao-leo\aulas). Zips em TEMP_PACOTES (padrão D:\automacao-leo\tmp\pacotes-zip).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const RAIZ = fileURLToPath(new URL("../pacotes/", import.meta.url));
const AULAS = process.env.AULAS_DIR ?? "D:\\automacao-leo\\aulas";
const TEMP = process.env.TEMP_PACOTES ?? "D:\\automacao-leo\\tmp\\pacotes-zip";
const seco = process.argv.includes("--seco");
const filtro = process.argv.slice(2).find((a) => !a.startsWith("--"));

function frontmatter(texto) {
  const m = texto.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---/);
  const campos = {};
  if (!m) return campos;
  for (const linha of m[1].split(/\r?\n/)) {
    const c = linha.match(/^(\w+):\s*(.*)$/);
    if (c) campos[c[1]] = c[2].replace(/^["']|["']$/g, "").trim();
  }
  return campos;
}

function listar(pasta, filtroArquivo) {
  return existsSync(pasta) ? readdirSync(pasta).filter(filtroArquivo).sort() : [];
}

function lerPacote(slug) {
  const pasta = join(RAIZ, slug);
  const dados = JSON.parse(readFileSync(join(pasta, "pacote.json"), "utf8"));
  // O passo a passo de instalação (COMECE-AQUI.md, gerado) vem antes do guia na área de membros
  const comece = existsSync(join(pasta, "COMECE-AQUI.md"))
    ? readFileSync(join(pasta, "COMECE-AQUI.md"), "utf8").replace(/^<!--[\s\S]*?-->\s*/, "")
    : "";
  const guia = `${comece ? `${comece.trim()}

---

` : ""}${readFileSync(join(pasta, "README.md"), "utf8")}`;
  const roteiro = existsSync(join(pasta, "aula", "roteiro.md")) ? readFileSync(join(pasta, "aula", "roteiro.md"), "utf8") : null;

  const prompts = listar(join(pasta, "prompts"), (f) => f.endsWith(".md")).map((f, i) => {
    const corpo = readFileSync(join(pasta, "prompts", f), "utf8");
    const titulo = (corpo.match(/^# (.+)$/m)?.[1] ?? basename(f, ".md")).trim();
    return { tipo: "prompt", chave: basename(f, ".md"), titulo, corpo, ordem: i + 1 };
  });

  const skills = listar(join(pasta, "skills"), (d) => existsSync(join(pasta, "skills", d, "SKILL.md"))).map((d) => {
    const fm = frontmatter(readFileSync(join(pasta, "skills", d, "SKILL.md"), "utf8"));
    return { nome: fm.name || d, descricao: fm.description || "" };
  });
  const agentes = listar(join(pasta, "agents", "claude"), (f) => f.endsWith(".md")).map((f) => {
    const fm = frontmatter(readFileSync(join(pasta, "agents", "claude", f), "utf8"));
    return { nome: fm.name || basename(f, ".md"), descricao: fm.description || "" };
  });
  const codex = listar(join(pasta, "agents", "codex"), (f) => f.endsWith(".toml"));
  if (codex.length !== agentes.length) throw new Error(`${slug}: ${agentes.length} agentes Claude e ${codex.length} Codex`);

  const terceiros = (dados.terceiros ?? []).map((t) => ({
    fonte: t.fonte,
    url: t.url,
    licenca: t.licenca,
    skills: t.skills,
    codex: t.codex !== false,
  }));
  const qtdTerceiros = terceiros.reduce((n, t) => n + t.skills.length, 0);

  const destaques = [
    agentes.length ? `Time autoral de ${agentes.length} agentes, para Claude Code e Codex` : null,
    skills.length ? `Skill${skills.length > 1 ? "s" : ""} autora${skills.length > 1 ? "is" : "l"}: ${skills.map((s) => s.nome).join(", ")}` : null,
    qtdTerceiros ? `${qtdTerceiros} skills de outros autores com instalador` : null,
    prompts.length ? `${prompts.length} prompts prontos em português` : null,
  ].filter(Boolean);

  const conteudos = [
    { tipo: "guia", chave: "readme", titulo: dados.titulo, corpo: guia, ordem: 0 },
    { tipo: "manifesto", chave: "pacote", titulo: dados.titulo, corpo: JSON.stringify({ terceiros, autorais: { skills, agentes } }), ordem: 0 },
    ...(roteiro ? [{ tipo: "roteiro", chave: "aula", titulo: "Roteiro da aula", corpo: roteiro, ordem: 0 }] : []),
    ...prompts,
  ];

  return {
    slug,
    conteudos,
    produto: {
      destaques,
      qtd_skills: skills.length + qtdTerceiros,
      qtd_agentes: agentes.length,
      qtd_prompts: prompts.length,
    },
  };
}

// .zip com a pasta do pacote, sem a pasta da aula em vídeo. tar do Windows 10+ (bsdtar) grava zip com -a.
function gerarZip(slug) {
  mkdirSync(TEMP, { recursive: true });
  const destino = join(TEMP, `${slug}.zip`);
  rmSync(destino, { force: true });
  // No Windows, o tar do sistema (bsdtar) grava .zip; o do Git Bash, que pode vir antes no PATH, não
  const tar = process.platform === "win32" ? join(process.env.SystemRoot ?? "C:\Windows", "System32", "tar.exe") : "tar";
  execFileSync(tar, ["-a", "-c", "-f", destino, "--exclude", "*.mp4", "--exclude", "*.png", "-C", RAIZ, slug]);
  return destino;
}

function duracaoAula(arquivo) {
  try {
    const s = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", arquivo], {
      encoding: "utf8",
    });
    return Math.round(Number(s.trim()));
  } catch {
    return null;
  }
}

async function enviar(db, bucket, caminho, arquivo, tipo) {
  const { error } = await db.storage.from(bucket).upload(caminho, readFileSync(arquivo), { contentType: tipo, upsert: true });
  if (error) throw new Error(`upload ${bucket}/${caminho}: ${error.message}`);
}

async function publicar(db, p) {
  const zip = gerarZip(p.slug);
  const kb = Math.round(statSync(zip).size / 1024);
  const video = join(AULAS, p.slug, "aula.mp4");
  const legenda = join(AULAS, p.slug, "aula.vtt");
  const temAula = existsSync(video);
  const duracao = temAula ? duracaoAula(video) : null;
  if (duracao !== null && duracao > 60) throw new Error(`${p.slug}: aula com ${duracao} s, o limite é 60`);

  console.log(`${p.slug}: ${p.conteudos.length} conteúdos, zip ${kb} KB, aula ${temAula ? `${duracao} s` : "ausente"}`);
  if (seco) return;

  await enviar(db, "loja-pacotes", `${p.slug}/${p.slug}.zip`, zip, "application/zip");
  if (temAula) {
    await enviar(db, "loja-aulas", `${p.slug}/aula.mp4`, video, "video/mp4");
    if (existsSync(legenda)) await enviar(db, "loja-aulas", `${p.slug}/aula.vtt`, legenda, "text/vtt");
  }

  const linhas = p.conteudos.map((c) => ({ ...c, produto_slug: p.slug, atualizado_em: new Date().toISOString() }));
  const up = await db.from("loja_conteudos").upsert(linhas, { onConflict: "produto_slug,tipo,chave" });
  if (up.error) throw new Error(`${p.slug}: conteúdos: ${up.error.message}`);

  // Remove o que saiu do pacote (prompt apagado ou renomeado)
  const atuais = await db.from("loja_conteudos").select("id, tipo, chave").eq("produto_slug", p.slug);
  if (atuais.error) throw new Error(`${p.slug}: ler conteúdos: ${atuais.error.message}`);
  const validos = new Set(p.conteudos.map((c) => `${c.tipo}:${c.chave}`));
  const sobras = atuais.data.filter((c) => !validos.has(`${c.tipo}:${c.chave}`)).map((c) => c.id);
  if (sobras.length) {
    const del = await db.from("loja_conteudos").delete().in("id", sobras);
    if (del.error) throw new Error(`${p.slug}: limpar conteúdos: ${del.error.message}`);
  }

  const prod = await db
    .from("loja_produtos")
    .update({
      ...p.produto,
      zip_arquivo: `${p.slug}/${p.slug}.zip`,
      aula_arquivo: temAula ? `${p.slug}/aula.mp4` : null,
      aula_legenda: temAula && existsSync(legenda) ? `${p.slug}/aula.vtt` : null,
      aula_duracao_s: duracao,
    })
    .eq("slug", p.slug)
    .select("slug");
  if (prod.error) throw new Error(`${p.slug}: produto: ${prod.error.message}`);
  if (prod.data.length !== 1) throw new Error(`${p.slug}: produto não existe em loja_produtos (rode banco/0001_loja.sql)`);
}

const slugs = readdirSync(RAIZ, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(RAIZ, d.name, "pacote.json")))
  .map((d) => d.name)
  .filter((s) => !filtro || s === filtro);

let db = null;
if (!seco) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  db = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}

for (const slug of slugs) await publicar(db, lerPacote(slug));
console.log(seco ? "Conferência concluída, nada foi enviado." : "Publicação concluída.");
