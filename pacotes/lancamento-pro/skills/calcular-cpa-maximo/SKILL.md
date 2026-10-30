---
name: calcular-cpa-maximo
description: Calcula o CPA de equilíbrio e o CPA máximo por venda a partir do preço, custos, taxas, impostos, reembolso e lucro desejado do usuário, mostrando a conta passo a passo. Use quando o usuário perguntar quanto pode pagar por venda, por lead ou por cliente em anúncio, ou precisar de um teto de custo antes de lançar ou julgar uma campanha.
---

# Calcular CPA máximo

Entrega dois números com a conta aberta: o CPA de equilíbrio (quanto custa uma venda sem lucro e sem prejuízo) e o CPA máximo (o teto que ainda deixa o lucro que o usuário quer). Todo valor vem do usuário. Nada de média de mercado.

## Quando usar

- Antes de subir uma campanha de venda, para saber qual custo por venda é aceitável.
- Quando o usuário tem um CPA no relatório e quer saber se é bom ou ruim para o negócio dele.
- Como entrada para sugerir-pausa-conjunto e matriz-teste-ab.

Se a pergunta é "qual retorno sobre o gasto eu preciso" (loja com vários produtos e tickets diferentes), use calcular-roas-minimo. Se o usuário já tem os números da campanha e quer entender o que aconteceu, use ler-relatorio-anuncios.

## O que pedir antes

- Preço de venda (ou ticket médio, se houver order bump ou upsell com taxa de aceite real).
- Taxa da plataforma de pagamento: percentual e valor fixo por transação.
- Impostos sobre a venda, em percentual.
- Custo variável por venda: produto, frete pago pelo vendedor, embalagem, comissão de afiliado ou coprodutor. Cada item em reais ou em percentual do preço, como o usuário tiver.
- Quais desses custos não voltam quando a venda é reembolsada (kit já enviado, frete, brinde físico).
- Taxa de reembolso ou chargeback histórica. Sem histórico, perguntar se quer usar zero e deixar marcado.
- Lucro desejado por venda, em reais ou em percentual do preço.
- Para lead: taxa de conversão real de lead em venda. Sem esse dado, não calcular CPL máximo.

Campo que faltar fica como [NÚMERO REAL] e a conta para nesse ponto.

## Passo a passo

1. **Liste as entradas em tabela.** Cada linha com valor, unidade (R$ ou % do preço) e origem ("informado pelo usuário" ou "pendente"). Pronto quando nenhuma entrada usada na conta está sem origem.
2. **Converta percentuais em reais.** Comissão e qualquer custo em % do preço: valor = preço x percentual. Guarde o percentual: ele será reaplicado no novo preço da sensibilidade. Pronto quando cada custo aparece em reais com a origem do cálculo.
3. **Calcule a receita líquida por venda.** Receita líquida = preço - (preço x taxa % da plataforma) - taxa fixa - (preço x imposto %) - custo variável. Pronto quando cada subtração aparece com o valor em reais.
4. **Ajuste pelo reembolso.** Margem de contribuição = receita líquida x (1 - r) - r x custos que não voltam, com r = taxa de reembolso em decimal. Premissa escrita: venda reembolsada devolve o preço e as taxas; os custos que não voltam continuam perdidos. Se nenhum custo deixa de voltar, a segunda parcela é zero. Pronto quando a premissa e a lista de custos que não voltam estão escritas.
5. **Defina o CPA de equilíbrio.** CPA de equilíbrio = margem de contribuição. Acima disso cada venda dá prejuízo. Pronto quando o número está em destaque.
6. **Defina o CPA máximo.** CPA máximo = margem de contribuição - lucro desejado por venda. Se o lucro veio em percentual, converta: lucro em reais = preço x percentual. Se o resultado for zero ou negativo, diga que a oferta não comporta anúncio pago com essa meta e mostre qual item mais pesa. Pronto quando o número e a leitura estão escritos.
7. **Converta para lead, se pedido.** CPL máximo = CPA máximo x taxa de conversão de lead em venda. Pronto quando a taxa usada é a do usuário, ou a linha diz "não pedido" ou "não calculado: falta taxa de conversão de lead".
8. **Mostre a sensibilidade.** Recalcule a conta inteira com preço 10% menor e com reembolso dobrado. No preço -10%, reaplique todos os percentuais (taxa, imposto, comissão) sobre o novo preço; lucro desejado em %: recalcule sobre o novo preço; em R$: mantenha. Pronto quando há as duas linhas extras e cada uma diz como o lucro foi tratado.

Arredonde só o resultado final de cada linha, para 2 casas. Nas linhas intermediárias, mantenha as casas que a conta gerar.

## Exemplo (números ilustrativos, não são do usuário)

```text
EXEMPLO
Preço: R$ 197,00 | Plataforma: 9,9% + R$ 1,00 | Imposto: 6%
Custo variável: R$ 0,00 (produto digital) | Custos que não voltam: R$ 0,00
Reembolso: 5% | Lucro desejado: R$ 40,00

Taxa da plataforma: 197,00 x 0,099 = 19,503 + 1,00 = R$ 20,503
Imposto: 197,00 x 0,06 = R$ 11,82
Receita líquida: 197,00 - 20,503 - 11,82 - 0,00 = R$ 164,677
Margem de contribuição: 164,677 x 0,95 - 0,05 x 0,00 = 156,44315 = R$ 156,44
CPA de equilíbrio: R$ 156,44
CPA máximo: 156,44315 - 40,00 = 116,44315 = R$ 116,44

Sensibilidade
Preço -10% (R$ 177,30; lucro fixo em R$): CPA máximo R$ 100,70
Reembolso x2 (10%): CPA máximo R$ 108,21
```

## Saída

```text
Entradas
| Item | Valor | Unidade | Origem |

Conta
[cada linha da fórmula com os valores do usuário]
Premissa do reembolso: [custos que não voltam e valor]

CPA de equilíbrio: R$ [valor]
CPA máximo: R$ [valor]  (lucro de R$ [valor] por venda)
CPL máximo: R$ [valor], "não pedido" ou "não calculado: falta taxa de conversão de lead"

Sensibilidade
Preço -10%: CPA máximo R$ [valor] (lucro [recalculado em % | mantido em R$])
Reembolso x2: CPA máximo R$ [valor]

Pendências: [entradas marcadas como NÚMERO REAL]
```

## Erros comuns

- Usar o preço cheio como margem e esquecer taxa da plataforma e imposto.
- Manter a comissão percentual fixa em reais na sensibilidade de preço.
- Supor que todo custo volta no reembolso quando há produto físico enviado.
- Calcular CPL máximo com taxa de conversão "de mercado" em vez da taxa real do usuário.
- Arredondar no meio da conta e propagar erro. Arredonde só no resultado.

## Exemplo de pedido

> Use o calcular-cpa-maximo. Meu curso custa R$ 297, a plataforma cobra 9,9% mais R$ 1, pago 6% de imposto, reembolso de 4% e quero lucrar R$ 60 por venda.
