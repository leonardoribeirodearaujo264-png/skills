# E-mails do lançamento

Use quando a data de abertura do carrinho estiver definida e você precisar das sequências de boas-vindas, lançamento, última chance e pós-venda prontas para colar na ferramenta de e-mail.

No Claude Code:

```text
Use o agente copywriter-emails para escrever os e-mails do lançamento de [SEU PRODUTO]. Depois passe todos pelo agente revisor-de-promessas e só me mostre o que ele aprovar.
Sequências que preciso: [BOAS-VINDAS, LANÇAMENTO, ÚLTIMA CHANCE, PÓS-VENDA, REEMBOLSO]
Oferta: [O QUE A PESSOA RECEBE, PREÇO E GARANTIA]
Isca de entrada na lista: [AULA, MATERIAL GRATUITO OU "NENHUMA"]
Carrinho abre: [DATA E HORA] | Fecha: [DATA E HORA]
Ferramenta de e-mail: [NOME DA FERRAMENTA]
Segmentos e tags que já existem: [LISTA OU "NENHUM"]
Link da página: [URL OU "AINDA NÃO TENHO"]
Quero cronograma com data, hora e segmento, dois assuntos por e-mail para teste e o CTA de cada um.
Nada é publicado, enviado, comprado ou pago sem o meu OK.
```

No Codex (cite cada agente pelo nome):

```text
Use os agentes copywriter-emails e revisor-de-promessas. O copywriter-emails escreve as sequências de [BOAS-VINDAS, LANÇAMENTO, ÚLTIMA CHANCE, PÓS-VENDA] de [SEU PRODUTO] com cronograma, segmentos e dois assuntos por e-mail. O revisor-de-promessas confere cada e-mail antes de me entregar.
Oferta: [O QUE A PESSOA RECEBE, PREÇO E GARANTIA]
Carrinho abre: [DATA E HORA] | Fecha: [DATA E HORA]
Ferramenta de e-mail: [NOME DA FERRAMENTA]
Link da página: [URL OU "AINDA NÃO TENHO"]
Nada é publicado, enviado, comprado ou pago sem o meu OK.
```
