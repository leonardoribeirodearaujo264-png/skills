---
name: briefing-criativo
description: Escreve o briefing de um criativo de anúncio (vídeo, imagem ou carrossel) para designer, editor ou para o próprio usuário produzir, com objetivo, público, ângulo, gancho, roteiro de cenas, texto na tela, CTA, provas reais e restrições. Use quando o usuário precisar pedir, encomendar ou planejar uma peça de anúncio antes de produzir.
---

# Briefing criativo

Resultado: um briefing de uma página por peça, que qualquer pessoa consegue produzir sem fazer perguntas de volta. Toda prova, número ou depoimento vem do usuário; o que faltar fica marcado para ele preencher.

## Quando usar

- Antes de encomendar um vídeo, imagem ou carrossel para anúncio.
- Quando o usuário tem a ideia na cabeça e precisa transformar em instrução para o editor.
- Para gerar as variações de uma rodada de teste já planejada.

Para decidir quais variações testar e com quanto orçamento, use matriz-teste-ab primeiro. Para avaliar por que um criativo já no ar não performa, use ler-relatorio-anuncios. Esta skill não escreve a página de vendas.

## O que pedir antes

- Produto, oferta e preço como aparecem na página.
- Público em uma frase e a dor ou desejo principal.
- Objetivo da peça: atenção para público frio, prova para público morno, urgência para quem já conhece.
- Provas disponíveis de verdade: depoimentos com autorização, números, prints, casos.
- Formato e posicionamento desejados. Proporções e durações aceitas mudam; o usuário confere a especificação atual da plataforma.
- Área regulada (saúde, direito, finanças) e regras do conselho profissional que se aplicam.
- Prazo, quem produz e em que ferramenta.

## Passo a passo

1. **Feche objetivo e público.** Uma frase para cada. Pronto quando o objetivo cabe em "esta peça faz [público] [ação]".
2. **Levante as restrições antes de escrever.** Regras da plataforma sobre promessas e atributos pessoais (saúde, condição física ou mental, finanças pessoais, entre outros), regras do conselho profissional, marca (cores, fontes, tom). Pronto quando a lista está escrita e será aplicada aos passos seguintes.
3. **Escolha o ângulo.** Dor, desejo, objeção, prova, comparação, bastidor, ou outro, com justificativa. Um ângulo por peça. Pronto quando o ângulo está nomeado e justificado com algo que o usuário disse.
4. **Escreva três ganchos.** Primeira fala ou primeiro texto na tela, até os primeiros segundos. Cada gancho diferente no tipo (pergunta, afirmação, cena). Em área regulada, aplique as restrições do passo 2 já aqui: a pergunta é sobre hábito ou situação ("passa o dia sentado?"), nunca sobre a condição da pessoa ("você tem dor lombar?"). Pronto quando há três opções, uma marcada como principal, e nenhuma fere as restrições.
5. **Monte o roteiro de cenas.** Tabela com tempo aproximado, o que se vê, o que se ouve e o texto na tela. Para imagem ou carrossel, um quadro por linha. Pronto quando a peça tem começo (gancho), meio (prova ou explicação) e fim (CTA), e o gancho se entende sem som.
6. **Defina CTA e destino.** Ação única e página de destino. Se houver UTM, cite o nome da peça para montar-utms. Pronto quando CTA e URL estão escritos.
7. **Marque as provas.** Use só o que o usuário forneceu. O resto vira [DEPOIMENTO REAL] ou [NÚMERO REAL]. Confira também o conteúdo da prova real: depoimento que afirma cura, resultado garantido ou prazo de resultado não entra como está; sinalize e sugira o trecho que pode ir ao ar. Pronto quando nenhuma prova inventada aparece e cada depoimento foi conferido contra as restrições.
8. **Revise o roteiro inteiro contra as restrições.** Fala, texto na tela e legenda. Avise com "Atenção:" quando um trecho puder ferir uma regra. Pronto quando cada risco está marcado ou a revisão diz "nenhum".
9. **Defina entregáveis.** Formatos, legendas, versão sem texto, nome do arquivo. Pronto quando o produtor sabe exatamente o que entregar.

## Saída

```text
Peça: [nome no padrão do usuário] | Formato: [vídeo/imagem/carrossel] | Prazo: [data]
Objetivo: [frase] | Público: [frase] | Ângulo: [ângulo e justificativa]

Restrições: [plataforma, conselho, marca]

Ganchos
1. (principal) [...]
2. [...]
3. [...]

Roteiro
| Tempo | Imagem | Fala/Áudio | Texto na tela |

CTA: [texto] -> [URL]
Provas: [itens reais ou marcadores; depoimento conferido: ok ou trecho a cortar]
Atenção: [riscos encontrados ou "nenhum"]
Entregáveis: [lista com proporções a confirmar na especificação atual]
```

## Erros comuns

- Dois ângulos na mesma peça, e o espectador não guarda nenhum.
- Gancho em pergunta sobre a condição de saúde da pessoa, que fere a regra de atributos pessoais.
- Depoimento real usado como está, com promessa de cura ou resultado garantido.
- Depoimento ou número "de exemplo" que acaba indo ao ar.
- Briefing sem destino nem nome de arquivo, que quebra o rastreio.

## Exemplo de pedido

> Use o briefing-criativo para um vídeo de 30 segundos do meu curso de confeitaria para público frio. Tenho dois depoimentos autorizados de alunas.
