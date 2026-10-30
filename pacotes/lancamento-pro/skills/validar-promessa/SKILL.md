---
name: validar-promessa
description: Confere cada promessa de uma oferta, página, anúncio ou roteiro e exige para cada uma uma prova ou um mecanismo que a sustente, reprovando ou reescrevendo com mais cuidado o que não tiver. Use quando a copy estiver pronta para revisão, antes de publicar ou de rodar anúncio, ou quando o dono quiser saber se pode dizer uma frase específica.
---

# Validar promessa

Auditoria das promessas de uma oferta. Cada promessa recebe um veredito: aprovada (tem prova ou mecanismo), aprovada com ajuste (precisa ser reduzida ou qualificada) ou reprovada (não tem prova nem mecanismo e sai). O resultado protege a credibilidade da oferta e reduz risco com plataforma de anúncio, consumidor e conselho profissional.

## Quando usar

- Página, anúncio, e-mail ou roteiro pronto para revisão.
- O dono quer usar uma frase forte e pergunta se pode.
- Depois de definir o ângulo, para checar se a frase-guia vira promessa sustentável.

Para criar o ângulo, use definir-angulo-venda. Para a garantia em si, use definir-garantia. Para reunir depoimentos que sirvam de prova, use extrair-linguagem-depoimentos. Esta skill avalia; não escreve a peça inteira.

## O que pedir antes

- O texto a revisar, em arquivo ou colado.
- Provas disponíveis: depoimentos autorizados, números do próprio negócio, prints, estudos citados, certificações.
- Como o produto funciona (o mecanismo): o que o cliente faz, em que ordem, por que dá resultado.
- Nicho e plataforma onde a peça vai rodar.

## Passo a passo

1. **Extraia as promessas.** Leia o texto com Read e liste toda frase que afirma resultado, prazo, facilidade, exclusividade, superioridade ou ausência de risco. Pronto quando cada promessa tem um código (P1, P2...) e a localização no texto.
2. **Classifique o tipo.** Resultado, Prazo, Facilidade, Exclusividade, Comparação, Segurança. Pronto quando cada promessa tem tipo.
3. **Procure a sustentação.** Para cada promessa, anote:
   - Prova: o que demonstra que acontece (depoimento autorizado com contexto, número real do negócio, caso documentado).
   - Mecanismo: o passo ou recurso do produto que explica por que acontece.
   Pronto quando cada promessa tem prova, mecanismo, ambos ou nenhum.
4. **Dê o veredito.**
   - Aprovada: tem prova, ou mecanismo claro e promessa proporcional a ele.
   - Aprovada com ajuste: sustentação parcial; reduza o alcance ("pode", "em média", prazo realista, "para quem aplica").
   - Reprovada: nem prova nem mecanismo, ou promessa proibida no nicho. Sai do texto.
   Pronto quando toda promessa tem veredito e motivo de uma linha.
5. **Cheque as regras do nicho.** Saúde: nada de cura garantida nem antes e depois que fira regra do conselho. Direito: nada de garantia de ganho de causa nem captação indevida. Finanças: nada de retorno garantido. Plataformas de anúncio também restringem promessa de renda e de corpo. Pronto quando cada promessa sensível tem o alerta escrito.
6. **Proponha a versão ajustada.** Para cada "aprovada com ajuste", escreva a nova frase. Para cada reprovada, diga o que precisaria existir para ela voltar (prova ou mecanismo). Pronto quando nenhuma promessa ajustada ou reprovada fica sem próximo passo.

## Saída

```text
Peça: [arquivo ou nome] | Nicho: [..] | Plataforma: [..]

| Cód | Promessa (local) | Tipo | Prova | Mecanismo | Veredito | Ajuste ou o que falta |
|---|---|---|---|---|---|---|
| P1 | "..." (seção 2) | Prazo | nenhuma | passo 3 do método | Ajuste | "..." |
| P2 | "..." (manchete) | Resultado | nenhuma | nenhum | Reprovada | precisa de [NÚMERO REAL] |

Resumo: [x] aprovadas, [y] com ajuste, [z] reprovadas
Alertas de nicho e plataforma: ...
```

## Erros comuns

- Aceitar o mecanismo como prova de resultado específico. Mecanismo explica; não garante número.
- Usar depoimento sem contexto ou sem autorização como prova.
- Aprovar promessa reprovada porque "todo mundo fala isso".
- Suavizar com "pode" uma promessa que continua impossível; se não há sustentação, ela sai.
- Ignorar promessas implícitas em imagem, vídeo ou legenda.
