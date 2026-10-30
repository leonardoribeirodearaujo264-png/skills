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
3. **Agrupe por tema.** Junte dores que falam da mesma coisa com palavras diferentes. Dê a cada grupo um nome curto na linguagem do cliente. Pronto quando nenhum grupo repete outro.
4. **Abra cada grupo em quatro camadas.** Para cada grupo, escreva:
   - Sintoma: o que a pessoa sente ou vê no dia a dia.
   - Causa percebida: o que ela acha que provoca o problema.
   - Custo: o que perde por continuar assim (dinheiro, tempo, saúde, reputação, relação).
   - Desejo: como seria a vida resolvida, nas palavras dela.
   Pronto quando nenhuma camada está em branco; se faltar dado, marque [FALTA DADO].
5. **Pontue e priorize.** Dê nota de 1 a 3 em frequência (quantas vezes aparece) e em intensidade (quanto incomoda). Multiplique. Ordene do maior para o menor. Pronto quando a tabela está ordenada e cada nota tem justificativa de uma linha.
6. **Escolha a dor principal e duas secundárias.** A principal é a de maior pontuação que o produto realmente resolve. Se a dor mais forte não é resolvida pelo produto, registre isso como alerta. Pronto quando as três estão marcadas e o alerta, se existir, está escrito.

## Saída

```text
Público: [FRASE DE UMA LINHA]
Base: [material lido] ou [HIPÓTESE, sem material do cliente]

| # | Dor (nome do cliente) | Sintoma | Causa percebida | Custo | Desejo | Freq | Int | Nota | Fonte |
|---|---|---|---|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... | 3 | 3 | 9 | comentário 12 |

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
