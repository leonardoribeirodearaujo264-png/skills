---
name: testar-assuntos
description: Desenha um teste A/B de linhas de assunto com hipótese, variantes, divisão da lista, tamanho de amostra informado pelo usuário, critério de vitória com desempate e planilha de leitura do resultado. Use quando o usuário já tem duas ou mais opções de assunto e quer descobrir qual funciona melhor na lista dele, sem adivinhar.
---

# Testar assuntos

Plano de teste A/B para assuntos de e-mail. O resultado é um desenho de teste pronto para o usuário configurar na ferramenta dele e um modelo para registrar o resultado. A skill não envia e-mail, não acessa a ferramenta e não inventa taxa de abertura nem diferença mínima: todo número vem do usuário.

## Quando usar

- Existem pelo menos duas opções de assunto para o mesmo e-mail.
- O usuário quer decidir com dado da própria lista, e não por opinião.
- A ferramenta de e-mail permite dividir o envio (teste A/B nativo ou dois segmentos aleatórios).

Use outra skill quando for o caso:
- Para gerar as opções de assunto, use assunto-alta-abertura antes desta.
- Para dividir a lista por perfil ou comportamento (e não ao acaso), use segmentar-lista.
- Para encaixar o teste no calendário, use cronograma-envios.
- Para testar anúncios, públicos ou páginas, e não assunto de e-mail, use matriz-teste-ab.

## O que pedir antes

1. As variantes de assunto (de 2 a 3; mais que isso exige lista grande).
2. Tamanho real da lista que vai receber o envio. Este número é obrigatório e vem do usuário.
3. Taxa de abertura ou de clique histórica da lista, se o usuário tiver um relatório. Se não tiver, não suponha.
4. Diferença mínima que importa para o usuário, em pontos percentuais da métrica principal (por exemplo, 0,5 ponto de taxa de clique). Obrigatória para o critério de vitória; se o usuário não souber, mostre o que cada opção exige de amostra e peça que escolha.
5. Se a ferramenta faz teste nativo (envia para uma parte e depois manda a vencedora para o resto) e qual o teto da parte de teste (por exemplo, 50% da lista).
6. Prazo para decidir a vencedora (horas entre o envio do teste e o envio final).

## Passo a passo

1. **Escreva a hipótese.** Formato: "Se o assunto [MUDANÇA], então [MÉTRICA] será maior, porque [MOTIVO]". As variantes podem ter palavras diferentes, mas devem diferir num único enfoque (por exemplo, benefício contra curiosidade). Pronto quando a diferença entre as variantes cabe em uma frase.
2. **Escolha a métrica.** Abertura é distorcida por proteções de privacidade de alguns aplicativos de e-mail, que marcam como aberto o que não foi lido. Recomende clique como métrica principal e abertura como apoio, e explique isso ao usuário. Pronto quando a métrica principal está escolhida e justificada.
3. **Defina a divisão.** Com teste nativo: uma parte da lista recebe as variantes em partes iguais e o restante recebe a vencedora. Sem teste nativo: divida a lista ao acaso em partes iguais. A divisão é aleatória, nunca por ordem alfabética ou data de inscrição. Pronto quando a quantidade de contatos por variante está calculada a partir do tamanho informado.
4. **Avalie se a amostra basta.** Só calcule se o usuário deu a taxa histórica (p) e a diferença mínima (d), ambas em proporção. Aproximação para detectar d com confiança de 95% e poder de 80%: n por variante = 16 x p x (1 - p) / d². O total do teste é n x número de variantes. Mostre a conta com os números dele.
   - Se o total passar do teto do teste nativo ou da lista, calcule a menor diferença detectável com o que cabe: d = raiz(16 x p x (1 - p) / n disponível por variante). Diga ao usuário que só diferenças desse tamanho ou maiores serão confiáveis.
   - Sem taxa histórica, escreva que não dá para estimar e que o teste servirá para criar essa linha de base.
   - Se a amostra disponível for menor que a necessária, diga claramente que o resultado será indicativo, não conclusivo.
   Pronto quando há conta com dados do usuário, ou a menor diferença detectável, ou a declaração de que não há base.
5. **Alerte sobre a janela de leitura.** Cliques continuam chegando por horas depois do envio. Janela curta (menos de 12 horas, por exemplo) capta só parte deles e reduz ainda mais o poder do teste. Se o prazo informado for curto, escreva o alerta e sugira ampliar quando o calendário permitir. Pronto quando a janela está escrita com o alerta ou a confirmação de que é adequada.
6. **Fixe o critério de vitória e o desempate antes do envio.** Métrica, prazo de leitura e diferença mínima do item 4 para declarar vencedora. Abaixo disso, empate. Escolha agora a variante padrão que vai para o restante da lista em caso de empate (por exemplo, a mais alinhada ao tom da marca). Pronto quando critério e variante de desempate estão escritos antes de qualquer resultado.
7. **Garanta as condições iguais.** Mesmo corpo, mesmo remetente, mesmo horário, mesma lista consentida (LGPD), com link de descadastro em todas as variantes. Pronto quando a lista de controle está na saída.
8. **Entregue o modelo de registro.** Pronto quando o usuário tem uma tabela vazia para preencher com os números reais.

## Saída

```text
Hipótese: ...
Variante A: [ASSUNTO]
Variante B: [ASSUNTO]
Métrica principal: cliques únicos / entregues | Apoio: aberturas
Lista informada: [N] contatos | Teto do teste: [N% ou "sem teto"]
Divisão: [N_A] / [N_B] / [RESTANTE]
Amostra: [CONTA COM DADOS DO USUÁRIO | menor diferença detectável: [d] pontos | sem base histórica, resultado indicativo]
Janela de leitura: [H] horas | Alerta: [janela curta reduz o poder | adequada]
Critério: vence quem tiver diferença >= [D] pontos na métrica principal em [H] horas
Empate: vai para o restante a variante [A | B], escolhida antes do envio
Controle: mesmo corpo, remetente, horário; só contatos que consentiram; descadastro presente

Registro (preencher com números reais)
| Variante | Entregues | Aberturas | Cliques | Descadastros | Taxa de clique |
| A        |           |           |         |              |                |
| B        |           |           |         |              |                |
Decisão: ...
```

## Erros comuns

- Mudar assunto e horário ao mesmo tempo. Não dá para saber o que fez diferença.
- Declarar vencedora com poucas dezenas de aberturas.
- Escolher o critério ou a variante de desempate depois de ver o resultado.
- Preencher a taxa histórica ou a diferença mínima com "média de mercado". Use só o número do usuário.
- Testar quatro variantes numa lista pequena e não chegar a conclusão nenhuma.
