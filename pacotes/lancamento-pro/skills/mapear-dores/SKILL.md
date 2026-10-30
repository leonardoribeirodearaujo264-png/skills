---
name: mapear-dores
description: Organiza as dores do público de um produto em camadas (sintoma, causa percebida, custo e desejo por trás) e prioriza as que mais pesam na decisão de compra. Use quando for começar a pesquisa de um lançamento, quando a oferta parecer genérica ou quando ninguém souber dizer qual problema o produto resolve.
---

# Mapear dores

Mapa das dores do público que vai comprar o produto. O resultado é uma tabela priorizada em que cada dor tem sintoma, causa que o cliente acredita ter, custo de continuar com o problema, desejo por trás e fonte. Esse mapa alimenta ângulo, promessa e objeções nas etapas seguintes.

## Quando usar

- No início da pesquisa de um lançamento, antes de escrever qualquer texto.
- Quando a página fala de recursos do produto e não do problema do cliente.
- Quando o dono tem várias ideias de público e precisa enxergar qual dor é mais forte.

Se o usuário já tem depoimentos, comentários ou respostas de pesquisa e quer as frases exatas do cliente, use extrair-linguagem-depoimentos. Se o foco são os motivos para não comprar, use levantar-objecoes. Para o caminho completo do cliente antes e depois da compra, use mapear-jornada-cliente.

## O que pedir antes

- Produto: o que é, formato (curso, mentoria, serviço, produto físico) e o que entrega.
- Público: quem compra hoje ou quem o dono quer atingir.
- Material bruto disponível: comentários, mensagens, respostas de formulário, gravações de atendimento. Se não houver, diga que o mapa será hipótese e marque cada linha como tal.
- Nicho regulado (saúde, direito, finanças): pergunte, porque muda o que pode ser dito depois.

## Passo a passo

1. **Defina o público em uma frase.** Escreva quem é, em que momento da vida ou do negócio está e o que já tentou. Pronto quando a frase cabe em uma linha e não usa "todo mundo".
2. **Liste as dores brutas.** Leia o material fornecido com Read ou Grep e anote cada problema citado, sem filtrar. Sem material, liste hipóteses a partir do produto e marque [HIPÓTESE]. Pronto quando há pelo menos 10 itens ou todo o material foi lido.
3. **Agrupe por tema.** Junte dores que falam da mesma coisa com palavras diferentes. Dê a cada grupo um nome curto na linguagem do cliente. Cada fonte (um comentário, uma mensagem, uma resposta) entra em um grupo só: se falar de duas dores, ponha na que ela descreve com mais detalhe e anote a outra na coluna Fonte. Desejo que vale para todas as dores vai na linha "Desejo geral" da Saída, não repetido em cada grupo. Pronto quando nenhum grupo repete outro e nenhuma fonte está em dois grupos.
4. **Abra cada grupo em quatro camadas.** Para cada grupo, escreva:
   - Sintoma: o que a pessoa sente ou vê no dia a dia.
   - Causa percebida: o que ela acha que provoca o problema.
   - Custo: o que perde por continuar assim (dinheiro, tempo, saúde, reputação, relação).
   - Desejo: como seria a vida resolvida, nas palavras dela.
   Se faltar dado, marque [FALTA DADO] e inclua na Saída as três perguntas para o público completar o mapa: "O que custa para você continuar assim?", "O que você já tentou para resolver?" e "Como seria o seu dia com isso resolvido?". Pronto quando nenhuma camada está em branco.
5. **Pontue e priorize.** Duas notas de 1 a 3, multiplicadas:
   - Frequência, pela régua fixa (a mesma da levantar-objecoes): 1 = 1 fonte; 2 = 2 a 3 fontes; 3 = 4 ou mais fontes. Linha [HIPÓTESE] sem fonte recebe 1.
   - Intensidade: 1 = incômodo citado de passagem; 2 = queixa com custo concreto (dinheiro, tempo, relação); 3 = queixa com urgência ou emoção forte ("não aguento mais", "vou desistir").
   Ordene do maior para o menor. Desempate, nesta ordem: maior intensidade; depois maior número de fontes; depois a dor que o produto resolve mais diretamente. Pronto quando a tabela está ordenada, cada linha mostra o número de fontes e cada nota de intensidade tem justificativa de uma linha.
6. **Escolha a dor principal e duas secundárias.** A principal é a de maior pontuação que o produto realmente resolve. Se a dor mais forte não é resolvida pelo produto, registre isso como alerta. Pronto quando as três estão marcadas e o alerta, se existir, está escrito.

## Saída

```text
Público: [FRASE DE UMA LINHA]
Base: [material lido] ou [HIPÓTESE, sem material do cliente]

| # | Dor (nome do cliente) | Sintoma | Causa percebida | Custo | Desejo | Fontes | Freq | Int | Por que Int | Nota | Fonte |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... | 4 | 3 | 3 | "..." | 9 | comentários 3, 7, 12, 15 |

Régua de frequência: 1 = 1 fonte | 2 = 2 a 3 | 3 = 4 ou mais | [HIPÓTESE] = 1
Desempates aplicados: [quais linhas e por qual critério]
Desejo geral: [desejo que vale para todas as dores, se houver]
Perguntas para completar [FALTA DADO]: [as três do passo 4, se houver lacuna]

Dor principal: [nome]
Secundárias: [nome], [nome]
Alertas: [dor forte que o produto não resolve, nicho regulado, falta de dado]
Próxima etapa sugerida: levantar-objecoes ou definir-angulo-venda
```

## Erros comuns

- Escrever a dor na linguagem do especialista ("baixa conversão de funil") em vez da do cliente ("ninguém compra o que eu posto").
- Tratar hipótese como fato. Sem material real, toda linha leva [HIPÓTESE].
- Escolher como principal uma dor que o produto não resolve, só porque é a mais forte.
- Parar no sintoma e não descobrir o custo, que é o que move a decisão.
- Em saúde, direito ou finanças, descrever o custo com medo exagerado que fere a regra do conselho profissional.
