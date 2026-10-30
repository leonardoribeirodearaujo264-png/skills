---
name: matriz-teste-ab
description: Monta uma matriz de teste A/B para anúncios com hipótese, uma variável por vez, células, orçamento por célula e critério de vitória definido antes de começar, usando o CPA máximo e os dados do usuário. Use quando o usuário quiser testar criativos, ganchos, públicos, ofertas ou páginas e precisar saber quantas variações rodar e quando declarar um vencedor.
---

# Matriz de teste A/B

Resultado: um plano de teste em tabela, com o que muda em cada célula, quanto cada uma precisa gastar para ser julgada e a regra que decide o vencedor. A regra é escrita antes do teste, para o resultado não ser lido por conveniência. O usuário sobe o teste na plataforma; esta skill só planeja e, depois, lê o resultado colado.

## Quando usar

- Antes de testar criativos, ganchos, textos, públicos, ofertas ou páginas.
- Quando o usuário roda variações "para ver qual vai melhor" sem regra de parada.
- Para ler um teste já rodado, com os números colados.

Para escrever o briefing das peças que vão para o teste, use briefing-criativo. Para decidir pausar conjuntos fora de um teste, use sugerir-pausa-conjunto. Sem CPA máximo, rode calcular-cpa-maximo antes.

## O que pedir antes

- Objetivo e evento de conversão que decide o teste.
- O que o usuário quer descobrir, em uma frase.
- Orçamento total disponível para o teste e prazo.
- CPA máximo calculado.
- Histórico do próprio usuário, se houver: CPA e taxa de conversão atuais. Sem histórico, o primeiro teste também serve para medir a linha de base, e isso fica dito.
- Se a plataforma oferece um recurso nativo de teste dividido. O nome e o lugar mudam; o usuário confirma.

## Passo a passo

1. **Escreva a hipótese.** Formato: "Se trocarmos [variável] de [A] para [B], [métrica] melhora porque [motivo]". Pronto quando há uma hipótese por variável.
2. **Escolha uma variável por rodada.** Gancho, criativo, texto, público, oferta ou página. Tudo o mais fica igual entre as células. Pronto quando a matriz tem uma única coluna que varia.
3. **Defina as células.** Controle mais 1 a 3 variações. Mais células dividem o orçamento e atrasam a decisão. Pronto quando cada célula tem nome no padrão do usuário (ou sugerido por montar-utms).
4. **Calcule o orçamento por célula.** Gasto mínimo por célula = número de conversões que o usuário exige para decidir x CPA máximo. O número de conversões é escolha do usuário; deixe claro que, com poucas conversões, a diferença pode ser acaso. Orçamento total necessário = gasto mínimo x número de células. Se passar do orçamento disponível, corte células. Pronto quando o orçamento fecha com o que o usuário tem.
5. **Fixe o critério de vitória.** Métrica principal (CPA ou taxa de conversão), diferença mínima que importa para o negócio e o que acontece em empate. Se o usuário quiser rigor estatístico, indique um teste de diferença de proporções e calcule com os números dele. Pronto quando o critério está escrito antes do início.
6. **Ao receber o resultado, leia contra o critério.** Calcule a métrica por célula e aplique a regra escrita. Não mude a regra depois de ver o número. Pronto quando há vencedor, empate ou "inconclusivo, faltou gasto".

## Saída

```text
Objetivo: [evento] | CPA máximo: R$ [valor] | Orçamento: R$ [valor] | Prazo: [dias]
Hipótese: [frase]
Variável testada: [uma]

| Célula | O que muda | Fica igual | Gasto mínimo | Nome/UTM |
| Controle | ... | ... | R$ ... | ... |
| Variação B | ... | ... | R$ ... | ... |

Critério de vitória: [métrica], diferença mínima de [x], decisão com [n] conversões por célula
Empate: [o que fazer]
Próxima rodada: [variável seguinte, se houver]
```

## Erros comuns

- Mudar gancho, público e página ao mesmo tempo e não saber o que funcionou.
- Declarar vencedor com duas ou três conversões por célula.
- Definir o critério depois de olhar os números.
- Usar taxa de conversão "de mercado" para calcular orçamento.
- Abrir células demais para o orçamento disponível.

## Exemplo de pedido

> Use a matriz-teste-ab. Quero testar três ganchos diferentes no mesmo vídeo, tenho R$ 1.500 para o teste e meu CPA máximo é R$ 90.
