import type { Usuario } from "../auth/sessao";
import { env, modoTeste } from "../env";
import { criarClienteMercadoPago } from "../mercadopago/api";
import { clientePublico, clienteServico } from "../supabase/clientes";
import { montarPedido, PedidoInvalido, type MotivoRecusa } from "./dominio";
import { meusProdutos } from "./membros";
import { carregarCatalogo, criarOuReusarPedido, salvarPreferencia } from "./repositorio";

export type ResultadoCheckout = { url: string } | { motivo: MotivoRecusa | "falha" };

// Monta o pedido pela regra do banco, grava (ou reaproveita) o pendente e cria a preferência do Mercado Pago.
// Usado pela ação da loja e pela compra direta das páginas dos vídeos.
export async function iniciarCompra(usuario: Usuario, oferta: string, produtos: string[]): Promise<ResultadoCheckout> {
  try {
    const catalogo = await carregarCatalogo(clientePublico());
    const possui = new Set((await meusProdutos(usuario)).map((p) => p.slug));
    const itens = montarPedido(catalogo, oferta, produtos, possui);
    const db = clienteServico();
    const pedido = await criarOuReusarPedido(db, usuario.id, oferta, itens);

    const e = env();
    const ofertaInfo = catalogo.ofertas.find((o) => o.codigo === oferta);
    const titulos = itens.itens.map((s) => catalogo.produtos.find((p) => p.slug === s)?.titulo ?? s);
    const preferencia = await criarClienteMercadoPago(e.MERCADOPAGO_ACCESS_TOKEN).criarPreferencia({
      pedidoId: pedido.id,
      titulo: `${ofertaInfo?.titulo ?? "Pacote"}: ${titulos.join(", ")}`.slice(0, 250),
      // O valor gravado no pedido é o que a liberação confere; a preferência usa exatamente ele
      valorCentavos: pedido.valorCentavos,
      emailComprador: usuario.email,
      urlRetorno: `${e.SITE_URL}/loja/retorno/`,
      urlNotificacao: `${e.SITE_URL}/api/webhooks/mercadopago?source_news=webhooks`,
    });
    await salvarPreferencia(db, pedido.id, preferencia.id);
    return { url: modoTeste() ? (preferencia.sandbox_init_point ?? preferencia.init_point) : preferencia.init_point };
  } catch (e) {
    if (e instanceof PedidoInvalido) return { motivo: e.motivo };
    console.error("checkout", e instanceof Error ? e.message : "erro desconhecido");
    return { motivo: "falha" };
  }
}

export const MENSAGEM_FALHA_CHECKOUT =
  "Não conseguimos abrir o pagamento agora. Nenhuma cobrança foi feita. Tente de novo em instantes.";
