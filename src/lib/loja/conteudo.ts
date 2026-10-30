import { z } from "zod";
import bruto from "./conteudo-pacotes.json";

// Conteúdo público de cada pacote, gerado por scripts/gerar-vitrine-pacotes.mjs a partir de pacotes/<slug>/
// (prompts de demonstração, função de cada agente e o venda.json). A página só exibe; nada aqui é escrito à mão.

const item = z.object({ nome: z.string(), grupo: z.string(), faz: z.string(), quando: z.string(), ganho: z.string() });
const venda = z.object({ promessa: z.string(), paraQuem: z.array(z.string()), agentes: z.array(item), skills: z.array(item) });
const demonstracao = z.object({
  titulo: z.string(),
  quando: z.string(),
  texto: z.string(),
  tipo: z.enum(["agente", "skill"]),
  nome: z.string(),
  funcao: z.string(),
  resultado: z.string(),
});
const conteudo = z.record(z.string(), z.object({ demonstracoes: z.array(demonstracao), venda: venda.nullable() }));

export type Demonstracao = z.infer<typeof demonstracao>;
export type ItemVenda = z.infer<typeof item>;
export type Venda = z.infer<typeof venda>;

const CONTEUDO = conteudo.parse(bruto);

export function conteudoDoPacote(slug: string): { demonstracoes: Demonstracao[]; venda: Venda | null } {
  return CONTEUDO[slug] ?? { demonstracoes: [], venda: null };
}

// Agrupa os itens do venda.json na ordem em que os grupos aparecem
export function porGrupo(itens: ItemVenda[]): { grupo: string; itens: ItemVenda[] }[] {
  const grupos: { grupo: string; itens: ItemVenda[] }[] = [];
  for (const i of itens) {
    const g = grupos.find((x) => x.grupo === i.grupo);
    if (g) g.itens.push(i);
    else grupos.push({ grupo: i.grupo, itens: [i] });
  }
  return grupos;
}
