# Destaque laranja: tokens

Prévia: `prototipos/laranja/previa.html` (`?ver=claro`, `?ver=escuro` ou as duas colunas) e `celular.html` (390 px).
Contraste pela fórmula WCAG 2.x (luminância relativa). AA texto normal = 4.5:1; componente de interface = 3:1.

## Valores

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--accent` | `#C03F00` | `#FF8A3D` | botões, links, kicker, selo, checks, foco |
| `--accent-ink` | `#FFFFFF` | `#0D0F13` | texto sobre `--accent` (botão, copiar, selo do combo) |
| `--accent-soft` | `#FFEDE1` | `#2B1A0F` | fundo do `.badge`, quadrado do check |
| `--code-bg` | `#1F1B18` | `#231D19` | blocos de código e bloco do combo (grafite quente, sai o azul-marinho) |
| `--code-ink` | `#F5F0EA` | `#F5F0EA` | texto do código e do combo |
| `--code-muted` | `#BDB2A7` | `#BDB2A7` | barra do código, descrição e preço riscado do combo |
| `--code-line` (novo) | `color-mix(in srgb, var(--code-ink) 12%, transparent)` | igual | divisória da barra e contorno do combo |
| `--blue-block` | `#C03F00` | `#C03F00` | faixa `.strip`, `.step-num`, `.selo` e check fixo da loja |
| `--blue-block-ink` | `#FFFFFF` | `#FFFFFF` | texto sobre o bloco |

`#C03F00` tem saturação total (azul 0) e matiz de 20 graus: lê como laranja queimado vivo, não marrom. Um laranja mais claro que isso não passa 4.5:1 como texto sobre `#F6F5F1` (o limite é luminância 0,164; `#EA580C` dá 3,4:1).
`--blue-block`: renomear para `--block` e `--block-ink`, mantendo `--blue-block: var(--block)` como apelido até trocar os usos em globals.css (linhas 159 e 183). No escuro o bloco fica `#C03F00` com texto branco, porque branco sobre `#FF8A3D` dá só 2,35:1.

## Contraste

| Par | Claro | Escuro |
|---|---|---|
| `--accent` texto sobre `--bg` (#F6F5F1 / #0D0F13) | 4.87 | 8.18 |
| `--accent` texto sobre `--surface` (#FFFFFF / #151921) | 5.31 | 7.51 |
| `--accent-ink` sobre `--accent` | 5.31 | 8.18 |
| texto do selo (`--accent`) sobre `--accent-soft` | 4.67 | 7.12 |
| `--blue-block-ink` sobre `--blue-block` | 5.31 | 5.31 |
| `--code-ink` sobre `--code-bg` | 15.09 | 14.70 |
| `--code-muted` sobre `--code-bg` | 8.22 | 8.00 |
| `--accent` (botão do combo) contra `--code-bg`, interface | 3.22 | 7.10 |
| `--ok-ink` sobre `--ok-soft` (selo de economia) | 5.27 | 8.59 |
| `--accent` como anel de foco contra `--bg` | 4.87 | 8.18 |

## Cores escritas direto que viram token

| Arquivo:linha | Hoje | Troca |
|---|---|---|
| public/assets/estilo.css:155 | `stroke='%232F5BFF'` no data URI do check | `.offer li::before` só com `background: var(--accent-soft)`; check em `.offer li::after` absoluto (left 3px, top 6px, 12px) com `background-color: var(--accent)` e `mask`/`-webkit-mask` com o mesmo SVG em `stroke='black'`; `.offer li { position: relative }` |
| public/assets/estilo.css:96 | `rgba(255,255,255,.12)` | `var(--code-line)` |
| public/assets/estilo.css:111 | `.code .copy { background: #FFFFFF; color: var(--code-bg) }` | `background: var(--accent); color: var(--accent-ink)` (ou apagar a regra) |
| public/assets/estilo.css:113 | erro do copiar `#C2410C` | `var(--danger)`; o laranja antigo de erro ficaria igual ao destaque. Subir `--danger`, `--ok-ink`, `--ok-soft` de globals.css para estilo.css |
| public/assets/oferta.css:21 | `.oferta-selo` `color: #fff` | `var(--accent-ink)` (branco sobre `#FF8A3D` reprova) |
| public/assets/oferta.css:24, 32, 37 | `color: #fff` | `var(--code-ink)` |
| public/assets/oferta.css:32 | `rgba(255,255,255,.07)` | `color-mix(in srgb, var(--code-ink) 7%, transparent)` |
| public/assets/oferta.css:40 | `#E3F4EC` / `#16714A` | `var(--ok-soft)` / `var(--ok-ink)` |
| public/assets/oferta.css:42 | CTA do combo `#fff` sobre `--code-bg`, sombra `rgba(0,0,0,.6)` | `background: var(--accent); color: var(--accent-ink); box-shadow: 0 12px 28px -12px var(--accent)` |
| public/assets/oferta.css:43 | `outline: 3px solid #fff` | `var(--code-ink)` |
| src/app/globals.css:281 | `.player` `#070A14` | `var(--code-bg)` |
| src/app/globals.css:283 | `rgba(107,139,255,.55)` e `rgba(47,91,255,.35)` | `color-mix(in srgb, var(--accent) 55%, transparent)` e `color-mix(in srgb, var(--accent) 35%, transparent)` |
| src/app/globals.css:292 | `rgba(7,10,20,.88)` | `color-mix(in srgb, var(--code-bg) 88%, transparent)` |
| public/assets/estilo.css:7 a 14, 26, 27, 32, 33 | definição dos tokens | valores da tabela acima |

Sem outros azuis: nenhum `.tsx`/`.ts` tem cor escrita e as páginas de `public/` não têm `<style>` próprio.

## Achados fora da cor
- `.offer > p` pinta `.oferta-preco` com `--ink-soft`, então "R$ 37,00" sai cinza hoje. Corrigir com `.oferta-preco .price { color: var(--ink) }` (aplicado na prévia).
- `contagem()` em src/lib/loja/vitrine.ts escreve "1 skills"; os pacotes têm 1 ou 2 skills. Falta o singular.
