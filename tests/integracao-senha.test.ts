import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { afterAll, describe, expect, it } from "vitest";
import { gerarSenha, gravarSenhaGerada, marcarSenhaDefinida, temSenha, trocarSenha } from "@/lib/auth/senha";

// Senha da área de membros com o Supabase real: gerada na liberação, login com e-mail e senha, troca de senha.
// Cria uma conta de teste (@example.com) e apaga no fim. Rodar com:
// INTEGRACAO=1 node --env-file=.env.local node_modules/vitest/vitest.mjs run tests/integracao-senha.test.ts
const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const PUBLICA = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICO = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ativo = process.env.INTEGRACAO === "1" && Boolean(URL_SB && PUBLICA && SERVICO);
const semSessao = { auth: { persistSession: false, autoRefreshToken: false } };

describe.skipIf(!ativo)("senha da área de membros", () => {
  // Criado só quando o teste roda: sem as variáveis, o arquivo é pulado sem erro
  let clienteAdmin: ReturnType<typeof createClient> | null = null;
  const adminDb = () => (clienteAdmin ??= createClient(URL_SB, SERVICO, semSessao));
  const publico = () => createClient(URL_SB, PUBLICA, semSessao);
  const email = `teste-senha-${randomUUID()}@example.com`;
  let userId = "";

  afterAll(async () => {
    if (userId) await adminDb().auth.admin.deleteUser(userId);
  });

  it("a senha gerada é legível e tem 10 caracteres", () => {
    const s = gerarSenha();
    expect(s).toHaveLength(10);
    expect(s).not.toMatch(/[0O1lI]/);
  });

  it("a senha gerada na liberação entra com e-mail e senha; a marca só vem depois", async () => {
    const u = await adminDb().auth.admin.createUser({ email, email_confirm: true });
    if (u.error) throw u.error;
    userId = u.data.user.id;
    expect(temSenha(u.data.user)).toBe(false);
    const senha = await gravarSenhaGerada(adminDb(), userId);
    const antes = await adminDb().auth.admin.getUserById(userId);
    expect(temSenha(antes.data.user!)).toBe(false);
    const login = await publico().auth.signInWithPassword({ email, password: senha });
    expect(login.error).toBeNull();
    expect(login.data.session?.access_token).toBeTruthy();
    await marcarSenhaDefinida(adminDb(), antes.data.user!);
    const depois = await adminDb().auth.admin.getUserById(userId);
    expect(temSenha(depois.data.user!)).toBe(true);
  }, 30_000);

  it("depois de trocar, a senha nova entra e a antiga não", async () => {
    const antiga = await gravarSenhaGerada(adminDb(), userId);
    const u = await adminDb().auth.admin.getUserById(userId);
    const nova = `minha-${randomUUID().slice(0, 8)}`;
    await trocarSenha(adminDb(), u.data.user!, nova);
    expect((await publico().auth.signInWithPassword({ email, password: antiga })).error).not.toBeNull();
    expect((await publico().auth.signInWithPassword({ email, password: nova })).error).toBeNull();
  }, 30_000);
});
