---
name: extrair-linguagem-depoimentos
description: Lê depoimentos, comentários, respostas de pesquisa e mensagens reais de clientes e extrai as frases exatas que eles usam para descrever problema, resultado, dúvida e decisão, organizadas para uso em copy. Use quando o usuário entregar material de clientes e quiser saber como eles falam, ou antes de escrever página, anúncio ou e-mail com a voz do cliente.
---

# Extrair linguagem de depoimentos

Banco de frases reais do cliente, separado por função: como ele descreve o problema, o que tentou antes, o que mudou, o que quase o fez desistir e por que comprou. Cada frase vem com a fonte e com a autorização de uso marcada. O resultado serve de matéria-prima para quem escreve; esta skill não escreve a copy.

## Quando usar

- O usuário colou ou apontou arquivos com depoimentos, prints transcritos, respostas de formulário, comentários ou conversas de atendimento.
- A copy atual soa como o vendedor falando e não como o cliente.
- Antes de definir ângulo ou promessa, para ter vocabulário real.

Se não há material de cliente e o objetivo é descobrir quais problemas existem, use mapear-dores. Se o material é sobre motivos de não comprar, a extração entra aqui, mas a análise de resposta a cada objeção fica em levantar-objecoes.

## O que pedir antes

- O material bruto, em arquivo ou colado na conversa. Sem material, pare: esta skill não inventa fala de cliente.
- Origem de cada peça (depoimento autorizado, comentário público, mensagem privada, pesquisa anônima).
- Se há autorização para publicar nome, foto ou trecho. Sem resposta, trate tudo como [SEM AUTORIZAÇÃO].
- Produto e público, em uma linha cada.

## Passo a passo

1. **Inventarie o material.** Liste cada peça com um código (D1, D2, C1...) e a origem. Use Read e Grep para arquivos. Pronto quando cada peça tem código, origem e status de autorização.
2. **Marque trechos por função.** Em cada peça, recorte frases curtas e classifique:
   - Antes: como descreve o problema.
   - Tentativas: o que já fez e não funcionou.
   - Virada: o que fez mudar de ideia.
   - Depois: resultado com as palavras dela.
   - Freio: dúvida, medo ou objeção citada.
   - Decisão: motivo declarado para comprar.
   Pronto quando todas as peças foram lidas e cada recorte tem função.
3. **Preserve a fala.** Copie o trecho do cliente exatamente como está, inclusive gírias e erros leves. Corrija apenas o que impede a leitura e marque [AJUSTE]. Pronto quando nenhum trecho foi reescrito sem marca.
4. **Encontre padrões.** Conte palavras e expressões que se repetem em peças diferentes. Pronto quando há uma lista das 5 a 10 expressões mais repetidas, com contagem.
5. **Separe o que pode ir para a página.** Para cada trecho com resultado, confira se tem contexto verificável (quem, situação, prazo). Resultado de saúde, dinheiro ou processo judicial ganha alerta de regra do conselho ou de publicidade. Pronto quando cada trecho de "Depois" está marcado como usável, usável com autorização ou só referência interna.
6. **Entregue o banco no formato da Saída.** Pronto quando cada frase tem código de fonte e status.

## Saída

```text
Material: [quantidade] peças | Autorizadas para publicação: [quantidade]

Expressões que se repetem
- "[expressão]" (x vezes: D1, D4, C2)

Antes
- "[frase exata]" (D3) [SEM AUTORIZAÇÃO]
Tentativas
- ...
Virada
- ...
Depois
- "[frase exata]" (D1) usável | contexto: [quem, prazo]
Freio
- ...
Decisão
- ...

Alertas: [resultado que exige cuidado, trecho sem contexto, peça sem origem]
```

## Erros comuns

- Melhorar a frase do cliente até ela parecer texto de vendedor. A força está na fala original.
- Usar na página trecho de mensagem privada sem autorização.
- Juntar duas falas de pessoas diferentes em um depoimento só.
- Completar resultado vago com número que o cliente não disse. Número só se estiver no material; senão [NÚMERO REAL].
- Esquecer os freios, que mostram as objeções com a voz de quem quase não comprou.
