"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alerta } from "@/components/Alerta";
import { Icone } from "@/components/Icone";
import { pagar, type EstadoCompra } from "../acoes";

type Props = { oferta: string; produtos: string; emailSessao: string | null; totalTexto: string };

export function FormCheckout({ oferta, produtos, emailSessao, totalTexto }: Props) {
  const [estado, acao] = useActionState(pagar, { erro: null, email: "" } as EstadoCompra);
  return (
    <form action={acao} className="campo" noValidate>
      <input type="hidden" name="oferta" value={oferta} />
      <input type="hidden" name="produtos" value={produtos} />
      {emailSessao ? (
        <p className="ajuda">
          O acesso fica no e-mail <strong>{emailSessao}</strong>.
        </p>
      ) : (
        <>
          <label htmlFor="email">Seu e-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            defaultValue={estado.email}
            aria-invalid={estado.erro ? true : undefined}
            aria-describedby="email-ajuda"
          />
          <p className="ajuda" id="email-ajuda">
            Depois do pagamento, o acesso chega neste e-mail. Use um que você abre.
          </p>
        </>
      )}
      <div aria-live="assertive">{estado.erro && <Alerta tipo="danger" titulo="Não deu para continuar">{estado.erro}</Alerta>}</div>
      <Pagar totalTexto={totalTexto} />
      <p className="selo-mp">
        <Icone nome="escudo" tamanho={14} />
        Pagamento processado pelo Mercado Pago, com Pix ou cartão
      </p>
    </form>
  );
}

function Pagar({ totalTexto }: { totalTexto: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn lg" type="submit" disabled={pending} aria-busy={pending || undefined}>
      {pending ? (
        <>
          <span className="spinner" aria-hidden="true" />
          Abrindo o pagamento
        </>
      ) : (
        <>
          Pagar {totalTexto}
          <span className="ico">
            <Icone nome="direita" tamanho={16} />
          </span>
        </>
      )}
    </button>
  );
}
