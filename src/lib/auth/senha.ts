import { randomInt } from "node:crypto";
import type { SupabaseClient, User } from "@supabase/supabase-js";

// Senha de acesso à área de membros. Na primeira liberação de pagamento o site gera uma senha, grava na conta
// junto com a marca senha_definida (app_metadata, só o servidor altera) numa única atualização e manda no
// e-mail de acesso. Uma trava por usuário (loja_permitir) impede duas liberações simultâneas de gerarem duas
// senhas. Se o envio falhar, a conta já tem senha: a pessoa entra com código e troca na área de membros.

// Sem caracteres que se confundem na leitura (0/O, 1/l/I)
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
export const SENHA_MINIMA = 8;

export function gerarSenha(tamanho = 10): string {
  return Array.from({ length: tamanho }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
}

export function temSenha(usuario: Pick<User, "app_metadata">): boolean {
  return usuario.app_metadata?.senha_definida === true;
}

// Gera e grava a senha com a marca, numa atualização só. Devolve a senha para ir no e-mail.
export async function gravarSenhaGerada(db: SupabaseClient, userId: string): Promise<string> {
  const senha = gerarSenha();
  const { error } = await db.auth.admin.updateUserById(userId, { password: senha, app_metadata: { senha_definida: true } });
  if (error) throw new Error(`gravar senha: ${error.code ?? error.message}`);
  return senha;
}

// Senha escolhida pela pessoa na área de membros. O GoTrue junta as chaves do app_metadata, então só a marca vai.
export async function trocarSenha(db: SupabaseClient, userId: string, nova: string): Promise<void> {
  const { error } = await db.auth.admin.updateUserById(userId, { password: nova, app_metadata: { senha_definida: true } });
  if (error) throw new Error(`trocar senha: ${error.code ?? error.message}`);
}

// Limite do bcrypt usado pelo Supabase Auth: 72 bytes (acento ocupa mais de um)
export function senhaCabe(senha: string): boolean {
  return new TextEncoder().encode(senha).length <= 72;
}
