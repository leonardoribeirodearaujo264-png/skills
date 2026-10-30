---
name: levantar-objecoes
description: Levanta os motivos pelos quais o público não compra (preço, tempo, confiança, "funciona para mim", momento, decisor), classifica por peso e define para cada objeção a resposta, a prova e o lugar onde ela entra na página, no vídeo ou no atendimento. Use quando estiver montando a oferta ou a página, quando houver muitas visitas e poucas compras com dúvida recorrente, ou antes de escrever a seção de perguntas frequentes.
---

# Levantar objeções

Lista das objeções reais e prováveis do público, cada uma com peso, tipo, resposta curta, prova que sustenta a resposta e o ponto do funil onde deve ser tratada. O resultado evita que a página responda dúvida que ninguém tem e ignore a que trava a compra.

## Quando usar

- Ao montar uma oferta nova ou revisar uma que não vende.
- Antes de escrever a seção de perguntas frequentes, o roteiro de vídeo de vendas ou o script de atendimento.
- Quando o suporte ou o comercial ouve a mesma dúvida várias vezes.

Para entender o problema que o cliente quer resolver, use mapear-dores. Se a objeção principal é de risco e a resposta é a garantia, detalhe em definir-garantia. Se a objeção é de preço e envolve order bump, use calcular-preco-bump para os números. Se a dúvida é se a promessa é crível, use validar-promessa.

Esta skill levanta e prioriza; não escreve a seção pronta. Para redigir as perguntas frequentes a partir desta lista, use escrever-faq-objecoes.

## O que pedir antes

- Produto, preço e formato de entrega.
- Fontes de objeção: mensagens de quem não comprou, perguntas de suporte, comentários, gravações de vendas, abandonos de carrinho com motivo.
- Página ou roteiro atual, se existir, para ver onde as objeções já são tratadas.
- Provas disponíveis: depoimentos autorizados, garantia, prints, certificações. O que não existir fica como [PROVA REAL].
- Modelo de venda: página direta, chamada de vendas, WhatsApp ou loja. Muda onde cada objeção é tratada.
- Nicho regulado (saúde, direito, finanças): pergunte, porque limita o tipo de resposta permitida.

Sem nenhuma fonte de objeção real, siga só com as universais e avise que a lista é hipótese.

## Passo a passo

1. **Colete as objeções.** Leia o material com Read ou Grep e anote cada dúvida ou recusa, com a frase do cliente e a fonte. Fonte é uma peça distinta (uma mensagem, um comentário, uma gravação); a mesma pessoa repetindo a dúvida na mesma peça conta uma vez. Cada frase conta para uma objeção só: se couber em duas, ponha na que ela explica melhor e cite a outra na coluna Objeção. Complete com as objeções universais (preço, tempo, confiança, "funciona para mim", momento, preciso consultar alguém) marcando [PROVÁVEL]. Pronto quando cada objeção tem frase e fonte ou a marca [PROVÁVEL] e nenhuma frase aparece em duas linhas.
2. **Classifique por tipo.** Use: Valor (acha caro), Capacidade (acha que não consegue), Confiança (não acredita em você ou no que você faz com os dados dele; em SaaS e em saúde, "meus dados e os dos meus clientes ficam seguros?" é Confiança e toca a LGPD), Encaixe (acha que não é para o caso dele), Momento (agora não), Decisor (depende de outra pessoa). Se a objeção cabe em dois tipos, escolha o tipo que a resposta vai tratar e anote o outro entre parênteses. Pronto quando cada objeção tem um tipo principal.
3. **Dê peso.** Duas notas de 1 a 3, multiplicadas:
   - Frequência, pela régua fixa: 1 = 1 fonte; 2 = 2 a 3 fontes; 3 = 4 ou mais fontes. Objeção [PROVÁVEL] sem fonte recebe 1.
   - Impacto na decisão: 1 = incomoda, mas a pessoa compra; 2 = adia a compra; 3 = impede a compra. Justifique em uma linha.
   Desempate, nesta ordem: maior impacto; depois maior número de fontes; depois a objeção que aparece mais perto da compra (checkout antes de anúncio). Pronto quando a lista está ordenada, cada linha mostra Freq, Imp e número de fontes, e as três primeiras estão destacadas.
4. **Escreva a resposta e a prova.** Para cada objeção, uma resposta de até duas frases, sem promessa nova, e a prova que a sustenta. Resposta sem prova vira alerta. Pronto quando toda resposta tem prova ou alerta.
5. **Defina onde tratar.** Indique o ponto: anúncio, primeira dobra, seção de oferta, perto do preço, perguntas frequentes, checkout, e-mail ou atendimento. Objeção de peso alto não pode ficar só nas perguntas frequentes. Pronto quando cada objeção tem lugar.
6. **Compare com o material atual.** Se houver página ou roteiro, marque o que já está tratado, o que falta e o que é respondido sem prova. Pronto quando a comparação está feita ou registrada como "sem material atual".

## Saída

```text
Produto: [nome] | Preço: [valor informado]

| # | Objeção (frase do cliente) | Fontes | Tipo | Freq | Imp | Peso | Resposta | Prova | Onde tratar | Status atual |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | "..." | 4 (msg 2, 5, 9, 12) | Valor | 3 | 3 | 9 | ... | [PROVA REAL] | perto do preço | falta |

Régua de frequência: 1 = 1 fonte | 2 = 2 a 3 | 3 = 4 ou mais | [PROVÁVEL] = 1
Desempates aplicados: [quais linhas e por qual critério]

Três que mais travam: [1], [2], [3]
Alertas: [resposta sem prova, objeção que pede mudança na oferta e não no texto]
Próxima etapa sugerida: escrever-faq-objecoes, definir-garantia ou montar-stack-bonus
```

Regra de decisão: se a resposta a uma objeção pesada depende de prova que não existe, a correção é na oferta (garantia, bônus, demonstração) e não no texto. Registre isso nos alertas.

## Erros comuns

- Responder objeção com promessa nova que o produto não cumpre.
- Esconder a objeção mais pesada no fim das perguntas frequentes.
- Tratar toda objeção de preço com desconto, quando o problema é valor não percebido.
- Inventar depoimento para responder "funciona para mim?". Sem prova real, a marca [PROVA REAL] fica.
- Ignorar o tipo Decisor, comum em vendas para empresas e para casais.
