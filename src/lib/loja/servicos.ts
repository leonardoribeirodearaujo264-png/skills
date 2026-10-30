import { env } from "../env";
import { criarClienteMercadoPago } from "../mercadopago/api";
import { enviarAcesso } from "../auth/acesso";
import { clienteServico } from "../supabase/clientes";
import { capaDoPacote } from "./apresentacao";
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
    avisarAcesso: criarAvisoAcesso(db, async (email, pacotes, slugs) => {
      // Capa do primeiro pacote do pedido, em PNG (leitores de e-mail nem sempre abrem WebP)
      const capa = slugs[0] ? capaDoPacote(slugs[0], pacotes[0] ?? "") : null;
      const r = await enviarAcesso(email, "compra", {
        proximo: "/membros/",
        pacotes,
        capa: capa ? { url: `${e.SITE_URL}${capa.png}`, alt: capa.alt } : null,
      });
      return { erro: r === "enviado" ? null : r };
    }),
  };
}

export const BUCKET_AULAS = "loja-aulas";
export const BUCKET_PACOTES = "loja-pacotes";
