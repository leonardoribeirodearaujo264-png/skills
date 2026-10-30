---
name: sequencia-pos-venda
description: Escreve a sequência de e-mails que o cliente recebe depois da compra aprovada, do acesso ao produto ao primeiro resultado, ao pedido de depoimento e à próxima oferta. Use quando o pagamento foi confirmado e o usuário precisa dos e-mails para o cliente começar a usar o que comprou, prontos para colar na ferramenta de e-mail.
---

# Sequência pós-venda

Sequência para quem acabou de comprar. O foco é fazer a pessoa acessar, usar e ter uma primeira vitória, antes de qualquer nova venda. O resultado são de 4 a 6 e-mails com dia contado a partir da compra, tipo (transacional ou marketing), função, assunto, pré-cabeçalho e corpo. A skill não envia e-mail e não libera acesso.

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
4. Política de garantia ou reembolso, com prazo em dias contados a partir da compra.
5. Se haverá pedido de depoimento e se há próximo produto para oferecer, com preço real.
6. Que evento a ferramenta registra como uso (primeira aula assistida, primeiro login, primeiro cadastro feito). Ele dispara a oferta.
7. Se a ferramenta marca quem pediu reembolso, para excluir dos e-mails 5 e 6.
8. Se o e-mail de acesso já sai pela plataforma de pagamento (para não duplicar) e a identificação do remetente (nome ou razão social).

## Passo a passo

1. **Separe transacional de marketing.** E-mails 1 a 4 (acesso, primeiro passo, checagem e garantia) são transacionais: tratam da compra feita e vão para todo comprador, com ou sem consentimento de marketing. E-mails 5 e 6 (depoimento e oferta) são marketing e só vão para quem consentiu (LGPD), com [LINK DE DESCADASTRO]. Pronto quando cada e-mail está marcado com o tipo.
2. **E-mail 1, imediato: acesso.** Como entrar, em passos numerados, o que fazer se não conseguir e o suporte. Se a plataforma já envia acesso, escreva este como complemento, sem repetir credenciais. Pronto quando alguém sem experiência consegue entrar só lendo o e-mail.
3. **E-mail 2, 1 dia após a compra: primeiro passo.** Uma única tarefa pequena que gera resultado rápido no produto. Pronto quando a tarefa leva poucos minutos e está descrita em passos.
4. **E-mail 3, 3 dias após a compra: checagem.** Pergunte como foi e convide a responder o e-mail com dúvidas. Se o prazo de garantia for curto e o e-mail 4 cair antes, envie o e-mail 3 junto do 2 ou corte-o. Pronto quando há uma pergunta direta, o caminho de resposta e o dia não colide com o e-mail 4.
5. **E-mail 4, prazo da garantia menos 2 dias: garantia.** Lembre com clareza o prazo e como usá-la. Compra pela internet tem direito de arrependimento de 7 dias (Código de Defesa do Consumidor, art. 49); se a garantia informada for menor que 7 dias, marque [ATENÇÃO] e peça ao usuário que confirme com o jurídico antes de enviar. Pronto quando o prazo, o dia de envio e o caminho do reembolso estão escritos sem rodeio.
6. **E-mail 5, opcional: depoimento.** Envie depois do fim da garantia e só para quem não pediu reembolso. Peça relato com perguntas simples e autorização expressa para publicar nome e texto. Pronto quando a exclusão de reembolso e o pedido de autorização estão escritos.
7. **E-mail 6, opcional: próxima oferta.** Disparado pelo evento de uso informado no item 6, nunca por data fixa, e só para quem não pediu reembolso. Só com produto e preço reais. Sem evento de uso disponível, marque [EVENTO DE USO] e não sugira data. Pronto quando a oferta tem gatilho, exclusão e ligação clara com o que a pessoa comprou.

## Saída

```text
Produto: [NOME] | Acesso: [COMO]
Garantia: [PRAZO REAL] dias | Arrependimento de 7 dias respeitado: [sim | ATENÇÃO]
Exclusão: quem pediu reembolso não recebe os e-mails 5 e 6

E-mail 1 | imediato | transacional
Função: acesso
Assunto: ...
Pré-cabeçalho: ...
Corpo:
...
Suporte: [CANAL]
Remetente: [NOME OU RAZÃO SOCIAL]

E-mail 4 | [PRAZO - 2] dias após a compra | transacional
...

E-mail 5 | [N] dias após a compra | marketing (só para quem consentiu)
...
E-mail 6 | gatilho: [EVENTO DE USO] | marketing (só para quem consentiu)
...
Rodapé: [REMETENTE] | [LINK DE DESCADASTRO]
```

## Erros comuns

- Oferecer outro produto no dia seguinte à compra, antes de o cliente usar o primeiro.
- Marcar o e-mail de garantia como marketing e tirar do cliente a informação de reembolso.
- Repetir no e-mail login e senha que a plataforma já enviou.
- Esconder a garantia na esperança de que o prazo passe.
- Publicar depoimento sem autorização expressa do cliente.
