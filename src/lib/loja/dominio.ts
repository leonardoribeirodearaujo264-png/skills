// Tipos do catálogo e regra das ofertas. Sem I/O: o preço e a composição vêm do banco.

export type TipoOferta = "escolha" | "fixa" | "todos";

export type Produto = {
  slug: string;
  titulo: string;
  resumo: string;
  ordem: number;
  githubUrl: string | null;
  // preço próprio na oferta avulsa (null usa o preço da oferta)
  precoAvulsoCentavos: number | null;
  destaques: string[];
  qtdSkills: number;
  qtdAgentes: number;
  qtdPrompts: number;
  aulaDuracaoS: number | null;
};

export type Oferta = {
  codigo: string;
  titulo: string;
  descricao: string;
  tipo: TipoOferta;
  qtdEscolha: number | null;
  precoCentavos: number;
  // só para quem já tem pelo menos um produto
  exigeCliente: boolean;
  ordem: number;
  // itens fixos (tipo "fixa"); vazio nos demais
  itens: string[];
};

export type Catalogo = { produtos: Produto[]; ofertas: Oferta[] };

export type ItensDoPedido = { itens: string[]; valorCentavos: number; chaveItens: string };

export type MotivoRecusa =
  | "oferta_inexistente"
  | "quantidade_errada"
  | "produto_inexistente"
  | "produto_repetido"
  | "ja_possui"
  | "oferta_sem_itens"
  | "so_clientes";

export class PedidoInvalido extends Error {
  constructor(readonly motivo: MotivoRecusa) {
    super(motivo);
    this.name = "PedidoInvalido";
  }
}

export const MENSAGEM_RECUSA: Record<MotivoRecusa, string> = {
  oferta_inexistente: "Essa oferta não está mais disponível.",
  quantidade_errada: "Escolha a quantidade de pacotes indicada na oferta.",
  produto_inexistente: "Um dos pacotes escolhidos não está disponível.",
  produto_repetido: "Escolha pacotes diferentes.",
  ja_possui: "Você já tem acesso a esses pacotes.",
  oferta_sem_itens: "Essa oferta está sem pacotes configurados.",
  so_clientes: "Essa oferta é só para quem já comprou um pacote.",
};

// Calcula os itens e o valor de um pedido. O cliente só informa a oferta e, se for de escolha, os slugs.
// possui: produtos que o usuário já tem com acesso ativo.
export function montarPedido(
  catalogo: Catalogo,
  codigoOferta: string,
  escolhidos: readonly string[],
  possui: ReadonlySet<string>,
): ItensDoPedido {
  const oferta = catalogo.ofertas.find((o) => o.codigo === codigoOferta);
  if (!oferta) throw new PedidoInvalido("oferta_inexistente");
  if (oferta.exigeCliente && possui.size === 0) throw new PedidoInvalido("so_clientes");
  const ativos = new Set(catalogo.produtos.map((p) => p.slug));

  let itens: string[];
  if (oferta.tipo === "escolha") {
    if (new Set(escolhidos).size !== escolhidos.length) throw new PedidoInvalido("produto_repetido");
    if (escolhidos.length !== oferta.qtdEscolha) throw new PedidoInvalido("quantidade_errada");
    if (escolhidos.some((s) => !ativos.has(s))) throw new PedidoInvalido("produto_inexistente");
    // Na escolha livre não faz sentido pagar de novo por algo que já tem
    if (escolhidos.some((s) => possui.has(s))) throw new PedidoInvalido("ja_possui");
    itens = [...escolhidos];
  } else {
    itens = oferta.tipo === "todos" ? [...ativos] : oferta.itens.filter((s) => ativos.has(s));
    if (itens.length === 0) throw new PedidoInvalido("oferta_sem_itens");
    if (itens.every((s) => possui.has(s))) throw new PedidoInvalido("ja_possui");
  }

  itens.sort();
  const unico = itens.length === 1 ? catalogo.produtos.find((p) => p.slug === itens[0]) : undefined;
  const valorCentavos = unico ? precoNaOferta(oferta, unico) : oferta.precoCentavos;
  return { itens, valorCentavos, chaveItens: `${oferta.codigo}:${itens.join(",")}` };
}

// Avulso comum é por produto: cada produto pode ter preço próprio no banco (ex.: edição de vídeo).
// Nas demais ofertas, inclusive a de cliente, vale o preço da oferta.
export function ehAvulsoPorProduto(oferta: Oferta): boolean {
  return oferta.tipo === "escolha" && oferta.qtdEscolha === 1 && !oferta.exigeCliente;
}

export function precoNaOferta(oferta: Oferta, produto: Produto): number {
  return ehAvulsoPorProduto(oferta) ? (produto.precoAvulsoCentavos ?? oferta.precoCentavos) : oferta.precoCentavos;
}

// Quanto os itens custariam comprados um a um, para mostrar a economia (só exibição)
export function somaAvulsos(catalogo: Catalogo, itens: readonly string[]): number | null {
  const avulso = catalogo.ofertas.find(ehAvulsoPorProduto);
  if (!avulso) return null;
  return itens.reduce((t, s) => {
    const p = catalogo.produtos.find((x) => x.slug === s);
    return t + (p ? precoNaOferta(avulso, p) : avulso.precoCentavos);
  }, 0);
}

// Oferta de um pacote avulso para a vitrine da área de membros: a de cliente, se ativa e se a pessoa
// já comprou algo; senão o avulso comum. referenciaCentavos é o avulso, para mostrar o desconto.
export function ofertaParaMaisUm(
  catalogo: Catalogo,
  ehCliente: boolean,
): { oferta: Oferta; referenciaCentavos: number | null } | null {
  const umProduto = (o: Oferta) => o.tipo === "escolha" && o.qtdEscolha === 1;
  const avulso = catalogo.ofertas.find(ehAvulsoPorProduto) ?? null;
  const cliente = ehCliente ? catalogo.ofertas.find((o) => umProduto(o) && o.exigeCliente) : undefined;
  if (cliente) {
    const ref = avulso && avulso.precoCentavos > cliente.precoCentavos ? avulso.precoCentavos : null;
    return { oferta: cliente, referenciaCentavos: ref };
  }
  return avulso ? { oferta: avulso, referenciaCentavos: null } : null;
}

export function formatarReais(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(centavos / 100);
}
