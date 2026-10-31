import { afterEach, describe, expect, it, vi } from "vitest";

// O nome do remetente é sempre a marca do domínio, mesmo se a variável da Vercel ainda tiver outro nome
// env() valida todos os segredos: roda com --env-file=.env.local
describe.skipIf(!process.env.RESEND_API_KEY)("remetente dos e-mails", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  for (const valor of ["Leonardo Araujo <acesso@leonardoskills.com>", "acesso@leonardoskills.com"]) {
    it(`"${valor}" sai como Leonardo Skills`, async () => {
      vi.stubEnv("EMAIL_REMETENTE", valor);
      const { env } = await import("@/lib/env");
      expect(env().EMAIL_REMETENTE).toBe("Leonardo Skills <acesso@leonardoskills.com>");
    });
  }
});
