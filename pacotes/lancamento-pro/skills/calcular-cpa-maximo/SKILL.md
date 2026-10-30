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
- Custo variável por venda: produto, frete pago pelo vendedor, embalagem, comissão de afiliado ou coprodutor.
- Taxa de reembolso ou chargeback histórica. Sem histórico, perguntar se quer usar zero e deixar marcado.
- Lucro desejado por venda, em reais ou em percentual do preço.
- Para lead: taxa de conversão real de lead em venda. Sem esse dado, não calcular CPL máximo.

Campo que faltar fica como [NÚMERO REAL] e a conta para nesse ponto.

## Passo a passo

1. **Liste as entradas em tabela.** Cada linha com valor e origem ("informado pelo usuário" ou "pendente"). Pronto quando nenhuma entrada usada na conta está sem origem.
2. **Calcule a receita líquida por venda.** Receita líquida = preço - (preço x taxa % da plataforma) - taxa fixa - (preço x imposto %) - custo variável. Pronto quando cada subtração aparece com o valor em reais.
3. **Ajuste pelo reembolso.** Margem de contribuição = receita líquida x (1 - taxa de reembolso). Diga a premissa: nesta versão simples, venda reembolsada vira receita zero. Pronto quando a premissa está escrita.
4. **Defina o CPA de equilíbrio.** CPA de equilíbrio = margem de contribuição. Acima disso cada venda dá prejuízo. Pronto quando o número está em destaque.
5. **Defina o CPA máximo.** CPA máximo = margem de contribuição - lucro desejado por venda. Se o lucro veio em percentual, converta: lucro em reais = preço x percentual. Se o resultado for zero ou negativo, diga que a oferta não comporta anúncio pago com essa meta e mostre qual item mais pesa. Pronto quando o número e a leitura estão escritos.
6. **Converta para lead, se pedido.** CPL máximo = CPA máximo x taxa de conversão de lead em venda. Pronto quando a taxa usada é a do usuário, nunca estimada.
7. **Mostre a sensibilidade.** Recalcule com preço 10% menor e com reembolso dobrado, para o usuário ver a folga. Pronto quando há as duas linhas extras.

## Exemplo (números ilustrativos, não são do usuário)

```text
EXEMPLO
Preço: R$ 197,00 | Plataforma: 9,9% + R$ 1,00 | Imposto: 6%
Custo variável: R$ 0,00 (produto digital) | Reembolso: 5% | Lucro desejado: R$ 40,00

Taxa da plataforma: 197,00 x 0,099 = 19,50 + 1,00 = R$ 20,50
Imposto: 197,00 x 0,06 = R$ 11,82
Receita líquida: 197,00 - 20,50 - 11,82 - 0,00 = R$ 164,68
Margem de contribuição: 164,68 x 0,95 = R$ 156,45
CPA de equilíbrio: R$ 156,45
CPA máximo: 156,45 - 40,00 = R$ 116,45
```

## Saída

```text
Entradas
| Item | Valor | Origem |

Conta
[cada linha da fórmula com os valores do usuário]

CPA de equilíbrio: R$ [valor]
CPA máximo: R$ [valor]  (lucro de R$ [valor] por venda)
CPL máximo: R$ [valor] ou "não calculado: falta taxa de conversão de lead"

Sensibilidade
Preço -10%: CPA máximo R$ [valor]
Reembolso x2: CPA máximo R$ [valor]

Pendências: [entradas marcadas como NÚMERO REAL]
```

## Erros comuns

- Usar o preço cheio como margem e esquecer taxa da plataforma e imposto.
- Calcular CPL máximo com taxa de conversão "de mercado" em vez da taxa real do usuário.
- Somar receita de upsell sem taxa de aceite medida.
- Tratar o CPA de equilíbrio como meta. Ele é o limite do prejuízo, não o alvo.
- Arredondar no meio da conta e propagar erro. Arredonde só no resultado.

## Exemplo de pedido

> Use o calcular-cpa-maximo. Meu curso custa R$ 297, a plataforma cobra 9,9% mais R$ 1, pago 6% de imposto, reembolso de 4% e quero lucrar R$ 60 por venda.
