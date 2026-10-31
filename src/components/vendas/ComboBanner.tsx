import { Icone } from "@/components/Icone";
import type { ComboCliente } from "@/lib/loja/paginaInicial";

// Pílula do hero: só aparece com a oferta de cliente ativa no banco; o percentual vem de lá
export function ComboBanner({ combo }: { combo: ComboCliente | null }) {
  if (!combo) return null;
  return (
    <a className="pilula-combo" href="#combo">
      <span className="etiqueta-laranja">COMBO</span>
      <span>
        Já tem o pacote base? Leve os outros pacotes com <strong>{combo.desconto}%</strong> de desconto
      </span>
      <span className="pilula-combo__seta" aria-hidden="true">
        <Icone nome="baixo" tamanho={16} />
      </span>
    </a>
  );
}
