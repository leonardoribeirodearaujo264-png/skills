// Teste ponta a ponta contra o site rodando (next start) e o Supabase real, sem navegador.
// Cria um usuário de teste sem senha, libera 1 produto pela mesma função do webhook, confere as telas,
// o bloqueio, o download e o webhook assinado, e apaga tudo no fim.
// Uso: node --env-file=.env.local scripts/teste-ponta-a-ponta.mjs http://localhost:3000
import { createHmac, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SITE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const env = process.env;
const semSessao = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, semSessao);
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY, semSessao);
// next start roda em produção (cookies __Host-); use DEV=1 para next dev
const producao = env.DEV !== "1";
const COMPRADO = "motion-mockup-fontes";
const BLOQUEADO = "times-de-agentes";

// Preview da Vercel com proteção de login: token "Protection Bypass for Automation"
const bypass = env.VERCEL_AUTOMATION_BYPASS_SECRET ? { "x-vercel-protection-bypass": env.VERCEL_AUTOMATION_BYPASS_SECRET } : {};

let falhas = 0;
function conferir(nome, ok, detalhe = "") {
  console.log(`${ok ? "ok   " : "FALHA"} ${nome}${ok ? "" : ` ${detalhe}`}`);
  if (!ok) falhas++;
}

async function pagina(caminho, cookie) {
  const r = await fetch(`${SITE}${caminho}`, { redirect: "manual", headers: { ...bypass, ...(cookie ? { cookie } : {}) } });
  return { status: r.status, local: r.headers.get("location") ?? "", texto: r.status === 200 ? await r.text() : "" };
}

const email = `teste-loja-${randomUUID()}@example.com`;
const criado = await admin.auth.admin.createUser({ email, email_confirm: true });
if (criado.error) throw criado.error;
const userId = criado.data.user.id;

try {
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (link.error) throw link.error;
  const s = await anon.auth.verifyOtp({ token_hash: link.data.properties.hashed_token, type: "magiclink" });
  if (s.error) throw s.error;
  // next start roda em produção: cookies com prefixo __Host-
  const pre = producao ? "__Host-" : "";
  const cookie = `${pre}sb-at=${s.data.session.access_token}; ${pre}sb-rt=${s.data.session.refresh_token}`;

  // Sem login
  const loja = await pagina("/loja/");
  conferir("loja responde 200 para visitante", loja.status === 200, String(loja.status));
  conferir("loja mostra R$ 37, R$ 67 e R$ 127 vindos do banco", ["37", "67", "127"].every((v) => loja.texto.includes(`<small>R$</small>${v}`)));
  conferir("loja mostra o avulso de edição de vídeo a R$ 47", loja.texto.includes("R$\u00a047,00") || loja.texto.includes("R$&nbsp;47,00"));
  conferir("loja não mostra a oferta de cliente para visitante", !loja.texto.includes("Preço de cliente"));
  // Compra sem login: do botão do vídeo ao checkout, sem passar pela tela de entrar
  const direta = await pagina(`/loja/comprar/?oferta=avulso&produtos=${COMPRADO}`);
  conferir("compra direta leva ao checkout, não ao login", direta.status === 303 && direta.local.includes("/loja/checkout/") && !direta.local.includes("/entrar/"), direta.local);
  const checkout = await pagina(`/loja/checkout/?oferta=avulso&produtos=${COMPRADO}`);
  conferir("checkout abre sem login, com o valor do servidor e o campo de e-mail", checkout.status === 200 && checkout.texto.includes("Finalizar compra") && checkout.texto.includes('name="email"') && checkout.texto.includes("37,00"), String(checkout.status));
  const checkoutCliente = await pagina(`/loja/checkout/?oferta=cliente&produtos=${COMPRADO}`);
  conferir("preço de cliente sem sessão pede para entrar com o e-mail da compra", checkoutCliente.texto.includes("Entrar com o e-mail da compra"));
  const anonMembros = await pagina("/membros/");
  conferir("área de membros sem login vai para /entrar/", anonMembros.status === 307 && anonMembros.local.includes("/entrar/"), `${anonMembros.status} ${anonMembros.local}`);
  const anonConteudo = await pagina(`/membros/${COMPRADO}/`);
  conferir("conteúdo sem login fica bloqueado", anonConteudo.status === 200 && anonConteudo.texto.includes("Este conteúdo é de quem comprou") && !anonConteudo.texto.includes('id="prompts"'));

  // Logado sem compra
  const vazio = await pagina("/membros/", cookie);
  conferir("logado sem compra vê a mensagem de que o e-mail não tem compra", vazio.texto.includes("ainda não tem compra aprovada"));
  const semCompra = await pagina(`/membros/${COMPRADO}/`, cookie);
  conferir("logado sem compra não vê o conteúdo", semCompra.texto.includes("Este conteúdo é de quem comprou") && !semCompra.texto.includes('id="prompts"'));
  const dlSem = await pagina(`/api/loja/download/${COMPRADO}`, cookie);
  conferir("download sem compra é recusado", dlSem.status === 303 && dlSem.local.includes("download=sem_acesso"), dlSem.local);

  // Compra liberada pela mesma função que o webhook usa
  const itens = [COMPRADO];
  const ped = await admin.rpc("loja_criar_pedido", { p_email: email, p_user: userId, p_oferta: "avulso", p_valor_centavos: 3700, p_chave: `avulso:${COMPRADO}`, p_itens: itens });
  if (ped.error) throw ped.error;
  const pedidoId = ped.data[0].pedido_id;
  const lib = await admin.rpc("loja_liberar_pedido", { p_pedido: pedidoId, p_payment_id: `teste-${randomUUID()}`, p_valor_centavos: 3700 });
  conferir("pedido liberado", lib.data === "liberado", JSON.stringify(lib));

  const membros = await pagina("/membros/", cookie);
  conferir("área de membros lista o produto comprado", membros.texto.includes(`/membros/${COMPRADO}/`));
  conferir("área de membros mostra os outros como bloqueados com preço", membros.texto.includes("Outros pacotes") && membros.texto.includes(`produtos=${BLOQUEADO}`));
  conferir("cliente vê 20% de desconto nos outros pacotes (R$ 37,00 vira R$ 29,60)", membros.texto.includes("20% de desconto") && membros.texto.includes("29,60"));
  conferir("a vitrine não oferece o pacote que ele já tem", !membros.texto.includes(`produtos=${COMPRADO}`));
  const checkoutDesconto = await pagina(`/loja/checkout/?oferta=cliente&produtos=${BLOQUEADO}`, cookie);
  conferir("checkout do cliente calcula o desconto no servidor", checkoutDesconto.texto.includes("29,60"));
  const conteudo = await pagina(`/membros/${COMPRADO}/`, cookie);
  conferir("conteúdo comprado tem aula, instalação, prompts e arquivos", ['id="aula"', 'id="instalar"', 'id="prompts"', 'id="arquivos"'].every((x) => conteudo.texto.includes(x)));
  conferir("conteúdo comprado tem o player com URL assinada", conteudo.texto.includes("<video") && conteudo.texto.includes("/storage/v1/object/sign/loja-aulas/"));
  const outro = await pagina(`/membros/${BLOQUEADO}/`, cookie);
  conferir("produto não comprado continua bloqueado", outro.texto.includes("Este conteúdo é de quem comprou") && !outro.texto.includes('id="prompts"'));

  const dl = await pagina(`/api/loja/download/${COMPRADO}`, cookie);
  conferir("download do comprado redireciona para URL assinada", dl.status === 303 && dl.local.includes("/storage/v1/object/sign/loja-pacotes/"), dl.local.slice(0, 80));
  if (dl.local.startsWith("https://")) {
    const zip = await fetch(dl.local);
    const bytes = new Uint8Array(await zip.arrayBuffer());
    conferir("o .zip baixa e começa com PK", zip.status === 200 && bytes[0] === 0x50 && bytes[1] === 0x4b, String(zip.status));
  }
  const dlOutro = await pagina(`/api/loja/download/${BLOQUEADO}`, cookie);
  conferir("download do não comprado é recusado", dlOutro.local.includes("download=sem_acesso"), dlOutro.local);

  // Webhook: assinatura errada é recusada; assinatura certa com pagamento inexistente responde 200
  const dataId = "1234567890";
  const reqId = randomUUID();
  const ts = String(Date.now());
  const v1 = createHmac("sha256", env.MERCADOPAGO_WEBHOOK_SECRET).update(`id:${dataId};request-id:${reqId};ts:${ts};`).digest("hex");
  const corpo = JSON.stringify({ type: "payment", action: "payment.updated", data: { id: dataId } });
  const ruim = await fetch(`${SITE}/api/webhooks/mercadopago?data.id=${dataId}&type=payment`, {
    method: "POST",
    headers: { ...bypass, "content-type": "application/json", "x-signature": `ts=${ts},v1=${"0".repeat(64)}`, "x-request-id": reqId },
    body: corpo,
  });
  conferir("webhook com assinatura errada responde 401", ruim.status === 401, String(ruim.status));
  const bom = await fetch(`${SITE}/api/webhooks/mercadopago?data.id=${dataId}&type=payment`, {
    method: "POST",
    headers: { ...bypass, "content-type": "application/json", "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": reqId },
    body: corpo,
  });
  const jb = await bom.json().catch(() => ({}));
  conferir("webhook assinado responde 200 e consulta a API do Mercado Pago", bom.status === 200 && jb.resultado === "pagamento_inexistente", `${bom.status} ${JSON.stringify(jb)}`);
  const ev = await admin.from("loja_eventos_webhook").select("resultado").eq("request_id", reqId).single();
  conferir("o evento ficou registrado com o resultado", ev.data?.resultado === "pagamento_inexistente", JSON.stringify(ev));
  await admin.from("loja_eventos_webhook").delete().eq("request_id", reqId);
} finally {
  await admin.auth.admin.deleteUser(userId);
}

console.log(falhas ? `${falhas} falha(s)` : "Tudo passou.");
process.exit(falhas ? 1 : 0);
