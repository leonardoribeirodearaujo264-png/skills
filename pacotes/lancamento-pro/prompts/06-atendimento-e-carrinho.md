# Atendimento nas redes e recuperação de carrinho

Use quando os comentários e as mensagens começarem a chegar, ou quando o checkout tiver gente que abandonou, teve o cartão recusado ou gerou boleto ou Pix sem pagar.

No Claude Code:

```text
Use os agentes atendente-dm-comentarios e recuperador-carrinho no lançamento de [SEU PRODUTO]. Tudo sai como rascunho para eu revisar e enviar.
- atendente-dm-comentarios: classifique os comentários e mensagens em [ARQUIVO OU TEXTO COLADO] e escreva as respostas, incluindo quem diz que está caro e quem pede o link.
- recuperador-carrinho: monte as trilhas de recuperação para [CARRINHO ABANDONADO, CARTÃO RECUSADO, BOLETO OU PIX SEM PAGAMENTO] por [E-MAIL, WHATSAPP COM CONSENTIMENTO].
Preço e parcelas reais: [VALOR E CONDIÇÕES]
Garantia: [DIAS E CONDIÇÃO]
Link do checkout: [URL]
Descontos ou bônus que posso oferecer: [LISTA OU "NENHUM"]
Tom da marca: [COMO VOCÊ FALA COM O CLIENTE]
Separe o que eu preciso decidir pessoalmente, como reembolso ou caso delicado.
Nada é publicado, enviado, comprado ou pago sem o meu OK.
```

No Codex (cite cada agente pelo nome):

```text
Use os agentes atendente-dm-comentarios e recuperador-carrinho no lançamento de [SEU PRODUTO]. O atendente-dm-comentarios escreve rascunhos de resposta para [ARQUIVO OU TEXTO COLADO]. O recuperador-carrinho monta as trilhas para [CARRINHO ABANDONADO, CARTÃO RECUSADO, BOLETO OU PIX].
Preço e parcelas reais: [VALOR E CONDIÇÕES]
Garantia: [DIAS E CONDIÇÃO]
Link do checkout: [URL]
Descontos ou bônus permitidos: [LISTA OU "NENHUM"]
Tudo como rascunho, sem enviar nem programar.
Nada é publicado, enviado, comprado ou pago sem o meu OK.
```
