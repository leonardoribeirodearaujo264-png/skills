---
name: segmentar-lista
description: Define os segmentos de uma lista de e-mail por consentimento, estágio, comportamento e interesse, com regra de entrada, regra de saída e qual mensagem cada um recebe. Use quando o usuário vai enviar campanhas diferentes para partes da lista, precisa excluir compradores ou inativos, ou quer organizar as tags da ferramenta de e-mail.
---

# Segmentar lista

Plano de segmentação para uma lista de e-mail. O resultado é uma tabela de segmentos com critério de entrada, critério de saída, tamanho (quando o usuário informar) e mensagem indicada, pronta para o usuário recriar como tags ou filtros na ferramenta dele. A skill não acessa a lista, não importa contatos e não envia nada.

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
5. Tamanho real de cada grupo, se o usuário conseguir exportar. Sem esse dado, deixe [TAMANHO REAL].

## Passo a passo

1. **Comece pelo consentimento.** Primeiro segmento sempre: quem consentiu receber e-mail de marketing (LGPD). Quem não tem registro de consentimento fica fora de qualquer campanha até ser confirmado. Pronto quando existe a regra "fora sem consentimento" e o usuário sabe onde ver isso na ferramenta.
2. **Separe por estágio.** Lead novo, lead antigo, comprador, ex-cliente (reembolsou ou cancelou). Pronto quando cada estágio tem critério baseado em dado que a ferramenta tem.
3. **Separe por comportamento.** Engajado (abriu ou clicou num período que o usuário define), frio, sem interação há muito tempo. Lembre que abertura é imprecisa; prefira clique quando possível. Pronto quando o período de cada um está definido pelo usuário ou marcado como sugestão.
4. **Separe por interesse, se houver dado.** Origem da inscrição (qual isca), produto visto, resposta a pesquisa. Não invente interesse sem dado. Pronto quando cada segmento de interesse aponta a fonte do dado.
5. **Escreva as exclusões da campanha atual.** Exemplos: compradores fora do lançamento do mesmo produto; quem pediu reembolso fora de oferta agressiva; inativos fora até reengajar. Pronto quando a campanha atual tem lista de inclusão e de exclusão.
6. **Proponha a limpeza de inativos.** Inativos longos recebem um e-mail de reconfirmação; quem não responder sai da lista. Isso protege a entrega e respeita quem perdeu interesse. Pronto quando a regra de limpeza tem prazo.
7. **Monte a tabela final.** Pronto quando cada segmento tem entrada, saída, mensagem e tamanho (real ou marcador).

## Saída

```text
Campanha atual: [NOME]
Regra base: só contatos com consentimento registrado (LGPD); todo envio com link de descadastro

| Segmento | Entra quando | Sai quando | Tamanho | Recebe |
| Consentiu | aceite registrado | descadastro | [TAMANHO REAL] | qualquer campanha |
| Comprador [PRODUTO] | compra aprovada | reembolso | ... | sequencia-pos-venda |
| ... |

Inclusão desta campanha: ...
Exclusão desta campanha: ...
Limpeza: sem clique há [PERÍODO] -> reconfirmação -> sem resposta em [DIAS] sai
```

## Erros comuns

- Criar dezenas de segmentos que ninguém mantém. Comece com cinco ou seis.
- Segmentar por dado que a ferramenta não guarda.
- Esquecer de excluir compradores e oferecer a eles o mesmo produto mais barato.
- Manter contatos sem consentimento "porque a lista fica maior".
- Ignorar o pedido de descadastro de um segmento e continuar enviando por outro.
