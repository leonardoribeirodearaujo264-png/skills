import { DEMONSTRACAO_COLECAO, urlDoPacote, VITRINE_INICIAL, vitrineInicial, type Demonstracao } from "./apresentacao";
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

export type NumeroCartao = { valor: number; nome: string; ajuda: string };

export type CartaoVenda = {
  id: string;
  variante: "avulso" | "destaque" | "completo";
  slug: string;
  demonstracao: Demonstracao | null;
  etiqueta: string | null;
  numeros: NumeroCartao[];
  agentesGratis: number;
  titulo: string;
  descricao: string;
  inclui: string[];
  // null: preço não confirmado pelo servidor; a compra fica bloqueada
  preco: PrecoCartao | null;
  botao: string;
  href: string;
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

// Explica cada número para quem nunca usou skill nem agente
const AJUDA_DO_NUMERO: Record<string, string> = {
  agente: "ajudante especializado",
  agentes: "ajudantes especializados",
  time: "área da empresa",
  times: "áreas da empresa",
  skill: "instrução pronta",
  skills: "instruções prontas",
  prompt: "pedido para copiar",
  prompts: "pedidos para copiar",
};

function numerosDoCartao(p: Produto): NumeroCartao[] {
  return numerosDoPacote(p).map((n) => ({ valor: n.n, nome: n.rotulo, ajuda: AJUDA_DO_NUMERO[n.rotulo] ?? "" }));
}

// Ordem do dono (apresentacao.ts) primeiro; pacote à venda fora da lista vai para o fim, na ordem do banco
function ordenar(produtos: readonly Produto[]): Produto[] {
  const posicao = (slug: string) => {
    const i = VITRINE_INICIAL.findIndex((v) => v.slug === slug);
    return i < 0 ? VITRINE_INICIAL.length : i;
  };
  return [...produtos].sort((a, b) => posicao(a.slug) - posicao(b.slug) || a.ordem - b.ordem);
}

function cartaoAvulso(p: Pick<Produto, "slug" | "titulo" | "resumo">, numeros: NumeroCartao[], preco: PrecoCartao | null, agentes: AgenteGratis[], primeiro: boolean): CartaoVenda {
  const v = vitrineInicial(p.slug);
  const destaque = primeiro && Boolean(v?.destaque);
  return {
    id: `pacote-${p.slug}`,
    variante: destaque ? "destaque" : "avulso",
    slug: p.slug,
    demonstracao: v?.demonstracao ?? null,
    etiqueta: destaque ? "Comece por aqui" : v?.novo ? "Novo" : null,
    numeros,
    agentesGratis: agentes.filter((a) => a.pacote === p.slug).length,
    titulo: v?.nome ?? p.titulo,
    descricao: v?.descricao ?? p.resumo,
    inclui: [],
    preco,
    botao: v?.botao ?? `Ver ${p.titulo}`,
    href: urlDoPacote(p.slug),
  };
}

function cartaoCompleto(nomes: string[], preco: PrecoCartao | null, href: string, agentes: AgenteGratis[]): CartaoVenda {
  return {
    id: "pacote-completo",
    variante: "completo",
    slug: "completo",
    demonstracao: DEMONSTRACAO_COLECAO,
    etiqueta: "Todos os kits",
    numeros: [],
    agentesGratis: agentes.length,
    titulo: "Coleção Completa",
    descricao: "Todos os kits numa compra só, com um pagamento único.",
    inclui: nomes,
    preco,
    botao: "Quero a Coleção Completa",
    href,
  };
}

// catalogo null: o banco não respondeu. Os cards saem com capa e texto, sem preço, e a compra fica bloqueada.
export function montarPaginaInicial(catalogo: Catalogo | null): PaginaInicial {
  const agentes = agentesGratis(catalogo);
  const filtros = VITRINE_INICIAL.map((v) => ({ slug: v.slug, nome: v.curto }));

  if (!catalogo) {
    const cartoes = VITRINE_INICIAL.map((v, i) => cartaoAvulso({ slug: v.slug, titulo: v.nome, resumo: v.descricao }, [], null, agentes, i === 0));
    cartoes.push(cartaoCompleto(VITRINE_INICIAL.map((v) => v.curto), null, "/loja/", agentes));
    return { estado: "erro", cartoes, agentes, filtros };
  }

  const produtos = ordenar(catalogo.produtos);
  const avulso = catalogo.ofertas.find((o) => o.tipo === "escolha" && o.qtdEscolha === 1 && !o.exigeCliente);
  if (!produtos.length || !avulso) return { estado: "vazio", cartoes: [], agentes, filtros };

  const cartoes = produtos.map((p, i) =>
    cartaoAvulso(
      p,
      numerosDoCartao(p),
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
