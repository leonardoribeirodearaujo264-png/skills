import type { Metadata } from "next";
import { Alerta } from "@/components/Alerta";
import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { usuarioAtual } from "@/lib/auth/sessao";
import { capaDoPacote } from "@/lib/loja/apresentacao";
import { MENSAGEM_FALHA_CHECKOUT } from "@/lib/loja/checkout";
import {
  ehAvulsoPorProduto,
  formatarReais,
  MENSAGEM_RECUSA,
  precoNaOferta,
  somaAvulsos,
  type Catalogo,
  type MotivoRecusa,
} from "@/lib/loja/dominio";
import { meusProdutos } from "@/lib/loja/membros";
import { carregarCatalogo } from "@/lib/loja/repositorio";
import { clientePublico } from "@/lib/supabase/clientes";
import { SeletorLoja, type OfertaVista, type ProdutoVista } from "./SeletorLoja";

export const metadata: Metadata = {
  title: "Loja",
  description: "Pacotes de skills e times de agentes para Claude Code e Codex, com aula curta, prompts e instalador.",
};
export const dynamic = "force-dynamic";

// Oferta de cliente só aparece para quem já comprou; o servidor confere de novo ao comprar
function ofertasVista(cat: Catalogo, ehCliente: boolean): OfertaVista[] {
  const avulso = cat.ofertas.find(ehAvulsoPorProduto);
  const ativos = cat.produtos.map((p) => p.slug);
  const comPrecoProprio = avulso ? cat.produtos.filter((p) => precoNaOferta(cat, avulso, p) !== avulso.precoCentavos) : [];
  return cat.ofertas.filter((o) => ehCliente || !o.exigeCliente).map((o) => {
    const incluidos = o.tipo === "todos" ? ativos : o.tipo === "fixa" ? o.itens.filter((s) => ativos.includes(s)) : null;
    const qtd = incluidos?.length ?? o.qtdEscolha ?? 1;
    // Referência só para exibir a economia: os itens fixos somados, ou o avulso padrão vezes a quantidade
    const referencia = !avulso || (qtd <= 1 && !o.exigeCliente) ? null : incluidos ? somaAvulsos(cat, incluidos) : avulso.precoCentavos * qtd;
    const nota = ehAvulsoPorProduto(o) && comPrecoProprio.length
      ? comPrecoProprio.map((p) => `${p.titulo}: ${formatarReais(precoNaOferta(cat, o, p))}`).join(". ")
      : o.descontoPercentual !== null
        ? `${o.descontoPercentual}% de desconto sobre o avulso de cada pacote`
        : null;
    const porProduto = ehAvulsoPorProduto(o) || o.descontoPercentual !== null;
    const precos = porProduto ? Object.fromEntries(cat.produtos.map((p) => [p.slug, precoNaOferta(cat, o, p)])) : null;
    // Por produto, o cartão mostra o menor preço; o total certo aparece ao escolher
    const exibido = precos ? Math.min(...Object.values(precos)) : o.precoCentavos;
    return {
      codigo: o.codigo,
      titulo: o.titulo,
      descricao: o.descricao,
      tipo: o.tipo,
      qtdEscolha: o.qtdEscolha,
      precoTexto: formatarReais(exibido),
      precoReais: (exibido / 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 }),
      precoCentavos: exibido,
      referenciaTexto: referencia && referencia > o.precoCentavos ? formatarReais(referencia) : null,
      nota,
      porProduto,
      precos,
      incluidos,
      destaque: o.tipo === "escolha" && (o.qtdEscolha ?? 0) > 1,
    };
  });
}

function produtosVista(cat: Catalogo): ProdutoVista[] {
  const avulso = cat.ofertas.find(ehAvulsoPorProduto);
  return cat.produtos.map((p) => ({
    precoAvulsoCentavos: avulso ? precoNaOferta(cat, avulso, p) : null,
    slug: p.slug,
    capa: capaDoPacote(p.slug, p.titulo),
    titulo: p.titulo,
    resumo: p.resumo,
    destaques: p.destaques,
    chips: [
      p.qtdSkills > 0 ? `${p.qtdSkills} skills` : null,
      p.qtdAgentes > 0 ? `${p.qtdAgentes} agentes` : null,
      p.qtdPrompts > 0 ? `${p.qtdPrompts} prompts` : null,
      p.aulaDuracaoS ? `aula de ${p.aulaDuracaoS} s` : null,
    ].filter((c): c is string => c !== null),
  }));
}

type Busca = Promise<{ oferta?: string; produtos?: string; produto?: string; erro?: string }>;

// Motivo vindo da compra direta (/loja/comprar/); valor desconhecido não aparece
function mensagemErro(codigo: string | undefined): string | null {
  if (!codigo) return null;
  if (codigo === "falha") return MENSAGEM_FALHA_CHECKOUT;
  return codigo in MENSAGEM_RECUSA ? MENSAGEM_RECUSA[codigo as MotivoRecusa] : null;
}

export default async function Loja({ searchParams }: { searchParams: Busca }) {
  const busca = await searchParams;
  const [catalogo, usuario] = await Promise.all([carregarCatalogo(clientePublico()), usuarioAtual()]);
  const possui = usuario ? (await meusProdutos(usuario)).map((p) => p.slug) : [];
  const iniciais = (busca.produtos ?? busca.produto ?? "").split(",").filter(Boolean);

  return (
    <>
      <Cabecalho ativa="loja" />
      <main className="wrap" id="conteudo">
        <section className="hero" aria-labelledby="titulo">
          <span className="eyebrow">
            <Icone nome="pacote" tamanho={14} />
            Loja
          </span>
          <h1 id="titulo">Skills e agentes prontos para o seu Claude Code</h1>
          <p className="lead">
            Cinco produtos com aula curta, prompts em português e instalador para Claude Code e Codex. Escolha a oferta e
            monte o seu pedido.
          </p>
          <ul className="trust">
            <li>
              <Icone nome="escudo" tamanho={16} />
              Pagamento por Pix ou cartão
            </li>
            <li>
              <Icone nome="raio" tamanho={16} />
              Acesso liberado assim que o pagamento é aprovado
            </li>
            <li>
              <Icone nome="terminal" tamanho={16} />
              Funciona no Claude Code e no Codex
            </li>
          </ul>
        </section>

        {mensagemErro(busca.erro) && (
          <div className="section">
            <Alerta tipo="danger" titulo="Não deu para abrir o pagamento">
              {mensagemErro(busca.erro)}
            </Alerta>
          </div>
        )}

        <SeletorLoja
          ofertas={ofertasVista(catalogo, possui.length > 0)}
          produtos={produtosVista(catalogo)}
          possui={possui}
          ofertaInicial={busca.oferta ?? (busca.produto ? "avulso" : null)}
          produtosIniciais={iniciais}
        />

        <section className="section" aria-labelledby="faq-titulo">
          <h2 id="faq-titulo" style={{ marginBottom: 16 }}>
            Perguntas frequentes
          </h2>
          <div className="faq">
            <details>
              <summary>Como recebo o acesso?</summary>
              <p>
                Assim que o pagamento é aprovado, os produtos aparecem na sua área de membros. Você entra com o
                código enviado ao seu e-mail, sem senha.
              </p>
            </details>
            <details>
              <summary>Posso pagar com Pix?</summary>
              <p>Sim. O acesso é liberado assim que o pagamento é confirmado.</p>
            </details>
            <details>
              <summary>Funciona no Codex também?</summary>
              <p>Sim. Cada produto traz o instalador para Claude Code e para Codex, no Windows, no macOS e no Linux.</p>
            </details>
            <details>
              <summary>E se eu já tiver um dos produtos?</summary>
              <p>Entre na sua conta antes de escolher. Os produtos que você já tem aparecem marcados e não entram de novo na escolha.</p>
            </details>
            <details>
              <summary>As skills de outros autores vêm no pacote?</summary>
              <p>
                Não copiamos arquivos de terceiros. O instalador baixa essas skills direto do repositório original, com a
                licença de cada autor. Elas são gratuitas e de código aberto; o pacote é a curadoria, o guia, o instalador e
                o time de agentes autoral.
              </p>
            </details>
          </div>
        </section>
      </main>
      <Rodape />
    </>
  );
}
