import { Icone } from "@/components/Icone";
import { formatarReais } from "@/lib/loja/dominio";
import type { CartaoVenda } from "@/lib/loja/paginaInicial";
import { FreeAgentsPanel } from "./FreeAgentsPanel";
import { PriceBlock } from "./PriceBlock";

// Capa 3:2 levemente girada; no combo, as miniaturas dos outros pacotes em leque com o selo do desconto
function Capa({ cartao, imediata, desconto }: { cartao: CartaoVenda; imediata: boolean; desconto: number | null }) {
  if (cartao.variante === "combo") {
    return (
      <div className="leque" aria-hidden="true">
        {cartao.minis.slice(0, 4).map((src) => (
          // eslint-disable-next-line @next/next/no-img-element -- miniatura estática de 5 KB, decorativa
          <img key={src} src={src} width={240} height={160} alt="" loading="lazy" decoding="async" />
        ))}
        {desconto !== null ? (
          <span className="leque__selo">
            -{desconto}%<small>CLIENTE</small>
          </span>
        ) : null}
      </div>
    );
  }
  if (!cartao.capa) {
    return (
      <figure className="cartao__capa">
        <div className="capa__vazia" aria-hidden="true">
          {cartao.titulo}
        </div>
      </figure>
    );
  }
  return (
    <figure className="cartao__capa">
      <picture>
        <source srcSet={cartao.capa.webp} type="image/webp" />
        <img
          src={cartao.capa.png}
          width={1200}
          height={800}
          alt={cartao.capa.alt}
          decoding="async"
          loading={imediata ? "eager" : "lazy"}
          fetchPriority={imediata ? "high" : undefined}
        />
      </picture>
    </figure>
  );
}

function Extras({ cartao, totalAgentes }: { cartao: CartaoVenda; totalAgentes: number }) {
  if (cartao.variante === "combo") {
    return (
      <div className="cartao__extras">
        <p className="extras__linha">
          <Icone nome="cadeado" tamanho={16} /> Vale para qualquer e-mail que já comprou
        </p>
        <p className="extras__linha">
          <Icone nome="pacote" tamanho={16} /> Um pacote por compra
        </p>
      </div>
    );
  }
  return (
    <div className="cartao__extras">
      {cartao.agentes ? <FreeAgentsPanel agentes={cartao.agentes} de={cartao.agentesDe} total={totalAgentes} /> : null}
      <p className="extras__linha">
        <Icone nome="terminal" tamanho={16} /> Claude Code e Codex
      </p>
      <p className="extras__linha">
        <Icone nome="baixar" tamanho={16} /> Download logo após o pagamento
      </p>
    </div>
  );
}

function Botao({ cartao }: { cartao: CartaoVenda }) {
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
    <>
      <a className="botao-acao" href={cartao.href}>
        {cartao.botao}
        <span className="botao-acao__icone" aria-hidden="true">
          <Icone nome={cartao.variante === "combo" ? "entrar" : "direita"} tamanho={18} />
        </span>
      </a>
      {cartao.variante === "combo" ? (
        <p className="preco__nota cartao__nota-botao">Use o mesmo e-mail da primeira compra. O desconto é conferido no servidor.</p>
      ) : null}
    </>
  );
}

// Card de pacote da página inicial: avulso, destaque (o primeiro), pacote completo ou combo de cliente
export function ProductCard({
  cartao,
  imediata,
  desconto,
  totalAgentes,
}: {
  cartao: CartaoVenda;
  imediata: boolean;
  desconto: number | null;
  totalAgentes: number;
}) {
  return (
    <article className={`cartao revelar${cartao.variante === "destaque" ? " cartao--destaque" : ""}`} id={cartao.id} aria-labelledby={`${cartao.id}-t`}>
      <Capa cartao={cartao} imediata={imediata} desconto={desconto} />
      <div className="cartao__corpo">
        <p className="cartao__meta">
          {cartao.tag ? <span className={`tag${cartao.tag.suave ? " tag--suave" : ""}`}>{cartao.tag.texto}</span> : null}
          {cartao.meta.length ? (
            <span>
              {cartao.meta.map((m, i) => (
                <span key={m}>
                  {i > 0 ? (
                    <span className="ponto" aria-hidden="true">
                      {" · "}
                    </span>
                  ) : null}
                  {m}
                </span>
              ))}
            </span>
          ) : null}
        </p>
        <h3 className="cartao__titulo" id={`${cartao.id}-t`}>
          {cartao.titulo}
        </h3>
        <p className="cartao__desc">{cartao.descricao}</p>
        {cartao.inclui.length ? (
          <ul className="cartao__inclui" aria-label="Pacotes incluídos">
            {cartao.inclui.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : null}
        {cartao.linhas.length ? (
          <table className="tabela-desconto">
            <caption>Preço de cliente</caption>
            <tbody>
              {cartao.linhas.map((l) => (
                <tr key={l.nome}>
                  <th scope="row">{l.nome}</th>
                  <td>
                    <s>
                      <span className="sr-only">de </span>
                      {formatarReais(l.de)}
                    </s>
                    <strong>
                      <span className="sr-only">por </span>
                      {formatarReais(l.por)}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        <div className="cartao__base">
          <Extras cartao={cartao} totalAgentes={totalAgentes} />
          <hr className="divisor" aria-hidden="true" />
          <PriceBlock preco={cartao.preco} />
        </div>
        <Botao cartao={cartao} />
      </div>
    </article>
  );
}

