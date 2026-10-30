// Endereço antigo da compra direta: hoje só leva ao checkout, que não exige login e não cria nada ao abrir.
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const oferta = url.searchParams.get("oferta") ?? "";
  const produtos = url.searchParams.get("produtos") ?? "";
  const destino = new URL("/loja/checkout/", req.url);
  if (/^[a-z0-9-]{1,40}$/.test(oferta)) destino.searchParams.set("oferta", oferta);
  if (/^[a-z0-9,-]{0,800}$/.test(produtos)) destino.searchParams.set("produtos", produtos);
  return new Response(null, { status: 303, headers: { Location: destino.toString() } });
}
