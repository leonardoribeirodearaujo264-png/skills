import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { CapaPacote } from "@/components/CapaPacote";
import { Icone } from "@/components/Icone";
import { apresentacao, capaDoPacote, type Capa } from "@/lib/loja/apresentacao";
import { conteudoDoPacote } from "@/lib/loja/conteudo";
import { ehAvulsoPorProduto, formatarDuracao, formatarReais, precoNaOferta, type Catalogo, type Produto } from "@/lib/loja/dominio";
import { carregarCatalogo } from "@/lib/loja/repositorio";
import { urlComprar } from "@/lib/loja/vitrine";
import { env } from "@/lib/env";
import { clientePublico } from "@/lib/supabase/clientes";
import { BarraCompra } from "./BarraCompra";
import { SecaoCatalogoVenda, SecaoDemonstracoes, SecaoLevaGanha, type ItemLeva } from "./Secoes";

// Página pública do pacote, aberta sem login. Título, resumo, números e preço vêm do banco; capa e textos
// extras, de src/lib/loja/apresentacao.ts; prompts de demonstração e lista de venda, dos arquivos do pacote
// (src/lib/loja/conteudo.ts). O botão leva direto ao checkout. Pacote vendido só como complemento (bump)
// mostra o preço de bump e manda escolher um pacote principal.

// O cabeçalho lê a sessão (cookies): a página é montada a cada visita, com o preço atual do banco
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

type Dados = {
  produto: Produto;
  destaque: boolean;
  capa: Capa | null;
  precoTexto: string;
  // null: só como complemento no checkout
  comprarUrl: string | null;
  combo: { precoTexto: string; qtd: number } | null;
};

// Metadados e página usam a mesma leitura do banco na mesma visita
const dadosDoPacote = cache(async (slug: string): Promise<Dados | null> => {
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  const cat: Catalogo = await carregarCatalogo(clientePublico());
  const avulso = cat.ofertas.find(ehAvulsoPorProduto);
  const produto = cat.produtos.find((p) => p.slug === slug) ?? cat.bumps.find((p) => p.slug === slug && p.soBump);
  if (!produto || !avulso) return null;
  const todos = cat.ofertas.find((o) => o.tipo === "todos");
  const soBump = produto.soBump && produto.precoBumpCentavos !== null;
  return {
    produto,
    destaque: cat.produtos[0]?.slug === slug,
    capa: capaDoPacote(produto.slug, produto.titulo),
    precoTexto: formatarReais(soBump ? (produto.precoBumpCentavos ?? 0) : precoNaOferta(cat, avulso, produto)),
    comprarUrl: soBump ? null : urlComprar(avulso.codigo, produto.slug),
    combo: todos ? { precoTexto: formatarReais(todos.precoCentavos), qtd: cat.produtos.length } : null,
  };
});

// Endereço absoluto da capa para a prévia do link (Instagram, WhatsApp)
function urlAbsoluta(caminho: string): string {
  try {
    return new URL(caminho, env().SITE_URL).toString();
  } catch {
    return caminho;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const d = await dadosDoPacote((await params).slug).catch(() => null);
  if (!d) return { title: "Pacote" };
  return {
    title: d.produto.titulo,
    description: d.produto.resumo,
    openGraph: { title: d.produto.titulo, description: d.produto.resumo, images: d.capa ? [{ url: urlAbsoluta(d.capa.png), width: 1200, height: 800, alt: d.capa.alt }] : [] },
  };
}

function plural(n: number, um: string, varios: string): string {
  return n === 1 ? um : varios;
}

// O que você leva e o que ganha: números do banco; textos do pacote (apresentacao.ts) ou o resultado
// genérico, que vale para todo pacote do site (guia, instaladores e prompts existem em todos)
function itensLeva(p: Produto): ItemLeva[] {
  const a = apresentacao(p.slug);
  const itens: (ItemLeva | null)[] = [
    p.qtdAgentes > 0
      ? {
          icone: "raio",
          titulo: `${p.qtdAgentes} ${plural(p.qtdAgentes, "agente", "agentes")}`,
          leva: a?.inclui?.agentes ?? "Nos formatos do Claude Code e do Codex, cada um com papel, entradas e formato de entrega definidos.",
          ganha: a?.ganhos?.agentes ?? "Cada parte do trabalho tem um responsável que devolve a entrega no formato combinado.",
        }
      : null,
    ...(a?.numerosExtras ?? []).map((x) => ({
      icone: "check" as const,
      titulo: `${x.n} ${x.rotulo}`,
      leva: x.texto,
      ganha: "Cada área tem o seu time, com líder e revisor.",
    })),
    p.qtdSkills > 0
      ? {
          icone: "pacote",
          titulo: `${p.qtdSkills} ${plural(p.qtdSkills, "skill", "skills")}`,
          leva: a?.inclui?.skills ?? "Cada skill com um passo a passo que o Claude Code segue.",
          ganha: a?.ganhos?.skills ?? "O Claude Code segue um roteiro pronto para cada tarefa em vez de improvisar.",
        }
      : null,
    p.qtdPrompts > 0
      ? {
          icone: "terminal",
          titulo: `${p.qtdPrompts} ${plural(p.qtdPrompts, "prompt pronto", "prompts prontos")}`,
          leva: a?.inclui?.prompts ?? "Pedidos prontos para copiar, com o que trocar marcado entre colchetes.",
          ganha: a?.ganhos?.prompts ?? "Você começa a usar sem escrever o pedido do zero.",
        }
      : null,
    p.aulaDuracaoS
      ? { icone: "play", titulo: `Aula de ${formatarDuracao(p.aulaDuracaoS)}`, leva: "Da instalação ao primeiro uso.", ganha: "Você vê o caminho inteiro antes de começar." }
      : null,
    {
      icone: "terminal",
      titulo: "Instaladores",
      leva: "Para Claude Code e Codex, no Windows, Mac e Linux.",
      ganha: "Tudo vai para as pastas certas com um comando.",
    },
    { icone: "baixar", titulo: "Guia em português", leva: "Instalação e uso, passo a passo.", ganha: "Você consulta como usar quando precisar." },
  ];
  return itens.filter((x): x is ItemLeva => x !== null);
}

export default async function PaginaPacote({ params }: Params) {
  const d = await dadosDoPacote((await params).slug);
  if (!d) notFound();
  const { produto: p } = d;
  const a = apresentacao(p.slug);
  const { demonstracoes, venda } = conteudoDoPacote(p.slug);
  const bump = d.comprarUrl === null;

  const comprar = (texto: string, observar: boolean) => (
    <a
      className="btn"
      href={d.comprarUrl ?? "/loja/"}
      aria-label={bump ? `Escolher um pacote para levar o ${p.titulo}` : `${texto}: ${p.titulo}`}
      data-observa-compra={observar || undefined}
    >
      {bump ? "Escolher um pacote" : texto}
      <span className="ico" aria-hidden="true">
        <Icone nome="seta" tamanho={16} />
      </span>
    </a>
  );

  return (
    <>
      <Cabecalho />
      <main className="pp" id="conteudo">
        <ol className="migalha" aria-label="Você está em">
          <li>
            <Link href="/">Início</Link>
          </li>
          <li>
            <Link href="/#pacotes">Pacotes</Link>
          </li>
          <li aria-current="page">{p.titulo}</li>
        </ol>

        <div className="pp-grid">
          <div className="pp-head">
            <span className="eyebrow">{d.destaque ? "Pacote principal · Claude Code e Codex" : "Claude Code e Codex"}</span>
            <h1>{p.titulo}</h1>
          </div>

          {/* Painel de compra: logo abaixo do título no celular, fixo à direita no desktop */}
          <aside className="pp-painel" aria-label="Comprar">
            <div className="pp-painel-card">
              <CapaPacote capa={d.capa} imediata />
              <div className="pp-painel-linha">
                <div className="pp-painel-preco">
                  <div>
                    <span className="cat-preco-rotulo">{bump ? "Complemento no checkout" : "Pacote avulso"}</span>
                    <span className="cat-preco grande">{d.precoTexto}</span>
                  </div>
                  {comprar("Comprar", true)}
                </div>
                {bump ? (
                  <p className="small muted">
                    O {p.titulo} aparece no checkout de qualquer pacote por {d.precoTexto}. Basta marcar a opção antes de pagar.
                  </p>
                ) : null}
                <ul className="pp-garantias">
                  <li>
                    <Icone nome="pix" tamanho={16} />
                    Pagamento por Pix ou cartão
                  </li>
                  <li>
                    <Icone nome="baixar" tamanho={16} />
                    Download na sua área de membros
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          <p className="lead pp-lead">
            {p.resumo}
            {a?.complemento ? ` ${a.complemento}` : null}
          </p>

          <div className="pp-corpo">
            {venda ? <p className="pp-promessa">{venda.promessa}</p> : null}
            <SecaoDemonstracoes demonstracoes={demonstracoes} />
            <SecaoLevaGanha itens={itensLeva(p)} />
            {venda ? <SecaoCatalogoVenda venda={venda} /> : null}

            {a?.times ? (
              <section className="pp-secao" aria-labelledby="h-times">
                <h2 id="h-times">{a.times.titulo}</h2>
                <p className="sub">{a.times.texto}</p>
                <ul className="times">
                  {a.times.nomes.map((nome) => (
                    <li key={nome}>
                      <span className="ic" aria-hidden="true">
                        <Icone nome="check" tamanho={16} />
                      </span>
                      {nome}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {a?.fluxo ? (
              <section className="pp-secao" aria-labelledby="h-fluxo">
                <h2 id="h-fluxo">{a.fluxo.titulo}</h2>
                <p className="sub">{a.fluxo.texto}</p>
                <ol className="fluxo">
                  {a.fluxo.passos.map((s) => (
                    <li key={s.titulo}>
                      <strong>{s.titulo}</strong>
                      <span>{s.texto}</span>
                    </li>
                  ))}
                </ol>
                <p className="fluxo-nota">
                  <Icone nome="escudo" tamanho={18} />
                  {a.fluxo.nota}
                </p>
              </section>
            ) : null}

            <section className="cta-final" aria-labelledby="h-cta">
              <div>
                <h2 id="h-cta">{p.titulo}</h2>
                <p>Para Claude Code e Codex{p.aulaDuracaoS ? `, com aula de ${formatarDuracao(p.aulaDuracaoS)}` : ""} e guia em português.</p>
              </div>
              <div className="acao">
                <span className="cat-preco">{d.precoTexto}</span>
                {comprar("Comprar agora", true)}
              </div>
            </section>

            {d.combo ? (
              <p className="cat-nota">
                Quer os {d.combo.qtd} pacotes? <Link href="/#pacotes">O pacote completo sai por {d.combo.precoTexto}</Link>.
              </p>
            ) : null}
          </div>
        </div>
      </main>
      {d.comprarUrl ? <BarraCompra titulo={p.titulo} precoTexto={d.precoTexto} comprarUrl={d.comprarUrl} /> : null}
      <Rodape />
    </>
  );
}
