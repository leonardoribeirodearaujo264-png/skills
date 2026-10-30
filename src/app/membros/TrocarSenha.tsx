"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alerta } from "@/components/Alerta";
import { trocarMinhaSenha, type EstadoTrocarSenha } from "../entrar/acoes";

// Troca a senha gerada no e-mail de acesso por uma escolhida pela pessoa
export function TrocarSenha({ minimo, email }: { minimo: number; email: string }) {
  const [estado, trocar] = useActionState(trocarMinhaSenha, { erro: null, campo: null, ok: false } as EstadoTrocarSenha);
  const erroNova = estado.campo === "nova" ? estado.erro : null;
  const erroRepetir = estado.campo === "repetir" ? estado.erro : null;
  return (
    <section className="section trocar-senha" aria-labelledby="senha-titulo">
      <h2 id="senha-titulo">Sua senha</h2>
      <p className="muted">A senha que chegou no e-mail de acesso funciona. Se preferir, troque por uma sua.</p>
      <form action={trocar} className="campo" noValidate>
        {/* Para o gerenciador de senhas ligar a senha nova a este login */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly className="sr-only" tabIndex={-1} aria-hidden="true" />
        <label htmlFor="nova">Nova senha</label>
        <input
          id="nova"
          name="nova"
          type="password"
          autoComplete="new-password"
          minLength={minimo}
          maxLength={72}
          required
          aria-invalid={erroNova ? true : undefined}
          aria-describedby={erroNova ? "senha-nova-erro" : "senha-troca-ajuda"}
        />
        {erroNova ? (
          <p className="erro-campo" id="senha-nova-erro" role="alert">
            {erroNova}
          </p>
        ) : (
          <p className="ajuda" id="senha-troca-ajuda">
            Pelo menos {minimo} caracteres. Ao trocar, os outros aparelhos conectados saem da conta.
          </p>
        )}
        <label htmlFor="repetir">Repita a nova senha</label>
        <input
          id="repetir"
          name="repetir"
          type="password"
          autoComplete="new-password"
          minLength={minimo}
          maxLength={72}
          required
          aria-invalid={erroRepetir ? true : undefined}
          aria-describedby={erroRepetir ? "senha-repetir-erro" : undefined}
        />
        {erroRepetir ? (
          <p className="erro-campo" id="senha-repetir-erro" role="alert">
            {erroRepetir}
          </p>
        ) : null}
        <div aria-live="polite">
          {estado.ok ? (
            <Alerta tipo="ok" titulo="Senha trocada">
              Nas próximas vezes, entre com o seu e-mail e essa senha.
            </Alerta>
          ) : null}
        </div>
        <Salvar />
      </form>
    </section>
  );
}

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending} aria-busy={pending || undefined}>
      {pending ? "Salvando" : "Trocar senha"}
    </button>
  );
}
