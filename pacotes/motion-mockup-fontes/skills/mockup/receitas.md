# Receitas: capa de curso e caixa

Leia só quando a cena pedida for capa de curso ou caixa e embalagem. Cada receita é um HTML completo: salve na pasta de trabalho com o nome indicado, troque as variáveis do `:root` e exporte com o mesmo comando do passo 5 da SKILL.md. As regras de qualidade da SKILL.md valem igual.

## Capa de curso (`capa.html`)

Mostra a capa como um volume em pé, com lombada e sombra. Serve para capa de curso, e-book, apostila e kit digital.

- `--capa`: a arte da frente, na proporção 3:4 (por exemplo 1200x1600). Outra proporção: troque o `aspect-ratio` de `.frente`.
- `--lombada`: cor da lateral. Use a cor dominante da borda esquerda da capa, para o volume parecer uma peça só.
- `--giro`: de `15deg` a `35deg`. Mais perto de zero mostra mais a capa e menos a lombada.

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Mockup capa</title>
<style>
  :root {
    --capa: url("minha-capa.png");
    --lombada: #1f2a44;
    --giro: 24deg;
    --fundo-1: #f4f1ec;
    --fundo-2: #d8cfc2;
    --sombra: rgba(30, 24, 18, 0.35);
    --w: min(46vw, calc(62vh * 0.75));
    --espessura: calc(var(--w) * 0.1);
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body { display: grid; place-items: center; overflow: hidden;
    background: radial-gradient(110% 85% at 50% 20%, var(--fundo-1), var(--fundo-2)); }
  .cena { position: relative; perspective: calc(var(--w) * 4); }
  .cena::after { content: ""; position: absolute; z-index: -1; left: -6%; right: -6%;
    bottom: calc(var(--w) * -0.07); height: calc(var(--w) * 0.14);
    background: radial-gradient(50% 50% at 50% 50%, var(--sombra), transparent 70%); }
  .volume { position: relative; width: var(--w); transform-style: preserve-3d;
    transform: rotateY(var(--giro)); }
  .frente { aspect-ratio: 3 / 4; background: var(--capa) center / cover no-repeat;
    border-radius: 0 calc(var(--w) * 0.012) calc(var(--w) * 0.012) 0;
    box-shadow: inset calc(var(--w) * 0.012) 0 calc(var(--w) * 0.02) rgba(0, 0, 0, 0.18); }
  .lateral { position: absolute; top: 0; left: 0; width: var(--espessura); height: 100%;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0)), var(--lombada);
    transform-origin: left center; transform: rotateY(90deg); }
</style>
</head>
<body>
  <div class="cena">
    <div class="volume">
      <div class="lateral" aria-hidden="true"></div>
      <div class="frente" role="img" aria-label="Capa do curso"></div>
    </div>
  </div>
</body>
</html>
```

## Caixa ou embalagem simples (`caixa.html`)

Caixa retangular vista de cima e de lado, com três faces visíveis. Cada face recebe uma imagem própria; sem arte para a lateral ou o topo, use uma cor sólida da marca.

- `--frente`, `--lateral`, `--topo`: imagem de cada face (`url("...")`) ou uma cor.
- `--larg`, `--alt`, `--prof`: medidas da caixa em proporção. Uma caixa de 20 x 30 x 8 cm vira `20`, `30` e `8`. A arte de cada face precisa ter a mesma proporção da face, ou será cortada pelo `cover`.
- `--giro-y` e `--giro-x`: ângulo da vista.

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Mockup caixa</title>
<style>
  :root {
    --frente: url("frente.png");
    --lateral: #24344f;
    --topo: #2d4062;
    --larg: 20;
    --alt: 30;
    --prof: 8;
    --giro-y: -32deg;
    --giro-x: -14deg;
    --fundo-1: #eef2f6;
    --fundo-2: #c6d0dc;
    --sombra: rgba(20, 28, 40, 0.35);
    --u: min(calc(58vh / var(--alt)), calc(48vw / var(--larg)));
    --L: calc(var(--larg) * var(--u));
    --A: calc(var(--alt) * var(--u));
    --P: calc(var(--prof) * var(--u));
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body { display: grid; place-items: center; overflow: hidden;
    background: radial-gradient(110% 85% at 50% 20%, var(--fundo-1), var(--fundo-2)); }
  .cena { position: relative; perspective: calc(var(--A) * 4); }
  .cena::after { content: ""; position: absolute; z-index: -1; left: -20%; right: -20%;
    bottom: calc(var(--P) * -0.9); height: calc(var(--P) * 1.6);
    background: radial-gradient(50% 50% at 50% 50%, var(--sombra), transparent 70%); }
  .caixa { position: relative; width: var(--L); height: var(--A); transform-style: preserve-3d;
    transform: rotateX(var(--giro-x)) rotateY(var(--giro-y)); }
  .face { position: absolute; background-position: center; background-size: cover; background-repeat: no-repeat; }
  .frente { width: var(--L); height: var(--A); background-image: var(--frente); background-color: var(--frente);
    transform: translateZ(calc(var(--P) / 2)); }
  .lado { width: var(--P); height: var(--A); left: calc((var(--L) - var(--P)) / 2);
    background-image: var(--lateral); background-color: var(--lateral);
    transform: rotateY(90deg) translateZ(calc(var(--L) / 2)); filter: brightness(0.82); }
  .topo { width: var(--L); height: var(--P); top: calc((var(--A) - var(--P)) / 2);
    background-image: var(--topo); background-color: var(--topo);
    transform: rotateX(90deg) translateZ(calc(var(--A) / 2)); filter: brightness(1.08); }
</style>
</head>
<body>
  <div class="cena">
    <div class="caixa">
      <div class="face topo" aria-hidden="true"></div>
      <div class="face lado" aria-hidden="true"></div>
      <div class="face frente" role="img" aria-label="Frente da embalagem"></div>
    </div>
  </div>
</body>
</html>
```

Cor sólida ou imagem funcionam na mesma variável: a regra repete o valor em `background-image` e `background-color`, e a que não for válida fica vazia.
