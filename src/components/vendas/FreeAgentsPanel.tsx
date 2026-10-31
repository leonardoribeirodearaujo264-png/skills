"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icone } from "@/components/Icone";
import type { AgenteGratis } from "@/lib/loja/paginaInicial";

type Aberto = "fechado" | "clique" | "hover";

// Botão "Agentes grátis" do card e o painel com as páginas grátis ligadas ao pacote.
// Abre com clique, toque, Enter ou Espaço; com mouse também abre ao passar por cima (atalho, não o único caminho)
// e o clique fixa. Fecha com Esc (o foco volta ao botão), clique fora, botão Fechar, link "Ver todos" ou quando
// o foco sai do conjunto. Como abrir outro é clicar fora deste, só um fica aberto por vez.
export function FreeAgentsPanel({ agentes, de, total }: { agentes: AgenteGratis[]; de: string; total: number }) {
  const [aberto, setAberto] = useState<Aberto>("fechado");
  const ancora = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const painelId = `painel-${id}`;
  const n = agentes.length;

  useEffect(() => {
    if (aberto === "fechado") return;
    const fora = (e: PointerEvent) => {
      if (!ancora.current?.contains(e.target as Node)) fecharJa();
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      fecharJa();
      botao.current?.focus();
    };
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  // Fecha e cancela o hover pendente, para o timer de entrada não reabrir o painel logo depois
  function fecharJa() {
    clearTimeout(timer.current ?? undefined);
    setAberto("fechado");
  }

  const mouseFino = (e: React.PointerEvent) => e.pointerType === "mouse" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function entrar(e: React.PointerEvent) {
    if (!mouseFino(e)) return;
    clearTimeout(timer.current ?? undefined);
    timer.current = setTimeout(() => setAberto((a) => (a === "fechado" ? "hover" : a)), 140);
  }

  function sair(e: React.PointerEvent) {
    if (!mouseFino(e)) return;
    clearTimeout(timer.current ?? undefined);
    // Com o foco dentro do painel (Tab depois do hover), o mouse sair não fecha
    timer.current = setTimeout(() => {
      if (ancora.current?.contains(document.activeElement)) return;
      setAberto((a) => (a === "hover" ? "fechado" : a));
    }, 220);
  }

  // Aberto pelo hover: o clique fixa o painel em vez de fechar
  function alternar() {
    clearTimeout(timer.current ?? undefined);
    setAberto((a) => (a === "hover" ? "clique" : a === "clique" ? "fechado" : "clique"));
  }

  function focoSaiu(e: React.FocusEvent) {
    if (e.relatedTarget && !ancora.current?.contains(e.relatedTarget as Node)) fecharJa();
  }

  const estaAberto = aberto !== "fechado";
  return (
    <div className="agentes-ancora" ref={ancora} onPointerEnter={entrar} onPointerLeave={sair} onBlur={focoSaiu}>
      <button
        ref={botao}
        type="button"
        className="botao-estrela"
        aria-expanded={estaAberto}
        aria-controls={painelId}
        aria-haspopup="dialog"
        onClick={alternar}
      >
        <Icone nome="estrela" tamanho={18} /> Agentes grátis{" "}
        <span className="contagem" aria-label={`${n} disponíveis`}>
          {n}
        </span>
      </button>
      <div className="painel" id={painelId} role="dialog" aria-modal="false" aria-labelledby={`${painelId}-t`} data-aberto={estaAberto}>
        <div className="painel__cabeca">
          <p className="painel__titulo" id={`${painelId}-t`}>
            {n ? `Agentes grátis ligados a ${de}` : "Nenhum agente grátis por aqui ainda"}
          </p>
          <button
            type="button"
            className="painel__fechar"
            aria-label={`Fechar agentes grátis de ${de}`}
            onClick={() => {
              fecharJa();
              botao.current?.focus();
            }}
          >
            <Icone nome="fechar" tamanho={18} />
          </button>
        </div>
        {n ? (
          <ul className="painel__lista">
            {agentes.map((g) => (
              <li className="painel__item" key={g.pasta}>
                <a href={`/${g.pasta}/`}>
                  <strong>{g.titulo}</strong>
                  <span>{g.frase}</span>
                  <Icone nome="seta" tamanho={16} />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="painel__vazio">Ainda não há agente grátis ligado a este pacote. Os {total} agentes do site estão na lista completa.</p>
        )}
        <div className="painel__rodape">
          <a href="#agentes-gratis" onClick={fecharJa}>
            Ver todos os agentes grátis <Icone nome="baixo" tamanho={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
