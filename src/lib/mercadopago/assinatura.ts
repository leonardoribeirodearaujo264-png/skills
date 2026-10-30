import { createHmac, timingSafeEqual } from "node:crypto";

// Validação do header x-signature das notificações Webhooks do Mercado Pago.
// x-signature = "ts=<timestamp>,v1=<hmac>". O manifest assinado é
// "id:<data.id da query>;request-id:<x-request-id>;ts:<ts>;", omitindo o par que não vier.
// HMAC-SHA256 com a chave secreta do painel (Suas integrações > Webhooks), em hexadecimal.

export type EntradaAssinatura = {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  segredo: string;
};

// Sem janela de tempo no ts: a documentação não define uma e um reenvio legítimo não pode ser perdido.
// Repetir uma notificação válida é inofensivo, porque a liberação consulta a API e é idempotente.
export type ResultadoAssinatura = { valida: true } | { valida: false; motivo: string };

function lerPartes(cabecalho: string): { ts?: string; v1?: string } {
  const partes: Record<string, string> = {};
  for (const pedaco of cabecalho.split(",")) {
    const i = pedaco.indexOf("=");
    if (i > 0) partes[pedaco.slice(0, i).trim()] = pedaco.slice(i + 1).trim();
  }
  return { ts: partes.ts, v1: partes.v1 };
}

export function montarManifest(dataId: string | null, xRequestId: string | null, ts: string): string {
  // O Mercado Pago assina o data.id em minúsculas quando é alfanumérico
  const campos: [string, string | null][] = [
    ["id", dataId ? dataId.toLowerCase() : null],
    ["request-id", xRequestId],
    ["ts", ts],
  ];
  return campos
    .filter((c): c is [string, string] => Boolean(c[1]))
    .map(([nome, valor]) => `${nome}:${valor};`)
    .join("");
}

export function validarAssinatura(e: EntradaAssinatura): ResultadoAssinatura {
  if (!e.xSignature) return { valida: false, motivo: "sem_assinatura" };
  const { ts, v1 } = lerPartes(e.xSignature);
  if (!ts || !v1 || !/^\d+$/.test(ts) || !/^[0-9a-f]{64}$/i.test(v1)) return { valida: false, motivo: "formato" };

  const esperada = createHmac("sha256", e.segredo).update(montarManifest(e.dataId, e.xRequestId, ts)).digest();
  const recebida = Buffer.from(v1, "hex");
  if (recebida.length !== esperada.length || !timingSafeEqual(recebida, esperada)) {
    return { valida: false, motivo: "assinatura" };
  }
  return { valida: true };
}
