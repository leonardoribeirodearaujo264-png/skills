import { env } from "../env";
import { escaparHtml } from "./html";
import { enviarEmail } from "./resend";

// Lembrete do Pix gerado: valor, pacote, copia e cola, QR Code e botão para voltar à página de pagamento.
// É só lembrete: se falhar, a tela de pagamento continua funcionando (quem chama registra e segue).

export type EmailPix = {
  para: string;
  nome: string;
  pacote: string;
  valorTexto: string;
  copiaECola: string;
  qrBase64: string;
  minutosValidade: number;
  link: string;
  pixId: string;
};

export async function enviarEmailPix(d: EmailPix): Promise<void> {
  const e = env();
  const primeiroNome = d.nome.split(" ")[0] ?? "";
  const texto = [
    `Oi, ${primeiroNome}. O seu Pix de ${d.valorTexto} para "${d.pacote}" está pronto.`,
    `Ele vence em ${d.minutosValidade} minutos.`,
    "",
    "Pix copia e cola:",
    d.copiaECola,
    "",
    `Voltar para a página de pagamento: ${d.link}`,
    "",
    "Assim que o pagamento cair, o acesso chega neste e-mail.",
  ].join("\n");

  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#F6F5F1;font-family:Arial,Helvetica,sans-serif;color:#14161A">
<div style="max-width:480px;margin:0 auto;padding:32px 20px">
<p style="font-size:13px;color:#565B66;margin:0 0 16px">Leonardo Araujo</p>
<div style="background:#FFFFFF;border:1px solid #E3E1DA;border-radius:16px;padding:28px">
<h1 style="font-size:22px;margin:0 0 8px">Seu Pix está pronto</h1>
<p style="font-size:15px;line-height:1.5;color:#565B66;margin:0 0 18px">Oi, ${escaparHtml(primeiroNome)}. Pague <strong style="color:#14161A">${escaparHtml(d.valorTexto)}</strong> por <strong style="color:#14161A">${escaparHtml(d.pacote)}</strong>. Este código vence em <strong style="color:#14161A">${d.minutosValidade} minutos</strong>.</p>
<p style="font-size:13px;color:#565B66;margin:0 0 6px">Pix copia e cola</p>
<p style="font-family:Consolas,monospace;font-size:12px;word-break:break-all;background:#F6F5F1;border-radius:10px;padding:12px;margin:0 0 18px">${escaparHtml(d.copiaECola)}</p>
<p style="text-align:center;margin:0 0 18px"><img src="cid:qr-pix" width="200" height="200" alt="QR Code do Pix" style="border:1px solid #E3E1DA;border-radius:12px"></p>
<a href="${escaparHtml(d.link)}" style="display:inline-block;background:#C03F00;color:#FFFFFF;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:12px">Voltar para o pagamento</a>
<p style="font-size:12px;color:#565B66;margin:20px 0 0">Assim que o pagamento cair, o acesso chega neste e-mail. Se não foi você, ignore esta mensagem.</p>
</div></div></body></html>`;

  await enviarEmail(e.RESEND_API_KEY, e.EMAIL_REMETENTE, {
    para: d.para,
    assunto: `Seu Pix de ${d.valorTexto} vence em ${d.minutosValidade} minutos`,
    html,
    texto,
    // Um lembrete por código Pix, mesmo se o envio for repetido
    idempotencia: `email-pix-${d.pixId}`,
    anexos: [{ nome: "pix.png", base64: d.qrBase64, tipo: "image/png", idConteudo: "qr-pix" }],
  });
}
