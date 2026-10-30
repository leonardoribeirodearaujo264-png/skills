---
name: escrever-faq-objecoes
description: Recebe uma lista de objeções do comprador e escreve a seção de perguntas frequentes, respondendo cada uma com um fato verificável do produto. Use quando pedirem FAQ, perguntas frequentes, respostas às objeções ou quando já houver uma lista de objeções (por exemplo, vinda da skill levantar-objecoes) que precisa virar texto da página.
---

# Escrever FAQ de objeções

Transforma objeções em pares de pergunta e resposta para a página de vendas. Cada resposta se apoia em um fato do produto (o que está incluído, como funciona, prazo, garantia, suporte) e nunca em pressão ou opinião. Quando não houver fato que responda, a skill avisa em vez de inventar.

## Quando usar

- Existe uma lista de objeções e falta escrever as respostas.
- A página não tem FAQ, ou o FAQ atual responde coisas que ninguém pergunta.
- O time de vendas ou o suporte repete as mesmas respostas e quer padronizar.

Use outra skill quando for o caso:
- Ainda não sabe quais são as objeções: levantar-objecoes antes desta.
- Quer usar a dor do público para abrir um anúncio: criar-10-angulos-dor.
- Lista do que o cliente ganha: escrever-beneficios.

## O que pedir antes

- A lista de objeções, com a frase como o cliente fala, se possível.
- Ficha do produto: o que inclui, formato, duração, acesso, suporte, garantia, formas de pagamento, política de reembolso.
- Público e nível de familiaridade com o tema.
- Área regulada (saúde, direito, finanças, nutrição, psicologia etc.), se houver, e o conselho da profissão.

Sem a ficha do produto, peça. Resposta de FAQ sem fato é opinião.

## Passo a passo

1. **Normalize as objeções.** Reescreva cada uma como pergunta na voz do cliente ("Funciona se eu nunca fiz isso?"), nunca na voz da empresa. Una as repetidas. Pronto quando cada objeção vira uma pergunta única que um cliente faria.
2. **Classifique.** Marque cada pergunta com uma categoria:
   - Preço.
   - Capacidade ("funciona para mim?").
   - Resultado esperado (quanto, em quanto tempo, se é garantido).
   - Risco (garantia e reembolso).
   - Tempo (quanto tempo por dia ou semana a pessoa precisa dedicar).
   - Confiança (quem está por trás, se é sério).
   - Logística (acesso, pagamento, suporte).
   Pronto quando todas têm categoria.
3. **Ache o fato.** Para cada pergunta, aponte o item da ficha que a responde. Sem fato disponível, marque "SEM FATO" e não escreva a resposta. Pronto quando toda pergunta tem um fato ou a marca SEM FATO.
4. **Escreva a resposta.** Comece com sim, não ou a informação direta, sem enrolar. Depois o fato. Depois, se couber, o que a pessoa faz a seguir. Até 60 palavras, contadas com ferramenta (script ou contador do editor). Em "resultado esperado", responda com o que o produto faz e o que depende da pessoa, nunca com número de resultado que o usuário não forneceu. Depoimento ou número só se fornecido; senão [DEPOIMENTO REAL] ou [NÚMERO REAL]. Pronto quando a primeira frase responde a pergunta sozinha.
5. **Retire pressão e opinião.** Nenhuma resposta usa escassez, prazo ou bônus que acaba se isso não for real e documentado. Nenhuma diminui a dúvida do cliente ("isso é desculpa"). Retire também opinião sem fato da ficha ("é tão bom quanto o presencial", "você vai conseguir, com certeza"). Pronto quando cada frase de cada resposta tem um fato da ficha por trás e pode ser lida pelo suporte sem constrangimento.
6. **Revise a regra do conselho, se a área for regulada.** Retire ou reescreva promessa de resultado, número de resultado (quilos, causas ganhas, retorno), antes e depois, preço ou gratuidade quando o conselho da profissão vedar. Na dúvida sobre a regra atual, retire e peça ao usuário para confirmar com o conselho. Marque cada trecho em "Atenção:". Pronto quando "Atenção:" lista cada trecho alterado ou diz "nenhum".
7. **Ordene.** Preço, capacidade, resultado esperado, risco, tempo, confiança e, por último, logística. Limite a 6 a 10 perguntas na página; o resto vai para o suporte. Pronto quando a ordem segue as categorias nessa sequência.
8. **Liste as lacunas.** Junte as perguntas SEM FATO e diga o que o dono precisa decidir ou informar. Pronto quando cada lacuna tem a informação que falta.

## Saída

```text
FAQ: [PRODUTO]

1. [PERGUNTA NA VOZ DO CLIENTE]
   [RESPOSTA]
   Categoria: [preço | capacidade | resultado esperado | risco | tempo | confiança | logística]
   Fato usado: [item da ficha]
   Palavras: [N]

2. ...

Contagem feita com: [script | editor]

Lacunas (sem fato no produto):
- [PERGUNTA]: falta [informação ou decisão do dono]

Fora da página (vai para o suporte): [perguntas além das 10 | nenhuma]

Atenção: [trechos com risco regulatório, o que foi alterado e por qual regra, ou "nenhum"]
```

## Erros comuns

- Responder com promessa ("você vai conseguir, com certeza") em vez de fato do produto.
- Inventar garantia, prazo de reembolso ou forma de pagamento que o usuário não informou.
- Pergunta escrita na voz da empresa ("Qual a metodologia exclusiva?") que nenhum cliente faria.
- Responder "quantos quilos vou perder?" com número em área de saúde.
- Usar o FAQ para criar urgência ("as vagas estão acabando") sem que isso seja real.
