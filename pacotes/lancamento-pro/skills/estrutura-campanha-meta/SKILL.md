---
name: estrutura-campanha-meta
description: Desenha a estrutura de campanhas no Meta Ads (campanha, conjunto e anúncio) para um lançamento ou venda contínua, com objetivo, nível do orçamento, número de conjuntos que o orçamento comporta, públicos, nomes e exclusões, para o usuário configurar. Use quando o usuário pedir para estruturar, organizar ou planejar campanhas de Facebook e Instagram antes de subir.
---

# Estrutura de campanha Meta

Resultado: um plano da conta em árvore e em tabela, pronto para o usuário configurar manualmente. A quantidade de conjuntos sai da conta entre orçamento e CPA máximo, não de um modelo fixo. A skill não acessa a conta, não cria nem sobe campanha.

## Quando usar

- Antes de subir as campanhas de um lançamento (captação, aquecimento, carrinho aberto, remarketing).
- Quando a conta está bagunçada, com muitos conjuntos pequenos e nomes soltos.
- Para uma venda contínua de produto único ou de serviço local.

Para campanhas de pesquisa no Google, use campanha-busca-google. Para definir as fontes de público, use publicos-semelhantes. Para planejar variações de criativo, use matriz-teste-ab. Esta skill organiza a estrutura.

## O que pedir antes

- Fases do lançamento e datas de cada uma.
- Objetivo de cada fase: lead, compra, visualização, mensagem.
- Orçamento diário ou total por fase.
- CPA máximo (venda) ou CPL máximo (lead). Sem ele, rode calcular-cpa-maximo antes.
- Públicos disponíveis: frio, semelhantes, remarketing, lista de leads e compradores.
- Criativos prontos ou previstos, e quantos.
- Se o pixel e a integração de eventos de conversão estão funcionando. O usuário confirma; sem isso, avise que a otimização por conversão fica comprometida.

## Passo a passo

1. **Separe campanhas por objetivo e fase.** Uma campanha por objetivo diferente. Fases com o mesmo objetivo e público podem dividir campanha. Pronto quando cada campanha tem um objetivo só.
2. **Escolha o nível do orçamento.** Orçamento na campanha deixa a plataforma distribuir entre conjuntos; orçamento no conjunto dá controle por público. Use orçamento por conjunto quando o usuário precisa garantir gasto em um público, e na campanha quando quer simplicidade. O nome do recurso muda; descreva o conceito. Pronto quando cada campanha tem o nível escolhido e o motivo.
3. **Calcule quantos conjuntos o orçamento comporta.** Conversões possíveis por semana = orçamento semanal / CPA máximo. Divida pelo número de conversões por semana que o usuário quer em cada conjunto para ele sair da fase de aprendizado. O requisito atual da plataforma muda; o usuário confirma. Pronto quando o número máximo de conjuntos está escrito com a conta.
4. **Distribua os públicos.** Um público por conjunto. Frio, semelhantes e remarketing em conjuntos separados. Pronto quando nenhum público aparece em dois conjuntos da mesma campanha.
5. **Defina as exclusões.** Compradores fora das campanhas de venda; leads fora da captação se o objetivo é lead novo; remarketing exclui quem já converteu. Pronto quando cada conjunto tem a lista de exclusões.
6. **Distribua os anúncios.** Criativos por conjunto conforme o orçamento comporta. Variações em teste seguem a matriz-teste-ab. Pronto quando cada conjunto tem a lista de anúncios.
7. **Padronize os nomes.** Campanha: [fase]_[objetivo]_[data]. Conjunto: [público]_[faixa]_[posicionamento]. Anúncio: [formato]_[ângulo]_[versão]. Alinhe com o padrão de montar-utms. Pronto quando todo item tem nome no padrão.
8. **Liste o checklist de configuração.** Evento de conversão, janela de atribuição, posicionamentos, URL com UTM, horário de início e fim. Pronto quando o usuário consegue configurar seguindo a lista.

## Saída

```text
Orçamento semanal: R$ [valor] | CPA máximo: R$ [valor] | Conversões possíveis/semana: [n]
Conjuntos que o orçamento comporta: [n] (conta: [...])

Árvore
[CAMPANHA] [nome] | objetivo | orçamento [nível, valor]
  [CONJUNTO] [nome] | público | exclusões
    [ANÚNCIO] [nome] | URL com UTM

| Campanha | Conjunto | Público | Exclusões | Orçamento | Anúncios |

Checklist de configuração: [itens]
A confirmar na plataforma: [requisitos e nomes de recursos que mudam]
```

## Erros comuns

- Mais conjuntos do que o orçamento comporta, e nenhum sai do aprendizado.
- Mesmo público em vários conjuntos, competindo entre si no leilão.
- Esquecer de excluir compradores das campanhas de venda.
- Misturar objetivo de lead e de compra na mesma campanha.
- Nomes soltos que impedem ler o relatório e ligar às UTMs.

## Exemplo de pedido

> Use a estrutura-campanha-meta para meu lançamento: captação de 10 a 20 de maio, carrinho de 21 a 25. Orçamento de R$ 200 por dia e CPA máximo de R$ 110.
