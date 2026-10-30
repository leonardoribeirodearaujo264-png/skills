import { Fragment } from "react";
import { BlocoCodigo } from "./BlocoCodigo";

// Renderizador mínimo para os guias dos pacotes (títulos, parágrafos, listas, tabelas, código).
// Gera elementos React, nunca HTML cru: nada do texto vira marcação executável.

type Bloco =
  | { tipo: "titulo"; nivel: 2 | 3 | 4; texto: string }
  | { tipo: "paragrafo"; texto: string }
  | { tipo: "lista"; ordenada: boolean; itens: string[] }
  | { tipo: "codigo"; linguagem: string; texto: string }
  | { tipo: "tabela"; cabecalho: string[]; linhas: string[][] };

export function analisarMarkdown(md: string): Bloco[] {
  const linhas = md.replace(/\r\n/g, "\n").split("\n");
  const blocos: Bloco[] = [];
  let i = 0;
  while (i < linhas.length) {
    const linha = linhas[i] ?? "";
    const cerca = linha.match(/^```(\S*)/);
    if (cerca) {
      const corpo: string[] = [];
      i++;
      while (i < linhas.length && !(linhas[i] ?? "").startsWith("```")) corpo.push(linhas[i++] ?? "");
      i++;
      blocos.push({ tipo: "codigo", linguagem: cerca[1] || "texto", texto: corpo.join("\n") });
      continue;
    }
    const titulo = linha.match(/^(#{1,4})\s+(.*)$/);
    if (titulo) {
      // O h1 do guia vira h2: a página já tem o título do produto
      const nivel = Math.min(4, Math.max(2, (titulo[1] ?? "#").length + 1)) as 2 | 3 | 4;
      blocos.push({ tipo: "titulo", nivel, texto: titulo[2] ?? "" });
      i++;
      continue;
    }
    if (linha.startsWith("|")) {
      const tab: string[][] = [];
      while (i < linhas.length && (linhas[i] ?? "").startsWith("|")) {
        const celulas = (linhas[i] ?? "").replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (!celulas.every((c) => /^:?-{2,}:?$/.test(c))) tab.push(celulas);
        i++;
      }
      blocos.push({ tipo: "tabela", cabecalho: tab[0] ?? [], linhas: tab.slice(1) });
      continue;
    }
    const item = linha.match(/^\s*([-*]|\d+\.)\s+(.*)$/);
    if (item) {
      const ordenada = /\d/.test(item[1] ?? "");
      const itens: string[] = [];
      while (i < linhas.length) {
        const m = (linhas[i] ?? "").match(/^\s*([-*]|\d+\.)\s+(.*)$/);
        if (!m) break;
        itens.push(m[2] ?? "");
        i++;
      }
      blocos.push({ tipo: "lista", ordenada, itens });
      continue;
    }
    if (linha.trim() === "" || linha.startsWith("<!--")) {
      i++;
      continue;
    }
    const par: string[] = [];
    while (i < linhas.length && (linhas[i] ?? "").trim() !== "" && !/^(#|```|\||\s*([-*]|\d+\.)\s)/.test(linhas[i] ?? "")) {
      par.push(linhas[i++] ?? "");
    }
    blocos.push({ tipo: "paragrafo", texto: par.join(" ") });
  }
  return blocos;
}

// Negrito, código e links em linha. Links só http(s) ou caminhos relativos do próprio pacote viram texto.
function Linha({ texto }: { texto: string }) {
  const partes = texto.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {partes.map((p, i) => {
        if (p.startsWith("`") && p.endsWith("`")) return <code key={i} className="inline">{p.slice(1, -1)}</code>;
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
        const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const href = link[2] ?? "";
          return /^https:\/\//.test(href) ? (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer">
              {link[1]}
            </a>
          ) : (
            <Fragment key={i}>{link[1]}</Fragment>
          );
        }
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

export function Markdown({ texto, pular = [] }: { texto: string; pular?: string[] }) {
  const blocos = analisarMarkdown(texto);
  return (
    <div className="guia">
      {blocos.map((b, i) => {
        switch (b.tipo) {
          case "titulo": {
            if (pular.includes(b.texto)) return null;
            const T = `h${b.nivel}` as const;
            return <T key={i}><Linha texto={b.texto} /></T>;
          }
          case "paragrafo":
            return <p key={i}><Linha texto={b.texto} /></p>;
          case "lista": {
            const L = b.ordenada ? "ol" : "ul";
            return (
              <L key={i}>
                {b.itens.map((it, j) => (
                  <li key={j}><Linha texto={it} /></li>
                ))}
              </L>
            );
          }
          case "codigo":
            return <BlocoCodigo key={i} rotulo={b.linguagem} texto={b.texto} />;
          case "tabela":
            return (
              <div key={i} className="tabela-rolagem" tabIndex={0} role="region" aria-label="Tabela">
                <table>
                  <thead>
                    <tr>{b.cabecalho.map((c, j) => <th key={j} scope="col"><Linha texto={c} /></th>)}</tr>
                  </thead>
                  <tbody>
                    {b.linhas.map((l, j) => (
                      <tr key={j}>{l.map((c, k) => <td key={k}><Linha texto={c} /></td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}

// Divide o guia pelas seções "## " para a página mostrar cada parte no lugar certo
export function secoesDoGuia(md: string): Map<string, string> {
  const mapa = new Map<string, string>();
  let atual = "inicio";
  let corpo: string[] = [];
  for (const linha of md.replace(/\r\n/g, "\n").split("\n")) {
    const m = linha.match(/^## (.+)$/);
    if (m) {
      mapa.set(atual, corpo.join("\n").trim());
      atual = (m[1] ?? "").trim();
      corpo = [];
    } else if (!/^# /.test(linha)) {
      corpo.push(linha);
    }
  }
  mapa.set(atual, corpo.join("\n").trim());
  return mapa;
}
