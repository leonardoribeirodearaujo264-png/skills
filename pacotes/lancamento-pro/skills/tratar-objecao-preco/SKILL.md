---
name: tratar-objecao-preco
description: Identifica o que está por trás de uma objeção de preço ("está caro", "tem desconto?", "não tenho dinheiro agora") e escreve rascunhos de resposta que mostram valor e condições reais, sem inventar desconto, bônus ou prazo. Nunca envia. Use quando um lead, em comentário, direct, WhatsApp ou e-mail, levantar dúvida ou resistência sobre preço, parcelamento ou desconto.
---

# Tratar objeção de preço

Esta skill ajuda a responder quem hesita pelo preço sem baixar o valor por conta própria e sem pressionar. Primeiro ela descobre qual é a objeção de verdade (valor não percebido, comparação, falta de caixa, pedido de desconto), depois escreve a resposta usando só condições que o usuário confirmou. O resultado é o diagnóstico e o rascunho. Nada é enviado.

## Quando usar

- A pessoa disse que está caro ou perguntou por desconto.
- A pessoa comparou com outro produto ou com conteúdo gratuito.
- A pessoa quer, mas diz que não pode pagar agora.

Para dúvidas gerais de quem está conhecendo o produto, use responder-dm-interesse. Para comentários públicos de outros temas, use responder-comentario-padrao. Se depois da conversa a pessoa decidir comprar, use encaminhar-lead-checkout.

## O que pedir antes

- A mensagem da pessoa e o contexto da conversa.
- Preço real, formas de pagamento e parcelamento disponíveis.
- Se existe desconto, cupom, bônus ou condição especial autorizada, com regra e validade. Se o usuário não informar, a resposta não menciona nenhum.
- Garantia real e prazo de reembolso, se houver.
- O que está incluído e o que diferencia o produto, em itens concretos.
- Canal e área regulada, se houver.

## Passo a passo

1. **Classifique a objeção.** Tipos: valor não percebido ("caro pelo que é"), comparação ("tem de graça no YouTube"), falta de caixa ("agora não dá"), pedido de desconto direto, insegurança ("e se não funcionar para mim?"). Pronto quando a objeção tem um tipo e a frase da pessoa que o justifica.
2. **Confira as condições reais.** Liste só o que o usuário confirmou: preço, parcelas, garantia, bônus, cupom. Tudo que não foi confirmado fica de fora. Pronto quando a lista está escrita e não há condição suposta.
3. **Escolha o argumento pelo tipo.**
   - Valor não percebido: o que está incluído, em itens, e o problema que resolve.
   - Comparação: o que o produto faz que o conteúdo solto não faz (ordem, acompanhamento, suporte), sem desmerecer a alternativa.
   - Falta de caixa: parcelamento real, se existir; se não, respeitar e oferecer ficar em contato para a próxima turma, se houver.
   - Pedido de desconto: se não há desconto autorizado, dizer com clareza e gentileza que o preço é o mesmo para todos.
   - Insegurança: garantia real e para quem o produto não serve.
   Pronto quando há um argumento principal e no máximo um de apoio.
4. **Escreva o rascunho.** Reconheça a objeção sem julgar, responda com o argumento, cite a condição real e deixe a decisão com a pessoa. Até 6 frases curtas. Pronto quando o rascunho não contém desconto, bônus ou prazo que não esteja na lista do passo 2.
5. **Escreva a saída honrosa.** Um rascunho para quando a pessoa disser que mesmo assim não vai comprar, agradecendo e encerrando sem insistir. Pronto quando a saída honrosa está escrita.
6. **Revise contra as regras.** Sem "só hoje", "últimas vagas" ou cronômetro se não houver limite real; sem comparar preço com gasto do dia a dia de forma que constranja; sem promessa de retorno financeiro; em áreas reguladas, conferir regra sobre preço e honorários. Pronto quando cada rascunho passou pela revisão.

## Saída

```text
Objeção: [tipo] | Frase da pessoa: "[trecho]"
Condições confirmadas: [preço, parcelas, garantia, bônus ou "nenhuma além do preço"]

Rascunho
[mensagem]

Se ainda assim recusar
[mensagem]

Não mencionado por falta de confirmação: [desconto, cupom, bônus etc.]
Nada foi enviado. Revise e envie pelo canal.
```

## Erros comuns

- Oferecer desconto ou bônus que o usuário nunca autorizou para "salvar" a venda.
- Criar prazo falso para forçar decisão.
- Responder "caro" com textão defensivo sobre o próprio valor.
- Diminuir a alternativa gratuita ou o concorrente.
- Prometer retorno do investimento em número.
