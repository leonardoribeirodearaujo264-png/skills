---
name: mapear-jornada-cliente
description: Desenha a jornada do cliente de um lançamento em etapas (descoberta, consideração, decisão, compra, primeiro uso, resultado e indicação), com o que ele pensa, faz e precisa em cada uma, os pontos de contato e onde ele abandona. Use quando for planejar o caminho entre anúncio, conteúdo, página, checkout e entrega, ou quando houver queda forte em alguma etapa e ninguém souber por quê.
---

# Mapear jornada do cliente

Mapa do caminho que o cliente percorre do primeiro contato até indicar o produto. Para cada etapa: o que ele pensa, o que faz, o que precisa receber, por onde passa e onde pode desistir. O resultado aponta a etapa mais frágil e o que entregar nela, conectando pesquisa, oferta e entrega.

## Quando usar

- No planejamento de um lançamento, para ligar conteúdo, página, checkout e área de membros.
- Quando há números de uma etapa (cliques, visitas, vendas, acessos) e uma queda sem explicação.
- Quando muitos compradores não acessam o produto ou pedem reembolso cedo.

Para as dores que movem a etapa de descoberta, use mapear-dores. Para as dúvidas da etapa de decisão, use levantar-objecoes. Para o risco percebido na compra, use definir-garantia. Esta skill organiza o caminho inteiro e aponta para as outras.

Ela não escreve as peças de cada etapa. Para os e-mails depois da inscrição, use sequencia-boas-vindas; para a estrutura da página, use estruturar-landing; para ler números de anúncio, use ler-relatorio-anuncios.

## O que pedir antes

- Produto, preço e forma de entrega.
- Canais usados ou planejados: anúncio, perfil, e-mail, WhatsApp, página, checkout, área de membros.
- Números reais por etapa, se houver (visitas, cliques, inícios de checkout, compras, acessos, reembolsos). Sem números, o mapa fica qualitativo e as quedas viram [NÚMERO REAL].
- Histórico do próprio usuário por etapa (passagem de cada etapa em ciclos ou meses anteriores), se houver. É o que permite dizer que uma etapa piorou.
- Mapa de dores e lista de objeções, se existirem.
- Prazo entre compra e primeiro acesso, e como o acesso é entregue (e-mail, WhatsApp, área de membros).

Sem canais definidos, monte a jornada com os canais planejados e marque cada um como [PLANEJADO].

## Passo a passo

1. **Fixe as etapas.** Use: Descoberta, Consideração, Decisão, Compra, Primeiro uso, Resultado, Indicação. Junte ou separe etapas só se o modelo de venda pedir (por exemplo, chamada de vendas entre Decisão e Compra). Para cada etapa, defina o evento que conta como passar por ela. Antes da compra, use o evento medido (clique no link, visita, aplicação, chamada realizada, compra). Depois da compra: Primeiro uso = comprador que fez a primeira ação de uso no prazo combinado (acessou a área, foi ao primeiro encontro); Resultado = comprador que relatou o resultado definido pelo usuário; Indicação = comprador que indicou alguém que comprou (indicação sem compra fica em nota). Reembolso é taxa à parte (reembolsos / compras), registrada como risco do Resultado, não como passagem. Pronto quando as etapas estão listadas na ordem e cada uma tem o seu evento.
2. **Preencha pensamento e ação.** Para cada etapa, o que o cliente pensa (na linguagem dele) e o que faz. Use o material de pesquisa quando houver. Pronto quando nenhuma etapa tem campo vazio; hipótese leva [HIPÓTESE].
3. **Ligue os pontos de contato.** Para cada etapa, os canais e peças que o cliente encontra (anúncio, post, página, e-mail de acesso, primeira aula). Pronto quando cada etapa tem pelo menos um ponto de contato ou o vazio está marcado como lacuna.
4. **Escreva a necessidade da etapa.** O que o cliente precisa receber para seguir: informação, prova, segurança, instrução, confirmação. Pronto quando cada etapa tem uma necessidade principal.
5. **Marque os pontos de abandono.** Onde ele desiste e por quê. Com números reais, calcule para cada etapa: passagem = pessoas no evento da etapa / pessoas no evento da etapa anterior; queda = 1 - passagem; pessoas perdidas = anterior - etapa. Se a etapa anterior não tem número, use compras como base e diga. Mostre as contas. Sem números, descreva o risco. Pronto quando cada etapa tem risco de abandono escrito e, com números, passagem, queda e pessoas perdidas.
6. **Aponte a etapa mais frágil e a ação.** Nunca compare a queda crua de uma etapa com a de outra: impressão para clique, visita para aplicação e comparecimento são taxas de naturezas diferentes, e a regra crua sempre aponta o topo do funil. Siga esta ordem:
   - Exclua da escolha a passagem impressão para clique (Descoberta). Ela é lida em ler-relatorio-anuncios.
   - Com histórico do próprio usuário: para cada etapa, piora = (passagem histórica - passagem atual) / passagem histórica. Cada etapa é comparada só com ela mesma. Prioritária é a de maior piora positiva.
   - Sem histórico: pondere pela proximidade da compra. Distância d = número de passagens entre a etapa e a compra (a própria Compra tem d = 0; a etapa logo antes e o Primeiro uso, d = 1; e assim por diante). Peso = 1 / (d + 1). Nota = queda x peso. Prioritária é a de maior nota. Registre "sem histórico, prioridade por proximidade": a nota mostra onde a perda fica mais perto do dinheiro, não que a etapa está pior que o normal.
   - Sem números: a etapa de maior risco, com justificativa, preferindo a mais próxima da compra.
   Empate: a mais próxima da compra; persistindo, a de mais pessoas perdidas. Diga a ação e qual skill vizinha usar. Pronto quando há uma etapa prioritária, o critério usado, a conta que a sustenta e uma ação concreta.

## Saída

```text
Produto: [nome] | Canais: [lista] | Base: [números reais / qualitativo]

| Etapa | Evento | Pensa | Faz | Pontos de contato | Precisa | Risco de abandono | Passagem | Queda | Perdidas |
|---|---|---|---|---|---|---|---|---|---|
| Descoberta | clique no link | "..." | ... | anúncio, post | identificação | ignora o anúncio | [NÚMERO REAL] | - | - |
| Decisão | início de checkout | "..." | ... | página | prova e segurança | dúvida de preço | 120/1.000 = 12,00% | 88,00% | 880 |

Reembolso: [reembolsos]/[compras] = [%] ou [NÚMERO REAL]

Prioridade (critério: histórico / proximidade / sem números)
| Etapa | Passagem histórica ou d | Piora ou peso | Nota |

Etapa mais frágil: [etapa] porque [conta e critério]
Ação: [ação concreta] | Skill a usar: [skill vizinha]
Lacunas: [etapas sem ponto de contato]
```

## Erros comuns

- Parar a jornada na compra e ignorar primeiro uso e resultado, onde nascem reembolso e indicação.
- Calcular passagem com números estimados. Sem dado, fica [NÚMERO REAL].
- Escolher a etapa frágil comparando a queda do topo do funil com a do comparecimento ou da compra.
- Escrever o pensamento do cliente com a voz do vendedor.
- Esquecer o e-mail ou mensagem de acesso, ponto de contato que decide se o comprador começa a usar.
