# Respostas e perguntas frequentes com o time de atendimento

Use quando precisar responder clientes, tratar reclamações ou montar perguntas frequentes.

Claude Code (o agente é chamado pela conversa principal):

```text
Use o agente lider-atendimento para cuidar deste pedido de atendimento. Ele monta o plano e diz o que cada especialista faz. Chame redator-atendimento e analista-atendimento conforme o plano, passe tudo pelo revisor-atendimento e só me mostre o que ele aprovar. Nada é publicado, enviado, comprado ou pago sem o meu OK.

Pedido: responder estas mensagens de clientes e montar as perguntas frequentes. Mensagens: [COLE AQUI OU INDIQUE O ARQUIVO]. Nossa política de troca, prazo e reembolso: [POLÍTICA]. Tom da marca: [TOM].
```

Codex (cite cada agente pelo nome):

```text
Use os agentes lider-atendimento, redator-atendimento, analista-atendimento e revisor-atendimento. O lider-atendimento monta o plano, o redator-atendimento e o analista-atendimento executam a parte de cada um, e o revisor-atendimento confere tudo antes de me entregar. Nada é publicado, enviado, comprado ou pago sem o meu OK.

Pedido: responder estas mensagens de clientes e montar as perguntas frequentes. Mensagens: [COLE AQUI OU INDIQUE O ARQUIVO]. Nossa política de troca, prazo e reembolso: [POLÍTICA]. Tom da marca: [TOM].
```
