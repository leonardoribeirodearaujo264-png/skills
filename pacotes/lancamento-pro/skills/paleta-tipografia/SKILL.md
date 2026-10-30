---
name: paleta-tipografia
description: Define a paleta de cores em hex com papel de cada cor e contraste calculado, e a escala tipográfica com fontes, tamanhos, pesos e entrelinha, entregando a especificação e um HTML de amostra que abre no navegador. Use quando o lançamento precisar de identidade visual para página, posts e capas, ou quando as cores atuais falharem em contraste ou parecerem desencontradas.
---

# Paleta e tipografia

Esta skill cria a base visual que as outras peças do lançamento reutilizam: poucas cores com função clara e uma escala de texto consistente. O resultado é uma especificação com hex, papel, pares de contraste conferidos, fontes e tamanhos, mais um arquivo HTML de amostra. Nenhuma imagem é gerada por API.

## Quando usar

- O lançamento ainda não tem cores e fontes definidas.
- As peças existentes usam cores diferentes a cada post.
- Um texto ou botão falhou em contraste e a paleta precisa ser ajustada.

Para aplicar a paleta em um post único, use template-post. Para carrossel, use criar-carrossel. Para capa de Reels, use capa-reels. Para conferir contraste de uma página já pronta em várias larguras, use checklist-responsividade.

## O que pedir antes

- Nome do produto, público e o tom desejado (sóbrio, acolhedor, enérgico).
- Cores ou logotipo já existentes, em hex. Se houver só imagem, pedir os códigos ou ler do arquivo SVG/CSS.
- Onde a paleta será usada: página, Instagram, slides, e-mail.
- Fontes que o usuário já tem licença ou prefere. Sem preferência, propor fontes gratuitas do Google Fonts ou fontes do sistema.

## Passo a passo

1. **Defina os papéis.** Fundo, superfície, texto principal, texto secundário, cor de destaque (CTA), cor de destaque para texto, borda, sucesso, erro. Pronto quando cada papel tem uma cor proposta em hex. Dois papéis só dividem o mesmo hex se for destaque e destaque para texto, e o par passar 4,5:1 sobre o fundo.
2. **Limite a paleta.** Até sete cores de marca e neutros (fundo, superfície, texto principal, texto secundário, destaque, destaque para texto, borda), com no máximo uma cor de marca forte e um destaque. Sucesso e erro são cores de estado e ficam fora dessa conta. Total máximo: nove. Mais que isso, justifique. Pronto quando a paleta tem até sete cores de marca e neutros mais as duas de estado.
3. **Calcule o contraste de cada par usado.** Use a luminância relativa do WCAG: converta cada canal para 0 a 1, linearize (`c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)^2.4`), some `0.2126 R + 0.7152 G + 0.0722 B` e calcule `(L1 + 0.05) / (L2 + 0.05)`. Rode o cálculo com Bash ou à mão, nunca estime. Pronto quando todo par texto/fundo e botão/texto tem a razão com duas casas.
4. **Ajuste o que falhar.** Texto normal precisa de 4,5:1, texto grande de 3:1, borda de campo e ícone de 3:1. Ajuste de forma reproduzível: converta a cor que falhou para HSL, mantenha matiz e saturação e mude só a luminosidade em passos de 5 pontos (escureça se o fundo é claro, clareie se é escuro). Recalcule a razão a cada passo e pare no primeiro que passar. Mude a cor de marca só se não houver alternativa, e diga. Pronto quando nenhum par em uso fica abaixo do mínimo e cada ajuste está na tabela de reprovados.
5. **Monte a escala tipográfica.** Até duas famílias (títulos e corpo). Base de 16 px na web e razão entre 1,2 e 1,333. Entrelinha de 1,5 a 1,7 no corpo e 1,1 a 1,3 nos títulos. Pesos usados no máximo três. Pronto quando cada nível (h1, h2, h3, corpo, legenda, botão) tem tamanho, peso e entrelinha.
6. **Defina tamanhos para redes.** Em post 1080 px de largura, texto de apoio de pelo menos 32 px e título de pelo menos 64 px, para leitura no celular. Legenda e rodapé do post também seguem o mínimo de 32 px. Pronto quando a tabela de redes está preenchida.
7. **Gere o HTML de amostra.** Um arquivo com as variáveis CSS em `:root`, os blocos de cor com hex e razão escritos, e a escala de texto aplicada. Toda `font-family` termina com fonte do sistema de reserva (`system-ui, sans-serif`), para a amostra funcionar sem internet. Pronto quando abre no navegador sem dependência além da fonte escolhida.

## Saída

```text
Paleta: [n] cores de marca e neutros (até 7) + 2 de estado (sucesso, erro)
| Papel | Hex | Uso |
|---|---|---|
| Texto principal | #1A1A2E | corpo e títulos |
| Fundo | #FFFFFF | página e posts claros |
| Destaque | #C2410C | botão e marcações |
...

Contraste conferido
| Frente | Fundo | Razão | Nível |
|---|---|---|---|
| #1A1A2E | #FFFFFF | 17,06 | AA e AAA |
| #FFFFFF | #C2410C | 5,18 | AA texto normal |

Reprovados e ajuste
| Par | Razão original | Mínimo | Cor ajustada (HSL) | Passos | Razão final |
|---|---|---|---|---|---|
| [frente] / [fundo] | [x,xx] | 4,5 | [hex] ([h], [s]%, [l]%) | [n] x 5 pontos | [x,xx] |
(ou "nenhum par reprovado")

Tipografia
| Nível | Família | Tamanho web | Tamanho post 1080 | Peso | Entrelinha |
...

Arquivo de amostra: [caminho]/paleta.html
```

Trecho do HTML de amostra:

```html
<style>
:root{--texto:#1A1A2E;--fundo:#FFFFFF;--destaque:#C2410C}
body{background:var(--fundo);color:var(--texto);font:16px/1.6 system-ui,sans-serif}
.cta{background:var(--destaque);color:#FFFFFF;padding:14px 24px;border-radius:8px}
</style>
```

## Erros comuns

- Escolher o laranja ou amarelo da marca para texto sobre branco sem calcular o contraste.
- Usar três ou mais famílias de fonte, uma por peça.
- Copiar os tamanhos da web para o post de 1080 px, onde tudo fica pequeno demais.
- Dar o mesmo hex a texto secundário e a borda, perdendo a hierarquia.
- Indicar fonte paga sem confirmar que o usuário tem licença.
