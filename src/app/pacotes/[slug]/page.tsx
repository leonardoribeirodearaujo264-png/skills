import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { apresentacao, capaDoPacote, type Capa } from "@/lib/loja/apresentacao";
import { ehAvulsoPorProduto, formatarReais, precoNaOferta, type Catalogo, type Produto } from "@/lib/loja/dominio";
import { carregarCatalogo } from "@/lib/loja/repositorio";
import { urlComprar } from "@/lib/loja/vitrine";
import { env } from "@/lib/env";
import { clientePublico } from "@/lib/supabase/clientes";
import { BarraCompra } from "./BarraCompra";
import "../../../../public/assets/catalogo.css";

// Página pública do pacote, aberta sem login. Título, resumo, números e preço vêm do banco;
// textos extras e capa, de src/lib/loja/apresentacao.ts. O botão leva direto ao checkout.

// O cabeçalho lê a sessão (cookies): a página é montada a cada visita, com o preço atual do banco
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

type Dados = {
  produto: Produto;
  destaque: boolean;
  capa: Capa | null;
  precoTexto: string;
  comprarUrl: string;
  combo: { precoTexto: string; qtd: number } | null;
};

// Metadados e página usam a mesma leitura do banco na mesma visita
const dadosDoPacote = cache(async (slug: string): Promise<Dados | null> => {
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  const cat: Catalogo = await carregarCatalogo(clientePublico());
  const produto = cat.produtos.find((p) => p.slug === slug);
  const avulso = cat.ofertas.find(ehAvulsoPorProduto);
  if (!produto || !avulso) return null;
  const todos = cat.ofertas.find((o) => o.tipo === "todos");
  return {
    produto,
    destaque: cat.produtos[0]?.slug === slug,
    capa: capaDoPacote(produto.slug, produto.titulo),
    precoTexto: formatarReais(precoNaOferta(cat, avulso, produto)),
    comprarUrl: urlComprar(avulso.codigo, produto.slug),
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

export default async function PaginaPacote({ params }: Params) {
  const d = await dadosDoPacote((await params).slug);
  if (!d) notFound();
  const { produto: p } = d;
  const a = apresentacao(p.slug);

  const inclui = [
    { n: p.qtdAgentes, rotulo: plural(p.qtdAgentes, "agente", "agentes"), texto: a?.inclui?.agentes },
    ...(a?.numerosExtras ?? []),
    { n: p.qtdSkills, rotulo: plural(p.qtdSkills, "skill", "skills"), texto: a?.inclui?.skills },
    { n: p.qtdPrompts, rotulo: plural(p.qtdPrompts, "prompt pronto", "prompts prontos"), texto: a?.inclui?.prompts },
  ].filter((x) => x.n > 0);

  const comprar = (texto: string, observar: boolean) => (
    <a className="btn" href={d.comprarUrl} aria-label={`${texto}: ${p.titulo}`} data-observa-compra={observar || undefined}>
      {texto}
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
            <Link href="/#oferta">Pacotes</Link>
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
              {d.capa ? (
                <picture className="capa-img">
                  <source srcSet={d.capa.webp} type="image/webp" />
                  <img src={d.capa.png} width={1200} height={800} alt={d.capa.alt} fetchPriority="high" decoding="async" />
                </picture>
              ) : null}
              <div className="pp-painel-linha">
                <div className="pp-painel-preco">
                  <div>
                    <span className="cat-preco-rotulo">Pacote avulso</span>
                    <span className="cat-preco grande">{d.precoTexto}</span>
                  </div>
                  {comprar("Comprar", true)}
                </div>
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
            <section className="pp-secao" aria-labelledby="h-vem">
              <h2 id="h-vem">O que vem no pacote</h2>
              <p className="sub">Guia, instaladores e prompts em português, nos formatos do Claude Code e do Codex.</p>
              <ul className="inclui-grade">
                {inclui.map((x) => (
                  <li className="inclui-item" key={x.rotulo}>
                    <span className="n num">{x.n}</span>
                    <span className="r">{x.rotulo}</span>
                    {x.texto ? <p>{x.texto}</p> : null}
                  </li>
                ))}
              </ul>
              {!a?.inclui && p.destaques.length ? (
                <ul className="pp-destaques">
                  {p.destaques.map((t) => (
                    <li key={t}>
                      <Icone nome="check" tamanho={16} />
                      {t}
                    </li>
                  ))}
                </ul>
              ) : null}
              <ul className="extras">
                {p.aulaDuracaoS ? (
                  <li>
                    <span className="ic" aria-hidden="true">
                      <Icone nome="play" tamanho={20} />
                    </span>
                    <span>
                      <strong>Aula de {p.aulaDuracaoS} s</strong>Da instalação ao primeiro uso.
                    </span>
                  </li>
                ) : null}
                <li>
                  <span className="ic" aria-hidden="true">
                    <Icone nome="terminal" tamanho={20} />
                  </span>
                  <span>
                    <strong>Instaladores</strong>Para Claude Code e Codex, no Windows, Mac e Linux.
                  </span>
                </li>
                <li>
                  <span className="ic" aria-hidden="true">
                    <Icone nome="pacote" tamanho={20} />
                  </span>
                  <span>
                    <strong>Guia em português</strong>Instalação e uso, passo a passo.
                  </span>
                </li>
              </ul>
            </section>

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
                <p>Para Claude Code e Codex{p.aulaDuracaoS ? `, com aula de ${p.aulaDuracaoS} s` : ""} e guia em português.</p>
              </div>
              <div className="acao">
                <span className="cat-preco">{d.precoTexto}</span>
                {comprar("Comprar agora", true)}
              </div>
            </section>

            {d.combo ? (
              <p className="cat-nota">
                Quer os {d.combo.qtd} pacotes? <Link href="/#oferta">O pacote completo sai por {d.combo.precoTexto}</Link>.
              </p>
            ) : null}
          </div>
        </div>
      </main>
      <BarraCompra titulo={p.titulo} precoTexto={d.precoTexto} comprarUrl={d.comprarUrl} />
      <Rodape />
    </>
  );
}
