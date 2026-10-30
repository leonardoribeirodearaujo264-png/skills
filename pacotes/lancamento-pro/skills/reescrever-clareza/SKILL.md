---
name: reescrever-clareza
description: Reescreve um texto confuso, longo ou cheio de jargão para que o leitor entenda na primeira leitura, sem mudar o sentido nem o tom, e mostra os problemas encontrados com a correção de cada um. Use quando pedirem para deixar mais claro, simplificar, enxugar, cortar texto, tirar jargão ou quando o leitor "não entende o que estamos vendendo".
---

# Reescrever com clareza

Diagnostica o que atrapalha a leitura e reescreve o texto para ser entendido de primeira. O sentido, os fatos e o tom da marca ficam. O resultado é a versão nova, a lista de problemas com a correção aplicada e a comparação de tamanho antes e depois, medida com uma regra de contagem fixa.

## Quando usar

- O texto está longo, com frases que precisam ser lidas duas vezes.
- Há jargão técnico ou do mercado que o público não usa.
- Alguém leu a página e não soube dizer o que é vendido.
- Antes de publicar qualquer trecho, como última passada.

Use outra skill quando for o caso:
- O texto está claro, mas soa diferente da marca: adaptar-tom-voz.
- Falta o título ou ele não diz o resultado: escrever-headline.
- A lista de recursos precisa virar ganhos: escrever-beneficios.

## O que pedir antes

- O texto original e onde ele aparece (página, seção, e-mail, anúncio).
- Público e o nível de conhecimento dele sobre o tema.
- Termos técnicos que precisam ficar (exigência legal, nome de produto).
- Se há limite de tamanho, em palavras ou caracteres.
- Se a pessoa gramatical pode mudar (por exemplo, de "a plataforma" para "você").

## Regra de contagem

Use a mesma regra nos passos 2, 3 e 7, antes e depois.
- Palavra: cada trecho separado por espaço que tem ao menos uma letra ou um dígito. "R$" sozinho não conta; "29,90", "NFS-e" e "14" contam como uma palavra cada.
- Frase: termina em ponto final, interrogação ou exclamação. Título, item de lista e botão contam como uma frase cada, mesmo sem ponto.
- Escreva a regra usada na Saída se o usuário pedir outra.

## Passo a passo

1. **Escreva a ideia central.** Uma frase dizendo o que o texto quer que o leitor entenda e faça. Se não for possível, o primeiro problema é falta de foco: aponte, faça a pergunta ao usuário e siga com a suposição mais provável marcada como [CONFIRMAR]. Pronto quando a frase existe, confirmada ou marcada.
2. **Diagnostique.** Marque no original cada ocorrência de: frase com mais de 25 palavras, voz passiva desnecessária, jargão, palavra abstrata sem exemplo, duas ideias na mesma frase, repetição, rodeio antes do ponto, pronome com referência ambígua. Pronto quando cada problema tem o trecho citado.
3. **Reescreva.** Uma ideia por frase. Sujeito, verbo e complemento na ordem direta. Troque jargão por palavra comum ou explique na primeira vez. Troque abstrato por exemplo concreto. Comece cada parágrafo pelo ponto principal. Só mude a pessoa gramatical se o usuário permitiu. Pronto quando nenhuma frase passa de 25 palavras pela regra de contagem.
4. **Preserve o que não pode mudar.** Fatos, números, preços, prazos, garantias, termos legais e o tom. Pronto quando todos estão iguais ao original.
5. **Corte.** Retire o que não serve à ideia central. Pronto quando cada parágrafo ajuda a entender ou a agir.
6. **Revise riscos.** Simplificar não pode transformar "pode ajudar" em "resolve", nem criar urgência ou escassez falsa. Em saúde, direito e finanças, marque com "Atenção:" a simplificação que mude o alcance de uma afirmação. Pronto quando o texto novo não promete mais que o original.
7. **Meça.** Pela regra de contagem, conte palavras e frases antes e depois e calcule a média de palavras por frase. Compare com o limite pedido. Pronto quando os números e o resultado do limite estão escritos.

## Saída

```text
Local: [onde o texto aparece]
Ideia central: [UMA FRASE]

Texto reescrito
[TEXTO]

Problemas corrigidos
- [tipo]: "[TRECHO ORIGINAL]" virou "[TRECHO NOVO]"
- ...

Antes: [N] palavras, [N] frases, média [N] por frase
Depois: [N] palavras, [N] frases, média [N] por frase
Limite: [N palavras ou "sem limite"], cumprido [sim | não]

Termos mantidos de propósito: [lista ou "nenhum"]
Suposições a confirmar: [lista ou "nenhuma"]
Atenção: [riscos ou "nenhum"]
```

## Erros comuns

- Simplificar a ponto de mudar o sentido ou exagerar a promessa.
- Cortar a informação que o leitor precisava (preço, prazo, o que acontece depois).
- Trocar o tom da marca junto com a clareza; tom é com adaptar-tom-voz.
- Manter jargão porque "todo mundo do setor entende", quando o público não é do setor.
- Contar palavras com uma regra antes e outra depois, o que torna a comparação inútil.
