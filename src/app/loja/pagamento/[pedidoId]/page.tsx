import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { pixDoPedido } from "@/lib/loja/checkout";
import { formatarReais } from "@/lib/loja/dominio";
import { PixTela } from "../../checkout/PixTela";

export const metadata: Metadata = { title: "Pagamento", robots: { index: false } };
export const dynamic = "force-dynamic";

// Página aberta pelo botão do e-mail do Pix: mostra o código ainda válido, ou deixa gerar um novo se venceu.
// O id do pedido é um UUID que só o comprador recebe; nenhum dado pessoal aparece aqui.
export default async function Pagamento({ params }: { params: Promise<{ pedidoId: string }> }) {
  const { pedidoId } = await params;
  const p = await pixDoPedido(pedidoId).catch(() => ({ situacao: "inexistente" as const }));

  return (
    <>
      <Cabecalho ativa="loja" />
      <main className="auth" id="conteudo">
        <div className="shell">
          <div className="core">
            {p.situacao === "pago" ? (
              <div className="checkout-resultado" role="status">
                <span className="icone-grande ok" aria-hidden="true">
                  <Icone nome="ok" tamanho={26} />
                </span>
                <h1>Pagamento aprovado</h1>
                <p className="muted">O acesso foi enviado para o e-mail da compra.</p>
                <Link className="btn lg" href="/entrar/?next=%2Fmembros%2F">
                  Entrar na área de membros
                </Link>
              </div>
            ) : p.situacao === "aguardando" ? (
              <>
                <h1 className="sr-only">Pagamento de {p.pacote}</h1>
                <PixTela
                  inicial={{
                    pedidoId: p.pedidoId,
                    copiaECola: p.pix.copiaECola,
                    qrBase64: p.pix.qrBase64,
                    expiraEm: p.pix.expiraEm,
                    agora: p.agora,
                  }}
                  totalTexto={formatarReais(p.valorCentavos)}
                  email={null}
                />
              </>
            ) : p.situacao === "vencido" ? (
              <>
                <h1 className="sr-only">Pagamento de {p.pacote}</h1>
                <PixTela
                  inicial={{ pedidoId: p.pedidoId, copiaECola: "", qrBase64: "", expiraEm: new Date(0).toISOString(), agora: new Date().toISOString() }}
                  totalTexto={formatarReais(p.valorCentavos)}
                  email={null}
                />
              </>
            ) : (
              <>
                <h1>Pedido não encontrado</h1>
                <p className="lead muted">Este link de pagamento não vale mais. Escolha o pacote de novo na loja.</p>
                <Link className="btn" href="/loja/">
                  Voltar à loja
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
      <Rodape />
    </>
  );
}
