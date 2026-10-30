import type { SupabaseClient } from "@supabase/supabase-js";
import { liberarReservaEmail, reservarEmailAcesso } from "./repositorio";

export type EnviarLinkAcesso = (email: string) => Promise<{ erro: string | null }>;

// E-mail de acesso depois do pagamento aprovado, uma única vez por pedido.
// A reserva no banco garante que notificações repetidas ou simultâneas não mandem dois e-mails.
// Se o envio falhar, a reserva é desfeita e o erro sobe: o Mercado Pago reenvia e a próxima tentativa manda.
export function criarAvisoAcesso(db: SupabaseClient, enviar: EnviarLinkAcesso) {
  return async function avisarAcesso(pedidoId: string): Promise<void> {
    const userId = await reservarEmailAcesso(db, pedidoId);
    if (!userId) return;
    try {
      const { data, error } = await db.auth.admin.getUserById(userId);
      if (error || !data.user?.email) throw new Error("usuário do pedido sem e-mail");
      const r = await enviar(data.user.email);
      if (r.erro) throw new Error(`envio do e-mail de acesso: ${r.erro}`);
    } catch (e) {
      await liberarReservaEmail(db, pedidoId);
      throw e;
    }
  };
}
