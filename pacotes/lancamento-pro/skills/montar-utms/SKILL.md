---
name: montar-utms
description: Define um padrão de nomenclatura de UTMs e gera as URLs rastreadas, prontas para colar, para cada campanha, conjunto e anúncio informados pelo usuário. Use quando o usuário pedir para criar UTMs, padronizar parâmetros de rastreamento ou descobrir de qual anúncio veio uma venda.
---

# Montar UTMs

Entrega o padrão de nomes do pacote, usado também por estrutura-campanha-meta e publicos-semelhantes, e uma convenção de nomes curta e uma tabela de URLs com parâmetros UTM, uma por anúncio ou peça, para o usuário colar na plataforma. Com a convenção fixa, a venda que aparece na ferramenta de análise ou no checkout pode ser ligada ao anúncio de origem.

## Quando usar

- Antes de subir campanhas de um lançamento, para que toda peça saia com rastreio.
- Quando o relatório de vendas mostra "direto" ou "não atribuído" demais.
- Para padronizar UTMs de e-mail, WhatsApp, bio e anúncios no mesmo esquema.

Para montar a estrutura das campanhas em si, use estrutura-campanha-meta ou campanha-busca-google. Para ler os resultados depois, use ler-relatorio-anuncios.

## O que pedir antes

- URL de destino de cada página (vendas, captura, checkout).
- Lista de canais e campanhas: plataforma, nome da campanha, conjuntos ou grupos, anúncios.
- Se o usuário já tem um padrão em uso. Se tiver, adapte em vez de trocar, para não quebrar o histórico.
- Onde a venda é lida (ferramenta de análise, plataforma de pagamento, CRM) e se ela preserva os parâmetros até o checkout. Isso o usuário confirma testando.

## Passo a passo

1. **Fixe o padrão de nomes.** É o padrão único do pacote. Regras: minúsculas, sem acento, sem espaço, hífen dentro do bloco, sublinhado entre blocos. O nome do item na plataforma e o valor da UTM são o mesmo texto.

   | Item | Formato | Exemplo | Vai em |
   |---|---|---|---|
   | Campanha | `[fase]_[objetivo]_[aaaa-mm-dd]` (data de início) | `carrinho_compra_2026-11-24` | `utm_campaign` |
   | Conjunto ou grupo | `[publico]_[faixa]_[posicionamento]` | `lal-compradores-180d_1pct_auto` | `utm_term` |
   | Anúncio | `[formato]_[angulo]_[versao]` | `video_depoimento-aluna_v1` | `utm_content` |
   | Público salvo | `[plataforma]_[publico]_[faixa]` | `meta_lal-compradores-180d_1pct` | não vai na UTM |

   Blocos: `[publico]` = tipo-fonte-período, com tipo `frio`, `amplo`, `lal`, `rmk` ou `lista` (ex.: `frio-confeitaria`, `amplo`, `rmk-site-30d`, `lista-leads-180d`). `[faixa]` = faixa de semelhança (`1pct`, `1-3pct`) em semelhante, faixa etária (`25-55`) em frio, ou `todos` quando não há faixa. `[posicionamento]` = `auto` ou o posicionamento escolhido (`feed`, `stories`, `reels`). No Google, o grupo usa o tema da palavra-chave no lugar de `[publico]`, `todos` na faixa e `busca` no posicionamento. Em e-mail, `[formato]` é `email-01`, `email-02` e assim por diante. Pronto quando o padrão está registrado e o usuário aprovou.
2. **Fixe source e medium.**
   - `utm_source`: `facebook` para todo anúncio do Meta, porque o mesmo anúncio roda no Facebook e no Instagram ao mesmo tempo e uma UTM fixa não separa os dois. Para separar, use o marcador dinâmico de posicionamento do passo 5. Demais: `google`, `email`, `whatsapp`; `instagram` só para link orgânico da bio ou do perfil.
   - `utm_medium`: `paid_social`, `cpc`, `email`, `organic`, `whatsapp`.
   Pronto quando cada canal tem source e medium definidos.
3. **Gere um nome por item.** Aplique o padrão a cada campanha, conjunto e anúncio da lista. Anúncio diferente é criativo diferente: o mesmo criativo em dois conjuntos mantém o mesmo `utm_content` e se distingue pelo `utm_term`. Pronto quando não há dois criativos diferentes com o mesmo `utm_content`.
4. **Monte as URLs.** URL base + `?` (ou `&` se a URL já tiver parâmetros) + pares `chave=valor` separados por `&`. Codifique caracteres especiais. No Google Ads, a marcação automática (gclid) continua ligada e convive com as UTMs manuais; coloque as UTMs no sufixo do URL final ou no modelo de acompanhamento, conforme a conta, e peça para o usuário conferir o nome atual do campo. Pronto quando cada URL abre sem erro de formato.
5. **Indique parâmetros dinâmicos, se o usuário quiser.** As plataformas oferecem marcadores que preenchem nome de campanha, conjunto ou anúncio automaticamente, mas a sintaxe e os nomes mudam. Descreva o conceito e peça para o usuário conferir na documentação atual da plataforma antes de usar. Pronto quando o aviso está escrito junto da sugestão.
6. **Proteja dados pessoais.** Nunca coloque nome, e-mail, telefone ou CPF em UTM. Pronto quando nenhum parâmetro carrega dado pessoal.
7. **Defina o teste.** Peça para o usuário abrir uma URL, passar pela página até o checkout e conferir se os parâmetros chegaram onde a venda é registrada. Pronto quando o teste está descrito e o resultado fica com o usuário.

## Saída

```text
Padrão de nomes (aprovado)
Campanha [fase]_[objetivo]_[aaaa-mm-dd] -> utm_campaign
Conjunto [publico]_[faixa]_[posicionamento] -> utm_term
Anúncio [formato]_[angulo]_[versao] -> utm_content
Público salvo [plataforma]_[publico]_[faixa]
Source/medium: [canal] = [source] / [medium]

| Plataforma | Campanha | Conjunto/Grupo | Anúncio | URL final |
| ... | ... | ... | ... | https://site.com/pagina?utm_source=...&utm_medium=...&utm_campaign=...&utm_content=...&utm_term=... |

Google: marcação automática ligada? [sim/não, usuário confirma] | UTMs em: [sufixo do URL final ou modelo de acompanhamento]
Parâmetros dinâmicos: [sugestão + "conferir sintaxe atual na plataforma"]
Teste: [passos para o usuário validar até o checkout]
```

## Erros comuns

- Misturar maiúsculas e minúsculas e ver a mesma campanha dividida em duas no relatório.
- Repetir o mesmo `utm_content` em criativos diferentes, ou usar `utm_source=instagram` fixo em anúncio do Meta que também roda no Facebook.
- Usar `?` duas vezes quando a URL já tinha parâmetro.
- Trocar o padrão no meio do lançamento e perder a comparação histórica.
- Supor que o checkout guarda as UTMs sem testar.

## Exemplo de pedido

> Use o montar-utms para as campanhas do lançamento de junho: Meta com três conjuntos e oito anúncios, Google com dois grupos e os e-mails da sequência.
