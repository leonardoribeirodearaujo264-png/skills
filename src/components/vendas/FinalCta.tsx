import { Icone } from "@/components/Icone";

export function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-titulo">
      <div className="wrap">
        <h2 className="final__titulo revelar" id="final-titulo">
          <span>Comece hoje pelo</span>
          <span>pacote que você precisa</span>
        </h2>
        <p className="final__linha revelar">Pagamento único. O download aparece na hora, logo depois do pagamento.</p>
        <a className="botao-acao revelar" href="#pacotes">
          Ver os pacotes
          <span className="botao-acao__icone" aria-hidden="true">
            <Icone nome="baixo" tamanho={18} />
          </span>
        </a>
      </div>
    </section>
  );
}
