"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Alerta } from "@/components/Alerta";
import { Icone } from "@/components/Icone";
import { entrarComSenha, enviarCodigo, verificarCodigo, type EstadoEntrar, type EstadoSenha } from "./acoes";

const ESPERA_REENVIO_S = 45;

// Entrada padrão: e-mail e senha (a senha chega no e-mail de acesso da compra). Quem esqueceu a senha,
// ou prefere, entra com um código de uso único mandado para o e-mail.
export function FormEntrar({ proximo, erroLink }: { proximo: string; erroLink: boolean }) {
  const [modo, setModo] = useState<"senha" | "codigo">(erroLink ? "codigo" : "senha");
  if (modo === "senha") return <FormSenha proximo={proximo} usarCodigo={() => setModo("codigo")} />;
  return <FormCodigo proximo={proximo} erroLink={erroLink} usarSenha={() => setModo("senha")} />;
}

function FormSenha({ proximo, usarCodigo }: { proximo: string; usarCodigo: () => void }) {
  const [estado, entrar] = useActionState(entrarComSenha, { erro: null, email: "" } as EstadoSenha);
  return (
    <>
      <span className="icone-grande" aria-hidden="true">
        <Icone nome="cadeado" tamanho={26} />
      </span>
      <h1>Entrar na sua área</h1>
      <p className="lead muted">Use o e-mail da compra e a senha que chegou no e-mail de acesso.</p>
      <form action={entrar} className="campo" noValidate>
        <input type="hidden" name="next" value={proximo} />
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" inputMode="email" required defaultValue={estado.email} />
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "senha-erro" : undefined}
        />
        {estado.erro ? (
          <p className="erro-campo" id="senha-erro" role="alert">
            {estado.erro}
          </p>
        ) : null}
        <Enviar rotulo="Entrar" carregando="Entrando" />
      </form>
      <button className="btn ghost" type="button" onClick={usarCodigo}>
        Esqueci a senha, quero receber um código
      </button>
    </>
  );
}

function FormCodigo({ proximo, erroLink, usarSenha }: { proximo: string; erroLink: boolean; usarSenha: () => void }) {
  const [envio, enviar] = useActionState(enviarCodigo, { etapa: "email", erro: null, email: "" } as EstadoEntrar);
  const [verif, verificar] = useActionState(verificarCodigo, { etapa: "codigo", erro: null, email: "" } as EstadoEntrar);
  const [voltou, setVoltou] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const naEtapaCodigo = envio.etapa === "codigo" && !voltou;

  useEffect(() => {
    titulo.current?.focus();
  }, [naEtapaCodigo]);

  if (naEtapaCodigo) {
    return (
      <>
        <span className="icone-grande ok" aria-hidden="true">
          <Icone nome="email" tamanho={26} />
        </span>
        <h1 ref={titulo} tabIndex={-1}>
          Confira o seu e-mail
        </h1>
        <p className="lead muted">
          Enviamos um código e um link de acesso para <strong>{envio.email}</strong>. Use o que for mais fácil.
        </p>
        <form action={verificar} className="campo" noValidate>
          <input type="hidden" name="email" value={envio.email} />
          <input type="hidden" name="next" value={proximo} />
          <label htmlFor="codigo">Código do e-mail</label>
          <input
            id="codigo"
            name="codigo"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={10}
            required
            aria-invalid={verif.erro ? true : undefined}
            aria-describedby={verif.erro ? "codigo-erro" : "codigo-ajuda"}
          />
          {verif.erro ? (
            <p className="erro-campo" id="codigo-erro" role="alert">
              {verif.erro}
            </p>
          ) : (
            <p className="ajuda" id="codigo-ajuda">
              Não chegou? Veja a caixa de spam ou promoções.
            </p>
          )}
          <Enviar rotulo="Entrar" carregando="Conferindo" />
        </form>
        <Reenviar email={envio.email} proximo={proximo} reenviar={enviar} />
        <button className="btn ghost" type="button" onClick={() => setVoltou(true)}>
          Usar outro e-mail
        </button>
      </>
    );
  }

  return (
    <>
      <span className="icone-grande" aria-hidden="true">
        <Icone nome="cadeado" tamanho={26} />
      </span>
      <h1 ref={titulo} tabIndex={-1}>
        Entrar na sua área
      </h1>
      <p className="lead muted">Mandamos um código para o e-mail da compra. Depois de entrar, você pode criar uma senha nova.</p>
      {erroLink && (
        <Alerta tipo="warn" titulo="Esse link já foi usado ou expirou">
          Peça um novo abaixo. Por segurança, cada link vale uma vez e por pouco tempo.
        </Alerta>
      )}
      <form action={(f) => { setVoltou(false); enviar(f); }} className="campo" noValidate>
        <input type="hidden" name="next" value={proximo} />
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={envio.email}
          aria-invalid={envio.erro ? true : undefined}
          aria-describedby={envio.erro ? "email-erro" : "email-ajuda"}
        />
        {envio.etapa === "email" && envio.semCompra ? (
          <div id="email-erro">
            <Alerta
              tipo="warn"
              titulo="Este e-mail ainda não tem compra"
              acoes={
                <Link className="btn sm" href="/loja/">
                  Conhecer os pacotes
                </Link>
              }
            >
              {envio.erro}
            </Alerta>
          </div>
        ) : envio.erro ? (
          <p className="erro-campo" id="email-erro" role="alert">
            {envio.erro}
          </p>
        ) : (
          <p className="ajuda" id="email-ajuda">
            Use o mesmo e-mail que você informou no pagamento.
          </p>
        )}
        <Enviar rotulo="Enviar código" carregando="Enviando" />
      </form>
      <button className="btn ghost" type="button" onClick={usarSenha}>
        Entrar com e-mail e senha
      </button>
    </>
  );
}

function Enviar({ rotulo, carregando }: { rotulo: string; carregando: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn lg" type="submit" disabled={pending} aria-busy={pending || undefined}>
      {pending ? (
        <>
          <span className="spinner" aria-hidden="true" />
          {carregando}
        </>
      ) : (
        <>
          {rotulo}
          <span className="ico">
            <Icone nome="direita" tamanho={16} />
          </span>
        </>
      )}
    </button>
  );
}

function Reenviar({ email, proximo, reenviar }: { email: string; proximo: string; reenviar: (f: FormData) => void }) {
  const [resta, setResta] = useState(ESPERA_REENVIO_S);
  useEffect(() => {
    if (resta <= 0) return;
    const t = setTimeout(() => setResta((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resta]);
  return (
    <form
      action={(f) => {
        setResta(ESPERA_REENVIO_S);
        reenviar(f);
      }}
    >
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="next" value={proximo} />
      <button className="btn secondary sm" type="submit" disabled={resta > 0} aria-live="polite">
        {resta > 0 ? `Reenviar em ${resta} s` : "Reenviar código"}
      </button>
    </form>
  );
}
