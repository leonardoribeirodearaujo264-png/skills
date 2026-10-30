"use client";

import Link from "next/link";
import type { BumpNaTela } from "@/lib/loja/checkout";
import { formatarReais } from "@/lib/loja/dominio";

// Oferta complementar opcional no checkout. Vem desmarcada; marcar só soma o preço do banco ao pedido,
// e o servidor recalcula tudo de novo ao cobrar.
export function BlocoBump({
  bump,
  mini,
  marcado,
  aoMudar,
  bloqueado,
}: {
  bump: BumpNaTela;
  mini: string | null;
  marcado: boolean;
  aoMudar: (marcado: boolean) => void;
  bloqueado: boolean;
}) {
  const id = `bump-${bump.slug}`;
  return (
    <div className={`bump${marcado ? " marcado" : ""}`}>
      <input
        id={id}
        type="checkbox"
        checked={marcado}
        disabled={bloqueado}
        onChange={(e) => aoMudar(e.target.checked)}
        aria-describedby={`${id}-desc`}
      />
      <label htmlFor={id} className="bump-corpo">
        {mini ? (
          // eslint-disable-next-line @next/next/no-img-element -- miniatura estática de 5 KB
          <img className="bump-mini" src={mini} width={240} height={160} alt="" loading="lazy" decoding="async" />
        ) : null}
        <span className="bump-texto">
          <span className="bump-topo">
            <strong>Adicionar {bump.titulo}</strong>
            <span className="bump-preco num">+ {formatarReais(bump.precoCentavos)}</span>
          </span>
          <span className="bump-desc" id={`${id}-desc`}>
            {bump.resumo}
          </span>
        </span>
      </label>
      <Link className="bump-ver" href={`/pacotes/${bump.slug}/`} target="_blank" rel="noopener">
        Ver o que vem no {bump.titulo}
      </Link>
    </div>
  );
}
