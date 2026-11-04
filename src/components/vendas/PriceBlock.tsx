import { formatarReais } from "@/lib/loja/dominio";
import type { PrecoCartao } from "@/lib/loja/paginaInicial";

// "R$ 27" ou "R$ 21,60": os centavos só aparecem quando existem
function reais(centavos: number): string {
  return centavos % 100 === 0 ? String(centavos / 100) : (centavos / 100).toFixed(2).replace(".", ",");
}

// Preço confirmado pelo servidor. null: nunca mostra valor de reserva; o botão do card fica bloqueado.
export function PriceBlock({ preco }: { preco: PrecoCartao | null }) {
  if (!preco) {
    return (
      <div className="preco">
        <p className="preco__indisponivel">Preço indisponível</p>
      </div>
    );
  }
  return (
    <div className="preco">
      {preco.anterior !== null ? (
        <p className="preco__antes">
          Separados, sairiam <s>{formatarReais(preco.anterior)}</s>
        </p>
      ) : null}
      <div className="preco__linha">
        <span className="preco__valor">
          <small>R$</small>
          {reais(preco.centavos)}
        </span>
        <span className="preco__rotulo">{preco.rotulo}</span>
      </div>
      {preco.economia !== null ? <p className="preco__economia">Você economiza {formatarReais(preco.economia)}</p> : null}
    </div>
  );
}
