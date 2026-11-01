import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { env } from "../env";
import { ipDaRequisicao } from "../loja/limites";
import { enviarEventos, type ConfigMeta, type DadosUsuario, type EventoMeta } from "./conversoes";
import { PIXEL_META } from "./pixel";

// Lado servidor dos eventos da Meta: configuração, contexto da requisição e envio que nunca derruba a compra.

// Lidas à parte do env(): variável da Meta vazia ou errada só desliga a API de Conversões, nunca o site.
// Vazio conta como ausente (campo vazio no painel da Vercel).
const vazioComoAusente = (v: unknown) => (v === "" ? undefined : v);
const esquemaMeta = z.object({
  // Sem o token, só o Pixel do navegador manda eventos
  META_CAPI_TOKEN: z.preprocess(vazioComoAusente, z.string().min(20).optional()),
  // Código da aba "Testar eventos" do Gerenciador de Eventos: com ele os eventos do servidor vão só para o teste
  META_CAPI_TEST_CODE: z.preprocess(vazioComoAusente, z.string().regex(/^TEST\w+$/).optional()),
  META_GRAPH_VERSION: z.preprocess(vazioComoAusente, z.string().regex(/^v\d+\.\d+$/).default("v24.0")),
});

let avisado = false;

export function configMeta(): ConfigMeta | null {
  const r = esquemaMeta.safeParse(process.env);
  if (!r.success) {
    if (!avisado) {
      avisado = true;
      // Só os nomes das variáveis, nunca os valores
      console.error("meta conversões desligada, variável inválida:", [...new Set(r.error.issues.map((i) => String(i.path[0])))].join(", "));
    }
    return null;
  }
  if (!r.data.META_CAPI_TOKEN) return null;
  if (r.data.META_CAPI_TEST_CODE && process.env.VERCEL_ENV === "production" && !avisado) {
    avisado = true;
    console.error("meta conversões em modo de teste na produção: os eventos do servidor não entram nas campanhas");
  }
  return { pixel: PIXEL_META, token: r.data.META_CAPI_TOKEN, versao: r.data.META_GRAPH_VERSION, codigoTeste: r.data.META_CAPI_TEST_CODE ?? null };
}

// IP, navegador e os cookies _fbp/_fbc que o Pixel grava no domínio do site.
// Só em ações chamadas pelo navegador: no webhook a requisição é do Mercado Pago, não do comprador.
export async function contextoDoNavegador(): Promise<Pick<DadosUsuario, "ip" | "userAgent" | "fbp" | "fbc">> {
  const [h, c] = await Promise.all([headers(), cookies()]);
  return {
    ip: await ipDaRequisicao(),
    userAgent: h.get("user-agent")?.slice(0, 400) ?? null,
    fbp: c.get("_fbp")?.value ?? null,
    fbc: c.get("_fbc")?.value ?? null,
  };
}

// Envia sem lançar erro: evento de anúncio fora do ar não pode atrapalhar pagamento nem acesso
export async function registrarEventoMeta(evento: EventoMeta | (() => Promise<EventoMeta | null>)): Promise<void> {
  const c = configMeta();
  if (!c) return;
  try {
    const e = typeof evento === "function" ? await evento() : evento;
    if (!e) return;
    const recebidos = await enviarEventos(c, [e]);
    // Com o código de teste, registra cada envio para conferir na aba "Testar eventos"
    if (c.codigoTeste) console.info("meta conversões teste", e.nome, e.id, `recebidos=${recebidos}`);
  } catch (erro) {
    console.error("meta conversões", erro instanceof Error ? erro.message : "erro desconhecido");
  }
}

// Depois da resposta ao comprador (after); fora de uma requisição (cron, testes) envia na hora
export async function registrarDepois(evento: EventoMeta | (() => Promise<EventoMeta | null>)): Promise<void> {
  try {
    after(() => registrarEventoMeta(evento));
  } catch {
    await registrarEventoMeta(evento);
  }
}

export const urlDoSite = (caminho: string) => `${env().SITE_URL}${caminho}`;
