import { carregarCatalogo } from "@/lib/loja/repositorio";
import { montarVitrine } from "@/lib/loja/vitrine";
import { clientePublico } from "@/lib/supabase/clientes";

// Dados públicos do bloco de oferta das páginas dos vídeos (preços do banco, sem nada do usuário)
export async function GET(req: Request): Promise<Response> {
  const pagina = new URL(req.url).searchParams.get("pagina") ?? "";
  if (!/^[a-z0-9-]{0,40}$/.test(pagina)) return Response.json({ ok: false }, { status: 400 });
  try {
    const vitrine = montarVitrine(await carregarCatalogo(clientePublico()), pagina);
    // Público e igual para todos: cache curto na CDN, para as visitas vindas da DM não irem todas ao banco
    return Response.json(
      { ok: true, ...vitrine },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (e) {
    console.error("vitrine", e instanceof Error ? e.message : "erro desconhecido");
    return Response.json({ ok: false }, { status: 503 });
  }
}
