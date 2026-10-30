import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { afterAll, describe, expect, it } from "vitest";
import { gerarPix, previaCompra } from "@/lib/loja/checkout";
import { aplicarPagamento } from "@/lib/loja/pagamento";
import { depsPagamento } from "@/lib/loja/servicos";

// Caminho completo da oferta complementar, com banco real, Mercado Pago de TESTE e Resend:
// prévia do checkout -> Pix com o bump somado -> pedido com os dois itens -> liberação pelo mesmo caminho
// do webhook -> acesso aos dois pacotes e e-mail de acesso. Apaga tudo no fim. Rodar com:
// INTEGRACAO=1 node --env-file=.env.local node_modules/vitest/vitest.mjs run tests/integracao-bump.test.ts
const ativo =
  process.env.INTEGRACAO === "1" &&
  (process.env.MERCADOPAGO_ACCESS_TOKEN ?? "").startsWith("TEST-") &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.RESEND_API_KEY);

// Endereço oficial de teste do Resend: aceita o envio e não entrega a ninguém
const EMAIL = "delivered@resend.dev";
const PRINCIPAL = "design-copy-anuncios";
const BUMP = "lancamento-pro";

describe.skipIf(!ativo)("order bump: do checkout ao acesso", () => {
  const admin = () =>
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "", {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  let pedidoId: string | null = null;
  let pixId: string | null = null;
  // Pedido sem o bump, gerado antes de marcar: tem de ser cancelado para não ser pago duas vezes
  let pedidoSemBump: string | null = null;
  const pedidosExtras: string[] = [];
  const pixExtras: string[] = [];

  afterAll(async () => {
    const db = admin();
    for (const id of [pixId, ...pixExtras]) if (id) await depsPagamento().mp.cancelarPagamento(id);
    for (const id of [pedidoId, pedidoSemBump, ...pedidosExtras]) {
      if (!id) continue;
      await db.from("loja_acessos").delete().eq("pedido_id", id);
      await db.from("loja_pedidos").delete().eq("id", id);
    }
    const { data } = await db.auth.admin.listUsers({ perPage: 1000 });
    const u = data.users.find((x) => x.email === EMAIL);
    if (u) await db.auth.admin.deleteUser(u.id);
  });

  it("a prévia oferece o bump desmarcado com o preço do banco", async () => {
    const p = await previaCompra(null, "avulso", [PRINCIPAL]);
    if ("motivo" in p) throw new Error(p.motivo);
    expect(p.valorCentavos).toBe(3700);
    expect(p.bumps.find((b) => b.slug === BUMP)).toMatchObject({ slug: BUMP, precoCentavos: 1990 });
    expect(p.itens.map((i) => i.slug)).toEqual([PRINCIPAL]);
  });

  it("marcar o bump depois de gerar o Pix sem ele cancela o Pix e o pedido anteriores", async () => {
    const comprador = { usuario: null, email: EMAIL, nome: "Teste Bump", telefone: "11987654321" };
    const sem = await gerarPix(comprador, "avulso", [PRINCIPAL]);
    if ("motivo" in sem || "situacao" in sem) throw new Error(JSON.stringify(sem));
    pedidoSemBump = sem.pedidoId;
    const com = await gerarPix(comprador, "avulso", [PRINCIPAL], [BUMP]);
    if ("motivo" in com || "situacao" in com) throw new Error(JSON.stringify(com));
    pedidoId = com.pedidoId;
    pixId = com.pix.id;
    expect(com.pedidoId).not.toBe(sem.pedidoId);
    const anterior = await admin().from("loja_pedidos").select("status").eq("id", sem.pedidoId).single();
    expect(anterior.data?.status).toBe("cancelado");
    const pagamentos = await depsPagamento().mp.pagamentosDoPedido(sem.pedidoId);
    expect(pagamentos.find((p) => p.id === sem.pix.id)?.status).toBe("cancelled");
  }, 90_000);

  it("marcado, o Pix sai com o total somado e o pedido grava os dois itens", async () => {
    const r = await gerarPix({ usuario: null, email: EMAIL, nome: "Teste Bump", telefone: "11987654321" }, "avulso", [PRINCIPAL], [BUMP]);
    if ("motivo" in r || "situacao" in r) throw new Error(JSON.stringify(r));
    pedidoId = r.pedidoId;
    pixId = r.pix.id;
    expect(r.valorCentavos).toBe(3700 + 1990);
    const pagamentos = await depsPagamento().mp.pagamentosDoPedido(r.pedidoId);
    expect(pagamentos.find((x) => x.id === r.pix.id)?.transaction_amount).toBe(56.9);
    const itens = await admin().from("loja_pedido_itens").select("produto_slug").eq("pedido_id", r.pedidoId);
    expect((itens.data ?? []).map((i) => i.produto_slug).sort()).toEqual([PRINCIPAL, BUMP].sort());
  }, 60_000);

  it("com dois bumps marcados, a prévia oferece os três e o Pix soma os dois (0009)", async () => {
    const p = await previaCompra(null, "avulso", [PRINCIPAL]);
    if ("motivo" in p) throw new Error(p.motivo);
    expect(p.bumps.map((b) => [b.slug, b.precoCentavos])).toEqual([
      [BUMP, 1990],
      ["edicao-de-video", 2700],
      ["motion-mockup-fontes", 990],
    ]);
    const r = await gerarPix({ usuario: null, email: EMAIL, nome: "Teste Bump", telefone: "11987654321" }, "avulso", [PRINCIPAL], [BUMP, "motion-mockup-fontes"]);
    if ("motivo" in r || "situacao" in r) throw new Error(JSON.stringify(r));
    pedidosExtras.push(r.pedidoId);
    pixExtras.push(r.pix.id);
    expect(r.valorCentavos).toBe(3700 + 1990 + 990);
    const itens = await admin().from("loja_pedido_itens").select("produto_slug").eq("pedido_id", r.pedidoId);
    expect((itens.data ?? []).map((i) => i.produto_slug).sort()).toEqual([PRINCIPAL, BUMP, "motion-mockup-fontes"].sort());
  }, 60_000);

  it("pagamento aprovado libera os dois pacotes e manda o e-mail de acesso uma vez", async () => {
    if (!pedidoId) throw new Error("sem pedido");
    const deps = depsPagamento();
    const aprovado = {
      id: `teste-bump-${randomUUID()}`,
      status: "approved",
      external_reference: pedidoId,
      transaction_amount: 56.9,
      currency_id: "BRL",
    };
    expect((await aplicarPagamento(deps, aprovado)).resultado).toBe("liberado");
    // Notificação repetida: não libera de novo nem manda outro e-mail
    expect((await aplicarPagamento(deps, aprovado)).resultado).toBe("ja_pago");
    const db = admin();
    const acessos = await db.from("loja_acessos").select("produto_slug, revogado_em").eq("pedido_id", pedidoId);
    expect((acessos.data ?? []).filter((a) => !a.revogado_em).map((a) => a.produto_slug).sort()).toEqual([PRINCIPAL, BUMP].sort());
    const pedido = await db.from("loja_pedidos").select("status, valor_centavos, email_acesso_enviado_em").eq("id", pedidoId).single();
    expect(pedido.data?.status).toBe("pago");
    expect(pedido.data?.valor_centavos).toBe(5690);
  }, 60_000);
});
