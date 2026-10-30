import { env } from "../env";
import { criarClienteMercadoPago } from "../mercadopago/api";
import { enviarAcesso } from "../auth/acesso";
import { clienteServico } from "../supabase/clientes";
import { criarAvisoAcesso } from "./emailAcesso";
import { repoPagamento } from "./repositorio";
import type { DepsPagamento } from "./pagamento";

// Monta as dependências reais do processamento de pagamento (só no servidor)
export function depsPagamento(): DepsPagamento {
  const e = env();
  const db = clienteServico();
  return {
    mp: criarClienteMercadoPago(e.MERCADOPAGO_ACCESS_TOKEN),
    repo: repoPagamento(db),
    // Código e link de acesso pelo Resend; a conta já foi criada na aprovação (garantirConta)
    avisarAcesso: criarAvisoAcesso(db, async (email) => {
      const r = await enviarAcesso(email, "compra", { proximo: "/membros/" });
      return { erro: r === "enviado" ? null : r };
    }),
  };
}

export const BUCKET_AULAS = "loja-aulas";
export const BUCKET_PACOTES = "loja-pacotes";
