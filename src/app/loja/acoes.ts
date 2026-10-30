"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { usuarioAtual } from "@/lib/auth/sessao";
import { iniciarCompra, MENSAGEM_FALHA_CHECKOUT } from "@/lib/loja/checkout";
import { ipDaRequisicao, permitir } from "@/lib/loja/limites";
import { MENSAGEM_RECUSA } from "@/lib/loja/dominio";

export type EstadoCompra = { erro: string | null; email: string };

const entrada = z.object({
  oferta: z.string().regex(/^[a-z0-9-]{1,40}$/),
  produtos: z.array(z.string().regex(/^[a-z0-9-]{1,60}$/)).max(20),
  email: z.email().max(254),
});

// Checkout sem login. O cliente manda a oferta, a escolha e o e-mail; preço, itens e regra saem do servidor.
export async function pagar(_anterior: EstadoCompra, form: FormData): Promise<EstadoCompra> {
  const usuario = await usuarioAtual();
  const emailDigitado = String(form.get("email") ?? "").trim().toLowerCase();
  const dados = entrada.safeParse({
    oferta: form.get("oferta"),
    produtos: String(form.get("produtos") ?? "").split(",").filter(Boolean),
    email: usuario?.email ?? emailDigitado,
  });
  if (!dados.success) {
    const emailRuim = dados.error.issues.some((i) => i.path[0] === "email");
    return { erro: emailRuim ? "Digite um e-mail válido. É nele que o acesso vai chegar." : "Escolha uma oferta válida.", email: emailDigitado };
  }

  // Visitante cria pedido e preferência no Mercado Pago a cada envio: limite por IP contra abuso
  if (!usuario && !(await permitir(`checkout-ip:${await ipDaRequisicao()}`, 20))) {
    return { erro: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.", email: emailDigitado };
  }
  const r = await iniciarCompra({ usuario, email: dados.data.email }, dados.data.oferta, dados.data.produtos);
  if ("motivo" in r) {
    return { erro: r.motivo === "falha" ? MENSAGEM_FALHA_CHECKOUT : MENSAGEM_RECUSA[r.motivo], email: emailDigitado };
  }
  redirect(r.url);
}
