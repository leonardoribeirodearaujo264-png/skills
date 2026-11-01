"use server";

import { after } from "next/server";
import { z } from "zod";
import { usuarioAtual } from "@/lib/auth/sessao";
import {
  gerarPix,
  MENSAGEM_FALHA_CHECKOUT,
  pagarComCartao,
  previaCompra,
  renovarPix,
  situacaoDoPedido,
  type Falha,
  type PixGerado,
  type Situacao,
} from "@/lib/loja/checkout";
import { validarComprador, type ErrosComprador } from "@/lib/loja/comprador";
import { MENSAGEM_RECUSA } from "@/lib/loja/dominio";
import { ipDaRequisicao, permitir } from "@/lib/loja/limites";
import { pedidoParaMeta } from "@/lib/loja/repositorio";
import { clienteServico } from "@/lib/supabase/clientes";
import { ID_EVENTO_NAVEGADOR } from "@/lib/meta/pixel";
import { contextoDoNavegador, registrarEventoMeta, urlDoSite } from "@/lib/meta/servidor";

// Ações do checkout no site. O cliente manda oferta, escolha, nome, e-mail, telefone e (no cartão) o token do
// Mercado Pago. Os dados são validados de novo aqui; preço e pacote saem sempre do servidor.

const escolhaEntrada = z.object({
  oferta: z.string().regex(/^[a-z0-9-]{1,40}$/),
  produtos: z.array(z.string().regex(/^[a-z0-9-]{1,60}$/)).max(20),
  // ofertas complementares marcadas no checkout (separadas por vírgula). O preço é sempre o do banco.
  bumps: z.array(z.string().regex(/^[a-z0-9-]{1,60}$/)).max(10),
});

// eventoPagamento: event_id do AddPaymentInfo que o navegador já mandou ao Pixel (o servidor repete com o mesmo id)
export type Entrada = { oferta: string; produtos: string; bumps: string; nome: string; email: string; telefone: string; eventoPagamento?: string };

function mensagem(f: Falha): string {
  return f.motivo === "falha" ? MENSAGEM_FALHA_CHECKOUT : MENSAGEM_RECUSA[f.motivo];
}

async function validar(e: Entrada) {
  const usuario = await usuarioAtual();
  const escolha = escolhaEntrada.safeParse({
    oferta: e.oferta,
    produtos: e.produtos.split(",").filter(Boolean),
    bumps: e.bumps.split(",").filter(Boolean),
  });
  if (!escolha.success) return { erro: "Escolha uma oferta válida." };
  // Com sessão, o e-mail é o da conta; nome e telefone sempre vêm do formulário
  const comprador = validarComprador({ nome: e.nome, email: usuario?.email ?? e.email, telefone: e.telefone });
  if (!comprador.ok) return { erro: "Confira os campos destacados.", campos: comprador.erros };
  // Visitante cria pedido e cobrança no Mercado Pago a cada tentativa: limite por IP contra abuso
  if (!usuario && !(await permitir(`checkout-ip:${await ipDaRequisicao()}`, 20))) {
    return { erro: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo." };
  }
  return { usuario, escolha: escolha.data, comprador: comprador.dados };
}

type Validado = Exclude<Awaited<ReturnType<typeof validar>>, { erro: string }>;

// AddPaymentInfo na API de Conversões, depois da resposta: não atrasa nem derruba o Pix ou o cartão.
// Itens calculados no servidor (combo e ofertas fixas não trazem os pacotes na URL).
async function avisarPagamentoMeta(e: Entrada, v: Validado): Promise<void> {
  try {
    if (!e.eventoPagamento || !ID_EVENTO_NAVEGADOR.test(e.eventoPagamento)) return;
    const id = e.eventoPagamento;
    const contexto = await contextoDoNavegador();
    const url = urlDoSite("/loja/checkout/");
    after(() =>
      registrarEventoMeta(async () => {
        const previa = await previaCompra(v.usuario, v.escolha.oferta, v.escolha.produtos);
        const base = "motivo" in previa ? v.escolha.produtos : previa.itens.map((i) => i.slug);
        return {
          nome: "AddPaymentInfo",
          id,
          quando: new Date(),
          url,
          usuario: { ...contexto, email: v.comprador.email, telefone: v.comprador.telefone, nome: v.comprador.nome },
          conteudos: [...base, ...v.escolha.bumps],
        };
      }),
    );
  } catch (erro) {
    console.error("meta pagamento", erro instanceof Error ? erro.message : "erro desconhecido");
  }
}

export type PixNaTela = { pedidoId: string; copiaECola: string; qrBase64: string; expiraEm: string | null; agora: string };

export type RespostaPix =
  | ({ ok: true } & PixNaTela)
  | { ok: true; situacao: "aprovado" | "em_analise"; pedidoId: string }
  | { ok: false; erro: string; campos?: ErrosComprador };

function paraTela(r: PixGerado): PixNaTela {
  return { pedidoId: r.pedidoId, copiaECola: r.pix.copiaECola, qrBase64: r.pix.qrBase64, expiraEm: r.pix.expiraEm, agora: r.agora };
}

export async function acaoGerarPix(e: Entrada): Promise<RespostaPix> {
  const v = await validar(e);
  if ("erro" in v) return { ok: false, erro: v.erro ?? MENSAGEM_FALHA_CHECKOUT, campos: "campos" in v ? v.campos : undefined };
  await avisarPagamentoMeta(e, v);
  const r = await gerarPix({ usuario: v.usuario, ...v.comprador }, v.escolha.oferta, v.escolha.produtos, v.escolha.bumps);
  if ("motivo" in r) return { ok: false, erro: mensagem(r) };
  // Pedido já pago ou com cartão em análise: não gera outra cobrança
  if ("situacao" in r) return { ok: true, situacao: r.situacao, pedidoId: r.pedidoId };
  return { ok: true, ...paraTela(r) };
}

const uuidEntrada = z.uuid();

// Pix vencido: novo código para o mesmo pedido (mesmo valor gravado)
export async function acaoRenovarPix(pedidoId: string): Promise<RespostaPix> {
  if (!uuidEntrada.safeParse(pedidoId).success) return { ok: false, erro: MENSAGEM_FALHA_CHECKOUT };
  if (!(await permitir(`renovar-pix:${await ipDaRequisicao()}`, 20))) {
    return { ok: false, erro: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo." };
  }
  const r = await renovarPix(pedidoId);
  if ("motivo" in r) return { ok: false, erro: mensagem(r) };
  if ("situacao" in r) return { ok: true, situacao: r.situacao, pedidoId: r.pedidoId };
  return { ok: true, ...paraTela(r) };
}

const cartaoEntrada = z.object({
  token: z.string().min(8).max(100),
  installments: z.coerce.number().int().min(1).max(12),
  payment_method_id: z.string().regex(/^[a-z0-9_-]{2,30}$/),
  issuer_id: z.union([z.string(), z.number()]).transform(String).nullish(),
  transaction_amount: z.coerce.number().positive(),
  payer: z
    .object({
      email: z.string().optional(),
      identification: z.object({ type: z.string().max(10), number: z.string().max(20) }).optional(),
    })
    .optional(),
});

export type RespostaCartao =
  | { ok: true; situacao: "aprovado" | "em_analise"; pedidoId: string }
  | { ok: false; erro: string };

// Motivos comuns de recusa do cartão, em linguagem simples (status_detail do Mercado Pago)
const RECUSA_CARTAO: Record<string, string> = {
  cc_rejected_insufficient_amount: "O cartão não tem limite para esta compra.",
  cc_rejected_bad_filled_security_code: "O código de segurança não confere.",
  cc_rejected_bad_filled_date: "A validade do cartão não confere.",
  cc_rejected_bad_filled_other: "Algum dado do cartão não confere. Confira e tente de novo.",
  cc_rejected_call_for_authorize: "O banco pediu para você autorizar esta compra. Ligue para o banco ou use Pix.",
  cc_rejected_card_disabled: "Este cartão está desativado. Use outro cartão ou Pix.",
  cc_rejected_high_risk: "O pagamento foi recusado pela análise de segurança. Tente com Pix.",
  cc_rejected_duplicated_payment: "Você já fez um pagamento igual há pouco. Confira o seu e-mail.",
};

export async function acaoPagarCartao(e: Entrada, dadosCartao: unknown): Promise<RespostaCartao> {
  const v = await validar(e);
  if ("erro" in v) return { ok: false, erro: v.erro ?? MENSAGEM_FALHA_CHECKOUT };
  const c = cartaoEntrada.safeParse(dadosCartao);
  if (!c.success) return { ok: false, erro: "Os dados do cartão não chegaram certos. Tente de novo." };
  await avisarPagamentoMeta(e, v);
  const doc = c.data.payer?.identification;
  const r = await pagarComCartao({ usuario: v.usuario, ...v.comprador }, v.escolha.oferta, v.escolha.produtos, {
    token: c.data.token,
    parcelas: c.data.installments,
    metodo: c.data.payment_method_id,
    emissor: c.data.issuer_id ?? null,
    valorCentavos: Math.round(c.data.transaction_amount * 100),
    documento: doc?.type && doc.number ? { tipo: doc.type, numero: doc.number.replace(/\D/g, "") } : null,
  }, v.escolha.bumps);
  if ("motivo" in r) return { ok: false, erro: mensagem(r) };
  if (r.situacao === "recusado") {
    return {
      ok: false,
      erro: (r.detalhe && RECUSA_CARTAO[r.detalhe]) ?? "O pagamento com cartão foi recusado. Tente outro cartão ou pague com Pix.",
    };
  }
  return { ok: true, situacao: r.situacao, pedidoId: r.pedidoId };
}

export async function acaoSituacao(pedidoId: string): Promise<Situacao> {
  if (!uuidEntrada.safeParse(pedidoId).success) return "outro";
  // A tela consulta a cada 5 s; o limite por IP só barra abuso
  if (!(await permitir(`situacao-ip:${await ipDaRequisicao()}`, 2000))) return "outro";
  return situacaoDoPedido(pedidoId);
}

const iniciarEntrada = z.object({
  eventoId: z.string().regex(ID_EVENTO_NAVEGADOR),
  oferta: z.string().regex(/^[a-z0-9-]{1,40}$/),
  produtos: z.string().max(400),
});

// InitiateCheckout na API de Conversões, com o mesmo event_id que o navegador mandou ao Pixel. Valor e itens
// saem do servidor; a pessoa ainda não digitou nada, então vão só IP, navegador e cookies do Pixel.
// Evento de anúncio: qualquer falha aqui só fica no log.
export async function acaoIniciarCheckout(eventoId: unknown, oferta: unknown, produtos: unknown): Promise<void> {
  try {
    const e = iniciarEntrada.safeParse({ eventoId, oferta, produtos });
    if (!e.success) return;
    const escolha = escolhaEntrada.safeParse({ oferta: e.data.oferta, produtos: e.data.produtos.split(",").filter(Boolean), bumps: [] });
    if (!escolha.success) return;
    if (!(await permitir(`meta-checkout-ip:${await ipDaRequisicao()}`, 60))) return;
    const usuario = await usuarioAtual();
    const contexto = await contextoDoNavegador();
    const url = urlDoSite("/loja/checkout/");
    after(() =>
      registrarEventoMeta(async () => {
        const previa = await previaCompra(usuario, escolha.data.oferta, escolha.data.produtos);
        if ("motivo" in previa) return null;
        return {
          nome: "InitiateCheckout",
          id: e.data.eventoId,
          quando: new Date(),
          url,
          usuario: { ...contexto, email: usuario?.email ?? null },
          valorCentavos: previa.valorCentavos,
          conteudos: previa.itens.map((i) => i.slug),
        };
      }),
    );
  } catch (erro) {
    console.error("meta checkout", erro instanceof Error ? erro.message : "erro desconhecido");
  }
}

// Valor e pacotes da compra paga para o Purchase do Pixel: vêm do pedido no banco, não da tela
// (o pedido aprovado pode ser um anterior, sem o bump que a pessoa marcou depois)
export async function acaoCompraMeta(pedidoId: unknown): Promise<{ valorCentavos: number; conteudos: string[] } | null> {
  try {
    const id = uuidEntrada.safeParse(pedidoId);
    if (!id.success) return null;
    if (!(await permitir(`meta-compra-ip:${await ipDaRequisicao()}`, 120))) return null;
    const p = await pedidoParaMeta(clienteServico(), id.data);
    return p && p.status === "pago" ? { valorCentavos: p.valorCentavos, conteudos: p.slugs } : null;
  } catch (erro) {
    console.error("meta compra navegador", erro instanceof Error ? erro.message : "erro desconhecido");
    return null;
  }
}
