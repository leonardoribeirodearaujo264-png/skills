---
name: montar-utms
description: Define um padrão de nomenclatura de UTMs e gera as URLs rastreadas, prontas para colar, para cada campanha, conjunto e anúncio informados pelo usuário. Use quando o usuário pedir para criar UTMs, padronizar parâmetros de rastreamento ou descobrir de qual anúncio veio uma venda.
---

# Montar UTMs

Entrega uma convenção de nomes curta e uma tabela de URLs com parâmetros UTM, uma por anúncio ou peça, para o usuário colar na plataforma. Com a convenção fixa, a venda que aparece na ferramenta de análise ou no checkout pode ser ligada ao anúncio de origem.

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

1. **Fixe a convenção.** Proponha e registre:
   - `utm_source`: origem (facebook, instagram, google, email, whatsapp).
   - `utm_medium`: tipo de tráfego (cpc, paid_social, email, organic).
   - `utm_campaign`: lançamento e objetivo (lancamento-maio_vendas).
   - `utm_content`: peça ou anúncio (video-depoimento-01).
   - `utm_term`: público ou palavra-chave, quando fizer sentido.
   Regras: minúsculas, sem acento, sem espaço, hífen dentro do termo e sublinhado entre blocos. Pronto quando a convenção cabe em cinco linhas e o usuário aprovou.
2. **Gere um nome por item.** Aplique a convenção a cada campanha, conjunto e anúncio da lista. Pronto quando não há dois anúncios diferentes com o mesmo `utm_content`.
3. **Monte as URLs.** URL base + `?` (ou `&` se a URL já tiver parâmetros) + pares `chave=valor` separados por `&`. Codifique caracteres especiais. Pronto quando cada URL abre sem erro de formato.
4. **Indique parâmetros dinâmicos, se o usuário quiser.** As plataformas oferecem marcadores que preenchem nome de campanha, conjunto ou anúncio automaticamente, mas a sintaxe e os nomes mudam. Descreva o conceito e peça para o usuário conferir na documentação atual da plataforma antes de usar. Pronto quando o aviso está escrito junto da sugestão.
5. **Proteja dados pessoais.** Nunca coloque nome, e-mail, telefone ou CPF em UTM. Pronto quando nenhum parâmetro carrega dado pessoal.
6. **Defina o teste.** Peça para o usuário abrir uma URL, passar pela página até o checkout e conferir se os parâmetros chegaram onde a venda é registrada. Pronto quando o teste está descrito e o resultado fica com o usuário.

## Saída

```text
Convenção
utm_source=[...] | utm_medium=[...] | utm_campaign=[...] | utm_content=[...] | utm_term=[...]

| Plataforma | Campanha | Conjunto/Grupo | Anúncio | URL final |
| ... | ... | ... | ... | https://site.com/pagina?utm_source=...&utm_medium=...&utm_campaign=...&utm_content=... |

Parâmetros dinâmicos: [sugestão + "conferir sintaxe atual na plataforma"]
Teste: [passos para o usuário validar até o checkout]
```

## Erros comuns

- Misturar maiúsculas e minúsculas e ver a mesma campanha dividida em duas no relatório.
- Repetir o mesmo `utm_content` em anúncios diferentes.
- Usar `?` duas vezes quando a URL já tinha parâmetro.
- Trocar o padrão no meio do lançamento e perder a comparação histórica.
- Supor que o checkout guarda as UTMs sem testar.

## Exemplo de pedido

> Use o montar-utms para as campanhas do lançamento de junho: Meta com três conjuntos e oito anúncios, Google com dois grupos e os e-mails da sequência.
