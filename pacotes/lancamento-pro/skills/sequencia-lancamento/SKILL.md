---
name: sequencia-lancamento
description: Escreve a sequência de e-mails de um lançamento, do aquecimento à abertura do carrinho e ao fechamento, com função, data, hora com fuso e texto de cada envio. Use quando o usuário tem uma data de abertura de vendas definida e precisa dos e-mails do período de lançamento prontos para colar na ferramenta de e-mail.
---

# Sequência de lançamento

Sequência para um período de vendas com começo e fim: aquecimento, abertura do carrinho, dias de carrinho aberto e fechamento. O resultado é a lista de e-mails com data, hora, função, assunto, pré-cabeçalho e corpo, com no máximo um e-mail por dia durante o carrinho, para o usuário colar na ferramenta dele. A skill não envia e-mail nem agenda nada.

## Quando usar

- Existe um produto com data de abertura e de fechamento de vendas.
- O usuário quer a sequência inteira do lançamento escrita de uma vez.
- Um lançamento anterior teve e-mails soltos e agora precisa de uma linha narrativa.

Use outra skill quando for o caso:
- O e-mail das últimas 3 horas antes do fechamento: email-ultima-chance.
- Quem iniciou a compra e não terminou: email-carrinho-abandonado.
- Encaixar esta sequência no calendário com outros fluxos: cronograma-envios.
- Decidir quem recebe qual versão: segmentar-lista.
- Primeiros e-mails de quem acabou de entrar na lista: sequencia-boas-vindas.

## O que pedir antes

1. Produto, preço e o que a pessoa recebe, em itens concretos.
2. Data e hora de abertura e de fechamento do carrinho, com fuso horário (por exemplo, horário de Brasília). Sem datas reais, não há sequência de lançamento.
3. Bônus, condição especial ou garantia, só se forem reais, com prazo.
4. Evento de aquecimento, se houver (aula, live, série de vídeos), com datas.
5. Objeções mais comuns que o usuário ouve dos clientes.
6. Provas disponíveis: depoimentos, números, casos, e a qual objeção cada uma responde. Só os fornecidos pelo usuário.
7. Se a ferramenta de e-mail retira da sequência quem compra (por integração com a plataforma de vendas).
8. Área regulada? Qual conselho ou norma de publicidade vale.

## Passo a passo

1. **Confirme datas, fuso e consentimento.** Escreva abertura e fechamento com dia, hora e fuso. Confirme que a lista é de quem consentiu receber e-mails (LGPD). Pronto quando as datas estão escritas com fuso e o consentimento está confirmado ou registrado como pendência.
2. **Monte o esqueleto por fase.** Aquecimento (2 a 4 e-mails), abertura (1 e-mail no horário exato), carrinho aberto (no máximo 1 e-mail por dia, contando véspera e último dia), fechamento (véspera e manhã do último dia). Pronto quando cada e-mail tem data, hora, fase e função de uma linha e nenhum dia do carrinho tem dois e-mails.
3. **Escreva o aquecimento.** Conteúdo útil ligado ao problema que o produto resolve, sem vender ainda, avisando a data de abertura. Pronto quando a data de abertura aparece em todos os e-mails dessa fase.
4. **Escreva a abertura.** O que é, para quem é, o que inclui, preço, prazo com fuso e um único botão. Pronto quando alguém que leu só esse e-mail sabe o que comprar, quanto custa e até quando.
5. **Escreva os dias de carrinho aberto.** Ordene as objeções pela frequência informada. Cada dia livre recebe um e-mail com a objeção seguinte. Se houver mais objeções que dias, as que sobrarem entram juntas num único e-mail de perguntas frequentes. A prova de cada e-mail precisa responder à objeção daquele e-mail; se nenhuma prova real responde, use [DEPOIMENTO REAL] e diga qual depoimento falta. Pronto quando cada objeção está tratada, cada prova está ligada à sua objeção e o limite de um e-mail por dia continua valendo.
6. **Escreva o fechamento.** Véspera e manhã do último dia, citando a hora exata do fim com fuso. O e-mail das últimas 3 horas fica com email-ultima-chance; não escreva os dois para o mesmo horário. Pronto quando nenhuma frase cria urgência que não existe e não há e-mail duplicado com a outra skill.
7. **Retire quem comprou.** Escreva a regra: quem compra sai da sequência no mesmo momento, pela integração ou, se ela não existir, por exclusão manual antes de cada envio. Pronto quando a regra está no topo da saída com o método.
8. **Confira preço e prazo em todos os e-mails.** Compare preço, parcelas, bônus, prazo do bônus e hora de fechamento em cada e-mail com o item 1 a 3 de "O que pedir antes". Pronto quando a tabela de conferência mostra os valores idênticos em todos.
9. **Feche os rodapés e revise.** Todo e-mail com remetente e [LINK DE DESCADASTRO]. Em área regulada, marque [ATENÇÃO] em promessa de resultado. Pronto quando a revisão está anotada.

## Saída

```text
Produto: [NOME] | Preço: [PREÇO REAL]
Carrinho: abre [DATA HORA FUSO] | fecha [DATA HORA FUSO]
Consentimento LGPD: [confirmado | pendente]
Compradores: saem da sequência ao comprar, por [integração | exclusão manual antes de cada envio]
Últimas 3 horas: [com email-ultima-chance | não haverá]

Fase: aquecimento
E-mail 1 | [DATA HORA FUSO]
Função: ...
Objeção tratada e prova ligada: [só na fase de carrinho]
Assunto: ...
Pré-cabeçalho: ...
Corpo:
...
Link: [LINK]
Rodapé: [REMETENTE] | [LINK DE DESCADASTRO]

Fase: abertura
...

Conferência de preço e prazo
| E-mail | Preço | Parcelas | Bônus e prazo | Fechamento |
|---|---|---|---|---|

Marcadores a preencher: [DEPOIMENTO REAL], [NÚMERO REAL], ...
```

## Erros comuns

- Escrever "últimas vagas" sem limite real de vagas. Isso é publicidade enganosa.
- Mandar dois ou mais e-mails no mesmo dia porque havia muitas objeções.
- Fazer todos os e-mails de carrinho aberto repetirem a mesma oferta sem tratar objeção.
- Usar um depoimento que não responde à objeção do e-mail só porque é o único disponível.
- Prometer resultado ("você vai faturar") que o produto não pode garantir.
