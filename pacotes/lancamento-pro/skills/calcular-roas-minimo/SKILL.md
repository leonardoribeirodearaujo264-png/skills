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

- Ticket médio real do período (receita bruta dividida pelo número de pedidos).
- Custo da mercadoria ou do serviço por pedido, em reais ou percentual do ticket.
- Frete pago pelo vendedor, embalagem e comissões por pedido.
- Taxa da plataforma de pagamento (percentual e fixo) e impostos em percentual.
- Taxa de devolução ou reembolso histórica.
- Lucro desejado por pedido, em reais ou percentual do ticket.
- Qual receita a plataforma de anúncio reporta: valor bruto do pedido, com ou sem frete, com ou sem desconto. Isso muda o ROAS que deve ser comparado.

Faltou dado: marcar [NÚMERO REAL] e parar a conta naquele ponto.

## Passo a passo

1. **Monte a tabela de entradas.** Valor e origem de cada item. Pronto quando nada usado na conta está sem origem.
2. **Calcule a margem de contribuição por pedido.** Margem = ticket - custo da mercadoria - frete - embalagem - comissões - (ticket x taxa %) - taxa fixa - (ticket x imposto %). Depois multiplique por (1 - taxa de devolução). Pronto quando cada subtração aparece em reais.
3. **Calcule a margem percentual.** Margem % = margem / ticket. Pronto quando o percentual está escrito.
4. **ROAS de equilíbrio.** ROAS de equilíbrio = ticket / margem = 1 / margem %. Abaixo disso o anúncio dá prejuízo. Pronto quando o número está em destaque.
5. **ROAS mínimo com lucro.** Valor disponível para anúncio = margem - lucro desejado. ROAS mínimo = ticket / valor disponível. Se o valor disponível for zero ou negativo, diga que a meta de lucro não cabe com essa margem. Pronto quando o número e a leitura estão escritos.
6. **Alinhe com a receita reportada.** Se a plataforma reporta valor com frete ou sem desconto, ajuste o ticket usado na conta para a mesma base. Pronto quando a base de comparação está declarada.
7. **Compare com o ROAS real, se o usuário colou.** Mostre a diferença e o lucro ou prejuízo estimado por R$ 100 investidos. Pronto quando a comparação usa só números do usuário.

## Exemplo (números ilustrativos, não são do usuário)

```text
EXEMPLO
Ticket médio: R$ 120,00 | Mercadoria: R$ 42,00 | Frete pago pela loja: R$ 15,00
Embalagem: R$ 3,00 | Pagamento: 5% | Imposto: 8% | Devolução: 0% | Lucro desejado: 10% do ticket

Pagamento: 120,00 x 0,05 = R$ 6,00
Imposto: 120,00 x 0,08 = R$ 9,60
Margem: 120,00 - 42,00 - 15,00 - 3,00 - 6,00 - 9,60 = R$ 44,40
Margem %: 44,40 / 120,00 = 37,0%
ROAS de equilíbrio: 120,00 / 44,40 = 2,70
Lucro desejado: 120,00 x 0,10 = R$ 12,00
Disponível para anúncio: 44,40 - 12,00 = R$ 32,40
ROAS mínimo: 120,00 / 32,40 = 3,70
```

## Saída

```text
Entradas
| Item | Valor | Origem |

Conta
[cada linha da fórmula com os valores do usuário]

ROAS de equilíbrio: [valor]
ROAS mínimo para lucro de [valor]: [valor]
Base da receita: [como a plataforma reporta e se houve ajuste]
ROAS real informado: [valor] -> [acima ou abaixo da meta, diferença]

Pendências: [itens NÚMERO REAL]
```

## Erros comuns

- Achar que ROAS 1 é equilíbrio. Equilíbrio é 1 dividido pela margem percentual.
- Comparar ROAS calculado sem frete com ROAS reportado com frete.
- Usar ticket médio de outro período ou de outro canal.
- Ignorar devolução e troca. Sem histórico, peça o dado real em vez de supor zero.
- Usar markup no lugar de margem.

## Exemplo de pedido

> Use o calcular-roas-minimo. Minha loja tem ticket médio de R$ 150, custo de mercadoria de 40%, frete médio de R$ 18 e o relatório mostra ROAS 2,9. Está dando lucro?
