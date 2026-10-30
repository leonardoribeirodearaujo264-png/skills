"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Alerta } from "@/components/Alerta";
import { BlocoCodigo } from "@/components/BlocoCodigo";
import { Icone } from "@/components/Icone";
import { acaoGerarPix, acaoPagarCartao, acaoSituacao } from "../acoes";

// Pagamento no próprio site. Pix: QR Code e copia e cola, e a tela muda sozinha quando o pagamento cai.
// Cartão: formulário seguro do Mercado Pago (Card Payment Brick); os dados do cartão vão direto para eles
// e aqui chega só um token de uso único.

type Props = {
  oferta: string;
  produtos: string;
  emailSessao: string | null;
  valorCentavos: number;
  totalTexto: string;
  chavePublica: string | null;
};

type PixNaTela = { pedidoId: string; copiaECola: string; qrBase64: string };
type Etapa =
  | { tipo: "escolha" }
  | { tipo: "pix"; pix: PixNaTela }
  | { tipo: "aprovado"; email: string }
  | { tipo: "analise"; pedidoId: string; email: string };

const EMAIL_VALIDO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const INTERVALO_CONSULTA_MS = 5000;
const LIMITE_CONSULTAS = 720; // uma hora, a validade do Pix

export function CheckoutPagamento({ oferta, produtos, emailSessao, valorCentavos, totalTexto, chavePublica }: Props) {
  const [email, setEmail] = useState(emailSessao ?? "");
  const [aba, setAba] = useState<"pix" | "cartao">("pix");
  const [etapa, setEtapa] = useState<Etapa>({ tipo: "escolha" });
  const [erro, setErro] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const emailOk = EMAIL_VALIDO.test(email.trim());
  const entrada = { oferta, produtos, email: email.trim() };

  // Consulta a situação do pedido até ser pago (Pix ou cartão em análise)
  const pedidoAguardando = etapa.tipo === "pix" ? etapa.pix.pedidoId : etapa.tipo === "analise" ? etapa.pedidoId : null;
  useEffect(() => {
    if (!pedidoAguardando) return;
    let consultas = 0;
    let parar = false;
    const id = setInterval(async () => {
      if (parar || ++consultas > LIMITE_CONSULTAS) return clearInterval(id);
      const s = await acaoSituacao(pedidoAguardando).catch(() => "outro" as const);
      if (s === "pago") {
        parar = true;
        clearInterval(id);
        setEtapa({ tipo: "aprovado", email: email.trim() });
      }
    }, INTERVALO_CONSULTA_MS);
    return () => {
      parar = true;
      clearInterval(id);
    };
  }, [pedidoAguardando, email]);

  async function gerar() {
    setErro(null);
    if (!emailOk) return setErro("Digite um e-mail válido. É nele que o acesso vai chegar.");
    setGerando(true);
    const r = await acaoGerarPix(entrada).catch(() => ({ ok: false as const, erro: "Sem conexão. Tente de novo." }));
    setGerando(false);
    if (!r.ok) return setErro(r.erro);
    if ("situacao" in r) {
      return setEtapa(
        r.situacao === "aprovado"
          ? { tipo: "aprovado", email: email.trim() }
          : { tipo: "analise", pedidoId: r.pedidoId, email: email.trim() },
      );
    }
    setEtapa({ tipo: "pix", pix: { pedidoId: r.pedidoId, copiaECola: r.copiaECola, qrBase64: r.qrBase64 } });
  }

  if (etapa.tipo === "aprovado") {
    return (
      <div className="checkout-resultado" role="status">
        <span className="icone-grande ok" aria-hidden="true">
          <Icone nome="ok" tamanho={26} />
        </span>
        <h2>Pagamento aprovado</h2>
        <p className="muted">
          Enviamos o acesso para <strong>{etapa.email}</strong>. Entre na área de membros com o código desse e-mail.
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
          O banco está conferindo o pagamento. Assim que aprovar, o acesso chega em <strong>{etapa.email}</strong>. Pode
          fechar esta página.
        </p>
        <div className="progresso" role="progressbar" aria-label="Aguardando aprovação">
          <span />
        </div>
      </div>
    );
  }

  if (etapa.tipo === "pix") {
    return (
      <div className="checkout-pix">
        <h2>Pague com Pix</h2>
        <p className="muted">
          Copie o código e cole no app do seu banco, em Pix copia e cola. Ou leia o QR Code com o celular. Valor:{" "}
          <strong>{totalTexto}</strong>.
        </p>
        <BlocoCodigo rotulo="Pix copia e cola" texto={etapa.pix.copiaECola} />
        {/* eslint-disable-next-line @next/next/no-img-element -- imagem gerada pelo Mercado Pago em base64 */}
        <img
          className="checkout-qr"
          src={`data:image/png;base64,${etapa.pix.qrBase64}`}
          alt="QR Code do Pix para pagar este pedido"
          width={220}
          height={220}
        />
        <p className="checkout-aguardando" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          Aguardando o pagamento. Esta tela muda sozinha quando ele cair.
        </p>
        <p className="small muted">O código vale por 1 hora. Pagamento único, sem mensalidade.</p>
      </div>
    );
  }

  return (
    <div className="checkout-pagamento">
      {emailSessao ? (
        <p className="ajuda">
          O acesso fica no e-mail <strong>{emailSessao}</strong>.
        </p>
      ) : (
        <div className="campo">
          <label htmlFor="email">Seu e-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            aria-describedby="email-ajuda"
          />
          <p className="ajuda" id="email-ajuda">
            O acesso chega neste e-mail logo depois do pagamento.
          </p>
        </div>
      )}

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
        <button className="btn lg" type="button" onClick={gerar} disabled={gerando} aria-busy={gerando || undefined}>
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
      ) : !emailOk ? (
        <p className="ajuda">Digite o seu e-mail acima para abrir o pagamento com cartão.</p>
      ) : chavePublica ? (
        <FormularioCartao
          chavePublica={chavePublica}
          valorCentavos={valorCentavos}
          email={email.trim()}
          pagar={async (dados) => {
            setErro(null);
            const r = await acaoPagarCartao(entrada, dados).catch(() => ({ ok: false as const, erro: "Sem conexão. Tente de novo." }));
            if (!r.ok) return setErro(r.erro);
            setEtapa(r.situacao === "aprovado" ? { tipo: "aprovado", email: email.trim() } : { tipo: "analise", pedidoId: r.pedidoId, email: email.trim() });
          }}
        />
      ) : (
        <Alerta tipo="warn" titulo="Cartão indisponível agora">
          Use o Pix, que aprova na hora.
        </Alerta>
      )}

      <p className="selo-mp">
        <Icone nome="escudo" tamanho={14} />
        Pagamento processado pelo Mercado Pago, sem sair desta página
      </p>
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
