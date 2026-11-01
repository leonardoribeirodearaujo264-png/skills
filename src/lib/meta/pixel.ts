// ID do Pixel da Meta. O mesmo número está em public/assets/pixel.js (arquivo estático, sem acesso a este
// módulo); tests/meta.test.ts confere que os dois são iguais.
export const PIXEL_META = "1157956506759143";

// event_id da compra: o navegador e o servidor chegam no mesmo valor sem combinar nada
export const idEventoCompra = (pedidoId: string) => `compra-${pedidoId}`;

// Formato do event_id que o navegador gera (prefixo do evento + UUID)
export const ID_EVENTO_NAVEGADOR = /^(checkout|pagamento)-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
