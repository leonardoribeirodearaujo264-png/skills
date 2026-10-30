---
name: email-carrinho-abandonado
description: Escreve de 1 a 3 e-mails para quem iniciou a compra e não concluiu, ajudando a pessoa a terminar ou a tirar a dúvida que a travou. Use quando a plataforma de pagamento ou de e-mail registra checkout iniciado sem pagamento e o usuário precisa do texto dessa recuperação.
---

# E-mail de carrinho abandonado

Recuperação de quem chegou ao checkout e parou. O resultado são de 1 a 3 e-mails com tempo de envio após o abandono, assunto, pré-cabeçalho e corpo, para o usuário colar na automação da ferramenta dele. A skill não dispara e-mail nem configura a automação.

## Quando usar

- A ferramenta registra checkout iniciado sem compra concluída.
- O usuário quer lembrar a pessoa de forma útil, sem pressionar.
- Há suspeita de problema no pagamento (boleto não pago, cartão recusado, Pix expirado).

Use outra skill quando for o caso:
- Para a sequência inteira do período de vendas, use sequencia-lancamento.
- Para o aviso de fim de prazo real enviado a toda a lista, use email-ultima-chance.
- Para quem já pagou, use sequencia-pos-venda.
- Para definir horários junto com outros fluxos, use cronograma-envios.

## O que pedir antes

1. Produto, preço e link direto para retomar o checkout.
2. Formas de pagamento aceitas e se há parcelamento.
3. Como a ferramenta identifica o abandono e quais dados ela permite usar no texto (nome, produto).
4. Canal de suporte real: e-mail ou WhatsApp de atendimento.
5. Garantia ou política de reembolso, se existir.
6. Prazo de oferta, só se for real.

## Passo a passo

1. **Confirme a base legal.** A pessoa digitou o e-mail no checkout. Pergunte se o checkout informa que ela pode receber comunicação sobre a compra e se há aceite para marketing (LGPD). Sem isso, limite o texto a lembrete da compra iniciada, sem conteúdo promocional extra. Pronto quando o enquadramento está escrito.
2. **Defina os tempos.** Padrão sugerido: 1 hora, 24 horas e 48 a 72 horas após o abandono. Ajuste ao que o usuário pedir. Pronto quando cada e-mail tem tempo e função.
3. **E-mail 1: lembrete simples.** Nome do produto, link para retomar e oferta de ajuda com o canal de suporte. Sem desconto. Pronto quando o link de retomada aparece nas três primeiras linhas.
4. **E-mail 2: tratar a dúvida provável.** Escolha a objeção mais comum (preço, forma de pagamento, "serve para mim?") e responda com fato real. Se houver garantia, explique em uma frase. Pronto quando o e-mail responde uma objeção nomeada.
5. **E-mail 3, opcional: último lembrete.** Só cite prazo se o prazo for real. Se não houver, encerre dizendo que o link continua disponível. Pronto quando nenhuma frase inventa escassez.
6. **Pare quem comprou.** Escreva na saída a regra de saída da automação: quem pagar sai do fluxo antes do próximo envio. Pronto quando a regra está escrita.
7. **Feche os rodapés.** Remetente identificado e [LINK DE DESCADASTRO]. Pronto quando todos os e-mails têm rodapé.

## Saída

```text
Gatilho: checkout iniciado sem pagamento em [PRODUTO]
Regra de saída: quem pagar sai do fluxo imediatamente
Base LGPD: [aceite de marketing | só comunicação da compra]

E-mail 1 | 1 h após o abandono
Função: lembrete
Assunto: ...
Pré-cabeçalho: ...
Corpo:
Oi, [NOME]. ...
Link: [LINK DO CHECKOUT]
Rodapé: [REMETENTE] | [SUPORTE] | [LINK DE DESCADASTRO]

E-mail 2 | 24 h
...
```

## Erros comuns

- Mandar desconto no primeiro e-mail. Ensina a lista a abandonar para ganhar desconto.
- Tom de cobrança ("você esqueceu algo!") em vez de oferta de ajuda.
- Esquecer a regra de saída e cobrar quem já pagou.
- Link que leva à página de vendas, e não ao checkout preenchido.
- Escrever "seu carrinho vai expirar" quando ele não expira.
