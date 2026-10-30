"use client";

import { useEffect, useState } from "react";

// Barra fixa de compra no celular: aparece só depois que o botão do painel saiu por cima da tela
// e enquanto o botão do fim da página não está visível. Escondida, fica fora do foco e do leitor de tela.
export function BarraCompra({ titulo, precoTexto, comprarUrl }: { titulo: string; precoTexto: string; comprarUrl: string }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const alvos = [...document.querySelectorAll<HTMLElement>("[data-observa-compra]")];
    if (!alvos.length || !("IntersectionObserver" in window)) return;
    const atualizar = () => {
      const [painel, ...outros] = alvos.map((el) => el.getBoundingClientRect());
      const passou = painel !== undefined && painel.bottom < 0;
      const outroVisivel = outros.some((r) => r.top < innerHeight && r.bottom > 0);
      setVisivel(passou && !outroVisivel);
    };
    const io = new IntersectionObserver(atualizar, { threshold: [0, 1] });
    alvos.forEach((a) => io.observe(a));
    // Girar o celular muda a altura da tela sem cruzar o limite observado
    addEventListener("resize", atualizar);
    return () => {
      io.disconnect();
      removeEventListener("resize", atualizar);
    };
  }, []);

  return (
    <div className={`pp-barra${visivel ? " visivel" : ""}`} aria-hidden={!visivel} inert={!visivel}>
      <div className="pp-barra-info">
        <span className="pp-barra-nome">{titulo}</span>
        <span className="cat-preco">{precoTexto}</span>
      </div>
      <a className="btn" href={comprarUrl} aria-label={`Comprar: ${titulo}`}>
        Comprar
      </a>
    </div>
  );
}
