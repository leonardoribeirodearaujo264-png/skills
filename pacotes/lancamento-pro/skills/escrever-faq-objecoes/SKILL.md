---
name: escrever-faq-objecoes
description: Recebe uma lista de objeções do comprador e escreve a seção de perguntas frequentes, respondendo cada uma com um fato verificável do produto. Use quando pedirem FAQ, perguntas frequentes, respostas às objeções ou quando já houver uma lista de objeções (por exemplo, vinda da skill levantar-objecoes) que precisa virar texto da página.
---

# Escrever FAQ de objeções

Transforma objeções em pares de pergunta e resposta para a página de vendas. Cada resposta se apoia em um fato do produto (o que está incluído, como funciona, prazo, garantia, suporte) e nunca em pressão. Quando não houver fato que responda, a skill avisa em vez de inventar.

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
- Área regulada (saúde, direito, finanças), se houver.

Sem a ficha do produto, peça. Resposta de FAQ sem fato é opinião.

## Passo a passo

1. **Normalize as objeções.** Reescreva cada uma como pergunta na voz do cliente ("Funciona se eu nunca fiz isso?"). Una as repetidas. Pronto quando cada objeção vira uma pergunta única.
2. **Classifique.** Marque cada pergunta como preço, tempo, capacidade ("funciona para mim?"), confiança, logística (acesso, pagamento, suporte) ou risco (garantia). Pronto quando todas têm categoria.
3. **Ache o fato.** Para cada pergunta, aponte o item da ficha que a responde. Sem fato disponível, marque "SEM FATO" e não escreva a resposta. Pronto quando toda pergunta tem um fato ou a marca SEM FATO.
4. **Escreva a resposta.** Comece com sim, não ou a informação direta. Depois o fato. Depois, se couber, o que a pessoa faz a seguir. Até 60 palavras. Depoimento ou número só se fornecido; senão [DEPOIMENTO REAL] ou [NÚMERO REAL]. Pronto quando a primeira frase responde a pergunta sozinha.
5. **Retire pressão.** Nenhuma resposta usa escassez, prazo ou bônus que acaba se isso não for real e documentado. Nenhuma diminui a dúvida do cliente ("isso é desculpa"). Pronto quando cada resposta pode ser lida pelo suporte sem constrangimento.
6. **Ordene.** Preço, capacidade e risco primeiro; logística por último. Limite a 6 a 10 perguntas na página; o resto vai para o suporte. Pronto quando a ordem segue as categorias.
7. **Liste as lacunas.** Junte as perguntas SEM FATO e diga o que o dono precisa decidir ou informar. Pronto quando cada lacuna tem a informação que falta.

## Saída

```text
FAQ: [PRODUTO]

1. [PERGUNTA NA VOZ DO CLIENTE]
   [RESPOSTA]
   Categoria: [preço | tempo | capacidade | confiança | logística | risco]
   Fato usado: [item da ficha]

2. ...

Lacunas (sem fato no produto):
- [PERGUNTA]: falta [informação ou decisão do dono]

Atenção: [trechos com risco regulatório ou "nenhum"]
```

## Erros comuns

- Responder com promessa ("você vai conseguir, com certeza") em vez de fato do produto.
- Inventar garantia, prazo de reembolso ou forma de pagamento que o usuário não informou.
- Pergunta escrita na voz da empresa ("Qual a metodologia exclusiva?") que nenhum cliente faria.
- Resposta que enrola antes de dizer sim ou não.
- Usar o FAQ para criar urgência ("as vagas estão acabando") sem que isso seja real.
