import { env } from "../env";
import { escaparHtml } from "../email/html";
import { enviarEmail } from "../email/resend";
import { ipDaRequisicao, permitir } from "../loja/limites";
import { contaPorEmail } from "../loja/repositorio";
import { clienteServico } from "../supabase/clientes";
import { destinoSeguro } from "./cookies";

// E-mail de acesso à área de membros: código de 8 dígitos e link de um clique, gerados pelo admin do
// Supabase e enviados pelo Resend. Só existe conta para quem comprou (ela nasce na aprovação do pagamento),
// e a conta é conferida antes de gerar o código, porque o generateLink criaria uma conta nova.

export type Motivo = "login" | "compra";
export type ResultadoAcesso = "enviado" | "sem_conta" | "aguarde";


function listar(itens: string[]): string {
  return itens.length <= 1 ? (itens[0] ?? "") : `${itens.slice(0, -1).join(", ")} e ${itens.at(-1)}`;
}

type CapaEmail = { url: string; alt: string };

function montar(motivo: Motivo, codigo: string, link: string, pacotes: string[], capa: CapaEmail | null): { assunto: string; html: string; texto: string } {
  const titulo = motivo === "compra" ? "Seu acesso está liberado" : "Seu código de acesso";
  // Na compra, o e-mail diz o que foi liberado neste pedido
  const comprados = listar(pacotes);
  const intro =
    motivo !== "compra"
      ? "Use o código abaixo para entrar na área de membros."
      : comprados
        ? `Pagamento aprovado. ${pacotes.length > 1 ? "Os pacotes" : "O pacote"} ${comprados} já ${pacotes.length > 1 ? "estão" : "está"} na sua área de membros.`
        : "Pagamento aprovado. Os seus pacotes já estão na área de membros.";
  const texto = `${titulo}\n\n${intro}\n\nCódigo: ${codigo}\n\nOu entre por este link: ${link}\n\nO código vale por pouco tempo e só uma vez. Se não foi você, ignore este e-mail.`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#F6F5F1;font-family:Arial,Helvetica,sans-serif;color:#14161A">
<div style="max-width:480px;margin:0 auto;padding:32px 20px">
<p style="font-size:13px;color:#565B66;margin:0 0 16px">Leonardo Araujo</p>
<div style="background:#FFFFFF;border:1px solid #E3E1DA;border-radius:16px;padding:28px">
${capa ? `<img src="${escaparHtml(capa.url)}" width="424" height="283" alt="${escaparHtml(capa.alt)}" style="display:block;width:100%;max-width:424px;height:auto;border-radius:12px;margin:0 0 20px">` : ""}
<h1 style="font-size:22px;margin:0 0 10px">${escaparHtml(titulo)}</h1>
<p style="font-size:15px;line-height:1.5;color:#565B66;margin:0 0 20px">${escaparHtml(intro)}</p>
<p style="font-size:13px;color:#565B66;margin:0 0 6px">Código</p>
<p style="font-size:30px;letter-spacing:6px;font-weight:bold;margin:0 0 24px">${escaparHtml(codigo)}</p>
<a href="${escaparHtml(link)}" style="display:inline-block;background:#C03F00;color:#FFFFFF;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:12px">Entrar na área de membros</a>
<p style="font-size:12px;color:#565B66;margin:20px 0 0">O código vale por pouco tempo e só uma vez. Se não foi você, ignore este e-mail.</p>
</div></div></body></html>`;
  const assunto = motivo !== "compra" ? `Seu código de acesso: ${codigo}` : comprados ? `Seu acesso: ${comprados}` : "Seu acesso aos pacotes";
  return { assunto, html, texto };
}

export async function enviarAcesso(
  emailBruto: string,
  motivo: Motivo,
  opcoes: { proximo?: string; idempotencia?: string; pacotes?: string[]; capa?: CapaEmail | null } = {},
): Promise<ResultadoAcesso> {
  const e = env();
  const email = emailBruto.trim().toLowerCase();
  const db = clienteServico();

  // Login: o limite vem antes de responder se há compra, para ninguém testar uma lista de e-mails.
  // Conta por IP e por e-mail+IP: um terceiro em outro IP não consegue travar o login do cliente.
  if (motivo === "login") {
    const ip = await ipDaRequisicao();
    if (!(await permitir(`login-ip:${ip}`, 20)) || !(await permitir(`login:${email}:${ip}`, 6, 60))) return "aguarde";
  }
  if (!(await contaPorEmail(db, email))) return "sem_conta";

  const proximo = destinoSeguro(opcoes.proximo);
  const { data, error } = await db.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data.properties) throw new Error(`gerar acesso: ${error?.code ?? "sem dados"}`);
  const link = `${e.SITE_URL}/entrar/confirmar/?${new URLSearchParams({
    next: proximo,
    token_hash: data.properties.hashed_token,
    type: "magiclink",
  })}`;
  const msg = montar(motivo, data.properties.email_otp, link, opcoes.pacotes ?? [], opcoes.capa ?? null);
  await enviarEmail(e.RESEND_API_KEY, e.EMAIL_REMETENTE, { para: email, ...msg, idempotencia: opcoes.idempotencia });
  return "enviado";
}
