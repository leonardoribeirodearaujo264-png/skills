---
name: mockup
description: Gera mockups de tela e de produto em PNG 1x e 2x só com HTML e CSS locais (site no notebook, app no celular, post no feed, capa de curso, caixa ou embalagem simples). Use quando o pedido for colocar um print, uma URL ou uma arte dentro de um aparelho, de um post ou de uma embalagem para divulgar.
---

# Mockup

Monta a cena em HTML e CSS (moldura desenhada em CSS, sombra, perspectiva e fundo) e fotografa com o navegador headless que já está no computador. Nada é baixado, nenhuma API é chamada e a imagem do usuário nunca sai da máquina.

Os modelos prontos ficam em `modelos/`, ao lado deste arquivo:

| Modelo | Cena | Variáveis principais |
|---|---|---|
| `modelos/notebook.html` | site ou sistema na tela de um notebook | `--imagem`, `--ajuste`, `--posicao`, `--rotacao-x`, `--rotacao-y` |
| `modelos/celular.html` | app ou página mobile num celular | as mesmas, mais `--rotacao-z` |
| `modelos/post-feed.html` | arte dentro de um cartão de post de rede social | `--imagem`, `--prop` (1 ou 1.25), texto do perfil e da legenda no HTML |

Capa de curso e caixa ou embalagem não têm modelo pronto: monte pela receita em [receitas.md](receitas.md), que só deve ser lida nesses dois casos.

## Entradas

Confirme três coisas antes de começar. Pergunte só o que faltar.

1. **Imagem.** Uma destas:
   - **print** ou **imagem** do usuário (PNG, JPG ou WebP): use o arquivo como está;
   - **URL**: capture a página primeiro (passo 2). Funciona com página pública. Página que exige login não abre no headless: peça o print.
2. **Cena:** notebook, celular, post no feed, capa de curso ou caixa.
3. **Formato de saída:** um ou mais dos tamanhos prontos abaixo. Sem resposta, use 1080x1350 para feed e 1920x1080 para página e apresentação.

### Tamanhos prontos

| Uso | `--window-size` | PNG 1x | PNG 2x |
|---|---|---|---|
| Post quadrado | `1080,1080` | 1080x1080 | 2160x2160 |
| Post retrato 4:5 | `1080,1350` | 1080x1350 | 2160x2700 |
| Story, Reels, Shorts | `1080,1920` | 1080x1920 | 2160x3840 |
| Página, slide, YouTube | `1920,1080` | 1920x1080 | 3840x2160 |

Os três modelos se ajustam sozinhos a qualquer um desses tamanhos: a largura do aparelho é calculada pela janela, com margem segura.

## Passo a passo

1. **Prepare a pasta de trabalho.** Crie uma pasta do projeto do usuário (por exemplo `mockups/`), copie para ela o modelo escolhido e a imagem. Trabalhe sempre na cópia: o modelo original fica intacto para a próxima vez. Pronto quando o HTML e a imagem estão lado a lado na mesma pasta.

2. **Capture a URL (só se a entrada for URL).** Fotografe a página no tamanho da tela de destino, em 2x:
   - notebook: `--window-size=1440,900`;
   - celular: `--window-size=390,844`.

   Use o mesmo comando do passo 5, trocando o arquivo HTML pela URL. Pronto quando o PNG mostra a página carregada, sem tela em branco nem aviso de cookies cobrindo o conteúdo. Se aparecer, peça um print ao usuário em vez de editar a imagem.

3. **Troque a imagem.** No bloco `:root` da cópia, troque o valor de `--imagem` por `url("nome-do-arquivo.png")`. Escolha `--ajuste`:
   - `cover` quando a proporção da imagem é parecida com a da tela (corta bordas, preenche tudo);
   - `contain` quando nada pode ser cortado (mostra a imagem inteira, com faixas).

   Com `cover`, use `--posicao: top center` para print de site e app, porque o topo é o que identifica a página. No post-feed, ajuste `--prop` para a proporção da arte (1 para 1080x1080, 1.25 para 1080x1350) e edite perfil e legenda no HTML com o que o usuário passou. Pronto quando nenhum marcador "Sua tela aqui", "Seu app aqui" ou "Sua arte aqui" sobra na cópia.

4. **Ajuste fundo e ângulo.** Troque `--fundo-1` e `--fundo-2` pelas cores da marca do usuário, se ele tiver, ou mantenha as neutras. Para dar perspectiva, use `--rotacao-y` entre `-14deg` e `14deg` e `--rotacao-x` entre `0deg` e `10deg`. Pronto quando a cena passa nas regras de qualidade de contraste e margem.

5. **Exporte em 1x e 2x.** Ache o navegador e rode uma vez por escala. Caminhos comuns no Windows:
   - `C:\Program Files\Google\Chrome\Application\chrome.exe`
   - `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`

   No Mac, `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. No Linux, `google-chrome` ou `chromium`.

   ```bash
   "<navegador>" --headless=new --disable-gpu --hide-scrollbars \
     --window-size=1080,1350 --force-device-scale-factor=1 \
     --screenshot="<pasta>/notebook-1080x1350-1x.png" "file:///<pasta>/notebook.html"

   "<navegador>" --headless=new --disable-gpu --hide-scrollbars \
     --window-size=1080,1350 --force-device-scale-factor=2 \
     --screenshot="<pasta>/notebook-1080x1350-2x.png" "file:///<pasta>/notebook.html"
   ```

   Use caminho absoluto no `--screenshot` e na URL `file:///`, com barras normais (`/`). No Git Bash, barra invertida seguida de `$` some do caminho. A linha "bytes written to file" confirma a gravação; avisos de `mojo` ou `gpu` no terminal podem ser ignorados.

   **Alternativa:** se o projeto já for uma composição HyperFrames e a CLI estiver instalada, `npx hyperframes snapshot` também grava o quadro em PNG. Para o mockup estático, o navegador headless continua sendo o caminho padrão, porque controla o tamanho e a escala exatos.

   Pronto quando existem os dois PNG por formato pedido, com as dimensões da tabela de tamanhos.

6. **Confira o resultado.** Abra cada PNG e passe pelas regras de qualidade. Confira as dimensões em pixels (1x igual à janela, 2x o dobro). Pronto quando todas as regras passam; se uma falhar, volte ao passo 3 ou 4 e exporte de novo.

7. **Entregue.** Informe ao usuário o caminho de cada PNG, o tamanho em pixels e qual usar onde (1x para postar, 2x para impressão, zoom ou telas de alta densidade).

## Regras de qualidade

- **Nitidez.** O texto do print precisa ser legível no PNG 1x. Imagem de entrada menor que a área da tela no 2x fica borrada: avise o usuário e peça uma versão maior, em vez de ampliar.
- **Sem distorção.** A imagem do usuário mantém a proporção original. Use só `cover` ou `contain`. Nunca estique com `100% 100%`.
- **Contraste do fundo.** O aparelho precisa se destacar do fundo: moldura escura pede fundo claro ou médio; fundo escuro pede `--aro` claro. A arte do post não pode sumir no fundo da cena.
- **Margem segura.** O aparelho e a sombra ficam a pelo menos 6% de cada borda. Em 1080x1920, deixe o topo e a base livres para os elementos da própria rede social.
- **Moldura genérica.** Os modelos desenham um aparelho genérico. Mantenha assim.
- **Conteúdo real.** O que aparece na tela é a imagem que o usuário enviou ou a página que ele indicou.

## O que não fazer

- Não use logotipo, nome de modelo ou desenho característico de fabricante (símbolo da marca, nome do aparelho, recorte de câmera que imita um modelo específico). O mockup precisa servir para qualquer marca sem gerar problema de uso de marca.
- Não invente print. Se o usuário não tem a tela pronta, diga isso e ofereça montar a tela antes, como trabalho separado. Um mockup com interface inventada passa a impressão de um produto que não existe.
- Não entregue PNG com o marcador cinza dos modelos.
- Não envie a imagem do usuário para serviço on-line de mockup nem baixe molduras de terceiros.

## Exemplo de pedido

> Tenho o print do meu sistema em `prints/painel.png`. Faça um mockup no notebook para post 4:5 e um para slide 16:9, fundo azul-escuro da minha marca (#0f1b3d), com leve perspectiva.

Resposta esperada: cópia de `notebook.html` em `mockups/` com `--imagem: url("painel.png")`, `--fundo-1` e `--fundo-2` em tons de `#0f1b3d`, `--aro` claro para destacar a moldura no fundo escuro, `--rotacao-y: -10deg`, e quatro arquivos: `notebook-1080x1350-1x.png`, `notebook-1080x1350-2x.png`, `notebook-1920x1080-1x.png`, `notebook-1920x1080-2x.png`.
