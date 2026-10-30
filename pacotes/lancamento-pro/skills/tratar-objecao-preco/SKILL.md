---
name: tratar-objecao-preco
description: Identifica o que está por trás de uma objeção de preço ("está caro", "tem desconto?", "não tenho dinheiro agora") e escreve rascunhos de resposta para a conversa privada que mostram valor e condições reais, sem inventar desconto, bônus ou prazo. Nunca envia e nunca escreve preço em comentário público. Use quando um lead, em direct, WhatsApp ou e-mail, levantar dúvida ou resistência sobre preço, parcelamento ou desconto, inclusive depois de ter perguntado em um comentário.
---

# Tratar objeção de preço

Esta skill ajuda a responder quem hesita pelo preço sem baixar o valor por conta própria e sem pressionar. Primeiro ela descobre qual é a objeção de verdade (valor não percebido, comparação, falta de caixa, pedido de desconto, insegurança), depois escreve a resposta usando só condições que o usuário confirmou. O resultado é o diagnóstico e o rascunho para a conversa privada. Nada é enviado.

## Quando usar

- A pessoa disse que está caro ou perguntou por desconto.
- A pessoa comparou com outro produto ou com conteúdo gratuito.
- A pessoa quer, mas diz que não pode pagar agora.

A resposta pública a um comentário sobre preço é sempre escrita com responder-comentario-padrao e se limita a convidar para a conversa privada. Esta skill escreve o que vai dentro dessa conversa. Para dúvidas gerais de quem está conhecendo o produto, use responder-dm-interesse. Se a pessoa decidir comprar, use encaminhar-lead-checkout.

## O que pedir antes

- A mensagem da pessoa, o contexto da conversa e o canal onde ela está.
- Preço real, formas de pagamento e parcelamento disponíveis.
- Se existe desconto, cupom, bônus ou condição especial autorizada, com regra e validade. Se o usuário não informar, a resposta não menciona nenhum.
- Garantia real e prazo de reembolso, se houver.
- Se haverá próxima turma ou nova abertura, e a data. Sem data confirmada, a resposta não promete próxima turma.
- O que está incluído e o que diferencia o produto, em itens concretos.
- Área regulada, se houver.

## Passo a passo

1. **Confira o canal.** Se a objeção veio em comentário público, não escreva preço ali: o rascunho público é só o convite da responder-comentario-padrao ("Vou te chamar no direct para te passar valores e condições"), e o rascunho desta skill é a mensagem privada que o usuário envia depois. Pronto quando o canal de cada rascunho está escrito e nenhum rascunho com preço tem canal público.
2. **Classifique a objeção.** Tipos: valor não percebido ("caro pelo que é"), comparação ("tem de graça no YouTube"), falta de caixa ("agora não dá"), pedido de desconto direto, insegurança ("e se não funcionar para mim?"). Se a mensagem mistura tipos, o principal é o da pergunta explícita da pessoa; os outros entram como apoio. Sem pergunta explícita, o principal é o que aparece primeiro. Pronto quando há um tipo principal, no máximo um de apoio e a frase da pessoa que justifica cada um.
3. **Confira as condições reais.** Liste só o que o usuário confirmou: preço, parcelas, garantia, bônus, cupom, próxima turma. Tudo que não foi confirmado fica de fora. Pronto quando a lista está escrita e não há condição suposta.
4. **Escolha o argumento pelo tipo principal.**
   - Valor não percebido: o que está incluído, em itens, e o problema que resolve.
   - Comparação: o que o produto faz que o conteúdo solto não faz (ordem, acompanhamento, suporte), sem desmerecer a alternativa.
   - Falta de caixa: parcelamento real, se existir; se não, respeitar e oferecer contato na próxima turma só se a data foi confirmada.
   - Pedido de desconto: se não há desconto autorizado, dizer com clareza e gentileza que o preço é o mesmo para todos.
   - Insegurança: garantia real e para quem o produto não serve.
   Pronto quando há um argumento principal e no máximo um de apoio.
5. **Escreva o rascunho.** Reconheça a objeção sem julgar, responda com o argumento, cite a condição real e deixe a decisão com a pessoa. Até 6 frases, cada uma com no máximo 25 palavras. Pronto quando o rascunho respeita os limites e não contém desconto, bônus ou prazo fora da lista do passo 3.
6. **Escreva a saída honrosa.** Um rascunho para quando a pessoa disser que mesmo assim não vai comprar, agradecendo e encerrando sem insistir. Pronto quando a saída honrosa está escrita.
7. **Revise contra as regras.** Sem "só hoje", "últimas vagas" ou cronômetro se não houver limite real; sem comparar preço com gasto do dia a dia de forma que constranja; sem promessa de retorno financeiro; nenhum rascunho afirma ação que não aconteceu ("vou te mandar", não "te mandei"); em áreas reguladas, conferir regra sobre preço e honorários. Pronto quando cada rascunho passou pela revisão.

## Saída

```text
Canal: [direct | WhatsApp | e-mail] (veio de comentário: [sim | não])
Objeção principal: [tipo] | Frase da pessoa: "[trecho]"
Objeção de apoio: [tipo e trecho | nenhuma]
Condições confirmadas: [preço, parcelas, garantia, bônus, próxima turma ou "nenhuma além do preço"]

Resposta pública (só se veio de comentário)
Use o convite de preço da responder-comentario-padrao, sem valor.

Rascunho privado
[mensagem]

Se ainda assim recusar
[mensagem]

Não mencionado por falta de confirmação: [desconto, cupom, bônus, próxima turma etc.]
Nada foi enviado. Revise e envie pelo canal.
```

## Erros comuns

- Oferecer desconto ou bônus que o usuário nunca autorizou para "salvar" a venda.
- Responder preço no comentário público em vez de levar para a conversa privada.
- Criar prazo falso ou prometer próxima turma sem data confirmada.
- Responder "caro" com textão defensivo sobre o próprio valor.
- Diminuir a alternativa gratuita ou o concorrente.
