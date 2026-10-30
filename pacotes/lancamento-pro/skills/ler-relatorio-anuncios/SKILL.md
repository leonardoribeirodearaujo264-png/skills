---
name: ler-relatorio-anuncios
description: Lê um relatório de anúncios colado, exportado em CSV ou enviado em print, recalcula as métricas derivadas e aponta em que etapa do funil o resultado se perde, sempre com os números do próprio usuário. Use quando o usuário pedir para analisar, interpretar ou resumir um relatório de Meta Ads, Google Ads ou outra plataforma.
---

# Ler relatório de anúncios

Resultado: um diagnóstico em linguagem de dono de negócio, com as métricas recalculadas, o gargalo do funil e as perguntas que os dados ainda não respondem. A skill trabalha só sobre o que o usuário fornece. Ela não acessa conta de anúncios nem altera nada.

## Quando usar

- O usuário exportou um CSV ou colou uma tabela e quer saber "o que está acontecendo".
- Fechamento de dia, semana ou lançamento, para um resumo.
- Comparar dois períodos ou duas campanhas do mesmo usuário.

Para decidir quais conjuntos pausar, use sugerir-pausa-conjunto. Para saber se o CPA ou o ROAS dá lucro, use calcular-cpa-maximo ou calcular-roas-minimo. Para planejar um teste a partir do que foi visto, use matriz-teste-ab.

## O que pedir antes

- O arquivo ou a tabela, com período e nível (campanha, conjunto ou anúncio).
- Qual é o evento de conversão que importa (compra, lead, cadastro).
- Janela de atribuição usada no relatório, se o usuário souber.
- Números de fora da plataforma, se houver: vendas reais na plataforma de pagamento, leads no CRM. Servem para comparar com o que o anúncio atribui.
- CPA máximo ou ROAS mínimo, se já calculados.

## Passo a passo

1. **Leia o arquivo.** CSV com Read; print, transcreva os números e peça confirmação dos que ficaram ilegíveis. Os nomes das colunas variam conforme plataforma, idioma e versão: mapeie cada coluna para o conceito (gasto, impressões, cliques no link, conversões, valor) e mostre o mapeamento. Pronto quando o usuário pode conferir de qual coluna saiu cada conceito.
2. **Recalcule as métricas derivadas.** CPM = gasto / impressões x 1000. CTR = cliques / impressões. CPC = gasto / cliques. Taxa de conversão = conversões / cliques. CPA = gasto / conversões. ROAS = valor / gasto. Se a plataforma também traz esses campos, compare e explique diferença (por exemplo, clique total contra clique no link). Pronto quando há uma tabela com as métricas por linha e no total.
3. **Monte o funil.** Impressões -> cliques -> visitas na página (se houver dado) -> início de checkout -> conversão. Calcule a passagem de cada etapa. Pronto quando cada etapa tem número absoluto e percentual de passagem, ou "sem dado".
4. **Ache o gargalo.** Compare as linhas entre si, nunca com média de mercado. CPM alto relativo aponta para público ou leilão; CTR baixo relativo, para criativo ou oferta no anúncio; muito clique e pouca visita, para página lenta ou rastreamento; visita sem checkout, para página ou preço. Pronto quando o gargalo principal está nomeado com o número que o sustenta.
5. **Confronte com os números de fora.** Se o usuário trouxe vendas reais, mostre a diferença entre atribuído e real e diga que a diferença é esperada em algum grau, sem cravar o motivo. Pronto quando a diferença está em reais e em percentual, ou marcada como "sem dado externo".
6. **Liste o que medir primeiro.** Tudo que impediu uma conclusão vira item: evento faltando, UTM ausente, período curto. Pronto quando a lista existe, mesmo que vazia.

## Saída

```text
Relatório: [plataforma, nível, período] | Evento: [evento]

Resumo (até 3 linhas): [o que aconteceu e onde perde]

Mapeamento de colunas
| Conceito | Coluna no arquivo |

Métricas
| Linha | Gasto | CPM | CTR | CPC | Conv. | Tx conv. | CPA | ROAS |

Funil
Impressões [n] -> Cliques [n] ([%]) -> Visitas [n] ([%]) -> Checkout [n] ([%]) -> Conversões [n] ([%])

Gargalo principal: [etapa] porque [número]
Atribuído x real: [diferença] ou "sem dado externo"
Medir primeiro: [itens]
```

## Erros comuns

- Somar CTR ou CPA de várias linhas em vez de recalcular a partir dos totais.
- Tratar clique total como clique no link.
- Concluir sobre um período com poucas conversões sem dizer que o dado é fraco.
- Citar "CTR bom de mercado". Compare só com o histórico do próprio usuário.
- Prometer o nome exato de uma coluna ou menu. Eles mudam; descreva o conceito.

## Exemplo de pedido

> Use o ler-relatorio-anuncios no CSV anexo da última semana, nível conjunto. O evento que importa é compra. Na plataforma de pagamento entraram 38 vendas.
