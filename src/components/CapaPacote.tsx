import type { Capa } from "@/lib/loja/apresentacao";

// Capa 3:2 do pacote: WebP com PNG de reserva, tamanho fixo para não pular o layout.
// Só a capa principal da tela carrega de imediato; as outras esperam chegar perto da área visível.
// mini: miniatura ao lado do nome (resumo do checkout); o nome já está escrito, então a imagem é decorativa
export function CapaPacote({ capa, imediata = false, mini = false }: { capa: Capa | null; imediata?: boolean; mini?: boolean }) {
  if (!capa) return null;
  if (mini) {
    return (
      <picture className="capa-img mini">
        <img src={capa.mini} width={240} height={160} alt="" decoding="async" loading="lazy" />
      </picture>
    );
  }
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
