---
name: encaminhar-lead-checkout
description: Escreve o rascunho da mensagem que leva um lead decidido até o checkout, com o link certo, o produto e o preço que ele vai encontrar na página de pagamento, as formas de pagamento reais e o que acontece depois, além de um rascunho de ajuda para quem travou no pagamento. Nunca envia e nunca pede dado de cartão. Use quando a pessoa já disse que quer comprar e pede o link, ou quando começou a compra e não concluiu.
---

# Encaminhar lead para o checkout

Esta skill cuida do último trecho da conversa: a pessoa já decidiu, falta chegar ao pagamento sem atrito. O resultado é um rascunho curto com o link conferido, o produto e o preço da página, as formas de pagamento disponíveis e o que a pessoa recebe depois. Também cobre quem iniciou e não concluiu. Nada é enviado, e nenhum dado de pagamento passa pela conversa.

## Quando usar

- A pessoa escreveu "quero", "me manda o link", "como pago".
- A pessoa abandonou o checkout e voltou com uma dúvida ou um erro.
- O usuário quer um modelo padrão para a etapa de envio do link.

Se a pessoa ainda está decidindo se o produto serve, use responder-dm-interesse. Se a dúvida for sobre o preço, use tratar-objecao-preco. Para respostas em comentário público, use responder-comentario-padrao.

## O que pedir antes

- O link real do checkout e, se houver, o link com parâmetro de origem (UTM) que o usuário quer usar. Não montar link por conta própria.
- Produto e preço exatos que aparecem na página do checkout.
- Plataforma de pagamento e formas aceitas (Pix, cartão, boleto, parcelas), confirmadas pelo usuário.
- Como a plataforma trata os travamentos: Pix expirado (gera novo código?), cartão recusado, troca de forma de pagamento e reenvio do e-mail de acesso.
- O que acontece depois do pagamento: e-mail de acesso, prazo, onde entrar, quem chamar em caso de problema.
- Garantia e política de reembolso reais.
- Canal de suporte oficial.

## Passo a passo

1. **Confirme a decisão.** Releia a conversa e verifique se a pessoa pediu para comprar. Separe o tipo de dúvida que ainda existir:
   - Dúvida de decisão ("será que serve para mim?", "vale o preço?"): pare e indique responder-dm-interesse ou tratar-objecao-preco.
   - Dúvida de pagamento ou acesso ("dá para parcelar?", "quando recebo?"): siga e responda na própria mensagem com o dado real.
   Pronto quando a decisão está citada com o trecho da pessoa e cada dúvida aberta está classificada.
2. **Confira o link.** Use só o link fornecido pelo usuário. Peça que ele abra o link e confirme que produto e preço são os esperados. WebFetch é opcional: muitos checkouts carregam por JavaScript e não mostram produto nem preço para essa ferramenta. Pronto quando o link tem estado escrito: "conferido pelo usuário", "conferido por WebFetch" ou "não conferido".
3. **Escreva a mensagem de envio.** Agradecimento curto, o link, o produto e o preço que a pessoa verá, as formas de pagamento, o que chega depois do pagamento e onde pedir ajuda. Use o verbo que combina com o negócio: "fazer sua inscrição" para curso ou turma, "finalizar seu pedido" para loja, "contratar" para serviço. Sem novos argumentos de venda. Até 6 linhas. Pronto quando a pessoa consegue concluir sem precisar perguntar mais nada.
4. **Proteja os dados.** A mensagem diz que o pagamento é feito só na página do checkout e que ninguém vai pedir número de cartão, CPF ou senha pela conversa. Pronto quando esse aviso está no rascunho.
5. **Prepare a ajuda para quem travou.** Rascunhos curtos para os casos comuns: Pix expirou, cartão recusado, não recebeu o e-mail de acesso, quer trocar a forma de pagamento. Cada um com o passo concreto que a plataforma permite (entrada sobre travamentos) ou o canal de suporte. Pronto quando os quatro casos têm resposta ou estão marcados como [DADO REAL] a confirmar.
6. **Lembrete de quem abandonou, se pedido.** Uma única mensagem, perguntando se houve problema e oferecendo ajuda, sem cupom inventado e sem prazo falso. Pronto quando há no máximo um lembrete.
7. **Revise e entregue.** Sem escassez falsa, sem desconto não autorizado, sem dado sensível pedido na conversa. Pronto quando a saída está completa e marcada como não enviada.

## Saída

```text
Decisão da pessoa: "[trecho]"
Dúvidas abertas: [nenhuma | pagamento/acesso: respondida na mensagem | decisão: parei e indiquei skill]
Link: [URL fornecida]  |  Estado: conferido pelo usuário | conferido por WebFetch | não conferido

Mensagem de envio
Que bom, [nome]! Aqui está o link para [fazer sua inscrição | finalizar seu pedido | contratar o serviço]: [URL]
Na página você vê [produto] por [preço real].
Dá para pagar com [formas de pagamento reais].
Depois do pagamento, chega um e-mail em [prazo real] com o acesso.
O pagamento é feito só na página; ninguém vai pedir dados do cartão por aqui.
Qualquer dúvida, é só me chamar.

Ajuda para quem travou
- Pix expirou: [rascunho]
- Cartão recusado: [rascunho]
- Não recebeu o acesso: [rascunho]
- Trocar forma de pagamento: [rascunho]

Nada foi enviado. Revise e envie pelo canal.
```

## Erros comuns

- Mandar link de outra turma, de outro produto ou sem conferir.
- Pedir número de cartão, CPF ou senha pela conversa para "adiantar".
- Encher a mensagem com novos argumentos de venda depois que a pessoa já decidiu.
- Parar a conversa por uma dúvida de parcelamento, que se resolve na própria mensagem.
- Prometer um cupom de recuperação que o usuário não criou.
