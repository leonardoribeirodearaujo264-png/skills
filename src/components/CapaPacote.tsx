import type { Capa } from "@/lib/loja/apresentacao";

// Capa 3:2 do pacote: WebP com PNG de reserva, tamanho fixo para não pular o layout.
// Só a capa principal da tela carrega de imediato; as outras esperam chegar perto da área visível.
export function CapaPacote({ capa, imediata = false }: { capa: Capa | null; imediata?: boolean }) {
  if (!capa) return null;
  return (
    <picture className="capa-img">
      <source srcSet={capa.webp} type="image/webp" />
      <img
        src={capa.png}
        width={1200}
        height={800}
        alt={capa.alt}
        decoding="async"
        loading={imediata ? "eager" : "lazy"}
        fetchPriority={imediata ? "high" : undefined}
      />
    </picture>
  );
}
