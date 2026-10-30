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
- Mapa de dores e lista de objeções, se existirem.
- Prazo entre compra e primeiro acesso, e como o acesso é entregue (e-mail, WhatsApp, área de membros).

Sem canais definidos, monte a jornada com os canais planejados e marque cada um como [PLANEJADO].

## Passo a passo

1. **Fixe as etapas.** Use: Descoberta, Consideração, Decisão, Compra, Primeiro uso, Resultado, Indicação. Junte ou separe etapas só se o modelo de venda pedir (por exemplo, chamada de vendas entre Decisão e Compra). Pronto quando as etapas estão listadas na ordem.
2. **Preencha pensamento e ação.** Para cada etapa, o que o cliente pensa (na linguagem dele) e o que faz. Use o material de pesquisa quando houver. Pronto quando nenhuma etapa tem campo vazio; hipótese leva [HIPÓTESE].
3. **Ligue os pontos de contato.** Para cada etapa, os canais e peças que o cliente encontra (anúncio, post, página, e-mail de acesso, primeira aula). Pronto quando cada etapa tem pelo menos um ponto de contato ou o vazio está marcado como lacuna.
4. **Escreva a necessidade da etapa.** O que o cliente precisa receber para seguir: informação, prova, segurança, instrução, confirmação. Pronto quando cada etapa tem uma necessidade principal.
5. **Marque os pontos de abandono.** Onde ele desiste e por quê. Com números reais, calcule a passagem de uma etapa para a outra (etapa seguinte dividida pela anterior) e mostre a conta. Sem números, descreva o risco. Pronto quando cada etapa tem risco de abandono escrito.
6. **Aponte a etapa mais frágil e a ação.** Escolha a etapa com maior queda medida ou, sem números, a de maior risco com justificativa. Diga a ação e qual skill vizinha usar. Pronto quando há uma etapa prioritária com ação concreta.

## Saída

```text
Produto: [nome] | Canais: [lista] | Base: [números reais / qualitativo]

| Etapa | Pensa | Faz | Pontos de contato | Precisa | Risco de abandono | Passagem |
|---|---|---|---|---|---|---|
| Descoberta | "..." | ... | anúncio, post | identificação | ignora o anúncio | [NÚMERO REAL] |
| Decisão | "..." | ... | página | prova e segurança | dúvida de preço | 120/1.000 = 12% |

Etapa mais frágil: [etapa] porque [motivo ou conta]
Ação: [ação concreta] | Skill a usar: [skill vizinha]
Lacunas: [etapas sem ponto de contato]
```

Regra de prioridade: quando duas etapas empatam, trate primeiro a mais próxima da compra, porque a queda ali desperdiça todo o esforço das etapas anteriores.

## Erros comuns

- Parar a jornada na compra e ignorar primeiro uso e resultado, onde nascem reembolso e indicação.
- Calcular passagem com números estimados. Sem dado, fica [NÚMERO REAL].
- Escrever o pensamento do cliente com a voz do vendedor.
- Apontar várias etapas frágeis ao mesmo tempo, em vez de priorizar uma.
- Esquecer o e-mail ou mensagem de acesso, ponto de contato que decide se o comprador começa a usar.
