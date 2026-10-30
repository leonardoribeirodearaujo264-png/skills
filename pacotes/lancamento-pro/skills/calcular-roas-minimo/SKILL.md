---
name: calcular-roas-minimo
description: Calcula o ROAS de equilíbrio e o ROAS mínimo que deixa o lucro desejado, a partir do ticket médio, custos, taxas e impostos do usuário, com a conta passo a passo. Use quando o usuário perguntar qual ROAS precisa atingir, se um ROAS do relatório dá lucro, ou quando vende vários produtos com tickets diferentes e quer uma meta de retorno sobre o gasto.
---

# Calcular ROAS mínimo

Entrega o ROAS de equilíbrio (retorno em que o anúncio se paga sem lucro) e o ROAS mínimo para a meta de lucro do usuário, com cada passo da conta visível. ROAS aqui é receita atribuída dividida pelo gasto em anúncio.

## Quando usar

- Loja ou catálogo com tickets variados, em que faz mais sentido uma meta de retorno do que um teto por venda.
- O relatório mostra um ROAS e o usuário quer saber se está dando lucro.
- Antes de definir meta de retorno numa campanha que otimiza por valor de compra.

Se o produto é único e o usuário pensa em "quanto pago por venda", use calcular-cpa-maximo. Para interpretar o relatório inteiro, use ler-relatorio-anuncios.

## O que pedir antes

- Ticket médio real do período (receita bruta dos produtos dividida pelo número de pedidos).
- Frete cobrado do cliente por pedido, se houver, e frete pago pelo vendedor.
- Custo da mercadoria ou do serviço por pedido, em reais ou percentual do ticket.
- Embalagem e comissões por pedido.
- Taxa da plataforma de pagamento (percentual e fixo) e impostos em percentual.
- Taxa de devolução ou reembolso histórica, e quais custos não voltam na devolução (frete de ida e volta, embalagem).
- Lucro desejado por pedido, em reais ou percentual do ticket.
- Qual receita a plataforma de anúncio reporta: valor do pedido com ou sem frete, com ou sem desconto. Isso muda o ROAS que deve ser comparado.

Faltou dado: marcar [NÚMERO REAL] e parar a conta naquele ponto.

## Passo a passo

1. **Monte a tabela de entradas.** Valor e origem de cada item. Pronto quando nada usado na conta está sem origem.
2. **Calcule a margem de contribuição por pedido.** Valor cobrado = ticket + frete cobrado do cliente. Margem = valor cobrado - frete repassado à transportadora - custo da mercadoria - frete pago pelo vendedor - embalagem - comissões - (valor cobrado x taxa %) - taxa fixa - (base do imposto x imposto %). A taxa do pagamento incide sobre tudo o que passa pelo gateway, produto e frete. Pronto quando cada subtração aparece em reais e a base de cada percentual está escrita.
3. **Ajuste pela devolução.** Margem ajustada = margem x (1 - d) - d x custos que não voltam, com d = taxa de devolução em decimal. Premissa escrita: pedido devolvido devolve o valor ao cliente; os custos que não voltam continuam perdidos. Sem histórico, peça o dado; se o usuário escolher zero, marque como premissa. Pronto quando a premissa e os custos que não voltam estão escritos.
4. **Calcule a margem percentual.** Margem % = margem ajustada / ticket. Pronto quando o percentual está escrito.
5. **ROAS de equilíbrio.** ROAS de equilíbrio = ticket / margem ajustada = 1 / margem %. Abaixo disso o anúncio dá prejuízo. Pronto quando o número está em destaque.
6. **ROAS mínimo com lucro.** Valor disponível para anúncio = margem ajustada - lucro desejado. ROAS mínimo = ticket / valor disponível. Se o valor disponível for zero ou negativo, diga que a meta de lucro não cabe com essa margem. Pronto quando o número e a leitura estão escritos.
7. **Alinhe com a receita reportada.** Se a plataforma reporta outro valor por pedido (com frete, sem desconto), a margem em R$ não muda; só o numerador troca. ROAS na base da plataforma = valor reportado por pedido / margem ajustada (equilíbrio) e valor reportado por pedido / valor disponível (mínimo). Não refaça a margem com o valor reportado. Pronto quando a base de comparação está declarada e os dois ROAS estão na mesma base do relatório.
8. **Mostre a sensibilidade.** Recalcule com ticket 10% menor (custos percentuais reaplicados, custos em R$ mantidos, lucro em % recalculado e em R$ mantido) e com devolução dobrada. Pronto quando há as duas linhas, ou a de devolução diz "não se aplica" quando a taxa é zero.
9. **Compare com o ROAS real, se o usuário colou.** Para cada R$ 100 investidos: pedidos = ROAS real x 100 / valor por pedido na base da plataforma; resultado = pedidos x margem ajustada - 100. Positivo é lucro, negativo é prejuízo, antes do lucro desejado. Pronto quando a comparação usa só números do usuário e a fórmula aparece com os valores.

## Exemplo (números ilustrativos, não são do usuário)

```text
EXEMPLO
Ticket médio: R$ 120,00 | Frete cobrado do cliente: R$ 0,00 | Mercadoria: R$ 42,00
Frete pago pela loja: R$ 15,00 | Embalagem: R$ 3,00 | Pagamento: 5% | Imposto: 8%
Devolução: 0% (premissa do usuário) | Lucro desejado: 10% do ticket | Plataforma reporta: R$ 120,00

Pagamento: 120,00 x 0,05 = R$ 6,00
Imposto: 120,00 x 0,08 = R$ 9,60
Margem: 120,00 - 42,00 - 15,00 - 3,00 - 6,00 - 9,60 = R$ 44,40 (devolução 0%: sem ajuste)
Margem %: 44,40 / 120,00 = 37,0%
ROAS de equilíbrio: 120,00 / 44,40 = 2,70
Lucro desejado: 120,00 x 0,10 = R$ 12,00
Disponível para anúncio: 44,40 - 12,00 = R$ 32,40
ROAS mínimo: 120,00 / 32,40 = 3,70
Sensibilidade, ticket -10% (R$ 108,00): margem R$ 33,96 | equilíbrio 3,18 | mínimo 4,66
Sensibilidade, devolução x2: não se aplica (devolução 0%)
ROAS real 3,20: pedidos = 3,20 x 100 / 120,00 = 2,667 | resultado = 2,667 x 44,40 - 100 = R$ 18,40
```

## Saída

```text
Entradas
| Item | Valor | Origem |

Conta
[cada linha da fórmula com os valores do usuário]
Premissa da devolução: [taxa e custos que não voltam]

ROAS de equilíbrio: [valor]
ROAS mínimo para lucro de [valor]: [valor]
Base da receita: [como a plataforma reporta; ROAS na base da plataforma: equilíbrio [..], mínimo [..]]

Sensibilidade
Ticket -10%: equilíbrio [..] | mínimo [..]
Devolução x2: equilíbrio [..] | mínimo [..] ou "não se aplica"

ROAS real informado: [valor] -> [acima ou abaixo da meta]; por R$ 100: [pedidos] pedidos, resultado R$ [valor]

Pendências: [itens NÚMERO REAL]
```

## Erros comuns

- Achar que ROAS 1 é equilíbrio. Equilíbrio é 1 dividido pela margem percentual.
- Comparar ROAS calculado sem frete com ROAS reportado com frete.
- Recalcular a margem inteira com o valor reportado pela plataforma, em vez de trocar só o numerador.
- Aplicar a taxa do pagamento só sobre o ticket quando o cliente também paga frete no gateway.
- Usar markup no lugar de margem.

## Exemplo de pedido

> Use o calcular-roas-minimo. Minha loja tem ticket médio de R$ 150 em produtos, o cliente paga R$ 18 de frete no checkout e eu repasso R$ 18 à transportadora. Custo de mercadoria de 40%, embalagem de R$ 2, gateway de 4,99% sobre o pedido, imposto de 6% sobre os produtos, devolução de 3% (frete e embalagem não voltam) e quero 10% de lucro. O Meta reporta o valor do pedido com frete e mostra ROAS 2,9. Está dando lucro?
