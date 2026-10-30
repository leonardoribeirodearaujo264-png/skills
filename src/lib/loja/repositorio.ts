import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Catalogo, ItensDoPedido } from "./dominio";
import type { PedidoSalvo, RepoPagamento } from "./pagamento";

const VIOLA_UNICA = "23505";

export class ErroBanco extends Error {
  constructor(
    readonly operacao: string,
    readonly codigo: string | null,
  ) {
    super(`Banco: ${operacao} (${codigo ?? "sem código"})`);
    this.name = "ErroBanco";
  }
}

function falhar(operacao: string, e: PostgrestError): never {
  throw new ErroBanco(operacao, e.code ?? null);
}

// Linhas validadas na fronteira com o banco
const linhaProduto = z.object({
  slug: z.string(),
  titulo: z.string(),
  resumo: z.string(),
  ordem: z.number(),
  github_url: z.string().nullable(),
  preco_avulso_centavos: z.number().int().nullable(),
  destaques: z.array(z.string()),
  qtd_skills: z.number(),
  qtd_agentes: z.number(),
  qtd_prompts: z.number(),
  aula_duracao_s: z.number().nullable(),
});
const COLUNAS_PRODUTO = "slug, titulo, resumo, ordem, github_url, preco_avulso_centavos, destaques, qtd_skills, qtd_agentes, qtd_prompts, aula_duracao_s";
const linhaOferta = z.object({
  codigo: z.string(),
  titulo: z.string(),
  descricao: z.string(),
  tipo: z.enum(["escolha", "fixa", "todos"]),
  qtd_escolha: z.number().nullable(),
  preco_centavos: z.number().int(),
  exige_cliente: z.boolean(),
  ordem: z.number(),
  loja_oferta_itens: z.array(z.object({ produto_slug: z.string() })),
});
const linhaPedido = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  status: z.enum(["pendente", "pago", "recusado", "cancelado", "reembolsado"]),
  valor_centavos: z.number().int(),
  mp_payment_id: z.string().nullable(),
});

// Vitrine: funciona com o cliente público (RLS só mostra o que está ativo)
export async function carregarCatalogo(db: SupabaseClient): Promise<Catalogo> {
  const [p, o] = await Promise.all([
    db.from("loja_produtos").select(COLUNAS_PRODUTO).eq("ativo", true).order("ordem"),
    db
      .from("loja_ofertas")
      .select("codigo, titulo, descricao, tipo, qtd_escolha, preco_centavos, exige_cliente, ordem, loja_oferta_itens(produto_slug)")
      .eq("ativo", true)
      .order("ordem"),
  ]);
  if (p.error) falhar("ler produtos", p.error);
  if (o.error) falhar("ler ofertas", o.error);
  return {
    produtos: z.array(linhaProduto).parse(p.data).map((r) => ({
      slug: r.slug,
      titulo: r.titulo,
      resumo: r.resumo,
      ordem: r.ordem,
      githubUrl: r.github_url,
      precoAvulsoCentavos: r.preco_avulso_centavos,
      destaques: r.destaques,
      qtdSkills: r.qtd_skills,
      qtdAgentes: r.qtd_agentes,
      qtdPrompts: r.qtd_prompts,
      aulaDuracaoS: r.aula_duracao_s,
    })),
    ofertas: z.array(linhaOferta).parse(o.data).map((r) => ({
      codigo: r.codigo,
      titulo: r.titulo,
      descricao: r.descricao,
      tipo: r.tipo,
      qtdEscolha: r.qtd_escolha,
      precoCentavos: r.preco_centavos,
      exigeCliente: r.exige_cliente,
      ordem: r.ordem,
      itens: r.loja_oferta_itens.map((i) => i.produto_slug),
    })),
  };
}

// Funções abaixo usam o cliente de serviço

export async function acessosAtivos(db: SupabaseClient, userId: string): Promise<Set<string>> {
  const { data, error } = await db
    .from("loja_acessos")
    .select("produto_slug")
    .eq("user_id", userId)
    .is("revogado_em", null);
  if (error) falhar("ler acessos", error);
  return new Set(z.array(z.object({ produto_slug: z.string() })).parse(data).map((r) => r.produto_slug));
}

export type PedidoAberto = { id: string; valorCentavos: number };

// Cria o pedido pendente e os itens numa transação (loja_criar_pedido). O duplo clique devolve o mesmo
// pedido; se o preço mudou desde o pendente anterior, a função cancela o antigo e cria outro.
export async function criarOuReusarPedido(
  db: SupabaseClient,
  userId: string,
  codigoOferta: string,
  pedido: ItensDoPedido,
): Promise<PedidoAberto> {
  const { data, error } = await db.rpc("loja_criar_pedido", {
    p_user: userId,
    p_oferta: codigoOferta,
    p_valor_centavos: pedido.valorCentavos,
    p_chave: pedido.chaveItens,
    p_itens: pedido.itens,
  });
  if (error) falhar("criar pedido", error);
  const r = z
    .array(z.object({ pedido_id: z.uuid(), valor_centavos: z.number().int() }))
    .length(1)
    .parse(data)[0]!;
  return { id: r.pedido_id, valorCentavos: r.valor_centavos };
}

export async function salvarPreferencia(db: SupabaseClient, pedidoId: string, preferenceId: string): Promise<void> {
  const { error } = await db
    .from("loja_pedidos")
    .update({ mp_preference_id: preferenceId, atualizado_em: new Date().toISOString() })
    .eq("id", pedidoId);
  if (error) falhar("salvar preferência", error);
}

const SETE_DIAS_MS = 7 * 24 * 60 * 60_000;

// Pendentes e recusados recentes (o cliente pode ter pago com outro cartão na mesma preferência),
// dos menos verificados para os mais verificados, para nenhum pedido ficar sempre fora do lote.
export async function pedidosParaReconciliar(db: SupabaseClient, minutos: number, limite = 50): Promise<string[]> {
  const agora = Date.now();
  const { data, error } = await db
    .from("loja_pedidos")
    .select("id")
    .in("status", ["pendente", "recusado"])
    .lt("criado_em", new Date(agora - minutos * 60_000).toISOString())
    .gt("criado_em", new Date(agora - SETE_DIAS_MS).toISOString())
    .order("atualizado_em", { ascending: true })
    .limit(limite);
  if (error) falhar("ler pedidos para reconciliar", error);
  return z.array(z.object({ id: z.uuid() })).parse(data).map((r) => r.id);
}

export async function marcarVerificado(db: SupabaseClient, pedidoId: string): Promise<void> {
  const { error } = await db.from("loja_pedidos").update({ atualizado_em: new Date().toISOString() }).eq("id", pedidoId);
  if (error) falhar("marcar verificado", error);
}

// Carrinho abandonado há mais de 7 dias deixa de ser pendente
export async function expirarPendentes(db: SupabaseClient): Promise<void> {
  const { error } = await db
    .from("loja_pedidos")
    .update({ status: "cancelado", atualizado_em: new Date().toISOString() })
    .eq("status", "pendente")
    .lt("criado_em", new Date(Date.now() - SETE_DIAS_MS).toISOString());
  if (error) falhar("expirar pendentes", error);
}

// Trava do e-mail de acesso: um único UPDATE condicional, então só uma chamada concorrente ganha
export async function reservarEmailAcesso(db: SupabaseClient, pedidoId: string): Promise<string | null> {
  const { data, error } = await db
    .from("loja_pedidos")
    .update({ email_acesso_enviado_em: new Date().toISOString() })
    .eq("id", pedidoId)
    .eq("status", "pago")
    .is("email_acesso_enviado_em", null)
    .select("user_id");
  if (error) falhar("reservar e-mail de acesso", error);
  const linhas = z.array(z.object({ user_id: z.uuid() })).parse(data);
  return linhas[0]?.user_id ?? null;
}

export async function liberarReservaEmail(db: SupabaseClient, pedidoId: string): Promise<void> {
  const { error } = await db.from("loja_pedidos").update({ email_acesso_enviado_em: null }).eq("id", pedidoId);
  if (error) falhar("liberar reserva de e-mail", error);
}

// Registra a notificação. Devolve false se o mesmo x-request-id já chegou antes.
export async function registrarEvento(
  db: SupabaseClient,
  e: { requestId: string; tipo: string; acao: string | null; recursoId: string },
): Promise<boolean> {
  const { error } = await db
    .from("loja_eventos_webhook")
    .insert({ request_id: e.requestId, tipo: e.tipo, acao: e.acao, recurso_id: e.recursoId });
  if (!error) return true;
  if (error.code === VIOLA_UNICA) return false;
  falhar("registrar evento", error);
}

export async function concluirEvento(db: SupabaseClient, requestId: string, resultado: string): Promise<void> {
  const { error } = await db.from("loja_eventos_webhook").update({ resultado }).eq("request_id", requestId);
  if (error) falhar("concluir evento", error);
}

export function repoPagamento(db: SupabaseClient): RepoPagamento {
  return {
    async pedidoPorId(id): Promise<PedidoSalvo | null> {
      const { data, error } = await db
        .from("loja_pedidos")
        .select("id, user_id, status, valor_centavos, mp_payment_id")
        .eq("id", id)
        .maybeSingle();
      if (error) falhar("ler pedido", error);
      if (!data) return null;
      const r = linhaPedido.parse(data);
      return {
        id: r.id,
        userId: r.user_id,
        status: r.status,
        valorCentavos: r.valor_centavos,
        mpPaymentId: r.mp_payment_id,
      };
    },
    async liberar(pedidoId, paymentId, valorCentavos) {
      const { data, error } = await db.rpc("loja_liberar_pedido", {
        p_pedido: pedidoId,
        p_payment_id: paymentId,
        p_valor_centavos: valorCentavos,
      });
      if (error) falhar("liberar pedido", error);
      return z.string().parse(data);
    },
    async estornar(pedidoId, paymentId) {
      const { data, error } = await db.rpc("loja_estornar_pagamento", { p_pedido: pedidoId, p_payment_id: paymentId });
      if (error) falhar("estornar pagamento", error);
      return z.string().parse(data);
    },
    async marcarRecusado(pedidoId) {
      const { error } = await db
        .from("loja_pedidos")
        .update({ status: "recusado", atualizado_em: new Date().toISOString() })
        .eq("id", pedidoId)
        .eq("status", "pendente");
      if (error) falhar("marcar recusado", error);
    },
  };
}
