"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { destinoSeguro } from "@/lib/auth/cookies";
import { gravarSessao, limparSessao, usuarioAtual } from "@/lib/auth/sessao";
import { enviarAcesso } from "@/lib/auth/acesso";
import { clientePublico, clienteServico } from "@/lib/supabase/clientes";

export type EstadoEntrar =
  | { etapa: "email"; erro: string | null; email: string; semCompra?: boolean }
  | { etapa: "codigo"; erro: string | null; email: string };

const email = z.email().max(254).transform((e) => e.trim().toLowerCase());
const codigo = z.string().regex(/^\d{6,10}$/);

// A conta só existe para quem comprou (ela nasce na aprovação do pagamento). O código sai pelo Resend
// e só é gerado se houver conta; e-mail sem compra recebe uma mensagem com o caminho para a loja.
export async function enviarCodigo(_anterior: EstadoEntrar, form: FormData): Promise<EstadoEntrar> {
  const r = email.safeParse(form.get("email"));
  if (!r.success) return { etapa: "email", erro: "Digite um e-mail válido.", email: String(form.get("email") ?? "") };
  try {
    const resultado = await enviarAcesso(r.data, "login", { proximo: destinoSeguro(form.get("next")) });
    if (resultado === "sem_conta") {
      return {
        etapa: "email",
        erro: "Não encontramos compra aprovada para este e-mail. Confira se é o mesmo e-mail usado no pagamento.",
        email: r.data,
        semCompra: true,
      };
    }
    if (resultado === "aguarde") {
      return { etapa: "email", erro: "Já mandamos um código há pouco. Confira o e-mail ou espere um minuto.", email: r.data };
    }
    return { etapa: "codigo", erro: null, email: r.data };
  } catch (e) {
    console.error("enviar codigo", e instanceof Error ? e.message : "erro desconhecido");
    return { etapa: "email", erro: "Não conseguimos enviar agora. Tente de novo em instantes.", email: r.data };
  }
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
