import { readdirSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { VITRINE_INICIAL } from "@/lib/loja/apresentacao";
import type { Catalogo, Oferta, Produto } from "@/lib/loja/dominio";
import { montarPaginaInicial } from "@/lib/loja/paginaInicial";
import { PAGINAS_VIDEOS } from "@/lib/loja/paginas-videos";
import { PAGINAS_ANTIGAS } from "@/lib/paginas-antigas";

function produto(slug: string, ordem: number, precoAvulsoCentavos: number | null = null): Produto {
  return {
    slug,
    titulo: `Título ${slug}`,
    resumo: `Resumo ${slug}`,
    ordem,
    githubUrl: null,
    precoAvulsoCentavos,
    destaques: [],
    qtdSkills: 10,
    qtdAgentes: 5,
    qtdPrompts: 6,
    aulaDuracaoS: null,
    precoBumpCentavos: null,
    soBump: false,
    precoCheioCentavos: null,
  };
}

function oferta(codigo: string, tipo: Oferta["tipo"], precoCentavos: number, extra: Partial<Oferta> = {}): Oferta {
  return { codigo, titulo: codigo, descricao: "", tipo, qtdEscolha: tipo === "escolha" ? 1 : null, precoCentavos, exigeCliente: false, descontoPercentual: null, ordem: 0, itens: [], ...extra };
}

// Mesmo estado do banco em produção: times-de-agentes é o primeiro pela ordem do banco, edição tem preço próprio
const CATALOGO: Catalogo = {
  produtos: [
    produto("times-de-agentes", 0),
    produto("design-copy-anuncios", 1),
    produto("edicao-de-video", 2, 3700),
    produto("motion-mockup-fontes", 3),
    produto("programacao-sem-codigo", 4),
  ],
  ofertas: [
    oferta("avulso", "escolha", 2700),
    oferta("cliente", "escolha", 2700, { exigeCliente: true, descontoPercentual: 20 }),
    oferta("leve-3", "escolha", 6700, { qtdEscolha: 3 }),
    oferta("combo", "todos", 9700),
  ],
  bumps: [],
};

describe("página inicial de vendas", () => {
  const pagina = montarPaginaInicial(CATALOGO);
  const porId = (id: string) => pagina.cartoes.find((c) => c.id === id)!;

  it("segue a ordem do dono, não a do banco, e termina com a Coleção Completa", () => {
    expect(pagina.estado).toBe("ok");
    expect(pagina.cartoes.map((c) => c.slug)).toEqual([...VITRINE_INICIAL.map((v) => v.slug), "completo"]);
    expect(pagina.cartoes[0]).toMatchObject({ variante: "destaque", titulo: "Kit Vitrine de Vendas", tag: { texto: "Comece por aqui" } });
    expect(porId("pacote-times-de-agentes").tag?.texto).toBe("Novo");
  });

  it("avulsos mostram só o preço do banco, sem riscado", () => {
    expect(porId("pacote-design-copy-anuncios").preco).toMatchObject({ centavos: 2700, anterior: null, economia: null });
    expect(porId("pacote-edicao-de-video").preco).toMatchObject({ centavos: 3700, anterior: null });
    expect(porId("pacote-design-copy-anuncios").href).toBe("/pacotes/kit-vitrine-de-vendas/");
  });

  it("pacote completo riscado pela soma real dos avulsos", () => {
    const completo = porId("pacote-completo");
    expect(completo.preco).toMatchObject({ centavos: 9700, anterior: 14500, economia: 4800 });
    expect(completo.href).toBe("/loja/checkout/?oferta=combo");
    expect(completo.inclui).toEqual(VITRINE_INICIAL.map((v) => v.curto));
  });

  it("banco fora do ar: cards sem preço, nenhum valor de reserva", () => {
    const p = montarPaginaInicial(null);
    expect(p.estado).toBe("erro");
    expect(p.cartoes.length).toBeGreaterThan(0);
    expect(p.cartoes.every((c) => c.preco === null)).toBe(true);
  });

  it("nenhum pacote à venda vira o estado vazio", () => {
    expect(montarPaginaInicial({ ...CATALOGO, produtos: [] }).estado).toBe("vazio");
  });

  it("cada card lista os agentes grátis do seu pacote; o completo lista todos", () => {
    expect(porId("pacote-completo").agentes).toHaveLength(PAGINAS_VIDEOS.length);
    expect(porId("pacote-times-de-agentes").agentes?.map((a) => a.pasta)).toEqual(["agentes", "harvey", "mesa-de-validacao", "prompt-bola-de-cristal", "guia", "leis", "fabrica", "faxina-de-pastas", "aprender", "arena"]);
    expect(porId("pacote-edicao-de-video").agentes?.map((a) => a.pasta)).toEqual(["editar", "trem", "motion"]);
    expect(pagina.agentes.find((a) => a.pasta === "revisao-tripla")?.pacoteCurto).toBe("Kit Código Seguro");
  });
});

describe("fonte única das páginas dos vídeos", () => {
  const publico = new URL("../public/", import.meta.url);

  it("toda página em public/<pasta>/index.html está cadastrada em paginas-videos.ts", () => {
    const pastas = readdirSync(publico, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(new URL(`${d.name}/index.html`, publico)))
      .map((d) => d.name)
      .filter((p) => p !== "pagina-agentes");
    const cadastradas = PAGINAS_VIDEOS.map((p) => p.pasta);
    expect(pastas.filter((p) => !cadastradas.includes(p))).toEqual([]);
    expect(cadastradas.filter((p) => !pastas.includes(p))).toEqual([]);
  });

  it("os endereços antigos continuam no rewrite fixo; a página inicial saiu dele", () => {
    expect([...PAGINAS_ANTIGAS].sort()).toEqual(["agentes", "clonadora", "freellm", "harvey", "mesa-de-validacao", "pagina-agentes", "ranking", "revisao-tripla"]);
  });
});

describe("duração da aula", () => {
  it("mostra segundos até um minuto e meio e minutos depois", async () => {
    const { formatarDuracao } = await import("@/lib/loja/dominio");
    expect(formatarDuracao(74)).toBe("74 s");
    expect(formatarDuracao(151)).toBe("2 min 31 s");
    expect(formatarDuracao(120)).toBe("2 min");
  });
});
