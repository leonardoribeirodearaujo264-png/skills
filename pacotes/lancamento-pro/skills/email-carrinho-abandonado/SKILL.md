---
name: email-carrinho-abandonado
description: Escreve de 1 a 3 e-mails para quem iniciou a compra e não concluiu, ajudando a pessoa a terminar ou a tirar a dúvida que a travou, com variação para pagamento pendente (Pix expirado, boleto não pago, cartão recusado). Use quando a plataforma de pagamento ou de e-mail registra checkout iniciado sem pagamento e o usuário precisa do texto dessa recuperação.
---

# E-mail de carrinho abandonado

Recuperação de quem chegou ao checkout e parou. O resultado são de 1 a 3 e-mails com tempo de envio após o abandono, assunto, pré-cabeçalho e corpo, e, se o caso existir, uma variação para pagamento pendente. Tudo pronto para o usuário colar na automação da ferramenta dele, já com as variáveis na sintaxe dela. A skill não dispara e-mail nem configura a automação.

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

1. Produto, preço e link direto para retomar o checkout (não a página de vendas).
2. Formas de pagamento aceitas e se há parcelamento.
3. Como a ferramenta identifica o abandono e quais variáveis ela permite usar no texto, com a sintaxe exata (nome, produto, link de retomada).
4. Se a ferramenta separa pagamento pendente (Pix gerado e não pago, boleto emitido, cartão recusado) do abandono, e como gera novo Pix ou segunda via de boleto.
5. Se o checkout informa comunicação sobre a compra e se há aceite de marketing, e se a ferramenta separa quem aceitou.
6. Canal de suporte real: e-mail ou WhatsApp de atendimento.
7. Garantia ou política de reembolso, se existir.
8. Prazo de oferta, só se for real.

## Passo a passo

1. **Confirme a base legal.** A pessoa digitou o e-mail no checkout. Com aceite de marketing, o e-mail pode trazer conteúdo da oferta; sem aceite, limite o texto a lembrete da compra iniciada, sem conteúdo promocional extra (LGPD). Se a lista mistura quem aceitou e quem não aceitou e a ferramenta não separa, use o enquadramento mais restrito para todos. Pronto quando o enquadramento está escrito.
2. **Defina os tempos.** Padrão sugerido: 1 hora, 24 horas e 48 a 72 horas após o abandono. Ajuste ao que o usuário pedir. Pronto quando cada e-mail tem tempo e função.
3. **E-mail 1: lembrete simples.** Nome do produto, link de retomada do checkout e oferta de ajuda com o canal de suporte. Sem desconto. Pronto quando o link de retomada aparece nas três primeiras linhas e leva ao checkout, não à página de vendas.
4. **E-mail 2: tratar a dúvida provável.** Escolha a objeção mais comum (preço, forma de pagamento, "serve para mim?") e responda com fato real. Se houver garantia, explique em uma frase. Tom de ajuda, nunca de cobrança ("você esqueceu algo!"). Pronto quando o e-mail responde uma objeção nomeada.
5. **E-mail 3, opcional: último lembrete.** Só cite prazo se o prazo for real. Se não houver, encerre dizendo que o link continua disponível. Nunca escreva que o carrinho expira se ele não expira. Pronto quando nenhuma frase inventa escassez.
6. **Variação para pagamento pendente, se a ferramenta separar esse gatilho.** Um e-mail curto por caso, enviado no lugar do e-mail 1:
   - Pix expirado: diga que o código venceu e dê o link para gerar um novo.
   - Boleto não pago: link da segunda via e vencimento real informado pelo usuário.
   - Cartão recusado: sugira conferir os dados ou usar outra forma de pagamento na própria página, sem pedir dado de cartão por e-mail.
   Use só o comportamento que o usuário confirmou na entrada 4; o que faltar fica [DADO REAL]. Pronto quando cada caso pendente tem texto ou está marcado como não aplicável.
7. **Pare quem comprou.** Escreva na saída a regra de saída da automação: quem pagar sai do fluxo antes do próximo envio. Pronto quando a regra está escrita.
8. **Feche os rodapés e as variáveis.** Remetente identificado e link de descadastro. No enquadramento só de comunicação da compra, o descadastro é boa prática, não exigência; com aceite de marketing, é obrigatório. Escreva nome, produto e links na sintaxe de variável informada na entrada 3; colchetes ficam só para o que o usuário ainda precisa preencher. Pronto quando todos os e-mails têm rodapé e nenhuma variável está em sintaxe inventada.

## Saída

```text
Gatilho: checkout iniciado sem pagamento em [PRODUTO]
Regra de saída: quem pagar sai do fluxo imediatamente
Base LGPD: [aceite de marketing | só comunicação da compra | lista mista: enquadramento restrito]
Sintaxe de variável da ferramenta: [ex. informado pelo usuário]

E-mail 1 | 1 h após o abandono
Função: lembrete
Assunto: ...
Pré-cabeçalho: ...
Corpo:
Oi, [variável de nome]. ...
Link: [variável do link de retomada]
Rodapé: [REMETENTE] | [SUPORTE] | [descadastro: obrigatório | boa prática]

E-mail 2 | 24 h
...

Pagamento pendente (se a ferramenta separar)
- Pix expirado | Assunto: ... | Corpo: ...
- Boleto não pago | Assunto: ... | Corpo: ...
- Cartão recusado | Assunto: ... | Corpo: ...
```

## Erros comuns

- Mandar desconto no primeiro e-mail. Ensina a lista a abandonar para ganhar desconto.
- Tom de cobrança ("você esqueceu algo!") em vez de oferta de ajuda.
- Esquecer a regra de saída e cobrar quem já pagou.
- Link que leva à página de vendas, e não ao checkout preenchido.
- Escrever "seu carrinho vai expirar" quando ele não expira.
