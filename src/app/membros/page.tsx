import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alerta } from "@/components/Alerta";
import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { CapaPacote } from "@/components/CapaPacote";
import { SENHA_MINIMA } from "@/lib/auth/senha";
import { Icone } from "@/components/Icone";
import { usuarioAtual } from "@/lib/auth/sessao";
import { capaDoPacote } from "@/lib/loja/apresentacao";
import { formatarReais, ofertaParaMaisUm, precoAvulso, precoNaOferta } from "@/lib/loja/dominio";
import { meusProdutos, pedidosRecentes } from "@/lib/loja/membros";
import { TrocarSenha } from "./TrocarSenha";
import { carregarCatalogo } from "@/lib/loja/repositorio";
import { clientePublico } from "@/lib/supabase/clientes";

export const metadata: Metadata = { title: "Minha área", robots: { index: false } };
export const dynamic = "force-dynamic";

const data = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" });

export default async function Membros() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/entrar/?next=%2Fmembros%2F");
  const [produtos, pedidos, catalogo] = await Promise.all([
    meusProdutos(usuario),
    pedidosRecentes(usuario),
    carregarCatalogo(clientePublico()),
  ]);
  const pendente = pedidos.some((p) => p.status === "pendente");
  const meus = new Set(produtos.map((p) => p.slug));
  const outros = catalogo.produtos.filter((p) => !meus.has(p.slug));
  // Preço e regra vêm do banco; o checkout confere de novo no servidor (sessão e compra aprovada)
  const oferta = ofertaParaMaisUm(catalogo, meus.size > 0);
  const precoDe = (p: (typeof outros)[number]) => {
    const preco = oferta ? precoNaOferta(catalogo, oferta, p) : null;
    const cheio = precoAvulso(catalogo, p);
    return { preco, cheio: preco !== null && cheio !== null && cheio > preco ? cheio : null };
  };

  return (
    <>
      <Cabecalho ativa="membros" />
      <main className="wrap" id="conteudo">
        <div className="section-head">
          <div>
            <span className="eyebrow">Minha área</span>
            <h1 style={{ marginTop: 12 }}>Seus produtos</h1>
            <p className="muted">Entrou como {usuario.email}.</p>
          </div>
          <Link className="btn secondary sm" href="/loja/">
            Ver a loja
          </Link>
        </div>

        {pendente && (
          <div style={{ marginBottom: 20 }}>
            <Alerta tipo="warn" titulo="Você tem um pagamento aguardando confirmação">
              Assim que o pagamento for confirmado, o produto aparece aqui. Pix costuma levar segundos.
            </Alerta>
          </div>
        )}

        {produtos.length === 0 ? (
          <div className="shell">
            <div className="core vazio-box">
              <span className="icone-grande" aria-hidden="true">
                <Icone nome="pacote" tamanho={26} />
              </span>
              <h2>Este e-mail ainda não tem compra aprovada</h2>
              <p>
                A área de membros mostra os pacotes comprados com {usuario.email}. Se você pagou com outro e-mail, saia e
                entre com ele. Se o pagamento foi agora, ele aparece aqui assim que for aprovado.
              </p>
              <Link className="btn" href="/loja/">
                Conhecer os pacotes
                <span className="ico">
                  <Icone nome="direita" tamanho={16} />
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="lista-membros">
            {produtos.map((p) => (
              <article key={p.slug} className="item-membro shell">
                <div className="core">
                  <CapaPacote capa={capaDoPacote(p.slug, p.titulo)} />
                  <h3>{p.titulo}</h3>
                  <p>{p.resumo}</p>
                  <div className="rodape">
                    <span className="chip ok">Seu desde {data.format(new Date(p.desde))}</span>
                    <Link className="btn sm" href={`/membros/${p.slug}/`}>
                      Abrir
                      <span className="sr-only"> {p.titulo}</span>
                      <span className="ico">
                        <Icone nome="direita" tamanho={14} />
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {outros.length > 0 && oferta && (
          <section className="section" aria-labelledby="outros-titulo">
            <div className="section-head">
              <div>
                <h2 id="outros-titulo">Outros pacotes</h2>
                <p>
                  {oferta.exigeCliente && oferta.descontoPercentual !== null
                    ? `Por ser cliente, você tem ${oferta.descontoPercentual}% de desconto em cada pacote.`
                    : "Compre um de cada vez ou veja os combos na loja."}
                </p>
              </div>
              <Link className="btn secondary sm" href="/loja/">
                Ver os combos
              </Link>
            </div>
            <div className="lista-membros">
              {outros.map((p) => (
                <article key={p.slug} className="item-membro shell">
                  <div className="core">
                    <CapaPacote capa={capaDoPacote(p.slug, p.titulo)} />
                    <h3>{p.titulo}</h3>
                    <p>{p.resumo}</p>
                    <div className="rodape">
                      <span className="chip">
                        <Icone nome="cadeado" tamanho={12} />
                        Bloqueado
                      </span>
                      <Link className="btn sm" href={`/loja/checkout/?oferta=${oferta.codigo}&produtos=${p.slug}`}>
                        {precoDe(p).cheio !== null && (
                          <>
                            <s className="small">
                              <span className="sr-only">de </span>
                              {formatarReais(precoDe(p).cheio ?? 0)}
                            </s>{" "}
                          </>
                        )}
                        Comprar por {formatarReais(precoDe(p).preco ?? 0)}
                        <span className="sr-only"> {p.titulo}</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <TrocarSenha minimo={SENHA_MINIMA} />
      </main>
      <Rodape />
    </>
  );
}
