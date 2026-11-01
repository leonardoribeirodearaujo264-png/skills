import { env } from "../env";
import { criarClienteMercadoPago } from "../mercadopago/api";
import { enviarAcesso } from "../auth/acesso";
import { clienteServico } from "../supabase/clientes";
import { capaDoPacote } from "./apresentacao";
import { criarAvisoAcesso } from "./emailAcesso";
import { permitir } from "./limites";
import { pedidoParaMeta, repoPagamento } from "./repositorio";
import { idEventoCompra } from "../meta/pixel";
import { registrarDepois } from "../meta/servidor";
import type { DepsPagamento } from "./pagamento";

// Monta as dependências reais do processamento de pagamento (só no servidor)
export function depsPagamento(): DepsPagamento {
  const e = env();
  const db = clienteServico();
  return {
    mp: criarClienteMercadoPago(e.MERCADOPAGO_ACCESS_TOKEN),
    repo: repoPagamento(db),
    // Código e link de acesso pelo Resend; a conta já foi criada na aprovação (garantirConta)
    avisarAcesso: criarAvisoAcesso(db, async (email, pacotes, slugs, senha) => {
      // Capa do primeiro pacote do pedido, em PNG (leitores de e-mail nem sempre abrem WebP)
      const capa = slugs[0] ? capaDoPacote(slugs[0], pacotes[0] ?? "") : null;
      const r = await enviarAcesso(email, "compra", {
        proximo: "/membros/",
        pacotes,
        senha,
        capa: capa ? { url: `${e.SITE_URL}${capa.png}`, alt: capa.alt } : null,
      });
      return { erro: r === "enviado" ? null : r };
    }, (chave) => permitir(chave, 1, 0)),
    // Mesmo event_id do Purchase do navegador: a Meta conta a compra uma vez
    // Roda depois da resposta (after): a Meta lenta não atrasa o "aprovado" nem o e-mail de acesso
    aoPagar: (pedidoId) =>
      registrarDepois(async () => {
        const p = await pedidoParaMeta(db, pedidoId);
        if (!p || p.status !== "pago") return null;
        return {
          nome: "Purchase",
          id: idEventoCompra(pedidoId),
          quando: new Date(),
          url: `${e.SITE_URL}/loja/checkout/`,
          usuario: { email: p.email, telefone: p.telefone, nome: p.nome, idExterno: pedidoId },
          valorCentavos: p.valorCentavos,
          conteudos: p.slugs,
        };
      }),
  };
}

export const BUCKET_AULAS = "loja-aulas";
export const BUCKET_PACOTES = "loja-pacotes";
