import { z } from "zod";

// Segredos e configuração vêm só do ambiente do servidor. Validação preguiçosa: o build não exige segredos.
const esquema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  // Chave pública do Supabase: a publicável (sb_publishable_) ou a anon legada; a publicável tem preferência
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  MERCADOPAGO_ACCESS_TOKEN: z.string().regex(/^(TEST|APP_USR)-/),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().min(16),
  // Endereço público do site, sem barra final. Usado nas back_urls e na notification_url.
  SITE_URL: z.url().transform((u) => u.replace(/\/+$/, "")),
  CRON_SECRET: z.string().min(16).optional(),
  // E-mails de acesso (código e link) saem pelo Resend, do domínio verificado
  RESEND_API_KEY: z.string().startsWith("re_"),
  EMAIL_REMETENTE: z.string().min(3).default("Leonardo Araujo <acesso@leonardoskills.com>"),
});

export type Env = z.infer<typeof esquema> & { chavePublicaSupabase: string };

let cache: Env | null = null;

export function env(): Env {
  if (cache) return cache;
  const r = esquema.safeParse(process.env);
  if (!r.success) {
    // Só os nomes das variáveis com problema, nunca os valores
    const nomes = [...new Set(r.error.issues.map((i) => String(i.path[0])))].join(", ");
    throw new Error(`Variáveis de ambiente ausentes ou inválidas: ${nomes}`);
  }
  const chavePublicaSupabase = r.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? r.data.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!chavePublicaSupabase) {
    throw new Error("Variáveis de ambiente ausentes ou inválidas: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  cache = { ...r.data, chavePublicaSupabase };
  return cache;
}

export function modoTeste(): boolean {
  return env().MERCADOPAGO_ACCESS_TOKEN.startsWith("TEST-");
}
