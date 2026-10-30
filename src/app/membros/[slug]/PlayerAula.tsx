"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icone } from "@/components/Icone";

// URL assinada curta gerada no servidor. Se expirar ou falhar, recarregar a página gera outra.
export function PlayerAula({ video, legenda, titulo }: { video: string; legenda: string | null; titulo: string }) {
  const router = useRouter();
  const [erro, setErro] = useState(false);
  return (
    <div className="player">
      {erro ? (
        <div className="estado-video" role="alert">
          <span className="icone-grande danger" aria-hidden="true">
            <Icone nome="erro" tamanho={26} />
          </span>
          <p>
            <strong style={{ color: "#fff" }}>Não deu para carregar a aula.</strong> Por segurança, o link do vídeo expira em
            poucos minutos. Recarregue para gerar um novo.
          </p>
          <button
            className="btn sm"
            type="button"
            style={{ background: "#fff", color: "var(--code-bg)" }}
            onClick={() => {
              setErro(false);
              router.refresh();
            }}
          >
            <Icone nome="atualizar" tamanho={16} />
            Recarregar a aula
          </button>
        </div>
      ) : (
        <video controls playsInline preload="metadata" src={video} onError={() => setErro(true)} aria-label={titulo} crossOrigin="anonymous">
          {legenda && <track kind="captions" srcLang="pt-BR" label="Português" src={legenda} default />}
        </video>
      )}
    </div>
  );
}
