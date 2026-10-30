import { env } from "../env";
import { enviarEmail } from "../email/resend";
import { contaPorEmail } from "../loja/repositorio";
import { clienteServico } from "../supabase/clientes";
import { destinoSeguro } from "./cookies";

// E-mail de acesso à área de membros: código de 8 dígitos e link de um clique, gerados pelo admin do
// Supabase e enviados pelo Resend. Só existe conta para quem comprou (ela nasce na aprovação do pagamento),
// e a conta é conferida antes de gerar o código, porque o generateLink criaria uma conta nova.

export type Motivo = "login" | "compra";
export type ResultadoAcesso = "enviado" | "sem_conta" | "aguarde";

function escapar(t: string): string {
  return t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

function montar(motivo: Motivo, codigo: string, link: string): { assunto: string; html: string; texto: string } {
  const titulo = motivo === "compra" ? "Seu acesso está liberado" : "Seu código de acesso";
  const intro =
    motivo === "compra"
      ? "Pagamento aprovado. Os seus pacotes já estão na área de membros."
      : "Use o código abaixo para entrar na área de membros.";
  const texto = `${titulo}\n\n${intro}\n\nCódigo: ${codigo}\n\nOu entre por este link: ${link}\n\nO código vale por pouco tempo e só uma vez. Se não foi você, ignore este e-mail.`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#F6F5F1;font-family:Arial,Helvetica,sans-serif;color:#14161A">
<div style="max-width:480px;margin:0 auto;padding:32px 20px">
<p style="font-size:13px;color:#565B66;margin:0 0 16px">Leonardo Araujo</p>
<div style="background:#FFFFFF;border:1px solid #E3E1DA;border-radius:16px;padding:28px">
<h1 style="font-size:22px;margin:0 0 10px">${escapar(titulo)}</h1>
<p style="font-size:15px;line-height:1.5;color:#565B66;margin:0 0 20px">${escapar(intro)}</p>
<p style="font-size:13px;color:#565B66;margin:0 0 6px">Código</p>
<p style="font-size:30px;letter-spacing:6px;font-weight:bold;margin:0 0 24px">${escapar(codigo)}</p>
<a href="${escapar(link)}" style="display:inline-block;background:#C03F00;color:#FFFFFF;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:12px">Entrar na área de membros</a>
<p style="font-size:12px;color:#565B66;margin:20px 0 0">O código vale por pouco tempo e só uma vez. Se não foi você, ignore este e-mail.</p>
</div></div></body></html>`;
  return { assunto: motivo === "compra" ? "Seu acesso aos pacotes" : `Seu código de acesso: ${codigo}`, html, texto };
}

export async function enviarAcesso(
  emailBruto: string,
  motivo: Motivo,
  opcoes: { proximo?: string; idempotencia?: string } = {},
): Promise<ResultadoAcesso> {
  const e = env();
  const email = emailBruto.trim().toLowerCase();
  const db = clienteServico();
  if (!(await contaPorEmail(db, email))) return "sem_conta";

  // Limite por e-mail para o login não virar envio em massa para a caixa de alguém
  if (motivo === "login") {
    const { data, error } = await db.rpc("loja_registrar_envio_acesso", { p_email: email });
    if (error) throw new Error(`limite de envio: ${error.code ?? "erro"}`);
    if (data !== true) return "aguarde";
  }

  const proximo = destinoSeguro(opcoes.proximo);
  const { data, error } = await db.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data.properties) throw new Error(`gerar acesso: ${error?.code ?? "sem dados"}`);
  const link = `${e.SITE_URL}/entrar/confirmar/?${new URLSearchParams({
    next: proximo,
    token_hash: data.properties.hashed_token,
    type: "magiclink",
  })}`;
  const msg = montar(motivo, data.properties.email_otp, link);
  await enviarEmail(e.RESEND_API_KEY, e.EMAIL_REMETENTE, { para: email, ...msg, idempotencia: opcoes.idempotencia });
  return "enviado";
}
