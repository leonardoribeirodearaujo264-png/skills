import type { Usuario } from "../auth/sessao";
import { env, modoTeste } from "../env";
import { criarClienteMercadoPago } from "../mercadopago/api";
import { clientePublico, clienteServico } from "../supabase/clientes";
import { montarPedido, PedidoInvalido, type Catalogo, type ItensDoPedido, type MotivoRecusa } from "./dominio";
import { meusProdutos } from "./membros";
import { carregarCatalogo, criarOuReusarPedido, salvarPreferencia } from "./repositorio";

// A compra não exige login: o comprador informa o e-mail no checkout e a conta é criada na aprovação.
// Quem está logado compra com o e-mail da sessão. O preço de cliente exige sessão (prova do e-mail).

export type ResultadoCheckout = { url: string } | { motivo: MotivoRecusa | "falha" };
export type Previa = {
  ofertaTitulo: string;
  itens: { slug: string; titulo: string }[];
  valorCentavos: number;
};

// O que a pessoa já tem só é conferido com sessão. Para visitante, consultar pelo e-mail digitado
// revelaria o que outra pessoa comprou; a liberação já não duplica acesso de quem compra de novo.
async function produtosJaComprados(usuario: Usuario | null): Promise<Set<string>> {
  return usuario ? new Set((await meusProdutos(usuario)).map((p) => p.slug)) : new Set();
}

async function calcular(
  usuario: Usuario | null,
  oferta: string,
  produtos: string[],
): Promise<{ catalogo: Catalogo; itens: ItensDoPedido }> {
  const catalogo = await carregarCatalogo(clientePublico());
  const ofertaInfo = catalogo.ofertas.find((o) => o.codigo === oferta);
  if (ofertaInfo?.exigeCliente && !usuario) throw new PedidoInvalido("so_clientes");
  const possui = await produtosJaComprados(usuario);
  return { catalogo, itens: montarPedido(catalogo, oferta, produtos, possui) };
}

// Prévia para a página do checkout: itens e valor calculados no servidor, sem criar nada
export async function previaCompra(
  usuario: Usuario | null,
  oferta: string,
  produtos: string[],
): Promise<Previa | { motivo: MotivoRecusa | "falha" }> {
  try {
    const { catalogo, itens } = await calcular(usuario, oferta, produtos);
    return {
      ofertaTitulo: catalogo.ofertas.find((o) => o.codigo === oferta)?.titulo ?? "Pacote",
      itens: itens.itens.map((s) => ({ slug: s, titulo: catalogo.produtos.find((p) => p.slug === s)?.titulo ?? s })),
      valorCentavos: itens.valorCentavos,
    };
  } catch (e) {
    if (e instanceof PedidoInvalido) return { motivo: e.motivo };
    console.error("previa", e instanceof Error ? e.message : "erro desconhecido");
    return { motivo: "falha" };
  }
}

// Monta o pedido pela regra do banco, grava (ou reaproveita) o pendente pelo e-mail e cria a preferência.
export async function iniciarCompra(
  comprador: { usuario: Usuario | null; email: string },
  oferta: string,
  produtos: string[],
): Promise<ResultadoCheckout> {
  try {
    const email = (comprador.usuario?.email ?? comprador.email).trim().toLowerCase();
    const { catalogo, itens } = await calcular(comprador.usuario, oferta, produtos);
    const db = clienteServico();
    const pedido = await criarOuReusarPedido(db, { email, userId: comprador.usuario?.id ?? null }, oferta, itens);

    const e = env();
    const ofertaInfo = catalogo.ofertas.find((o) => o.codigo === oferta);
    const titulos = itens.itens.map((s) => catalogo.produtos.find((p) => p.slug === s)?.titulo ?? s);
    const preferencia = await criarClienteMercadoPago(e.MERCADOPAGO_ACCESS_TOKEN).criarPreferencia({
      pedidoId: pedido.id,
      titulo: `${ofertaInfo?.titulo ?? "Pacote"}: ${titulos.join(", ")}`.slice(0, 250),
      // O valor gravado no pedido é o que a liberação confere; a preferência usa exatamente ele
      valorCentavos: pedido.valorCentavos,
      emailComprador: email,
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
