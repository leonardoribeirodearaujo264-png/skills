import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { montarManifest, validarAssinatura } from "@/lib/mercadopago/assinatura";
import type { ClienteMercadoPago, Pagamento } from "@/lib/mercadopago/api";
import { processarPagamento, type PedidoSalvo, type RepoPagamento } from "@/lib/loja/pagamento";

const SEGREDO = "segredo-de-teste-com-tamanho-suficiente";

function assinar(dataId: string, requestId: string, ts: string, segredo = SEGREDO): string {
  const v1 = createHmac("sha256", segredo).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest("hex");
  return `ts=${ts},v1=${v1}`;
}

describe("assinatura x-signature", () => {
  it("monta o manifest no formato da documentação e omite o que faltar", () => {
    expect(montarManifest("123", "abc", "1700")).toBe("id:123;request-id:abc;ts:1700;");
    expect(montarManifest(null, "abc", "1700")).toBe("request-id:abc;ts:1700;");
    expect(montarManifest("ABC9", null, "1700")).toBe("id:abc9;ts:1700;");
  });

  it("aceita assinatura correta", () => {
    const r = validarAssinatura({ xSignature: assinar("987", "req-1", "1742505638683"), xRequestId: "req-1", dataId: "987", segredo: SEGREDO });
    expect(r.valida).toBe(true);
  });

  it("recusa segredo errado, data.id trocado, request-id trocado e cabeçalho ausente", () => {
    const cab = assinar("987", "req-1", "1742505638683");
    expect(validarAssinatura({ xSignature: assinar("987", "req-1", "1", "outro-segredo-qualquer"), xRequestId: "req-1", dataId: "987", segredo: SEGREDO }).valida).toBe(false);
    expect(validarAssinatura({ xSignature: cab, xRequestId: "req-1", dataId: "988", segredo: SEGREDO }).valida).toBe(false);
    expect(validarAssinatura({ xSignature: cab, xRequestId: "req-2", dataId: "987", segredo: SEGREDO }).valida).toBe(false);
    expect(validarAssinatura({ xSignature: null, xRequestId: "req-1", dataId: "987", segredo: SEGREDO }).valida).toBe(false);
    expect(validarAssinatura({ xSignature: "ts=1,v1=zz", xRequestId: "req-1", dataId: "987", segredo: SEGREDO }).valida).toBe(false);
  });
});

// Repositório em memória com as mesmas regras das funções SQL loja_liberar_pedido e loja_estornar_pagamento
function repoEmMemoria(pedido: PedidoSalvo, itens: string[]) {
  const acessos = new Map<string, string>();
  const estornados = new Set<string>();
  const contas = new Map<string, string>();
  let liberacoes = 0;
  const repo: RepoPagamento = {
    async pedidoPorId(id) {
      return id === pedido.id ? { ...pedido } : null;
    },
    // Igual ao Auth: um e-mail, uma conta; nunca troca a conta já ligada ao pedido
    async garantirConta(_id, email) {
      if (!contas.has(email)) contas.set(email, `conta-${contas.size + 1}`);
      if (pedido.userId) return "ja_vinculado";
      pedido.userId = contas.get(email)!;
      return "vinculado";
    },
    async liberar(id, paymentId, valor) {
      if (estornados.has(paymentId)) return "estornado";
      if (pedido.status === "pago") return pedido.mpPaymentId === paymentId ? "ja_pago" : "pagamento_duplicado";
      if (pedido.status === "reembolsado") return "reembolsado";
      if (valor !== pedido.valorCentavos) return "valor_divergente";
      if (!pedido.userId) return "sem_conta";
      pedido.status = "pago";
      pedido.mpPaymentId = paymentId;
      liberacoes++;
      for (const s of itens) if (!acessos.has(s)) acessos.set(s, id);
      return "liberado";
    },
    async estornar(_id, paymentId) {
      if (pedido.status !== "pago" || pedido.mpPaymentId !== paymentId) {
        estornados.add(paymentId);
        return "estorno_registrado";
      }
      estornados.add(paymentId);
      pedido.status = "reembolsado";
      acessos.clear();
      return "revogado";
    },
    async marcarRecusado() {
      if (pedido.status === "pendente") pedido.status = "recusado";
    },
  };
  return { repo, acessos, contas, liberacoes: () => liberacoes, pedido };
}

function mpCom(pagamentos: Record<string, Pagamento>): ClienteMercadoPago {
  return {
    criarPreferencia: async () => {
      throw new Error("não usado");
    },
    buscarPagamento: async (id) => pagamentos[id] ?? null,
    pagamentosDoPedido: async () => Object.values(pagamentos),
  };
}

const PEDIDO = "4f9b2c1e-8a7d-4c3b-9e2f-1a2b3c4d5e6f";
const pagamento = (p: Partial<Pagamento>): Pagamento => ({
  id: "111",
  status: "approved",
  status_detail: "accredited",
  external_reference: PEDIDO,
  transaction_amount: 67,
  currency_id: "BRL",
  ...p,
});
const novoPedido = (): PedidoSalvo => ({
  id: PEDIDO,
  userId: "u1",
  email: "cliente@example.com",
  status: "pendente",
  valorCentavos: 6700,
  mpPaymentId: null,
  estornados: [],
});

describe("liberação pelo pagamento", () => {
  it("pagamento aprovado libera os 3 produtos uma única vez, mesmo com notificação repetida", async () => {
    const m = repoEmMemoria(novoPedido(), ["a", "b", "c"]);
    const deps = { mp: mpCom({ "111": pagamento({}) }), repo: m.repo };
    expect((await processarPagamento(deps, "111")).resultado).toBe("liberado");
    expect((await processarPagamento(deps, "111")).resultado).toBe("ja_pago");
    expect((await processarPagamento(deps, "111")).resultado).toBe("ja_pago");
    expect(m.liberacoes()).toBe(1);
    expect([...m.acessos.keys()]).toEqual(["a", "b", "c"]);
  });

  it("não libera com valor diferente do pedido nem com outra moeda", async () => {
    const m = repoEmMemoria(novoPedido(), ["a"]);
    const deps = { mp: mpCom({ "1": pagamento({ id: "1", transaction_amount: 1 }), "2": pagamento({ id: "2", currency_id: "USD" }) }), repo: m.repo };
    expect((await processarPagamento(deps, "1")).resultado).toBe("valor_divergente");
    expect((await processarPagamento(deps, "2")).resultado).toBe("moeda_divergente");
    expect(m.acessos.size).toBe(0);
  });

  it("não libera pagamento pendente, recusado ou sem referência válida", async () => {
    const m = repoEmMemoria(novoPedido(), ["a"]);
    const deps = {
      mp: mpCom({
        "1": pagamento({ id: "1", status: "in_process" }),
        "2": pagamento({ id: "2", external_reference: "qualquer" }),
        "3": pagamento({ id: "3", status: "rejected" }),
      }),
      repo: m.repo,
    };
    expect((await processarPagamento(deps, "1")).resultado).toBe("aguardando");
    expect((await processarPagamento(deps, "2")).resultado).toBe("sem_referencia");
    expect((await processarPagamento(deps, "999")).resultado).toBe("pagamento_inexistente");
    expect((await processarPagamento(deps, "3")).resultado).toBe("recusado");
    expect(m.pedido.status).toBe("recusado");
    expect(m.acessos.size).toBe(0);
  });

  it("depois de recusado, um novo pagamento aprovado do mesmo pedido libera", async () => {
    const m = repoEmMemoria(novoPedido(), ["a"]);
    const deps = { mp: mpCom({ "3": pagamento({ id: "3", status: "rejected" }), "4": pagamento({ id: "4" }) }), repo: m.repo };
    await processarPagamento(deps, "3");
    expect((await processarPagamento(deps, "4")).resultado).toBe("liberado");
  });

  it("estorno só revoga quando é o pagamento que liberou", async () => {
    const m = repoEmMemoria(novoPedido(), ["a"]);
    const deps = {
      mp: mpCom({ "111": pagamento({}), "5": pagamento({ id: "5", status: "refunded" }) }),
      repo: m.repo,
    };
    await processarPagamento(deps, "111");
    expect((await processarPagamento(deps, "5")).resultado).toBe("estorno_registrado");
    expect(m.acessos.size).toBe(1);
    const deps2 = { mp: mpCom({ "111": pagamento({ status: "charged_back" }) }), repo: m.repo };
    expect((await processarPagamento(deps2, "111")).resultado).toBe("revogado");
    expect(m.acessos.size).toBe(0);
  });

  it("estorno que chega antes da aprovação impede a liberação atrasada do mesmo pagamento", async () => {
    const m = repoEmMemoria(novoPedido(), ["a"]);
    await processarPagamento({ mp: mpCom({ "7": pagamento({ id: "7", status: "refunded" }) }), repo: m.repo }, "7");
    const r = await processarPagamento({ mp: mpCom({ "7": pagamento({ id: "7" }) }), repo: m.repo }, "7");
    expect(r.resultado).toBe("estornado");
    expect(m.acessos.size).toBe(0);
  });

  it("segundo pagamento aprovado no mesmo pedido vira alerta, sem liberar de novo", async () => {
    const m = repoEmMemoria(novoPedido(), ["a"]);
    const deps = { mp: mpCom({ "111": pagamento({}), "112": pagamento({ id: "112" }) }), repo: m.repo };
    await processarPagamento(deps, "111");
    expect((await processarPagamento(deps, "112")).resultado).toBe("pagamento_duplicado");
    expect(m.liberacoes()).toBe(1);
  });
});

describe("e-mail de acesso", () => {
  // Trava igual à do banco: só a primeira reserva ganha
  function avisoComTrava(falharVezes = 0) {
    let reservado = false;
    let enviados = 0;
    let falhas = falharVezes;
    const avisar = async () => {
      if (reservado) return;
      reservado = true;
      if (falhas > 0) {
        falhas--;
        reservado = false;
        throw new Error("smtp fora");
      }
      enviados++;
    };
    return { avisar, enviados: () => enviados };
  }

  it("sai uma única vez por compra, mesmo com o webhook repetido", async () => {
    const m = repoEmMemoria(novoPedido(), ["a"]);
    const aviso = avisoComTrava();
    const deps = { mp: mpCom({ "111": pagamento({}) }), repo: m.repo, avisarAcesso: aviso.avisar };
    await processarPagamento(deps, "111");
    await processarPagamento(deps, "111");
    await Promise.all([processarPagamento(deps, "111"), processarPagamento(deps, "111")]);
    expect(aviso.enviados()).toBe(1);
  });

  it("se o envio falhar, o erro sobe e a próxima notificação manda", async () => {
    const m = repoEmMemoria(novoPedido(), ["a"]);
    const aviso = avisoComTrava(1);
    const deps = { mp: mpCom({ "111": pagamento({}) }), repo: m.repo, avisarAcesso: aviso.avisar };
    await expect(processarPagamento(deps, "111")).rejects.toThrow("smtp fora");
    expect(m.acessos.size).toBe(1);
    await processarPagamento(deps, "111");
    expect(aviso.enviados()).toBe(1);
  });

  it("pagamento não aprovado não manda e-mail", async () => {
    const m = repoEmMemoria(novoPedido(), ["a"]);
    const aviso = avisoComTrava();
    await processarPagamento({ mp: mpCom({ "1": pagamento({ id: "1", status: "pending" }) }), repo: m.repo, avisarAcesso: aviso.avisar }, "1");
    expect(aviso.enviados()).toBe(0);
  });
});

describe("compra sem login", () => {
  const pedidoSemConta = (): PedidoSalvo => ({ ...novoPedido(), userId: null });

  it("a aprovação cria a conta pelo e-mail da compra e libera o acesso", async () => {
    const m = repoEmMemoria(pedidoSemConta(), ["a"]);
    const r = await processarPagamento({ mp: mpCom({ "111": pagamento({}) }), repo: m.repo }, "111");
    expect(r.resultado).toBe("liberado");
    expect(m.pedido.userId).toBe("conta-1");
    expect(m.acessos.size).toBe(1);
  });

  it("webhook reenviado não cria segunda conta nem segundo acesso", async () => {
    const m = repoEmMemoria(pedidoSemConta(), ["a", "b"]);
    const deps = { mp: mpCom({ "111": pagamento({}) }), repo: m.repo };
    await Promise.all([processarPagamento(deps, "111"), processarPagamento(deps, "111")]);
    await processarPagamento(deps, "111");
    expect(m.contas.size).toBe(1);
    expect(m.liberacoes()).toBe(1);
    expect([...m.acessos.keys()]).toEqual(["a", "b"]);
  });

  it("aprovação com valor errado não cria conta", async () => {
    const m = repoEmMemoria(pedidoSemConta(), ["a"]);
    const r = await processarPagamento({ mp: mpCom({ "9": pagamento({ id: "9", transaction_amount: 1 }) }), repo: m.repo }, "9");
    expect(r.resultado).toBe("valor_divergente");
    expect(m.contas.size).toBe(0);
  });

  it("pagamento pendente ou recusado não cria conta", async () => {
    const m = repoEmMemoria(pedidoSemConta(), ["a"]);
    await processarPagamento({ mp: mpCom({ "1": pagamento({ id: "1", status: "pending" }) }), repo: m.repo }, "1");
    await processarPagamento({ mp: mpCom({ "2": pagamento({ id: "2", status: "rejected" }) }), repo: m.repo }, "2");
    expect(m.contas.size).toBe(0);
    expect(m.pedido.userId).toBeNull();
  });
});
