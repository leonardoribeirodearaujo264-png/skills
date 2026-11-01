import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { PAGINAS_ANTIGAS } from "@/lib/paginas-antigas";

// Compara cada endereço antigo, servido pelo Next, com o HTML que estava publicado no branch main.
// Rode com o servidor de pé: SITE_TESTE=http://localhost:3100 npm test
// No preview: SITE_TESTE=https://<preview>.vercel.app node --env-file=.env.local node_modules/vitest/vitest.mjs run tests/paginas-antigas.test.ts
const BASE = process.env.SITE_TESTE;
// Último commit do site estático antes da migração (o que a automação de DM já divulgou)
const REF = process.env.REF_ORIGINAL ?? "eb532be";
// Preview da Vercel com proteção de login: o token "Protection Bypass for Automation" vai no cabeçalho
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const cabecalhos: Record<string, string> = BYPASS ? { "x-vercel-protection-bypass": BYPASS } : {};

// As páginas dos vídeos continuam comparadas com o HTML que a automação divulgou.
// A página inicial virou rota do app (página de vendas) e tem o próprio teste abaixo.
// Páginas antigas que ganharam conteúdo depois da migração (31/10: prompt para copiar) comparam com o commit da mudança
const ATUALIZADAS: Record<string, string> = { freellm: "785a4e4", ranking: "785a4e4" };

function original(pasta: string): string {
  const ref = ATUALIZADAS[pasta];
  const alvo = ref ? `${ref}:public/${pasta}/index.html` : `${REF}:${pasta}/index.html`;
  return execFileSync("git", ["show", alvo], { encoding: "utf8" });
}

describe.skipIf(!BASE)("páginas antigas dos vídeos", () => {
  for (const pasta of PAGINAS_ANTIGAS) {
    for (const caminho of [`/${pasta}/`, `/${pasta}`, `/${pasta}/index.html`]) {
      it(`${caminho} responde 200 com o mesmo HTML`, async () => {
        const r = await fetch(`${BASE}${caminho}`, { redirect: "manual", headers: cabecalhos });
        expect(r.status).toBe(200);
        expect(r.headers.get("content-type")).toContain("text/html");
        expect(await r.text()).toBe(original(pasta));
      });
    }
  }

  it("/ responde 200 com a página de vendas e /index.html leva para /", async () => {
    const r = await fetch(`${BASE}/`, { redirect: "manual", headers: cabecalhos });
    expect(r.status).toBe(200);
    const html = await r.text();
    expect(html).toContain("pacote de skills");
    expect(html).toContain('id="agentes-gratis"');
    const antigo = await fetch(`${BASE}/index.html`, { redirect: "manual", headers: cabecalhos });
    expect([307, 308]).toContain(antigo.status);
    expect(new URL(antigo.headers.get("location")!, BASE).pathname).toBe("/");
  }, 15_000);

  // O estilo.css só pode ter mudado de cor: toda regra do original continua lá e o destaque vem do token laranja
  it("estilo.css mantém todas as regras do original e usa o destaque laranja", async () => {
    const r = await fetch(`${BASE}/assets/estilo.css`, { headers: cabecalhos });
    expect(r.status).toBe(200);
    const atual = await r.text();
    const original = execFileSync("git", ["show", `${REF}:assets/estilo.css`], { encoding: "utf8" });
    const seletores = (css: string) =>
      [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/(^|})\s*([^{}@]+?)\s*{/g)].map((m) => m[2]!.replace(/\s+/g, " ").trim());
    const atuais = new Set(seletores(atual));
    expect(seletores(original).filter((s) => !atuais.has(s))).toEqual([]);
    expect(atual).toContain("--accent: #C03F00;");
    expect(atual).not.toMatch(/2F5BFF|6B8BFF/i);
  });

  it("a vitrine do fim das páginas traz o pacote do vídeo e o combo com os preços do banco", async () => {
    const r = await fetch(`${BASE}/api/loja/vitrine?pagina=agentes`, { headers: cabecalhos });
    expect(r.status).toBe(200);
    const v = (await r.json()) as {
      pacote: { slug: string; precoTexto: string; comprarUrl: string };
      combo: { somaTexto: string; precoTexto: string; economiaTexto: string };
    };
    expect(v.pacote.slug).toBe("times-de-agentes");
    expect(v.pacote.precoTexto).toBe("R$\u00a037,00");
    expect(v.pacote.comprarUrl).toContain("/loja/checkout/");
    expect([v.combo.somaTexto, v.combo.precoTexto, v.combo.economiaTexto]).toEqual(["R$\u00a0195,00", "R$\u00a097,00", "R$\u00a098,00"]);
    const css = await fetch(`${BASE}/assets/oferta.css`, { headers: cabecalhos });
    expect(css.status).toBe(200);
  }, 15_000); // primeira chamada fria ao Supabase pode passar de 5 s fora da CDN

  it("endereço inexistente responde 404", async () => {
    const r = await fetch(`${BASE}/naoexiste/`, { redirect: "manual", headers: cabecalhos });
    expect(r.status).toBe(404);
  });
});
