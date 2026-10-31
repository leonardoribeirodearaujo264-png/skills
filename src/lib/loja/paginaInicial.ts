import { CAPA_COMBO, capaDoPacote, urlDoPacote, VITRINE_INICIAL, vitrineInicial, type Capa } from "./apresentacao";
import { precoAvulso, precoNaOferta, somaAvulsos, type Catalogo, type Oferta, type Produto } from "./dominio";
import { PAGINAS_VIDEOS, type TipoPagina } from "./paginas-videos";
import { numerosDoPacote, urlComprar } from "./vitrine";

// Dados da página inicial de vendas. Preço, contagens e ofertas vêm do banco (carregarCatalogo); nomes,
// frases e capas de apresentacao.ts; agentes grátis de paginas-videos.ts. Sem I/O, para testar sem rede.

export type AgenteGratis = { pasta: string; titulo: string; frase: string; tipo: TipoPagina; pacote: string; pacoteCurto: string };

// Riscado só onde há preço anterior real: pacote completo (soma dos avulsos) e combo (avulso contra cliente)
export type PrecoCartao = {
  centavos: number;
  anterior: number | null;
  rotulo: string;
  economia: number | null;
  // combo: os pacotes têm preços diferentes; o valor grande é o menor deles
  aPartirDe: boolean;
  // combo: todos os outros pacotes com desconto, somados
  soma: { qtd: number; de: number; por: number } | null;
};

export type LinhaDesconto = { nome: string; de: number; por: number };

export type CartaoVenda = {
  id: string;
  variante: "avulso" | "destaque" | "completo" | "combo";
  slug: string;
  capa: Capa | null;
  // combo: miniaturas dos outros pacotes em leque
  minis: string[];
  tag: { texto: string; suave: boolean } | null;
  meta: string[];
  titulo: string;
  descricao: string;
  inclui: string[];
  linhas: LinhaDesconto[];
  // null: preço não confirmado pelo servidor; a compra fica bloqueada
  preco: PrecoCartao | null;
  botao: string;
  href: string;
  // null: card sem o botão de agentes grátis (combo)
  agentes: AgenteGratis[] | null;
  agentesDe: string;
};

export type ComboCliente = { desconto: number; outros: number };

export type PaginaInicial = {
  estado: "ok" | "erro" | "vazio";
  cartoes: CartaoVenda[];
  combo: ComboCliente | null;
  agentes: AgenteGratis[];
  filtros: { slug: string; nome: string }[];
};

// Pacote base: o primeiro da vitrine, ao qual o combo de cliente se refere
const BASE = VITRINE_INICIAL[0]!.slug;

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
    minis: [],
    tag: destaque ? { texto: "Comece por aqui", suave: true } : v?.novo ? { texto: "Novo", suave: false } : null,
    meta,
    titulo: v?.nome ?? p.titulo,
    descricao: v?.descricao ?? p.resumo,
    inclui: [],
    linhas: [],
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
    minis: [],
    tag: null,
    meta: [`${slugs.length} pacotes`, "todos os agentes, skills e prompts"],
    titulo: "Pacote completo",
    descricao: "Todos os pacotes numa compra só, com um pagamento único.",
    inclui: nomes,
    linhas: [],
    preco,
    botao: "Quero o pacote completo",
    href,
    agentes,
    agentesDe: "todos os pacotes",
  };
}

function cartaoCombo(catalogo: Catalogo, cliente: Oferta, desconto: number): CartaoVenda | null {
  const outros = ordenar(catalogo.produtos).filter((p) => p.slug !== BASE);
  if (!outros.length) return null;
  const linhas = outros.flatMap((p) => {
    const de = precoAvulso(catalogo, p);
    return de === null ? [] : [{ nome: nomeCurto(p.slug, catalogo), de, por: precoNaOferta(catalogo, cliente, p) }];
  });
  if (!linhas.length) return null;
  const menor = linhas.reduce((m, l) => (l.por < m.por ? l : m));
  return {
    id: "combo",
    variante: "combo",
    slug: "combo",
    capa: null,
    minis: outros.map((p) => capaDoPacote(p.slug, p.titulo)?.mini).filter((m): m is string => Boolean(m)),
    tag: { texto: "Combo", suave: false },
    meta: [`${desconto}% em cada pacote`, "para quem já é cliente"],
    titulo: "Já tem o pacote base? Leve os outros por um preço menor",
    // O servidor libera o preço de cliente para quem tem qualquer compra, não só o pacote base
    descricao: `Quem já comprou um pacote ganha ${desconto}% de desconto em cada um dos outros. Entre com o e-mail da compra e o preço com desconto aparece na hora de pagar.`,
    inclui: [],
    linhas,
    preco: {
      centavos: menor.por,
      anterior: menor.de > menor.por ? menor.de : null,
      rotulo: "Por pacote · pagamento único",
      economia: null,
      aPartirDe: linhas.some((l) => l.por !== menor.por),
      soma: { qtd: linhas.length, de: linhas.reduce((t, l) => t + l.de, 0), por: linhas.reduce((t, l) => t + l.por, 0) },
    },
    botao: "Entrar com o e-mail da compra",
    href: `/entrar/?next=${encodeURIComponent(`/loja/?oferta=${cliente.codigo}`)}`,
    agentes: null,
    agentesDe: "",
  };
}

function ofertaCliente(catalogo: Catalogo): (Oferta & { descontoPercentual: number }) | null {
  const o = catalogo.ofertas.find((x) => x.exigeCliente && x.tipo === "escolha" && x.qtdEscolha === 1 && x.descontoPercentual !== null);
  return o && o.descontoPercentual !== null ? { ...o, descontoPercentual: o.descontoPercentual } : null;
}

// catalogo null: o banco não respondeu. Os cards saem com capa e texto, sem preço, e a compra fica bloqueada.
export function montarPaginaInicial(catalogo: Catalogo | null): PaginaInicial {
  const agentes = agentesGratis(catalogo);
  const filtros = VITRINE_INICIAL.map((v) => ({ slug: v.slug, nome: v.curto }));

  if (!catalogo) {
    const cartoes = VITRINE_INICIAL.map((v, i) => cartaoAvulso({ slug: v.slug, titulo: v.nome, resumo: v.descricao }, [], null, agentes, i === 0));
    cartoes.push(cartaoCompleto(VITRINE_INICIAL.map((v) => v.slug), VITRINE_INICIAL.map((v) => v.curto), null, "/loja/", agentes));
    return { estado: "erro", cartoes, combo: null, agentes, filtros };
  }

  const produtos = ordenar(catalogo.produtos);
  const avulso = catalogo.ofertas.find((o) => o.tipo === "escolha" && o.qtdEscolha === 1 && !o.exigeCliente);
  if (!produtos.length || !avulso) return { estado: "vazio", cartoes: [], combo: null, agentes, filtros };

  const cartoes = produtos.map((p, i) =>
    cartaoAvulso(
      p,
      numerosDoPacote(p).map((n) => `${n.n} ${n.rotulo}`),
      { centavos: precoNaOferta(catalogo, avulso, p), anterior: null, rotulo: "Pagamento único", economia: null, aPartirDe: false, soma: null },
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
        { centavos: todos.precoCentavos, anterior, rotulo: "Pagamento único", economia: anterior === null ? null : anterior - todos.precoCentavos, aPartirDe: false, soma: null },
        urlComprar(todos.codigo),
        agentes,
      ),
    );
  }

  const cliente = ofertaCliente(catalogo);
  const combo = cliente ? cartaoCombo(catalogo, cliente, cliente.descontoPercentual) : null;
  if (combo) cartoes.push(combo);

  return {
    estado: "ok",
    cartoes,
    combo: combo && cliente ? { desconto: cliente.descontoPercentual, outros: combo.linhas.length } : null,
    agentes,
    filtros: filtros.filter((f) => produtos.some((p) => p.slug === f.slug)),
  };
}
