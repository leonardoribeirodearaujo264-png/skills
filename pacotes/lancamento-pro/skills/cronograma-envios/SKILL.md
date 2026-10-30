---
name: cronograma-envios
description: Monta o calendário de envios de e-mail de um período, juntando sequências, campanhas e testes em uma tabela com data, hora, segmento e e-mail, sem sobreposição e com limite de frequência por contato. Use quando o usuário tem vários e-mails ou fluxos para o mesmo período e precisa saber o que sai, quando e para quem.
---

# Cronograma de envios

Calendário de e-mails para um período definido. O resultado é uma tabela que o usuário segue para agendar cada envio na ferramenta dele, com regras de conflito e de frequência. A skill não agenda nem envia nada; o agendamento é feito pelo usuário.

## Quando usar

- Há lançamento, boas-vindas, pós-venda e carrinho abandonado rodando ao mesmo tempo.
- O usuário quer um plano de semanas ou de um lançamento inteiro.
- Contatos estão recebendo dois e-mails no mesmo dia por acidente.

Use outra skill quando for o caso:
- Para escrever o texto de cada e-mail, use a skill do e-mail correspondente (sequencia-boas-vindas, sequencia-lancamento, email-carrinho-abandonado, email-ultima-chance, sequencia-pos-venda).
- Para definir quem está em cada segmento, use segmentar-lista.
- Para desenhar um teste de assunto, use testar-assuntos e traga aqui só a data dele.

## O que pedir antes

1. Período do cronograma, com data de início e de fim.
2. Lista de e-mails e fluxos previstos, com a função de cada um.
3. Datas fixas reais: abertura e fechamento de carrinho, eventos, aulas ao vivo.
4. Segmentos que existem, ou o resultado da segmentar-lista.
5. Fuso horário do público e horários em que o usuário já viu resposta, se tiver dado real.
6. Limite de frequência desejado (por exemplo, no máximo um e-mail de marketing por dia por contato).
7. Ferramenta de e-mail e se ela consegue excluir de uma campanha quem já recebeu outro e-mail no mesmo dia.

## Passo a passo

1. **Fixe as âncoras.** Coloque primeiro as datas que não mudam: abertura, fechamento, eventos. Para cada data, confira o dia da semana e se cai em feriado nacional ou na região do público; se cair, avise o usuário antes de seguir. Pronto quando todas as datas fixas estão no bloco "Âncoras" com dia da semana, hora, fuso e checagem de feriado.
2. **Encaixe a sequência principal.** Distribua os e-mails do lançamento ou da campanha em volta das âncoras. Pronto quando cada e-mail da sequência tem data e hora.
3. **Encaixe os fluxos automáticos.** Boas-vindas, carrinho abandonado e pós-venda são disparados por gatilho, não por data. Registre o gatilho e a regra de convivência com a campanha (por exemplo: quem está nos primeiros dias de boas-vindas não recebe o aquecimento). A convivência depende de a ferramenta excluir por "recebeu e-mail hoje" ou por fluxo ativo; se ela não fizer isso, registre a exceção e diga o que o usuário faz no lugar (segmento manual, pausa do fluxo no dia da campanha). Pronto quando cada fluxo tem gatilho, regra de convivência e, se preciso, a exceção.
4. **Classifique e aplique o limite de frequência.** Classe de cada e-mail:
   - marketing, conta no limite: campanha, aquecimento, sequência de lançamento, carrinho abandonado (no dia em que dispara, ele substitui a campanha daquele dia para esse contato);
   - relacionamento, fora do limite: pós-venda sem oferta (boas-vindas ao produto, como acessar, pedido de opinião);
   - transacional, fora do limite: acesso, recibo, reembolso.
   Pós-venda com oferta de outro produto conta como marketing. Verifique, segmento por segmento, se algum contato recebe mais e-mails de marketing num dia do que o limite. Resolva movendo, juntando ou cortando. Pronto quando cada e-mail tem classe, nenhum dia ultrapassa o limite e cada conflito resolvido está registrado.
5. **Escolha horários.** Use o dado do usuário quando houver. Sem dado, proponha um horário e marque como suposição a testar, sem prometer resultado. Pronto quando cada horário tem a origem anotada: dado real ou suposição.
6. **Feche as regras de envio.** Só contatos com consentimento (LGPD), todo e-mail de marketing com link de descadastro, compradores fora das ofertas do mesmo produto, descadastro respeitado em todos os fluxos. Pronto quando as regras estão no topo da saída.
7. **Liste as tarefas do usuário.** O que ele precisa agendar, ligar ou desligar na ferramenta, em ordem de data, incluindo desligar a sequência de lançamento depois do fechamento. Pronto quando cada linha da tabela vira uma tarefa clara.

## Saída

```text
Período: [INÍCIO] a [FIM] | Fuso: [FUSO]
Regras: só quem consentiu (LGPD); descadastro em todo marketing; máximo [N] marketing/dia/contato

Âncoras
- [DATA] ([DIA DA SEMANA]) [HORA] [FUSO]: [EVENTO] | Feriado: [não | sim: qual, e o que o usuário decidiu]

| Data | Dia | Hora | Segmento | E-mail | Classe | Origem do horário |
| ...  | ... | ...  | ...      | ...    | marketing, relacionamento ou transacional | dado real ou suposição |

Fluxos automáticos
- [FLUXO]: gatilho [GATILHO] | convivência: [REGRA] | exceção: [se a ferramenta não exclui, o que fazer, ou "nenhuma"]

Conflitos resolvidos
- [DATA] [SEGMENTO]: [o que coincidia] -> [movido, juntado ou cortado]

Tarefas na ferramenta
1. [DATA] agendar ...
```

## Erros comuns

- Esquecer que boas-vindas e lançamento atingem a mesma pessoa no mesmo dia.
- Contar e-mail transacional no limite e atrasar um acesso de compra.
- Deixar o carrinho abandonado somar com a campanha do dia e estourar o limite.
- Supor que a ferramenta exclui por envio do dia sem confirmar.
- Marcar fechamento de carrinho em feriado ou sem fuso, e confundir clientes de outros estados.
