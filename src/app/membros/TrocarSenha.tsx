"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alerta } from "@/components/Alerta";
import { trocarMinhaSenha, type EstadoTrocarSenha } from "../entrar/acoes";

// Troca a senha gerada no e-mail de acesso por uma escolhida pela pessoa
export function TrocarSenha({ minimo }: { minimo: number }) {
  const [estado, trocar] = useActionState(trocarMinhaSenha, { erro: null, ok: false } as EstadoTrocarSenha);
  return (
    <section className="section trocar-senha" aria-labelledby="senha-titulo">
      <h2 id="senha-titulo">Sua senha</h2>
      <p className="muted">A senha que chegou no e-mail de acesso funciona. Se preferir, troque por uma sua.</p>
      <form action={trocar} className="campo" noValidate>
        <input type="text" name="username" autoComplete="username" hidden readOnly />
        <label htmlFor="nova">Nova senha</label>
        <input id="nova" name="nova" type="password" autoComplete="new-password" minLength={minimo} maxLength={72} required />
        <label htmlFor="repetir">Repita a nova senha</label>
        <input
          id="repetir"
          name="repetir"
          type="password"
          autoComplete="new-password"
          minLength={minimo}
          maxLength={72}
          required
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "senha-troca-erro" : "senha-troca-ajuda"}
        />
        {estado.erro ? (
          <p className="erro-campo" id="senha-troca-erro" role="alert">
            {estado.erro}
          </p>
        ) : (
          <p className="ajuda" id="senha-troca-ajuda">
            Pelo menos {minimo} caracteres.
          </p>
        )}
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
