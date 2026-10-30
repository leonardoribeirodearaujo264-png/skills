import Link from "next/link";
import { Cabecalho, Rodape } from "@/components/Cabecalho";

export default function PacoteInexistente() {
  return (
    <>
      <Cabecalho />
      <main className="wrap">
        <div className="section vazio-box">
          <h1>Este pacote não está à venda</h1>
          <p>Quem já comprou continua com acesso na área de membros. Veja os pacotes disponíveis.</p>
          <Link className="btn" href="/#oferta">
            Ver os pacotes
          </Link>
        </div>
      </main>
      <Rodape />
    </>
  );
}
