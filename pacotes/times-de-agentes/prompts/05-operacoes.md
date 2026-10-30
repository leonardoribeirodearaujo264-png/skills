# Processo e rotina com o time de operações

Use quando precisar mapear um processo, criar checklist ou planejar estoque e agenda.

Claude Code (o agente é chamado pela conversa principal):

```text
Use o agente lider-operacoes para cuidar deste pedido de operações. Ele monta o plano e diz o que cada especialista faz. Chame mapeador-operacoes e planejador-operacoes conforme o plano, passe tudo pelo revisor-operacoes e só me mostre o que ele aprovar. Nada é publicado, enviado, comprado ou pago sem o meu OK.

Pedido: organizar o processo de [PROCESSO, EX.: ENTREGA DE PEDIDOS]. Hoje funciona assim: [COMO É HOJE]. Quem executa: [EQUIPE]. Onde trava: [PROBLEMA]. Quero o processo novo, o checklist e o plano da semana.
```

Codex (cite cada agente pelo nome):

```text
Use os agentes lider-operacoes, mapeador-operacoes, planejador-operacoes e revisor-operacoes. O lider-operacoes monta o plano, o mapeador-operacoes e o planejador-operacoes executam a parte de cada um, e o revisor-operacoes confere tudo antes de me entregar. Nada é publicado, enviado, comprado ou pago sem o meu OK.

Pedido: organizar o processo de [PROCESSO, EX.: ENTREGA DE PEDIDOS]. Hoje funciona assim: [COMO É HOJE]. Quem executa: [EQUIPE]. Onde trava: [PROBLEMA]. Quero o processo novo, o checklist e o plano da semana.
```
