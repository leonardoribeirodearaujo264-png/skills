"use client";

import { ErroDaPagina } from "@/components/ErroDaPagina";

export default function ErroPacote({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErroDaPagina
      titulo="Não conseguimos carregar o pacote agora"
      texto="Pode ser a sua conexão ou uma instabilidade do nosso lado. Nenhum pagamento foi iniciado."
      tentar={reset}
    />
  );
}
