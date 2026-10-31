import type { Metadata } from "next";
import { Politica } from "@/components/Politica";

export const metadata: Metadata = { title: "Termos de uso", description: "Regras de uso do site e dos pacotes de skills, agentes e prompts." };

export default function Termos() {
  return (
    <Politica
      titulo="Termos de uso"
      atualizada="30 de outubro de 2026"
      introducao="Estes termos valem para quem usa este site, abre as páginas grátis dos vídeos ou compra um pacote de skills, agentes e prompts. Ao comprar, você concorda com eles."
      secoes={[
        {
          titulo: "O que é vendido",
          paragrafos: [
            "Cada pacote é um conjunto de arquivos digitais (skills, agentes, prompts, instaladores e guia) para usar no Claude Code e no Codex, que são ferramentas de outras empresas. O que vem em cada pacote está descrito na página dele.",
            "O pacote não inclui assinatura do Claude Code, do Codex ou de qualquer outro serviço. Os custos dessas ferramentas são seus.",
          ],
        },
        {
          titulo: "Acesso depois do pagamento",
          paragrafos: [
            "Com o pagamento aprovado, o acesso é liberado no e-mail usado na compra. O download fica na área de membros, que você abre com esse e-mail e a senha enviada no e-mail de acesso.",
            "O pagamento é único. Não há mensalidade.",
          ],
        },
        {
          titulo: "Uso permitido",
          itens: [
            "Você pode usar os arquivos nos seus projetos e nos projetos dos seus clientes.",
            "Não é permitido revender, redistribuir ou publicar os arquivos do pacote, no todo ou em parte, nem compartilhar o seu acesso com outras pessoas.",
            "Skills de terceiros incluídas no instalador seguem a licença dos autores, listada no próprio pacote.",
          ],
        },
        {
          titulo: "Responsabilidade",
          paragrafos: [
            "Revise o que a ferramenta fizer antes de publicar ou enviar para clientes. O resultado depende do modelo de IA que você usa e das informações que você passa para ele.",
            "Não garantimos resultado financeiro, número de vendas ou de clientes.",
          ],
        },
        {
          titulo: "Páginas grátis",
          paragrafos: ["Os prompts e passo a passo grátis dos vídeos podem ser usados livremente. Eles podem mudar ou sair do ar sem aviso."],
        },
        {
          titulo: "Mudanças nestes termos",
          paragrafos: ["Estes termos podem ser atualizados. A data no topo mostra a última mudança. Compras já feitas seguem os termos da data da compra."],
        },
      ]}
    />
  );
}
