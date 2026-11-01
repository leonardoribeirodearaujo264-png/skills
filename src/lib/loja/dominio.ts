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
  // preço como oferta complementar no checkout (order bump); null = não é oferecido assim
  precoBumpCentavos: number | null;
  // vendido só como complemento: fica fora da vitrine, da loja e do combo
  soBump: boolean;
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
  // desconto sobre o preço avulso de cada produto (oferta de cliente); null usa precoCentavos
  descontoPercentual: number | null;
  ordem: number;
  // itens fixos (tipo "fixa"); vazio nos demais
  itens: string[];
};

// produtos: os da vitrine. bumps: os oferecidos como complemento no checkout (podem não estar na vitrine)
export type Catalogo = { produtos: Produto[]; ofertas: Oferta[]; bumps: Produto[] };

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
  so_clientes: "O preço de cliente vale para quem já comprou. Entre na sua área com o e-mail da compra.",
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
  const valorCentavos = unico ? precoNaOferta(catalogo, oferta, unico) : oferta.precoCentavos;
  return { itens, valorCentavos, chaveItens: `${oferta.codigo}:${itens.join(",")}` };
}

// Ofertas complementares marcadas no checkout (quantas a pessoa quiser): cada uma entra como mais um item
// do pedido, pelo preço de bump do banco. Não aceita repetida, o que já está no pedido nem o que a pessoa tem.
export function adicionarBumps(
  catalogo: Catalogo,
  pedido: ItensDoPedido,
  slugs: readonly string[],
  possui: ReadonlySet<string>,
): ItensDoPedido {
  if (!slugs.length) return pedido;
  if (new Set(slugs).size !== slugs.length) throw new PedidoInvalido("produto_repetido");
  let valor = pedido.valorCentavos;
  for (const slug of slugs) {
    const bump = catalogo.bumps.find((p) => p.slug === slug);
    if (!bump || bump.precoBumpCentavos === null) throw new PedidoInvalido("produto_inexistente");
    if (pedido.itens.includes(slug) || possui.has(slug)) throw new PedidoInvalido("ja_possui");
    valor += bump.precoBumpCentavos;
  }
  const ordenados = [...slugs].sort();
  return {
    itens: [...pedido.itens, ...ordenados],
    valorCentavos: valor,
    chaveItens: `${pedido.chaveItens}+bump:${ordenados.join(",")}`,
  };
}

// Bumps que aparecem no checkout para estes itens: os que a pessoa ainda não tem e não estão no pedido.
// Os vendidos só como complemento vêm primeiro; depois, a ordem da vitrine.
export function bumpsParaPedido(catalogo: Catalogo, itens: readonly string[], possui: ReadonlySet<string>): Produto[] {
  return catalogo.bumps
    .filter((p) => p.precoBumpCentavos !== null && !itens.includes(p.slug) && !possui.has(p.slug))
    .sort((a, b) => Number(b.soBump) - Number(a.soBump) || a.ordem - b.ordem);
}

// Avulso comum é por produto: cada produto pode ter preço próprio no banco (ex.: edição de vídeo).
export function ehAvulsoPorProduto(oferta: Oferta): boolean {
  return oferta.tipo === "escolha" && oferta.qtdEscolha === 1 && !oferta.exigeCliente;
}

// Preço avulso de um produto: o próprio, se houver, senão o da oferta avulso
export function precoAvulso(catalogo: Catalogo, produto: Produto): number | null {
  const avulso = catalogo.ofertas.find(ehAvulsoPorProduto);
  return produto.precoAvulsoCentavos ?? avulso?.precoCentavos ?? null;
}

// Preço de um produto numa oferta de um item. Avulso: preço do produto. Desconto (cliente): o avulso
// menos o percentual, arredondado ao centavo. Demais: o preço da oferta. Sempre calculado no servidor.
export function precoNaOferta(catalogo: Catalogo, oferta: Oferta, produto: Produto): number {
  if (ehAvulsoPorProduto(oferta)) return produto.precoAvulsoCentavos ?? oferta.precoCentavos;
  if (oferta.descontoPercentual !== null) {
    const base = precoAvulso(catalogo, produto) ?? oferta.precoCentavos;
    return Math.round((base * (100 - oferta.descontoPercentual)) / 100);
  }
  return oferta.precoCentavos;
}

// Quanto os itens custariam comprados um a um, para mostrar a economia (só exibição)
export function somaAvulsos(catalogo: Catalogo, itens: readonly string[]): number | null {
  const avulso = catalogo.ofertas.find(ehAvulsoPorProduto);
  if (!avulso) return null;
  return itens.reduce((t, s) => {
    const p = catalogo.produtos.find((x) => x.slug === s);
    return t + (p ? precoNaOferta(catalogo, avulso, p) : avulso.precoCentavos);
  }, 0);
}

// Oferta para comprar mais um pacote na área de membros: a de cliente (com desconto), se ativa e se a
// pessoa já comprou algo; senão o avulso comum.
export function ofertaParaMaisUm(catalogo: Catalogo, ehCliente: boolean): Oferta | null {
  const cliente = ehCliente
    ? catalogo.ofertas.find((o) => o.exigeCliente && o.tipo === "escolha" && o.qtdEscolha === 1)
    : undefined;
  return cliente ?? catalogo.ofertas.find(ehAvulsoPorProduto) ?? null;
}

// Duração da aula para exibir: "74 s" até um minuto e meio, depois "2 min 31 s"
export function formatarDuracao(segundos: number): string {
  if (segundos < 90) return `${segundos} s`;
  const min = Math.floor(segundos / 60);
  const s = segundos % 60;
  return s ? `${min} min ${s} s` : `${min} min`;
}

export function formatarReais(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(centavos / 100);
}
