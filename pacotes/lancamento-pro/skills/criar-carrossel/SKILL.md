---
name: criar-carrossel
description: Planeja e monta um carrossel de 5 a 10 slides em 1080 x 1350, com roteiro slide a slide, grade comum, cores em hex com contraste conferido e um HTML que mostra todos os slides lado a lado para revisar e exportar. Use quando o lançamento precisar ensinar um passo a passo, quebrar uma objeção ou apresentar o método em sequência no feed.
---

# Criar carrossel

Esta skill transforma um tema em sequência de slides que se leem como um argumento: o primeiro faz parar, os do meio entregam conteúdo, o último pede uma única ação. O resultado é o roteiro, a especificação visual comum a todos os slides e um único arquivo HTML com cada slide em 1080 x 1350, pronto para exportar um por um. Nenhuma imagem é gerada por API paga.

## Quando usar

- Conteúdo de aquecimento: passo a passo, erros comuns, antes e depois do processo.
- Resposta a uma objeção frequente em formato de ensino.
- Apresentação do método ou do conteúdo do produto.

Para uma única imagem, use template-post. Para capa de vídeo vertical, use capa-reels. Para definir cores e fontes antes, use paleta-tipografia.

## O que pedir antes

- Tema, público e a ação do último slide (salvar, comentar uma palavra, link na bio). Uma só.
- Número de slides desejado, entre 5 e 10.
- Paleta e fontes do lançamento. Sem elas, neutros e fonte do sistema, com aviso.
- Fatos, números e exemplos reais que podem entrar. Sem eles, marcadores [NÚMERO REAL] e [EXEMPLO REAL].
- Área regulada: regra do conselho profissional.
- Se há navegador para abrir o HTML. Arquivo local costuma precisar de servidor local para abrir no visualizador (por exemplo, `python -m http.server 8000` na pasta e abrir `http://localhost:8000/carrossel.html`).

## Passo a passo

1. **Escreva o roteiro.** Todo slide tem título e apoio. Slide 1: gancho de até dez palavras que diga o benefício ou o erro, com apoio curto opcional. Slides do meio: uma ideia por slide, título curto e até 30 palavras de apoio. Penúltimo: resumo. Último: título com a ação e uma linha de apoio que diga o que a pessoa ganha ao fazer. Uma única ação no último slide, sem pressão nem escassez falsa; se o usuário pedir duas, escolha a principal e registre a outra na legenda. Pronto quando cada slide tem título e apoio escritos, o último tem uma só ação e a sequência se lê sem pular.
2. **Confira o roteiro contra as regras.** Em área regulada, passe cada slide pela regra do conselho informada: nada de promessa de resultado, antes e depois proibido, número sem fonte. Fora de área regulada, confira só promessa e número não fornecido. Pronto quando cada trecho de risco está marcado com "Atenção:" ou a conferência diz "nenhum".
3. **Fixe a grade comum.** Margem segura de 80 px, área útil de 920 x 1190 px, numeração "2/7" no mesmo canto. Slides 2 em diante: título sempre na mesma altura. Exceção só do slide 1: o gancho pode ficar centralizado na vertical, dentro da área útil. Pronto quando a grade e a exceção do gancho estão escritas.
4. **Defina a hierarquia.** Gancho de 88 a 110 px, títulos internos de 64 a 80 px, apoio de 34 a 40 px, numeração e @ de 24 px. Pronto quando nenhum apoio fica abaixo de 32 px.
5. **Aplique cores e confira contraste.** Fundo pode alternar entre dois tons da paleta, texto mantém o mesmo papel. Calcule a razão de cada par com a fórmula de luminância do WCAG: 4,5:1 para apoio, 3:1 para títulos grandes. Pronto quando cada combinação usada tem razão anotada.
6. **Crie continuidade.** Um elemento visual (seta, faixa, linha) que atravessa do slide atual para o próximo, ou numeração clara, para indicar que há mais. Pronto quando o slide 1 deixa claro que existe sequência.
7. **Gere o HTML.** Um arquivo com cada slide em `<section class="slide">` de 1080 x 1350 px, empilhados com espaço entre eles, variáveis de cor em `:root`, textos editáveis e as fontes do lançamento carregadas por link (Google Fonts) com fonte de reserva no `font-family`. Pronto quando o arquivo tem todos os slides e as fontes declaradas.
8. **Confira o estouro.** Com navegador, abra o HTML (por servidor local, se for arquivo solto), espere as fontes carregarem e confirme que nenhum texto sai da área útil. Sem navegador, estime pelo número de palavras, tamanho da fonte e largura de 920 px, e marque "estimado pelo código" ou "não verificado". Pronto quando o estado da conferência está escrito por slide.
9. **Escreva a legenda e a exportação.** Legenda em rascunho, que complementa e não repete os slides. Exportação: captura de nó de cada `section` no DevTools em tamanho real, depois que as fontes carregarem. Pronto quando legenda e passos de exportação estão escritos.

## Saída

```text
Carrossel: [tema]  |  Slides: [n]  |  Ação final: [uma ação]

Roteiro
1/[n] Gancho: [texto] | [apoio curto ou "sem apoio"]
2/[n] [título] | [apoio]
...
[n]/[n] [título com a ação] | [apoio: o que a pessoa ganha]

Conferência de regras: [trechos marcados ou "nenhum"]

Especificação comum
Grade: margem 80 px, área útil 920 x 1190 px; gancho centralizado na vertical, demais títulos na mesma altura
Fontes: [família] [tamanhos por nível] | Reserva: [família]
Cores: [hex por papel]  |  Contraste: [pares e razões]
Estouro de texto: [verificado no navegador | estimado pelo código | não verificado]

Legenda (rascunho): [texto]
Arquivo: [caminho]/carrossel.html
```

Estrutura do HTML:

```html
<link href="https://fonts.googleapis.com/css2?family=[FONTE]:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{--fundo:#FFFFFF;--texto:#1A1A2E;--destaque:#C2410C}
.slide{width:1080px;height:1350px;position:relative;margin:0 auto 40px;background:var(--fundo);color:var(--texto);overflow:hidden;font-family:'[FONTE]',system-ui,sans-serif}
.num{position:absolute;right:80px;top:80px;font-size:24px}
</style>
<section class="slide"><span class="num">1/7</span><h1>[GANCHO]</h1></section>
```

## Erros comuns

- Gancho genérico ("Dicas importantes") que não diz o que a pessoa ganha.
- Trocar a posição do título de slide para slide, o que cansa a leitura.
- Último slide só com a ação, sem dizer o que a pessoa ganha, ou com duas ações.
- Exportar antes de a fonte carregar e sair com a fonte de reserva.
- Prometer resultado ou usar número que o usuário não forneceu.
