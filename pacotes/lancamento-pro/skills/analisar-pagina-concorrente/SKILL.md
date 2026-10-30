---
name: analisar-pagina-concorrente
description: Estuda a estrutura e os argumentos de uma página de vendas concorrente (ordem dos blocos, promessa, mecanismo, provas, oferta, garantia, CTA) sem copiar texto, e devolve uma lista do que fazer diferente na sua oferta. Use quando o usuário trouxer a URL, o arquivo, um print, uma descrição ou a transcrição do vídeo de uma página concorrente e quiser entender como ela vende e onde se diferenciar.
---

# Analisar página concorrente

Leitura estrutural de uma página concorrente. O resultado não é um resumo nem um modelo para imitar: é a planta da página (o que vem em que ordem e com que função), os argumentos usados com a avaliação de cada um e, principalmente, a lista do que a sua oferta deve fazer diferente. Nenhum trecho do concorrente vai para a saída.

## Quando usar

- Antes de definir ângulo e promessa, para não repetir o que o mercado já diz.
- Quando o dono diz "quero uma página igual à do fulano" e é preciso transformar isso em diferenciação.
- Para comparar de duas a três páginas do mesmo nicho e ver o que todas repetem.

Para escolher o ângulo próprio a partir desta análise, use definir-angulo-venda. Para checar se as suas promessas têm prova, use validar-promessa. Esta skill só analisa o concorrente.

## O que pedir antes

- A página, de uma destas formas: URL pública, arquivo salvo, print, descrição do usuário ou transcrição do vídeo de vendas. Não acesse área logada, checkout nem conteúdo pago.
- Sua oferta em poucas linhas: produto, público, preço e diferencial que o dono acredita ter.
- Quantas páginas comparar (recomendado até três).

Limite da leitura por WebFetch: ela traz o texto da página, mas não assiste ao vídeo de vendas e pode não trazer o que é montado por JavaScript (contador, preço que aparece depois, depoimento em carrossel). Se o argumento principal estiver no vídeo, peça a transcrição ou a descrição ao usuário.

## Passo a passo

1. **Capture a página.** Leia com WebFetch ou Read, ou use o print, a descrição ou a transcrição. Registre data, URL ou fonte, e o que não foi possível ler (vídeo, bloco dinâmico). Se uma parte essencial ficou de fora, marque a análise como "parcial" e diga qual parte. Pronto quando o conteúdo foi lido, a falha de acesso está registrada e a cobertura está declarada: completa ou parcial.
2. **Desenhe a planta.** Liste os blocos na ordem em que aparecem e dê a cada um a função (chamar atenção, gerar identificação, apresentar mecanismo, provar, ofertar, reduzir risco, pedir ação). Descreva com suas palavras. Pronto quando todos os blocos estão listados com função.
3. **Extraia os argumentos, não as frases.** Para promessa, mecanismo, provas, oferta, bônus, garantia, preço e CTA, escreva em uma linha qual é a ideia. Exemplo de formato: "promessa de rapidez sem citar prazo", nunca a frase original. Pronto quando cada item está descrito com palavras próprias e nenhuma frase do concorrente aparece.
4. **Avalie cada argumento.** Para cada um, diga se tem prova visível, se responde objeção e se deixa algo vago, e classifique como força ou furo. Pronto quando cada argumento tem avaliação de uma linha e a classificação.
5. **Marque práticas que podem ser irregulares.** Contador regressivo que reinicia, "de/por" sem preço anterior real, depoimento sem identificação, garantia apresentada como vantagem quando é só o direito de arrependimento de 7 dias do CDC, promessa de resultado em área regulada. Registre para não copiar, sem afirmar que é ilegal. Pronto quando a lista está feita ou marcada como "nada encontrado".
6. **Ache o que o mercado repete.** Se houver mais de uma página, marque os argumentos que aparecem em todas. Esses são os que a sua página não deve usar como principal. Pronto quando a lista de repetições está feita ou registrada como "página única".
7. **Escreva o que fazer diferente.** Para cada furo ou repetição, uma ação concreta para a sua oferta: outro ângulo, prova que o concorrente não tem, bônus que cobre lacuna, garantia mais clara. Só ações que o dono consegue cumprir. Pronto quando há de 5 a 10 ações, cada uma ligada a um achado.

## Saída

```text
Página analisada: [URL ou fonte] | Lida em: [data] | Cobertura: [completa | parcial: o que faltou]

Planta
1. [Bloco] : [função]
2. ...

Argumentos (descritos com palavras próprias)
| Argumento | Ideia | Prova visível | Responde objeção | Vago | Força ou furo |
| Promessa | ... | sim/não | sim/não | ... | ... |
| Mecanismo | ...
| Provas | ...
| Oferta e bônus | ...
| Garantia | ...
| Preço e CTA | ...

Práticas que podem ser irregulares (não copiar): [lista ou "nada encontrado"]
Repetido no mercado: [lista ou "página única"]

O que fazer diferente
1. [Ação] (por causa de: [achado])
2. ...
```

## Erros comuns

- Colar frases do concorrente na saída. Isso é cópia e pode gerar problema de direito autoral e de marca.
- Transformar a análise em modelo para imitar, quando o objetivo é se diferenciar.
- Analisar só o texto e não avisar que o argumento principal estava no vídeo.
- Julgar a página como "converte bem" sem dado. Você não tem os números do concorrente.
- Copiar do concorrente uma prática irregular, como contador falso ou "de/por" inventado.
