---
name: estruturar-landing
description: Monta a estrutura de uma landing page de lançamento, com a ordem das seções, o que cada uma precisa provar e o texto de rascunho de cada bloco, entregue em Markdown ou em HTML simples sem framework. Use quando o usuário precisar planejar ou escrever do zero a página de um lançamento, ou reorganizar uma página cuja ordem de argumentos não convence.
---

# Estruturar landing

Esta skill transforma a oferta de um lançamento em uma página com sequência lógica: cada seção responde a uma dúvida do visitante e prepara a próxima. O resultado é um esqueleto com a ordem das seções, a prova que cada uma exige e o texto de rascunho, em Markdown ou em um único arquivo HTML que abre direto no navegador.

## Quando usar

- O lançamento tem oferta definida e ainda não tem página.
- A página existe, mas os blocos estão fora de ordem (preço antes da prova, depoimentos soltos no fim).
- O usuário quer um rascunho para depois passar ao designer ou ao desenvolvedor.

Para conferir a página pronta em várias larguras de tela, use checklist-responsividade. Para definir cores e fontes da página, use paleta-tipografia. Esta skill cuida da estrutura e do texto, não do visual final.

## O que pedir antes

- Produto ou serviço, para quem é e qual transformação entrega.
- Ação principal da página (comprar, entrar na lista, agendar).
- Preço, condições e garantia, se já existirem. Se não, marcar [PREÇO REAL] e [GARANTIA REAL].
- Provas disponíveis: depoimentos, números, prints, casos. Sem prova fornecida, usar [DEPOIMENTO REAL] e [NÚMERO REAL].
- Formato de entrega preferido: Markdown ou HTML simples.
- Área regulada (saúde, direito, finanças): pedir a regra do conselho que se aplica.

## Passo a passo

1. **Escreva a promessa em uma frase.** Formato: "[público] consegue [resultado] sem [obstáculo principal]". Pronto quando a frase não depende de adjetivo vago e o produto consegue cumprir o que ela diz.
2. **Liste as objeções do visitante.** No mínimo cinco, nas palavras dele ("não tenho tempo", "já tentei", "é caro", "funciona para o meu caso?", "e se eu não gostar?"). Pronto quando cada objeção tem uma seção que a responde.
3. **Ordene as seções.** Use a sequência abaixo como base e remova só o que não tiver conteúdo real:
   1. Abertura: promessa, para quem é, CTA.
   2. Problema: a situação atual do público, sem exagero.
   3. Solução: o que é o produto e como funciona em três passos.
   4. Conteúdo ou entregáveis: itens concretos.
   5. Prova: depoimentos, casos, números fornecidos.
   6. Quem entrega: autoridade com fatos verificáveis.
   7. Oferta: preço, condições, bônus reais, CTA.
   8. Garantia e riscos: o que acontece se não servir.
   9. Perguntas frequentes: objeções restantes.
   10. Fechamento: resumo da decisão e CTA final.
   Ajustes permitidos: se a objeção mais pesada é de risco ou de preço, a Garantia sobe para logo depois da Oferta, ao lado do CTA; se a venda fecha em chamada ou WhatsApp, a Oferta vira "como funciona a conversa" e o preço pode ficar para a conversa, desde que a página diga isso. Pronto quando cada seção tem um objetivo escrito em uma linha e cada ajuste na ordem tem o motivo.
4. **Defina o que cada seção precisa provar.** Para cada uma, escreva a afirmação e a evidência que a sustenta. Afirmação sem evidência vira marcador [PROVA NECESSÁRIA] ou sai da página. Pronto quando nenhuma afirmação forte fica sem evidência ou marcador.
5. **Escreva o rascunho de cada bloco.** Título que diga o argumento, até três parágrafos curtos ou uma lista, e CTA quando couber (abertura, depois da prova, oferta e fechamento). Sem contagem regressiva ou "últimas vagas" se não houver prazo ou limite real. Pronto quando os títulos, lidos em sequência, contam o argumento inteiro.
6. **Gere o arquivo no formato pedido.** Markdown: um `##` por seção. HTML: um único arquivo com `<section>` por bloco, CSS mínimo no `<head>`, sem biblioteca externa, com `lang="pt-BR"` e `meta viewport`. Pronto quando o arquivo abre no navegador sem erro e, na largura de 375 px, `document.documentElement.scrollWidth <= window.innerWidth` (confira no console do navegador ou com checklist-responsividade). Sem navegador disponível, registre "rolagem horizontal não testada" nas Pendências.
7. **Revise contra as regras.** Confira marcadores, promessas e regras do conselho profissional, se houver. Se a garantia for de 7 dias em venda on-line, avise que esse prazo é o direito de arrependimento do Código de Defesa do Consumidor (art. 49) e não deve ser apresentado como diferencial. Pronto quando a lista de pendências está escrita.

## Saída

```text
Promessa: [FRASE]
Ação principal: [AÇÃO]

Mapa de seções
1. [Seção] | Objetivo: [linha] | Prova: [evidência ou marcador]
...

Arquivo: [caminho do .md ou .html]

Pendências
- [marcadores a preencher, provas faltando, trechos a revisar por regra profissional]
```

Esqueleto HTML mínimo:

Branco sobre #C2410C dá 5,18:1 (passa AA). Se trocar as cores, recalcule com paleta-tipografia.

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>[NOME DO PRODUTO]</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,sans-serif;line-height:1.6;color:#1A1A2E;background:#FFFFFF}
section{padding:48px 16px;max-width:720px;margin:auto}
img{max-width:100%;height:auto}
.cta{display:inline-block;background:#C2410C;color:#FFFFFF;padding:14px 24px;border-radius:8px;font-weight:700;text-decoration:none}
.cta:focus-visible{outline:3px solid #1A1A2E;outline-offset:2px}
</style>
</head>
<body>
<section id="abertura">... <a class="cta" href="#oferta">[TEXTO DO CTA]</a></section>
</body>
</html>
```

## Erros comuns

- Colocar o preço antes de o visitante entender o valor e ver a prova.
- Inventar depoimento ou número para preencher a seção de prova.
- Criar dois CTAs principais com o mesmo peso, um para comprar e outro para "saber mais".
- Título de seção decorativo ("Nossa história") em vez de argumento ("Quem já aplicou o método em [NÚMERO REAL] clínicas").
- Prometer resultado garantido em saúde, direito ou finanças, ou vender a garantia de 7 dias como diferencial: em compra on-line ela é o direito de arrependimento do CDC.
