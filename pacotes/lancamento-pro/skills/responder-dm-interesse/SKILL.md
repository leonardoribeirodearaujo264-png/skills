---
name: responder-dm-interesse
description: Escreve rascunhos de resposta para mensagens diretas de pessoas que mostraram interesse no lançamento, entendendo a situação delas com até duas perguntas e explicando se o produto serve ou não, sem pressão. Nunca envia. Use quando o usuário colar uma conversa de direct, WhatsApp ou e-mail em que a pessoa pergunta "como funciona", "é para mim?" ou pede mais informações.
---

# Responder DM de interesse

Esta skill ajuda a conduzir a primeira conversa privada com quem levantou a mão. O objetivo é entender o caso da pessoa, dizer com honestidade se o produto resolve, e só então apresentar o próximo passo. O resultado é um rascunho de mensagem e, quando a conversa continuar, os próximos rascunhos possíveis. Nada é enviado.

## Quando usar

- A pessoa mandou mensagem depois de um post, comentário ou anúncio.
- A pessoa pergunta se o produto serve para o caso dela.
- A conversa esfriou e o usuário quer um rascunho de retomada respeitoso.

Para respostas públicas em comentários, use responder-comentario-padrao. Se a dúvida principal for o preço, use tratar-objecao-preco. Se a pessoa já disse que quer comprar, use encaminhar-lead-checkout.

## O que pedir antes

- A conversa completa, na ordem, com quem disse o quê.
- Para quem o produto serve e para quem não serve. Esta é a entrada mais importante.
- Fatos da oferta: formato, duração, datas, preço e condições reais. Sem fato, marcar [DADO REAL].
- Canal (direct, WhatsApp, e-mail) e tom da marca.
- Área regulada: limites sobre orientação individual e captação de cliente.

## Passo a passo

1. **Leia a conversa e resuma o caso.** Em uma linha: quem é a pessoa, o que quer e o que já disse. Pronto quando o resumo não contém suposição sem base na conversa.
2. **Decida o que falta saber.** No máximo duas perguntas que mudam a recomendação (por exemplo, momento atual e objetivo). Não pergunte o que a pessoa já respondeu. Pronto quando cada pergunta tem um motivo escrito.
3. **Avalie o encaixe.** Compare o caso com o perfil para quem o produto serve. Três saídas: serve, não serve, falta informação. Se não serve, o rascunho diz isso e, se houver, indica outro caminho. Pronto quando a avaliação está escrita com o motivo.
4. **Escreva o rascunho.** Abertura com o nome e o ponto que a pessoa trouxe, resposta direta à pergunta, as perguntas do passo 2 ou a explicação do produto, e um próximo passo único. Até 5 frases curtas no direct ou WhatsApp. Pronto quando o rascunho responde ao que foi perguntado antes de oferecer qualquer coisa.
5. **Prepare a continuação.** Dois rascunhos curtos: se a pessoa responder que tem interesse e se responder que não é o momento. A segunda opção encerra com cordialidade, sem insistir. Pronto quando as duas continuações estão escritas.
6. **Retomada, se pedida.** Uma única mensagem de retomada, depois de intervalo que o usuário define, lembrando o ponto da conversa e deixando a porta aberta. Sem "última chance". Pronto quando há no máximo uma retomada sugerida.
7. **Revise contra as regras.** Sem urgência ou escassez falsa, sem desconto não autorizado, sem promessa de resultado, sem pedir dado sensível que não seja necessário. Pronto quando cada rascunho passou pela revisão e está marcado como não enviado.

## Saída

```text
Caso: [resumo em uma linha]
Encaixe: [serve | não serve | falta informação] porque [motivo]

Rascunho agora
[mensagem]

Se responder com interesse
[mensagem]

Se disser que não é o momento
[mensagem]

Pendências: [dados reais a confirmar]
Nada foi enviado. Revise e envie pelo canal.
```

## Erros comuns

- Mandar o link de compra na primeira resposta, antes de entender o caso.
- Fazer cinco perguntas de uma vez, como formulário.
- Dizer que serve para todo mundo para não perder a venda.
- Insistir com várias mensagens depois de um "agora não".
- Enviar a mensagem sem aprovação explícita do usuário.
