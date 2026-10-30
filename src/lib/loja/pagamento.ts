import type { ClienteMercadoPago, Pagamento } from "../mercadopago/api";

// Processa um pagamento a partir do id do Mercado Pago. Chamado pelo webhook, pela página de retorno
// e pela reconciliação. A API é a fonte da verdade; a notificação é só o gatilho.

export type PedidoSalvo = {
  id: string;
  // null enquanto a compra (feita sem login) não foi aprovada
  userId: string | null;
  email: string;
  status: "pendente" | "pago" | "recusado" | "cancelado" | "reembolsado";
  valorCentavos: number;
  mpPaymentId: string | null;
};

export type RepoPagamento = {
  pedidoPorId(id: string): Promise<PedidoSalvo | null>;
  // Liga ao pedido a conta do e-mail da compra, criando-a se não existir. Idempotente.
  garantirConta(pedidoId: string, email: string): Promise<string>;
  liberar(pedidoId: string, paymentId: string, valorCentavos: number): Promise<string>;
  estornar(pedidoId: string, paymentId: string): Promise<string>;
  marcarRecusado(pedidoId: string): Promise<void>;
};

export type ResultadoPagamento =
  | "liberado"
  | "ja_pago"
  | "pagamento_duplicado"
  | "aguardando"
  | "recusado"
  | "revogado"
  | "estorno_registrado"
  | "estornado"
  | "pagamento_inexistente"
  | "sem_referencia"
  | "pedido_inexistente"
  | "moeda_divergente"
  | "valor_divergente"
  | "sem_conta"
  | "reembolsado";

// Resultados que precisam de alguém olhando: dinheiro entrou e o acesso não saiu, ou cobrança em dobro
export const RESULTADOS_ALERTA = new Set<ResultadoPagamento>([
  "valor_divergente",
  "moeda_divergente",
  "pagamento_duplicado",
  "sem_conta",
]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RECUSADOS = new Set(["rejected", "cancelled"]);
const ESTORNADOS = new Set(["refunded", "charged_back"]);

export type DepsPagamento = {
  mp: ClienteMercadoPago;
  repo: RepoPagamento;
  // Envia o e-mail de acesso do pedido pago. Precisa ser idempotente: é chamado a cada notificação repetida.
  avisarAcesso?: (pedidoId: string) => Promise<void>;
};

export async function processarPagamento(
  deps: DepsPagamento,
  paymentId: string,
): Promise<{ resultado: ResultadoPagamento; pedidoId?: string }> {
  const pagamento = await deps.mp.buscarPagamento(paymentId);
  if (!pagamento) return { resultado: "pagamento_inexistente" };
  return aplicarPagamento(deps, pagamento);
}

export async function aplicarPagamento(
  deps: Pick<DepsPagamento, "repo" | "avisarAcesso">,
  pagamento: Pagamento,
): Promise<{ resultado: ResultadoPagamento; pedidoId?: string }> {
  const { repo } = deps;
  const ref = pagamento.external_reference ?? "";
  if (!UUID.test(ref)) return { resultado: "sem_referencia" };
  const pedido = await repo.pedidoPorId(ref);
  if (!pedido) return { resultado: "pedido_inexistente" };
  const pedidoId = pedido.id;
  if (pagamento.currency_id !== "BRL") return { resultado: "moeda_divergente", pedidoId };

  if (pagamento.status === "approved") {
    // Compra feita sem login: a conta do e-mail da compra é criada ou encontrada só agora, na aprovação
    if (!pedido.userId) await repo.garantirConta(pedido.id, pedido.email);
    const valor = Math.round(pagamento.transaction_amount * 100);
    const resultado = (await repo.liberar(pedido.id, pagamento.id, valor)) as ResultadoPagamento;
    // ja_pago também tenta: o envio anterior pode ter falhado. A trava no banco garante um único e-mail.
    if ((resultado === "liberado" || resultado === "ja_pago") && deps.avisarAcesso) await deps.avisarAcesso(pedido.id);
    return { resultado, pedidoId };
  }
  if (ESTORNADOS.has(pagamento.status)) {
    // A função SQL decide: revoga se foi este pagamento que liberou, senão só registra o estorno
    return { resultado: (await repo.estornar(pedido.id, pagamento.id)) as ResultadoPagamento, pedidoId };
  }
  if (RECUSADOS.has(pagamento.status)) {
    if (pedido.status === "pendente") await repo.marcarRecusado(pedido.id);
    return { resultado: "recusado", pedidoId };
  }
  return { resultado: "aguardando", pedidoId };
}
