import type { Metadata } from "next";
import Link from "next/link";
import { Alerta } from "@/components/Alerta";
import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { usuarioAtual } from "@/lib/auth/sessao";
import { MENSAGEM_FALHA_CHECKOUT, previaCompra } from "@/lib/loja/checkout";
import { formatarReais, MENSAGEM_RECUSA } from "@/lib/loja/dominio";
import { CheckoutPagamento } from "./CheckoutPagamento";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };
export const dynamic = "force-dynamic";

type Busca = Promise<{ oferta?: string; produtos?: string }>;

// Checkout aberto a qualquer visitante, numa página só: pedido calculado no servidor, e-mail e pagamento
// por Pix ou cartão sem sair do site. Abrir a página não cria pedido; ele nasce ao gerar o Pix ou pagar.
export default async function Checkout({ searchParams }: { searchParams: Busca }) {
  const b = await searchParams;
  const oferta = /^[a-z0-9-]{1,40}$/.test(b.oferta ?? "") ? (b.oferta as string) : "";
  const produtos = (b.produtos ?? "").split(",").filter((p) => /^[a-z0-9-]{1,60}$/.test(p)).slice(0, 20);
  const usuario = await usuarioAtual();
  const previa = oferta ? await previaCompra(usuario, oferta, produtos) : ({ motivo: "oferta_inexistente" } as const);
  const voltarLoja = `/loja/?${new URLSearchParams({ oferta, produtos: produtos.join(",") })}`;

  return (
    <>
      <Cabecalho ativa="loja" />
      <main className="auth" id="conteudo">
        <div className="shell">
          <div className="core">
            <span className="icone-grande" aria-hidden="true">
              <Icone nome="pacote" tamanho={26} />
            </span>
            <h1>Finalizar compra</h1>
            {"motivo" in previa ? (
              <>
                <Alerta tipo={previa.motivo === "falha" ? "danger" : "warn"} titulo="Não deu para montar o pedido">
                  {previa.motivo === "falha" ? MENSAGEM_FALHA_CHECKOUT : MENSAGEM_RECUSA[previa.motivo]}
                </Alerta>
                {previa.motivo === "so_clientes" ? (
                  <Link className="btn" href={`/entrar/?next=${encodeURIComponent(`/loja/checkout/?oferta=${oferta}&produtos=${produtos.join(",")}`)}`}>
                    Entrar com o e-mail da compra
                  </Link>
                ) : (
                  <Link className="btn" href={voltarLoja}>
                    Escolher na loja
                  </Link>
                )}
              </>
            ) : (
              <>
                <dl className="pedido">
                  <div>
                    <dt>Oferta</dt>
                    <dd>{previa.ofertaTitulo}</dd>
                  </div>
                  {previa.itens.map((i) => (
                    <div key={i.slug}>
                      <dt>Pacote</dt>
                      <dd>{i.titulo}</dd>
                    </div>
                  ))}
                  <div>
                    <dt>Total</dt>
                    <dd className="num">{formatarReais(previa.valorCentavos)}</dd>
                  </div>
                </dl>
                <CheckoutPagamento
                  oferta={oferta}
                  produtos={produtos.join(",")}
                  emailSessao={usuario?.email ?? null}
                  valorCentavos={previa.valorCentavos}
                  totalTexto={formatarReais(previa.valorCentavos)}
                  chavePublica={process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? null}
                />
                <p className="small muted">
                  Pagamento único, sem mensalidade. <Link href={voltarLoja}>Trocar a escolha</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <Rodape />
    </>
  );
}
