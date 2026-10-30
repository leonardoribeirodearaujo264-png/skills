# Catálogo e página do pacote: notas para implementar

Abrir `index.html` (seção da página inicial) e `produto.html` (página pública). A barra escura do topo troca estado (`?estado=normal|carregando|erro|vazio`), tema e marca em tracejado tudo que vem do servidor. `?limpo=1` esconde a barra. Ela não vai para produção.

## Arquivos
- Capas: `public/capas/<slug>.webp` (usar) e `.png` (fallback e `og:image`), 1200x800. Fonte editável em `capas-svg/<slug>.svg` (o SVG puxa as fontes do Google; para regerar, renderizar com o Chrome, não usar o SVG direto no site).
- Estilo novo: `catalogo.css`, por cima de `estilo.css` + `globals.css`. Reaproveita `.shell/.core`, `.btn` (`.sm`, `.lg`, `.secondary`, `.ico`), `.chip`, `.alert`, `.skel`, `.eyebrow`, `.migalha`, `.vazio-box`, `.icone-grande`, `.revela`, `.site-head`. Não copiar o primeiro bloco `:root` (fontes): no app elas já vêm do next/font.

## Catálogo (`section.catalogo#pacotes`)
- `.cat-topo` (eyebrow, h2, linha de apoio) e `ul.cat-lista` (2 colunas; 1 abaixo de 760px).
- `li.largo > article.cat-card.destaque.shell`: pacote principal. Capa à esquerda, `.chip.accent` "Pacote principal", `ul.numeros`, preço e `.btn` com `.ico`.
- `li > article.cat-card.shell`: capa, `.cat-corpo` (h3 com link para `/pacotes/<slug>/`, `.cat-resumo` com 2 linhas no máximo), `.cat-rodape` (`.preco` + `.btn.sm`).
- `li.largo > article.cat-card.combo.shell`: núcleo grafite, `ul.combo-itens`, botão laranja claro.
- Comprar: `/loja/checkout/?oferta=avulso&produtos=<slug>`; combo: `?oferta=combo`.
- Componente sugerido: `CartaoPacote({ produto, variante: "padrao" | "destaque" | "combo" })`. Ordem e textos de `loja_produtos` (`ordem`, `titulo`, `resumo`); destaque marcado no banco, não no código.

## Página do pacote (`main.pp > .pp-grid`)
- Áreas: desktop `head painel / lead painel / corpo painel` (painel `sticky`, 380px); abaixo de 1000px `head / painel / lead / corpo`, o que põe capa, preço e botão logo abaixo do h1 e acima da dobra em 360x640.
- `.painel.shell > .core`: `.capa-img` (com `fetchpriority="high"`), `.painel-preco` (preço e botão na mesma linha no celular), `.painel-garantias`.
- `.pp-corpo`: `.pp-secao` com `ul.inclui-grade` (`.inclui-item` `.n` `.r`), `ul.extras`, `ul.times`, `ol.fluxo` + `.fluxo-nota`, `.cta-final.shell`.
- `.barra-compra`: fixa no celular, só aparece depois que o botão do painel saiu por cima e enquanto o CTA final não está na tela (`data-observa-compra` + IntersectionObserver em `proto.js`). Com `inert` e `aria-hidden` quando escondida.
- Textos e números: só os do pedido, do `resumo` do banco e do README/roteiro do pacote. Nada inventado.

## Dados do servidor
Tudo com `data-fonte="servidor"` (preços em `data-centavos`) vem da API; a tela não calcula. Exemplos: avulso 3700, edição de vídeo 4700, combo 12700.

## Estados
- Carregando: `.skel` no lugar de capa/preço, `aria-busy` + `role="status"`.
- Erro de preço: alerta `role="alert"` com "Tentar de novo", preço vira "Preço indisponível", botões com `aria-disabled` e `aria-describedby="motivo-erro"`.
- Vazio (catálogo sem pacote ativo) e fora de venda (pacote inativo): mensagem e caminho alternativo.

## Acessibilidade
`alt` descritivo em toda capa; foco do `estilo.css` (laranja 3px); contraste AA (texto do botão do combo #1F1B18 sobre #FF8A3D); alvos de 40px ou mais; `prefers-reduced-motion` respeitado; sem rolagem horizontal em 360px (conferido).
