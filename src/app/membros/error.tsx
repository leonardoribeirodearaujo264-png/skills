"use client";

import { ErroDaPagina } from "@/components/ErroDaPagina";

export default function ErroMembros({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErroDaPagina
      titulo="Não conseguimos abrir a sua área agora"
      texto="Os seus acessos continuam guardados. Tente de novo em instantes."
      tentar={reset}
    />
  );
}
