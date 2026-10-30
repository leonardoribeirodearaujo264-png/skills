import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alerta } from "@/components/Alerta";
import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { usuarioAtual } from "@/lib/auth/sessao";
import { formatarReais } from "@/lib/loja/dominio";
import { pedidosRecentes } from "@/lib/loja/membros";
import { processarPagamento } from "@/lib/loja/pagamento";
import { depsPagamento } from "@/lib/loja/servicos";
import { Atualizador } from "./Atualizador";

export const metadata: Metadata = { title: "Pagamento", robots: { index: false } };
export const dynamic = "force-dynamic";

type Busca = Promise<{ payment_id?: string; external_reference?: string; status?: string }>;

// O Mercado Pago volta para cá com payment_id e external_reference. A URL não é confiável:
// o pagamento é consultado na API e o que vale é o status do pedido no banco.
export default async function Retorno({ searchParams }: { searchParams: Busca }) {
  const b = await searchParams;
  const usuario = await usuarioAtual();
  if (!usuario) {
    const aqui = `/loja/retorno/?${new URLSearchParams(Object.entries(b).filter((e): e is [string, string] => typeof e[1] === "string"))}`;
    redirect(`/entrar/?next=${encodeURIComponent(aqui)}`);
  }

  // Só segue se o pedido da URL for deste usuário (o RLS só devolve os pedidos dele)
  let pedidos = await pedidosRecentes(usuario);
  const ref = b.external_reference ?? "";
  if (pedidos.some((p) => p.id === ref) && b.payment_id && /^\d+$/.test(b.payment_id)) {
    await processarPagamento(depsPagamento(), b.payment_id).catch((e: unknown) =>
      console.error("retorno", e instanceof Error ? e.message : "erro desconhecido"),
    );
    pedidos = await pedidosRecentes(usuario);
  }
  const pedido = pedidos.find((p) => p.id === ref);

  return (
    <>
      <Cabecalho ativa="loja" />
      <main className="auth" id="conteudo">
        <div className="shell">
          <div className="core" aria-live="polite">
            {!pedido ? (
              <>
                <span className="icone-grande warn" aria-hidden="true">
                  <Icone nome="info" tamanho={26} />
                </span>
                <h1>Pedido não encontrado</h1>
                <p className="lead muted">
                  Não achamos este pedido na conta {usuario.email}. Se pagou com outra conta, entre com ela.
                </p>
                <Link className="btn" href="/membros/">
                  Ir para a minha área
                </Link>
              </>
            ) : pedido.status === "pago" ? (
              <>
                <span className="icone-grande ok" aria-hidden="true">
                  <Icone nome="ok" tamanho={26} />
                </span>
                <h1>Pagamento aprovado</h1>
                <p className="lead muted">Os produtos já estão liberados na sua área.</p>
                <Resumo valor={pedido.valorCentavos} status="Aprovado" />
                <Link className="btn lg" href="/membros/">
                  Abrir a minha área
                  <span className="ico">
                    <Icone nome="direita" tamanho={16} />
                  </span>
                </Link>
              </>
            ) : pedido.status === "pendente" ? (
              <>
                <span className="icone-grande" aria-hidden="true">
                  <Icone nome="relogio" tamanho={26} />
                </span>
                <h1>{b.status === "approved" ? "Confirmando o pagamento" : "Pagamento em análise"}</h1>
                <p className="lead muted">
                  {b.status === "approved"
                    ? "O Mercado Pago aprovou. Estamos liberando o seu acesso, leva poucos segundos."
                    : "Assim que o Mercado Pago confirmar, o acesso é liberado e aparece na sua área."}
                </p>
                <Resumo valor={pedido.valorCentavos} status="Aguardando confirmação" />
                <Atualizador ativo />
                <Link className="btn secondary" href="/membros/">
                  Ir para a minha área
                </Link>
              </>
            ) : (
              <>
                <span className="icone-grande danger" aria-hidden="true">
                  <Icone nome="erro" tamanho={26} />
                </span>
                <h1>{pedido.status === "reembolsado" ? "Pedido reembolsado" : "Pagamento não aprovado"}</h1>
                <Alerta tipo="danger" titulo="Nenhum valor foi liberado para este pedido">
                  Tente de novo com outro meio de pagamento. Se o valor aparecer na fatura, o Mercado Pago estorna automaticamente.
                </Alerta>
                <Link className="btn lg" href="/loja/">
                  Tentar de novo
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

function Resumo({ valor, status }: { valor: number; status: string }) {
  return (
    <dl className="pedido">
      <div>
        <dt>Valor</dt>
        <dd className="num">{formatarReais(valor)}</dd>
      </div>
      <div>
        <dt>Situação</dt>
        <dd>{status}</dd>
      </div>
    </dl>
  );
}
