"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { usuarioAtual } from "@/lib/auth/sessao";
import { env, modoTeste } from "@/lib/env";
import { criarClienteMercadoPago } from "@/lib/mercadopago/api";
import { MENSAGEM_RECUSA, montarPedido, PedidoInvalido } from "@/lib/loja/dominio";
import { meusProdutos } from "@/lib/loja/membros";
import { carregarCatalogo, criarOuReusarPedido, salvarPreferencia } from "@/lib/loja/repositorio";
import { clientePublico, clienteServico } from "@/lib/supabase/clientes";

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

  let destino: string;
  try {
    const catalogo = await carregarCatalogo(clientePublico());
    const possui = new Set((await meusProdutos(usuario)).map((p) => p.slug));
    const itens = montarPedido(catalogo, oferta, produtos, possui);
    const db = clienteServico();
    const pedido = await criarOuReusarPedido(db, usuario.id, oferta, itens);

    const e = env();
    const ofertaInfo = catalogo.ofertas.find((o) => o.codigo === oferta);
    const titulos = itens.itens.map((s) => catalogo.produtos.find((p) => p.slug === s)?.titulo ?? s);
    const preferencia = await criarClienteMercadoPago(e.MERCADOPAGO_ACCESS_TOKEN).criarPreferencia({
      pedidoId: pedido.id,
      titulo: `${ofertaInfo?.titulo ?? "Pacote"}: ${titulos.join(", ")}`.slice(0, 250),
      // O valor gravado no pedido é o que a liberação confere; a preferência usa exatamente ele
      valorCentavos: pedido.valorCentavos,
      emailComprador: usuario.email,
      urlRetorno: `${e.SITE_URL}/loja/retorno/`,
      urlNotificacao: `${e.SITE_URL}/api/webhooks/mercadopago?source_news=webhooks`,
    });
    await salvarPreferencia(db, pedido.id, preferencia.id);
    destino = modoTeste() ? (preferencia.sandbox_init_point ?? preferencia.init_point) : preferencia.init_point;
  } catch (e) {
    if (e instanceof PedidoInvalido) return { erro: MENSAGEM_RECUSA[e.motivo] };
    console.error("checkout", e instanceof Error ? e.message : "erro desconhecido");
    return { erro: "Não conseguimos abrir o pagamento agora. Nenhuma cobrança foi feita. Tente de novo em instantes." };
  }
  redirect(destino);
}
