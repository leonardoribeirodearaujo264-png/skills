# Métricas do lançamento

Use quando tiver relatórios exportados de anúncios, página, e-mail ou checkout e quiser saber em que etapa do funil está perdendo gente e o que fazer primeiro.

No Claude Code:

```text
Use o agente analista-metricas para ler os números do lançamento de [SEU PRODUTO] no período de [DATA INICIAL] a [DATA FINAL].
Arquivos: [RELATÓRIO DO META ADS, DO GOOGLE ADS, DO CHECKOUT, DA FERRAMENTA DE E-MAIL]
Preço e custos: [PREÇO, TAXAS, IMPOSTO, CUSTO POR VENDA]
Metas que eu tinha: [CPA, TAXA DE CONVERSÃO, ROAS OU "NÃO TINHA"]
Quero o funil com a taxa de cada etapa e a conta mostrada, a maior perda, quantas vendas não têm origem rastreada e as recomendações com quem do time executa.
Se ele recomendar pausar ou escalar algum conjunto, chame o agente gestor-anuncios-meta para detalhar a mudança e deixe tudo na lista para eu aprovar.
Nada é publicado, enviado, comprado ou pago sem o meu OK.
```

No Codex (cite cada agente pelo nome):

```text
Chame o agente analista-metricas para ler os relatórios do lançamento de [SEU PRODUTO] de [DATA INICIAL] a [DATA FINAL] e mostrar onde o funil perde gente, com a conta de cada taxa. Se houver recomendação de pausa ou escala, chame o agente gestor-anuncios-meta para detalhar.
Arquivos: [LISTA DE ARQUIVOS EXPORTADOS]
Preço e custos: [PREÇO, TAXAS, IMPOSTO, CUSTO POR VENDA]
Metas: [CPA, CONVERSÃO, ROAS OU "NÃO TINHA"]
Não altere nada nas contas de anúncio.
Nada é publicado, enviado, comprado ou pago sem o meu OK.
```
