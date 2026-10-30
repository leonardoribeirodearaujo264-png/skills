import { Alerta } from "@/components/Alerta";
import { Icone } from "@/components/Icone";

const MOTIVO: Record<string, string> = {
  sem_acesso: "Este e-mail não tem acesso a este pacote.",
  indisponivel: "O arquivo está sendo atualizado. Tente de novo em alguns minutos.",
  falha: "Não deu para gerar o link agora. Tente de novo.",
};

// A rota confere o acesso e redireciona para uma URL assinada de 5 minutos
export function BotaoDownload({ slug, erro }: { slug: string; erro: string | null }) {
  return (
    <>
      <a className="btn" href={`/api/loja/download/${slug}`} rel="nofollow">
        <span>Baixar o pacote</span>
        <span className="ico">
          <Icone nome="baixar" tamanho={16} />
        </span>
      </a>
      {erro && MOTIVO[erro] && (
        <Alerta tipo="danger" titulo="Não deu para baixar">
          {MOTIVO[erro]}
        </Alerta>
      )}
    </>
  );
}
