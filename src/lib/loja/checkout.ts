import type { Usuario } from "../auth/sessao";
import { env } from "../env";
import { ErroMercadoPago, type Pix } from "../mercadopago/api";
import { clientePublico, clienteServico } from "../supabase/clientes";
import { montarPedido, PedidoInvalido, type Catalogo, type ItensDoPedido, type MotivoRecusa } from "./dominio";
import { meusProdutos } from "./membros";
import { aplicarPagamento, type ResultadoPagamento } from "./pagamento";
import { carregarCatalogo, criarOuReusarPedido, pedidoParaRetorno } from "./repositorio";
import { depsPagamento } from "./servicos";

// Checkout no próprio site, sem login: o comprador informa o e-mail e paga por Pix ou cartão ali mesmo.
// Preço, itens e regra da oferta saem sempre do servidor. A conta nasce na aprovação do pagamento.
// O preço de cliente exige sessão (prova de que o e-mail é dele).

export type Previa = {
  ofertaTitulo: string;
  itens: { slug: string; titulo: string }[];
  valorCentavos: number;
};
export type Falha = { motivo: MotivoRecusa | "falha" };

type Comprador = { usuario: Usuario | null; email: string };
type PedidoPronto = { pedidoId: string; valorCentavos: number; descricao: string; email: string };

const PIX_VALIDO_MS = 60 * 60 * 1000;

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

function tratar(e: unknown, onde: string): Falha {
  if (e instanceof PedidoInvalido) return { motivo: e.motivo };
  console.error(onde, e instanceof Error ? e.message : "erro desconhecido");
  return { motivo: "falha" };
}

// Prévia para a página do checkout: itens e valor calculados no servidor, sem criar nada
export async function previaCompra(usuario: Usuario | null, oferta: string, produtos: string[]): Promise<Previa | Falha> {
  try {
    const { catalogo, itens } = await calcular(usuario, oferta, produtos);
    return {
      ofertaTitulo: catalogo.ofertas.find((o) => o.codigo === oferta)?.titulo ?? "Pacote",
      itens: itens.itens.map((s) => ({ slug: s, titulo: catalogo.produtos.find((p) => p.slug === s)?.titulo ?? s })),
      valorCentavos: itens.valorCentavos,
    };
  } catch (e) {
    return tratar(e, "previa");
  }
}

// Grava (ou reaproveita) o pedido pendente pelo e-mail, com o valor calculado agora no servidor
async function prepararPedido(comprador: Comprador, oferta: string, produtos: string[]): Promise<PedidoPronto> {
  const email = (comprador.usuario?.email ?? comprador.email).trim().toLowerCase();
  const { catalogo, itens } = await calcular(comprador.usuario, oferta, produtos);
  const pedido = await criarOuReusarPedido(clienteServico(), { email, userId: comprador.usuario?.id ?? null }, oferta, itens);
  const ofertaTitulo = catalogo.ofertas.find((o) => o.codigo === oferta)?.titulo ?? "Pacote";
  const titulos = itens.itens.map((s) => catalogo.produtos.find((p) => p.slug === s)?.titulo ?? s);
  return {
    pedidoId: pedido.id,
    valorCentavos: pedido.valorCentavos,
    descricao: `${ofertaTitulo}: ${titulos.join(", ")}`.slice(0, 250),
    email,
  };
}

function urlNotificacao(): string {
  return `${env().SITE_URL}/api/webhooks/mercadopago?source_news=webhooks`;
}

export type PixGerado = { pedidoId: string; valorCentavos: number; pix: Pix };

export async function gerarPix(comprador: Comprador, oferta: string, produtos: string[]): Promise<PixGerado | Falha> {
  try {
    const pedido = await prepararPedido(comprador, oferta, produtos);
    const pix = await depsPagamento().mp.criarPix({
      ...pedido,
      urlNotificacao: urlNotificacao(),
      expiraEm: new Date(Date.now() + PIX_VALIDO_MS),
    });
    return { pedidoId: pedido.pedidoId, valorCentavos: pedido.valorCentavos, pix };
  } catch (e) {
    return tratar(e, "pix");
  }
}

// Dados que o formulário seguro do Mercado Pago (Card Payment Brick) entrega; o cartão em si nunca passa aqui
export type DadosCartao = {
  token: string;
  parcelas: number;
  metodo: string;
  emissor: string | null;
  valorCentavos: number;
  documento: { tipo: string; numero: string } | null;
};

export type ResultadoCartao =
  | { situacao: "aprovado" | "em_analise"; pedidoId: string }
  | { situacao: "recusado"; detalhe: string | null }
  | Falha;

export async function pagarComCartao(
  comprador: Comprador,
  oferta: string,
  produtos: string[],
  cartao: DadosCartao,
): Promise<ResultadoCartao> {
  try {
    const pedido = await prepararPedido(comprador, oferta, produtos);
    // O valor mostrado no formulário tem de ser o mesmo do servidor; senão, a tela está desatualizada
    if (cartao.valorCentavos !== pedido.valorCentavos) return { motivo: "falha" };
    const deps = depsPagamento();
    const pagamento = await deps.mp.pagarComCartao({
      ...pedido,
      ...cartao,
      urlNotificacao: urlNotificacao(),
      // O token do cartão vale uma vez: a mesma tentativa repetida não cobra duas vezes
      idempotencia: `cartao-${pedido.pedidoId}-${cartao.token}`.slice(0, 256),
    });
    if (pagamento.status === "approved") {
      await aplicarPagamento(deps, pagamento);
      return { situacao: "aprovado", pedidoId: pedido.pedidoId };
    }
    if (pagamento.status === "in_process" || pagamento.status === "pending" || pagamento.status === "authorized") {
      return { situacao: "em_analise", pedidoId: pedido.pedidoId };
    }
    await aplicarPagamento(deps, pagamento);
    return { situacao: "recusado", detalhe: pagamento.status_detail ?? null };
  } catch (e) {
    if (e instanceof ErroMercadoPago && e.status === 400) return { situacao: "recusado", detalhe: null };
    return tratar(e, "cartao");
  }
}

export type Situacao = "pago" | "pendente" | "recusado" | "outro";

// Situação do pedido para a tela do checkout. Se ainda está pendente, confere no Mercado Pago:
// a tela fica certa mesmo se o webhook atrasar. A liberação é a mesma do webhook (idempotente).
export async function situacaoDoPedido(pedidoId: string): Promise<Situacao> {
  const db = clienteServico();
  let pedido = await pedidoParaRetorno(db, pedidoId);
  if (!pedido) return "outro";
  if (pedido.status === "pendente") {
    try {
      const deps = depsPagamento();
      const pagamentos = await deps.mp.pagamentosDoPedido(pedidoId);
      const aprovado = pagamentos.find((p) => p.status === "approved");
      if (aprovado) {
        const r: ResultadoPagamento = (await aplicarPagamento(deps, aprovado)).resultado;
        if (r !== "liberado" && r !== "ja_pago") console.error("situacao", { pedidoId, resultado: r });
        pedido = await pedidoParaRetorno(db, pedidoId);
      }
    } catch (e) {
      console.error("situacao", e instanceof Error ? e.message : "erro desconhecido");
    }
  }
  if (!pedido) return "outro";
  if (pedido.status === "pago") return "pago";
  if (pedido.status === "pendente") return "pendente";
  if (pedido.status === "recusado") return "recusado";
  return "outro";
}

export const MENSAGEM_FALHA_CHECKOUT =
  "Não conseguimos abrir o pagamento agora. Nenhuma cobrança foi feita. Tente de novo em instantes.";
