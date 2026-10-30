import { env } from "../env";
import { criarClienteMercadoPago } from "../mercadopago/api";
import { clientePublico, clienteServico } from "../supabase/clientes";
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
    // Link mágico do Supabase Auth (template Magic Link: código e link). Cria a conta se ela não existir.
    avisarAcesso: criarAvisoAcesso(db, async (email) => {
      const { error } = await clientePublico().auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: `${e.SITE_URL}/entrar/confirmar/?next=%2Fmembros%2F` },
      });
      return { erro: error ? `${error.status ?? ""} ${error.message}`.trim() : null };
    }),
  };
}

export const BUCKET_AULAS = "loja-aulas";
export const BUCKET_PACOTES = "loja-pacotes";
