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

// Bloco de rótulo e valor em destaque (código, login ou senha)
function destaque(rotulo: string, valor: string, espacado: boolean): string {
  return `<p style="font-size:13px;color:#565B66;margin:0 0 6px">${escaparHtml(rotulo)}</p>
<p style="font-size:${espacado ? "30px;letter-spacing:6px" : "20px;word-break:break-all"};font-weight:bold;margin:0 0 20px;font-family:Consolas,Menlo,monospace">${escaparHtml(valor)}</p>`;
}

// Compra: login (e-mail) e senha, quando a senha foi gerada agora; sem senha nova, lembra da que já existe.
// Login pela tela de entrar: código de uso único. Os dois levam o botão com o link de um clique.
function montar(
  motivo: Motivo,
  email: string,
  codigo: string,
  link: string,
  pacotes: string[],
  capa: CapaEmail | null,
  senha: string | null,
): { assunto: string; html: string; texto: string } {
  const titulo = motivo === "compra" ? "Seu acesso está liberado" : "Seu código de acesso";
  // Na compra, o e-mail diz o que foi liberado neste pedido
  const comprados = listar(pacotes);
  const intro =
    motivo !== "compra"
      ? "Use o código abaixo para entrar na área de membros."
      : comprados
        ? `Pagamento aprovado. ${pacotes.length > 1 ? "Os pacotes" : "O pacote"} ${comprados} já ${pacotes.length > 1 ? "estão" : "está"} na sua área de membros.`
        : "Pagamento aprovado. Os seus pacotes já estão na área de membros.";
  const urlEntrar = new URL("/entrar/", link).toString();
  const blocoCompra = senha
    ? `${destaque("Seu login", email, false)}${destaque("Sua senha", senha, false)}<p style="font-size:13px;line-height:1.5;color:#565B66;margin:0 0 20px">Entre em <a href="${escaparHtml(urlEntrar)}" style="color:#C03F00">${escaparHtml(urlEntrar)}</a> com esse e-mail e essa senha. Na área de membros você pode trocar a senha quando quiser.</p>`
    : `${destaque("Seu login", email, false)}<p style="font-size:13px;line-height:1.5;color:#565B66;margin:0 0 20px">Use a senha que chegou no seu primeiro e-mail de acesso (ou a que você trocou). Esqueceu? Na página de entrar, peça um código por e-mail.</p>`;
  const corpo = motivo === "compra" ? blocoCompra : destaque("Código", codigo, true);
  const rodape =
    motivo === "compra"
      ? "O botão entra direto e vale uma vez. Guarde a senha: é com ela que você entra das próximas vezes."
      : "O código vale por pouco tempo e só uma vez. Se não foi você, ignore este e-mail.";
  const texto =
    motivo === "compra"
      ? `${titulo}\n\n${intro}\n\nSeu login: ${email}\n${senha ? `Sua senha: ${senha}\n\nEntre em ${urlEntrar} com esse e-mail e essa senha.` : "Use a senha do seu primeiro e-mail de acesso (ou a que você trocou). Esqueceu? Na página de entrar, peça um código."}\n\nOu entre direto por este link: ${link}\n\n${rodape}`
      : `${titulo}\n\n${intro}\n\nCódigo: ${codigo}\n\nOu entre por este link: ${link}\n\n${rodape}`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#F6F5F1;font-family:Arial,Helvetica,sans-serif;color:#14161A">
<div style="max-width:480px;margin:0 auto;padding:32px 20px">
<p style="font-size:13px;color:#565B66;margin:0 0 16px">Leonardo Araujo</p>
<div style="background:#FFFFFF;border:1px solid #E3E1DA;border-radius:16px;padding:28px">
${capa ? `<img src="${escaparHtml(capa.url)}" width="424" height="283" alt="${escaparHtml(capa.alt)}" style="display:block;width:100%;max-width:424px;height:auto;border-radius:12px;margin:0 0 20px">` : ""}
<h1 style="font-size:22px;margin:0 0 10px">${escaparHtml(titulo)}</h1>
<p style="font-size:15px;line-height:1.5;color:#565B66;margin:0 0 20px">${escaparHtml(intro)}</p>
${corpo}
<a href="${escaparHtml(link)}" style="display:inline-block;background:#C03F00;color:#FFFFFF;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:12px">Entrar na área de membros</a>
<p style="font-size:12px;color:#565B66;margin:20px 0 0">${escaparHtml(rodape)}</p>
</div></div></body></html>`;
  const assunto = motivo !== "compra" ? `Seu código de acesso: ${codigo}` : comprados ? `Seu acesso: ${comprados}` : "Seu acesso aos pacotes";
  return { assunto, html, texto };
}

export async function enviarAcesso(
  emailBruto: string,
  motivo: Motivo,
  opcoes: { proximo?: string; idempotencia?: string; pacotes?: string[]; capa?: CapaEmail | null; senha?: string | null } = {},
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
  const msg = montar(motivo, email, data.properties.email_otp, link, opcoes.pacotes ?? [], opcoes.capa ?? null, opcoes.senha ?? null);
  await enviarEmail(e.RESEND_API_KEY, e.EMAIL_REMETENTE, { para: email, ...msg, idempotencia: opcoes.idempotencia });
  return "enviado";
}
