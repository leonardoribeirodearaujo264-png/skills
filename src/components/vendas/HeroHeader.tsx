import type { ReactNode } from "react";
import { Icone } from "@/components/Icone";
import { Marca } from "./Marca";

// Topo da página inicial (não fica fixo) e a chamada principal. combo: a pílula do combo, que depende do banco
export function HeroHeader({ combo }: { combo: ReactNode }) {
  return (
    <>
      <header className="vendas-topo">
        <div className="wrap topo__barra">
          <Marca />
          <a className="botao-contorno" href="#pacotes">
            Ver os pacotes
            <Icone nome="baixo" tamanho={16} />
          </a>
        </div>
      </header>
      <section className="vendas-hero wrap" aria-labelledby="hero-titulo">
        <h1 className="hero__titulo" id="hero-titulo">
          <span>Escolha o seu</span>
          <span>
            <span className="sublinhado">pacote de skills</span>
          </span>
        </h1>
        <p className="hero__sub">
          Skills, agentes e prompts prontos para o Claude Code e o Codex, organizados por área e explicados em português.
        </p>
        {combo}
        <ul className="hero__sinais">
          <li>Claude Code e Codex</li>
          <li>Instalador incluso</li>
          <li>Pagamento único</li>
        </ul>
      </section>
    </>
  );
}
