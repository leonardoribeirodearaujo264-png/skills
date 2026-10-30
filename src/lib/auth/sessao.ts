import type { Session } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import { clientePublico } from "../supabase/clientes";
import { COOKIE_ACESSO, COOKIE_RENOVACAO, opcoesCookie } from "./cookies";

export type Usuario = { id: string; email: string; accessToken: string };

// Grava a sessão nos cookies. Só funciona em Server Action e Route Handler.
export async function gravarSessao(sessao: Pick<Session, "access_token" | "refresh_token">): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_ACESSO, sessao.access_token, opcoesCookie);
  jar.set(COOKIE_RENOVACAO, sessao.refresh_token, opcoesCookie);
}

export async function limparSessao(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_ACESSO);
  jar.delete(COOKIE_RENOVACAO);
}

// Usuário da requisição, com o token conferido pelo Supabase. Uma consulta por requisição.
// A renovação do token acontece antes, no proxy.
export const usuarioAtual = cache(async (): Promise<Usuario | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE_ACESSO)?.value;
  if (!token) return null;
  const { data, error } = await clientePublico().auth.getUser(token);
  if (error || !data.user?.email) return null;
  return { id: data.user.id, email: data.user.email, accessToken: token };
});
