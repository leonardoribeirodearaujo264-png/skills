import type { Usuario } from "../auth/sessao";
import { env } from "../env";
import { enviarEmailPix } from "../email/pix";
import { ErroMercadoPago, type Pagamento, type Pix } from "../mercadopago/api";
import { clientePublico, clienteServico } from "../supabase/clientes";
import { partesDoNome } from "./comprador";
import {
  adicionarBump,
  bumpParaPedido,
  formatarReais,
  montarPedido,
  PedidoInvalido,
  type Catalogo,
  type ItensDoPedido,
  type MotivoRecusa,
} from "./dominio";
import { meusProdutos } from "./membros";
import { permitir } from "./limites";
import { aplicarPagamento, type ResultadoPagamento } from "./pagamento";
import {
  acessosAtivos,
  cancelarPedidoPendente,
  carregarCatalogo,
  contaPorEmail,
  criarOuReusarPedido,
  pedidoParaPix,
  pedidoParaRetorno,
  pedidosIrmaosPendentes,
  salvarDadosComprador,
} from "./repositorio";
import { depsPagamento } from "./servicos";

// Checkout no próprio site, sem login: o comprador informa o e-mail e paga por Pix ou cartão ali mesmo.
// Preço, itens e regra da oferta saem sempre do servidor. A conta nasce na aprovação do pagamento.
// O preço de cliente exige sessão (prova de que o e-mail é dele).

// Oferta complementar mostrada no checkout, desmarcada por padrão. Preço vem do banco.
export type BumpNaTela = { slug: string; titulo: string; resumo: string; precoCentavos: number };

export type Previa = {
  ofertaTitulo: string;
  itens: { slug: string; titulo: string }[];
  valorCentavos: number;
  bump: BumpNaTela | null;
};
export type Falha = { motivo: MotivoRecusa | "falha" };

// Nome, e-mail e telefone já validados (src/lib/loja/comprador.ts); com sessão, vale o e-mail da conta
type Comprador = { usuario: Usuario | null; email: string; nome: string; telefone: string };
type PedidoPronto = {
  pedidoId: string;
  // chave dos itens principais, sem a oferta complementar: identifica o mesmo pedido com e sem bump
  chaveBase: string;
  valorCentavos: number;
  descricao: string;
  pacote: string;
  email: string;
  nome: string;
};

export const MINUTOS_PIX = 14;
const PIX_VALIDO_MS = MINUTOS_PIX * 60 * 1000;

// O que a pessoa já tem só é conferido com sessão. Para visitante, consultar pelo e-mail digitado
// revelaria o que outra pessoa comprou; a liberação já não duplica acesso de quem compra de novo.
async function produtosJaComprados(usuario: Usuario | null): Promise<Set<string>> {
  return usuario ? new Set((await meusProdutos(usuario)).map((p) => p.slug)) : new Set();
}

// bump: slug da oferta complementar marcada no checkout, ou null
async function calcular(
  usuario: Usuario | null,
  oferta: string,
  produtos: string[],
  bump: string | null = null,
): Promise<{ catalogo: Catalogo; itens: ItensDoPedido; possui: Set<string> }> {
  const catalogo = await carregarCatalogo(clientePublico());
  const ofertaInfo = catalogo.ofertas.find((o) => o.codigo === oferta);
  if (ofertaInfo?.exigeCliente && !usuario) throw new PedidoInvalido("so_clientes");
  const possui = await produtosJaComprados(usuario);
  const base = montarPedido(catalogo, oferta, produtos, possui);
  return { catalogo, possui, itens: bump ? adicionarBump(catalogo, base, bump, possui) : base };
}

function tituloDe(catalogo: Catalogo, slug: string): string {
  return [...catalogo.produtos, ...catalogo.bumps].find((p) => p.slug === slug)?.titulo ?? slug;
}

function tratar(e: unknown, onde: string): Falha {
  if (e instanceof PedidoInvalido) return { motivo: e.motivo };
  console.error(onde, e instanceof Error ? e.message : "erro desconhecido");
  return { motivo: "falha" };
}

// Prévia para a página do checkout: itens e valor calculados no servidor, sem criar nada
export async function previaCompra(usuario: Usuario | null, oferta: string, produtos: string[]): Promise<Previa | Falha> {
  try {
    const { catalogo, itens, possui } = await calcular(usuario, oferta, produtos);
    const bump = bumpParaPedido(catalogo, itens.itens, possui);
    return {
      ofertaTitulo: catalogo.ofertas.find((o) => o.codigo === oferta)?.titulo ?? "Pacote",
      itens: itens.itens.map((s) => ({ slug: s, titulo: tituloDe(catalogo, s) })),
      valorCentavos: itens.valorCentavos,
      bump:
        bump && bump.precoBumpCentavos !== null
          ? { slug: bump.slug, titulo: bump.titulo, resumo: bump.resumo, precoCentavos: bump.precoBumpCentavos }
          : null,
    };
  } catch (e) {
    return tratar(e, "previa");
  }
}

// Grava (ou reaproveita) o pedido pendente pelo e-mail, com o valor calculado agora no servidor
async function prepararPedido(comprador: Comprador, oferta: string, produtos: string[], bump: string | null): Promise<PedidoPronto> {
  const email = (comprador.usuario?.email ?? comprador.email).trim().toLowerCase();
  const db = clienteServico();
  // Sem sessão, o "já tem" não é conferido (revelaria o que outro e-mail comprou). Só para o bump, que
  // aparece para todos, confere pelo e-mail: pagar de novo não daria nada a mais (a liberação não duplica).
  if (bump && !comprador.usuario) {
    const conta = await contaPorEmail(db, email);
    if (conta && (await acessosAtivos(db, conta)).has(bump)) throw new PedidoInvalido("ja_possui");
  }
  const { catalogo, itens } = await calcular(comprador.usuario, oferta, produtos, bump);
  const pedido = await criarOuReusarPedido(db, { email, userId: comprador.usuario?.id ?? null }, oferta, itens);
  await salvarDadosComprador(db, pedido.id, comprador.nome, comprador.telefone);
  const ofertaTitulo = catalogo.ofertas.find((o) => o.codigo === oferta)?.titulo ?? "Pacote";
  const titulos = itens.itens.map((s) => tituloDe(catalogo, s));
  return {
    pedidoId: pedido.id,
    chaveBase: itens.chaveItens.split("+bump:")[0] ?? itens.chaveItens,
    valorCentavos: pedido.valorCentavos,
    descricao: `${ofertaTitulo}: ${titulos.join(", ")}`.slice(0, 250),
    pacote: titulos.length === 1 ? (titulos[0] ?? ofertaTitulo) : ofertaTitulo,
    email,
    nome: comprador.nome,
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

// Marcar ou desmarcar o bump cria outro pedido com os mesmos itens principais. Antes de cobrar este,
// o anterior não pode continuar pagável: se já foi pago ou está em análise, não cobra de novo; senão o
// Pix pendente dele é cancelado (se não der, confere de novo, porque pode ter sido pago agora) e o pedido sai.
async function resolverPedidosIrmaos(deps: ReturnType<typeof depsPagamento>, pedido: PedidoPronto): Promise<JaCobrado | null> {
  const db = clienteServico();
  for (const id of await pedidosIrmaosPendentes(db, pedido.email, pedido.chaveBase, pedido.pedidoId)) {
    const ja = await cobrancaExistente(deps, id, true);
    if (ja) return ja;
    const pixPendentes = (await deps.mp.pagamentosDoPedido(id)).filter((p) => p.payment_method_id === "pix" && p.status === "pending");
    for (const pix of pixPendentes) {
      if (!(await deps.mp.cancelarPagamento(pix.id))) {
        const depois = await cobrancaExistente(deps, id, false);
        if (depois) return depois;
      }
    }
    await cancelarPedidoPendente(db, id);
  }
  return null;
}

// agora: hora do servidor, para a tela ajustar o relógio do aparelho e contar a validade certa
export type PixGerado = { pedidoId: string; valorCentavos: number; pix: Pix; agora: string };

// Lembrete por e-mail: falha não interrompe a compra, só fica no log
async function lembrarPorEmail(pedido: PedidoPronto, pix: Pix): Promise<void> {
  try {
    await enviarEmailPix({
      para: pedido.email,
      nome: pedido.nome,
      pacote: pedido.pacote,
      valorTexto: formatarReais(pedido.valorCentavos),
      copiaECola: pix.copiaECola,
      qrBase64: pix.qrBase64,
      minutosValidade: MINUTOS_PIX,
      link: `${env().SITE_URL}/loja/pagamento/${pedido.pedidoId}/`,
      pixId: pix.id,
    });
  } catch (e) {
    console.error("email do pix", { pedidoId: pedido.pedidoId, erro: e instanceof Error ? e.message : "erro desconhecido" });
  }
}

async function cobrarPix(pedido: PedidoPronto): Promise<PixGerado | JaCobrado> {
  const deps = depsPagamento();
  // Se o pedido já foi pago ou tem cartão em análise, não gera cobrança nova. Pix pendente é reaproveitado.
  const ja = (await resolverPedidosIrmaos(deps, pedido)) ?? (await cobrancaExistente(deps, pedido.pedidoId, true));
  if (ja) return ja;
  const pix = await deps.mp.criarPix({
    ...pedido,
    nome: pedido.nome ? partesDoNome(pedido.nome) : null,
    urlNotificacao: urlNotificacao(),
    expiraEm: new Date(Date.now() + PIX_VALIDO_MS),
  });
  await lembrarPorEmail(pedido, pix);
  return { pedidoId: pedido.pedidoId, valorCentavos: pedido.valorCentavos, pix, agora: new Date().toISOString() };
}

export async function gerarPix(
  comprador: Comprador,
  oferta: string,
  produtos: string[],
  bump: string | null = null,
): Promise<PixGerado | JaCobrado | Falha> {
  try {
    return await cobrarPix(await prepararPedido(comprador, oferta, produtos, bump));
  } catch (e) {
    return tratar(e, "pix");
  }
}

export type PixDoPedido =
  | { situacao: "pago" }
  | { situacao: "aguardando"; pedidoId: string; pix: Pix; agora: string; valorCentavos: number; pacote: string }
  | { situacao: "vencido"; pedidoId: string; valorCentavos: number; pacote: string }
  | { situacao: "inexistente" };

// Página de pagamento aberta pelo e-mail: mostra o Pix ainda válido do pedido, ou diz que venceu
export async function pixDoPedido(pedidoId: string): Promise<PixDoPedido> {
  const p = await pedidoParaPix(clienteServico(), pedidoId);
  if (!p) return { situacao: "inexistente" };
  if (p.status === "pago") return { situacao: "pago" };
  if (p.status !== "pendente" && p.status !== "recusado") return { situacao: "inexistente" };
  const pacote = p.produtos.length === 1 ? (p.produtos[0] ?? p.ofertaTitulo) : p.ofertaTitulo;
  const deps = depsPagamento();
  const pagamentos = await deps.mp.pagamentosDoPedido(pedidoId);
  const aprovado = pagamentos.find((x) => x.status === "approved");
  if (aprovado) {
    const r = await liberarAprovado(deps, aprovado, pedidoId);
    if (r.situacao === "aprovado") return { situacao: "pago" };
  }
  const agora = Date.now();
  const valido = pagamentos.find(
    (x) =>
      x.payment_method_id === "pix" &&
      x.status === "pending" &&
      Boolean(x.point_of_interaction?.transaction_data?.qr_code) &&
      Boolean(x.date_of_expiration) &&
      Date.parse(x.date_of_expiration ?? "") > agora,
  );
  const dados = valido?.point_of_interaction?.transaction_data;
  if (valido && dados?.qr_code && dados.qr_code_base64) {
    return {
      situacao: "aguardando",
      pedidoId,
      valorCentavos: p.valorCentavos,
      pacote,
      agora: new Date(agora).toISOString(),
      pix: {
        id: valido.id,
        status: valido.status,
        copiaECola: dados.qr_code,
        qrBase64: dados.qr_code_base64,
        expiraEm: valido.date_of_expiration ?? null,
      },
    };
  }
  return { situacao: "vencido", pedidoId, valorCentavos: p.valorCentavos, pacote };
}

// Novo código para um pedido cujo Pix venceu: mesmo valor gravado, mesmo e-mail e nome
export async function renovarPix(pedidoId: string): Promise<PixGerado | JaCobrado | Falha> {
  try {
    const p = await pedidoParaPix(clienteServico(), pedidoId);
    if (!p || (p.status !== "pendente" && p.status !== "recusado")) return { motivo: "falha" };
    const pacote = p.produtos.length === 1 ? (p.produtos[0] ?? p.ofertaTitulo) : p.ofertaTitulo;
    return await cobrarPix({
      pedidoId,
      chaveBase: p.chaveItens.split("+bump:")[0] ?? p.chaveItens,
      valorCentavos: p.valorCentavos,
      descricao: `${p.ofertaTitulo}: ${p.produtos.join(", ")}`.slice(0, 250),
      pacote,
      email: p.email,
      nome: p.nome ?? "",
    });
  } catch (e) {
    return tratar(e, "renovar pix");
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
  bump: string | null = null,
): Promise<ResultadoCartao> {
  try {
    const pedido = await prepararPedido(comprador, oferta, produtos, bump);
    // O valor mostrado no formulário tem de ser o mesmo do servidor; senão, a tela está desatualizada
    if (cartao.valorCentavos !== pedido.valorCentavos) return { motivo: "falha" };
    const deps = depsPagamento();

    // Nada de cobrança dupla: pedido já pago ou com cartão em análise não é cobrado de novo,
    // e o Pix pendente do mesmo pedido é cancelado antes do cartão (se não der, ele já foi pago)
    const ja = (await resolverPedidosIrmaos(deps, pedido)) ?? (await cobrancaExistente(deps, pedido.pedidoId, true));
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
