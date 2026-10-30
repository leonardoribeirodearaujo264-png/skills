---
name: calcular-preco-bump
description: Calcula a faixa de preço de um order bump a partir do preço do produto principal, do custo do bump, das taxas, da forma de cobrança e da margem mínima informados pelo usuário, mostrando cada conta, sem regra pronta de porcentagem. Use quando for definir ou revisar o preço do produto extra oferecido no checkout.
---

# Calcular preço do bump

Preço do order bump definido por conta e não por palpite. O resultado mostra o piso (abaixo dele o bump dá prejuízo ou não paga a margem), o teto de coerência com o produto principal e o preço escolhido, com todas as contas escritas para o usuário conferir.

## Quando usar

- Ao criar um order bump para o checkout de um lançamento.
- Quando o bump atual tem preço escolhido "porque todo mundo cobra assim".
- Quando muda o preço do produto principal, o custo do bump ou a tarifa da plataforma.

Para decidir quais bônus entram na oferta principal, use montar-stack-bonus. Para objeção de preço do produto principal, use levantar-objecoes. Esta skill só calcula o preço do bump.

## O que pedir antes

Sem estes dados, pare e peça. Não estime nenhum deles.

- P: preço do produto principal (R$). Serve de referência para o teto de coerência.
- C: custo direto do bump por venda (produção amortizada, entrega, ferramenta, suporte), em R$.
- T: taxa percentual da plataforma de pagamento sobre a venda. Peça o valor da plataforma que o usuário usa.
- Tarifa fixa por transação da plataforma, se houver.
- Forma de cobrança: o bump é cobrado na mesma transação do produto principal (um único pagamento) ou em cobrança separada? Se o usuário não souber, peça para conferir na plataforma.
- I: impostos sobre a venda, em porcentagem, conforme o regime do usuário.
- M: margem mínima que o usuário quer no bump, em R$ ou em porcentagem do preço do bump.
- Valor de referência do bump, se existir: preço avulso já praticado.
- Taxa de aceite real do bump, se existir, e o preço em que ela foi medida.

## Passo a passo

1. **Registre as entradas.** Escreva P, C, T, I e M com a fonte de cada uma ("informado pelo usuário"). Pronto quando nenhuma entrada está vazia.
2. **Defina F, a tarifa fixa que cabe ao bump.** Mesma transação do principal: F = 0, porque a tarifa fixa é cobrada uma vez e já é paga pela venda do principal; a taxa percentual T continua valendo sobre o valor do bump. Cobrança separada: F = tarifa fixa por transação. Forma de cobrança não confirmada: calcule os dois pisos e marque qual vale em "Pendências". Pronto quando F tem valor e motivo escritos.
3. **Calcule o piso.** O preço B precisa cobrir custo, tarifa fixa, taxas, impostos e margem:
   - Com margem em R$: B_piso = (C + F + M) / (1 - T - I)
   - Com margem em porcentagem m do preço: B_piso = (C + F) / (1 - T - I - m)
   Use T, I e m em forma decimal (10% = 0,10). Se o denominador for zero ou negativo, a margem pedida é impossível; registre e pare. Arredonde o piso para cima, no centavo. Pronto quando o piso está calculado com a fórmula usada escrita.
4. **Defina o teto de coerência.** O bump é uma decisão de impulso no checkout e não pode competir com o produto principal. Peça ao usuário o teto que ele considera coerente em relação a P, ou use o preço avulso já praticado como teto. Não aplique porcentagem padrão. Pronto quando o teto tem origem escrita.
5. **Compare piso e teto.** Se o piso for maior que o teto, o bump não fecha a conta: reduza C, troque o item ou aceite margem menor, e diga isso. Pronto quando a comparação tem conclusão.
6. **Escolha o preço.** Dentro da faixa, escolha um valor e mostre a conta reversa: receita, menos taxa percentual, menos F, menos imposto, menos custo, igual à margem por venda, em R$ e em % do preço. Pronto quando a conta reversa bate com a margem mínima ou acima dela.
7. **Simule cenários só com dados do usuário.** Com taxa de aceite real, calcule por 100 vendas do principal: bumps = 100 x taxa de aceite; receita bruta extra = bumps x B; margem extra = bumps x margem por venda. Se a taxa foi medida em outro preço, escreva isso ao lado: ela pode mudar no preço novo. Sem taxa real, escreva [NÚMERO REAL] e não simule. Pronto quando receita bruta e margem aparecem separadas, ou a simulação está marcada.

## Saída

```text
Entradas (informadas pelo usuário)
P = R$ [..] | C = R$ [..] | T = [..]% | Tarifa fixa = R$ [..] | I = [..]% | M = [..]
Cobrança do bump: [mesma transação | separada | não confirmada]
F = R$ [..] (motivo: [..])

Piso (use a linha da forma da margem)
Margem em R$: B_piso = ([C] + [F] + [M]) / (1 - [T] - [I]) = R$ [..]
Margem em %:  B_piso = ([C] + [F]) / (1 - [T] - [I] - [m]) = R$ [..]
[Se não confirmada: piso com F = 0: R$ [..] | piso com F = tarifa: R$ [..]]

Teto de coerência: R$ [..] (origem: [..])
Faixa viável: R$ [piso] a R$ [teto] ou "não fecha" com o motivo

Preço escolhido: R$ [B]
Conta reversa: [B] - [B x T] - [F] - [B x I] - [C] = R$ [margem por venda] ([..]% de B)

Cenário por 100 vendas do principal (aceite real de [..]%, medido a R$ [..])
Bumps: [..] | Receita bruta extra: R$ [..] | Margem extra: R$ [..]
Ressalva: [aceite medido em outro preço | nenhuma] ou [NÚMERO REAL]

Pendências: [forma de cobrança a confirmar, dados faltantes, ou "nenhuma"]
```

## Erros comuns

- Usar porcentagem fixa do preço principal como se fosse regra. Não existe regra que sirva a todo produto.
- Somar a tarifa fixa no bump cobrado na mesma transação, o que infla o piso.
- Esquecer a tarifa fixa quando o bump é cobrado em transação separada, o que pesa muito em bump barato.
- Chamar de "receita extra" a receita bruta, como se fosse lucro.
- Usar a taxa de aceite medida em outro preço sem avisar.
