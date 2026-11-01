import type { Metadata } from "next";
import { Politica } from "@/components/Politica";

export const metadata: Metadata = { title: "Política de privacidade", description: "Quais dados o site coleta, para quê e como pedir a exclusão." };

export default function Privacidade() {
  return (
    <Politica
      titulo="Política de privacidade"
      atualizada="1 de novembro de 2026"
      introducao="Esta política explica quais dados pessoais coletamos, para que usamos e quais são os seus direitos, de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018)."
      secoes={[
        {
          titulo: "Dados que coletamos",
          itens: [
            "Na compra: e-mail, nome e telefone que você informa no pagamento.",
            "No pagamento: os dados do cartão ou do Pix vão direto para a empresa que processa o pagamento. Este site não guarda número de cartão.",
            "Na área de membros: o e-mail da conta, a senha (guardada cifrada pelo serviço de login) e os pacotes que você comprou.",
            "Nas páginas grátis não pedimos cadastro.",
          ],
        },
        {
          titulo: "Para que usamos",
          itens: [
            "Liberar o acesso ao pacote comprado e mandar o e-mail com o login.",
            "Confirmar o pagamento e evitar compra duplicada.",
            "Responder quando você entra em contato.",
          ],
        },
        {
          titulo: "Com quem compartilhamos",
          paragrafos: [
            "Com os serviços necessários para o site funcionar: processamento de pagamento, hospedagem do site e do banco de dados, login e envio de e-mails. Com a Meta, pelo Pixel, as páginas que você visita no site (veja Cookies). Alguns desses serviços guardam dados em servidores fora do Brasil. Não vendemos nem alugamos os seus dados.",
            "As páginas grátis dos vídeos carregam as fontes do texto pelo Google Fonts, que recebe o endereço IP de quem abre a página.",
          ],
        },
        {
          titulo: "Cookies",
          paragrafos: [
            "Usamos os cookies necessários para manter você conectado na área de membros.",
            "Também usamos o Pixel da Meta (Facebook e Instagram), que registra as páginas visitadas e guarda cookies no seu navegador para medir e direcionar os nossos anúncios. A Meta trata esses dados conforme a política de privacidade dela. Você pode bloquear esses cookies nas configurações do navegador ou ajustar as preferências de anúncios na sua conta da Meta.",
          ],
        },
        {
          titulo: "Por quanto tempo guardamos",
          paragrafos: [
            "Os dados da compra ficam guardados enquanto você tiver acesso ao pacote e pelo prazo que a lei exige para registros de venda. A exclusão é feita quando você pede, pelo contato abaixo, respeitando esse prazo legal.",
          ],
        },
        {
          titulo: "Seus direitos",
          paragrafos: [
            "Você pode pedir a qualquer momento uma cópia dos seus dados, a correção de algum dado errado ou a exclusão da conta. Basta escrever para o contato abaixo com o e-mail da compra.",
          ],
        },
      ]}
    />
  );
}
