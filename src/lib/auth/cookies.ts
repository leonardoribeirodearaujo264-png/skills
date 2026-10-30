// Nomes e opções dos cookies da sessão. Só o access e o refresh token, nunca o JSON da sessão (cabe em 4 KB).
// Em produção usa o prefixo __Host- (exige Secure, Path=/ e sem Domain).

const producao = process.env.NODE_ENV === "production";

export const COOKIE_ACESSO = producao ? "__Host-sb-at" : "sb-at";
export const COOKIE_RENOVACAO = producao ? "__Host-sb-rt" : "sb-rt";

const TRINTA_DIAS = 60 * 60 * 24 * 30;

export const opcoesCookie = {
  httpOnly: true,
  secure: producao,
  sameSite: "lax" as const,
  path: "/",
  maxAge: TRINTA_DIAS,
};

// Lê o exp do JWT sem confiar nele: serve só para decidir se vale renovar antes de expirar.
// A validade de verdade é conferida pelo Supabase em getUser.
export function expiraEmSegundos(jwt: string, agoraMs = Date.now()): number {
  const payload = jwt.split(".")[1];
  if (!payload) return 0;
  try {
    const dados: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const exp = typeof dados === "object" && dados !== null && "exp" in dados ? Number(dados.exp) : 0;
    return Number.isFinite(exp) ? exp - Math.floor(agoraMs / 1000) : 0;
  } catch {
    return 0;
  }
}

// Só caminhos internos. Sem barra invertida nem caractere de controle (o parser de URL descarta tab e
// quebra de linha, e "/<tab>/site.com" viraria "//site.com"), e a origem resolvida tem de ser a do próprio site.
export function destinoSeguro(valor: unknown, padrao = "/membros/"): string {
  if (typeof valor !== "string" || valor.length > 500 || !valor.startsWith("/")) return padrao;
  if (/[\u0000-\u001f\u007f\\]/.test(valor) || valor.startsWith("//")) return padrao;
  const base = "https://interno.invalid";
  try {
    const u = new URL(valor, base);
    return u.origin === base ? `${u.pathname}${u.search}${u.hash}` : padrao;
  } catch {
    return padrao;
  }
}
