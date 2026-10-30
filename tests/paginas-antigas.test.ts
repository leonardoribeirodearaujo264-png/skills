import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { PAGINAS_ANTIGAS } from "@/lib/paginas-antigas";

// Compara cada endereço antigo, servido pelo Next, com o HTML que estava publicado no branch main.
// Rode com o servidor de pé: SITE_TESTE=http://localhost:3100 npm test
// No preview: SITE_TESTE=https://<preview>.vercel.app node --env-file=.env.local node_modules/vitest/vitest.mjs run tests/paginas-antigas.test.ts
const BASE = process.env.SITE_TESTE;
const REF = process.env.REF_ORIGINAL ?? "main";
// Preview da Vercel com proteção de login: o token "Protection Bypass for Automation" vai no cabeçalho
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const cabecalhos: Record<string, string> = BYPASS ? { "x-vercel-protection-bypass": BYPASS } : {};

function original(pasta: string): string {
  const caminho = pasta === "" ? "index.html" : `${pasta}/index.html`;
  return execFileSync("git", ["show", `${REF}:${caminho}`], { encoding: "utf8" });
}

describe.skipIf(!BASE)("páginas antigas dos vídeos", () => {
  for (const pasta of PAGINAS_ANTIGAS) {
    const variantes = pasta === "" ? ["/", "/index.html"] : [`/${pasta}/`, `/${pasta}`, `/${pasta}/index.html`];
    for (const caminho of variantes) {
      it(`${caminho} responde 200 com o mesmo HTML`, async () => {
        const r = await fetch(`${BASE}${caminho}`, { redirect: "manual", headers: cabecalhos });
        expect(r.status).toBe(200);
        expect(r.headers.get("content-type")).toContain("text/html");
        expect(await r.text()).toBe(original(pasta));
      });
    }
  }

  it("estilo.css segue igual", async () => {
    const r = await fetch(`${BASE}/assets/estilo.css`, { headers: cabecalhos });
    expect(r.status).toBe(200);
    expect(await r.text()).toBe(execFileSync("git", ["show", `${REF}:assets/estilo.css`], { encoding: "utf8" }));
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
    expect(v.pacote.comprarUrl).toContain("/loja/comprar/");
    expect([v.combo.somaTexto, v.combo.precoTexto, v.combo.economiaTexto]).toEqual(["R$\u00a0195,00", "R$\u00a0127,00", "R$\u00a068,00"]);
    const css = await fetch(`${BASE}/assets/oferta.css`, { headers: cabecalhos });
    expect(css.status).toBe(200);
  });

  it("endereço inexistente responde 404", async () => {
    const r = await fetch(`${BASE}/naoexiste/`, { redirect: "manual", headers: cabecalhos });
    expect(r.status).toBe(404);
  });
});
