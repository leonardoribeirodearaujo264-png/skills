// Eventos do Pixel da Meta no navegador. O pixel.js carrega depois da página, então o evento espera o fbq
// aparecer por alguns segundos antes de desistir (bloqueador de anúncio, por exemplo).

type Fbq = (comando: "track", evento: string, dados?: Record<string, unknown>, opcoes?: { eventID: string }) => void;

export type DadosEvento = { valorCentavos?: number; conteudos?: string[] };

function dadosDoPixel(d: DadosEvento): Record<string, unknown> {
  return {
    currency: "BRL",
    ...(d.valorCentavos !== undefined ? { value: d.valorCentavos / 100 } : {}),
    ...(d.conteudos?.length ? { content_ids: d.conteudos, content_type: "product", num_items: d.conteudos.length } : {}),
  };
}

// aoEnviar: chamado só quando o evento foi de fato entregue ao fbq
export function rastrear(evento: string, dados: DadosEvento, eventoId?: string, aoEnviar?: () => void, tentativas = 25): void {
  const fbq = (window as Window & { fbq?: Fbq }).fbq;
  if (fbq) {
    fbq("track", evento, dadosDoPixel(dados), eventoId ? { eventID: eventoId } : undefined);
    aoEnviar?.();
    return;
  }
  if (tentativas > 0) setTimeout(() => rastrear(evento, dados, eventoId, aoEnviar, tentativas - 1), 200);
}

// event_id que o servidor repete na API de Conversões (formato conferido por ID_EVENTO_NAVEGADOR)
export const novoEventoId = (prefixo: "checkout" | "pagamento") => `${prefixo}-${crypto.randomUUID()}`;
