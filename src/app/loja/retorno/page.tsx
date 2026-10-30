import type { Metadata } from "next";
import Link from "next/link";
import { Alerta } from "@/components/Alerta";
import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { formatarReais } from "@/lib/loja/dominio";
import { processarPagamento } from "@/lib/loja/pagamento";
import { pedidoParaRetorno } from "@/lib/loja/repositorio";
import { depsPagamento } from "@/lib/loja/servicos";
import { clienteServico } from "@/lib/supabase/clientes";
import { Atualizador } from "./Atualizador";

export const metadata: Metadata = { title: "Pagamento", robots: { index: false } };
export const dynamic = "force-dynamic";

type Busca = Promise<{ payment_id?: string; external_reference?: string; status?: string }>;

// O Mercado Pago volta para cá com payment_id e external_reference. A URL não é confiável:
// o pagamento é consultado na API e o que vale é o status do pedido no banco.
// Não exige login: quem comprou sem conta chega aqui antes de ter acesso.
export default async function Retorno({ searchParams }: { searchParams: Busca }) {
  const b = await searchParams;
  const ref = b.external_reference ?? "";
  if (ref && b.payment_id && /^\d+$/.test(b.payment_id)) {
    await processarPagamento(depsPagamento(), b.payment_id).catch((e: unknown) =>
      console.error("retorno", e instanceof Error ? e.message : "erro desconhecido"),
    );
  }
  const pedido = ref ? await pedidoParaRetorno(clienteServico(), ref) : null;

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
                  Não achamos este pedido. Se você já pagou, o acesso chega no e-mail usado na compra.
                </p>
                <Link className="btn" href="/loja/">
                  Voltar à loja
                </Link>
              </>
            ) : pedido.status === "pago" ? (
              <>
                <span className="icone-grande ok" aria-hidden="true">
                  <Icone nome="ok" tamanho={26} />
                </span>
                <h1>Pagamento aprovado</h1>
                <p className="lead muted">
                  Os produtos já estão liberados. Mandamos o acesso para <strong>{mascarar(pedido.email)}</strong>: entre na
                  área de membros com o código desse e-mail.
                </p>
                <Resumo valor={pedido.valorCentavos} status="Aprovado" />
                <Link className="btn lg" href="/entrar/?next=%2Fmembros%2F">
                  Entrar na área de membros
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

// Mostra só o começo do e-mail: a página abre por um link que pode ser repassado
function mascarar(email: string): string {
  const [nome = "", dominio = ""] = email.split("@");
  return `${nome.slice(0, 2)}***@${dominio}`;
}
