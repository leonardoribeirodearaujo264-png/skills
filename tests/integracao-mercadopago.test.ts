import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { criarClienteMercadoPago } from "@/lib/mercadopago/api";

// Chama a API real do Mercado Pago com a credencial de TESTE. Só roda quando pedido:
// INTEGRACAO=1 node --env-file=.env.local node_modules/vitest/vitest.mjs run tests/integracao-mercadopago.test.ts
const token = process.env.MERCADOPAGO_ACCESS_TOKEN ?? "";
const chavePublica = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? "";
const ativo = process.env.INTEGRACAO === "1" && token.startsWith("TEST-");

describe.skipIf(!ativo)("Mercado Pago sandbox: pagamento no site", () => {
  const mp = criarClienteMercadoPago(token);

  it("cria o Pix com QR e copia e cola, e repetir o mesmo pedido devolve o mesmo Pix", async () => {
    const pedidoId = randomUUID();
    const dados = {
      pedidoId,
      valorCentavos: 3700,
      descricao: "Avulso: teste de integração",
      email: "comprador-teste@example.com",
      urlNotificacao: "https://skills-sandy-seven.vercel.app/api/webhooks/mercadopago",
      expiraEm: new Date(Date.now() + 14 * 60 * 1000),
      nome: { primeiro: "Comprador", sobrenome: "Teste" },
    };
    const pix = await mp.criarPix(dados);
    expect(pix.status).toBe("pending");
    expect(pix.copiaECola.length).toBeGreaterThan(50);
    expect(pix.qrBase64.length).toBeGreaterThan(100);
    const deNovo = await mp.criarPix(dados);
    expect(deNovo.id).toBe(pix.id);
    const doPedido = await mp.pagamentosDoPedido(pedidoId);
    expect(doPedido.map((p) => p.id)).toContain(pix.id);
  }, 30_000);

  it("o formulário de cartão gera token com a chave pública (o pagamento em si exige conta de teste)", async () => {
    const r = await fetch(`https://api.mercadopago.com/v1/card_tokens?public_key=${chavePublica}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        card_number: "5031433215406351",
        expiration_month: 11,
        expiration_year: 2030,
        security_code: "123",
        cardholder: { name: "APRO", identification: { type: "CPF", number: "12345678909" } },
      }),
    });
    expect(r.status).toBe(201);
  });

  it("pagamento inexistente volta null, sem lançar erro", async () => {
    expect(await mp.buscarPagamento("1")).toBeNull();
    expect(await mp.buscarPagamento("abc")).toBeNull();
  });
});
