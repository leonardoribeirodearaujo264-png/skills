"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Enquanto o pedido está pendente, pede a página de novo a cada 3 s por até 60 s
export function Atualizador({ ativo }: { ativo: boolean }) {
  const router = useRouter();
  const [tentativas, setTentativas] = useState(0);
  useEffect(() => {
    if (!ativo || tentativas >= 20) return;
    const t = setTimeout(() => {
      setTentativas((n) => n + 1);
      router.refresh();
    }, 3000);
    return () => clearTimeout(t);
  }, [ativo, tentativas, router]);
  if (!ativo) return null;
  return tentativas >= 20 ? (
    <p className="small muted">
      Ainda sem confirmação. Pode fechar esta página: o acesso aparece na sua área assim que o Mercado Pago confirmar.
    </p>
  ) : (
    <div className="progresso" role="progressbar" aria-label="Confirmando o pagamento">
      <span />
    </div>
  );
}
