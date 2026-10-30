---
name: escrever-script-vsl
description: Escreve o roteiro de uma VSL (vídeo de vendas) em blocos, cada um com tempo de início e fim, a fala exata e o que aparece na tela, com as trocas de cena marcadas no tempo. Use quando pedirem roteiro de VSL, vídeo de vendas, script de vídeo da página, vídeo de lançamento ou vídeo longo de apresentação de oferta.
---

# Escrever script de VSL

Entrega o roteiro completo de um vídeo de vendas dividido em blocos com tempo, fala e tela. O tempo é calculado pela quantidade de palavras da fala, contada com ferramenta, para que o roteiro caiba na duração pedida. O resultado pode ir direto para gravação e edição depois de preenchidas as provas marcadas.

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
- Data de início da próxima turma ou do acesso, se a oferta tiver turma.
- Área regulada, se houver.

## Passo a passo

1. **Calcule o orçamento de palavras.** Use 140 palavras por minuto de fala em ritmo natural. Duração em minutos vezes 140 dá o total. Pronto quando o total está escrito.
2. **Distribua os blocos.** Estrutura padrão e fatia do tempo: gancho (5%), dor e identificação (15%), virada ou descoberta (10%), mecanismo, como funciona (20%), prova (15%), oferta com o que está incluído e os bônus reais (15%), garantia e risco (5%), objeções rápidas (10%), chamada para ação (5%). Ajuste se o usuário pedir outra ordem. Pronto quando cada bloco tem início, fim e número de palavras.
3. **Reserve palavras para as marcações.** Cada prova que faltar entra como marcação com reserva fixa: [DEPOIMENTO REAL: 25 palavras], [NÚMERO REAL: 3 palavras], [CASO REAL: 40 palavras]. A marcação conta pela reserva, não pelas palavras dela mesma. Pronto quando toda marcação tem reserva escrita.
4. **Escreva a fala bloco a bloco.** Frases curtas, linguagem falada, uma ideia por frase. Conte as palavras com ferramenta (script ou contador do editor), não de cabeça, somando as reservas do passo 3. Cada bloco fica dentro de 10% do seu orçamento ou a 3 palavras dele, o que for maior. Pronto quando a soma total fica dentro de 10% do orçamento pela contagem da ferramenta.
5. **Escreva a tela de cada bloco.** O que aparece: rosto, texto na tela (até 6 palavras), print, demonstração, lista, preço. Nos primeiros 30 segundos, troque de cena a cada 5 a 10 segundos e marque cada troca como sublinha com tempo dentro da tela do bloco ("[00:05] print da planilha"). Pronto quando nenhum bloco tem a tela em branco e os primeiros 30 segundos têm as trocas marcadas.
6. **Marque as provas.** Todo depoimento, número ou caso vem do usuário; o que faltar fica com a marcação do passo 3. Pronto quando nenhuma prova foi inventada.
7. **Feche a oferta e a CTA com dados reais.** Cite a próxima turma só com a data informada; sem data, não cite turma. Sem contador regressivo, vagas limitadas ou "só hoje" que não sejam reais. Pronto quando a CTA não cita data, turma ou prazo que o usuário não informou.
8. **Revise riscos.** Sem resultado garantido. Em saúde, direito e finanças, marque com "Atenção:" o que fere regra do conselho. Pronto quando cada afirmação tem fato do produto por trás.
9. **Leia em voz alta mentalmente.** Corte palavras difíceis de pronunciar e frases com mais de 20 palavras, contadas com ferramenta. Pronto quando nenhuma frase passa de 20 palavras.

## Saída

```text
VSL: [PRODUTO]  |  Duração alvo: [MM:SS]  |  Palavras: [N] de [ORÇAMENTO] (140/min)
Quem fala: [especialista | narração | misto]  |  Contagem feita com: [script | editor]

[00:00 a 00:15] Bloco 1: Gancho
Fala:
[TEXTO FALADO]
Tela:
[00:00] [O QUE APARECE, TEXTO NA TELA ENTRE ASPAS]
[00:07] [TROCA DE CENA]
Palavras: [N] (orçamento [N], reservas incluídas [N])

[00:15 a 01:00] Bloco 2: Dor e identificação
...

Provas pendentes: [marcação | bloco | palavras reservadas]
Próxima turma: [data informada | não citada: sem data]
Atenção: [riscos ou "nenhum"]
```

## Erros comuns

- Roteiro que não cabe no tempo porque ninguém contou as palavras com ferramenta.
- Coluna de tela vazia ou "especialista falando" do começo ao fim.
- Gancho que demora 40 segundos para chegar ao ponto.
- Depoimento ou número escrito como se fosse real sem ter vindo do usuário.
- Fechamento com escassez inventada ou "próxima turma" sem data para pressionar a compra.
