import { carregarCatalogo } from "@/lib/loja/repositorio";
import { montarVitrine } from "@/lib/loja/vitrine";
import { clientePublico } from "@/lib/supabase/clientes";

// Dados públicos do bloco de oferta das páginas dos vídeos (preços do banco, sem nada do usuário)
export async function GET(req: Request): Promise<Response> {
  const pagina = new URL(req.url).searchParams.get("pagina") ?? "";
  if (!/^[a-z0-9-]{0,40}$/.test(pagina)) return Response.json({ ok: false }, { status: 400 });
  try {
    const vitrine = montarVitrine(await carregarCatalogo(clientePublico()), pagina);
    // Público e igual para todos. A CDN guarda 10 min e, depois disso, entrega a cópia antiga na hora enquanto
    // atualiza por trás (até 1 dia): a visita nunca espera a função nos EUA e o banco (medido em 01/11: 0,4 a 1,3 s
    // sem cache contra 0,2 s com cache). Preço novo no banco aparece em até uns 10 min.
    return Response.json(
      { ok: true, ...vitrine },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" } },
    );
  } catch (e) {
    console.error("vitrine", e instanceof Error ? e.message : "erro desconhecido");
    return Response.json({ ok: false }, { status: 503 });
  }
}
