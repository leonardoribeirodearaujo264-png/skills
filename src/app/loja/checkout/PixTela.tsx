"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EventoMeta } from "@/components/EventoMeta";
import { Alerta } from "@/components/Alerta";
import { BlocoCodigo } from "@/components/BlocoCodigo";
import { Icone } from "@/components/Icone";
import { acaoRenovarPix, acaoSituacao, type PixNaTela } from "../acoes";

// Pix na tela: copia e cola, QR Code e a contagem da validade. A contagem usa a data de vencimento devolvida
// pelo Mercado Pago e corrige o relógio do aparelho pela hora do servidor, para não divergir.
// Usado no checkout e na página de pagamento aberta pelo e-mail.

const INTERVALO_CONSULTA_MS = 5000;

function restante(expiraEm: string | null, diferencaRelogio: number): number {
  if (!expiraEm) return Infinity;
  // Pode ficar negativo: depois do vencimento ainda confere por 1 minuto um Pix pago no último segundo
  return Date.parse(expiraEm) - (Date.now() + diferencaRelogio);
}

function mmss(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function PixTela({
  inicial,
  totalTexto,
  email,
}: {
  inicial: PixNaTela;
  totalTexto: string;
  email: string | null;
}) {
  const [pix, setPix] = useState(inicial);
  // Diferença entre o relógio do servidor e o do aparelho, medida quando o Pix chegou
  const [diferenca, setDiferenca] = useState(() => Date.parse(inicial.agora) - Date.now());
  const [falta, setFalta] = useState(() => restante(inicial.expiraEm, Date.parse(inicial.agora) - Date.now()));
  const [pago, setPago] = useState(false);
  const [renovando, setRenovando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const vencido = falta <= 0;

  // Contagem da validade
  useEffect(() => {
    const id = setInterval(() => setFalta(restante(pix.expiraEm, diferenca)), 1000);
    return () => clearInterval(id);
  }, [pix.expiraEm, diferenca]);

  // Confere se o pagamento caiu enquanto o código vale (e um pouco depois, para um Pix pago no último segundo)
  useEffect(() => {
    if (pago || falta < -60_000) return;
    const id = setInterval(async () => {
      const s = await acaoSituacao(pix.pedidoId).catch(() => "outro" as const);
      if (s === "pago") setPago(true);
    }, INTERVALO_CONSULTA_MS);
    return () => clearInterval(id);
  }, [pix.pedidoId, pago, falta]);

  async function renovar() {
    setErro(null);
    setRenovando(true);
    const r = await acaoRenovarPix(pix.pedidoId).catch(() => ({ ok: false as const, erro: "Sem conexão. Tente de novo." }));
    setRenovando(false);
    if (!r.ok) return setErro(r.erro);
    if ("situacao" in r) {
      if (r.situacao === "aprovado") setPago(true);
      return;
    }
    setDiferenca(Date.parse(r.agora) - Date.now());
    setPix(r);
    setFalta(restante(r.expiraEm, Date.parse(r.agora) - Date.now()));
  }

  if (pago) {
    return (
      <div className="checkout-resultado" role="status">
        <EventoMeta evento="Purchase" pedidoId={pix.pedidoId} />
        <span className="icone-grande ok" aria-hidden="true">
          <Icone nome="ok" tamanho={26} />
        </span>
        <h2>Pagamento aprovado</h2>
        <p className="muted">
          Enviamos o acesso para {email ? <strong>{email}</strong> : "o seu e-mail"}. Entre na área de membros com o código desse
          e-mail.
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

  if (vencido) {
    return (
      <div className="checkout-pix">
        <h2>Este Pix venceu</h2>
        <p className="muted">O código anterior não pode mais ser pago. Gere um novo para concluir a compra de {totalTexto}.</p>
        <div aria-live="assertive">{erro && <Alerta tipo="danger" titulo="Não deu para gerar o código">{erro}</Alerta>}</div>
        <button className="btn lg" type="button" onClick={renovar} disabled={renovando} aria-busy={renovando || undefined}>
          {renovando ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Gerando novo código
            </>
          ) : (
            "Gerar novo código Pix"
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-pix">
      <h2>Pague com Pix</h2>
      <p className="checkout-validade" aria-live="off">
        <Icone nome="relogio" tamanho={16} />
        Vence em <strong className="num">{mmss(falta)}</strong>
      </p>
      <p className="muted">
        Copie o código e cole no app do seu banco, em Pix copia e cola. Ou leia o QR Code com o celular. Valor:{" "}
        <strong>{totalTexto}</strong>.
      </p>
      <BlocoCodigo rotulo="Pix copia e cola" texto={pix.copiaECola} />
      {/* eslint-disable-next-line @next/next/no-img-element -- imagem gerada pelo Mercado Pago em base64 */}
      <img
        className="checkout-qr"
        src={`data:image/png;base64,${pix.qrBase64}`}
        alt="QR Code do Pix para pagar este pedido"
        width={220}
        height={220}
      />
      <p className="checkout-aguardando" role="status">
        <span className="spinner" aria-hidden="true" />
        Aguardando o pagamento. Esta tela muda sozinha quando ele cair.
      </p>
      {email && <p className="small muted">Também mandamos este código para {email}.</p>}
    </div>
  );
}
