import Link from "next/link";
import { Icone } from "@/components/Icone";
import { linkWhatsApp } from "@/lib/contato";
import type { PaginaInicial } from "@/lib/loja/paginaInicial";
import { ProductCard } from "./ProductCard";

// Lista de pacotes nos três estados que dependem do banco: normal, erro no preço e nenhum pacote à venda
export function PackageList({ pagina }: { pagina: PaginaInicial }) {
  if (pagina.estado === "vazio") {
    return (
      <div className="vendas-vazio">
        <div className="vazio__icone">
          <Icone nome="pacote" tamanho={26} />
        </div>
        <h3>Nenhum pacote à venda agora</h3>
        <p>Os pacotes voltam a aparecer aqui assim que forem reabertos. Os agentes grátis continuam abertos.</p>
        <div className="vendas-acoes">
          <a className="botao-contorno" href="#agentes-gratis">
            Ver os agentes grátis <Icone nome="baixo" tamanho={16} />
          </a>
          <a className="botao-contorno" href={linkWhatsApp} rel="noopener">
            Falar no WhatsApp
          </a>
        </div>
      </div>
    );
  }
  return (
    <>
      {pagina.estado === "erro" ? (
        <div className="faixa-erro" role="alert">
          <Icone nome="alerta" tamanho={20} />
          <div>
            <strong>Não conseguimos carregar os preços agora</strong>
            <p>As compras ficam bloqueadas até o preço ser confirmado. Seus dados e compras anteriores não foram afetados.</p>
            <Link className="botao-texto botao-texto--escuro" href="/" prefetch={false}>
              <Icone nome="atualizar" tamanho={16} /> Tentar de novo
            </Link>
          </div>
        </div>
      ) : null}
      <ul className="lista-cartoes">
        {pagina.cartoes.map((c, i) => (
          <li key={c.id}>
            <ProductCard cartao={c} imediata={i === 0} desconto={pagina.combo?.desconto ?? null} totalAgentes={pagina.agentes.length} />
          </li>
        ))}
      </ul>
    </>
  );
}

// Enquanto o catálogo chega do banco: três cards esqueleto, com aviso só para leitor de tela
export function PackageListSkeleton() {
  const um = (i: number) => (
    <li key={i}>
      <div className="cartao" aria-hidden="true">
        <span className="esqueleto esqueleto--capa" />
        <div>
          <span className="esqueleto" style={{ width: "46%", height: 14 }} />
          <span className="esqueleto" style={{ width: "82%", height: 36, marginTop: 16 }} />
          <span className="esqueleto" style={{ width: "100%", height: 14, marginTop: 20 }} />
          <span className="esqueleto" style={{ width: "92%", height: 14, marginTop: 10 }} />
          <span className="esqueleto" style={{ width: "70%", height: 14, marginTop: 10 }} />
          <span className="esqueleto" style={{ width: "38%", height: 44, marginTop: 28 }} />
          <span className="esqueleto" style={{ width: "100%", height: 56, marginTop: 20, borderRadius: 16 }} />
        </div>
      </div>
    </li>
  );
  return (
    <>
      <p className="sr-only">Carregando os pacotes.</p>
      <ul className="lista-cartoes" aria-busy="true">
        {[0, 1, 2].map(um)}
      </ul>
    </>
  );
}
