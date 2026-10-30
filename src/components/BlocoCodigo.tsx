"use client";

import { useId, useRef, useState } from "react";

type Estado = "ocioso" | "ok" | "erro";

// Bloco de código com botão copiar. Mesmo visual e mesmo plano B (selecionar o texto) das páginas dos vídeos.
export function BlocoCodigo({ rotulo, texto }: { rotulo: string; texto: string }) {
  const id = useId();
  const pre = useRef<HTMLPreElement>(null);
  const [estado, setEstado] = useState<Estado>("ocioso");

  async function copiar() {
    let copiou = false;
    try {
      await navigator.clipboard.writeText(texto);
      copiou = true;
    } catch {
      if (pre.current) {
        const faixa = document.createRange();
        faixa.selectNodeContents(pre.current);
        const sel = getSelection();
        sel?.removeAllRanges();
        sel?.addRange(faixa);
      }
    }
    setEstado(copiou ? "ok" : "erro");
    setTimeout(() => setEstado("ocioso"), 2200);
  }

  return (
    <div className="code">
      <div className="code-bar">
        <span>{rotulo}</span>
        <button className="copy" type="button" onClick={copiar} data-state={estado === "ocioso" ? undefined : estado} aria-describedby={id}>
          {estado === "ok" ? "Copiado" : estado === "erro" ? "Use Ctrl+C" : "Copiar"}
        </button>
      </div>
      <pre ref={pre}>{texto}</pre>
      <span id={id} className="sr-only" aria-live="polite">
        {estado === "ok" ? "Texto copiado." : estado === "erro" ? "Não foi possível copiar. O texto foi selecionado." : ""}
      </span>
    </div>
  );
}
