import { env } from "@/lib/env";
import { validarAssinatura } from "@/lib/mercadopago/assinatura";
import { processarPagamento, RESULTADOS_ALERTA } from "@/lib/loja/pagamento";
import { concluirEvento, registrarEvento } from "@/lib/loja/repositorio";
import { depsPagamento } from "@/lib/loja/servicos";
import { clienteServico } from "@/lib/supabase/clientes";

// Notificações Webhooks do Mercado Pago (evento Pagamentos). Assinatura validada antes de qualquer coisa.
// Responde 200 depois de processar; erro inesperado devolve 500 para o Mercado Pago reenviar.
export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const assinatura = validarAssinatura({
    xSignature: req.headers.get("x-signature"),
    xRequestId: req.headers.get("x-request-id"),
    dataId: url.searchParams.get("data.id"),
    segredo: env().MERCADOPAGO_WEBHOOK_SECRET,
  });
  if (!assinatura.valida) return Response.json({ ok: false, motivo: assinatura.motivo }, { status: 401 });

  const corpo = await lerCorpo(req);
  const dataId = url.searchParams.get("data.id") ?? corpo.dataId;
  const tipo = url.searchParams.get("type") ?? corpo.tipo;
  if (tipo !== "payment" || !dataId) return Response.json({ ok: true, ignorado: tipo ?? "sem_tipo" });

  const db = clienteServico();
  const requestId = req.headers.get("x-request-id") ?? `sem-id:${tipo}:${dataId}:${corpo.acao ?? ""}`;
  try {
    // Repetição do mesmo x-request-id é reprocessada: a tentativa anterior pode ter falhado. A liberação é idempotente.
    await registrarEvento(db, { requestId, tipo, acao: corpo.acao, recursoId: dataId });
    const { resultado, pedidoId } = await processarPagamento(depsPagamento(), dataId);
    if (RESULTADOS_ALERTA.has(resultado)) console.error("pagamento precisa de revisão", { resultado, pedidoId, pagamento: dataId });
    await concluirEvento(db, requestId, resultado);
    return Response.json({ ok: true, resultado });
  } catch (e) {
    console.error("webhook mercado pago", e instanceof Error ? e.message : "erro desconhecido");
    return Response.json({ ok: false }, { status: 500 });
  }
}

async function lerCorpo(req: Request): Promise<{ dataId: string | null; tipo: string | null; acao: string | null }> {
  try {
    const j: unknown = await req.json();
    if (typeof j !== "object" || j === null) return { dataId: null, tipo: null, acao: null };
    const o = j as { type?: unknown; action?: unknown; data?: { id?: unknown } };
    return {
      dataId: o.data?.id !== undefined ? String(o.data.id) : null,
      tipo: typeof o.type === "string" ? o.type : null,
      acao: typeof o.action === "string" ? o.action : null,
    };
  } catch {
    return { dataId: null, tipo: null, acao: null };
  }
}
