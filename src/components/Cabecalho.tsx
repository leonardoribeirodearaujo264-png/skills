import Link from "next/link";
import { usuarioAtual } from "@/lib/auth/sessao";
import { sair } from "@/app/entrar/acoes";

type Aba = "loja" | "membros" | "entrar";

export async function Cabecalho({ ativa }: { ativa?: Aba }) {
  const usuario = await usuarioAtual();
  const atual = (aba: Aba) => (ativa === aba ? "page" : undefined);
  return (
    <header className="site-head">
      <Link className="brand" href="/">
        <span className="dot" aria-hidden="true" />
        Leonardo Araujo
      </Link>
      <nav className="nav" aria-label="Principal">
        <Link href="/loja/" aria-current={atual("loja")}>
          Loja
        </Link>
        <Link href="/membros/" aria-current={atual("membros")} className="so-desk">
          Minha área
        </Link>
        {usuario ? (
          <form action={sair}>
            <span className="chip" title={usuario.email}>
              {usuario.email}
            </span>
            <button className="btn ghost sm" type="submit">
              Sair
            </button>
          </form>
        ) : (
          <Link href="/entrar/" aria-current={atual("entrar")}>
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}

export function Rodape() {
  return <footer>© {new Date().getFullYear()} Leonardo Araujo</footer>;
}
