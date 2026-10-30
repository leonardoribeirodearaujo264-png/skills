---
name: email-ultima-chance
description: Escreve o e-mail de última chance antes de um prazo real de encerramento informado pelo usuário, e recusa quando o prazo não existe, explicando o motivo e propondo outro e-mail no lugar. Use quando uma oferta, inscrição ou condição especial termina numa data e hora definidas e o usuário quer o aviso final para a lista.
---

# E-mail de última chance

Aviso final antes do encerramento de algo que de fato acaba: carrinho que fecha, bônus que sai, turma que encerra inscrição, preço que sobe. O resultado é um e-mail (ou dois, véspera e últimas horas) com horário de envio, assunto, pré-cabeçalho, corpo e botão. A skill não envia e-mail.

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
3. O que acontece depois do prazo: preço novo, próxima turma (com data marcada ou não), produto indisponível.
4. Se há limite de vagas, o número real e quantas restam.
5. Link de compra e canal de suporte.
6. Horário de envio, se já decidido em cronograma-envios.

## Passo a passo

1. **Verifique o prazo.** O prazo é real se o usuário informou data e hora e confirmou que a oferta deixa de valer depois, sem reabrir na mesma condição no dia seguinte. Para o que vem depois: se a próxima turma não tem data fechada, escreva "próxima turma sem data marcada" e nunca um mês ou data estimada. Pronto quando o prazo está escrito com fuso, o usuário confirmou e o pós-prazo está descrito sem data inventada.
2. **Recuse se o prazo não for real.** Se não houver data, se a oferta "volta na semana que vem" ou se o usuário quer criar urgência sem prazo, não escreva. Explique em duas linhas, no campo "Motivo" da saída de recusa, que urgência falsa é publicidade enganosa pelo Código de Defesa do Consumidor e quebra a confiança da lista. Proponha uma alternativa com dono:
   - Em período de lançamento: e-mail de objeção ou depoimento, escrito por sequencia-lancamento.
   - Em oferta permanente: e-mail de recapitulação sem prazo, escrito por esta skill se o usuário aceitar (o que é, para quem, preço real, botão), sem "última", "acaba", "corra" ou "vaga".
   - Para quem iniciou a compra: lembrete pela email-carrinho-abandonado.
   Pronto quando a recusa, o motivo e a alternativa com a skill dona foram entregues.
3. **Confirme o público.** Só quem consentiu receber e-mails (LGPD) e quem ainda não comprou. Indique segmentar-lista se a exclusão de compradores não estiver feita. Pronto quando a regra de exclusão está escrita.
4. **Escreva a versão da véspera, se pedida.** O que termina, quando termina (com fuso) e o que a pessoa leva, em até 120 palavras contadas com ferramenta (script ou contador do editor), não de cabeça. Pronto quando data, hora, fuso e o que termina aparecem no primeiro parágrafo.
5. **Escreva a versão das últimas horas.** Mais curta: uma frase do que acaba, a hora com fuso, o que a pessoa recebe, o botão. Vagas só com número real informado. Pronto quando o e-mail cabe numa tela de celular.
6. **Escreva o texto do botão.** Diz a ação ("Garantir minha inscrição", "Comprar com o preço atual"). A palavra "vaga" só entra se houver limite real de vagas; "última chance" e contagem não entram no botão. Pronto quando o botão não sugere escassez que não existe.
7. **Escreva assunto e pré-cabeçalho.** O assunto cita o prazo real ("Fecha hoje às 23h, horário de Brasília"). Pronto quando o assunto não promete nada além do que acontece.
8. **Defina o envio e combine o pós-prazo.** Use o horário da entrada 6; sem ele, escreva [HORÁRIO A CONFIRMAR] e indique cronograma-envios. Lembre o usuário de fechar o link ou trocar o preço na hora marcada e de não reabrir na mesma condição. Pronto quando horário e lembrete estão na saída.

## Saída

```text
Prazo confirmado: [DATA HORA FUSO] | O que termina: [ITEM]
Depois do prazo: [O QUE ACONTECE | próxima turma sem data marcada]
Público: consentiu (LGPD) e não comprou

E-mail | Envio: [DATA HORA | HORÁRIO A CONFIRMAR]
Assunto: ...
Pré-cabeçalho: ...
Corpo:
...
Palavras: [N] (contadas com ferramenta)
Botão: [TEXTO] -> [LINK]
Rodapé: [REMETENTE] | [LINK DE DESCADASTRO]

Lembrete: fechar o link ou trocar o preço às [HORA FUSO]; não reabrir na mesma condição.
```

Saída em caso de recusa:

```text
Sem prazo real informado. Não escrevi e-mail de última chance.
Motivo: [duas linhas: urgência falsa é publicidade enganosa pelo CDC e quebra a confiança da lista]
Proposta no lugar: [E-MAIL ALTERNATIVO] | Quem escreve: [sequencia-lancamento | esta skill | email-carrinho-abandonado]
```

## Erros comuns

- Reabrir o carrinho no dia seguinte depois de dizer "última chance".
- Esquecer o fuso e o cliente de outro estado perder a hora.
- Contagem de vagas inventada ("restam 3") ou "garantir minha vaga" sem limite real.
- Citar data da próxima turma que ainda não foi marcada.
- Mandar para quem já comprou.
