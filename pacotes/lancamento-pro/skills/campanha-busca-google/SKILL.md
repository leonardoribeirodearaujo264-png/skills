---
name: campanha-busca-google
description: Planeja uma campanha de pesquisa no Google Ads a partir dos termos, volumes e custos que o usuário exportou, com grupos por intenção, tipos de correspondência, palavras negativas, anúncios responsivos e orçamento ligado ao CPA máximo. Use quando o usuário quiser anunciar no Google para quem busca o produto, o serviço ou o problema, ou revisar uma campanha de pesquisa existente.
---

# Campanha de busca Google

Resultado: um plano de campanha de pesquisa pronto para o usuário configurar, com grupos de anúncios por intenção, palavras-chave com correspondência, lista de negativas, textos dos anúncios e a conta do orçamento. Volume e custo por clique vêm do que o usuário exportar do planejador de palavras-chave ou do histórico. A skill não acessa a conta.

## Quando usar

- Produto ou serviço que as pessoas já procuram pelo nome ou pelo problema.
- Lançamento com marca conhecida, para proteger buscas pelo nome do produto.
- Revisão de campanha de pesquisa com relatório de termos de pesquisa colado.

Para Facebook e Instagram, use estrutura-campanha-meta. Para ler o desempenho de forma geral, use ler-relatorio-anuncios. Para a nomenclatura das URLs, use montar-utms.

## O que pedir antes

- Produto, oferta, página de destino e região atendida.
- Lista de termos com volume e custo estimado por clique, exportada pelo usuário. Sem ela, gere só a lista de termos candidatos e peça para o usuário medir volume e custo antes de definir orçamento.
- Relatório de termos de pesquisa, se a campanha já existe.
- CPA máximo e taxa de conversão da página, se houver histórico. Sem taxa real, a conta de orçamento fica pendente.
- Orçamento diário disponível.
- Área regulada e restrições do conselho profissional sobre anúncios.

## Passo a passo

1. **Separe os termos por intenção.** Marca (nome do produto ou empresa), solução (o tipo de produto ou serviço), problema (a dor descrita com as palavras do cliente) e concorrente, se o usuário quiser. Pronto quando cada termo está em uma intenção.
2. **Crie um grupo de anúncios por intenção ou tema próximo.** Cada grupo com termos que um mesmo anúncio responde bem. Pronto quando nenhum grupo mistura intenções.
3. **Escolha a correspondência.** Exata para termos de alta intenção e controle; de frase para variações próximas; ampla só se o usuário aceita gastar descobrindo termos e acompanha o relatório. O comportamento de cada tipo muda com o tempo; descreva o conceito. Pronto quando cada palavra tem tipo e motivo.
4. **Monte as negativas.** Termos que trazem clique sem intenção de compra: grátis, emprego, curso, download, o que o relatório de termos do usuário mostrar. Pronto quando há lista de negativas por campanha e por grupo.
5. **Escreva os anúncios responsivos.** Por grupo, vários títulos e descrições curtos, com o termo principal, a oferta, uma prova real e o CTA. Os limites de quantidade e de caracteres mudam; confira os atuais. Pronto quando cada grupo tem títulos e descrições contados em caracteres.
6. **Sugira os recursos do anúncio.** Links extras, frases de destaque, telefone, local, conforme o negócio. Pronto quando a lista está ligada ao que o usuário oferece de verdade.
7. **Faça a conta do orçamento.** CPC máximo aceitável = CPA máximo x taxa de conversão da página. Cliques por dia = orçamento diário / CPC médio estimado. Conversões esperadas = cliques x taxa de conversão. Use só números do usuário. Pronto quando a conta está aberta ou marcada como pendente.

## Saída

```text
Campanha: [nome] | Região: [região] | Orçamento diário: R$ [valor]
CPC máximo aceitável: R$ [valor] (CPA máximo R$ [x] x conversão [y]%)

| Grupo | Intenção | Palavra-chave | Correspondência | Volume | CPC estimado |

Negativas: [lista]

Anúncios do grupo [nome]
Títulos: [texto] ([n] caracteres) ...
Descrições: [texto] ([n] caracteres) ...
URL final: [com UTM]

Recursos: [lista]
A confirmar na plataforma: [limites de texto, comportamento das correspondências]
```

## Erros comuns

- Usar só correspondência ampla sem negativas e pagar por busca sem intenção.
- Um grupo com dezenas de termos de intenções diferentes e um anúncio genérico.
- Definir orçamento sem taxa de conversão real da página.
- Prometer resultado no texto do anúncio em área regulada.
- Nunca olhar o relatório de termos de pesquisa depois que a campanha roda.

## Exemplo de pedido

> Use a campanha-busca-google. Sou dentista em Campinas, quero anunciar implante. Segue o CSV que exportei do planejador de palavras-chave.
