import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { PAGINAS_ANTIGAS } from "@/lib/paginas-antigas";

// Compara cada endereço antigo, servido pelo Next, com o HTML que estava publicado no branch main.
// Rode com o servidor de pé: SITE_TESTE=http://localhost:3100 npm test
const BASE = process.env.SITE_TESTE;
const REF = process.env.REF_ORIGINAL ?? "main";

function original(pasta: string): string {
  const caminho = pasta === "" ? "index.html" : `${pasta}/index.html`;
  return execFileSync("git", ["show", `${REF}:${caminho}`], { encoding: "utf8" });
}

describe.skipIf(!BASE)("páginas antigas dos vídeos", () => {
  for (const pasta of PAGINAS_ANTIGAS) {
    const variantes = pasta === "" ? ["/", "/index.html"] : [`/${pasta}/`, `/${pasta}`, `/${pasta}/index.html`];
    for (const caminho of variantes) {
      it(`${caminho} responde 200 com o mesmo HTML`, async () => {
        const r = await fetch(`${BASE}${caminho}`, { redirect: "manual" });
        expect(r.status).toBe(200);
        expect(r.headers.get("content-type")).toContain("text/html");
        expect(await r.text()).toBe(original(pasta));
      });
    }
  }

  it("estilo.css segue igual", async () => {
    const r = await fetch(`${BASE}/assets/estilo.css`);
    expect(r.status).toBe(200);
    expect(await r.text()).toBe(execFileSync("git", ["show", `${REF}:assets/estilo.css`], { encoding: "utf8" }));
  });

  it("endereço inexistente responde 404", async () => {
    const r = await fetch(`${BASE}/naoexiste/`, { redirect: "manual" });
    expect(r.status).toBe(404);
  });
});
