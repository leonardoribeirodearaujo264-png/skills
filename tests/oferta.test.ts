import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { destinoSeguro } from "@/lib/auth/cookies";
import {
  adicionarBumps,
  bumpsParaPedido,
  formatarReais,
  montarPedido,
  ofertaParaMaisUm,
  PedidoInvalido,
  precoNaOferta,
  type Catalogo,
} from "@/lib/loja/dominio";
import { OFERTA_DOS_VIDEOS } from "@/lib/loja/paginas-videos";
import { montarCatalogo, montarVitrine } from "@/lib/loja/vitrine";

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
      precoBumpCentavos: null,
      soBump: false,
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
    bumps: [],
  };
}

// 0006 e 0008: leve 3 a R$ 47 e combo a R$ 97 (o seed do 0001 ainda tem os preços antigos)
const seed = catalogoDoSeed();
const cat: Catalogo = { ...seed, ofertas: seed.ofertas.map((o) => (o.codigo === "leve-3" ? { ...o, precoCentavos: 4700 } : o.codigo === "combo" ? { ...o, precoCentavos: 9700 } : o)) };
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

  it("pague 2, leve 3 sai R$ 47,00 com três produtos", () => {
    const p = montarPedido(cat, "leve-3", ["times-de-agentes", "edicao-de-video", "programacao-sem-codigo"], nada);
    expect(p.valorCentavos).toBe(4700);
    expect(p.itens).toHaveLength(3);
    expect(formatarReais(p.valorCentavos)).toBe("R$\u00a047,00");
  });

  it("o leve 3 com o de vídeo dentro continua R$ 47,00", () => {
    const p = montarPedido(cat, "leve-3", ["edicao-de-video", "design-copy-anuncios", "times-de-agentes"], nada);
    expect(p.valorCentavos).toBe(4700);
  });

  it("o pacote de vídeo de R$ 97,00 não existe mais", () => {
    expect(motivo(() => montarPedido(cat, "video", [], nada))).toBe("oferta_inexistente");
  });

  it("o combo ignora a lista que o cliente mandar", () => {
    const p = montarPedido(cat, "combo", ["programacao-sem-codigo"], nada);
    expect(p.itens).toHaveLength(5);
  });

  it("combo sai R$ 97,00 com todos os produtos", () => {
    const p = montarPedido(cat, "combo", [], nada);
    expect(p.valorCentavos).toBe(9700);
    expect(p.itens).toEqual(cat.produtos.map((x) => x.slug).sort());
    expect(formatarReais(p.valorCentavos)).toBe("R$\u00a097,00");
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
    // Gancho com o preço vindo do banco e descrição própria do card na página /agentes/
    expect(v.pacote?.gancho).toBe("Sua equipe inteira de IA, por R$ 37,00");
    expect(v.pacote?.descricao).toContain("25 agentes cobrindo marketing, vendas, financeiro");
  });

  it("o pacote de edição de vídeo, se for o do vídeo, sai por R$ 47", () => {
    const avulso = cat.ofertas.find((o) => o.codigo === "avulso")!;
    const video = cat.produtos.find((p) => p.slug === "edicao-de-video")!;
    expect(formatarReais(precoNaOferta(cat, avulso, video))).toBe("R$\u00a047,00");
  });

  it("o combo mostra a soma dos avulsos (R$ 195), o preço (R$ 97) e a economia (R$ 98)", () => {
    const c = montarVitrine(cat, "agentes").combo!;
    expect(c.somaTexto).toBe("R$\u00a0195,00");
    expect(c.precoTexto).toBe("R$\u00a097,00");
    expect(c.economiaTexto).toBe("R$\u00a098,00");
    expect(c.itens).toHaveLength(5);
    expect(c.comprarUrl).toBe("/loja/checkout/?oferta=combo");
  });

  it("página de vídeo sem pacote no mapa mostra só o combo", () => {
    const v = montarVitrine(cat, "pagina-nova");
    expect(v.pacote).toBeNull();
    expect(v.combo).not.toBeNull();
  });

  it("a página inicial recebe o catálogo, sem o combo antigo repetido", () => {
    const v = montarVitrine(cat, "");
    expect(v.combo).toBeNull();
    expect(v.catalogo?.combo).not.toBeNull();
  });
});

describe("catálogo da página inicial", () => {
  // Mesma ordem do banco depois do 0005: a Equipe Completa de Agentes vem primeiro
  const ordenado: Catalogo = {
    ...cat,
    produtos: [...cat.produtos]
      .map((p) => (p.slug === "times-de-agentes" ? { ...p, ordem: 0, qtdAgentes: 25, qtdSkills: 3, qtdPrompts: 8 } : p))
      .sort((a, b) => a.ordem - b.ordem),
  };

  it("só a página inicial recebe o catálogo", () => {
    expect(montarVitrine(cat, "agentes").catalogo).toBeNull();
    expect(montarVitrine(cat, "").catalogo).not.toBeNull();
  });

  it("mostra os 5 pacotes à venda, com o primeiro da ordem em destaque", () => {
    const c = montarCatalogo(ordenado);
    expect(c.destaque?.slug).toBe("times-de-agentes");
    expect([c.destaque, ...c.pacotes].map((p) => p?.slug)).toHaveLength(5);
    expect(c.pacotes.map((p) => p.slug)).toContain("edicao-de-video");
  });

  it("preços vêm das ofertas do banco: R$ 37, edição de vídeo R$ 47 e combo R$ 97", () => {
    const c = montarCatalogo(ordenado);
    expect(c.destaque?.precoTexto).toBe("R$ 37,00");
    expect(c.pacotes.find((p) => p.slug === "edicao-de-video")?.precoTexto).toBe("R$ 47,00");
    expect(c.combo?.precoTexto).toBe("R$ 97,00");
    expect(c.combo?.itens).toHaveLength(5);
  });

  it("cada pacote tem capa com texto alternativo, página pública e compra direta sem login", () => {
    for (const p of [montarCatalogo(ordenado).destaque!, ...montarCatalogo(ordenado).pacotes]) {
      expect(p.capa?.alt.length, p.slug).toBeGreaterThan(20);
      expect(p.capa?.webp).toBe(`/capas/${p.slug}.webp`);
      expect(existsSync(new URL(`../public${p.capa!.webp}`, import.meta.url)), p.slug).toBe(true);
      expect(existsSync(new URL(`../public${p.capa!.png}`, import.meta.url)), p.slug).toBe(true);
      expect(existsSync(new URL(`../public${p.capa!.mini}`, import.meta.url)), p.slug).toBe(true);
      expect(p.paginaUrl).toBe(`/pacotes/${p.slug}/`);
      expect(p.comprarUrl).toBe(`/loja/checkout/?oferta=avulso&produtos=${p.slug}`);
    }
  });

  it("os números do destaque juntam o banco e os times conferidos no README", () => {
    expect(montarCatalogo(ordenado).destaque?.numeros).toEqual([
      { n: 25, rotulo: "agentes" },
      { n: 6, rotulo: "times" },
      { n: 3, rotulo: "skills" },
      { n: 8, rotulo: "prompts" },
    ]);
  });

  it("sem oferta avulsa aberta não aparece pacote com preço inventado", () => {
    const c = montarCatalogo({ ...ordenado, ofertas: ordenado.ofertas.filter((o) => o.codigo !== "avulso") });
    expect(c.destaque).toBeNull();
    expect(c.pacotes).toEqual([]);
  });
});

describe("ofertas complementares (order bumps)", () => {
  const lancamento = {
    slug: "lancamento-pro",
    titulo: "Lançamento Pro",
    resumo: "15 agentes e 50 skills.",
    ordem: 90,
    githubUrl: null,
    precoAvulsoCentavos: null,
    destaques: [],
    qtdSkills: 50,
    qtdAgentes: 15,
    qtdPrompts: 8,
    aulaDuracaoS: null,
    precoBumpCentavos: 1990,
    soBump: true,
  };
  // 0009: Edição de vídeo por R$ 27 e Motion por R$ 9,90 como complemento (seguem à venda normalmente)
  const comPreco = (slug: string, centavos: number) => ({ ...cat.produtos.find((p) => p.slug === slug)!, precoBumpCentavos: centavos });
  const comBumps: Catalogo = {
    ...cat,
    bumps: [comPreco("edicao-de-video", 2700), comPreco("motion-mockup-fontes", 990), lancamento],
  };

  it("o checkout oferece os três, o vendido só como complemento primeiro", () => {
    expect(bumpsParaPedido(comBumps, ["times-de-agentes"], nada).map((b) => [b.slug, b.precoBumpCentavos])).toEqual([
      ["lancamento-pro", 1990],
      ["edicao-de-video", 2700],
      ["motion-mockup-fontes", 990],
    ]);
  });

  it("não oferece o pacote que já está no pedido nem o que a pessoa já tem", () => {
    const slugs = bumpsParaPedido(comBumps, ["edicao-de-video"], new Set(["lancamento-pro"])).map((b) => b.slug);
    expect(slugs).toEqual(["motion-mockup-fontes"]);
  });

  it("com os três marcados, soma os preços de bump do banco e grava os três itens", () => {
    const base = montarPedido(comBumps, "avulso", ["times-de-agentes"], nada);
    const p = adicionarBumps(comBumps, base, ["lancamento-pro", "motion-mockup-fontes", "edicao-de-video"], nada);
    expect(p.valorCentavos).toBe(3700 + 1990 + 2700 + 990);
    expect(formatarReais(p.valorCentavos)).toBe("R$\u00a093,80");
    expect(p.itens).toEqual(["times-de-agentes", "edicao-de-video", "lancamento-pro", "motion-mockup-fontes"]);
    expect(p.chaveItens).toBe("avulso:times-de-agentes+bump:edicao-de-video,lancamento-pro,motion-mockup-fontes");
  });

  it("a ordem em que a pessoa marca não muda a chave do pedido", () => {
    const base = montarPedido(comBumps, "avulso", ["times-de-agentes"], nada);
    const a = adicionarBumps(comBumps, base, ["motion-mockup-fontes", "lancamento-pro"], nada);
    const b = adicionarBumps(comBumps, base, ["lancamento-pro", "motion-mockup-fontes"], nada);
    expect(a.chaveItens).toBe(b.chaveItens);
  });

  it("sem nenhum marcado, o pedido fica igual", () => {
    const base = montarPedido(comBumps, "avulso", ["times-de-agentes"], nada);
    expect(adicionarBumps(comBumps, base, [], nada)).toEqual(base);
  });

  it("vale também com o leve 3 (R$ 47 + R$ 19,90)", () => {
    const base = montarPedido(comBumps, "leve-3", ["times-de-agentes", "programacao-sem-codigo", "design-copy-anuncios"], nada);
    expect(adicionarBumps(comBumps, base, ["lancamento-pro"], nada).valorCentavos).toBe(4700 + 1990);
  });

  it("recusa bump inexistente, repetido, já no pedido ou que a pessoa já tem", () => {
    const base = montarPedido(comBumps, "avulso", ["edicao-de-video"], nada);
    expect(motivo(() => adicionarBumps(comBumps, base, ["nao-existe"], nada))).toBe("produto_inexistente");
    expect(motivo(() => adicionarBumps(comBumps, base, ["lancamento-pro", "lancamento-pro"], nada))).toBe("produto_repetido");
    expect(motivo(() => adicionarBumps(comBumps, base, ["edicao-de-video"], nada))).toBe("ja_possui");
    expect(motivo(() => adicionarBumps(comBumps, base, ["lancamento-pro"], new Set(["lancamento-pro"])))).toBe("ja_possui");
  });

  it("o vendido só como complemento não entra na vitrine nem no combo", () => {
    expect(comBumps.produtos.some((p) => p.slug === "lancamento-pro")).toBe(false);
    expect(montarPedido(comBumps, "combo", [], nada).itens).not.toContain("lancamento-pro");
  });
});

describe("conteúdo público dos pacotes", () => {
  it("src/lib/loja/conteudo-pacotes.json está igual ao que os arquivos de pacotes/ geram", () => {
    expect(() => execFileSync(process.execPath, ["scripts/gerar-vitrine-pacotes.mjs", "--conferir"], { stdio: "pipe" })).not.toThrow();
  });

  it("o slug do bump não entra como produto de uma oferta de escolha", () => {
    const comBump: Catalogo = { ...cat, bumps: [{ ...cat.produtos[0]!, slug: "lancamento-pro", precoBumpCentavos: 1990, soBump: true }] };
    expect(motivo(() => montarPedido(comBump, "avulso", ["lancamento-pro"], nada))).toBe("produto_inexistente");
  });
});
