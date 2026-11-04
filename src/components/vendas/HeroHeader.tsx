import { Icone } from "@/components/Icone";
import { Marca } from "./Marca";

// Topo da página inicial (não fica fixo) e a chamada principal
export function HeroHeader() {
  return (
    <>
      <header className="vendas-topo">
        <div className="wrap topo__barra">
          <Marca />
          <a className="botao-contorno" href="#pacotes">
            Ver os kits
            <Icone nome="baixo" tamanho={16} />
          </a>
        </div>
      </header>
      <section className="vendas-hero wrap" aria-labelledby="hero-titulo">
        <h1 className="hero__titulo" id="hero-titulo">
          <span>Uma equipe de IA</span>
          <span>
            <span className="sublinhado">trabalhando por você</span>
          </span>
        </h1>
        <p className="hero__sub">
          Você pede em português. O Claude Code ou o Codex vende, edita vídeo, cria animações e programa com os kits prontos, e um revisor
          confere antes de entregar.
        </p>
        <ul className="hero__sinais">
          <li>O Claude instala para você</li>
          <li>Sem saber programar</li>
          <li>Pagamento único</li>
        </ul>
      </section>
    </>
  );
}
