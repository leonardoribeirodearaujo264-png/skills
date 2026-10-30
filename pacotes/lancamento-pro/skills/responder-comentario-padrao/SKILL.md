---
name: responder-comentario-padrao
description: Classifica comentários públicos de posts e vídeos do lançamento e escreve rascunhos de resposta curtos, no tom da marca, a partir de um banco de respostas padrão que o usuário aprova. Nunca publica e nunca escreve preço em comentário público. Use quando o usuário colar ou exportar comentários e quiser respostas prontas para revisar, ou quiser montar o banco de respostas padrão antes de o lançamento começar.
---

# Responder comentário padrão

Esta skill organiza os comentários públicos e devolve um rascunho de resposta para cada um, com base em respostas modelo aprovadas pelo usuário. A resposta pública é curta, educada e, quando o assunto pede conversa, convida para a mensagem privada. Nada é publicado nem enviado: o usuário copia, ajusta e responde por conta própria.

## Quando usar

- Muitos comentários chegaram no post de abertura ou no vídeo de aquecimento.
- O usuário quer um banco de respostas padrão para dúvidas que se repetem.
- Há comentário negativo ou crítico e é preciso uma resposta pública equilibrada.

Esta skill escreve toda resposta pública, inclusive a de "quanto custa" e "está caro". A conversa privada que vem depois fica com outras skills: interesse com responder-dm-interesse, preço com tratar-objecao-preco, decisão de compra com encaminhar-lead-checkout.

## O que pedir antes

- Os comentários, colados ou em arquivo, com autor, plataforma e post de origem.
- Fatos do produto que podem ser ditos em público: datas, formato, para quem é. Sem fato, usar [DADO REAL].
- Onde está o link em cada plataforma (bio, descrição do vídeo, comentário fixado). Sem essa informação, usar [ONDE ESTÁ O LINK].
- Tom da marca (formal, próximo, técnico) e o que nunca dizer.
- Área regulada: regra do conselho profissional sobre resposta pública (por exemplo, não dar orientação individual em comentário).

## Passo a passo

1. **Classifique cada comentário.** Categorias: dúvida sobre o produto, interesse ("quero", "como faço"), elogio, objeção de preço, crítica, fora do tema, ofensa ou spam. Pronto quando todos os comentários têm uma categoria.
2. **Monte ou atualize o banco de respostas.** Uma resposta modelo para cada uma das 7 categorias, com espaço para o nome da pessoa e um detalhe do comentário dela. Até 2 frases. Se o usuário ainda não aprovou o banco, não pare: entregue banco e rascunhos juntos, com o banco marcado "aguardando aprovação". Pronto quando as 7 categorias têm modelo e o status do banco está escrito.
3. **Personalize cada rascunho.** Cite o ponto específico do comentário, para não parecer robô. Pronto quando não há dois rascunhos idênticos em toda a tabela.
4. **Leve para a conversa privada o que pede conversa.** Interesse, caso pessoal, dados sensíveis e qualquer pergunta sobre preço viram convite para a mensagem privada, sem expor a pessoa. Pronto quando nenhum rascunho pede dado pessoal em público.
5. **Preço nunca vai em comentário.** Nenhum valor, parcela, cupom ou desconto aparece na resposta pública, mesmo que o preço já esteja divulgado. A resposta só reconhece a pergunta e convida para a conversa privada. O conteúdo da conversa privada é escrito com tratar-objecao-preco. Pronto quando nenhum rascunho contém número de preço ou condição de pagamento.
6. **Não afirme ação que não aconteceu.** A skill não envia mensagem privada, então o rascunho promete, não relata: "Vou te chamar no direct", nunca "Te chamei". Todo rascunho que promete contato privado leva na coluna de revisão "publicar só depois de enviar a mensagem privada". Pronto quando nenhum rascunho descreve envio, contato ou correção como já feitos.
7. **Trate crítica, ofensa e dado sensível à parte.** Crítica recebe reconhecimento e caminho de solução, sem discussão e sem prometer prazo que o usuário não confirmou. Ofensa e spam recebem sugestão de ocultar ou ignorar, decisão do usuário. Se a própria pessoa expôs dado de saúde ou financeiro, não responda ao dado em público e sugira ao usuário avaliar ocultar o comentário para protegê-la. Pronto quando esses casos estão marcados para revisão manual.
8. **Revise contra as regras.** Sem promessa de resultado, sem escassez falsa ("só hoje", "últimas vagas") se não houver limite real, sem desconto, sem orientação de saúde, jurídica ou financeira individual em público. Pronto quando cada rascunho passou pela revisão.
9. **Entregue para aprovação.** Pronto quando banco e tabela estão no formato da saída e o aviso de que nada foi publicado está escrito.

## Saída

```text
Banco de respostas ([aguardando aprovação | aprovado])
- Dúvida: "Oi, [nome]! [resposta ao ponto, com fato real]. Os detalhes estão em [ONDE ESTÁ O LINK]."
- Interesse: "Que bom, [nome]! Vou te chamar no direct para explicar como funciona [detalhe]."
- Elogio: "[nome], que alegria saber que [detalhe]! [próximo passo real, como a próxima aula]."
- Objeção de preço: "[nome], boa pergunta. Vou te chamar no direct para te passar valores e condições com calma."
- Crítica: "[nome], obrigado por falar. [reconhecimento do fato]. Posso te chamar no direct para entender melhor?"
- Fora do tema: "[nome], [resposta curta ou indicação honesta de que não é o foco]."
- Ofensa ou spam: sem resposta. Sugestão: ocultar ou ignorar (decisão sua).

Rascunhos
| # | Autor | Plataforma | Categoria | Comentário | Rascunho | Revisão manual |
|---|---|---|---|---|---|---|

Nada foi publicado nem enviado. Revise, ajuste e responda pela plataforma.
```

## Erros comuns

- Responder todos com a mesma frase, o que a plataforma e o público percebem.
- Escrever preço, parcela ou desconto no comentário em vez de convidar para a conversa privada.
- Publicar "Te chamei no direct" sem que a mensagem tenha sido enviada.
- Prometer resultado na resposta a um elogio ou dúvida.
- Publicar ou ocultar comentário sem a aprovação explícita do usuário.

## Exemplo de pedido

> Use a responder-comentario-padrao nos comentários do arquivo `comentarios-aula-1.txt`. O curso abre em [DATA REAL], o link está na bio do Instagram e o tom é próximo, sem gírias.
