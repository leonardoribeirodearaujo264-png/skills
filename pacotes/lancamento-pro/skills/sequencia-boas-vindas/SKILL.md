---
name: sequencia-boas-vindas
description: Escreve a sequência de 3 a 5 e-mails que um novo inscrito recebe logo depois de entrar na lista, entregando o que foi prometido e apresentando quem escreve. Use quando alguém acabou de entrar na lista (isca digital, cadastro, aula gratuita) e o usuário precisa dos primeiros e-mails prontos para colar na ferramenta de e-mail.
---

# Sequência de boas-vindas

Sequência curta para os primeiros dias de um inscrito novo. O resultado é um conjunto de 3 a 5 e-mails com assunto, pré-cabeçalho, corpo e dia de envio, prontos para o usuário colar na ferramenta de e-mail que já usa. A skill não envia nada e não acessa a ferramenta.

## Quando usar

- A pessoa acabou de se inscrever e ainda não recebeu nada além da confirmação.
- O usuário oferece uma isca digital (PDF, aula, checklist) e precisa entregá-la bem.
- A lista existe, mas os novos inscritos esfriam porque ninguém fala com eles.

Use outra skill quando for o caso:
- Para os e-mails que abrem e fecham um carrinho de vendas, use sequencia-lancamento.
- Para quem já comprou, use sequencia-pos-venda.
- Para decidir datas e horários de vários fluxos juntos, use cronograma-envios.
- Para trabalhar só a linha de assunto, use assunto-alta-abertura.

## O que pedir antes

1. O que a pessoa recebeu ao se inscrever (nome da isca, formato, link de acesso).
2. Quem assina os e-mails e uma frase sobre essa pessoa ou empresa.
3. Público em uma linha: quem é e qual problema quer resolver.
4. O próximo passo desejado depois da sequência (assistir a uma aula, responder o e-mail, conhecer um produto).
5. Tom de voz: formal, próximo ou técnico. Se houver textos antigos, peça um de exemplo.
6. Área regulada (saúde, direito, finanças)? Se sim, qual conselho ou norma se aplica.

Se faltar o item 1 ou 2, pergunte antes de escrever. Os demais podem ter padrão sugerido e marcado como suposição.

## Passo a passo

1. **Confirme o consentimento.** Pergunte se os inscritos marcaram aceite para receber e-mails (LGPD). Se a resposta for não ou "não sei", avise que só se deve enviar para quem consentiu e siga escrevendo, com a pendência registrada no topo da saída. Pronto quando o status do consentimento está escrito.
2. **Defina a função de cada e-mail.** Distribua as funções: entrega, apresentação, primeira ajuda prática, prova ou história, convite ao próximo passo. Use de 3 a 5 e-mails; menos é melhor que encher. Pronto quando cada e-mail tem uma função de uma linha e um único pedido de ação.
3. **Escreva o e-mail 1 para sair na hora.** Ele entrega o prometido no começo do texto, com o link visível, e diz o que vem nos próximos dias. Pronto quando o link de entrega aparece nas três primeiras linhas.
4. **Escreva os demais.** Parágrafos de até três linhas, uma ideia por e-mail, um único link de ação. Depoimento, número ou caso só se o usuário forneceu; senão use [DEPOIMENTO REAL] ou [NÚMERO REAL]. Pronto quando nenhum e-mail tem dois pedidos de ação diferentes.
5. **Escreva assunto e pré-cabeçalho.** Assunto com até 50 caracteres, sem caixa alta inteira e sem promessa que o e-mail não cumpre. Pronto quando cada e-mail tem os dois campos.
6. **Feche o rodapé.** Todo e-mail termina com identificação do remetente e [LINK DE DESCADASTRO] visível. Pronto quando os rodapés estão completos.
7. **Revise área regulada.** Em saúde, direito ou finanças, marque com [ATENÇÃO] qualquer trecho que pareça promessa de resultado ou captação indevida. Pronto quando a revisão foi feita ou marcada como não aplicável.

## Saída

```text
Consentimento LGPD: [confirmado | pendente: só enviar para quem consentiu]
Gatilho: inscrição em [ISCA]
Próximo passo ao final: [AÇÃO]

E-mail 1 | Envio: imediato
Função: entrega
Assunto: ...
Pré-cabeçalho: ...
Corpo:
...
Link de ação: [LINK]
Rodapé: [REMETENTE] | [LINK DE DESCADASTRO]

E-mail 2 | Envio: dia 1
...

Suposições feitas: ...
```

## Erros comuns

- Esconder o link da isca no fim do primeiro e-mail. A pessoa abriu para pegar o material.
- Vender no e-mail 1. A confiança ainda não existe; o convite comercial vem por último.
- Colocar três links diferentes num mesmo e-mail e diluir a ação.
- Inventar depoimento para "dar prova". Use o marcador e peça o real.
- Esquecer o descadastro ou enviar para lista comprada. Fere a LGPD e derruba a entrega.
