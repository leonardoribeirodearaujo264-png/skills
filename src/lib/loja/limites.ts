import { headers } from "next/headers";
import { z } from "zod";
import { clienteServico } from "../supabase/clientes";

// Limite de uso por chave (e-mail, IP ou os dois), guardado no banco (função loja_permitir).
export async function permitir(chave: string, porHora: number, intervaloS = 0): Promise<boolean> {
  const { data, error } = await clienteServico().rpc("loja_permitir", {
    p_chave: chave.slice(0, 300),
    p_por_hora: porHora,
    p_intervalo_s: intervaloS,
  });
  if (error) throw new Error(`limite: ${error.code ?? "erro"}`);
  return z.boolean().parse(data);
}

// IP de quem fez a requisição. Na Vercel o primeiro item de x-forwarded-for é o IP do cliente.
export async function ipDaRequisicao(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "desconhecido").trim().slice(0, 64);
}
