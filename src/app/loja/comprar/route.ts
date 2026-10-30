import { usuarioAtual } from "@/lib/auth/sessao";
import { iniciarCompra } from "@/lib/loja/checkout";

// Compra direta a partir das páginas dos vídeos: /loja/comprar/?oferta=avulso&produtos=<slug>.
// Sem sessão, passa pelo login e volta aqui. Com erro de regra, cai na loja com a mesma escolha e o motivo.
// O pedido pendente é reaproveitado se a mesma pessoa abrir o link de novo.
// Só cria pedido quando a navegação vem do próprio site (ou é digitada): um link de outro site
// cai na loja com a escolha pronta, e a compra segue pelo formulário (POST).
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const oferta = url.searchParams.get("oferta") ?? "";
  const produtos = (url.searchParams.get("produtos") ?? "").split(",").filter(Boolean);
  const valido = /^[a-z0-9-]{1,40}$/.test(oferta) && produtos.length <= 20 && produtos.every((p) => /^[a-z0-9-]{1,60}$/.test(p));
  const ir = (destino: string) => new Response(null, { status: 303, headers: { Location: new URL(destino, req.url).toString() } });
  if (!valido) return ir("/loja/");

  const escolha = new URLSearchParams({ oferta, produtos: produtos.join(",") });
  const origem = req.headers.get("sec-fetch-site");
  if (origem && origem !== "same-origin" && origem !== "none") return ir(`/loja/?${escolha}`);
  const usuario = await usuarioAtual();
  if (!usuario) return ir(`/entrar/?next=${encodeURIComponent(`/loja/comprar/?${escolha}`)}`);

  const r = await iniciarCompra(usuario, oferta, produtos);
  if ("url" in r) return new Response(null, { status: 303, headers: { Location: r.url } });
  escolha.set("erro", r.motivo);
  return ir(`/loja/?${escolha}`);
}
