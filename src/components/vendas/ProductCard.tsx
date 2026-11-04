import { Icone } from "@/components/Icone";
import type { CartaoVenda } from "@/lib/loja/paginaInicial";
import { MockupKit } from "./MockupKit";
import { PriceBlock } from "./PriceBlock";

function Compra({ cartao }: { cartao: CartaoVenda }) {
  if (!cartao.preco) {
    const motivo = `motivo-${cartao.slug}`;
    return (
      <>
        <button type="button" className="botao-acao" aria-disabled="true" aria-describedby={motivo}>
          Compra bloqueada
          <span className="botao-acao__icone" aria-hidden="true">
            <Icone nome="cadeado" tamanho={18} />
          </span>
        </button>
        <p className="cartao__motivo" id={motivo}>
          O preço não carregou. Para não cobrar um valor errado, a compra fica bloqueada até o servidor responder.
        </p>
      </>
    );
  }
  return (
    <a className="botao-acao" href={cartao.href}>
      {cartao.botao}
    </a>
  );
}

// Card de produto da vitrine: mudam só os dados de CartaoVenda (src/lib/loja/paginaInicial.ts).
// Protótipo aprovado: variação B de prototipos/card-vitrine.
export function ProductCard({ cartao }: { cartao: CartaoVenda }) {
  const qtdNumeros = cartao.numeros.length;
  return (
    <article className={`cartao revelar${cartao.variante === "destaque" ? " cartao--destaque" : ""}`} id={cartao.id} aria-labelledby={`${cartao.id}-t`}>
      {cartao.demonstracao ? (
        <div className="palco">
          <MockupKit demo={cartao.demonstracao} />
        </div>
      ) : null}
      <div className="cartao__corpo">
        <div>
          {cartao.etiqueta ? <p className="cartao__etiqueta">{cartao.etiqueta}</p> : null}
          <h3 className="cartao__titulo" id={`${cartao.id}-t`}>
            {cartao.titulo}
          </h3>
          <p className="cartao__desc">{cartao.descricao}</p>
        </div>
        {qtdNumeros ? (
          <ul className={`numeros numeros--${qtdNumeros}`}>
            {cartao.numeros.map((n) => (
              <li className="numero" key={n.nome}>
                <span className="numero__valor">{n.valor}</span>
                <span className="numero__nome">{n.nome}</span>
                {n.ajuda ? (
                  <span className="numero__ajuda">
                    <span className="sr-only">, </span>
                    {n.ajuda}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {cartao.inclui.length ? (
          <ul className="cartao__inclui" aria-label="Kits incluídos">
            {cartao.inclui.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : null}
        {cartao.agentesGratis > 0 ? (
          <p className="cartao__bonus">
            <strong>
              {cartao.agentesGratis} {cartao.agentesGratis === 1 ? "agente grátis" : "agentes grátis"}
            </strong>
            , abertos no site, sem precisar comprar.
          </p>
        ) : null}
        <dl className="fatos">
          <div>
            <dt>Compatível com</dt>
            <dd>Claude Code e Codex</dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>Download imediato após o pagamento</dd>
          </div>
        </dl>
      </div>
      <div className="cartao__pe">
        <PriceBlock preco={cartao.preco} />
        <Compra cartao={cartao} />
      </div>
    </article>
  );
}
