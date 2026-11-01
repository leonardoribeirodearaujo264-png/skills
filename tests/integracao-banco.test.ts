import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { contaPorEmail, criarOuReusarPedido, liberarReservaEmail, repoPagamento, reservarEmailAcesso } from "@/lib/loja/repositorio";

// Teste contra o Supabase real (precisa do banco/0001_loja.sql aplicado). Cria usuários de teste
// descartáveis pelo admin, sem senha, e apaga tudo no fim. Só roda quando pedido:
// INTEGRACAO=1 node --env-file=.env.local node_modules/vitest/vitest.mjs run tests/integracao-banco.test.ts
const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICO = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ativo = process.env.INTEGRACAO === "1" && Boolean(URL_SB && ANON && SERVICO);

const semSessao = { auth: { persistSession: false, autoRefreshToken: false } } as const;

type Teste = { id: string; email: string; db: SupabaseClient };

describe.skipIf(!ativo)("banco da loja: RLS e liberação", () => {
  // Criados no beforeAll: o corpo do describe roda mesmo quando ele é pulado
  let admin: SupabaseClient;
  let anon: SupabaseClient;
  const criados: string[] = [];
  let a: Teste;
  let b: Teste;
  let c: Teste;

  async function novoUsuario(): Promise<Teste> {
    const email = `teste-loja-${randomUUID()}@example.com`;
    const u = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (u.error || !u.data.user) throw new Error(`criar usuário: ${u.error?.message}`);
    criados.push(u.data.user.id);
    // Sessão sem senha: o admin gera o token do link e o cliente público o confere
    const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (link.error) throw new Error(`gerar link: ${link.error.message}`);
    const s = await anon.auth.verifyOtp({ token_hash: link.data.properties.hashed_token, type: "magiclink" });
    if (s.error || !s.data.session) throw new Error(`sessão: ${s.error?.message}`);
    const db = createClient(URL_SB, ANON, {
      ...semSessao,
      global: { headers: { Authorization: `Bearer ${s.data.session.access_token}` } },
    });
    return { id: u.data.user.id, email, db };
  }

  async function comprar(u: Teste, oferta: string, itens: string[], valor: number) {
    const itensOrd = [...itens].sort();
    const pedido = await criarOuReusarPedido(admin, { email: u.email, userId: u.id }, oferta, {
      itens: itensOrd,
      valorCentavos: valor,
      chaveItens: `${oferta}:${itensOrd.join(",")}`,
    });
    const pagamento = `teste-${randomUUID()}`;
    const r = await repoPagamento(admin).liberar(pedido.id, pagamento, valor);
    return { pedido, pagamento, r };
  }

  async function slugsComAcesso(u: Teste): Promise<string[]> {
    const { data, error } = await u.db.from("loja_acessos").select("produto_slug").is("revogado_em", null);
    if (error) throw error;
    return data.map((x) => x.produto_slug as string).sort();
  }

  beforeAll(async () => {
    admin = createClient(URL_SB, SERVICO, semSessao);
    anon = createClient(URL_SB, ANON, semSessao);
    [a, b, c] = await Promise.all([novoUsuario(), novoUsuario(), novoUsuario()]);
  }, 60_000);

  afterAll(async () => {
    // Apagar o usuário apaga em cascata os pedidos, itens e acessos de teste
    for (const id of criados) await admin.auth.admin.deleteUser(id);
  }, 60_000);

  it("os preços do banco são 37, 47 (vídeo), 67 (leve 3), 97 (combo) e 20% de desconto para cliente", async () => {
    const { data, error } = await anon.from("loja_ofertas").select("codigo, preco_centavos, desconto_percentual").order("ordem");
    expect(error).toBeNull();
    const ofertas = data ?? [];
    expect(Object.fromEntries(ofertas.filter((o) => o.desconto_percentual === null).map((o) => [o.codigo, o.preco_centavos]))).toEqual({
      avulso: 3700,
      "leve-3": 6700,
      combo: 9700,
    });
    expect(ofertas.find((o) => o.codigo === "cliente")?.desconto_percentual).toBe(20);
    const video = await anon.from("loja_produtos").select("preco_avulso_centavos").eq("slug", "edicao-de-video").single();
    expect(video.data?.preco_avulso_centavos).toBe(4700);
  });

  it("o visitante não lê caminhos de arquivo nem conteúdo", async () => {
    const arq = await anon.from("loja_produtos").select("zip_arquivo");
    expect(arq.error).not.toBeNull();
    const cont = await anon.from("loja_conteudos").select("id");
    expect(cont.data ?? []).toHaveLength(0);
  });

  it("quem compra 1 produto vê só aquele; o leve 3 libera exatamente os 3 do pedido", async () => {
    const ra = await comprar(a, "avulso", ["edicao-de-video"], 4700);
    expect(ra.r).toBe("liberado");
    const trio = ["design-copy-anuncios", "programacao-sem-codigo", "times-de-agentes"];
    const rb = await comprar(b, "leve-3", trio, 6700);
    expect(rb.r).toBe("liberado");

    expect(await slugsComAcesso(a)).toEqual(["edicao-de-video"]);
    expect(await slugsComAcesso(b)).toEqual([...trio].sort());

    const contA = await a.db.from("loja_conteudos").select("produto_slug");
    expect(contA.error).toBeNull();
    expect(new Set((contA.data ?? []).map((x) => x.produto_slug))).toEqual(
      new Set((contA.data ?? []).length ? ["edicao-de-video"] : []),
    );
    const contB = await b.db.from("loja_conteudos").select("produto_slug").eq("produto_slug", "edicao-de-video");
    expect(contB.data ?? []).toHaveLength(0);
  });

  it("o combo libera todos os produtos ativos da vitrine (o que só é vendido como complemento fica de fora)", async () => {
    const { data } = await anon.from("loja_produtos").select("slug").eq("so_bump", false);
    const todos = (data ?? []).map((p) => p.slug as string);
    const rc = await comprar(c, "combo", todos, 9700);
    expect(rc.r).toBe("liberado");
    expect(await slugsComAcesso(c)).toEqual([...todos].sort());
  });

  it("um usuário não vê pedido nem acesso de outro e não consegue se liberar", async () => {
    const pedidosDeB = await a.db.from("loja_pedidos").select("id").eq("user_id", b.id);
    expect(pedidosDeB.data ?? []).toHaveLength(0);
    const acessosDeB = await a.db.from("loja_acessos").select("produto_slug").eq("user_id", b.id);
    expect(acessosDeB.data ?? []).toHaveLength(0);

    const inserir = await a.db.from("loja_acessos").insert({ user_id: a.id, produto_slug: "times-de-agentes", pedido_id: randomUUID() });
    expect(inserir.error).not.toBeNull();
    const rpc = await a.db.rpc("loja_liberar_pedido", { p_pedido: randomUUID(), p_payment_id: "x", p_valor_centavos: 1 });
    expect(rpc.error).not.toBeNull();
    const pedido = await a.db.rpc("loja_criar_pedido", { p_user: a.id, p_oferta: "avulso", p_valor_centavos: 1, p_chave: "x", p_itens: ["times-de-agentes"] });
    expect(pedido.error).not.toBeNull();
    expect(await slugsComAcesso(a)).toEqual(["edicao-de-video"]);
  });

  it("notificação repetida não duplica acesso e o duplo clique devolve o mesmo pedido", async () => {
    const itens = ["motion-mockup-fontes"];
    const p1 = await criarOuReusarPedido(admin, { email: a.email, userId: a.id }, "avulso", { itens, valorCentavos: 3700, chaveItens: "avulso:motion-mockup-fontes" });
    const p2 = await criarOuReusarPedido(admin, { email: a.email, userId: a.id }, "avulso", { itens, valorCentavos: 3700, chaveItens: "avulso:motion-mockup-fontes" });
    expect(p2.id).toBe(p1.id);
    const repo = repoPagamento(admin);
    expect(await repo.liberar(p1.id, "teste-dup-1", 3700)).toBe("liberado");
    expect(await repo.liberar(p1.id, "teste-dup-1", 3700)).toBe("ja_pago");
    expect(await repo.liberar(p1.id, "teste-dup-2", 3700)).toBe("pagamento_duplicado");
    const { count } = await admin.from("loja_acessos").select("*", { count: "exact", head: true }).eq("user_id", a.id);
    expect(count).toBe(2);
  });

  it("valor diferente do pedido não libera", async () => {
    const p = await criarOuReusarPedido(admin, { email: b.email, userId: b.id }, "avulso", { itens: ["edicao-de-video"], valorCentavos: 4700, chaveItens: "avulso:edicao-de-video" });
    expect(await repoPagamento(admin).liberar(p.id, "teste-valor", 100)).toBe("valor_divergente");
    expect(await slugsComAcesso(b)).not.toContain("edicao-de-video");
  });

  it("o e-mail de acesso é reservado uma única vez por pedido", async () => {
    const { data } = await admin.from("loja_pedidos").select("id").eq("user_id", c.id).eq("status", "pago").limit(1).single();
    const id = (data as { id: string }).id;
    const [r1, r2] = await Promise.all([reservarEmailAcesso(admin, id), reservarEmailAcesso(admin, id)]);
    expect([r1, r2].filter(Boolean)).toEqual([c.id]);
    expect(await reservarEmailAcesso(admin, id)).toBeNull();
    await liberarReservaEmail(admin, id);
    expect(await reservarEmailAcesso(admin, id)).toBe(c.id);
  });

  it("compra sem login: a aprovação cria uma única conta pelo e-mail e libera só o produto do pedido", async () => {
    const email = `teste-loja-convidado-${randomUUID()}@example.com`;
    const pedido = await criarOuReusarPedido(admin, { email, userId: null }, "avulso", {
      itens: ["programacao-sem-codigo"],
      valorCentavos: 3700,
      chaveItens: "avulso:programacao-sem-codigo",
    });
    const repo = repoPagamento(admin);
    // Webhook repetido e simultâneo: as duas chamadas caem na mesma conta
    const [v1, v2] = await Promise.all([repo.garantirConta(pedido.id, email), repo.garantirConta(pedido.id, email)]);
    const conta = await contaPorEmail(admin, email);
    expect(conta).not.toBeNull();
    criados.push(conta!);
    expect([v1, v2].sort()).toEqual(["ja_vinculado", "vinculado"]);
    expect(await repo.liberar(pedido.id, `teste-${randomUUID()}`, 3700)).toBe("liberado");
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    expect(data.users.filter((u) => u.email === email)).toHaveLength(1);
    const acessos = await admin.from("loja_acessos").select("produto_slug").eq("user_id", conta!);
    expect((acessos.data ?? []).map((x) => x.produto_slug)).toEqual(["programacao-sem-codigo"]);
  });

  it("pedido sem conta não libera acesso", async () => {
    const email = `teste-loja-semconta-${randomUUID()}@example.com`;
    const p = await criarOuReusarPedido(admin, { email, userId: null }, "avulso", {
      itens: ["times-de-agentes"],
      valorCentavos: 3700,
      chaveItens: "avulso:times-de-agentes",
    });
    expect(await repoPagamento(admin).liberar(p.id, `teste-${randomUUID()}`, 3700)).toBe("sem_conta");
    await admin.from("loja_pedidos").delete().eq("id", p.id);
  });

  it("estorno revoga, mas mantém o que outra compra paga cobre", async () => {
    const avulso = await comprar(c, "avulso", ["edicao-de-video"], 4700);
    // c já tem edicao-de-video pelo combo: o avulso não cria acesso novo
    expect(avulso.r).toBe("liberado");
    const r = await repoPagamento(admin).estornar(avulso.pedido.id, avulso.pagamento);
    expect(r).toBe("revogado");
    expect(await slugsComAcesso(c)).toContain("edicao-de-video");
  });
});
