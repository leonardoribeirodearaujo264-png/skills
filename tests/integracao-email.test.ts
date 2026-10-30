import { createClient } from "@supabase/supabase-js";
import { afterAll, describe, expect, it } from "vitest";
import { enviarAcesso } from "@/lib/auth/acesso";

// Envia de verdade pelo Resend para o endereço de teste oficial dele (delivered@resend.dev), que não
// chega a ninguém. Cria a conta só durante o teste. Rodar com:
// INTEGRACAO=1 node --env-file=.env.local node_modules/vitest/vitest.mjs run tests/integracao-email.test.ts
const ativo = process.env.INTEGRACAO === "1" && Boolean(process.env.RESEND_API_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
const EMAIL_TESTE = "delivered@resend.dev";

describe.skipIf(!ativo)("e-mail de acesso pelo Resend", () => {
  let criado: string | null = null;
  const admin = () =>
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "", {
      auth: { persistSession: false, autoRefreshToken: false },
    });

  afterAll(async () => {
    if (criado) await admin().auth.admin.deleteUser(criado);
  });

  it("e-mail sem conta não recebe código e nenhuma conta é criada", async () => {
    const email = `teste-loja-sem-conta-${Date.now()}@example.com`;
    expect(await enviarAcesso(email, "compra")).toBe("sem_conta");
    const { data } = await admin().auth.admin.listUsers({ perPage: 1000 });
    expect(data.users.some((u) => u.email === email)).toBe(false);
  });

  it("depois da compra, o código e o link saem pelo Resend", async () => {
    const u = await admin().auth.admin.createUser({ email: EMAIL_TESTE, email_confirm: true });
    criado = u.data.user?.id ?? null;
    expect(await enviarAcesso(EMAIL_TESTE, "compra", { proximo: "/membros/" })).toBe("enviado");
  }, 20_000);
});
