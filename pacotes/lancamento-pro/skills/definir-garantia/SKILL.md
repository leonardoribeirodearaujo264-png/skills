---
name: definir-garantia
description: Escolhe o tipo, o prazo e as condições da garantia de uma oferta, escreve o texto em linguagem simples e confere que ele respeita o direito de arrependimento de 7 dias do Código de Defesa do Consumidor em compra online, sem dar parecer jurídico. Use quando a oferta precisa de garantia, quando a garantia atual tem letra miúda ou quando o risco percebido é a objeção principal.
---

# Definir garantia

Garantia escolhida e escrita: tipo, prazo, condições, como pedir e o que acontece depois. O texto deixa claro que o direito de arrependimento existe por lei e que a garantia do vendedor, se for maior, é um compromisso a mais. O resultado reduz o risco percebido sem criar promessa que o dono não cumpre.

## Quando usar

- Ao fechar a oferta de um lançamento.
- Quando o risco ("e se não der certo para mim?") é a objeção mais pesada.
- Quando a garantia atual tem condição confusa, prazo menor que o legal ou exige provas difíceis.

Para mapear o risco percebido entre as outras objeções, use levantar-objecoes. Para ver se a garantia de resultado está apoiada em mecanismo e prova, use validar-promessa. Para a pilha da oferta, use montar-stack-bonus.

## O que pedir antes

- Produto, preço, forma de entrega e plataforma de pagamento.
- Prazo real de estorno em cada forma de pagamento na plataforma (cartão, Pix, boleto) e se as parcelas futuras do cartão são canceladas no estorno. Sem esse dado, use [PRAZO REAL].
- Garantia atual, se existir, com o texto completo.
- Taxa de reembolso histórica, se o dono tiver; senão [NÚMERO REAL].
- Quanto o dono aceita reembolsar sem prejuízo grave (custo já gasto por venda, bônus físicos enviados).
- Nicho: saúde, direito e finanças têm regras próprias de publicidade.

## Lembrete legal

Em compra feita fora do estabelecimento comercial, como pela internet, o artigo 49 do Código de Defesa do Consumidor dá ao comprador 7 dias, a partir da compra ou do recebimento, para desistir. A devolução é integral e imediata, com atualização: inclui frete, juros de parcelamento e taxas, sem descontar tarifa da plataforma. Nenhuma garantia pode ser menor que isso nem impor condição para esse direito. Esta skill não substitui orientação de advogado: diga ao usuário para validar o texto final com um profissional quando houver dúvida, contrato próprio ou venda para empresa.

## Passo a passo

1. **Confira o mínimo legal.** Verifique se o texto atual ou proposto respeita os 7 dias sem condição e sem desconto de taxa. Se não respeitar, isso é o primeiro achado. Pronto quando o status legal está escrito como "respeita", "não respeita" ou "verificar com advogado".
2. **Escolha o tipo.** Opções:
   - Incondicional: devolução sem perguntas durante todo o prazo.
   - Dupla: incondicional nos primeiros dias (nunca menos de 7) e, depois disso, condicional de esforço: devolve se o cliente mostrar que aplicou e não teve resultado. A condição nunca vale dentro dos 7 dias legais.
   - De satisfação do serviço: refaz ou ajusta o serviço, sem tirar o direito de arrependimento.
   Decida com a taxa de reembolso histórica e o custo por reembolso: taxa baixa e custo por venda baixo favorecem a incondicional; custo alto por venda (bônus físico, horas de atendimento) favorece a dupla. Sem a taxa, decida pelo custo e marque [NÚMERO REAL]. Pronto quando o tipo está escolhido com motivo que cita taxa e custo.
3. **Defina o prazo.** O prazo precisa permitir que o cliente use o produto o bastante para avaliar. Na dupla, escreva os dois trechos (incondicional e condicional). Pronto quando o prazo está escrito e o trecho incondicional é igual ou maior que 7 dias.
4. **Escreva as condições e o caminho.** Como pedir (canal exato), o que precisa informar, em quanto tempo o dinheiro volta em cada forma de pagamento e o que acontece com as parcelas futuras do cartão. Use só os prazos da entrada; sem eles, [PRAZO REAL]. Nada de exigência escondida nem desconto de taxa ou juros. Pronto quando uma pessoa leiga consegue pedir o reembolso só lendo o texto.
5. **Escreva o texto da página.** Título curto, duas a quatro frases, sem promessa de resultado que o produto não garante. Em saúde, direito e finanças, evite garantir cura, ganho de causa ou retorno financeiro. Pronto quando o texto cabe em um bloco e passou na checagem de promessa.
6. **Liste o que o dono precisa operar.** Quem atende o pedido, prazo interno e registro. Pronto quando há responsável e prazo.

## Saída

```text
Status legal: [respeita os 7 dias / não respeita / verificar com advogado]
Tipo: [incondicional | dupla | satisfação do serviço]
Prazo: [dias; na dupla, X incondicionais + Y condicionais]
Motivo: taxa de reembolso [N% | NÚMERO REAL], custo por reembolso [valor], objeção [..]

Texto da página
[Título]
[2 a 4 frases]

Como pedir: [canal], [dados]
Estorno: cartão [PRAZO REAL], Pix [PRAZO REAL], boleto [PRAZO REAL]
Parcelas futuras do cartão: [canceladas | confirmar com a plataforma]
Devolução: integral, com taxas e juros, sem desconto de tarifa
Operação: responsável [nome], prazo interno [dias]
Aviso: este texto não é parecer jurídico; valide com advogado se houver dúvida.
```

## Erros comuns

- Oferecer garantia menor que 7 dias ou com condição dentro desse prazo.
- Exigir prova de "aplicação" tão difícil que a garantia vira de fachada.
- Garantir resultado ("ou seu dinheiro de volta se não faturar R$ X") sem mecanismo nem prova.
- Descontar taxa da plataforma ou juros do parcelamento no reembolso por arrependimento.
- Tratar a orientação da skill como parecer jurídico.
