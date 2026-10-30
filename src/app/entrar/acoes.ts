"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { destinoSeguro } from "@/lib/auth/cookies";
import { gravarSessao, limparSessao, usuarioAtual } from "@/lib/auth/sessao";
import { enviarAcesso } from "@/lib/auth/acesso";
import { SENHA_MINIMA, senhaCabe, trocarSenha } from "@/lib/auth/senha";
import { ipDaRequisicao, permitir } from "@/lib/loja/limites";
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
      return {
        etapa: "email",
        erro: "Muitas tentativas seguidas. Confira o código que já chegou no e-mail ou tente de novo em alguns minutos.",
        email: r.data,
      };
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
  const ip = await ipDaRequisicao();
  if (!(await permitir(`codigo-ip:${ip}`, 30).catch(() => false)) || !(await permitir(`codigo:${e.data}`, 10).catch(() => false))) {
    return { etapa: "codigo", erro: "Muitas tentativas seguidas. Espere alguns minutos e peça um código novo.", email: e.data };
  }
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

// campo: em qual campo mostrar o erro (para o leitor de tela ligar a mensagem ao campo certo)
export type EstadoSenha = { erro: string | null; campo: "email" | "senha" | null; email: string };

const NAO_DEU = "Não conseguimos entrar agora. Tente de novo em instantes ou entre com um código pelo e-mail.";

// Entrar com o e-mail da compra e a senha que chegou no e-mail de acesso (ou a que a pessoa trocou).
// Limites por IP, por e-mail+IP e por e-mail (teto alto contra rodízio de IP); a mensagem não diz se o e-mail existe.
export async function entrarComSenha(_anterior: EstadoSenha, form: FormData): Promise<EstadoSenha> {
  const e = email.safeParse(form.get("email"));
  const senha = String(form.get("senha") ?? "");
  if (!e.success) return { erro: "Digite um e-mail válido.", campo: "email", email: String(form.get("email") ?? "") };
  if (!senha || senha.length > 128) return { erro: "Digite a sua senha.", campo: "senha", email: e.data };
  try {
    const ip = await ipDaRequisicao();
    const liberado =
      (await permitir(`senha-ip:${ip}`, 30)) && (await permitir(`senha:${e.data}:${ip}`, 10)) && (await permitir(`senha-email:${e.data}`, 60));
    if (!liberado) {
      return { erro: "Muitas tentativas seguidas. Espere alguns minutos ou entre com um código pelo e-mail.", campo: "senha", email: e.data };
    }
  } catch (err) {
    console.error("limite do login", err instanceof Error ? err.message : "erro desconhecido");
    return { erro: NAO_DEU, campo: "senha", email: e.data };
  }
  const { data, error } = await clientePublico().auth.signInWithPassword({ email: e.data, password: senha });
  if (error || !data.session) {
    // Só credencial errada vira "e-mail ou senha incorretos"; fora do ar ou limite do Supabase dizem o que é
    if (error?.status === 429) {
      return { erro: "Muitas tentativas seguidas. Espere alguns minutos ou entre com um código pelo e-mail.", campo: "senha", email: e.data };
    }
    if (error && error.code !== "invalid_credentials" && (error.status ?? 0) >= 500) {
      console.error("login com senha", error.code ?? error.status);
      return { erro: NAO_DEU, campo: "senha", email: e.data };
    }
    return { erro: "E-mail ou senha incorretos. Confira ou entre com um código pelo e-mail.", campo: "senha", email: e.data };
  }
  await gravarSessao(data.session);
  redirect(destinoSeguro(form.get("next")));
}

export type EstadoTrocarSenha = { erro: string | null; campo: "nova" | "repetir" | null; ok: boolean };

// Troca de senha na área de membros, só com sessão. Depois da troca, as outras sessões abertas são encerradas
// (computador compartilhado, aparelho perdido) e esta continua.
export async function trocarMinhaSenha(_anterior: EstadoTrocarSenha, form: FormData): Promise<EstadoTrocarSenha> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo.", campo: "nova", ok: false };
  const nova = String(form.get("nova") ?? "");
  const repetir = String(form.get("repetir") ?? "");
  if (nova.length < SENHA_MINIMA || !senhaCabe(nova)) {
    return { erro: `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres e no máximo 72 (acento conta como mais de um).`, campo: "nova", ok: false };
  }
  if (nova.toLowerCase() === usuario.email.toLowerCase()) return { erro: "A senha não pode ser o seu e-mail.", campo: "nova", ok: false };
  if (nova !== repetir) return { erro: "As duas senhas não são iguais.", campo: "repetir", ok: false };
  const db = clienteServico();
  try {
    if (!(await permitir(`trocar-senha:${usuario.id}`, 10))) {
      return { erro: "Muitas trocas seguidas. Tente de novo mais tarde.", campo: "nova", ok: false };
    }
    await trocarSenha(db, usuario.id, nova);
  } catch (err) {
    console.error("trocar senha", err instanceof Error ? err.message : "erro desconhecido");
    return { erro: "Não conseguimos trocar agora. Tente de novo.", campo: "nova", ok: false };
  }
  await db.auth.admin.signOut(usuario.accessToken, "others").catch(() => undefined);
  return { erro: null, campo: null, ok: true };
}

export async function sair(): Promise<void> {
  const usuario = await usuarioAtual();
  // Encerra a sessão no Supabase também, para o refresh token antigo não valer mais
  if (usuario) await clienteServico().auth.admin.signOut(usuario.accessToken, "local").catch(() => undefined);
  await limparSessao();
  redirect("/loja/");
}
