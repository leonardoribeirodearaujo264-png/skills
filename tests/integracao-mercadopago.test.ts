import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { criarClienteMercadoPago } from "@/lib/mercadopago/api";

// Chama a API real do Mercado Pago com a credencial de TESTE. Só roda quando pedido:
// INTEGRACAO=1 node --env-file=.env.local node_modules/vitest/vitest.mjs run tests/integracao-mercadopago.test.ts
const token = process.env.MERCADOPAGO_ACCESS_TOKEN ?? "";
const ativo = process.env.INTEGRACAO === "1" && token.startsWith("TEST-");

describe.skipIf(!ativo)("Mercado Pago sandbox", () => {
  const mp = criarClienteMercadoPago(token);

  it("cria a preferência com o valor do pedido e devolve o link de pagamento de teste", async () => {
    const pedidoId = randomUUID();
    const p = await mp.criarPreferencia({
      pedidoId,
      titulo: "Pague 2, leve 3: teste de integração",
      valorCentavos: 6700,
      emailComprador: "comprador-teste@example.com",
      urlRetorno: "https://skills-sandy-seven.vercel.app/loja/retorno/",
      urlNotificacao: "https://skills-sandy-seven.vercel.app/api/loja/webhook?source_news=webhooks",
    });
    expect(p.id).toMatch(/\S+/);
    expect(p.init_point).toMatch(/^https:\/\//);
    expect(p.sandbox_init_point ?? "").toMatch(/^https:\/\/sandbox\./);

    // Ainda não pago: a busca pelo pedido não devolve pagamento
    expect(await mp.pagamentosDoPedido(pedidoId)).toEqual([]);
  });

  it("pagamento inexistente volta null, sem lançar erro", async () => {
    expect(await mp.buscarPagamento("1")).toBeNull();
    expect(await mp.buscarPagamento("abc")).toBeNull();
  });
});
