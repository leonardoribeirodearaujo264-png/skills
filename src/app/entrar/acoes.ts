"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { destinoSeguro } from "@/lib/auth/cookies";
import { gravarSessao, limparSessao, usuarioAtual } from "@/lib/auth/sessao";
import { env } from "@/lib/env";
import { clientePublico, clienteServico } from "@/lib/supabase/clientes";

export type EstadoEntrar =
  | { etapa: "email"; erro: string | null; email: string }
  | { etapa: "codigo"; erro: string | null; email: string };

const email = z.email().max(254).transform((e) => e.trim().toLowerCase());
const codigo = z.string().regex(/^\d{6,10}$/);

function mensagemAuth(status: number | undefined): string {
  if (status === 429) return "Muitas tentativas em pouco tempo. Espere um minuto e tente de novo.";
  return "Não conseguimos enviar agora. Confira o e-mail e tente de novo.";
}

// Envia o código e o link de acesso. A resposta é a mesma exista ou não a conta.
export async function enviarCodigo(_anterior: EstadoEntrar, form: FormData): Promise<EstadoEntrar> {
  const r = email.safeParse(form.get("email"));
  if (!r.success) return { etapa: "email", erro: "Digite um e-mail válido.", email: String(form.get("email") ?? "") };
  const proximo = destinoSeguro(form.get("next"));
  const { error } = await clientePublico().auth.signInWithOtp({
    email: r.data,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${env().SITE_URL}/entrar/confirmar/?next=${encodeURIComponent(proximo)}`,
    },
  });
  if (error) return { etapa: "email", erro: mensagemAuth(error.status), email: r.data };
  return { etapa: "codigo", erro: null, email: r.data };
}

export async function verificarCodigo(anterior: EstadoEntrar, form: FormData): Promise<EstadoEntrar> {
  const e = email.safeParse(form.get("email"));
  const c = codigo.safeParse(String(form.get("codigo") ?? "").replace(/\s/g, ""));
  if (!e.success) return { etapa: "email", erro: "Digite o e-mail de novo.", email: "" };
  if (!c.success) return { etapa: "codigo", erro: "O código tem só números. Confira no e-mail.", email: e.data };
  const { data, error } = await clientePublico().auth.verifyOtp({ email: e.data, token: c.data, type: "email" });
  if (error || !data.session) {
    return { etapa: "codigo", erro: "Código inválido ou expirado. Peça um novo se precisar.", email: anterior.email || e.data };
  }
  await gravarSessao(data.session);
  redirect(destinoSeguro(form.get("next")));
}

// Link do e-mail: token_hash confirmado por POST (um clique), para scanners de e-mail não gastarem o link
export async function confirmarLink(form: FormData): Promise<void> {
  const tokenHash = z.string().min(10).max(500).safeParse(form.get("token_hash"));
  const tipo = z.enum(["email", "magiclink", "signup"]).safeParse(form.get("type"));
  const proximo = destinoSeguro(form.get("next"));
  if (!tokenHash.success || !tipo.success) redirect("/entrar/?erro=link");
  const { data, error } = await clientePublico().auth.verifyOtp({ token_hash: tokenHash.data, type: tipo.data });
  if (error || !data.session) redirect("/entrar/?erro=link");
  await gravarSessao(data.session);
  redirect(proximo);
}

export async function sair(): Promise<void> {
  const usuario = await usuarioAtual();
  // Encerra a sessão no Supabase também, para o refresh token antigo não valer mais
  if (usuario) await clienteServico().auth.admin.signOut(usuario.accessToken, "local").catch(() => undefined);
  await limparSessao();
  redirect("/loja/");
}
