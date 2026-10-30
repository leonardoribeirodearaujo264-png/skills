import { ehAvulsoPorProduto, formatarReais, precoNaOferta, somaAvulsos, type Catalogo, type Produto } from "./dominio";
import { apresentacao, CAPA_COMBO, capaDoPacote, urlDoPacote, type Capa } from "./apresentacao";
import { OFERTA_DOS_VIDEOS } from "./paginas-videos";

// Dados do bloco de oferta no fim das páginas dos vídeos. Tudo calculado aqui, a partir do banco;
// o pagina.js só desenha. Os links levam ao checkout, que não exige login.

export type VitrinePacote = {
  slug: string;
  capa: Capa | null;
  titulo: string;
  gancho: string;
  descricao: string;
  precoTexto: string;
  comprarUrl: string;
};

export type VitrineCombo = {
  titulo: string;
  capa: Capa;
  descricao: string;
  itens: { titulo: string; conteudo: string; mini: string | null }[];
  somaTexto: string | null;
  precoTexto: string;
  economiaTexto: string | null;
  comprarUrl: string;
};

// Catálogo completo da página inicial: todos os pacotes à venda, com capa, resumo e preço
export type CartaoCatalogo = {
  slug: string;
  titulo: string;
  resumo: string;
  capa: Capa | null;
  precoTexto: string;
  comprarUrl: string;
  paginaUrl: string;
  numeros: { n: number; rotulo: string }[];
};

export type CatalogoVitrine = {
  // O primeiro pela ordem do banco é o pacote principal
  destaque: CartaoCatalogo | null;
  pacotes: CartaoCatalogo[];
  combo: { titulo: string; resumo: string; itens: string[]; capa: Capa; precoTexto: string; comprarUrl: string } | null;
};

// "Pague 2, leve 3": leva à loja com o pacote do vídeo já marcado, para escolher os outros dois
export type VitrineLeve = {
  titulo: string;
  descricao: string;
  qtd: number;
  precoTexto: string;
  referenciaTexto: string | null;
  // diferença entre 3 avulsos pelo preço padrão do avulso (do banco) e o preço da oferta; com um pacote
  // de preço próprio maior (edição de vídeo) a economia real é maior, nunca menor
  economiaTexto: string | null;
  escolherUrl: string;
  // a loja abre com o pacote do vídeo já marcado
  comPacote: boolean;
};

export type Vitrine = {
  pacote: VitrinePacote | null;
  leve: VitrineLeve | null;
  combo: VitrineCombo | null;
  catalogo: CatalogoVitrine | null;
};

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

export function urlComprar(oferta: string, produto?: string): string {
  const q = new URLSearchParams({ oferta });
  if (produto) q.set("produtos", produto);
  return `/loja/checkout/?${q}`;
}

// Números do pacote para a vitrine: os do banco e os extras conferidos em apresentacao.ts
export function numerosDoPacote(p: Produto): { n: number; rotulo: string }[] {
  const doBanco = [
    { n: p.qtdAgentes, rotulo: p.qtdAgentes === 1 ? "agente" : "agentes" },
    ...(apresentacao(p.slug)?.numerosExtras ?? []).map((x) => ({ n: x.n, rotulo: x.rotulo })),
    { n: p.qtdSkills, rotulo: p.qtdSkills === 1 ? "skill" : "skills" },
    { n: p.qtdPrompts, rotulo: p.qtdPrompts === 1 ? "prompt" : "prompts" },
  ];
  return doBanco.filter((x) => x.n > 0);
}

export function montarCatalogo(catalogo: Catalogo): CatalogoVitrine {
  const avulso = catalogo.ofertas.find(ehAvulsoPorProduto);
  const cartoes: CartaoCatalogo[] = avulso
    ? catalogo.produtos.map((p) => ({
        slug: p.slug,
        titulo: p.titulo,
        resumo: p.resumo,
        capa: capaDoPacote(p.slug, p.titulo),
        precoTexto: formatarReais(precoNaOferta(catalogo, avulso, p)),
        comprarUrl: urlComprar(avulso.codigo, p.slug),
        paginaUrl: urlDoPacote(p.slug),
        numeros: numerosDoPacote(p),
      }))
    : [];
  const todos = catalogo.ofertas.find((o) => o.tipo === "todos");
  return {
    destaque: cartoes[0] ?? null,
    pacotes: cartoes.slice(1),
    combo: todos
      ? {
          titulo: todos.titulo,
          resumo: `Os ${catalogo.produtos.length} pacotes juntos, numa compra só.`,
          itens: catalogo.produtos.map((p) => p.titulo),
          capa: CAPA_COMBO,
          precoTexto: formatarReais(todos.precoCentavos),
          comprarUrl: urlComprar(todos.codigo),
        }
      : null,
  };
}

export function montarVitrine(catalogo: Catalogo, pagina: string): Vitrine {
  const avulso = catalogo.ofertas.find(ehAvulsoPorProduto);
  const config = OFERTA_DOS_VIDEOS[pagina];
  const produto = config ? catalogo.produtos.find((p) => p.slug === config.pacote) : undefined;

  const pacote: VitrinePacote | null =
    config && produto && avulso
      ? {
          slug: produto.slug,
          capa: capaDoPacote(produto.slug, produto.titulo),
          titulo: produto.titulo,
          gancho: config.gancho.replace("{preco}", formatarReais(precoNaOferta(catalogo, avulso, produto))),
          descricao: config.descricao ?? produto.resumo,
          precoTexto: formatarReais(precoNaOferta(catalogo, avulso, produto)),
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
      capa: CAPA_COMBO,
      // Deixa claro que a contagem inclui skills de outros autores, instaladas pelo instalador a partir do repositório original
      descricao: `Os ${catalogo.produtos.length} pacotes de uma vez, com aula, prompts e instalador. As contagens somam as skills autorais e as de outros autores que o instalador seleciona e instala.`,
      itens: catalogo.produtos.map((p) => ({ titulo: p.titulo, conteudo: contagem(p), mini: capaDoPacote(p.slug, p.titulo)?.mini ?? null })),
      somaTexto: economia !== null && soma !== null ? formatarReais(soma) : null,
      precoTexto: formatarReais(todos.precoCentavos),
      economiaTexto: economia !== null ? formatarReais(economia) : null,
      comprarUrl: urlComprar(todos.codigo),
    };
  }
  // A página inicial mostra o catálogo inteiro no lugar do combo sozinho
  const multi = catalogo.ofertas.find((o) => o.tipo === "escolha" && (o.qtdEscolha ?? 0) > 1 && !o.exigeCliente);
  let leve: VitrineLeve | null = null;
  if (multi && avulso && multi.qtdEscolha) {
    const q = new URLSearchParams({ oferta: multi.codigo });
    if (pacote) q.set("produtos", pacote.slug);
    const referencia = avulso.precoCentavos * multi.qtdEscolha;
    leve = {
      titulo: multi.titulo,
      descricao: multi.descricao,
      qtd: multi.qtdEscolha,
      precoTexto: formatarReais(multi.precoCentavos),
      referenciaTexto: referencia > multi.precoCentavos ? formatarReais(referencia) : null,
      economiaTexto: referencia > multi.precoCentavos ? formatarReais(referencia - multi.precoCentavos) : null,
      escolherUrl: `/loja/?${q}#passo-produtos`,
      comPacote: pacote !== null,
    };
  }

  if (pagina === "") return { pacote, leve: null, combo: null, catalogo: montarCatalogo(catalogo) };
  return { pacote, leve, combo, catalogo: null };
}
