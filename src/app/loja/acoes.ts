"use server";

import { z } from "zod";
import { usuarioAtual } from "@/lib/auth/sessao";
import {
  gerarPix,
  MENSAGEM_FALHA_CHECKOUT,
  pagarComCartao,
  situacaoDoPedido,
  type Falha,
  type Situacao,
} from "@/lib/loja/checkout";
import { MENSAGEM_RECUSA } from "@/lib/loja/dominio";
import { ipDaRequisicao, permitir } from "@/lib/loja/limites";

// Ações do checkout no site. O cliente manda oferta, escolha, e-mail e (no cartão) o token do Mercado Pago;
// preço e regra saem do servidor.

const pedidoEntrada = z.object({
  oferta: z.string().regex(/^[a-z0-9-]{1,40}$/),
  produtos: z.array(z.string().regex(/^[a-z0-9-]{1,60}$/)).max(20),
  email: z.email().max(254),
});

type Entrada = { oferta: string; produtos: string; email: string };

function mensagem(f: Falha): string {
  return f.motivo === "falha" ? MENSAGEM_FALHA_CHECKOUT : MENSAGEM_RECUSA[f.motivo];
}

async function validar(e: Entrada) {
  const usuario = await usuarioAtual();
  const dados = pedidoEntrada.safeParse({
    oferta: e.oferta,
    produtos: e.produtos.split(",").filter(Boolean),
    email: usuario?.email ?? e.email.trim().toLowerCase(),
  });
  if (!dados.success) {
    const emailRuim = dados.error.issues.some((i) => i.path[0] === "email");
    return { erro: emailRuim ? "Digite um e-mail válido. É nele que o acesso vai chegar." : "Escolha uma oferta válida." };
  }
  // Visitante cria pedido e cobrança no Mercado Pago a cada tentativa: limite por IP contra abuso
  if (!usuario && !(await permitir(`checkout-ip:${await ipDaRequisicao()}`, 20))) {
    return { erro: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo." };
  }
  return { usuario, dados: dados.data };
}

export type RespostaPix =
  | { ok: true; pedidoId: string; copiaECola: string; qrBase64: string; expiraEm: string | null }
  | { ok: false; erro: string };

export async function acaoGerarPix(e: Entrada): Promise<RespostaPix> {
  const v = await validar(e);
  if ("erro" in v) return { ok: false, erro: v.erro ?? MENSAGEM_FALHA_CHECKOUT };
  const r = await gerarPix({ usuario: v.usuario, email: v.dados.email }, v.dados.oferta, v.dados.produtos);
  if ("motivo" in r) return { ok: false, erro: mensagem(r) };
  return { ok: true, pedidoId: r.pedidoId, copiaECola: r.pix.copiaECola, qrBase64: r.pix.qrBase64, expiraEm: r.pix.expiraEm };
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
  const doc = c.data.payer?.identification;
  const r = await pagarComCartao({ usuario: v.usuario, email: v.dados.email }, v.dados.oferta, v.dados.produtos, {
    token: c.data.token,
    parcelas: c.data.installments,
    metodo: c.data.payment_method_id,
    emissor: c.data.issuer_id ?? null,
    valorCentavos: Math.round(c.data.transaction_amount * 100),
    documento: doc?.type && doc.number ? { tipo: doc.type, numero: doc.number.replace(/\D/g, "") } : null,
  });
  if ("motivo" in r) return { ok: false, erro: mensagem(r) };
  if (r.situacao === "recusado") {
    return {
      ok: false,
      erro: (r.detalhe && RECUSA_CARTAO[r.detalhe]) ?? "O pagamento com cartão foi recusado. Tente outro cartão ou pague com Pix.",
    };
  }
  return { ok: true, situacao: r.situacao, pedidoId: r.pedidoId };
}

const uuid = z.uuid();

export async function acaoSituacao(pedidoId: string): Promise<Situacao> {
  if (!uuid.safeParse(pedidoId).success) return "outro";
  return situacaoDoPedido(pedidoId);
}
