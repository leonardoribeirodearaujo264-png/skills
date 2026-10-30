import { randomInt } from "node:crypto";
import type { SupabaseClient, User } from "@supabase/supabase-js";

// Senha de acesso à área de membros. Na primeira liberação de pagamento o site gera uma senha, grava na conta
// e manda no e-mail de acesso. A marca senha_definida (app_metadata, só o servidor altera) só é gravada
// depois que o e-mail saiu: se o envio falhar, a próxima tentativa gera outra senha e manda de novo.

// Sem caracteres que se confundem na leitura (0/O, 1/l/I)
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
export const SENHA_MINIMA = 8;

export function gerarSenha(tamanho = 10): string {
  return Array.from({ length: tamanho }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
}

export function temSenha(usuario: Pick<User, "app_metadata">): boolean {
  return usuario.app_metadata?.senha_definida === true;
}

// Grava uma senha nova gerada pelo site, ainda sem a marca. Devolve a senha para ir no e-mail.
export async function gravarSenhaGerada(db: SupabaseClient, userId: string): Promise<string> {
  const senha = gerarSenha();
  const { error } = await db.auth.admin.updateUserById(userId, { password: senha });
  if (error) throw new Error(`gravar senha: ${error.code ?? error.message}`);
  return senha;
}

export async function marcarSenhaDefinida(db: SupabaseClient, usuario: Pick<User, "id" | "app_metadata">): Promise<void> {
  const { error } = await db.auth.admin.updateUserById(usuario.id, {
    app_metadata: { ...usuario.app_metadata, senha_definida: true },
  });
  if (error) throw new Error(`marcar senha: ${error.code ?? error.message}`);
}

// Troca pela senha escolhida pela pessoa na área de membros
export async function trocarSenha(db: SupabaseClient, usuario: Pick<User, "id" | "app_metadata">, nova: string): Promise<void> {
  const { error } = await db.auth.admin.updateUserById(usuario.id, {
    password: nova,
    app_metadata: { ...usuario.app_metadata, senha_definida: true },
  });
  if (error) throw new Error(`trocar senha: ${error.code ?? error.message}`);
}
