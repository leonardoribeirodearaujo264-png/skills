import { usuarioAtual } from "@/lib/auth/sessao";
import { arquivoDoPacote, temAcesso } from "@/lib/loja/membros";
import { BUCKET_PACOTES } from "@/lib/loja/servicos";
import { clienteServico } from "@/lib/supabase/clientes";

// Entrega o .zip por URL assinada de 5 minutos, só para quem tem acesso ativo ao produto.
// É aberto pelo navegador: sem acesso ou com falha, volta para a página com o motivo.
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await ctx.params;
  const voltar = (motivo: string, status = 303) =>
    new Response(null, {
      status,
      headers: { Location: new URL(`/membros/${encodeURIComponent(slug)}/?download=${motivo}#arquivos`, req.url).toString() },
    });

  const usuario = await usuarioAtual();
  if (!usuario) {
    const next = encodeURIComponent(`/membros/${slug}/`);
    return new Response(null, { status: 303, headers: { Location: new URL(`/entrar/?next=${next}`, req.url).toString() } });
  }
  if (!(await temAcesso(usuario, slug))) return voltar("sem_acesso");

  const caminho = await arquivoDoPacote(slug);
  if (!caminho) return voltar("indisponivel");
  const { data, error } = await clienteServico()
    .storage.from(BUCKET_PACOTES)
    .createSignedUrl(caminho, 300, { download: `${slug}.zip` });
  if (error || !data) return voltar("falha");
  return new Response(null, { status: 303, headers: { Location: data.signedUrl } });
}
