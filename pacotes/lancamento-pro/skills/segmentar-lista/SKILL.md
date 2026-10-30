---
name: segmentar-lista
description: Define os segmentos de uma lista de e-mail por consentimento, estágio, comportamento e interesse, com regra de entrada, regra de saída, fonte do dado e qual mensagem cada um recebe. Use quando o usuário vai enviar campanhas diferentes para partes da lista, precisa excluir compradores ou inativos, ou quer organizar as tags da ferramenta de e-mail.
---

# Segmentar lista

Plano de segmentação para uma lista de e-mail. O resultado é uma tabela de segmentos com critério de entrada, critério de saída, fonte do dado, tamanho (quando o usuário informar) e mensagem indicada, pronta para o usuário recriar como tags ou filtros na ferramenta dele. A skill não acessa a lista, não importa contatos e não envia nada.

## Quando usar

- Vai haver lançamento e compradores, inativos e leads novos não podem receber o mesmo texto.
- A lista cresceu sem organização e o usuário não sabe quem é quem.
- Um teste ou uma campanha exige excluir um grupo específico.

Use outra skill quando for o caso:
- Para dividir a lista ao acaso e comparar assuntos, use testar-assuntos.
- Para decidir quando cada segmento recebe cada envio, use cronograma-envios.
- Para escrever os e-mails de cada segmento, use a sequência correspondente (sequencia-boas-vindas, sequencia-lancamento, sequencia-pos-venda).

## O que pedir antes

1. Ferramenta de e-mail usada e que dados ela guarda: tags, origem, data de inscrição, aberturas, cliques, compras.
2. Como o consentimento foi coletado e se fica registrado por contato.
3. Produtos vendidos e onde ficam os dados de compra.
4. O objetivo imediato: qual campanha vem e quem não pode recebê-la.
5. Tamanho real de cada grupo e dos cruzamentos que importam, se o usuário conseguir exportar. Sem esse dado, deixe [TAMANHO REAL].

## Passo a passo

1. **Comece pelo consentimento.** Primeiro segmento sempre: quem consentiu receber e-mail de marketing (LGPD). Quem não tem registro de consentimento fica fora de qualquer campanha. Como obter ou confirmar consentimento é decisão do responsável legal da empresa; a skill não sugere enviar e-mail de marketing para pedir consentimento a quem nunca deu. Pronto quando existe a regra "fora sem consentimento" e o usuário sabe onde ver isso na ferramenta.
2. **Separe transacional de marketing.** E-mail de compra, acesso, pedido e reembolso é transacional e vai para o comprador mesmo sem consentimento de marketing. Oferta, conteúdo e lançamento são marketing. Pronto quando cada mensagem da tabela tem o tipo escrito.
3. **Separe por estágio.** Lead novo, lead antigo, comprador, ex-cliente (reembolsou ou cancelou). Pronto quando cada estágio tem critério baseado em dado que a ferramenta tem.
4. **Separe por comportamento.** Engajado (abriu ou clicou num período que o usuário define), frio, sem interação há muito tempo. Abertura é imprecisa; prefira clique quando possível. Pronto quando o período de cada um está definido pelo usuário ou marcado como sugestão.
5. **Separe por interesse, se houver dado.** Origem da inscrição (qual isca), produto visto, resposta a pesquisa. Não invente interesse sem dado. Pronto quando cada segmento tem a coluna "Fonte do dado" preenchida.
6. **Limite os segmentos ativos.** A tabela pode listar todos os segmentos possíveis, mas cada campanha usa no máximo 6 segmentos ativos entre inclusão e exclusão. Os demais ficam marcados como "reserva". Pronto quando a campanha atual cita no máximo 6 segmentos.
7. **Escreva as exclusões da campanha atual.** Compradores fora do lançamento do mesmo produto; quem pediu reembolso fora de oferta agressiva; inativos fora até reengajar; descadastrado em qualquer segmento fora de todos. Pronto quando a campanha atual tem lista de inclusão e de exclusão.
8. **Não some tamanhos.** Segmentos se sobrepõem: a mesma pessoa pode ser compradora e engajada. Tamanho de inclusão menos exclusão só com o número exportado do filtro combinado; sem ele, escreva o teto (tamanho da inclusão) e [TAMANHO REAL]. Pronto quando nenhum tamanho da Saída vem de soma ou subtração.
9. **Proponha a limpeza de inativos.** Inativos longos que consentiram recebem um e-mail de reconfirmação; quem não responder sai da lista. O texto pode ser escrito com sequencia-boas-vindas, adaptado. Pronto quando a regra de limpeza tem prazo.
10. **Monte a tabela final.** Pronto quando cada segmento tem entrada, saída, fonte do dado, tamanho (real ou marcador), mensagem e status (ativo ou reserva).

## Saída

```text
Campanha atual: [NOME]
Regra base: só marketing para quem tem consentimento registrado (LGPD); todo envio com link de descadastro

| Segmento | Entra quando | Sai quando | Fonte do dado | Tamanho | Recebe | Tipo | Status |
|---|---|---|---|---|---|---|---|
| Consentiu | aceite registrado | descadastro | campo de consentimento | [TAMANHO REAL] | qualquer campanha | marketing | ativo |
| Comprador [PRODUTO] | compra aprovada | reembolso | integração de vendas | ... | sequencia-pos-venda | transacional | ativo |
| ... |

Inclusão desta campanha: [segmentos]
Exclusão desta campanha: [segmentos]
Tamanho estimado: até [TETO] contatos; número final: [TAMANHO REAL do filtro combinado]
Limpeza: sem clique há [PERÍODO] -> reconfirmação -> sem resposta em [DIAS] sai
Decisões do responsável legal: [consentimento sem registro, base legal]
```

## Erros comuns

- Segmentar por dado que a ferramenta não guarda.
- Somar e subtrair tamanhos de segmentos que se sobrepõem e apresentar o resultado como real.
- Esquecer de excluir compradores e oferecer a eles o mesmo produto mais barato.
- Manter contatos sem consentimento "porque a lista fica maior".
- Ignorar o pedido de descadastro de um segmento e continuar enviando por outro.
