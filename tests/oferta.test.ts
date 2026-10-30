import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { destinoSeguro } from "@/lib/auth/cookies";
import { formatarReais, montarPedido, ofertaParaMaisUm, PedidoInvalido, precoNaOferta, type Catalogo } from "@/lib/loja/dominio";
import { OFERTA_DOS_VIDEOS } from "@/lib/loja/paginas-videos";
import { montarVitrine } from "@/lib/loja/vitrine";

// O catálogo do teste é lido do próprio SQL de dados iniciais: o teste quebra se o preço do banco mudar sem querer.
function catalogoDoSeed(): Catalogo {
  const sql = readFileSync(new URL("../banco/0001_loja.sql", import.meta.url), "utf8");
  const ofertas = [...sql.matchAll(/\('([a-z0-9-]+)', '([^']+)', '([^']+)', '(escolha|fixa|todos)', (null|\d+), (\d+), (\d+)\)/g)];
  const produtos = [...sql.matchAll(/\('([a-z0-9-]+)', '([^']+)',\s*'([^']+)', (\d+),\s*'[^']*', (null|\d+)\)/g)];
  return {
    produtos: produtos.map((m) => ({
      slug: m[1]!,
      titulo: m[2]!,
      resumo: m[3]!,
      ordem: Number(m[4]),
      githubUrl: null,
      precoAvulsoCentavos: m[5] === "null" ? null : Number(m[5]),
      destaques: [],
      qtdSkills: 0,
      qtdAgentes: 0,
      qtdPrompts: 0,
      aulaDuracaoS: null,
    })),
    ofertas: ofertas.map((m) => ({
      codigo: m[1]!,
      titulo: m[2]!,
      descricao: m[3]!,
      tipo: m[4] as "escolha" | "fixa" | "todos",
      qtdEscolha: m[5] === "null" ? null : Number(m[5]),
      precoCentavos: Number(m[6]),
      exigeCliente: false,
      descontoPercentual: null,
      ordem: Number(m[7]),
      itens: [],
    })),
  };
}

const cat = catalogoDoSeed();
const nada = new Set<string>();

function motivo(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    if (e instanceof PedidoInvalido) return e.motivo;
    throw e;
  }
  return "sem_erro";
}

describe("catálogo do banco", () => {
  it("tem os 5 produtos e as 3 ofertas abertas", () => {
    expect(cat.produtos.map((p) => p.slug)).toHaveLength(5);
    expect(cat.ofertas.map((o) => o.codigo)).toEqual(["avulso", "leve-3", "combo"]);
  });
});

describe("valores das ofertas", () => {
  it("avulso sai R$ 37,00 nos pacotes sem preço próprio", () => {
    for (const slug of ["design-copy-anuncios", "motion-mockup-fontes", "programacao-sem-codigo", "times-de-agentes"]) {
      const p = montarPedido(cat, "avulso", [slug], nada);
      expect(p.valorCentavos).toBe(3700);
      expect(p.itens).toEqual([slug]);
    }
    expect(formatarReais(3700)).toBe("R$\u00a037,00");
  });

  it("edição de vídeo avulso sai R$ 47,00, preço próprio do produto no banco", () => {
    const p = montarPedido(cat, "avulso", ["edicao-de-video"], nada);
    expect(p.valorCentavos).toBe(4700);
    expect(formatarReais(p.valorCentavos)).toBe("R$\u00a047,00");
  });

  it("pague 2, leve 3 sai R$ 67,00 com três produtos", () => {
    const p = montarPedido(cat, "leve-3", ["times-de-agentes", "edicao-de-video", "programacao-sem-codigo"], nada);
    expect(p.valorCentavos).toBe(6700);
    expect(p.itens).toHaveLength(3);
    expect(formatarReais(p.valorCentavos)).toBe("R$\u00a067,00");
  });

  it("o leve 3 com o de vídeo dentro continua R$ 67,00", () => {
    const p = montarPedido(cat, "leve-3", ["edicao-de-video", "design-copy-anuncios", "times-de-agentes"], nada);
    expect(p.valorCentavos).toBe(6700);
  });

  it("o pacote de vídeo de R$ 97,00 não existe mais", () => {
    expect(motivo(() => montarPedido(cat, "video", [], nada))).toBe("oferta_inexistente");
  });

  it("o combo ignora a lista que o cliente mandar", () => {
    const p = montarPedido(cat, "combo", ["programacao-sem-codigo"], nada);
    expect(p.itens).toHaveLength(5);
  });

  it("combo sai R$ 127,00 com todos os produtos", () => {
    const p = montarPedido(cat, "combo", [], nada);
    expect(p.valorCentavos).toBe(12700);
    expect(p.itens).toEqual(cat.produtos.map((x) => x.slug).sort());
    expect(formatarReais(p.valorCentavos)).toBe("R$\u00a0127,00");
  });
});

describe("regra validada no backend", () => {
  it("recusa quantidade errada na escolha", () => {
    expect(motivo(() => montarPedido(cat, "leve-3", ["edicao-de-video", "times-de-agentes"], nada))).toBe("quantidade_errada");
    expect(motivo(() => montarPedido(cat, "avulso", [], nada))).toBe("quantidade_errada");
  });

  it("recusa produto repetido para não levar 3 pagando por menos itens", () => {
    expect(motivo(() => montarPedido(cat, "leve-3", ["edicao-de-video", "edicao-de-video", "times-de-agentes"], nada))).toBe(
      "produto_repetido",
    );
  });

  it("recusa produto inexistente e oferta inexistente", () => {
    expect(motivo(() => montarPedido(cat, "avulso", ["vox"], nada))).toBe("produto_inexistente");
    expect(motivo(() => montarPedido(cat, "gratis", [], nada))).toBe("oferta_inexistente");
  });

  it("recusa comprar de novo o que já tem", () => {
    const possui = new Set(["edicao-de-video"]);
    expect(motivo(() => montarPedido(cat, "avulso", ["edicao-de-video"], possui))).toBe("ja_possui");
    const tudo = new Set(cat.produtos.map((p) => p.slug));
    expect(motivo(() => montarPedido(cat, "combo", [], tudo))).toBe("ja_possui");
  });

  it("a chave do pedido não depende da ordem da escolha (duplo clique vira o mesmo pedido)", () => {
    const a = montarPedido(cat, "leve-3", ["times-de-agentes", "edicao-de-video", "programacao-sem-codigo"], nada);
    const b = montarPedido(cat, "leve-3", ["programacao-sem-codigo", "times-de-agentes", "edicao-de-video"], nada);
    expect(a.chaveItens).toBe(b.chaveItens);
  });
});

describe("desconto de cliente de 20% (percentual vem do banco)", () => {
  // Mesma linha que a migração 0003 deixa ativa: oferta "cliente", um pacote, 20% sobre o avulso
  const cliente = {
    codigo: "cliente",
    titulo: "Preço de cliente",
    descricao: "x",
    tipo: "escolha" as const,
    qtdEscolha: 1,
    precoCentavos: 3700,
    exigeCliente: true,
    descontoPercentual: 20,
    ordem: 5,
    itens: [],
  };
  const comCliente: Catalogo = { ...cat, ofertas: [...cat.ofertas, cliente] };
  const jaCliente = new Set(["times-de-agentes"]);

  it("quem ainda não comprou não usa a oferta de cliente", () => {
    expect(motivo(() => montarPedido(comCliente, "cliente", ["edicao-de-video"], nada))).toBe("so_clientes");
  });

  it("cliente paga 80% do avulso de cada pacote, calculado no servidor", () => {
    expect(montarPedido(comCliente, "cliente", ["design-copy-anuncios"], jaCliente).valorCentavos).toBe(2960);
    expect(montarPedido(comCliente, "cliente", ["edicao-de-video"], jaCliente).valorCentavos).toBe(3760);
    expect(formatarReais(2960)).toBe("R$ 29,60");
  });

  it("o desconto não vale para pacote que o cliente já tem", () => {
    expect(motivo(() => montarPedido(comCliente, "cliente", ["times-de-agentes"], jaCliente))).toBe("ja_possui");
  });

  it("a área de membros usa a oferta de cliente só para quem já comprou", () => {
    expect(ofertaParaMaisUm(comCliente, true)?.codigo).toBe("cliente");
    expect(ofertaParaMaisUm(comCliente, false)?.codigo).toBe("avulso");
    expect(ofertaParaMaisUm(cat, true)?.codigo).toBe("avulso");
  });
});

describe("destino depois do login", () => {
  it("aceita caminho interno", () => {
    expect(destinoSeguro("/membros/edicao-de-video/")).toBe("/membros/edicao-de-video/");
    expect(destinoSeguro("/loja/?oferta=leve-3&produtos=a,b")).toBe("/loja/?oferta=leve-3&produtos=a,b");
  });
  it("recusa endereço externo disfarçado", () => {
    for (const ruim of ["//evil.example", "/\\evil.example", "/\t/evil.example", "/\n/evil.example", "https://evil.example", "evil", ""]) {
      expect(destinoSeguro(ruim)).toBe("/membros/");
    }
  });
});

describe("vitrine das páginas dos vídeos (preços do banco)", () => {
  it("cada vídeo do mapa aponta para um pacote que existe no banco", () => {
    for (const [pagina, cfg] of Object.entries(OFERTA_DOS_VIDEOS)) {
      expect(cat.produtos.some((p) => p.slug === cfg.pacote), pagina).toBe(true);
    }
  });

  it("o pacote do vídeo sai por R$ 37 e leva à compra direta daquele pacote", () => {
    const v = montarVitrine(cat, "agentes");
    expect(v.pacote?.slug).toBe("times-de-agentes");
    expect(v.pacote?.precoTexto).toBe("R$\u00a037,00");
    expect(v.pacote?.comprarUrl).toBe("/loja/checkout/?oferta=avulso&produtos=times-de-agentes");
    expect(montarVitrine(cat, "clonadora").pacote?.slug).toBe("design-copy-anuncios");
    expect(montarVitrine(cat, "harvey").pacote?.slug).toBe("times-de-agentes");
  });

  it("o pacote de edição de vídeo, se for o do vídeo, sai por R$ 47", () => {
    const avulso = cat.ofertas.find((o) => o.codigo === "avulso")!;
    const video = cat.produtos.find((p) => p.slug === "edicao-de-video")!;
    expect(formatarReais(precoNaOferta(cat, avulso, video))).toBe("R$\u00a047,00");
  });

  it("o combo mostra a soma dos avulsos (R$ 195), o preço (R$ 127) e a economia (R$ 68)", () => {
    const c = montarVitrine(cat, "agentes").combo!;
    expect(c.somaTexto).toBe("R$\u00a0195,00");
    expect(c.precoTexto).toBe("R$\u00a0127,00");
    expect(c.economiaTexto).toBe("R$\u00a068,00");
    expect(c.itens).toHaveLength(5);
    expect(c.comprarUrl).toBe("/loja/checkout/?oferta=combo");
  });

  it("página sem pacote no mapa mostra só o combo", () => {
    const v = montarVitrine(cat, "");
    expect(v.pacote).toBeNull();
    expect(v.combo).not.toBeNull();
  });
});
