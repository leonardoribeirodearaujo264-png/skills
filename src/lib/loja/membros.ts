import { z } from "zod";
import type { Usuario } from "../auth/sessao";
import { clienteDoUsuario, clientePublico, clienteServico } from "../supabase/clientes";
import { ErroBanco } from "./repositorio";
import { BUCKET_AULAS } from "./servicos";

// Leituras da área de membros. Tudo o que é do usuário passa pelo cliente com o JWT dele: o RLS decide.
// O cliente de serviço só busca caminhos de arquivo e assina URLs depois que o RLS confirmou o acesso.

export type ProdutoDoMembro = { slug: string; titulo: string; resumo: string; desde: string };
export type Conteudo = { tipo: "guia" | "prompt" | "roteiro" | "manifesto"; chave: string; titulo: string; corpo: string };
export type PedidoRecente = { id: string; status: string; criadoEm: string; valorCentavos: number };

const linhaAcesso = z.object({
  criado_em: z.string(),
  loja_produtos: z.object({ slug: z.string(), titulo: z.string(), resumo: z.string(), ordem: z.number() }),
});

export async function meusProdutos(u: Usuario): Promise<ProdutoDoMembro[]> {
  const { data, error } = await clienteDoUsuario(u.accessToken)
    .from("loja_acessos")
    .select("criado_em, loja_produtos!inner(slug, titulo, resumo, ordem)")
    .is("revogado_em", null);
  if (error) throw new ErroBanco("ler meus produtos", error.code ?? null);
  return z
    .array(linhaAcesso)
    .parse(data)
    .sort((a, b) => a.loja_produtos.ordem - b.loja_produtos.ordem)
    .map((r) => ({ ...r.loja_produtos, desde: r.criado_em }));
}

export async function temAcesso(u: Usuario, slug: string): Promise<boolean> {
  const { data, error } = await clienteDoUsuario(u.accessToken)
    .from("loja_acessos")
    .select("produto_slug")
    .eq("produto_slug", slug)
    .is("revogado_em", null)
    .maybeSingle();
  if (error) throw new ErroBanco("conferir acesso", error.code ?? null);
  return data !== null;
}

const linhaConteudo = z.object({
  tipo: z.enum(["guia", "prompt", "roteiro", "manifesto"]),
  chave: z.string(),
  titulo: z.string(),
  corpo: z.string(),
});

// Sem acesso, o RLS devolve lista vazia
export async function conteudoDoProduto(u: Usuario, slug: string): Promise<Conteudo[]> {
  const { data, error } = await clienteDoUsuario(u.accessToken)
    .from("loja_conteudos")
    .select("tipo, chave, titulo, corpo")
    .eq("produto_slug", slug)
    .order("ordem");
  if (error) throw new ErroBanco("ler conteúdo", error.code ?? null);
  return z.array(linhaConteudo).parse(data);
}

export async function pedidosRecentes(u: Usuario): Promise<PedidoRecente[]> {
  const { data, error } = await clienteDoUsuario(u.accessToken)
    .from("loja_pedidos")
    .select("id, status, criado_em, valor_centavos")
    .order("criado_em", { ascending: false })
    .limit(5);
  if (error) throw new ErroBanco("ler pedidos", error.code ?? null);
  return z
    .array(z.object({ id: z.string(), status: z.string(), criado_em: z.string(), valor_centavos: z.number() }))
    .parse(data)
    .map((r) => ({ id: r.id, status: r.status, criadoEm: r.criado_em, valorCentavos: r.valor_centavos }));
}

const linhaArquivos = z.object({
  zip_arquivo: z.string().nullable(),
  aula_arquivo: z.string().nullable(),
  aula_legenda: z.string().nullable(),
});

async function arquivos(slug: string): Promise<z.infer<typeof linhaArquivos> | null> {
  const { data, error } = await clienteServico()
    .from("loja_produtos")
    .select("zip_arquivo, aula_arquivo, aula_legenda")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new ErroBanco("ler arquivos do produto", error.code ?? null);
  return data ? linhaArquivos.parse(data) : null;
}

export async function arquivoDoPacote(slug: string): Promise<string | null> {
  return (await arquivos(slug))?.zip_arquivo ?? null;
}

export type Aula = { video: string; legenda: string | null };

// URLs assinadas de 10 minutos: dá para assistir e voltar o vídeo sem expirar no meio
export async function aulaDoProduto(slug: string): Promise<Aula | null> {
  const a = await arquivos(slug);
  if (!a?.aula_arquivo) return null;
  const storage = clienteServico().storage.from(BUCKET_AULAS);
  const video = await storage.createSignedUrl(a.aula_arquivo, 600);
  if (video.error || !video.data) return null;
  const legenda = a.aula_legenda ? await storage.createSignedUrl(a.aula_legenda, 600) : null;
  return { video: video.data.signedUrl, legenda: legenda?.data?.signedUrl ?? null };
}

export type ProdutoVisivel = {
  slug: string;
  titulo: string;
  resumo: string;
  githubUrl: string | null;
  aulaDuracaoS: number | null;
  qtdSkills: number;
  qtdAgentes: number;
  qtdPrompts: number;
};

const linhaVisivel = z.object({
  slug: z.string(),
  titulo: z.string(),
  resumo: z.string(),
  github_url: z.string().nullable(),
  aula_duracao_s: z.number().nullable(),
  qtd_skills: z.number(),
  qtd_agentes: z.number(),
  qtd_prompts: z.number(),
});

// Produto pelo RLS: visitante vê só os ativos; quem comprou vê o seu mesmo depois de sair da vitrine
export async function produtoVisivel(u: Usuario | null, slug: string): Promise<ProdutoVisivel | null> {
  const db = u ? clienteDoUsuario(u.accessToken) : clientePublico();
  const { data, error } = await db
    .from("loja_produtos")
    .select("slug, titulo, resumo, github_url, aula_duracao_s, qtd_skills, qtd_agentes, qtd_prompts")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new ErroBanco("ler produto", error.code ?? null);
  if (!data) return null;
  const r = linhaVisivel.parse(data);
  return {
    slug: r.slug,
    titulo: r.titulo,
    resumo: r.resumo,
    githubUrl: r.github_url,
    aulaDuracaoS: r.aula_duracao_s,
    qtdSkills: r.qtd_skills,
    qtdAgentes: r.qtd_agentes,
    qtdPrompts: r.qtd_prompts,
  };
}
