---
name: checklist-responsividade
description: Confere uma página de lançamento nas larguras 360, 390, 430, 768 e 1280 px, procurando rolagem horizontal, alvos de toque menores que 44 px, contraste abaixo do nível AA, foco invisível, links internos quebrados e blocos que quebram. Use quando a página já estiver montada e o usuário quiser saber se ela funciona no celular, no tablet e no desktop antes de divulgar.
---

# Checklist de responsividade

Esta skill verifica se uma página continua legível e clicável em cinco larguras de tela. O resultado é uma tabela por largura e uma lista de correções com o seletor ou a linha do arquivo, ordenada do que impede o uso para o que é só acabamento. Cada resultado diz se foi medido no navegador ou estimado pelo código.

## Quando usar

- A página de vendas, de captura ou de obrigado está pronta e vai receber tráfego.
- Alguém reclamou que "no celular fica estranho" e é preciso localizar o problema.
- Depois de trocar layout, fonte ou imagem principal.

Para montar a estrutura e o texto da página, use estruturar-landing. Para escolher cores e fontes com contraste conferido desde o início, use paleta-tipografia. Esta skill só revisa o que já existe.

## O que pedir antes

- Caminho do arquivo (HTML, componente) ou URL da página.
- Se há ferramenta para abrir a página em largura controlada (navegador com DevTools ou visualizador do Claude Code). Arquivo local solto: o visualizador pode não agir sobre `file://`; suba um servidor local antes do passo 2 (por exemplo, `python -m http.server 8000` na pasta e abrir `http://localhost:8000/pagina.html`). Sem ferramenta, a revisão é feita só pelo código.
- Qual é o CTA principal, para conferir se ele aparece em todas as larguras.

## Larguras

| Largura | Representa |
|---|---|
| 360 px | Android pequeno |
| 390 px | iPhone padrão |
| 430 px | celular grande |
| 768 px | tablet em pé |
| 1280 px | notebook |

## Estados de cada resultado

- **medido**: visto no navegador na largura certa.
- **estimado pelo código**: deduzido do CSS e do HTML (larguras fixas, padding, tamanhos de fonte), sem abrir a página.
- **não verificável**: nem o navegador nem o código permitem concluir (imagem externa, conteúdo montado por script).

## Passo a passo

1. **Leia o código.** Procure `meta viewport`, larguras fixas em px (`width: 500px`), `min-width` grande, `white-space: nowrap`, tabelas sem contêiner rolável, imagens sem `max-width: 100%`, `100vw` dentro de contêiner com padding, regras de `:focus` ou `:focus-visible` (e `outline: none` sem substituto) e âncoras internas (`href="#faq"`) sem elemento com o `id` correspondente. Pronto quando cada suspeita está anotada com arquivo e linha.
2. **Abra a página em cada largura.** Se houver ferramenta, ajuste a janela para as cinco larguras e registre o que aparece. Em cada uma, rode no console `document.documentElement.scrollWidth > window.innerWidth`; `true` indica rolagem horizontal. Sem ferramenta, some as larguras fixas, `min-width` e padding do código para estimar. Pronto quando as cinco larguras têm resultado com o estado (medido, estimado pelo código ou não verificável).
3. **Ache o culpado da rolagem horizontal.** Se houver rolagem, liste os elementos mais largos que a janela com `[...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > innerWidth)`. Sem navegador, aponte a regra de CSS que soma mais que a largura. Pronto quando cada caso tem o seletor responsável.
4. **Meça os alvos de toque.** Botões, links do menu, ícones e campos precisam de pelo menos 44 por 44 px nas larguras de celular e tablet (360 a 768), com espaço entre alvos vizinhos. Em 1280 px a coluna fica "não se aplica". No navegador, meça com `getBoundingClientRect()`; sem navegador, estime pela fonte, entrelinha e padding do CSS. Pronto quando cada alvo menor tem o tamanho anotado como medido ou estimado pelo código.
5. **Confira o contraste AA e o foco.** Texto normal precisa de 4,5:1 e texto grande (24 px, ou 18,66 px em negrito) precisa de 3:1. Calcule pela luminância relativa das cores em hex do CSS, incluindo texto sobre imagem e botão em estado de foco. Confirme que existe estilo de foco visível em links, botões e campos. Pronto quando cada par de cores tem a razão calculada e o foco está como ok ou achado.
6. **Verifique leitura e ordem.** Corpo de texto de pelo menos 16 px no celular, linhas de até cerca de 75 caracteres no desktop, CTA visível sem rolar em 390 px, ordem dos blocos lógica quando as colunas empilham, nada escondido no celular que seja necessário para decidir, links internos com destino. Pronto quando cada item está como ok, achado ou não verificável, com o estado.
7. **Priorize e entregue.** P1 impede o uso: rolagem horizontal, CTA inacessível, contraste abaixo de 3:1, link do CTA quebrado. P2 atrapalha: contraste entre 3:1 e 4,5:1 em texto normal, alvo pequeno, foco invisível, link interno quebrado fora do CTA, texto apertado. P3 acabamento. Pronto quando cada achado tem largura, evidência, estado e correção concreta.

## Saída

```text
Página: [URL OU ARQUIVO]
Método: [navegador com larguras | só leitura de código]

| Largura | Rolagem horizontal | CTA visível | Alvos < 44 px | Contraste AA |
|---|---|---|---|---|
| 360 | sim/não (medido) ou sim/provável (pelo código) | sim/não (estado) | [qtd] (medido ou estimado) | ok/achado |
...
| 1280 | ... | ... | não se aplica | ok/achado |

Foco visível: [ok | achado: seletor sem estilo]
Links internos: [ok | quebrados: lista]

P1
1. [360, 390] Rolagem horizontal causada por `.hero img` (estimado pelo código)
   Evidência: largura fixa de 520 px (styles.css, linha 42)
   Correção: `max-width: 100%; height: auto;`

P2
...

Não verificável: [itens e o que falta para verificar]
```

## Erros comuns

- Testar só em 390 px e esquecer 360 px, onde a maioria das quebras aparece.
- Apresentar estimativa pelo código como se fosse medida.
- Chamar de ok um contraste "que parece bom" sem calcular a razão.
- Remover o contorno de foco com `outline: none` sem pôr outro estilo no lugar.
- Corrigir rolagem horizontal com `overflow-x: hidden` no `body` sem achar o elemento que estoura.
