---
name: campanha-busca-google
description: Planeja uma campanha de pesquisa no Google Ads a partir dos termos, volumes e custos que o usuário exportou, com grupos por intenção, tipos de correspondência, palavras negativas, anúncios responsivos e orçamento ligado ao CPA máximo. Use quando o usuário quiser anunciar no Google para quem busca o produto, o serviço ou o problema, ou revisar uma campanha de pesquisa existente.
---

# Campanha de busca Google

Resultado: um plano de campanha de pesquisa pronto para o usuário configurar, com grupos de anúncios por intenção, palavras-chave com correspondência, lista de negativas, textos dos anúncios e a conta do orçamento. Volume e custo por clique vêm do que o usuário exportar do planejador de palavras-chave ou do histórico. A skill não acessa a conta nem sobe nada.

## Quando usar

- Produto ou serviço que as pessoas já procuram pelo nome ou pelo problema.
- Lançamento com marca conhecida, para proteger buscas pelo nome do produto.
- Revisão de campanha de pesquisa com relatório de termos de pesquisa colado.

Para Facebook e Instagram, use estrutura-campanha-meta. Para ler o desempenho de forma geral, use ler-relatorio-anuncios. Para a nomenclatura das URLs, use montar-utms. Para chegar ao CPA máximo, use calcular-cpa-maximo.

## O que pedir antes

- Produto, oferta, página de destino e região atendida.
- Lista de termos com volume mensal e custo por clique, exportada pelo usuário. O planejador costuma exportar uma faixa (lance baixo e alto do topo da página), não um CPC médio. Sem a lista, gere só os termos candidatos e peça para o usuário medir volume e custo antes de definir orçamento.
- Relatório de termos de pesquisa, se a campanha já existe.
- CPA máximo e qual conversão ele mede (lead, teste grátis, venda, assinatura paga).
- Taxa de conversão do clique até essa mesma conversão, com histórico real. Se o funil tem etapas (clique, teste, assinatura), peça a taxa de cada etapa e multiplique. Sem taxa real, a conta de orçamento fica pendente.
- CTR histórico, se houver.
- Orçamento diário disponível.
- Área regulada e restrições do conselho profissional sobre anúncios.

## Passo a passo

1. **Separe os termos por intenção.** Marca (nome do produto ou empresa), solução (o tipo de produto ou serviço), problema (a dor descrita com as palavras do cliente) e concorrente, se o usuário quiser. Termo sem ligação com a oferta (emprego, formação, outro produto) fica fora e vai para a lista de negativas. Pronto quando cada termo está em uma intenção ou fora, com motivo.
2. **Crie um grupo de anúncios por intenção ou tema próximo.** Cada grupo com termos que um mesmo anúncio responde bem. Pronto quando nenhum grupo mistura intenções.
3. **Escolha a correspondência.** Exata para termos de alta intenção e controle; de frase para variações próximas; ampla só se o usuário aceita gastar descobrindo termos e acompanha o relatório. O comportamento de cada tipo muda com o tempo; descreva o conceito. Pronto quando cada palavra tem tipo e motivo.
4. **Monte as negativas.** Termos que trazem clique sem intenção de compra: emprego, vaga, download, o que o relatório de termos do usuário mostrar. Antes de incluir cada negativa, confira contra a oferta: não negative termo que descreve a própria oferta ("grátis" quando há teste grátis, "curso" quando o produto é curso, "online" quando o serviço é online). Pronto quando há lista de negativas por campanha e por grupo e nenhuma bate com a oferta.
5. **Escreva os anúncios responsivos.** Por grupo, vários títulos e descrições curtos, com o termo principal, a oferta, uma prova real e o CTA. Se a oferta é grátis só por um tempo, nenhum título pode ser lido como gratuito para sempre: diga o prazo ou fixe o título com o preço. Os limites de quantidade e de caracteres mudam; confira os atuais. Pronto quando cada grupo tem títulos e descrições contados em caracteres.
6. **Sugira os recursos do anúncio.** Links extras, frases de destaque, telefone, local, conforme o negócio. Pronto quando a lista está ligada ao que o usuário oferece de verdade.
7. **Faça a conta do orçamento.** Use só números do usuário.
   - Taxa de conversão (t): do clique até a conversão que o CPA mede. Funil com etapas: t = taxa da etapa 1 x taxa da etapa 2 (exemplo: 6% iniciam teste x 25% assinam = 1,5%).
   - CPC máximo aceitável = CPA máximo x t.
   - CPC médio estimado = soma de (volume x (baixo + alto) / 2) / soma dos volumes, só com os termos usados.
   - Cliques por dia = orçamento diário / CPC médio estimado.
   - Teto de volume: cliques por dia não pode passar de volume mensal somado / 30 x CTR esperado. Sem CTR real, use volume / 30 como teto absoluto e marque o CTR como pendente. Se o teto for menor, use o teto e avise que o limite é volume, não orçamento.
   - Conversões esperadas por dia = cliques por dia x t. CPA implícito = CPC médio / t.
   - Se o usuário não tiver taxa por grupo, escreva a premissa de que todos convertem igual; grupos de busca informativa costumam converter menos.
   Pronto quando cada linha está aberta com os valores, ou marcada como pendente com o dado que falta.

## Saída

```text
Campanha: [nome] | Região: [região] | Orçamento diário: R$ [valor]

| Grupo | Intenção | Palavra-chave | Correspondência e motivo | Volume | CPC baixo a alto |
Fora da campanha: [termos e motivo]

Negativas
- Campanha: [lista]
- Grupo [nome]: [lista]
- Mantidos fora das negativas por descrever a oferta: [termos]

Anúncios do grupo [nome]
Títulos: [texto] ([n] caracteres) ...
Descrições: [texto] ([n] caracteres) ...
URL final: [com UTM]
Atenção: [título que pode enganar, ou "nenhum"]

Recursos: [lista]

Conta do orçamento
Conversão medida pelo CPA: [qual] | t = [etapa x etapa] = [y]%
CPC máximo aceitável: R$ [CPA] x [t] = R$ [valor]
CPC médio estimado (ponto médio ponderado por volume): R$ [valor]
Cliques por dia: [orçamento] / [CPC médio] = [n] | Teto de volume: [n] -> usar [n]
Conversões por dia: [n] | por mês: [n] | CPA implícito: R$ [valor]
Leitura: [folga entre CPC médio e CPC máximo, termos acima do teto, limite por volume]
Premissas: [mesma taxa para todos os grupos, CTR pendente etc.]

A confirmar na plataforma: [limites de texto, comportamento das correspondências]
```

## Erros comuns

- Usar a taxa de conversão de uma etapa intermediária (início de teste) com o CPA de outra (assinatura paga), o que multiplica o CPC máximo.
- Prever mais cliques por dia do que buscas existem.
- Negativar "grátis" ou "curso" quando é exatamente isso que a oferta vende.
- Usar só correspondência ampla sem negativas e pagar por busca sem intenção.
- Prometer resultado no texto do anúncio em área regulada.

## Exemplo de pedido

> Use a campanha-busca-google. Sou dentista em Campinas, quero anunciar implante. Segue o CSV que exportei do planejador de palavras-chave.
