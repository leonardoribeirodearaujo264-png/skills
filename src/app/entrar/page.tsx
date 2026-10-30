import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { destinoSeguro } from "@/lib/auth/cookies";
import { usuarioAtual } from "@/lib/auth/sessao";
import { FormEntrar } from "./FormEntrar";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const busca = await searchParams;
  const proximo = destinoSeguro(busca.next);
  if (await usuarioAtual()) redirect(proximo);
  return (
    <>
      <Cabecalho ativa="entrar" />
      <main className="auth" id="conteudo">
        <div className="shell">
          <div className="core">
            <FormEntrar proximo={proximo} erroLink={busca.erro === "link"} />
          </div>
        </div>
      </main>
      <Rodape />
    </>
  );
}
