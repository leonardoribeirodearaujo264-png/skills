import { formatarReais } from "@/lib/loja/dominio";
import type { PrecoCartao } from "@/lib/loja/paginaInicial";

// "R$ 37" ou "R$ 29,60": os centavos só aparecem quando existem
function reais(centavos: number): string {
  return centavos % 100 === 0 ? String(centavos / 100) : (centavos / 100).toFixed(2).replace(".", ",");
}

// Preço confirmado pelo servidor. null: nunca mostra valor de reserva; o botão do card fica bloqueado.
export function PriceBlock({ preco }: { preco: PrecoCartao | null }) {
  if (!preco) {
    return (
      <div className="preco">
        <p className="preco__indisponivel">Preço indisponível</p>
        <p className="preco__nota">Não mostramos valor sem a confirmação do servidor.</p>
      </div>
    );
  }
  const porPacote = preco.soma !== null;
  return (
    <div className="preco">
      {preco.anterior !== null ? (
        porPacote ? (
          <p className="preco__antes">
            {preco.aPartirDe ? "A partir de " : "De "}
            <s>{formatarReais(preco.anterior)}</s> por
          </p>
        ) : (
          <p className="preco__antes">
            Separados, sairiam <s>{formatarReais(preco.anterior)}</s>
          </p>
        )
      ) : null}
      <div className="preco__linha">
        <span className="preco__valor">
          <small>R$</small>
          {reais(preco.centavos)}
        </span>
        <span className="preco__rotulo">{preco.rotulo}</span>
      </div>
      {preco.economia !== null ? <p className="preco__economia">Você economiza {formatarReais(preco.economia)}</p> : null}
      {preco.soma ? (
        <p className="preco__nota">
          Os {preco.soma.qtd} pacotes com desconto: <strong>{formatarReais(preco.soma.por)}</strong>. Separados, sairiam{" "}
          <s>{formatarReais(preco.soma.de)}</s>.
        </p>
      ) : null}
    </div>
  );
}
