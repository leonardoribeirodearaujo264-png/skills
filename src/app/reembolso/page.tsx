import type { Metadata } from "next";
import { Politica } from "@/components/Politica";

export const metadata: Metadata = { title: "Política de reembolso", description: "Como pedir o reembolso de um pacote em até 7 dias depois da compra." };

export default function Reembolso() {
  return (
    <Politica
      titulo="Política de reembolso"
      atualizada="30 de outubro de 2026"
      introducao="Você pode desistir da compra em até 7 dias corridos, contados da data do pagamento aprovado, como prevê o artigo 49 do Código de Defesa do Consumidor."
      secoes={[
        {
          titulo: "Como pedir",
          itens: ["Escreva para o contato abaixo com o e-mail usado na compra e o pacote que quer devolver.", "Não é preciso explicar o motivo."],
        },
        {
          titulo: "Como o valor volta",
          itens: [
            "Pix: o valor volta para a conta que pagou.",
            "Cartão de crédito: o estorno é pedido à operadora e aparece na fatura conforme o prazo dela.",
            "Compra com mais de um pacote: o reembolso pode ser do pedido inteiro.",
          ],
        },
        {
          titulo: "Depois do reembolso",
          paragrafos: ["O acesso ao pacote devolvido é encerrado na área de membros, e os arquivos baixados não podem continuar em uso."],
        },
      ]}
    />
  );
}
