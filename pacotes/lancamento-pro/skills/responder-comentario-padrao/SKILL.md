---
name: responder-comentario-padrao
description: Classifica comentários públicos de posts e vídeos do lançamento e escreve rascunhos de resposta curtos, no tom da marca, a partir de um banco de respostas padrão que o usuário aprova. Nunca publica. Use quando o usuário colar ou exportar comentários e quiser respostas prontas para revisar, ou quiser montar o banco de respostas padrão antes de o lançamento começar.
---

# Responder comentário padrão

Esta skill organiza os comentários públicos e devolve um rascunho de resposta para cada um, com base em respostas modelo aprovadas pelo usuário. A resposta pública é curta, educada e, quando o assunto pede conversa, convida para a mensagem direta. Nada é publicado: o usuário copia, ajusta e responde por conta própria.

## Quando usar

- Muitos comentários chegaram no post de abertura ou no vídeo de aquecimento.
- O usuário quer um banco de respostas padrão para dúvidas que se repetem.
- Há comentário negativo ou crítico e é preciso uma resposta pública equilibrada.

Quando a pessoa já está na mensagem direta mostrando interesse, use responder-dm-interesse. Quando o comentário é especificamente "está caro" ou pede desconto, use tratar-objecao-preco. Quando a pessoa já decidiu comprar e só quer o link, use encaminhar-lead-checkout.

## O que pedir antes

- Os comentários, colados ou em arquivo, com autor e post de origem.
- Fatos do produto que podem ser ditos em público: datas, formato, para quem é, onde está o link. Sem fato, usar [DADO REAL].
- Tom da marca (formal, próximo, técnico) e o que nunca dizer.
- Área regulada: regra do conselho profissional sobre resposta pública (por exemplo, não dar orientação individual em comentário).

## Passo a passo

1. **Classifique cada comentário.** Categorias: dúvida sobre o produto, interesse ("quero", "como faço"), elogio, objeção de preço, crítica, fora do tema, ofensa ou spam. Pronto quando todos os comentários têm uma categoria.
2. **Monte ou atualize o banco de respostas.** Uma resposta modelo por categoria, com espaço para o nome da pessoa e um detalhe do comentário dela. Até 2 frases. Pronto quando o usuário aprovou o banco ou pediu ajustes.
3. **Personalize cada rascunho.** Cite o ponto específico do comentário, para não parecer robô. Não copie a mesma frase em vários comentários seguidos. Pronto quando nenhum rascunho é idêntico ao anterior.
4. **Leve para a mensagem direta o que pede conversa.** Interesse, caso pessoal, dados sensíveis e preço detalhado viram convite para a DM, sem expor a pessoa. Pronto quando nenhum rascunho pede dado pessoal em público.
5. **Trate crítica e ofensa à parte.** Crítica recebe reconhecimento e caminho de solução, sem discussão. Ofensa e spam recebem sugestão de ocultar ou ignorar, decisão do usuário. Pronto quando esses casos estão marcados para revisão manual.
6. **Revise contra as regras.** Sem promessa de resultado, sem escassez falsa ("só hoje", "últimas vagas") se não houver limite real, sem desconto que o usuário não autorizou. Pronto quando cada rascunho passou pela revisão.
7. **Entregue para aprovação.** Pronto quando a tabela está no formato da saída e o aviso de que nada foi publicado está escrito.

## Saída

```text
Banco de respostas (para aprovar)
- Dúvida: "Oi, [nome]! [resposta ao ponto]. Os detalhes estão no link da bio."
- Interesse: "Que bom, [nome]! Te chamei na mensagem direta para explicar como funciona."
- Crítica: "[nome], obrigado por falar. [reconhecimento]. Posso te chamar no direct para entender melhor?"

Rascunhos
| # | Autor | Categoria | Comentário | Rascunho | Revisão manual |
|---|---|---|---|---|---|

Nada foi publicado. Revise, ajuste e responda pela plataforma.
```

## Erros comuns

- Responder todos com a mesma frase, o que a plataforma e o público percebem.
- Discutir preço ou caso pessoal em público.
- Prometer resultado na resposta a um elogio ou dúvida.
- Rebater crítica com ironia ou defesa longa.
- Publicar ou ocultar comentário sem a aprovação explícita do usuário.

## Exemplo de pedido

> Use a responder-comentario-padrao nos comentários do arquivo `comentarios-aula-1.txt`. O curso abre em [DATA REAL], o link está na bio e o tom é próximo, sem gírias.
>
> Quero primeiro aprovar o banco de respostas e depois ver os rascunhos.
