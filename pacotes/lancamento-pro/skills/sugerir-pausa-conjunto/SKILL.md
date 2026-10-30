---
name: sugerir-pausa-conjunto
description: Classifica cada conjunto de anúncios em manter, observar, aguardar ou candidato a pausa com critérios objetivos (gasto mínimo antes de julgar, volume de vendas e CPA real contra o CPA máximo do usuário), usando dados colados ou exportados. Use quando o usuário perguntar quais conjuntos pausar, cortar, desligar ou escalar a partir de um relatório.
---

# Sugerir pausa de conjunto

Transforma uma tabela de conjuntos de anúncios em uma lista de recomendações com motivo numérico para cada uma, em quatro classes: manter, observar, aguardar e candidato a pausa. A skill sugere. Quem pausa é o usuário, na plataforma, se concordar. Nenhuma campanha é acessada, pausada ou alterada por aqui.

## Quando usar

- O usuário colou ou exportou o desempenho por conjunto e quer saber o que cortar.
- Revisão diária ou semanal de um lançamento com vários conjuntos rodando.

Se ainda não existe CPA máximo definido, use calcular-cpa-maximo antes. Se o usuário quer entender o relatório como um todo (onde o funil perde gente), use ler-relatorio-anuncios. Esta skill só decide manter, observar, aguardar ou pausar.

## O que pedir antes

- Tabela por conjunto com: nome, gasto, resultados (compras ou o evento de conversão), período, orçamento diário configurado e, se houver, CTR, CPM e data da última edição relevante.
- Janela de atribuição usada no relatório (por exemplo, 7 dias após o clique e 1 dia após a visualização), igual para todos os conjuntos.
- CPA máximo do usuário. Sem ele, a skill não classifica.
- Regra de gasto mínimo antes de julgar, em múltiplos do CPA máximo. Se o usuário não tiver uma, proponha 2 x CPA máximo como ponto de partida ajustável e deixe escrito que é regra de decisão dele, não referência de mercado.
- Tolerância acima do CPA máximo antes de pausar (por exemplo, 20%). Também é escolha do usuário.
- Se houve edição recente (público, orçamento, criativo), quando foi, e quantos dias o usuário espera depois de uma edição antes de julgar (janela de estabilização).

## Passo a passo

1. **Normalize a tabela.** Uma linha por conjunto, mesmas colunas, mesmo período e mesma janela de atribuição. Se o período ou a atribuição não forem iguais entre conjuntos, avise e não compare até o usuário exportar de novo. Pronto quando a tabela está limpa e período e atribuição estão declarados.
2. **Calcule o CPA real.** CPA = gasto / resultados. Com zero resultado, CPA fica "sem venda". Pronto quando cada linha tem CPA ou "sem venda".
3. **Calcule o limite de gasto.** Limite = múltiplo escolhido x CPA máximo. Pronto quando o limite em reais está escrito.
4. **Aplique as regras na ordem.** A primeira regra que se aplica decide.
   - Editado dentro da janela de estabilização: **aguardar** e dizer o motivo.
   - Gasto abaixo do limite, com venda e CPA real no CPA máximo ou abaixo: **manter**, com a nota "volume baixo".
   - Gasto abaixo do limite nos demais casos: **aguardar**. Dado insuficiente para julgar.
   - Gasto no limite ou acima e zero venda: **candidato a pausa**.
   - CPA real acima de CPA máximo x (1 + tolerância): **candidato a pausa**.
   - CPA real entre CPA máximo e o teto com tolerância: **observar**.
   - CPA real no CPA máximo ou abaixo: **manter**.
   Pronto quando todo conjunto tem uma classificação e a regra que a gerou.
5. **Marque decisões frágeis.** Se a classificação depende de menos de 3 vendas, escreva "decisão frágil" e recalcule com uma venda a mais. Se a classe muda, diga qual seria. Pronto quando todo conjunto com menos de 3 vendas tem a nota e o teste de uma venda a mais.
6. **Leia os sinais de apoio.** Para candidatos a pausa, compare CTR e CPM com a mediana dos conjuntos do próprio usuário, não com a média nem com referência de mercado, para dizer se o problema parece ser criativo, público ou página. Pronto quando cada candidato tem uma hipótese ou "sem sinal claro" e a mediana usada está escrita.
7. **Avalie o impacto da pausa.** Some o orçamento diário configurado dos candidatos e diga para onde ele poderia ir (conjuntos em manter). Sem orçamento informado, use o gasto médio diário do período e escreva que é estimativa. Pronto quando o valor liberado e a fonte do número estão escritos.
8. **Entregue e devolva a decisão.** Termine perguntando quais sugestões o usuário aceita. Pronto quando a saída está no formato abaixo.

## Saída

```text
Período: [datas] | Atribuição: [janela] | CPA máximo: R$ [valor]
Limite para julgar: R$ [valor] ([n] x CPA máximo) | Tolerância: [n]%

| Conjunto | Gasto | Vendas | CPA | Classificação | Regra aplicada | Nota |
|---|---|---|---|---|---|---|

Candidatos a pausa
1. [conjunto]: [motivo numérico]. CTR e CPM contra a mediana ([valores]). Hipótese: [criativo, público, página ou sem sinal claro]

Observar
...

Aguardar
...

Decisões frágeis (menos de 3 vendas): [conjunto: com uma venda a mais, ficaria em ...]

Orçamento diário liberado se pausar todos os candidatos: R$ [valor] ([orçamento configurado | estimativa pelo gasto médio])

Decisão: você escolhe quais pausar na plataforma. Nenhuma alteração foi feita.
```

## Erros comuns

- Julgar conjunto com gasto menor que o CPA máximo e chamar isso de resultado.
- Pausar por causa de uma ou duas vendas sem avisar que a decisão é frágil.
- Pausar logo após uma edição, antes de a entrega estabilizar.
- Usar o CPA do conjunto mais barato como meta, em vez do CPA máximo calculado.
- Apresentar a sugestão como decisão tomada.

## Exemplo de pedido

> Use a sugerir-pausa-conjunto na tabela abaixo. CPA máximo de R$ 116, julgo depois de 2 vezes o CPA máximo, tolero até 20% acima e a atribuição é 7 dias após o clique.
