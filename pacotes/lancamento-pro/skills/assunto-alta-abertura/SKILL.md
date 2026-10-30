---
name: assunto-alta-abertura
description: Escreve e revisa linhas de assunto e pré-cabeçalho de um e-mail já definido, gerando opções em ângulos diferentes e eliminando as que prometem demais ou parecem spam. Use quando o corpo do e-mail está pronto ou decidido e o usuário quer melhores opções de assunto antes de enviar.
---

# Assunto de alta abertura

Trabalho só sobre a linha de assunto e o pré-cabeçalho. O resultado é uma lista curta de opções, cada uma com ângulo, contagem de caracteres e motivo, e uma recomendação. A skill não mede abertura, não promete taxa e não envia nada.

## Quando usar

- O e-mail está escrito e o assunto parece fraco ou genérico.
- O usuário quer opções para escolher ou para levar a um teste.
- Um assunto antigo caiu em spam ou recebeu reclamação.

Use outra skill quando for o caso:
- Para desenhar um teste A/B entre assuntos, com amostra e critério de vitória, use testar-assuntos.
- Para escrever o e-mail inteiro, use a skill da sequência correspondente (sequencia-boas-vindas, sequencia-lancamento, sequencia-pos-venda, email-carrinho-abandonado, email-ultima-chance, email-reembolso).

## O que pedir antes

1. O corpo do e-mail ou um resumo de três linhas do que ele entrega.
2. O público e o momento: lista nova, lançamento, cliente.
3. Assuntos já usados com essa lista, para não repetir.
4. Resultados reais de envios anteriores, se o usuário tiver. Nunca suponha números.
5. Restrições: área regulada, palavras proibidas pela marca.
6. Se a ferramenta aceita variável de nome e qual é a sintaxe dela.

## Passo a passo

1. **Resuma a promessa do e-mail.** Escreva em uma frase o que a pessoa ganha ao abrir. Pronto quando a frase é verdadeira para o corpo do e-mail.
2. **Gere opções em ângulos diferentes.** Pelo menos uma por ângulo: benefício direto, curiosidade honesta, pergunta, número real do conteúdo ("3 erros"), pessoal (nome ou "você"), prazo (só se houver prazo real). Gere de 8 a 12 para ter folga no filtro. Pronto quando há de 8 a 12 opções e nenhum ângulo repetido mais de duas vezes.
3. **Escreva o pré-cabeçalho de cada uma.** Ele completa o assunto, não o repete. Mire entre 40 e 90 caracteres, faixa que costuma aparecer inteira na caixa de entrada; o corte real depende do aplicativo. Pronto quando nenhum pré-cabeçalho é cópia do assunto ou texto padrão da ferramenta ("Ver no navegador") e todos têm contagem.
4. **Filtre.** Elimine as opções que:
   - prometem algo que o corpo não entrega;
   - usam caixa alta inteira, excesso de exclamação ou símbolos;
   - imitam resposta ou encaminhamento ("RE:", "FW:") sem ser;
   - criam urgência sem prazo real;
   - em área regulada, prometem resultado (cura, ganho de causa, rendimento).
   Ao fim do filtro devem sobrar pelo menos 6 opções. Se sobrarem menos, gere novas nos ângulos que ficaram vazios e filtre de novo. Pronto quando cada eliminada tem o motivo anotado e restam pelo menos 6.
5. **Conte os caracteres.** Anote o total de cada assunto e de cada pré-cabeçalho. Sinalize assunto acima de 50, pois tende a cortar no celular. Assunto com variável de nome: escreva a variável na sintaxe da ferramenta, defina o fallback para contato sem nome (exemplo: "você" ou a frase sem o nome, nunca "Olá, ,") e conte com um nome médio de 6 letras. Pronto quando todas têm contagem e toda variável tem fallback.
6. **Recomende.** Indique de 2 a 3 finalistas e diga por quê, em termos de clareza e coerência com o e-mail, não de taxa prevista. Se o usuário quiser descobrir qual funciona melhor na lista dele, indique testar-assuntos. Pronto quando a recomendação não cita número inventado.
7. **Feche o lembrete.** Escreva na saída que o envio vale só para quem consentiu (LGPD) e que o e-mail precisa ter link de descadastro. Pronto quando o lembrete está na saída.

## Saída

```text
Promessa do e-mail: [FRASE]

Opções (restantes após o filtro: [N])
1. [ASSUNTO] (NN caracteres) | Ângulo: [ÂNGULO]
   Pré-cabeçalho: [TEXTO] (NN caracteres)
2. Oi, {{nome|você}}, [RESTO] (NN caracteres, contado com nome de 6 letras) | Ângulo: pessoal
   Sem nome: [COMO FICA COM O FALLBACK]
   Pré-cabeçalho: [TEXTO] (NN caracteres)
3. ...

Eliminadas
- [ASSUNTO]: [MOTIVO]

Finalistas: 1, 4, 7
Por quê: ...
Lembrete: enviar só para quem consentiu; manter link de descadastro.
```

A sintaxe `{{nome|você}}` é ilustrativa. Use a da ferramenta do usuário.

## Erros comuns

- Assunto de curiosidade que o e-mail não resolve. A pessoa abre uma vez e para de abrir.
- Afirmar que uma opção "vai ter 40% de abertura". Sem dado real, não há número.
- Variável de nome sem fallback, que chega como "Oi, ," para quem não tem nome cadastrado.
- Filtrar tanto que sobram duas opções e entregar assim mesmo.
- Esquecer o pré-cabeçalho e deixar o texto padrão da ferramenta aparecer.
