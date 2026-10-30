import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { aplicarPagamento, RESULTADOS_ALERTA } from "@/lib/loja/pagamento";
import { expirarPendentes, marcarVerificado, pedidosParaReconciliar } from "@/lib/loja/repositorio";
import { depsPagamento } from "@/lib/loja/servicos";
import { clienteServico } from "@/lib/supabase/clientes";

// Rede de segurança para notificação perdida: consulta no Mercado Pago os pedidos pendentes ou recusados
// há mais de 15 min. A Vercel chama com Authorization: Bearer <CRON_SECRET>.
export async function GET(req: Request): Promise<Response> {
  const segredo = env().CRON_SECRET;
  if (!segredo || !autorizado(req.headers.get("authorization"), `Bearer ${segredo}`)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const db = clienteServico();
  const deps = depsPagamento();
  await expirarPendentes(db);
  const ids = await pedidosParaReconciliar(db, 15);
  const resultados: Record<string, string> = {};
  for (const id of ids) {
    // Um pedido com erro não derruba o lote
    try {
      const pagamentos = await deps.mp.pagamentosDoPedido(id);
      const aprovado = pagamentos.find((p) => p.status === "approved");
      const escolhido = aprovado ?? pagamentos[0];
      const resultado = escolhido ? (await aplicarPagamento(deps, escolhido)).resultado : null;
      resultados[id] = resultado ?? "sem_pagamento";
      if (resultado && RESULTADOS_ALERTA.has(resultado)) console.error("pagamento precisa de revisão", { pedidoId: id, resultado });
      await marcarVerificado(db, id);
    } catch (e) {
      resultados[id] = "erro";
      console.error("reconciliar", id, e instanceof Error ? e.message : "erro desconhecido");
    }
  }
  return Response.json({ ok: true, verificados: ids.length, resultados });
}

function autorizado(recebido: string | null, esperado: string): boolean {
  if (!recebido) return false;
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}
