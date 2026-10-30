import { ehAvulsoPorProduto, formatarReais, precoNaOferta, somaAvulsos, type Catalogo, type Produto } from "./dominio";
import { OFERTA_DOS_VIDEOS } from "./paginas-videos";

// Dados do bloco de oferta no fim das páginas dos vídeos. Tudo calculado aqui, a partir do banco;
// o pagina.js só desenha. Os links levam à compra direta (login, se faltar, e depois o checkout).

export type VitrinePacote = {
  slug: string;
  titulo: string;
  gancho: string;
  descricao: string;
  precoTexto: string;
  comprarUrl: string;
};

export type VitrineCombo = {
  titulo: string;
  descricao: string;
  itens: { titulo: string; conteudo: string }[];
  somaTexto: string | null;
  precoTexto: string;
  economiaTexto: string | null;
  comprarUrl: string;
};

export type Vitrine = { pacote: VitrinePacote | null; combo: VitrineCombo | null };

function plural(n: number, um: string, varios: string): string {
  return `${n} ${n === 1 ? um : varios}`;
}

function contagem(p: Produto): string {
  const partes = [
    p.qtdSkills > 0 ? plural(p.qtdSkills, "skill", "skills") : null,
    p.qtdAgentes > 0 ? plural(p.qtdAgentes, "agente", "agentes") : null,
  ].filter((x): x is string => x !== null);
  return partes.length ? partes.join(" e ") : "skills e agentes";
}

function urlComprar(oferta: string, produto?: string): string {
  const q = new URLSearchParams({ oferta });
  if (produto) q.set("produtos", produto);
  return `/loja/comprar/?${q}`;
}

export function montarVitrine(catalogo: Catalogo, pagina: string): Vitrine {
  const avulso = catalogo.ofertas.find(ehAvulsoPorProduto);
  const config = OFERTA_DOS_VIDEOS[pagina];
  const produto = config ? catalogo.produtos.find((p) => p.slug === config.pacote) : undefined;

  const pacote: VitrinePacote | null =
    config && produto && avulso
      ? {
          slug: produto.slug,
          titulo: produto.titulo,
          gancho: config.gancho,
          descricao: produto.resumo,
          precoTexto: formatarReais(precoNaOferta(avulso, produto)),
          comprarUrl: urlComprar(avulso.codigo, produto.slug),
        }
      : null;

  const todos = catalogo.ofertas.find((o) => o.tipo === "todos");
  let combo: VitrineCombo | null = null;
  if (todos) {
    const itens = catalogo.produtos.map((p) => p.slug);
    const soma = somaAvulsos(catalogo, itens);
    const economia = soma !== null && soma > todos.precoCentavos ? soma - todos.precoCentavos : null;
    combo = {
      titulo: todos.titulo,
      // Deixa claro que a contagem inclui skills de outros autores, instaladas pelo instalador a partir do repositório original
      descricao: `Os ${catalogo.produtos.length} pacotes de uma vez, com aula, prompts e instalador. As contagens somam as skills autorais e as de outros autores que o instalador seleciona e instala.`,
      itens: catalogo.produtos.map((p) => ({ titulo: p.titulo, conteudo: contagem(p) })),
      somaTexto: economia !== null && soma !== null ? formatarReais(soma) : null,
      precoTexto: formatarReais(todos.precoCentavos),
      economiaTexto: economia !== null ? formatarReais(economia) : null,
      comprarUrl: urlComprar(todos.codigo),
    };
  }
  return { pacote, combo };
}
