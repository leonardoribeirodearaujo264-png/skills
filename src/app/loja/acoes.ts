"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { usuarioAtual } from "@/lib/auth/sessao";
import { iniciarCompra, MENSAGEM_FALHA_CHECKOUT } from "@/lib/loja/checkout";
import { MENSAGEM_RECUSA } from "@/lib/loja/dominio";

export type EstadoCompra = { erro: string | null };

const entrada = z.object({
  oferta: z.string().regex(/^[a-z0-9-]{1,40}$/),
  produtos: z.array(z.string().regex(/^[a-z0-9-]{1,60}$/)).max(20),
});

// O cliente manda só a oferta e a escolha. Preço, itens e regra saem do banco e de montarPedido.
export async function comprar(_anterior: EstadoCompra, form: FormData): Promise<EstadoCompra> {
  const dados = entrada.safeParse({ oferta: form.get("oferta"), produtos: form.getAll("produto") });
  if (!dados.success) return { erro: "Escolha uma oferta válida." };
  const { oferta, produtos } = dados.data;

  const usuario = await usuarioAtual();
  if (!usuario) {
    const volta = `/loja/?oferta=${encodeURIComponent(oferta)}&produtos=${encodeURIComponent(produtos.join(","))}`;
    redirect(`/entrar/?next=${encodeURIComponent(volta)}`);
  }

  const r = await iniciarCompra(usuario, oferta, produtos);
  if ("motivo" in r) return { erro: r.motivo === "falha" ? MENSAGEM_FALHA_CHECKOUT : MENSAGEM_RECUSA[r.motivo] };
  redirect(r.url);
}
