---
name: criar-carrossel
description: Planeja e monta um carrossel de 5 a 10 slides em 1080 x 1350, com roteiro slide a slide, grade comum, cores em hex com contraste conferido e um HTML que mostra todos os slides lado a lado para revisar e exportar. Use quando o lançamento precisar ensinar um passo a passo, quebrar uma objeção ou apresentar o método em sequência no feed.
---

# Criar carrossel

Esta skill transforma um tema em sequência de slides que se leem como um argumento: o primeiro faz parar, os do meio entregam conteúdo, o último pede uma ação. O resultado é o roteiro, a especificação visual comum a todos os slides e um único arquivo HTML com cada slide em 1080 x 1350, pronto para exportar um por um. Nenhuma imagem é gerada por API paga.

## Quando usar

- Conteúdo de aquecimento: passo a passo, erros comuns, antes e depois do processo.
- Resposta a uma objeção frequente em formato de ensino.
- Apresentação do método ou do conteúdo do produto.

Para uma única imagem, use template-post. Para capa de vídeo vertical, use capa-reels. Para definir cores e fontes antes, use paleta-tipografia.

## O que pedir antes

- Tema, público e a ação do último slide (salvar, comentar uma palavra, link na bio).
- Número de slides desejado, entre 5 e 10.
- Paleta e fontes do lançamento. Sem elas, neutros e fonte do sistema, com aviso.
- Fatos, números e exemplos reais que podem entrar. Sem eles, marcadores [NÚMERO REAL] e [EXEMPLO REAL].
- Área regulada: regra do conselho profissional.

## Passo a passo

1. **Escreva o roteiro.** Slide 1: gancho de até dez palavras que diga o benefício ou o erro. Slides do meio: uma ideia por slide, título curto e até 30 palavras de apoio. Penúltimo: resumo. Último: ação clara, sem pressão nem escassez falsa. Pronto quando cada slide tem título e apoio escritos e a sequência se lê sem pular.
2. **Fixe a grade comum.** Margem segura de 80 px, área útil de 920 x 1190 px, título sempre na mesma altura, numeração "2/7" no mesmo canto. Pronto quando a grade vale para todos os slides sem exceção.
3. **Defina a hierarquia.** Gancho de 88 a 110 px, títulos internos de 64 a 80 px, apoio de 34 a 40 px, numeração e @ de 24 px. Pronto quando nenhum apoio fica abaixo de 32 px.
4. **Aplique cores e confira contraste.** Fundo pode alternar entre dois tons da paleta, texto mantém o mesmo papel. Calcule a razão de cada par com a fórmula de luminância do WCAG: 4,5:1 para apoio, 3:1 para títulos grandes. Pronto quando cada combinação usada tem razão anotada.
5. **Crie continuidade.** Um elemento visual (seta, faixa, linha) que atravessa do slide atual para o próximo, ou numeração clara, para indicar que há mais. Pronto quando o slide 1 deixa claro que existe sequência.
6. **Gere o HTML.** Um arquivo com cada slide em `<section class="slide">` de 1080 x 1350 px, empilhados com espaço entre eles, variáveis de cor em `:root` e textos editáveis. Pronto quando todos os slides abrem no navegador e nenhum texto estoura a área útil.
7. **Escreva a legenda e a exportação.** Legenda em rascunho, que complementa e não repete os slides. Exportação: captura de nó de cada `section` no DevTools em tamanho real. Pronto quando legenda e passos de exportação estão escritos.

## Saída

```text
Carrossel: [tema]  |  Slides: [n]  |  Ação final: [ação]

Roteiro
1/[n] Gancho: [texto]
2/[n] [título] | [apoio]
...
[n]/[n] Ação: [texto]

Especificação comum
Grade: margem 80 px, área útil 920 x 1190 px
Fontes: [família] [tamanhos por nível]
Cores: [hex por papel]  |  Contraste: [pares e razões]

Legenda (rascunho): [texto]
Arquivo: [caminho]/carrossel.html
```

Estrutura do HTML:

```html
<style>
:root{--fundo:#FFFFFF;--texto:#1A1A2E;--destaque:#C2410C}
.slide{width:1080px;height:1350px;position:relative;margin:0 auto 40px;background:var(--fundo);color:var(--texto);overflow:hidden}
.num{position:absolute;right:80px;top:80px;font-size:24px}
</style>
<section class="slide"><span class="num">1/7</span><h1>[GANCHO]</h1></section>
```

## Erros comuns

- Gancho genérico ("Dicas importantes") que não diz o que a pessoa ganha.
- Trocar a posição do título de slide para slide, o que cansa a leitura.
- Slide com parágrafo inteiro em fonte pequena.
- Último slide sem ação ou com três ações diferentes.
- Prometer resultado ou usar número que o usuário não forneceu.
