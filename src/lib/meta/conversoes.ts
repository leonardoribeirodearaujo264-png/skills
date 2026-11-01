import { createHash } from "node:crypto";
import { z } from "zod";

// API de Conversões da Meta (POST https://graph.facebook.com/<versão>/<pixel>/events, Authorization: Bearer).
// Cada evento leva o mesmo event_id do Pixel do navegador: a Meta junta os dois e conta uma vez só.
// Dados pessoais vão sempre em SHA-256, normalizados como a Meta pede.

export type NomeEventoMeta = "ViewContent" | "AddToCart" | "InitiateCheckout" | "AddPaymentInfo" | "Purchase";

export type DadosUsuario = {
  email?: string | null;
  telefone?: string | null;
  nome?: string | null;
  // id do pedido ou da conta, para a Meta ligar eventos da mesma pessoa
  idExterno?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

export type EventoMeta = {
  nome: NomeEventoMeta;
  id: string;
  quando: Date;
  url: string | null;
  usuario: DadosUsuario;
  valorCentavos?: number;
  conteudos?: string[];
};

export type ConfigMeta = { pixel: string; token: string; versao: string; codigoTeste?: string | null };

export class ErroMeta extends Error {
  constructor(readonly status: number, detalhe: string) {
    super(`Meta: HTTP ${status}${detalhe ? ` (${detalhe})` : ""}`);
    this.name = "ErroMeta";
  }
}

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

// Telefone com DDI: o checkout guarda só DDD + número, então números brasileiros ganham o 55
export function normalizarTelefone(t: string): string | null {
  const d = t.replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return d.length >= 12 && d.length <= 15 ? d : null;
}

function primeiroNome(n: string): string | null {
  const p = n.trim().toLowerCase().split(/\s+/)[0];
  return p ? p : null;
}

function dadosDoUsuario(u: DadosUsuario): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  const email = u.email?.trim().toLowerCase();
  if (email) out.em = [sha256(email)];
  const tel = u.telefone ? normalizarTelefone(u.telefone) : null;
  if (tel) out.ph = [sha256(tel)];
  const fn = u.nome ? primeiroNome(u.nome) : null;
  if (fn) out.fn = [sha256(fn)];
  if (u.idExterno) out.external_id = [sha256(u.idExterno)];
  // IP, navegador e cookies do Pixel vão sem hash, como a Meta pede
  if (u.ip && u.ip !== "desconhecido") out.client_ip_address = u.ip;
  if (u.userAgent) out.client_user_agent = u.userAgent;
  if (u.fbp) out.fbp = u.fbp;
  if (u.fbc) out.fbc = u.fbc;
  return out;
}

export function montarCorpo(c: ConfigMeta, eventos: EventoMeta[]): object {
  return {
    data: eventos.map((e) => ({
      event_name: e.nome,
      event_time: Math.floor(e.quando.getTime() / 1000),
      event_id: e.id,
      action_source: "website",
      ...(e.url ? { event_source_url: e.url } : {}),
      user_data: dadosDoUsuario(e.usuario),
      custom_data: {
        currency: "BRL",
        ...(e.valorCentavos !== undefined ? { value: e.valorCentavos / 100 } : {}),
        ...(e.conteudos?.length ? { content_ids: e.conteudos, content_type: "product", num_items: e.conteudos.length } : {}),
      },
    })),
    ...(c.codigoTeste ? { test_event_code: c.codigoTeste } : {}),
  };
}

export async function enviarEventos(c: ConfigMeta, eventos: EventoMeta[], fetchImpl: typeof fetch = fetch): Promise<number> {
  const r = await fetchImpl(`https://graph.facebook.com/${c.versao}/${c.pixel}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(montarCorpo(c, eventos)),
    signal: AbortSignal.timeout(5_000),
    cache: "no-store",
  });
  const corpo: unknown = await r.json().catch(() => ({}));
  if (!r.ok) {
    const erro = z.object({ error: z.object({ message: z.string() }) }).safeParse(corpo);
    throw new ErroMeta(r.status, erro.success ? erro.data.error.message.slice(0, 200) : "");
  }
  return z.object({ events_received: z.number() }).parse(corpo).events_received;
}
