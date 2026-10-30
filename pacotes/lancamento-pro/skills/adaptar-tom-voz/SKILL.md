---
name: adaptar-tom-voz
description: Reescreve um texto pronto para soar como a voz de uma marca ou de um público específico, mantendo o sentido, os fatos e a estrutura, e devolve a versão adaptada com a lista do que mudou. Use quando pedirem para ajustar o tom, deixar mais formal ou mais próximo, adaptar para outro público, "soar como a marca" ou padronizar textos escritos por pessoas diferentes.
---

# Adaptar tom de voz

Pega um texto que já funciona no conteúdo e muda só a forma de falar. Primeiro define a voz em regras verificáveis, depois reescreve e mostra o que mudou. Fatos, números, promessas, termos legais e ordem dos argumentos ficam iguais.

## Quando usar

- Uma página, e-mail ou legenda foi escrita por outra pessoa e não soa como a marca.
- O mesmo texto vai para dois públicos (exemplo: empresário e estudante).
- Vários textos do lançamento estão com tons diferentes e precisam ficar consistentes.

Use outra skill quando for o caso:
- O problema é o texto estar confuso, longo ou ambíguo, não o tom: reescrever-clareza.
- Ainda não existe texto: use a skill de escrita do trecho (escrever-headline, escrever-beneficios, escrever-legenda-reels e as demais).

## O que pedir antes

- O texto original.
- A voz de destino, de uma destas formas: guia de marca, 2 ou 3 textos que já soam certo, ou descrição em adjetivos.
- Público de destino.
- Palavras obrigatórias e proibidas.
- Canal (página, e-mail, direct, post), porque o canal muda o grau de formalidade.
- Área regulada (saúde, direito, finanças, contabilidade) e a regra do conselho que se aplica.

Se o usuário só der adjetivos ("mais leve"), transforme em regras no passo 1 e confirme antes de reescrever textos longos.

## Passo a passo

1. **Defina a voz em regras.** Escreva de 5 a 8 regras verificáveis: tratamento (você, o senhor), pessoa (nós, eu), tamanho médio de frase, gírias permitidas ou não, termos técnicos, uso de humor, pontuação (exclamação sim ou não). Se houver textos de referência, extraia as regras deles. Pronto quando cada regra pode ser conferida lendo uma frase.
2. **Marque o que não pode mudar.** Liste fatos, números, preços, prazos, nomes de produto, garantias e termos legais do original. Termo legal fica igual, palavra por palavra; se a regra da voz pedir explicação, explique ao lado, entre parênteses, sem trocar o termo (exemplo: "ao mês-calendário (de 1 a 30 ou 31)", e não "por mês"). Pronto quando a lista está completa e cada termo legal está marcado como fixo.
3. **Reescreva.** Parágrafo a parágrafo, aplicando as regras. Mantenha a ordem dos argumentos e o tamanho aproximado: variação de até 20% medida em palavras, no texto inteiro. Pronto quando cada parágrafo original tem um correspondente e a contagem de palavras de antes e depois está anotada.
4. **Confira os fixos.** Compare a lista do passo 2 com a nova versão. Pronto quando todos os fixos aparecem iguais.
5. **Confira as regras.** Passe cada regra da voz pelo texto novo. Pronto quando nenhuma regra é quebrada, ou a quebra está justificada.
6. **Revise riscos.** A mudança de tom não pode criar promessa nova, urgência ou escassez falsa, nem informalidade que fira regra de conselho profissional em saúde, direito ou finanças. Se o problema já estiver no texto original (promessa sem prova, prazo falso), não corrija por conta própria: sinalize em "Atenção:" e proponha a troca para o usuário decidir. Pronto quando o texto novo não promete mais que o original e cada problema herdado está sinalizado.
7. **Liste as mudanças.** De 3 a 8 exemplos "antes / depois" com a regra aplicada. Pronto quando cada exemplo cita a regra.
8. **Registre as pendências.** O que depende do usuário: regra da voz a confirmar, troca proposta no passo 6, termo que você não soube se é legal. Pronto quando a lista está escrita ou marcada como "nenhuma".

## Saída

```text
Voz de destino
1. [REGRA]
2. ...

Fixos mantidos: [lista, com termos legais marcados]
Tamanho: [N] palavras no original, [N] no adaptado ([+/-]%)

Texto adaptado
[TEXTO]

Mudanças principais
- Antes: "[TRECHO]"
  Depois: "[TRECHO]"
  Regra: [N]

Atenção: [riscos criados ou herdados do original, com a troca proposta, ou "nenhum"]
Pendências: [o que o usuário precisa confirmar, ou "nenhuma"]
```

## Erros comuns

- Mudar o conteúdo junto com o tom: argumento cortado, promessa acrescentada.
- Trocar termo legal por sinônimo "mais simples" e mudar o sentido jurídico ou fiscal.
- Trocar número, preço ou nome do produto na reescrita.
- Corrigir em silêncio uma promessa do original, sem avisar o usuário.
- Adaptar só o começo e deixar o fim com o tom antigo.
