import type { Metadata } from "next";
import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { destinoSeguro } from "@/lib/auth/cookies";
import { confirmarLink } from "../acoes";

export const metadata: Metadata = { title: "Confirmar acesso", robots: { index: false } };

type Busca = Promise<{ token_hash?: string; type?: string; next?: string }>;

// O link do e-mail cai aqui. O acesso só é confirmado no clique (POST), nunca ao abrir a página.
export default async function Confirmar({ searchParams }: { searchParams: Busca }) {
  const b = await searchParams;
  return (
    <>
      <Cabecalho ativa="entrar" />
      <main className="auth" id="conteudo">
        <div className="shell">
          <div className="core">
            <span className="icone-grande" aria-hidden="true">
              <Icone nome="cadeado" tamanho={26} />
            </span>
            <h1>Confirmar o acesso</h1>
            <p className="lead muted">Clique para entrar na sua área neste navegador.</p>
            <form action={confirmarLink}>
              <input type="hidden" name="token_hash" value={b.token_hash ?? ""} />
              <input type="hidden" name="type" value={b.type ?? "email"} />
              <input type="hidden" name="next" value={destinoSeguro(b.next)} />
              <button className="btn lg" type="submit">
                Entrar
                <span className="ico">
                  <Icone nome="direita" tamanho={16} />
                </span>
              </button>
            </form>
          </div>
        </div>
      </main>
      <Rodape />
    </>
  );
}
