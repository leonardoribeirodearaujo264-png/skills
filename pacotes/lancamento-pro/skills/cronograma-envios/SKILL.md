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

## Passo a passo

1. **Fixe as âncoras.** Coloque primeiro as datas que não mudam: abertura, fechamento, eventos. Pronto quando todas as datas fixas estão na tabela com hora e fuso.
2. **Encaixe a sequência principal.** Distribua os e-mails do lançamento ou da campanha em volta das âncoras. Pronto quando cada e-mail da sequência tem data e hora.
3. **Encaixe os fluxos automáticos.** Boas-vindas, carrinho abandonado e pós-venda são disparados por gatilho, não por data. Registre o gatilho e a regra de convivência com a campanha (por exemplo: quem está nos primeiros dias de boas-vindas não recebe o aquecimento). Pronto quando cada fluxo tem gatilho e regra de convivência.
4. **Aplique o limite de frequência.** Verifique, segmento por segmento, se algum contato recebe mais e-mails de marketing num dia do que o limite. Resolva movendo, juntando ou cortando. E-mails transacionais (acesso, recibo, reembolso) não entram no limite. Pronto quando nenhum dia ultrapassa o limite para nenhum segmento.
5. **Escolha horários.** Use o dado do usuário quando houver. Sem dado, proponha um horário e marque como suposição a testar, sem prometer resultado. Pronto quando cada horário tem a origem anotada: dado real ou suposição.
6. **Feche as regras de envio.** Só contatos com consentimento (LGPD), todo e-mail de marketing com link de descadastro, compradores fora das ofertas do mesmo produto, descadastro respeitado em todos os fluxos. Pronto quando as regras estão no topo da saída.
7. **Liste as tarefas do usuário.** O que ele precisa agendar, ligar ou desligar na ferramenta, em ordem de data. Pronto quando cada linha da tabela vira uma tarefa clara.

## Saída

```text
Período: [INÍCIO] a [FIM] | Fuso: [FUSO]
Regras: só quem consentiu (LGPD); descadastro em todo marketing; máximo [N] marketing/dia/contato

| Data | Hora | Segmento | E-mail | Tipo | Origem do horário |
| ...  | ...  | ...      | ...    | marketing ou transacional | dado real ou suposição |

Fluxos automáticos
- [FLUXO]: gatilho [GATILHO] | convivência: [REGRA]

Tarefas na ferramenta
1. [DATA] agendar ...
```

## Erros comuns

- Esquecer que boas-vindas e lançamento atingem a mesma pessoa no mesmo dia.
- Contar e-mail transacional no limite e atrasar um acesso de compra.
- Escolher horário "porque é o melhor do mercado" sem dado da própria lista.
- Deixar o fechamento sem fuso e confundir clientes de outros estados.
- Não desligar a sequência de lançamento depois do fechamento.
