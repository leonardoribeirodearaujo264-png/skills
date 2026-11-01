"use client";

import { useEffect } from "react";
import { acaoCompraMeta } from "@/app/loja/acoes";
import { rastrear } from "@/lib/meta/navegador";
import { idEventoCompra } from "@/lib/meta/pixel";

// Dispara um evento do Pixel uma vez quando a tela aparece. Na compra, o event_id é o do pedido, o mesmo
// que o servidor manda pela API de Conversões, e valor e pacotes vêm do pedido pago no banco.
export function EventoMeta(
  props: { evento: "ViewContent"; valorCentavos?: number; conteudos: string[] } | { evento: "Purchase"; pedidoId: string },
) {
  const chave = JSON.stringify(props);
  useEffect(() => {
    const p = JSON.parse(chave) as typeof props;
    if (p.evento === "ViewContent") return rastrear("ViewContent", { valorCentavos: p.valorCentavos, conteudos: p.conteudos });
    // A mesma compra não é contada de novo ao recarregar a página
    const marca = `meta-compra-${p.pedidoId}`;
    try {
      if (sessionStorage.getItem(marca)) return;
    } catch {
      // sem sessionStorage: a Meta ainda junta pelo event_id
    }
    let ativo = true;
    acaoCompraMeta(p.pedidoId)
      .then((compra) => {
        if (!ativo || !compra) return;
        rastrear("Purchase", compra, idEventoCompra(p.pedidoId), () => {
          try {
            sessionStorage.setItem(marca, "1");
          } catch {
            // idem
          }
        });
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [chave]);
  return null;
}
