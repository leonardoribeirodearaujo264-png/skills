import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { COOKIE_ACESSO, COOKIE_RENOVACAO, expiraEmSegundos, opcoesCookie } from "./lib/auth/cookies";

// Renova o access token antes de expirar. Roda só na área logada e nas rotas da loja,
// nunca nas páginas antigas dos vídeos. Server Components não gravam cookie, por isso a renovação é aqui.
export async function proxy(req: NextRequest): Promise<NextResponse> {
  const acesso = req.cookies.get(COOKIE_ACESSO)?.value;
  const renovacao = req.cookies.get(COOKIE_RENOVACAO)?.value;
  if (!renovacao || (acesso && expiraEmSegundos(acesso) > 60)) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return NextResponse.next();

  const supabase = createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: renovacao });

  // Falha de rede ou do Supabase (sem status ou 5xx) não desloga: tenta de novo na próxima requisição
  if (error && (!error.status || error.status >= 500)) return NextResponse.next();
  if (error || !data.session) {
    // Refresh inválido ou revogado: sai da sessão
    const headers = new Headers(req.headers);
    req.cookies.delete(COOKIE_ACESSO);
    req.cookies.delete(COOKIE_RENOVACAO);
    headers.set("cookie", req.cookies.toString());
    const res = NextResponse.next({ request: { headers } });
    res.cookies.delete(COOKIE_ACESSO);
    res.cookies.delete(COOKIE_RENOVACAO);
    return res;
  }

  // A página desta mesma requisição precisa ler o token novo: reescreve o cookie da requisição também
  req.cookies.set(COOKIE_ACESSO, data.session.access_token);
  req.cookies.set(COOKIE_RENOVACAO, data.session.refresh_token);
  const headers = new Headers(req.headers);
  headers.set("cookie", req.cookies.toString());
  const res = NextResponse.next({ request: { headers } });
  res.cookies.set(COOKIE_ACESSO, data.session.access_token, opcoesCookie);
  res.cookies.set(COOKIE_RENOVACAO, data.session.refresh_token, opcoesCookie);
  return res;
}

export const config = {
  matcher: ["/membros/:path*", "/entrar/:path*", "/loja/:path*", "/api/loja/download/:path*"],
};
