# Pedido ao diretor-geral

Use quando não souber qual time resolve, ou quando o pedido envolve mais de uma área.

Claude Code (o agente é chamado pela conversa principal):

```text
Use o agente diretor-geral para este pedido. Ele escolhe o time, escreve o briefing de cada líder e diz a ordem. Siga essa ordem: chame cada líder, os especialistas que o líder indicar e o revisor do time. Depois volte ao diretor-geral para conferir a entrega contra o meu pedido. Nada é publicado, enviado, comprado ou pago sem o meu OK.

Minha empresa: [O QUE VOCÊ VENDE E PARA QUEM]
Pedido: [O QUE VOCÊ QUER, EX.: LANÇAR UM PRODUTO NOVO EM 30 DIAS]
Dados que já tenho: [PREÇO, CUSTOS, PÚBLICO, PRAZOS]
```

Codex (cite cada agente pelo nome):

```text
Use o agente diretor-geral para escolher o time e escrever os briefings. Depois use os agentes do time escolhido, citando cada um pelo nome: o líder (lider-marketing, lider-vendas, lider-financeiro, lider-atendimento, lider-operacoes ou lider-conteudo), os especialistas que ele indicar e o revisor do time. No fim, use o diretor-geral de novo para conferir a entrega contra o meu pedido. Nada é publicado, enviado, comprado ou pago sem o meu OK.

Minha empresa: [O QUE VOCÊ VENDE E PARA QUEM]
Pedido: [O QUE VOCÊ QUER, EX.: LANÇAR UM PRODUTO NOVO EM 30 DIAS]
Dados que já tenho: [PREÇO, CUSTOS, PÚBLICO, PRAZOS]
```
