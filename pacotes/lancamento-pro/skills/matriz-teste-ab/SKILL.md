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
- Orçamento total disponível para o teste, orçamento diário e prazo.
- Número de conversões por célula que o usuário quer para decidir.
- Custo histórico do evento anterior à conversão (início de checkout, por exemplo), se houver. Serve de saída quando o orçamento não fecha.
- CPA máximo calculado.
- Histórico do próprio usuário, se houver: CPA e taxa de conversão atuais. Sem histórico, o primeiro teste também serve para medir a linha de base, e isso fica dito.
- Se a plataforma oferece um recurso nativo de teste dividido. O nome e o lugar mudam; o usuário confirma.

## Passo a passo

1. **Escreva a hipótese.** Formato: "Se trocarmos [variável] de [A] para [B], [métrica] melhora porque [motivo]". Pronto quando há uma hipótese por variável.
2. **Escolha uma variável por rodada.** Gancho, criativo, texto, público, oferta ou página. Tudo o mais fica igual entre as células. Pronto quando a matriz tem uma única coluna que varia.
3. **Defina as células.** Controle mais 1 a 3 variações. Mais células dividem o orçamento e atrasam a decisão. Se o usuário trouxe mais variações do que cabem, escolha nesta ordem: descarte a que afirma resultado sem prova; fique com a mais diferente do controle em ângulo; as demais vão para a próxima rodada. Pronto quando cada célula tem nome no padrão de montar-utms (anúncio `[formato]_[angulo]_[versao]`) e cada variação fora da rodada tem o motivo.
4. **Calcule o orçamento por célula.** Gasto mínimo por célula = n (conversões que o usuário exige para decidir) x CPA máximo. Deixe claro que, com poucas conversões, a diferença pode ser acaso. Orçamento necessário = gasto mínimo x número de células. Se passar do disponível, mostre ao usuário todas as saídas com a conta e deixe ele escolher:
   - Cortar células, até controle mais 1 variação.
   - Reduzir n: maior n que cabe = orçamento / (células x CPA máximo), arredondado para baixo. Piso declarado de 5 conversões por célula; abaixo disso não é teste, e o piso aparece na Saída.
   - Estender o prazo com o mesmo orçamento diário: dias necessários = orçamento necessário / orçamento diário.
   - Subir o orçamento: diferença = orçamento necessário - disponível.
   - Usar o evento anterior (início de checkout) como métrica do teste: gasto mínimo = n x custo histórico desse evento. Sem esse custo, a opção fica "não calculável".
   Pronto quando o orçamento fecha com a saída escolhida pelo usuário e a conta está escrita.
5. **Fixe o critério de vitória.** Escreva antes do início:
   - Métrica principal (CPA ou taxa de conversão), diferença mínima que importa para o negócio e o que acontece em empate.
   - Quando decidir: cada célula é julgada quando fizer n conversões ou gastar o gasto mínimo, o que vier primeiro. A célula que gastou o mínimo sem chegar a n já está com CPA acima do máximo e perde pelo critério de negócio.
   - Teste estatístico na taxa de conversão (conversões / cliques): p1 = c1 / k1 e p2 = c2 / k2 (c = conversões, k = cliques); p = (c1 + c2) / (k1 + k2); z = (p2 - p1) / raiz(p x (1 - p) x (1/k1 + 1/k2)); p-valor bilateral = erfc(|z| / raiz(2)). Rode com Bash (`python -c "import math; ..."`), nunca estime. Significativo a 5% quando |z| >= 1,96 (p <= 0,05).
   - Regra quando negócio e estatística discordam: se a variação vence pelo critério de negócio e p > 0,05, ela vira o novo controle, não verdade; a próxima rodada a testa de novo.
   Pronto quando o critério está escrito antes do início.
6. **Ao receber o resultado, leia contra o critério.** Calcule a métrica por célula e aplique a regra escrita. Não mude a regra depois de ver o número. Mostre a conta do z e do p-valor. Pronto quando há um destes resultados: vencedor significativo; novo controle (vence no negócio, p > 0,05); empate; ou "inconclusivo, faltou gasto" (nenhuma célula chegou a n nem ao gasto mínimo).

## Saída

```text
Objetivo: [evento] | CPA máximo: R$ [valor] | Orçamento: R$ [valor] ([diário]/dia) | Prazo: [dias]
Orçamento necessário: [células] x [n] x R$ [CPA] = R$ [valor] | Fecha? [sim/não]
Saídas (se não fecha): cortar células [conta] | reduzir n [conta, piso 5] | estender prazo [dias] | subir orçamento [R$] | evento anterior [conta ou não calculável]
Saída escolhida: [qual, pelo usuário]
Hipótese: [frase]
Variável testada: [uma]

Fora desta rodada: [variação] porque [motivo]

| Célula | O que muda | Fica igual | Gasto mínimo | Nome/UTM |
| Controle | ... | ... | R$ ... | ... |
| Variação B | ... | ... | R$ ... | ... |

Critério de vitória: [métrica], diferença mínima de [x], decisão por [n] conversões ou por R$ [gasto mínimo] por célula, o que vier primeiro
Estatística: z de duas proporções na taxa de conversão, bilateral a 5% | Se p > 0,05: vencedor vira novo controle
Empate: [o que fazer]
Próxima rodada: [variável seguinte, se houver]

Leitura do resultado
| Célula | Gasto | Cliques | Conversões | CPA | Tx conv. |
z = [valor] | p-valor = [valor] | Resultado: [vencedor significativo / novo controle / empate / inconclusivo]
```

## Erros comuns

- Mudar gancho, público e página ao mesmo tempo e não saber o que funcionou.
- Declarar vencedor com duas ou três conversões por célula.
- Definir o critério depois de olhar os números.
- Usar taxa de conversão "de mercado" para calcular orçamento.
- Abrir células demais para o orçamento disponível.

## Exemplo de pedido

> Use a matriz-teste-ab. Quero testar três ganchos diferentes no mesmo vídeo, tenho R$ 1.500 para o teste e meu CPA máximo é R$ 90.
