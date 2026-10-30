import { z } from "zod";

// Segredos e configuração vêm só do ambiente do servidor. Validação preguiçosa: o build não exige segredos.
const esquema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  MERCADOPAGO_ACCESS_TOKEN: z.string().regex(/^(TEST|APP_USR)-/),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().min(16),
  // Endereço público do site, sem barra final. Usado nas back_urls e na notification_url.
  SITE_URL: z.url().transform((u) => u.replace(/\/+$/, "")),
  CRON_SECRET: z.string().min(16).optional(),
});

export type Env = z.infer<typeof esquema>;

let cache: Env | null = null;

export function env(): Env {
  if (cache) return cache;
  const r = esquema.safeParse(process.env);
  if (!r.success) {
    // Só os nomes das variáveis com problema, nunca os valores
    const nomes = [...new Set(r.error.issues.map((i) => String(i.path[0])))].join(", ");
    throw new Error(`Variáveis de ambiente ausentes ou inválidas: ${nomes}`);
  }
  cache = r.data;
  return cache;
}

export function modoTeste(): boolean {
  return env().MERCADOPAGO_ACCESS_TOKEN.startsWith("TEST-");
}
