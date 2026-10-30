---
name: sequencia-pos-venda
description: Escreve a sequência de e-mails que o cliente recebe depois da compra aprovada, do acesso ao produto ao primeiro resultado, ao pedido de depoimento e à próxima oferta. Use quando o pagamento foi confirmado e o usuário precisa dos e-mails para o cliente começar a usar o que comprou, prontos para colar na ferramenta de e-mail.
---

# Sequência pós-venda

Sequência para quem acabou de comprar. O foco é fazer a pessoa acessar, usar e ter uma primeira vitória, antes de qualquer nova venda. O resultado são de 4 a 6 e-mails com dia, função, assunto, pré-cabeçalho e corpo. A skill não envia e-mail e não libera acesso.

## Quando usar

- A compra foi aprovada e o cliente precisa de acesso e orientação.
- Clientes compram e não usam, ou pedem reembolso por não saberem começar.
- O usuário quer pedir depoimento ou oferecer o próximo produto no momento certo.

Use outra skill quando for o caso:
- Cliente pediu reembolso ou está insatisfeito: email-reembolso.
- Pessoa iniciou a compra e não pagou: email-carrinho-abandonado.
- Inscrito sem compra: sequencia-boas-vindas.
- Calendário junto com outros fluxos: cronograma-envios.

## O que pedir antes

1. Produto comprado, como se acessa (link, login, aplicativo) e quanto tempo leva para liberar.
2. Primeiro passo concreto que o cliente deve dar no produto.
3. Canal de suporte real e horário de atendimento.
4. Política de garantia ou reembolso, com prazo.
5. Se haverá pedido de depoimento e se há próximo produto para oferecer, com preço real.
6. Se o e-mail de acesso já sai pela plataforma de pagamento (para não duplicar).

## Passo a passo

1. **Separe transacional de marketing.** O e-mail de acesso é comunicação da compra. Pedido de depoimento e oferta nova são marketing e só vão para quem consentiu (LGPD), com [LINK DE DESCADASTRO]. Pronto quando cada e-mail está marcado como transacional ou marketing.
2. **E-mail 1, imediato: acesso.** Como entrar, em passos numerados, o que fazer se não conseguir e o suporte. Se a plataforma já envia acesso, escreva este como complemento, sem repetir credenciais. Pronto quando alguém sem experiência consegue entrar só lendo o e-mail.
3. **E-mail 2, dia 1 ou 2: primeiro passo.** Uma única tarefa pequena que gera resultado rápido no produto. Pronto quando a tarefa leva poucos minutos e está descrita em passos.
4. **E-mail 3: checagem.** Pergunte como foi e convide a responder o e-mail com dúvidas. Pronto quando há uma pergunta direta e o caminho de resposta.
5. **E-mail 4: garantia, antes de vencer.** Lembre com clareza o prazo de garantia e como usá-la. Isso gera confiança e reduz disputa com a operadora do cartão. Pronto quando o prazo e o caminho do reembolso estão escritos sem rodeio.
6. **E-mail 5, opcional: depoimento.** Peça relato com perguntas simples e peça autorização expressa para publicar nome e texto. Pronto quando o pedido de autorização está no texto.
7. **E-mail 6, opcional: próxima oferta.** Só depois do uso e só com produto e preço reais. Pronto quando a oferta tem ligação clara com o que a pessoa comprou.

## Saída

```text
Produto: [NOME] | Acesso: [COMO]
Garantia: [PRAZO REAL]

E-mail 1 | imediato | transacional
Função: acesso
Assunto: ...
Pré-cabeçalho: ...
Corpo:
...
Suporte: [CANAL]

E-mail 5 | dia [N] | marketing (só para quem consentiu)
...
Rodapé: [REMETENTE] | [LINK DE DESCADASTRO]
```

## Erros comuns

- Oferecer outro produto no dia seguinte à compra, antes de o cliente usar o primeiro.
- Repetir no e-mail login e senha que a plataforma já enviou.
- Esconder a garantia na esperança de que o prazo passe.
- Publicar depoimento sem autorização expressa do cliente.
- Enviar pedido de depoimento para quem pediu reembolso.
