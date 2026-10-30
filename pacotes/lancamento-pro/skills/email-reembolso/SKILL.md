---
name: email-reembolso
description: Escreve a resposta por e-mail a um pedido de reembolso ou de cancelamento, em tom respeitoso, confirmando o caminho do estorno sem criar obstáculo e lembrando o direito de arrependimento de 7 dias do CDC em compra online. Use quando um cliente pede o dinheiro de volta, reclama da compra ou o usuário quer um modelo padrão de resposta a reembolso.
---

# E-mail de reembolso

Resposta a quem pediu o dinheiro de volta. O objetivo é resolver rápido e com respeito, não reter a pessoa a qualquer custo. O resultado é um e-mail de confirmação (e, se o usuário quiser, um modelo para pedidos fora do prazo) pronto para colar na ferramenta ou no atendimento. A skill não processa estorno, não envia e-mail e não dá parecer jurídico.

## Quando usar

- Chegou um pedido de reembolso ou de cancelamento.
- O usuário quer um modelo padrão para o atendimento usar.
- A política atual dificulta o reembolso e o usuário quer revisar o texto.

Use outra skill quando for o caso:
- Cliente que comprou e está com dificuldade de uso, sem pedir reembolso: sequencia-pos-venda.
- Excluir quem reembolsou de futuras campanhas: segmentar-lista.
- Lembrar o prazo de garantia a quem comprou e ainda não pediu nada: sequencia-pos-venda (e-mail de garantia).

Esta skill responde a um pedido que já chegou. Ela não convence o cliente a desistir do reembolso.

## O que pedir antes

1. Data da compra, data do pedido e forma de pagamento (cartão à vista ou parcelado, Pix, boleto).
2. Onde a compra foi feita: internet, telefone, WhatsApp ou loja física.
3. Política de garantia do usuário, se for maior que 7 dias.
4. Como o estorno é feito na prática, o prazo de cada forma de pagamento na plataforma usada e se as parcelas futuras do cartão são canceladas.
5. O motivo informado pelo cliente, se houver.
6. Canal de atendimento real.
7. O que acontece com o acesso e com os dados do cliente depois do reembolso: quando o acesso é cortado, se ele pode exportar o que cadastrou e em quanto tempo os dados são excluídos ou anonimizados (LGPD).

## Passo a passo

1. **Classifique a situação.** Compra fora do estabelecimento comercial, como pela internet, telefone ou WhatsApp, tem direito de arrependimento de 7 dias contados da compra ou do recebimento, sem precisar de motivo (art. 49 do CDC), com devolução integral dos valores pagos. Compra presencial não tem esse direito: vale a garantia própria do usuário ou o defeito do produto ou serviço. Pronto quando a situação é uma destas: dentro do prazo legal, dentro da garantia própria, fora dos dois, ou compra presencial.
2. **Escreva a confirmação.** Agradeça o contato, confirme que o reembolso será feito, diga como e em quanto tempo, usando só o prazo da entrada 4 (sem ele, [PRAZO REAL]). No cartão parcelado, diga que o estorno aparece na fatura e que as parcelas futuras deixam de ser cobradas, conforme a plataforma confirmou. Diga o que acontece com o acesso e os dados (entrada 7; sem o dado, [DADO REAL]). Sem exigir justificativa, formulário extra ou ligação. Pronto quando o cliente sabe, em até seis linhas, o que acontece com o dinheiro, as parcelas e o acesso.
3. **Ofereça ajuda sem condicionar.** Se quiser, inclua uma frase opcional oferecendo ajuda com o produto, deixando claro que o reembolso segue de qualquer forma. Nunca troque reembolso por desconto ou bônus sem a pessoa pedir. Pronto quando a frase não soa como obstáculo.
4. **Trate o caso fora do prazo ou presencial.** Escreva a resposta com o mesmo respeito, explicando a política e o canal para avaliação. Se houver dúvida sobre o direito, avise o usuário para consultar um advogado ou o Procon antes de negar. Exemplo de dúvida comum: plano anual sem devolução proporcional ou multa de cancelamento alta, que pode ser contestada como cláusula abusiva. Pronto quando a resposta não é seca nem ameaçadora e o alerta, se couber, está na saída.
5. **Revise o tom.** Retire culpa ("você não usou"), ironia, juridiquês e pressão. Pronto quando o texto pode ser lido em voz alta para o cliente sem constrangimento.
6. **Registre os próximos passos internos.** Tirar a pessoa de campanhas de venda do mesmo produto e de pedidos de depoimento; manter só o necessário da compra. O e-mail de reembolso é transacional; qualquer marketing posterior só com consentimento (LGPD) e link de descadastro. Pronto quando a lista interna está na saída.

## Saída

```text
Situação: [dentro dos 7 dias do CDC | dentro da garantia de [N] dias | fora do prazo | compra presencial: garantia própria ou defeito]
Pagamento: [FORMA] | Prazo do estorno na plataforma: [PRAZO REAL]
Parcelas futuras: [canceladas | não se aplica | confirmar com a plataforma]
Acesso e dados: [quando o acesso termina | exportação | prazo de exclusão ou DADO REAL]

Assunto: Seu reembolso de [PRODUTO]
Corpo:
Oi, [NOME]. Recebemos seu pedido e o reembolso já está [encaminhado].
...
Atendimento: [CANAL]

Alerta para o usuário: [cláusula a revisar com advogado ou Procon | nenhum]
Interno: remover de campanhas do produto; não pedir depoimento; marketing só com consentimento
```

## Erros comuns

- Pedir motivo como condição para devolver o dinheiro dentro do prazo de arrependimento.
- Oferecer desconto ou bônus em vez de cumprir o pedido.
- Prometer prazo de estorno que a plataforma não cumpre.
- Esquecer as parcelas futuras do cartão e o cliente continuar sendo cobrado.
- Tratar a resposta como parecer jurídico. Em caso duvidoso, o usuário consulta um advogado.
