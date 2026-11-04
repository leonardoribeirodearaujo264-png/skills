"use client";

import { useEffect, useRef } from "react";
import type { Demonstracao } from "@/lib/loja/apresentacao";

const MS_ANTES_DO_PRIMEIRO = 500;
const MS_ENTRE_PASSOS = 800;

function Check() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9.5 7.5 13 14 5.5" />
    </svg>
  );
}

// Janela que mostra o pedido virando entrega. O HTML já sai no estado final (sem JS e com movimento reduzido
// fica assim); a sequência só roda quando o card entra na tela, uma vez, animando transform e opacity.
export function MockupKit({ demo }: { demo: Demonstracao }) {
  const raiz = useRef<HTMLDivElement>(null);
  const ultimo = demo.passos.length - 1;

  useEffect(() => {
    const el = raiz.current;
    if (!el || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const alvos = [...el.querySelectorAll<HTMLElement>("[data-revela]")];
    const mostrar = (ate: number) => alvos.forEach((a) => a.classList.toggle("ligado", Number(a.dataset.revela) <= ate));
    let timer: ReturnType<typeof setTimeout> | undefined;
    el.classList.add("mockup--anima");
    mostrar(-1);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const avancar = (passo: number) => {
          mostrar(passo);
          if (passo < ultimo) timer = setTimeout(() => avancar(passo + 1), MS_ENTRE_PASSOS);
        };
        timer = setTimeout(() => avancar(0), MS_ANTES_DO_PRIMEIRO);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [ultimo]);

  return (
    <div className="mockup" ref={raiz} role="img" aria-label={demo.resumo}>
      <div aria-hidden="true">
        <div className="mockup__barra">
          <span className="mockup__pontos">
            <i />
            <i />
            <i />
          </span>
          <span>{demo.janela}</span>
        </div>
        <div className="mockup__miolo">
          <p className="mockup__pedido">
            <span>&gt;</span>
            {demo.pedido}
          </p>
          <ol className="mockup__passos">
            {demo.passos.map((p, i) => (
              <li className="mockup__passo" data-revela={i} key={p}>
                <span className="mockup__check">
                  <Check />
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
          <div className="previa">
            <div className="previa__pagina">
              <span className="previa__titulo" data-revela={0}>
                {demo.previa.titulo}
              </span>
              <span className="previa__barra" data-revela={Math.min(1, ultimo)} />
              <span className="previa__barra previa__barra--curta" data-revela={Math.min(1, ultimo)} />
              <span className="previa__base">
                <span className="previa__botao" data-revela={Math.min(3, ultimo)}>
                  {demo.previa.botao}
                </span>
                <span className="previa__selo" data-revela={ultimo}>
                  {demo.previa.selo}
                </span>
              </span>
            </div>
            <div className="previa__extras" data-revela={Math.min(2, ultimo)}>
              {demo.previa.extras.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
