---
name: sugerir-pausa-conjunto
description: Classifica cada conjunto de anúncios em manter, observar ou candidato a pausa com critérios objetivos (gasto mínimo antes de julgar e CPA real contra o CPA máximo do usuário), usando dados colados ou exportados. Use quando o usuário perguntar quais conjuntos pausar, cortar, desligar ou escalar a partir de um relatório.
---

# Sugerir pausa de conjunto

Transforma uma tabela de conjuntos de anúncios em uma lista de recomendações com motivo numérico para cada uma. A skill sugere. Quem pausa é o usuário, na plataforma, se concordar. Nenhuma campanha é acessada, pausada ou alterada por aqui.

## Quando usar

- O usuário colou ou exportou o desempenho por conjunto e quer saber o que cortar.
- Revisão diária ou semanal de um lançamento com vários conjuntos rodando.

Se ainda não existe CPA máximo definido, use calcular-cpa-maximo antes. Se o usuário quer entender o relatório como um todo (onde o funil perde gente), use ler-relatorio-anuncios. Esta skill só decide manter, observar ou pausar.

## O que pedir antes

- Tabela por conjunto com: nome, gasto, resultados (compras ou o evento de conversão), período e, se houver, CTR, CPM e data da última edição relevante.
- CPA máximo do usuário. Sem ele, a skill não classifica.
- Regra de gasto mínimo antes de julgar, em múltiplos do CPA máximo. Se o usuário não tiver uma, proponha 2 x CPA máximo como ponto de partida ajustável e deixe escrito que é regra de decisão dele, não referência de mercado.
- Tolerância acima do CPA máximo antes de pausar (por exemplo, 20%). Também é escolha do usuário.
- Se houve edição recente (público, orçamento, criativo), quando foi, e quantos dias o usuário espera depois de uma edição antes de julgar (janela de estabilização).

## Passo a passo

1. **Normalize a tabela.** Uma linha por conjunto, mesmas colunas, mesmo período. Se o período não for igual entre conjuntos, avise e não compare. Pronto quando a tabela está limpa e o período declarado.
2. **Calcule o CPA real.** CPA = gasto / resultados. Com zero resultado, CPA fica "sem venda". Pronto quando cada linha tem CPA ou "sem venda".
3. **Calcule o limite de gasto.** Limite = múltiplo escolhido x CPA máximo. Pronto quando o limite em reais está escrito.
4. **Aplique as regras na ordem.**
   - Gasto abaixo do limite: **aguardar**. Dado insuficiente para julgar.
   - Editado dentro da janela de estabilização definida pelo usuário: **aguardar** e dizer o motivo.
   - Gasto no limite ou acima e zero venda: **candidato a pausa**.
   - CPA real acima de CPA máximo x (1 + tolerância): **candidato a pausa**.
   - CPA real entre CPA máximo e o teto com tolerância: **observar**.
   - CPA real no CPA máximo ou abaixo: **manter**.
   Pronto quando todo conjunto tem uma classificação e a regra que a gerou.
5. **Leia os sinais de apoio.** Para candidatos a pausa, olhe CTR e CPM em relação aos outros conjuntos do próprio usuário para dizer se o problema parece ser criativo, público ou página. Não use média de mercado. Pronto quando cada candidato tem uma hipótese ou "sem sinal claro".
6. **Avalie o impacto da pausa.** Some o gasto diário que seria liberado e diga onde ele iria (conjuntos em manter). Pronto quando o valor liberado está escrito.
7. **Entregue e devolva a decisão.** Termine perguntando quais sugestões o usuário aceita. Pronto quando a saída está no formato abaixo.

## Saída

```text
Período: [datas] | CPA máximo: R$ [valor] | Limite para julgar: R$ [valor] ([n] x CPA máximo)
Tolerância: [n]%

| Conjunto | Gasto | Vendas | CPA | Classificação | Regra aplicada |

Candidatos a pausa
1. [conjunto]: [motivo numérico]. Sinal de apoio: [CTR, CPM ou página]. Hipótese: [criativo, público, página]

Observar
...

Aguardar (dado insuficiente)
...

Gasto diário liberado se pausar todos os candidatos: R$ [valor]

Decisão: você escolhe quais pausar na plataforma. Nenhuma alteração foi feita.
```

## Erros comuns

- Julgar conjunto com gasto menor que o CPA máximo e chamar isso de resultado.
- Comparar conjuntos com períodos diferentes ou atribuições diferentes.
- Pausar logo após uma edição, antes de a entrega estabilizar.
- Usar o CPA do conjunto mais barato como meta, em vez do CPA máximo calculado.
- Apresentar a sugestão como decisão tomada.

## Exemplo de pedido

> Use a sugerir-pausa-conjunto na tabela abaixo. CPA máximo de R$ 116, julgo depois de 2 vezes o CPA máximo e tolero até 20% acima.
