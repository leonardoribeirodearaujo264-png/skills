"use client";

import { Alerta } from "./Alerta";
import { Icone } from "./Icone";

// Usado pelos error.tsx: não mostra detalhe técnico, só o que a pessoa pode fazer
export function ErroDaPagina({ titulo, texto, tentar }: { titulo: string; texto: string; tentar: () => void }) {
  return (
    <main className="wrap">
      <div className="section">
        <Alerta
          tipo="danger"
          titulo={titulo}
          acoes={
            <button className="btn sm" type="button" onClick={tentar}>
              <Icone nome="atualizar" tamanho={16} />
              Tentar de novo
            </button>
          }
        >
          {texto}
        </Alerta>
      </div>
    </main>
  );
}
