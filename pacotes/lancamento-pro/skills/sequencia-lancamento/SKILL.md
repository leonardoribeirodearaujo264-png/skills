---
name: sequencia-lancamento
description: Escreve a sequência de e-mails de um lançamento, do aquecimento à abertura do carrinho e ao fechamento, com função, data e texto de cada envio. Use quando o usuário tem uma data de abertura de vendas definida e precisa dos e-mails do período de lançamento prontos para colar na ferramenta de e-mail.
---

# Sequência de lançamento

Sequência para um período de vendas com começo e fim: aquecimento, abertura do carrinho, dias de carrinho aberto e fechamento. O resultado é a lista de e-mails com data, função, assunto, pré-cabeçalho e corpo, para o usuário colar na ferramenta dele. A skill não envia e-mail nem agenda nada.

## Quando usar

- Existe um produto com data de abertura e de fechamento de vendas.
- O usuário quer a sequência inteira do lançamento escrita de uma vez.
- Um lançamento anterior teve e-mails soltos e agora precisa de uma linha narrativa.

Use outra skill quando for o caso:
- Só o último e-mail antes do prazo real: email-ultima-chance.
- Quem iniciou a compra e não terminou: email-carrinho-abandonado.
- Encaixar esta sequência no calendário com outros fluxos: cronograma-envios.
- Decidir quem recebe qual versão: segmentar-lista.
- Primeiros e-mails de quem acabou de entrar na lista: sequencia-boas-vindas.

## O que pedir antes

1. Produto, preço e o que a pessoa recebe, em itens concretos.
2. Data e hora de abertura e de fechamento do carrinho. Sem datas reais, não há sequência de lançamento.
3. Bônus, condição especial ou garantia, só se forem reais.
4. Evento de aquecimento, se houver (aula, live, série de vídeos), com datas.
5. Objeções mais comuns que o usuário ouve dos clientes.
6. Provas disponíveis: depoimentos, números, casos. Só os fornecidos pelo usuário.
7. Área regulada? Qual conselho ou norma de publicidade vale.

## Passo a passo

1. **Confirme datas e consentimento.** Escreva abertura e fechamento com dia e hora. Confirme que a lista é de quem consentiu receber e-mails (LGPD). Pronto quando as datas estão escritas e o consentimento está confirmado ou registrado como pendência.
2. **Monte o esqueleto por fase.** Aquecimento (2 a 4 e-mails), abertura (1 e-mail no horário exato), carrinho aberto (1 e-mail por objeção principal), fechamento (véspera e último dia). Pronto quando cada e-mail tem data, fase e função de uma linha.
3. **Escreva o aquecimento.** Conteúdo útil ligado ao problema que o produto resolve, sem vender ainda, avisando a data de abertura. Pronto quando a data de abertura aparece em todos os e-mails dessa fase.
4. **Escreva a abertura.** O que é, para quem é, o que inclui, preço, prazo e um único botão. Pronto quando alguém que leu só esse e-mail sabe o que comprar, quanto custa e até quando.
5. **Escreva os dias de carrinho aberto.** Um e-mail por objeção, com resposta concreta e prova real ou marcador [DEPOIMENTO REAL]. Pronto quando cada objeção listada tem um e-mail.
6. **Escreva o fechamento.** Véspera e último dia citando a hora exata do fim. Se o usuário quiser um e-mail final separado, indique a skill email-ultima-chance. Pronto quando nenhuma frase cria urgência que não existe.
7. **Feche os rodapés e revise.** Todo e-mail com remetente e [LINK DE DESCADASTRO]. Em área regulada, marque [ATENÇÃO] em promessa de resultado. Pronto quando a revisão está anotada.

## Saída

```text
Produto: [NOME] | Preço: [PREÇO REAL]
Carrinho: abre [DATA HORA] | fecha [DATA HORA]
Consentimento LGPD: [confirmado | pendente]

Fase: aquecimento
E-mail 1 | [DATA HORA]
Função: ...
Assunto: ...
Pré-cabeçalho: ...
Corpo:
...
Link: [LINK]
Rodapé: [REMETENTE] | [LINK DE DESCADASTRO]

Fase: abertura
...

Marcadores a preencher: [DEPOIMENTO REAL], [NÚMERO REAL], ...
```

## Erros comuns

- Escrever "últimas vagas" sem limite real de vagas. Isso é publicidade enganosa.
- Mudar o preço ou o prazo entre um e-mail e outro por descuido de redação.
- Fazer todos os e-mails de carrinho aberto repetirem a mesma oferta sem tratar objeção.
- Prometer resultado ("você vai faturar") que o produto não pode garantir.
- Enviar o lançamento para quem já comprou. Combine com segmentar-lista.
