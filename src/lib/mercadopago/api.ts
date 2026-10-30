import { z } from "zod";

// Chamadas REST do Mercado Pago (pagamento direto no site: Pix e cartão). Endpoints da documentação oficial:
// POST /v1/payments (com X-Idempotency-Key), PUT /v1/payments/{id} (cancelar pendente),
// GET /v1/payments/{id} e GET /v1/payments/search, com Authorization: Bearer <access token>.
const BASE = "https://api.mercadopago.com";

export class ErroMercadoPago extends Error {
  constructor(
    readonly operacao: string,
    readonly status: number,
    detalhe = "",
  ) {
    super(`Mercado Pago ${operacao}: HTTP ${status}${detalhe ? ` (${detalhe})` : ""}`);
    this.name = "ErroMercadoPago";
  }
}

type BaseCobranca = {
  pedidoId: string;
  valorCentavos: number;
  descricao: string;
  email: string;
  urlNotificacao: string;
};

export type NovoPix = BaseCobranca & { expiraEm: Date; nome: { primeiro: string; sobrenome: string } | null };

export type NovoCartao = BaseCobranca & {
  token: string;
  parcelas: number;
  metodo: string;
  emissor: string | null;
  documento: { tipo: string; numero: string } | null;
  idempotencia: string;
};

const respostaPix = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  status: z.string(),
  date_of_expiration: z.string().nullish(),
  point_of_interaction: z.object({
    transaction_data: z.object({ qr_code: z.string(), qr_code_base64: z.string() }),
  }),
});
export type Pix = { id: string; status: string; copiaECola: string; qrBase64: string; expiraEm: string | null };

const respostaPagamento = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  status: z.string(),
  status_detail: z.string().nullish(),
  payment_method_id: z.string().nullish(),
  date_of_expiration: z.string().nullish(),
  // QR do Pix ainda pendente, para mostrar de novo na página de pagamento
  point_of_interaction: z
    .object({ transaction_data: z.object({ qr_code: z.string().nullish(), qr_code_base64: z.string().nullish() }).nullish() })
    .nullish(),
  external_reference: z.string().nullish(),
  transaction_amount: z.number(),
  currency_id: z.string(),
});
export type Pagamento = z.infer<typeof respostaPagamento>;

const respostaBusca = z.object({ results: z.array(respostaPagamento) });

// Só o campo "message" da resposta de erro, curto, para o log
async function motivoDoErro(r: Response): Promise<string> {
  try {
    const j: unknown = await r.json();
    const m = typeof j === "object" && j !== null && "message" in j ? String(j.message) : "";
    return m.slice(0, 200);
  } catch {
    return "";
  }
}

export type ClienteMercadoPago = {
  criarPix(p: NovoPix): Promise<Pix>;
  pagarComCartao(p: NovoCartao): Promise<Pagamento>;
  // Cancela um pagamento ainda pendente (Pix não pago). Devolve false se ele não pode mais ser cancelado.
  cancelarPagamento(id: string): Promise<boolean>;
  buscarPagamento(id: string): Promise<Pagamento | null>;
  pagamentosDoPedido(pedidoId: string): Promise<Pagamento[]>;
};

export function criarClienteMercadoPago(accessToken: string, fetchImpl: typeof fetch = fetch): ClienteMercadoPago {
  async function chamar(operacao: string, caminho: string, init: RequestInit = {}): Promise<Response> {
    return fetchImpl(`${BASE}${caminho}`, {
      ...init,
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...init.headers },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
  }

  async function criarPixComChave(p: NovoPix, chave: string): Promise<Pix> {
    const corpo = {
      transaction_amount: p.valorCentavos / 100,
      description: p.descricao,
      payment_method_id: "pix",
      payer: {
        email: p.email,
        ...(p.nome ? { first_name: p.nome.primeiro, last_name: p.nome.sobrenome } : {}),
      },
      external_reference: p.pedidoId,
      date_of_expiration: p.expiraEm.toISOString(),
      // Notificação só com endereço público; em localhost a tela consulta o pagamento direto
      ...(p.urlNotificacao.startsWith("https://") ? { notification_url: p.urlNotificacao } : {}),
    };
    const r = await chamar("criar Pix", "/v1/payments", {
      method: "POST",
      body: JSON.stringify(corpo),
      headers: { "X-Idempotency-Key": chave },
    });
    if (!r.ok) throw new ErroMercadoPago("criar Pix", r.status, await motivoDoErro(r));
    const j = respostaPix.parse(await r.json());
    return {
      id: j.id,
      status: j.status,
      copiaECola: j.point_of_interaction.transaction_data.qr_code,
      qrBase64: j.point_of_interaction.transaction_data.qr_code_base64,
      expiraEm: j.date_of_expiration ?? null,
    };
  }

  return {
    async criarPix(p) {
      // Mesmo pedido, mesma chave: clicar duas vezes devolve o mesmo Pix em vez de criar outro.
      // Se o Pix devolvido já venceu, foi cancelado ou vence em menos de 3 min, gera outro com chave nova.
      const primeiro = await criarPixComChave(p, `pix-${p.pedidoId}`);
      const vence = primeiro.expiraEm ? Date.parse(primeiro.expiraEm) : Infinity;
      if (primeiro.status === "pending" && vence > Date.now() + 3 * 60_000) return primeiro;
      return criarPixComChave(p, `pix-${p.pedidoId}-${Date.now()}`);
    },

    async pagarComCartao(p) {
      const corpo = {
        transaction_amount: p.valorCentavos / 100,
        description: p.descricao,
        token: p.token,
        installments: p.parcelas,
        payment_method_id: p.metodo,
        ...(p.emissor ? { issuer_id: p.emissor } : {}),
        payer: {
          email: p.email,
          ...(p.documento ? { identification: { type: p.documento.tipo, number: p.documento.numero } } : {}),
        },
        external_reference: p.pedidoId,
        statement_descriptor: "PACOTES SKILLS",
        ...(p.urlNotificacao.startsWith("https://") ? { notification_url: p.urlNotificacao } : {}),
      };
      const r = await chamar("pagar com cartão", "/v1/payments", {
        method: "POST",
        body: JSON.stringify(corpo),
        headers: { "X-Idempotency-Key": p.idempotencia },
      });
      if (!r.ok) throw new ErroMercadoPago("pagar com cartão", r.status, await motivoDoErro(r));
      return respostaPagamento.parse(await r.json());
    },

    async cancelarPagamento(id) {
      if (!/^\d+$/.test(id)) return false;
      const r = await chamar("cancelar pagamento", `/v1/payments/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "cancelled" }),
      });
      return r.ok;
    },

    async buscarPagamento(id) {
      if (!/^\d+$/.test(id)) return null;
      const r = await chamar("consultar pagamento", `/v1/payments/${id}`);
      if (r.status === 404) return null;
      if (!r.ok) throw new ErroMercadoPago("consultar pagamento", r.status);
      return respostaPagamento.parse(await r.json());
    },

    async pagamentosDoPedido(pedidoId) {
      const q = new URLSearchParams({ external_reference: pedidoId, sort: "date_created", criteria: "desc" });
      const r = await chamar("buscar pagamentos", `/v1/payments/search?${q}`);
      if (!r.ok) throw new ErroMercadoPago("buscar pagamentos", r.status);
      return respostaBusca.parse(await r.json()).results;
    },
  };
}
