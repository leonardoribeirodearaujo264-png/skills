import type { Usuario } from "../auth/sessao";
import { env } from "../env";
import { ErroMercadoPago, type Pagamento, type Pix } from "../mercadopago/api";
import { clientePublico, clienteServico } from "../supabase/clientes";
import { montarPedido, PedidoInvalido, type Catalogo, type ItensDoPedido, type MotivoRecusa } from "./dominio";
import { meusProdutos } from "./membros";
import { permitir } from "./limites";
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

// Pagamentos que já existem no pedido. Antes de cobrar de novo, o que está aprovado ou em análise decide.
type JaCobrado = { situacao: "aprovado" | "em_analise"; pedidoId: string };
const EM_ANALISE = new Set(["in_process", "pending", "authorized"]);

// Libera e confirma: "aprovado" só quando o acesso saiu de fato; o resto vira análise (e fica no log)
async function liberarAprovado(deps: ReturnType<typeof depsPagamento>, pagamento: Pagamento, pedidoId: string): Promise<JaCobrado> {
  const r: ResultadoPagamento = (await aplicarPagamento(deps, pagamento)).resultado;
  if (r === "liberado" || r === "ja_pago") return { situacao: "aprovado", pedidoId };
  console.error("pagamento aprovado sem liberação", { pedidoId, resultado: r });
  return { situacao: "em_analise", pedidoId };
}

async function cobrancaExistente(
  deps: ReturnType<typeof depsPagamento>,
  pedidoId: string,
  ignorarPix: boolean,
): Promise<JaCobrado | null> {
  const pagamentos = await deps.mp.pagamentosDoPedido(pedidoId);
  const aprovado = pagamentos.find((p) => p.status === "approved");
  if (aprovado) return liberarAprovado(deps, aprovado, pedidoId);
  const analise = pagamentos.find((p) => EM_ANALISE.has(p.status) && !(ignorarPix && p.payment_method_id === "pix"));
  if (analise) return { situacao: "em_analise", pedidoId };
  return null;
}

export type PixGerado = { pedidoId: string; valorCentavos: number; pix: Pix };

export async function gerarPix(comprador: Comprador, oferta: string, produtos: string[]): Promise<PixGerado | JaCobrado | Falha> {
  try {
    const pedido = await prepararPedido(comprador, oferta, produtos);
    const deps = depsPagamento();
    // Se o pedido já foi pago ou tem cartão em análise, não gera cobrança nova. Pix pendente é reaproveitado.
    const ja = await cobrancaExistente(deps, pedido.pedidoId, true);
    if (ja) return ja;
    const pix = await deps.mp.criarPix({
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

export type ResultadoCartao = JaCobrado | { situacao: "recusado"; detalhe: string | null } | Falha;

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

    // Nada de cobrança dupla: pedido já pago ou com cartão em análise não é cobrado de novo,
    // e o Pix pendente do mesmo pedido é cancelado antes do cartão (se não der, ele já foi pago)
    const ja = await cobrancaExistente(deps, pedido.pedidoId, true);
    if (ja) return ja;
    const pixPendentes = (await deps.mp.pagamentosDoPedido(pedido.pedidoId)).filter(
      (p) => p.payment_method_id === "pix" && p.status === "pending",
    );
    for (const pix of pixPendentes) {
      if (!(await deps.mp.cancelarPagamento(pix.id))) {
        const depois = await cobrancaExistente(deps, pedido.pedidoId, false);
        if (depois) return depois;
      }
    }

    const pagamento = await deps.mp.pagarComCartao({
      ...pedido,
      ...cartao,
      urlNotificacao: urlNotificacao(),
      // O token do cartão vale uma vez: a mesma tentativa repetida não cobra duas vezes
      idempotencia: `cartao-${pedido.pedidoId}-${cartao.token}`.slice(0, 256),
    });
    if (pagamento.status === "approved") return liberarAprovado(deps, pagamento, pedido.pedidoId);
    if (EM_ANALISE.has(pagamento.status)) return { situacao: "em_analise", pedidoId: pedido.pedidoId };
    await aplicarPagamento(deps, pagamento);
    return { situacao: "recusado", detalhe: pagamento.status_detail ?? null };
  } catch (e) {
    if (e instanceof ErroMercadoPago && e.status === 400) return { situacao: "recusado", detalhe: null };
    return tratar(e, "cartao");
  }
}

export type Situacao = "pago" | "pendente" | "recusado" | "outro";

// Situação do pedido para a tela do checkout. Enquanto não está pago, confere no Mercado Pago (no máximo
// a cada 8 s por pedido): a tela fica certa mesmo se o webhook atrasar. A liberação é a do webhook.
export async function situacaoDoPedido(pedidoId: string): Promise<Situacao> {
  const db = clienteServico();
  let pedido = await pedidoParaRetorno(db, pedidoId);
  if (!pedido) return "outro";
  if ((pedido.status === "pendente" || pedido.status === "recusado") && (await permitir(`situacao:${pedidoId}`, 600, 8))) {
    try {
      const deps = depsPagamento();
      const aprovado = (await deps.mp.pagamentosDoPedido(pedidoId)).find((p) => p.status === "approved");
      if (aprovado) {
        await liberarAprovado(deps, aprovado, pedidoId);
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
