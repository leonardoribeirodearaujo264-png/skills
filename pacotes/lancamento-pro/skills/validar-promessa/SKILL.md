---
name: validar-promessa
description: Confere cada promessa de uma oferta, página, anúncio, roteiro ou imagem e exige para cada uma uma prova ou um mecanismo que a sustente, reprovando, ajustando ou deixando em espera o que depende de norma ainda não conferida. Use quando a copy estiver pronta para revisão, antes de publicar ou de rodar anúncio, ou quando o dono quiser saber se pode dizer uma frase específica.
---

# Validar promessa

Auditoria das promessas de uma oferta. Cada promessa recebe um de quatro vereditos: aprovada (tem prova ou mecanismo), aprovada com ajuste (precisa ser reduzida ou qualificada), aguarda norma (depende de regra do conselho ou da plataforma que não foi conferida no texto original) ou reprovada (não tem prova nem mecanismo e sai). O resultado protege a credibilidade da oferta e reduz risco com plataforma de anúncio, consumidor e conselho profissional.

## Quando usar

- Página, anúncio, e-mail, roteiro ou criativo pronto para revisão.
- O dono quer usar uma frase forte e pergunta se pode.
- Depois de definir o ângulo, para checar se a frase-guia vira promessa sustentável.

Para criar o ângulo, use definir-angulo-venda. Para a garantia em si, use definir-garantia. Para reunir depoimentos que sirvam de prova, use extrair-linguagem-depoimentos. Esta skill avalia; não escreve a peça inteira.

## O que pedir antes

- O texto a revisar, em arquivo ou colado, e as imagens, vídeos ou descrições delas, com a legenda.
- Provas disponíveis: depoimentos autorizados, números do próprio negócio, prints, estudos citados, certificações.
- Como o produto funciona (o mecanismo): o que o cliente faz, em que ordem, por que dá resultado.
- Nicho e plataforma onde a peça vai rodar.
- Norma do conselho profissional que vale para o nicho (texto, link ou trecho) e a política de publicidade da plataforma, se o usuário tiver. Sem elas, os vereditos que dependem delas ficam em "aguarda norma".

## Passo a passo

1. **Extraia as promessas.** Leia o texto, a legenda e cada imagem ou vídeo. Liste toda frase que afirma resultado, prazo, facilidade, exclusividade, superioridade, ausência de risco, preço ou gratuidade, e toda promessa implícita na imagem (antes e depois, corpo, dinheiro, carro, print de faturamento). Pronto quando cada promessa tem um código (P1, P2...) e a localização (seção, legenda ou imagem).
2. **Classifique o tipo.** Resultado, Prazo, Facilidade, Exclusividade, Comparação, Segurança, Oferta/preço/gratuidade ("avaliação gratuita", "menor preço", "frete grátis", desconto, parcelamento). Pronto quando cada promessa tem tipo.
3. **Procure a sustentação.** Para cada promessa, anote:
   - Prova: o que demonstra que acontece (depoimento autorizado com contexto, número real do negócio, caso documentado, condição comercial confirmada pelo usuário).
   - Mecanismo: o passo ou recurso do produto que explica por que acontece.
   Pronto quando cada promessa tem prova, mecanismo, ambos ou nenhum.
4. **Cheque as regras do nicho e da plataforma.** Use só a norma e a política que o usuário forneceu. Para cada promessa sensível (saúde, direito, finanças, renda, corpo, preço e gratuidade em profissão regulada), escreva qual trecho da norma fornecida se aplica. Se a norma não foi fornecida, escreva "norma não conferida" e diga onde o usuário deve conferir (site do conselho, central de políticas da plataforma). Nunca cite número de resolução, artigo ou regra de memória como certa. Pronto quando cada promessa sensível tem o trecho aplicado ou "norma não conferida".
5. **Dê o veredito.**
   - Aprovada: tem prova, ou mecanismo claro e promessa proporcional a ele, e não depende de norma não conferida.
   - Aprovada com ajuste: sustentação parcial; reduza o alcance ("pode", "em média", prazo realista, "para quem aplica").
   - Aguarda norma: a promessa tem sustentação, mas depende de regra do conselho ou da plataforma marcada como "norma não conferida". Não vai ao ar até o usuário conferir.
   - Reprovada: nem prova nem mecanismo, ou proibida pela norma fornecida. Sai do texto.
   Use exatamente esses quatro nomes na Saída. Pronto quando toda promessa tem veredito e motivo de uma linha.
6. **Proponha o próximo passo.** Para cada "aprovada com ajuste", escreva a nova frase. Para cada "aguarda norma", diga qual regra conferir e onde. Para cada reprovada, diga o que precisaria existir para ela voltar (prova, mecanismo ou autorização da norma). Para promessa implícita em imagem, diga o que trocar na imagem. Pronto quando nenhuma promessa fora de "aprovada" fica sem próximo passo.

## Saída

```text
Peça: [arquivo ou nome] | Nicho: [..] | Plataforma: [..]
Norma do conselho: [conferida: fonte | não conferida]
Política da plataforma: [conferida: fonte | não conferida]

| Cód | Promessa (local) | Tipo | Prova | Mecanismo | Norma | Veredito | Próximo passo |
|---|---|---|---|---|---|---|---|
| P1 | "..." (seção 2) | Prazo | nenhuma | passo 3 do método | não se aplica | Aprovada com ajuste | "..." |
| P2 | "..." (manchete) | Resultado | nenhuma | nenhum | não se aplica | Reprovada | precisa de [NÚMERO REAL] |
| P3 | "Avaliação gratuita" (anúncio) | Oferta/preço/gratuidade | confirmada | não se aplica | não conferida | Aguarda norma | conferir no site do conselho |
| P4 | antes e depois (imagem 1) | Resultado | foto real autorizada | não se aplica | não conferida | Aguarda norma | conferir se a norma permite antes e depois |

Resumo: [a] aprovadas, [b] aprovadas com ajuste, [c] aguardam norma, [d] reprovadas
Alertas de nicho e plataforma: [trecho da norma fornecida ou "norma não conferida: conferir em ..."]
```

## Erros comuns

- Aceitar o mecanismo como prova de resultado específico. Mecanismo explica; não garante número.
- Citar resolução ou artigo de memória como se tivesse conferido o texto.
- Usar depoimento sem contexto ou sem autorização como prova.
- Aprovar promessa reprovada porque "todo mundo fala isso".
- Suavizar com "pode" uma promessa que continua impossível; se não há sustentação, ela sai.
