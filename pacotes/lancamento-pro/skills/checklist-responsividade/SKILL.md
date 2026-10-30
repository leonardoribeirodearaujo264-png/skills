---
name: checklist-responsividade
description: Confere uma página de lançamento nas larguras 360, 390, 430, 768 e 1280 px, procurando rolagem horizontal, alvos de toque menores que 44 px, contraste abaixo do nível AA e blocos que quebram. Use quando a página já estiver montada e o usuário quiser saber se ela funciona no celular, no tablet e no desktop antes de divulgar.
---

# Checklist de responsividade

Esta skill verifica se uma página continua legível e clicável em cinco larguras de tela. O resultado é uma tabela por largura e uma lista de correções com o seletor ou a linha do arquivo, ordenada do que impede o uso para o que é só acabamento.

## Quando usar

- A página de vendas, de captura ou de obrigado está pronta e vai receber tráfego.
- Alguém reclamou que "no celular fica estranho" e é preciso localizar o problema.
- Depois de trocar layout, fonte ou imagem principal.

Para montar a estrutura e o texto da página, use estruturar-landing. Para escolher cores e fontes com contraste conferido desde o início, use paleta-tipografia. Esta skill só revisa o que já existe.

## O que pedir antes

- Caminho do arquivo (HTML, componente) ou URL da página.
- Se há ferramenta para abrir a página em largura controlada (navegador com DevTools ou visualizador do Claude Code). Sem ela, a revisão é feita só pelo código e os itens visuais ficam "não verificável".
- Qual é o CTA principal, para conferir se ele aparece em todas as larguras.

## Larguras

| Largura | Representa |
|---|---|
| 360 px | Android pequeno |
| 390 px | iPhone padrão |
| 430 px | celular grande |
| 768 px | tablet em pé |
| 1280 px | notebook |

## Passo a passo

1. **Leia o código.** Procure `meta viewport`, larguras fixas em px (`width: 500px`), `min-width` grande, `white-space: nowrap`, tabelas sem contêiner rolável, imagens sem `max-width: 100%` e `100vw` dentro de contêiner com padding. Pronto quando cada suspeita está anotada com arquivo e linha.
2. **Abra a página em cada largura.** Se houver ferramenta, ajuste a janela para as cinco larguras e registre o que aparece. Em cada uma, rode no console `document.documentElement.scrollWidth > window.innerWidth`; `true` indica rolagem horizontal. Pronto quando as cinco larguras têm resultado ou estão marcadas como "não verificável".
3. **Ache o culpado da rolagem horizontal.** Se houver rolagem, liste os elementos mais largos que a janela com `[...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > innerWidth)`. Pronto quando cada caso tem o seletor responsável.
4. **Meça os alvos de toque.** Botões, links do menu, ícones e campos precisam de pelo menos 44 por 44 px nas larguras de celular, com espaço entre alvos vizinhos. Pronto quando cada alvo menor tem o tamanho medido anotado.
5. **Confira o contraste AA.** Texto normal precisa de 4,5:1 e texto grande (24 px, ou 18,66 px em negrito) precisa de 3:1. Calcule pela luminância relativa das cores em hex do CSS, incluindo texto sobre imagem e botão em estado de foco. Pronto quando cada par de cores tem a razão calculada.
6. **Verifique leitura e ordem.** Corpo de texto de pelo menos 16 px no celular, linhas de até cerca de 75 caracteres no desktop, CTA visível sem rolar em 390 px, ordem dos blocos lógica quando as colunas empilham, nada escondido no celular que seja necessário para decidir. Pronto quando cada item está como ok, achado ou não verificável.
7. **Priorize e entregue.** P1 impede o uso (rolagem horizontal, CTA inacessível, contraste abaixo de 3:1). P2 atrapalha (alvo pequeno, texto apertado). P3 acabamento. Pronto quando cada achado tem largura, evidência e correção concreta.

## Saída

```text
Página: [URL OU ARQUIVO]
Método: [navegador com larguras | só leitura de código]

| Largura | Rolagem horizontal | CTA visível | Alvos < 44 px | Contraste AA |
|---|---|---|---|---|
| 360 | sim/não | sim/não | [qtd] | ok/achado |
...

P1
1. [360, 390] Rolagem horizontal causada por `.hero img`
   Evidência: largura fixa de 520 px (styles.css, linha 42)
   Correção: `max-width: 100%; height: auto;`

P2
...

Não verificável: [itens e o que falta para verificar]
```

## Erros comuns

- Testar só em 390 px e esquecer 360 px, onde a maioria das quebras aparece.
- Chamar de ok um contraste "que parece bom" sem calcular a razão.
- Contar o ícone de 24 px como alvo de toque sem somar o padding real.
- Esconder conteúdo de prova no celular com `display: none` para "limpar" a tela.
- Corrigir rolagem horizontal com `overflow-x: hidden` no `body` sem achar o elemento que estoura.
