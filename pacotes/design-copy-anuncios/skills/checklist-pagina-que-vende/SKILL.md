---
name: checklist-pagina-que-vende
description: Revisa uma landing page ou página de vendas em seis frentes (hierarquia, prova, oferta, CTA, velocidade e acessibilidade) e devolve uma lista de correções priorizada. Use quando pedirem para revisar, auditar ou dar nota a uma página antes de publicar ou de rodar anúncio para ela.
---

# Checklist da página que vende

Revisão de uma página cujo trabalho é levar o visitante a uma única ação: comprar, agendar, chamar no WhatsApp ou deixar o contato. O resultado é uma lista de achados, cada um com evidência, impacto e correção, ordenada do que mais trava a venda para o que menos trava.

## Quando usar

- A página está pronta e vai receber tráfego pago ou orgânico.
- O dono diz que a página "não converte" e quer saber por onde começar.
- Depois de uma mudança grande de layout ou de texto, para conferir se algo quebrou.

Para escrever o texto do zero, use a skill copywriting. Para redesenhar, use o designer-de-interface. Esta skill só revisa.

## Passo a passo

1. **Identifique a página e a ação principal.** Leia o arquivo (HTML, componente, Markdown) ou abra a URL. Escreva em uma linha qual é a ação principal e para quem a página fala. Se houver duas ações disputando o mesmo peso, isso já é o primeiro achado. Pronto quando a ação principal e o público estão escritos.
2. **Leia a primeira dobra como o visitante.** Considere só o que aparece sem rolar, em celular (375 px de largura) e em desktop. Responda: o que é, para quem é, o que eu ganho, o que faço agora. Pronto quando as quatro respostas estão escritas ou marcadas como ausentes.
3. **Passe pelas seis frentes.** Aplique todas as perguntas da seção "Frentes" abaixo. Cada pergunta termina como "ok", "achado" ou "não verificável", nunca em branco. Pronto quando todas as perguntas têm um desses três estados.
4. **Meça o que dá para medir.** Se houver URL pública e ferramenta disponível (Lighthouse, PageSpeed Insights, DevTools), rode e anote LCP, INP, CLS e peso da página com o valor medido. Sem medição, marque a pergunta de velocidade como "não verificável" e diga o que faltou. Nunca estime número.
5. **Priorize.** Classifique cada achado:
   - **P1 trava a venda:** o visitante não entende a oferta, não encontra o botão, não confia ou não consegue usar a página.
   - **P2 reduz a venda:** a página funciona, mas perde gente no caminho.
   - **P3 acabamento:** melhora percepção, sem efeito direto na ação.
   Dentro de cada nível, ordene pelo esforço, do mais barato ao mais caro.
6. **Entregue a lista no formato da seção "Saída".** Pronto quando cada achado tem frente, evidência, impacto e correção, e o resumo cabe em três linhas.

## Frentes

### Hierarquia
- A manchete diz o resultado para o cliente, e não o nome da empresa?
- Existe um único ponto de entrada visual na primeira dobra?
- Os títulos das seções, lidos em sequência, contam o argumento sozinhos?
- O tamanho e o peso dos elementos seguem a importância deles?
- No celular, a ordem dos blocos continua fazendo sentido?

### Prova
- Há prova perto de cada promessa forte (depoimento, número real, print, caso, garantia)?
- Os depoimentos têm nome, foto ou contexto que os torne verificáveis?
- Algum número ou depoimento parece inventado ou impossível de checar? Marque como P1: prova falsa destrói confiança e pode gerar problema legal.
- Existem sinais de confiança no momento da decisão (perto do botão e do preço)?

### Oferta
- Está claro o que a pessoa recebe, em itens concretos?
- O preço ou o próximo passo aparece sem esforço?
- A oferta responde às objeções principais (preço, tempo, "funciona para mim?")?
- Há garantia, prazo ou condição explicados sem letra miúda?
- A página promete resultado que o produto não pode garantir? Se sim, P1.

### CTA
- O botão principal diz o que a pessoa ganha ("Quero minha consulta"), em vez de "Enviar"?
- O CTA aparece na primeira dobra e se repete depois dos blocos de prova e de oferta?
- Existe só uma ação principal? Ações secundárias têm peso visual menor?
- O formulário pede só o necessário? Cada campo extra precisa de motivo.
- O que acontece depois do clique está claro (para onde vai, quanto tempo, o que chega)?

### Velocidade
- LCP até 2,5 s, INP até 200 ms e CLS até 0,1, medidos?
- Imagens no formato certo (WebP ou AVIF), com largura e altura definidas e carregamento tardio abaixo da dobra?
- Fontes limitadas a duas famílias, com `font-display: swap`?
- Scripts de terceiros (chat, pixel, vídeo) carregam depois do conteúdo principal?
- Para detalhar, chame as skills performance e core-web-vitals.

### Acessibilidade
- Contraste de texto de pelo menos 4,5:1 (3:1 para texto grande)?
- Toda imagem com informação tem `alt`; imagem decorativa tem `alt=""`?
- Dá para chegar ao CTA e enviar o formulário só com teclado, com foco visível?
- Campos de formulário têm rótulo visível e mensagem de erro clara?
- Alvos de toque têm pelo menos 44 por 44 px no celular?
- Para detalhar, chame a skill accessibility.

## Regras de qualidade

- **Evidência sempre.** Cada achado cita o trecho, o seletor, a linha do arquivo ou o valor medido. Achado sem evidência sai da lista.
- **Correção executável.** Escreva a mudança concreta ("trocar 'Saiba mais' por 'Agendar avaliação grátis'"), não um conselho genérico.
- **Números só medidos.** Nunca projete aumento de conversão nem invente métrica.
- **Revisão, não edição.** Entregue a lista; altere arquivos só se o usuário pedir depois.
- **Linguagem de dono de negócio.** Explique o impacto em termos de cliente e venda, sem jargão.

## Saída

```text
Página: [URL OU ARQUIVO]
Ação principal: [AÇÃO]  |  Público: [PÚBLICO]

Resumo: [ATÉ 3 LINHAS COM O QUE MAIS TRAVA A VENDA]

P1
1. [Frente] [Achado]
   Evidência: [trecho, seletor ou medição]
   Impacto: [o que o visitante deixa de fazer]
   Correção: [mudança concreta]

P2
...

P3
...

Não verificável: [perguntas que ficaram sem resposta e o que falta para responder]
```

## Exemplo de pedido

> Revise a página em `site/index.html` com a checklist-pagina-que-vende. É uma página de consultoria jurídica para pequenas empresas e a ação é agendar uma conversa pelo WhatsApp.
