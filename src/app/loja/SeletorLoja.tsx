"use client";

import { useMemo, useState } from "react";
import { formatarReais } from "@/lib/loja/dominio";
import { Alerta } from "@/components/Alerta";
import { CapaPacote } from "@/components/CapaPacote";
import type { Capa } from "@/lib/loja/apresentacao";
import { Icone } from "@/components/Icone";

// Tudo o que é preço chega pronto do servidor. Esta tela só mostra e monta a escolha;
// a regra da oferta e o preço são calculados de novo no servidor, no checkout.

export type OfertaVista = {
  codigo: string;
  titulo: string;
  descricao: string;
  tipo: "escolha" | "fixa" | "todos";
  qtdEscolha: number | null;
  precoTexto: string;
  precoReais: string;
  precoCentavos: number;
  referenciaTexto: string | null;
  // preço próprio de algum produto no avulso, já formatado pelo servidor
  nota: string | null;
  // avulso e preço de cliente: o total é o preço do produto escolhido, já calculado no servidor
  porProduto: boolean;
  precos: Record<string, number> | null;
  incluidos: string[] | null;
  destaque: boolean;
};

export type ProdutoVista = {
  slug: string;
  capa: Capa | null;
  titulo: string;
  resumo: string;
  destaques: string[];
  chips: string[];
  precoAvulsoCentavos: number | null;
};

type Props = {
  ofertas: OfertaVista[];
  produtos: ProdutoVista[];
  possui: string[];
  ofertaInicial: string | null;
  produtosIniciais: string[];
};

export function SeletorLoja({ ofertas, produtos, possui, ofertaInicial, produtosIniciais }: Props) {
  const jaTem = useMemo(() => new Set(possui), [possui]);
  // Avulso vem marcado: um clique no pacote já libera o pagamento
  const avulso = ofertas.find((o) => o.porProduto && o.qtdEscolha === 1);
  const padrao = ofertas.find((o) => o.codigo === ofertaInicial) ?? avulso ?? ofertas.find((o) => o.destaque) ?? ofertas[0];
  const [codigo, setCodigo] = useState(padrao?.codigo ?? "");
  const [escolhidos, setEscolhidos] = useState<string[]>(() =>
    padrao?.tipo === "escolha"
      ? produtosIniciais.filter((s) => !jaTem.has(s) && produtos.some((p) => p.slug === s)).slice(0, padrao.qtdEscolha ?? 0)
      : [],
  );

  const marcada = ofertas.find((o) => o.codigo === codigo);
  if (!marcada) return <Alerta tipo="warn" titulo="Nenhuma oferta disponível agora" />;

  // Combo de escolha com um só pacote marcado não trava: segue como avulso daquele pacote
  const unico = escolhidos.length === 1 ? escolhidos[0] : undefined;
  const comoAvulso =
    marcada.tipo === "escolha" && (marcada.qtdEscolha ?? 0) > 1 && avulso !== undefined && unico !== undefined && !jaTem.has(unico);
  const oferta = comoAvulso && avulso ? avulso : marcada;
  const dica = comoAvulso
    ? `Quer economizar? Escolha mais ${(marcada.qtdEscolha ?? 0) - 1} e leve ${marcada.qtdEscolha} por ${marcada.precoTexto}.`
    : "";

  const escolha = oferta.tipo === "escolha";
  const limite = oferta.qtdEscolha ?? 0;
  // A lista de pacotes segue a oferta marcada (no leve 3 dá para marcar até 3), o resumo segue a efetiva
  const limiteLista = marcada.qtdEscolha ?? 0;
  const itens = escolha ? escolhidos : (oferta.incluidos ?? []);
  const novos = itens.filter((s) => !jaTem.has(s));
  const faltam = escolha ? limite - escolhidos.length : 0;
  const tudoJaSeu = !escolha && novos.length === 0;
  const motivo = tudoJaSeu
    ? "Você já tem todos os produtos desta oferta."
    : faltam > 0
      ? faltam === 1
        ? "Escolha mais 1 produto para continuar."
        : `Escolha mais ${faltam} produtos para continuar.`
      : "";

  function trocarOferta(novo: string) {
    const o = ofertas.find((x) => x.codigo === novo);
    if (!o) return;
    setCodigo(novo);
    setEscolhidos((atual) => (o.tipo === "escolha" ? atual.slice(0, o.qtdEscolha ?? 0) : atual));
  }

  function alternar(slug: string, marcado: boolean) {
    if (!escolha) return;
    if (limiteLista === 1) return setEscolhidos(marcado ? [slug] : []);
    setEscolhidos((atual) => (marcado ? (atual.length < limiteLista ? [...atual, slug] : atual) : atual.filter((s) => s !== slug)));
  }

  const titulo = (slug: string) => produtos.find((p) => p.slug === slug)?.titulo ?? slug;
  // Só exibição: o servidor recalcula tudo ao comprar
  const avulsoDe = (slug: string) => produtos.find((p) => p.slug === slug)?.precoAvulsoCentavos ?? null;
  const escolhidoAvulso = oferta.porProduto && escolhidos[0] ? (oferta.precos?.[escolhidos[0]] ?? null) : null;
  const totalTexto = escolhidoAvulso !== null ? formatarReais(escolhidoAvulso) : oferta.precoTexto;
  const somaItens = itens.reduce((t, s) => t + (avulsoDe(s) ?? 0), 0);
  const economiaTexto =
    !oferta.porProduto && itens.length > 0 && faltam <= 0 && somaItens > oferta.precoCentavos
      ? formatarReais(somaItens)
      : oferta.referenciaTexto;

  return (
    // GET para o checkout: abrir não cria pedido nem pede login; o e-mail é pedido lá
    <form method="get" action="/loja/checkout/">
      <input type="hidden" name="oferta" value={oferta.codigo} />
      <input type="hidden" name="produtos" value={escolha ? escolhidos.join(",") : ""} />

      <section className="section" aria-labelledby="passo-oferta">
        <div className="section-head">
          <div className="step-head">
            <span className="step-num" aria-hidden="true">1</span>
            <h2 id="passo-oferta">Escolha a oferta</h2>
          </div>
        </div>
        <fieldset className="ofertas">
          <legend>Oferta</legend>
          {ofertas.map((o) => (
            <label key={o.codigo} className="oferta-opcao">
              {o.destaque && <span className="selo">MAIS ESCOLHIDA</span>}
              <input
                type="radio"
                name="oferta-escolha"
                value={o.codigo}
                checked={o.codigo === codigo}
                onChange={() => trocarOferta(o.codigo)}
                aria-describedby={`of-${o.codigo}`}
              />
              <div className="shell">
                <div className="core">
                  <span className="nome">
                    {o.titulo}
                    <span className="radio" aria-hidden="true" />
                  </span>
                  <p className="desc" id={`of-${o.codigo}`}>
                    {o.descricao}
                  </p>
                  <span className="valor num" aria-label={o.precoTexto}>
                    <small>R$</small>
                    {o.precoReais}
                  </span>
                  <span className="por">
                    {o.nota ?? (o.referenciaTexto ? `Avulso sairia ${o.referenciaTexto}` : "Pagamento único")}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </fieldset>
      </section>

      <div className="section loja-grid">
        <section aria-labelledby="passo-produtos">
          <div className="section-head">
            <div>
              <div className="step-head">
                <span className="step-num" aria-hidden="true">2</span>
                <h2 id="passo-produtos">{escolha ? "Escolha os produtos" : "O que vem na oferta"}</h2>
              </div>
              <p id="dica-produtos">
                {escolha
                  ? limiteLista === 1
                    ? "Escolha 1 produto."
                    : `Escolha ${limiteLista} produtos.`
                  : oferta.tipo === "todos"
                    ? "O combo inclui todos os produtos."
                    : "Este pacote tem composição fixa."}
              </p>
            </div>
            <span className="contador" aria-live="polite">
              {escolha ? (
                <>
                  <b>{escolhidos.length}</b> de {limiteLista} escolhidos
                </>
              ) : (
                `${itens.length} incluídos`
              )}
            </span>
          </div>

          {!escolha && !tudoJaSeu && novos.length < itens.length && (
            <Alerta tipo="info" titulo="Você já tem parte desta oferta">
              Os produtos marcados como seus continuam com o acesso que você já tem.
            </Alerta>
          )}

          <fieldset className="produtos" style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }} aria-describedby="dica-produtos">
            <legend className="sr-only">Produtos</legend>
            {produtos.map((p) => {
              const seu = jaTem.has(p.slug);
              const incluido = !escolha && itens.includes(p.slug);
              const marcado = escolha ? escolhidos.includes(p.slug) : incluido;
              const cheio = escolha && limiteLista > 1 && escolhidos.length >= limiteLista && !marcado;
              const trava = seu ? "possui" : !escolha ? (incluido ? "fixo" : "fora") : cheio ? "limite" : undefined;
              return (
                <label key={p.slug} className="prod" data-trava={trava}>
                  <input
                    type={escolha && limiteLista === 1 ? "radio" : "checkbox"}
                    name="produto-escolha"
                    value={p.slug}
                    checked={marcado && !seu}
                    disabled={seu || !escolha || cheio}
                    onChange={(e) => alternar(p.slug, e.target.checked)}
                    aria-describedby={`pd-${p.slug}`}
                  />
                  <div className="shell">
                    <div className="core">
                      <CapaPacote capa={p.capa} />
                      <div className="topo">
                        <h3>{p.titulo}</h3>
                        <span className="check" aria-hidden="true">
                          <Icone nome="check" tamanho={16} />
                        </span>
                      </div>
                      <p id={`pd-${p.slug}`}>{p.resumo}</p>
                      {p.destaques.length > 0 && (
                        <ul>
                          {p.destaques.map((d) => (
                            <li key={d}>
                              <Icone nome="check" tamanho={14} />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="meta">
                        {p.chips.map((c) => (
                          <span key={c} className="chip">
                            {c}
                          </span>
                        ))}
                        {seu && <span className="chip ok">Já é seu</span>}
                        {!seu && !escolha && !incluido && <span className="chip">Fora desta oferta</span>}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </fieldset>
        </section>

        <aside className="resumo" aria-labelledby="resumo-titulo">
          <div className="shell">
            <div className="core" id="resumo">
              <h2 id="resumo-titulo" tabIndex={-1}>
                Resumo do pedido
              </h2>
              <dl>
                <div>
                  <dt>Oferta</dt>
                  <dd>{oferta.titulo}</dd>
                </div>
              </dl>
              <ol aria-label="Produtos no pedido">
                {itens.map((s, i) => (
                  <li key={s}>
                    <span className="n">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      {titulo(s)}
                      {jaTem.has(s) && <span className="small muted"> (já é seu)</span>}
                    </span>
                  </li>
                ))}
                {Array.from({ length: Math.max(0, faltam) }, (_, i) => (
                  <li key={`vazio-${i}`} className="vazio">
                    Produto a escolher
                  </li>
                ))}
              </ol>
              <div className="total">
                <div>
                  <span className="small muted">Total</span>
                  {economiaTexto && !oferta.porProduto && (
                    <>
                      <br />
                      <span className="economia">Avulso sairia {economiaTexto}</span>
                    </>
                  )}
                </div>
                <span className="valor num">{totalTexto}</span>
              </div>
              <BotaoContinuar bloqueado={Boolean(motivo)} />
              <p className="motivo" id="r-motivo">
                {motivo || dica}
              </p>
              <p className="selo-mp">
                <Icone nome="escudo" tamanho={14} />
                Pagamento por Pix ou cartão
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="barra-movel" role="region" aria-label="Total do pedido">
        <div>
          <div className="rot">{oferta.titulo}</div>
          <div className="valor num">{totalTexto}</div>
        </div>
        <a className="btn sm" href="#resumo-titulo">
          Revisar pedido
        </a>
      </div>
    </form>
  );
}

function BotaoContinuar({ bloqueado }: { bloqueado: boolean }) {
  return (
    <button className="btn lg" type="submit" disabled={bloqueado} aria-describedby="r-motivo">
      Continuar para o pagamento
      <span className="ico">
        <Icone nome="direita" tamanho={16} />
      </span>
    </button>
  );
}
