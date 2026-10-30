---
name: email-ultima-chance
description: Escreve o e-mail de última chance antes de um prazo real de encerramento informado pelo usuário, e recusa quando o prazo não existe, propondo outro e-mail no lugar. Use quando uma oferta, inscrição ou condição especial termina numa data e hora definidas e o usuário quer o aviso final para a lista.
---

# E-mail de última chance

Aviso final antes do encerramento de algo que de fato acaba: carrinho que fecha, bônus que sai, turma que encerra inscrição, preço que sobe. O resultado é um e-mail (ou dois, véspera e últimas horas) com horário de envio, assunto, pré-cabeçalho e corpo. A skill não envia e-mail.

Regra central: sem prazo real informado pelo usuário, esta skill não escreve e-mail de última chance.

## Quando usar

- Existe data e hora de encerramento definidas e o usuário vai cumpri-las.
- O lançamento está no fim e falta o e-mail das últimas horas.

Use outra skill quando for o caso:
- Para a sequência inteira do lançamento, use sequencia-lancamento.
- Para quem abandonou o checkout, use email-carrinho-abandonado.
- Para definir em que horário este e-mail sai, use cronograma-envios.

## O que pedir antes

1. O que termina, exatamente: carrinho, bônus, condição de preço, vagas.
2. Data e hora do fim, com fuso horário.
3. O que acontece depois do prazo: preço novo, próxima turma em data definida, produto indisponível.
4. Se há limite de vagas, o número real e quantas restam.
5. Link de compra e canal de suporte.

## Passo a passo

1. **Verifique o prazo.** O prazo é real se o usuário informou data e hora e confirmou que a oferta deixa de valer depois. Pronto quando o prazo está escrito com fuso e o usuário confirmou.
2. **Recuse se o prazo não for real.** Se não houver data, se a oferta "volta na semana que vem" ou se o usuário quer criar urgência sem prazo, não escreva. Explique em duas linhas que urgência falsa é publicidade enganosa pelo Código de Defesa do Consumidor e quebra a confiança da lista. Proponha no lugar: e-mail de objeção ou depoimento (dentro de sequencia-lancamento), e-mail de recapitulação da oferta sem prazo, ou lembrete pela email-carrinho-abandonado. Pronto quando a recusa e a alternativa foram entregues.
3. **Confirme o público.** Só quem consentiu receber e-mails (LGPD) e quem ainda não comprou. Indique segmentar-lista se a exclusão de compradores não estiver feita. Pronto quando a regra de exclusão está escrita.
4. **Escreva a versão da véspera, se pedida.** O que termina, quando termina e o que a pessoa leva, em até 120 palavras. Pronto quando data, hora e o que termina aparecem no primeiro parágrafo.
5. **Escreva a versão das últimas horas.** Mais curta: uma frase do que acaba, a hora, o que a pessoa recebe, o botão. Vagas só com número real. Pronto quando o e-mail cabe numa tela de celular.
6. **Escreva assunto e pré-cabeçalho.** O assunto cita o prazo real ("Fecha hoje às 23h"). Pronto quando o assunto não promete nada além do que acontece.
7. **Combine o pós-prazo.** Lembre o usuário de fechar o link ou trocar o preço na hora marcada. Pronto quando o lembrete está na saída.

## Saída

```text
Prazo confirmado: [DATA HORA FUSO] | O que termina: [ITEM]
Depois do prazo: [O QUE ACONTECE]
Público: consentiu (LGPD) e não comprou

E-mail | Envio: [DATA HORA]
Assunto: ...
Pré-cabeçalho: ...
Corpo:
...
Botão: [TEXTO] -> [LINK]
Rodapé: [REMETENTE] | [LINK DE DESCADASTRO]

Lembrete: fechar o link ou trocar o preço às [HORA].
```

Saída em caso de recusa:

```text
Sem prazo real informado. Não escrevi e-mail de última chance.
Proposta no lugar: [E-MAIL ALTERNATIVO E SKILL QUE O ESCREVE]
```

## Erros comuns

- Reabrir o carrinho no dia seguinte depois de dizer "última chance".
- Esquecer o fuso e o cliente de outro estado perder a hora.
- Contagem de vagas inventada ("restam 3").
- Mandar para quem já comprou.
