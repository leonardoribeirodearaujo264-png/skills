"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Alerta } from "@/components/Alerta";
import { Icone } from "@/components/Icone";
import type { BumpNaTela } from "@/lib/loja/checkout";
import { formatarReais } from "@/lib/loja/dominio";
import {
  erroEmail,
  erroNome,
  erroTelefone,
  mascararTelefone,
  type Campo,
  type ErrosComprador,
} from "@/lib/loja/comprador";
import { acaoGerarPix, acaoPagarCartao, acaoSituacao, type PixNaTela } from "../acoes";
import { BlocoBump } from "./BlocoBump";
import { PixTela } from "./PixTela";

// Checkout no próprio site: nome, e-mail e telefone, e pagamento por Pix ou cartão sem sair da página.
// As regras dos campos são as mesmas do servidor (src/lib/loja/comprador.ts), que valida tudo de novo.

type Props = {
  oferta: string;
  produtos: string;
  emailSessao: string | null;
  valorCentavos: number;
  // ofertas complementares, cada uma com a miniatura da capa (src/lib/loja/apresentacao.ts)
  bumps: (BumpNaTela & { mini: string | null })[];
  chavePublica: string | null;
};

type Etapa =
  | { tipo: "formulario" }
  | { tipo: "pix"; pix: PixNaTela }
  | { tipo: "aprovado" }
  | { tipo: "analise"; pedidoId: string };

const VALIDADORES: Record<Campo, (v: string) => string | null> = { nome: erroNome, email: erroEmail, telefone: erroTelefone };
const INTERVALO_CONSULTA_MS = 5000;

export function CheckoutPagamento({ oferta, produtos, emailSessao, valorCentavos: base, bumps, chavePublica }: Props) {
  // Ofertas complementares: todas desmarcadas; a pessoa marca quantas quiser, o total muda na hora
  // e o servidor confere tudo de novo
  const [marcados, setMarcados] = useState<string[]>([]);
  const escolhidos = bumps.filter((b) => marcados.includes(b.slug));
  const valorCentavos = base + escolhidos.reduce((t, b) => t + b.precoCentavos, 0);
  const totalTexto = formatarReais(valorCentavos);
  const [campos, setCampos] = useState<Record<Campo, string>>({ nome: "", email: emailSessao ?? "", telefone: "" });
  const [tocados, setTocados] = useState<Partial<Record<Campo, boolean>>>({});
  const [errosServidor, setErrosServidor] = useState<ErrosComprador>({});
  const [aba, setAba] = useState<"pix" | "cartao">("pix");
  const [etapa, setEtapa] = useState<Etapa>({ tipo: "formulario" });
  const [erro, setErro] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);

  const erros: ErrosComprador = {
    nome: VALIDADORES.nome(campos.nome) ?? undefined,
    email: VALIDADORES.email(campos.email) ?? undefined,
    telefone: VALIDADORES.telefone(campos.telefone) ?? undefined,
  };
  const tudoValido = !erros.nome && !erros.email && !erros.telefone;
  const entrada = { oferta, produtos, bumps: escolhidos.map((b) => b.slug).join(","), ...campos };
  const erroVisivel = (c: Campo) => (tocados[c] ? erros[c] : undefined) ?? errosServidor[c];

  function mudar(c: Campo, valor: string) {
    setCampos((atual) => ({ ...atual, [c]: c === "telefone" ? mascararTelefone(valor) : valor }));
    setErrosServidor((atual) => ({ ...atual, [c]: undefined }));
  }

  async function gerar() {
    setErro(null);
    setTocados({ nome: true, email: true, telefone: true });
    if (!tudoValido) return;
    setGerando(true);
    const r = await acaoGerarPix(entrada).catch(() => ({ ok: false as const, erro: "Sem conexão. Tente de novo." }));
    setGerando(false);
    if (!r.ok) {
      setErro(r.erro);
      if ("campos" in r && r.campos) setErrosServidor(r.campos);
      return;
    }
    if ("situacao" in r) return setEtapa(r.situacao === "aprovado" ? { tipo: "aprovado" } : { tipo: "analise", pedidoId: r.pedidoId });
    setEtapa({ tipo: "pix", pix: r });
  }

  // Cartão em análise: confere até aprovar
  const analise = etapa.tipo === "analise" ? etapa.pedidoId : null;
  useEffect(() => {
    if (!analise) return;
    const id = setInterval(async () => {
      if ((await acaoSituacao(analise).catch(() => "outro")) === "pago") setEtapa({ tipo: "aprovado" });
    }, INTERVALO_CONSULTA_MS);
    return () => clearInterval(id);
  }, [analise]);

  const emailFinal = emailSessao ?? campos.email.trim().toLowerCase();

  if (etapa.tipo === "pix") return <PixTela inicial={etapa.pix} totalTexto={totalTexto} email={emailFinal} />;

  if (etapa.tipo === "aprovado") {
    return (
      <div className="checkout-resultado" role="status">
        <span className="icone-grande ok" aria-hidden="true">
          <Icone nome="ok" tamanho={26} />
        </span>
        <h2>Pagamento aprovado</h2>
        <p className="muted">
          Enviamos o acesso para <strong>{emailFinal}</strong>. Entre na área de membros com o código desse e-mail.
        </p>
        <Link className="btn lg" href="/entrar/?next=%2Fmembros%2F">
          Entrar na área de membros
          <span className="ico">
            <Icone nome="direita" tamanho={16} />
          </span>
        </Link>
      </div>
    );
  }

  if (etapa.tipo === "analise") {
    return (
      <div className="checkout-resultado" role="status">
        <span className="icone-grande" aria-hidden="true">
          <Icone nome="relogio" tamanho={26} />
        </span>
        <h2>Pagamento em análise</h2>
        <p className="muted">
          O banco está conferindo o pagamento. Assim que aprovar, o acesso chega em <strong>{emailFinal}</strong>. Pode fechar
          esta página.
        </p>
        <div className="progresso" role="progressbar" aria-label="Aguardando aprovação">
          <span />
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-pagamento">
      <CampoTexto
        id="nome"
        rotulo="Nome completo"
        valor={campos.nome}
        erro={erroVisivel("nome")}
        autoComplete="name"
        aoMudar={(v) => mudar("nome", v)}
        aoSair={() => setTocados((t) => ({ ...t, nome: true }))}
      />
      {emailSessao ? (
        <p className="ajuda">
          O acesso fica no e-mail <strong>{emailSessao}</strong>.
        </p>
      ) : (
        <CampoTexto
          id="email"
          rotulo="E-mail"
          tipo="email"
          valor={campos.email}
          erro={erroVisivel("email")}
          ajuda="O acesso e o código do Pix chegam neste e-mail."
          autoComplete="email"
          inputMode="email"
          aoMudar={(v) => mudar("email", v)}
          aoSair={() => setTocados((t) => ({ ...t, email: true }))}
        />
      )}
      <CampoTexto
        id="telefone"
        rotulo="Telefone com DDD"
        tipo="tel"
        valor={campos.telefone}
        erro={erroVisivel("telefone")}
        autoComplete="tel-national"
        inputMode="tel"
        placeholder="(11) 91234-5678"
        aoMudar={(v) => mudar("telefone", v)}
        aoSair={() => setTocados((t) => ({ ...t, telefone: true }))}
      />

      {bumps.length ? (
        <div className="bumps" role="group" aria-label="Ofertas complementares, opcionais">
          {bumps.map((b) => (
            <BlocoBump
              key={b.slug}
              bump={b}
              mini={b.mini}
              marcado={marcados.includes(b.slug)}
              aoMudar={(m) => setMarcados((atual) => (m ? [...atual, b.slug] : atual.filter((s) => s !== b.slug)))}
              bloqueado={gerando}
            />
          ))}
        </div>
      ) : null}
      <p className="checkout-total" aria-live="polite">
        <span>Total</span>
        <strong className="num">{totalTexto}</strong>
      </p>

      <div className="abas checkout-abas" role="tablist" aria-label="Forma de pagamento">
        <button type="button" role="tab" aria-selected={aba === "pix"} onClick={() => setAba("pix")}>
          Pix
        </button>
        <button type="button" role="tab" aria-selected={aba === "cartao"} onClick={() => setAba("cartao")}>
          Cartão
        </button>
      </div>

      <div aria-live="assertive">{erro && <Alerta tipo="danger" titulo="Não deu para continuar">{erro}</Alerta>}</div>

      {aba === "pix" ? (
        <>
          <button
            className="btn lg"
            type="button"
            onClick={gerar}
            disabled={!tudoValido || gerando}
            aria-busy={gerando || undefined}
            aria-describedby={!tudoValido ? "checkout-falta" : undefined}
          >
            {gerando ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Gerando o Pix
              </>
            ) : (
              <>
                Pagar {totalTexto} com Pix
                <span className="ico">
                  <Icone nome="direita" tamanho={16} />
                </span>
              </>
            )}
          </button>
          {!tudoValido && (
            <p className="motivo" id="checkout-falta">
              Preencha nome, e-mail e telefone para gerar o Pix.
            </p>
          )}
        </>
      ) : !tudoValido ? (
        <p className="ajuda">Preencha nome, e-mail e telefone acima para abrir o pagamento com cartão.</p>
      ) : chavePublica ? (
        <FormularioCartao
          chavePublica={chavePublica}
          valorCentavos={valorCentavos}
          email={emailFinal}
          pagar={async (dados) => {
            setErro(null);
            // O bump fica travado durante o envio: o valor do cartão é o que estava na tela
            setGerando(true);
            const r = await acaoPagarCartao(entrada, dados).catch(() => ({ ok: false as const, erro: "Sem conexão. Tente de novo." }));
            setGerando(false);
            if (!r.ok) return setErro(r.erro);
            setEtapa(r.situacao === "aprovado" ? { tipo: "aprovado" } : { tipo: "analise", pedidoId: r.pedidoId });
          }}
        />
      ) : (
        <Alerta tipo="warn" titulo="Cartão indisponível agora">
          Use o Pix, que aprova na hora.
        </Alerta>
      )}

      <p className="selo-mp">
        <Icone nome="escudo" tamanho={14} />
        Pix ou cartão, sem sair desta página
      </p>
    </div>
  );
}

function CampoTexto({
  id,
  rotulo,
  valor,
  erro,
  ajuda,
  tipo = "text",
  autoComplete,
  inputMode,
  placeholder,
  aoMudar,
  aoSair,
}: {
  id: string;
  rotulo: string;
  valor: string;
  erro: string | undefined;
  ajuda?: string;
  tipo?: "text" | "email" | "tel";
  autoComplete: string;
  inputMode?: "email" | "tel";
  placeholder?: string;
  aoMudar: (v: string) => void;
  aoSair: () => void;
}) {
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        required
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined}
        onChange={(ev) => aoMudar(ev.target.value)}
        onBlur={aoSair}
      />
      {erro ? (
        <p className="erro-campo" id={`${id}-erro`}>
          {erro}
        </p>
      ) : ajuda ? (
        <p className="ajuda" id={`${id}-ajuda`}>
          {ajuda}
        </p>
      ) : null}
    </div>
  );
}


// --- Formulário de cartão do Mercado Pago (Card Payment Brick) ---------------------------------------

type ControleBrick = { unmount: () => void };
type MercadoPagoSdk = {
  bricks: () => { create: (tipo: "cardPayment", container: string, opcoes: object) => Promise<ControleBrick> };
};
declare global {
  interface Window {
    MercadoPago?: new (chave: string, opcoes: { locale: string }) => MercadoPagoSdk;
  }
}

const SDK_URL = "https://sdk.mercadopago.com/js/v2";

// Mesma cor de destaque do site, lida do token --accent do CSS
function corDeDestaque(): string {
  return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "currentColor";
}

function carregarSdk(): Promise<void> {
  if (window.MercadoPago) return Promise.resolve();
  return new Promise((ok, falhou) => {
    const existente = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    const s = existente ?? document.createElement("script");
    s.addEventListener("load", () => ok());
    s.addEventListener("error", () => falhou(new Error("sdk")));
    if (!existente) {
      s.src = SDK_URL;
      s.async = true;
      document.head.append(s);
    }
  });
}

function FormularioCartao({
  chavePublica,
  valorCentavos,
  email,
  pagar,
}: {
  chavePublica: string;
  valorCentavos: number;
  email: string;
  pagar: (dados: unknown) => Promise<void>;
}) {
  const [estado, setEstado] = useState<"carregando" | "pronto" | "erro">("carregando");
  // Um contêiner por montagem (muda com o e-mail e o valor): desmontar o formulário antigo não apaga o novo
  const base = useId().replace(/[^a-zA-Z0-9]/g, "");
  const container = `cartao-mp-${base}-${email.replace(/[^a-zA-Z0-9]/g, "")}-${valorCentavos}`;
  const pagarRef = useRef(pagar);
  useEffect(() => {
    pagarRef.current = pagar;
  }, [pagar]);

  const montar = useCallback(async () => {
    await carregarSdk();
    const mp = new window.MercadoPago!(chavePublica, { locale: "pt-BR" });
    return mp.bricks().create("cardPayment", container, {
      initialization: { amount: valorCentavos / 100, payer: { email } },
      // Botão na cor de destaque do site; o resto do formulário é o padrão do Mercado Pago
      customization: {
        paymentMethods: { maxInstallments: 12 },
        visual: { style: { customVariables: { baseColor: corDeDestaque() } } },
      },
      callbacks: {
        onReady: () => setEstado("pronto"),
        onSubmit: (dados: unknown) => pagarRef.current(dados),
        onError: () => setEstado("erro"),
      },
    });
  }, [chavePublica, valorCentavos, email, container]);

  useEffect(() => {
    let controle: ControleBrick | null = null;
    let ativo = true;
    montar()
      .then((c) => {
        if (ativo) controle = c;
        else c.unmount();
      })
      .catch(() => ativo && setEstado("erro"));
    return () => {
      ativo = false;
      controle?.unmount();
    };
  }, [montar]);

  return (
    <div className="checkout-cartao">
      {estado === "carregando" && (
        <p className="checkout-aguardando" role="status">
          <span className="spinner" aria-hidden="true" />
          Abrindo o pagamento seguro
        </p>
      )}
      {estado === "erro" && (
        <Alerta tipo="warn" titulo="Não deu para abrir o cartão agora">
          Tente de novo em instantes ou use o Pix, que aprova na hora.
        </Alerta>
      )}
      <div id={container} key={container} />
    </div>
  );
}
