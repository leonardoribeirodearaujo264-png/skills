import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { enviarEventos, ErroMeta, montarCorpo, normalizarTelefone, type EventoMeta } from "@/lib/meta/conversoes";
import { ID_EVENTO_NAVEGADOR, idEventoCompra, PIXEL_META } from "@/lib/meta/pixel";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");
const CONFIG = { pixel: PIXEL_META, token: "token-falso-de-teste-123456", versao: "v24.0" };
const COMPRA: EventoMeta = {
  nome: "Purchase",
  id: idEventoCompra("4f9b2c1e-8a7d-4c3b-9e2f-1a2b3c4d5e6f"),
  quando: new Date("2026-11-01T12:00:00Z"),
  url: "https://www.leonardoskills.com/loja/checkout/",
  usuario: { email: " Cliente@Example.com ", telefone: "(98) 98464-1079", nome: "Maria Silva", ip: "200.1.2.3", userAgent: "UA", fbp: "fb.1.1.2", fbc: null },
  valorCentavos: 4700,
  conteudos: ["edicao-de-video"],
};

describe("API de Conversões da Meta", () => {
  it("o ID do Pixel do servidor é o mesmo do pixel.js do navegador", () => {
    expect(readFileSync("public/assets/pixel.js", "utf8")).toContain(`"${PIXEL_META}"`);
  });

  it("telefone brasileiro ganha o 55; número inválido sai", () => {
    expect(normalizarTelefone("(98) 98464-1079")).toBe("5598984641079");
    expect(normalizarTelefone("5598984641079")).toBe("5598984641079");
    expect(normalizarTelefone("123")).toBeNull();
  });

  it("manda e-mail, telefone e nome em SHA-256, e IP, navegador e cookie sem hash", () => {
    const corpo = montarCorpo(CONFIG, [COMPRA]) as { data: Array<Record<string, unknown>>; test_event_code?: string };
    const e = corpo.data[0]!;
    expect(e).toMatchObject({ event_name: "Purchase", event_id: COMPRA.id, event_time: 1793534400, action_source: "website" });
    expect(e.user_data).toEqual({
      em: [sha("cliente@example.com")],
      ph: [sha("5598984641079")],
      fn: [sha("maria")],
      client_ip_address: "200.1.2.3",
      client_user_agent: "UA",
      fbp: "fb.1.1.2",
    });
    expect(e.custom_data).toEqual({ currency: "BRL", value: 47, content_ids: ["edicao-de-video"], content_type: "product", num_items: 1 });
    expect(corpo.test_event_code).toBeUndefined();
    expect(JSON.stringify(corpo)).not.toContain("cliente@example.com");
  });

  it("o código de teste vai junto quando configurado", () => {
    const corpo = montarCorpo({ ...CONFIG, codigoTeste: "TEST123" }, [COMPRA]) as { test_event_code?: string };
    expect(corpo.test_event_code).toBe("TEST123");
  });

  it("envia para o Pixel com o token no cabeçalho e devolve quantos eventos a Meta recebeu", async () => {
    let chamada: { url: string; init: RequestInit } | null = null;
    const falso = (async (url: string, init: RequestInit) => {
      chamada = { url, init };
      return new Response(JSON.stringify({ events_received: 1 }), { status: 200 });
    }) as unknown as typeof fetch;
    await expect(enviarEventos(CONFIG, [COMPRA], falso)).resolves.toBe(1);
    expect(chamada!.url).toBe(`https://graph.facebook.com/v24.0/${PIXEL_META}/events`);
    expect((chamada!.init.headers as Record<string, string>).Authorization).toBe(`Bearer ${CONFIG.token}`);
    expect(String(chamada!.init.body)).not.toContain(CONFIG.token);
  });

  it("erro da Meta vira ErroMeta sem expor o token", async () => {
    const falso = (async () =>
      new Response(JSON.stringify({ error: { message: "Invalid OAuth access token" } }), { status: 400 })) as unknown as typeof fetch;
    const erro = await enviarEventos(CONFIG, [COMPRA], falso).catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ErroMeta);
    expect(String((erro as Error).message)).not.toContain(CONFIG.token);
  });

  it("o event_id do navegador tem o formato que o servidor aceita", () => {
    expect(ID_EVENTO_NAVEGADOR.test("checkout-1b4e28ba-2fa1-11d2-883f-0016d3cca427")).toBe(true);
    expect(ID_EVENTO_NAVEGADOR.test("qualquer coisa")).toBe(false);
  });
});

describe("configuração da API de Conversões", () => {
  const original = { ...process.env };
  const comEnv = async (valores: Record<string, string | undefined>) => {
    process.env = { ...original, ...valores } as NodeJS.ProcessEnv;
    const { configMeta } = await import("@/lib/meta/servidor");
    try {
      return configMeta();
    } finally {
      process.env = original;
    }
  };

  it("variável vazia ou inválida desliga só a API de Conversões, sem lançar erro", async () => {
    await expect(comEnv({ META_CAPI_TOKEN: "" })).resolves.toBeNull();
    await expect(comEnv({ META_CAPI_TOKEN: "token-valido-de-teste-1234567", META_CAPI_TEST_CODE: "errado" })).resolves.toBeNull();
    await expect(comEnv({ META_CAPI_TOKEN: "token-valido-de-teste-1234567", META_GRAPH_VERSION: "" })).resolves.toMatchObject({ versao: "v24.0" });
  });
});
