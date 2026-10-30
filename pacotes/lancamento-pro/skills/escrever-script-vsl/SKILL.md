---
name: escrever-script-vsl
description: Escreve o roteiro de uma VSL (vídeo de vendas) em blocos, cada um com tempo de início e fim, a fala exata e o que aparece na tela. Use quando pedirem roteiro de VSL, vídeo de vendas, script de vídeo da página, vídeo de lançamento ou vídeo longo de apresentação de oferta.
---

# Escrever script de VSL

Entrega o roteiro completo de um vídeo de vendas dividido em blocos com tempo, fala e tela. O tempo é calculado pela quantidade de palavras da fala, para que o roteiro caiba na duração pedida. O resultado pode ir direto para gravação e edição.

## Quando usar

- A página de vendas vai ter um vídeo principal e falta o roteiro.
- Vai gravar um vídeo de lançamento ou de apresentação da oferta com mais de 2 minutos.
- O vídeo atual está longo e solto e precisa de estrutura.

Use outra skill quando for o caso:
- Vídeo curto de até 90 segundos para Reels: o roteiro sai daqui com duração curta, mas a legenda do post é escrever-legenda-reels.
- Só quer ganchos de abertura para testar: criar-10-angulos-dor.
- Só o texto do botão que aparece no fim do vídeo e na página: escrever-cta.

## O que pedir antes

- Produto, o que a pessoa recebe e o preço (ou [PREÇO REAL] se ainda não definido).
- Público e a dor principal.
- Duração desejada (exemplo: 3, 8 ou 15 minutos).
- Quem fala: rosto do especialista, narração com tela, ou os dois.
- Provas disponíveis: depoimentos, números, casos, certificações. Só use o que vier do usuário.
- Garantia, bônus e condições reais da oferta.
- Área regulada, se houver.

## Passo a passo

1. **Calcule o orçamento de palavras.** Use 140 palavras por minuto de fala em ritmo natural. Duração em minutos vezes 140 dá o total. Pronto quando o total está escrito.
2. **Distribua os blocos.** Estrutura padrão e fatia do tempo: gancho (5%), dor e identificação (15%), virada ou descoberta (10%), mecanismo, como funciona (20%), prova (15%), oferta e o que está incluído (15%), garantia e risco (5%), objeções rápidas (10%), chamada para ação (5%). Ajuste se o usuário pedir outra ordem. Pronto quando cada bloco tem início, fim e número de palavras.
3. **Escreva a fala bloco a bloco.** Frases curtas, linguagem falada, uma ideia por frase. Respeite o orçamento de palavras do bloco com folga de 10%. Pronto quando a soma de palavras fica dentro de 10% do total.
4. **Escreva a tela de cada bloco.** O que aparece: rosto, texto na tela (até 6 palavras), print, demonstração, lista, preço. Indique troca de cena a cada 5 a 10 segundos nos primeiros 30 segundos. Pronto quando nenhum bloco tem a tela em branco.
5. **Marque as provas.** Todo depoimento, número ou caso vem do usuário; o que faltar fica como [DEPOIMENTO REAL] ou [NÚMERO REAL]. Pronto quando nenhuma prova foi inventada.
6. **Revise riscos.** Sem resultado garantido, sem contador regressivo ou vagas limitadas que não sejam reais, sem "só hoje" falso. Em saúde, direito e finanças, marque com "Atenção:" o que fere regra do conselho. Pronto quando cada afirmação tem fato do produto por trás.
7. **Leia em voz alta mentalmente.** Corte palavras difíceis de pronunciar e frases com mais de 20 palavras. Pronto quando nenhuma frase passa de 20 palavras.

## Saída

```text
VSL: [PRODUTO]  |  Duração alvo: [MM:SS]  |  Palavras: [N] (140/min)
Quem fala: [especialista | narração | misto]

[00:00 a 00:15] Bloco 1: Gancho
Fala:
[TEXTO FALADO]
Tela:
[O QUE APARECE, TEXTO NA TELA ENTRE ASPAS]
Palavras: [N]

[00:15 a 01:00] Bloco 2: Dor e identificação
...

Provas pendentes: [lista de marcações a preencher]
Atenção: [riscos ou "nenhum"]
```

## Erros comuns

- Roteiro que não cabe no tempo porque ninguém contou as palavras.
- Coluna de tela vazia ou "especialista falando" do começo ao fim.
- Gancho que demora 40 segundos para chegar ao ponto.
- Depoimento ou número escrito como se fosse real sem ter vindo do usuário.
- Fechamento com escassez inventada para pressionar a compra.
