"use client";

import { useState } from "react";
import { Icone } from "@/components/Icone";
import type { AgenteGratis } from "@/lib/loja/paginaInicial";

const TODOS = "todos";

// Grade das páginas grátis dos vídeos com filtro por pacote. Sem JS, a lista completa já vem do servidor.
export function FreeAgentsSection({ agentes, filtros }: { agentes: AgenteGratis[]; filtros: { slug: string; nome: string }[] }) {
  const [filtro, setFiltro] = useState(TODOS);
  const lista = filtro === TODOS ? agentes : agentes.filter((g) => g.pacote === filtro);
  const nome = filtros.find((f) => f.slug === filtro)?.nome ?? "";
  const opcoes = [{ slug: TODOS, nome: "Todos" }, ...filtros];

  return (
    <section className="gratis" id="agentes-gratis" aria-labelledby="gratis-titulo">
      <div className="wrap">
        <div className="secao-cabeca">
          <div>
            <p className="olho">
              <Icone nome="estrela" tamanho={14} />
              Abertos, sem cadastro
            </p>
            <h2 className="secao-titulo" id="gratis-titulo">
              Agentes grátis
            </h2>
          </div>
          <p className="secao-apoio">Prompts e passo a passo dos vídeos do canal. Copie, cole no Claude Code e teste antes de escolher um pacote.</p>
        </div>
        <div className="filtros" role="group" aria-label="Filtrar agentes grátis por pacote">
          {opcoes.map((o) => (
            <button key={o.slug} type="button" className="filtro" aria-pressed={filtro === o.slug} onClick={() => setFiltro(o.slug)}>
              {o.nome}
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {lista.length ? `Mostrando ${lista.length} agentes grátis.` : `Nenhum agente grátis de ${nome}.`}
        </p>
        <ul className="grade-gratis">
          {lista.length ? (
            lista.map((g) => (
              <li key={g.pasta}>
                <a className="agente" href={`/${g.pasta}/`}>
                  <span className="agente__tipo">
                    {g.tipo}
                    <Icone nome="seta" tamanho={18} />
                  </span>
                  <h3>{g.titulo}</h3>
                  <p>{g.frase}</p>
                  <p className="agente__pacote">Ligado a: {g.pacoteCurto}</p>
                </a>
              </li>
            ))
          ) : (
            <li className="grade-gratis__vazio">
              <div className="vendas-vazio">
                <div className="vazio__icone">
                  <Icone nome="estrela" tamanho={26} />
                </div>
                <h3>Ainda não há agente grátis de {nome}</h3>
                <p>Quando sair um vídeo dessa área, o agente aparece aqui. Enquanto isso, veja os outros {agentes.length}.</p>
                <div className="vendas-acoes">
                  <button type="button" className="botao-contorno" onClick={() => setFiltro(TODOS)}>
                    Ver todos
                  </button>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
