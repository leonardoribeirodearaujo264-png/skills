import { CAPA_COMBO, capaDoPacote, urlDoPacote, VITRINE_INICIAL, vitrineInicial, type Capa } from "./apresentacao";
import { precoNaOferta, somaAvulsos, type Catalogo, type Produto } from "./dominio";
import { PAGINAS_VIDEOS, type TipoPagina } from "./paginas-videos";
import { numerosDoPacote, urlComprar } from "./vitrine";

// Dados da página inicial de vendas. Preço, contagens e ofertas vêm do banco (carregarCatalogo); nomes,
// frases e capas de apresentacao.ts; agentes grátis de paginas-videos.ts. Sem I/O, para testar sem rede.

export type AgenteGratis = { pasta: string; titulo: string; frase: string; tipo: TipoPagina; pacote: string; pacoteCurto: string };

// Riscado só onde há preço anterior real: Coleção Completa (soma dos avulsos)
export type PrecoCartao = {
  centavos: number;
  anterior: number | null;
  rotulo: string;
  economia: number | null;
};

export type CartaoVenda = {
  id: string;
  variante: "avulso" | "destaque" | "completo";
  slug: string;
  capa: Capa | null;
  tag: { texto: string; suave: boolean } | null;
  meta: string[];
  titulo: string;
  descricao: string;
  inclui: string[];
  // null: preço não confirmado pelo servidor; a compra fica bloqueada
  preco: PrecoCartao | null;
  botao: string;
  href: string;
  agentes: AgenteGratis[];
  agentesDe: string;
};

export type PaginaInicial = {
  estado: "ok" | "erro" | "vazio";
  cartoes: CartaoVenda[];
  agentes: AgenteGratis[];
  filtros: { slug: string; nome: string }[];
};

function nomeCurto(slug: string, catalogo: Catalogo | null): string {
  return vitrineInicial(slug)?.curto ?? catalogo?.produtos.find((p) => p.slug === slug)?.titulo ?? slug;
}

export function agentesGratis(catalogo: Catalogo | null): AgenteGratis[] {
  return PAGINAS_VIDEOS.map((p) => ({
    pasta: p.pasta,
    titulo: p.titulo,
    frase: p.frase,
    tipo: p.tipo,
    pacote: p.oferta.pacote,
    pacoteCurto: nomeCurto(p.oferta.pacote, catalogo),
  }));
}

// Ordem do dono (apresentacao.ts) primeiro; pacote à venda fora da lista vai para o fim, na ordem do banco
function ordenar(produtos: readonly Produto[]): Produto[] {
  const posicao = (slug: string) => {
    const i = VITRINE_INICIAL.findIndex((v) => v.slug === slug);
    return i < 0 ? VITRINE_INICIAL.length : i;
  };
  return [...produtos].sort((a, b) => posicao(a.slug) - posicao(b.slug) || a.ordem - b.ordem);
}

function cartaoAvulso(p: Pick<Produto, "slug" | "titulo" | "resumo">, meta: string[], preco: PrecoCartao | null, agentes: AgenteGratis[], primeiro: boolean): CartaoVenda {
  const v = vitrineInicial(p.slug);
  const destaque = primeiro && Boolean(v?.destaque);
  return {
    id: `pacote-${p.slug}`,
    variante: destaque ? "destaque" : "avulso",
    slug: p.slug,
    capa: capaDoPacote(p.slug, p.titulo),
    tag: destaque ? { texto: "Comece por aqui", suave: true } : v?.novo ? { texto: "Novo", suave: false } : null,
    meta,
    titulo: v?.nome ?? p.titulo,
    descricao: v?.descricao ?? p.resumo,
    inclui: [],
    preco,
    botao: v?.botao ?? `Ver o pacote ${p.titulo}`,
    href: urlDoPacote(p.slug),
    agentes: agentes.filter((a) => a.pacote === p.slug),
    agentesDe: v?.curto ?? p.titulo,
  };
}

function cartaoCompleto(slugs: string[], nomes: string[], preco: PrecoCartao | null, href: string, agentes: AgenteGratis[]): CartaoVenda {
  return {
    id: "pacote-completo",
    variante: "completo",
    slug: "completo",
    capa: CAPA_COMBO,
    tag: null,
    meta: [`${slugs.length} pacotes`, "todos os agentes, skills e prompts"],
    titulo: "Coleção Completa",
    descricao: "Todos os pacotes numa compra só, com um pagamento único.",
    inclui: nomes,
    preco,
    botao: "Quero a Coleção Completa",
    href,
    agentes,
    agentesDe: "todos os pacotes",
  };
}

// catalogo null: o banco não respondeu. Os cards saem com capa e texto, sem preço, e a compra fica bloqueada.
export function montarPaginaInicial(catalogo: Catalogo | null): PaginaInicial {
  const agentes = agentesGratis(catalogo);
  const filtros = VITRINE_INICIAL.map((v) => ({ slug: v.slug, nome: v.curto }));

  if (!catalogo) {
    const cartoes = VITRINE_INICIAL.map((v, i) => cartaoAvulso({ slug: v.slug, titulo: v.nome, resumo: v.descricao }, [], null, agentes, i === 0));
    cartoes.push(cartaoCompleto(VITRINE_INICIAL.map((v) => v.slug), VITRINE_INICIAL.map((v) => v.curto), null, "/loja/", agentes));
    return { estado: "erro", cartoes, agentes, filtros };
  }

  const produtos = ordenar(catalogo.produtos);
  const avulso = catalogo.ofertas.find((o) => o.tipo === "escolha" && o.qtdEscolha === 1 && !o.exigeCliente);
  if (!produtos.length || !avulso) return { estado: "vazio", cartoes: [], agentes, filtros };

  const cartoes = produtos.map((p, i) =>
    cartaoAvulso(
      p,
      numerosDoPacote(p).map((n) => `${n.n} ${n.rotulo}`),
      { centavos: precoNaOferta(catalogo, avulso, p), anterior: null, rotulo: "Pagamento único", economia: null },
      agentes,
      i === 0,
    ),
  );

  const todos = catalogo.ofertas.find((o) => o.tipo === "todos");
  if (todos) {
    const slugs = produtos.map((p) => p.slug);
    const soma = somaAvulsos(catalogo, slugs);
    const anterior = soma !== null && soma > todos.precoCentavos ? soma : null;
    cartoes.push(
      cartaoCompleto(
        slugs,
        slugs.map((s) => nomeCurto(s, catalogo)),
        { centavos: todos.precoCentavos, anterior, rotulo: "Pagamento único", economia: anterior === null ? null : anterior - todos.precoCentavos },
        urlComprar(todos.codigo),
        agentes,
      ),
    );
  }


  return {
    estado: "ok",
    cartoes,
    agentes,
    filtros: filtros.filter((f) => produtos.some((p) => p.slug === f.slug)),
  };
}
