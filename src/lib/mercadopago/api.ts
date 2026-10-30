import { z } from "zod";

// Chamadas REST do Mercado Pago (Checkout Pro). Endpoints da documentação oficial:
// POST /checkout/preferences e GET /v1/payments/{id}, com Authorization: Bearer <access token>.
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

export type NovaPreferencia = {
  pedidoId: string;
  titulo: string;
  valorCentavos: number;
  emailComprador: string;
  urlRetorno: string;
  urlNotificacao: string;
};

const respostaPreferencia = z.object({
  id: z.string(),
  init_point: z.url(),
  sandbox_init_point: z.url().optional(),
});
export type Preferencia = z.infer<typeof respostaPreferencia>;

const respostaPagamento = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  status: z.string(),
  status_detail: z.string().nullish(),
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
  criarPreferencia(p: NovaPreferencia): Promise<Preferencia>;
  buscarPagamento(id: string): Promise<Pagamento | null>;
  pagamentosDoPedido(pedidoId: string): Promise<Pagamento[]>;
};

export function criarClienteMercadoPago(accessToken: string, fetchImpl: typeof fetch = fetch): ClienteMercadoPago {
  async function chamar(operacao: string, caminho: string, init: RequestInit = {}): Promise<Response> {
    const r = await fetchImpl(`${BASE}${caminho}`, {
      ...init,
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...init.headers },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    return r;
  }

  return {
    async criarPreferencia(p) {
      const corpo = {
        items: [
          { id: p.pedidoId, title: p.titulo, quantity: 1, currency_id: "BRL", unit_price: p.valorCentavos / 100 },
        ],
        payer: { email: p.emailComprador },
        external_reference: p.pedidoId,
        back_urls: { success: p.urlRetorno, pending: p.urlRetorno, failure: p.urlRetorno },
        // Notificação e retorno automático exigem endereço público. Em localhost o comprador volta pelo
        // botão e a página de retorno consulta o pagamento direto na API.
        ...(p.urlNotificacao.startsWith("https://") ? { notification_url: p.urlNotificacao } : {}),
        ...(p.urlRetorno.startsWith("https://") ? { auto_return: "approved" } : {}),
        statement_descriptor: "PACOTES SKILLS",
      };
      // A chave de idempotência evita duas preferências se a requisição for repetida
      const r = await chamar("criar preferência", "/checkout/preferences", {
        method: "POST",
        body: JSON.stringify(corpo),
        headers: { "X-Idempotency-Key": p.pedidoId },
      });
      if (!r.ok) throw new ErroMercadoPago("criar preferência", r.status, await motivoDoErro(r));
      return respostaPreferencia.parse(await r.json());
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
