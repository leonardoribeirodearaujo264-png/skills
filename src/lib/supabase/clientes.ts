import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../env";

const semSessao = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } as const;

// Servidor com service_role: ignora RLS. Só para gravar pedidos, liberar acesso e assinar URLs.
export function clienteServico(): SupabaseClient {
  const e = env();
  return createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY, { auth: semSessao });
}

// Chave pública, sem usuário: vitrine e chamadas de Auth (enviar código, trocar token).
export function clientePublico(): SupabaseClient {
  const e = env();
  return createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: semSessao });
}

// Em nome do usuário logado: toda leitura passa pelo RLS com o JWT dele.
export function clienteDoUsuario(accessToken: string): SupabaseClient {
  const e = env();
  return createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: semSessao,
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
