---
name: calcular-preco-bump
description: Calcula a faixa de preço de um order bump a partir do preço do produto principal, do custo do bump e da margem mínima informados pelo usuário, mostrando cada conta, sem regra pronta de porcentagem. Use quando for definir ou revisar o preço do produto extra oferecido no checkout.
---

# Calcular preço do bump

Preço do order bump definido por conta e não por palpite. O resultado mostra o piso (abaixo dele o bump dá prejuízo ou não paga a margem), o teto de coerência com o produto principal e o preço escolhido, com todas as contas escritas para o usuário conferir.

## Quando usar

- Ao criar um order bump para o checkout de um lançamento.
- Quando o bump atual tem preço escolhido "porque todo mundo cobra assim".
- Quando muda o preço do produto principal ou o custo do bump.

Para decidir quais bônus entram na oferta principal, use montar-stack-bonus. Para objeção de preço do produto principal, use levantar-objecoes. Esta skill só calcula o preço do bump.

## O que pedir antes

Sem estes dados, pare e peça. Não estime nenhum deles.

- P: preço do produto principal (R$).
- C: custo direto do bump por venda (produção amortizada, entrega, ferramenta, suporte), em R$.
- T: taxa da plataforma de pagamento sobre a venda, em porcentagem, mais tarifa fixa por transação se houver. Peça o valor da plataforma que o usuário usa.
- I: impostos sobre a venda, em porcentagem, conforme o regime do usuário.
- M: margem mínima que o usuário quer no bump, em R$ ou em porcentagem do preço.
- Valor de referência do bump, se existir: preço avulso já praticado.

## Passo a passo

1. **Registre as entradas.** Escreva P, C, T, tarifa fixa F, I e M com a fonte de cada uma ("informado pelo usuário"). Pronto quando nenhuma entrada está vazia.
2. **Calcule o piso.** O preço B precisa cobrir custo, taxas, impostos e margem:
   - Com margem em R$: B_piso = (C + F + M) / (1 - T - I)
   - Com margem em porcentagem m do preço: B_piso = (C + F) / (1 - T - I - m)
   Use T, I e m em forma decimal (10% = 0,10). Se o denominador for zero ou negativo, a margem pedida é impossível; registre e pare. Pronto quando o piso está calculado com a conta escrita.
3. **Defina o teto de coerência.** O bump é uma decisão de impulso no checkout e não pode competir com o produto principal. Peça ao usuário o teto que ele considera coerente em relação a P, ou use o preço avulso já praticado como teto. Não aplique porcentagem padrão. Pronto quando o teto tem origem escrita.
4. **Compare piso e teto.** Se o piso for maior que o teto, o bump não fecha a conta: reduza C, troque o item ou aceite margem menor, e diga isso. Pronto quando a comparação tem conclusão.
5. **Escolha o preço.** Dentro da faixa, escolha um valor e mostre a conta reversa: receita, menos taxa, menos imposto, menos custo, igual à margem por venda. Pronto quando a conta reversa bate com a margem mínima ou acima dela.
6. **Simule cenários só com dados do usuário.** Se ele informar uma taxa de aceite real do bump, calcule a receita extra por 100 vendas do principal. Sem esse dado, escreva [NÚMERO REAL] e não simule. Pronto quando a simulação está feita ou marcada.

## Saída

```text
Entradas (informadas pelo usuário)
P = R$ [..] | C = R$ [..] | T = [..]% | F = R$ [..] | I = [..]% | M = [..]

Piso
B_piso = ([C] + [F] + [M]) / (1 - [T] - [I]) = R$ [..]

Teto de coerência: R$ [..] (origem: [..])
Faixa viável: R$ [piso] a R$ [teto] ou "não fecha" com o motivo

Preço escolhido: R$ [B]
Conta reversa: [B] - [B x T] - [F] - [B x I] - [C] = R$ [margem por venda]

Cenário: [taxa de aceite real] de 100 vendas = R$ [..] extra, ou [NÚMERO REAL]
```

## Erros comuns

- Usar porcentagem fixa do preço principal como se fosse regra. Não existe regra que sirva a todo produto.
- Esquecer a tarifa fixa por transação, que pesa muito em bump barato.
- Somar porcentagens de taxa e imposto sobre o custo, e não sobre o preço.
- Inventar taxa de aceite para mostrar receita extra.
- Arredondar o preço para baixo do piso sem avisar que a margem caiu.
