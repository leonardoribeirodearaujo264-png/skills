import { z } from "zod";

// Envio de e-mail pela API do Resend (POST https://api.resend.com/emails, Authorization: Bearer).
// A chave de idempotência evita e-mail repetido quando a mesma operação roda de novo (vale 24 h).

// Anexo em base64; com idConteudo ele vira imagem dentro do corpo (no HTML: <img src="cid:idConteudo">)
export type Anexo = { nome: string; base64: string; tipo: string; idConteudo?: string };

export type NovoEmail = {
  para: string;
  assunto: string;
  html: string;
  texto: string;
  idempotencia?: string;
  anexos?: Anexo[];
};

export class ErroEmail extends Error {
  constructor(readonly status: number, detalhe: string) {
    super(`Resend: HTTP ${status}${detalhe ? ` (${detalhe})` : ""}`);
    this.name = "ErroEmail";
  }
}

export async function enviarEmail(
  chave: string,
  remetente: string,
  e: NovoEmail,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const r = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chave}`,
      "Content-Type": "application/json",
      ...(e.idempotencia ? { "Idempotency-Key": e.idempotencia.slice(0, 256) } : {}),
    },
    body: JSON.stringify({
      from: remetente,
      to: [e.para],
      subject: e.assunto,
      html: e.html,
      text: e.texto,
      ...(e.anexos?.length
        ? {
            attachments: e.anexos.map((a) => ({
              filename: a.nome,
              content: a.base64,
              content_type: a.tipo,
              ...(a.idConteudo ? { content_id: a.idConteudo } : {}),
            })),
          }
        : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const corpo: unknown = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = typeof corpo === "object" && corpo !== null && "message" in corpo ? String(corpo.message).slice(0, 200) : "";
    throw new ErroEmail(r.status, msg);
  }
  return z.object({ id: z.string() }).parse(corpo).id;
}
