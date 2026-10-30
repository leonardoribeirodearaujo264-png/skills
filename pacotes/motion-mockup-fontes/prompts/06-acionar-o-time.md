# Acionar o time visual no Claude Code e no Codex

Use quando o pedido tiver mais de uma parte (fontes, mockup e animação) e você quiser que o líder divida o trabalho e só entregue o que passou na revisão.

No Claude Code:

```text
Use o agente lider-visual.
Pedido: lançamento do [NOME DO PRODUTO].
Materiais: print da página em [CAMINHO DO PRINT], cores [CORES DA MARCA], tom [TRÊS PALAVRAS].
Entregas: par de fontes com escala, mockup no notebook em 1080x1350 e 1920x1080 (1x e 2x) e uma animação de entrada da seção principal da página [CAMINHO DA PÁGINA].
Divida entre os especialistas, passe tudo pelo revisor-visual e me entregue a lista de arquivos com o que foi decidido.
```

No Codex (o agente precisa ser citado pelo nome):

```text
lider-visual, coordene este pedido com motion-designer, especialista-em-mockup, tipografo e revisor-visual.
Pedido: lançamento do [NOME DO PRODUTO].
Materiais: print da página em [CAMINHO DO PRINT], cores [CORES DA MARCA], tom [TRÊS PALAVRAS].
Entregas: par de fontes com escala, mockup no notebook em 1080x1350 e 1920x1080 (1x e 2x) e uma animação de entrada da seção principal da página [CAMINHO DA PÁGINA].
Só entregue o que o revisor-visual aprovar.
```
