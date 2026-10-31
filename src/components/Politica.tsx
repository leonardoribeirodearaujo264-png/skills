import Link from "next/link";
import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { CONTATO, linkWhatsApp } from "@/lib/contato";

export type SecaoPolitica = { titulo: string; paragrafos?: string[]; itens?: string[] };

// Página de política (termos, privacidade, reembolso): título, data de atualização, seções e o contato no fim
export function Politica({ titulo, atualizada, introducao, secoes }: { titulo: string; atualizada: string; introducao: string; secoes: SecaoPolitica[] }) {
  return (
    <>
      <Cabecalho />
      <main className="narrow" id="conteudo">
        <article className="guia">
          <h1>{titulo}</h1>
          <p className="muted small">Atualizada em {atualizada}</p>
          <p>{introducao}</p>
          {secoes.map((s) => (
            <section key={s.titulo}>
              <h2>{s.titulo}</h2>
              {s.paragrafos?.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.itens ? (
                <ul>
                  {s.itens.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          <section>
            <h2>Contato</h2>
            <p>
              Dúvidas sobre este documento: <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a> ou{" "}
              <a href={linkWhatsApp} rel="noopener">
                WhatsApp {CONTATO.telefoneTexto}
              </a>
              .
            </p>
            <p>
              <Link href="/">Voltar para a página inicial</Link>
            </p>
          </section>
        </article>
      </main>
      <Rodape />
    </>
  );
}
