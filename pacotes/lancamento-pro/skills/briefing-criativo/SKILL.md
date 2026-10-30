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
2. **Escolha o ângulo.** Dor, desejo, objeção, prova, comparação ou bastidor. Um ângulo por peça. Pronto quando o ângulo está nomeado e justificado com algo que o usuário disse.
3. **Escreva três ganchos.** Primeira fala ou primeiro texto na tela, até os primeiros segundos. Cada gancho diferente no tipo (pergunta, afirmação, cena). Pronto quando há três opções e uma marcada como principal.
4. **Monte o roteiro de cenas.** Tabela com tempo aproximado, o que se vê, o que se ouve e o texto na tela. Para imagem ou carrossel, um quadro por linha. Pronto quando a peça tem começo (gancho), meio (prova ou explicação) e fim (CTA).
5. **Defina CTA e destino.** Ação única e página de destino. Se houver UTM, cite o nome da peça para montar-utms. Pronto quando CTA e URL estão escritos.
6. **Marque as provas.** Use só o que o usuário forneceu. O resto vira [DEPOIMENTO REAL] ou [NÚMERO REAL]. Pronto quando nenhuma prova inventada aparece.
7. **Liste restrições.** Regras da plataforma sobre promessas e atributos pessoais, regras do conselho profissional, marca (cores, fontes, tom). Avise quando um trecho puder ferir uma regra. Pronto quando a lista está escrita.
8. **Defina entregáveis.** Formatos, legendas, versão sem texto, nome do arquivo. Pronto quando o produtor sabe exatamente o que entregar.

## Saída

```text
Peça: [nome no padrão do usuário] | Formato: [vídeo/imagem/carrossel] | Prazo: [data]
Objetivo: [frase] | Público: [frase] | Ângulo: [ângulo]

Ganchos
1. (principal) [...]
2. [...]
3. [...]

Roteiro
| Tempo | Imagem | Fala/Áudio | Texto na tela |

CTA: [texto] -> [URL]
Provas: [itens reais ou marcadores]
Restrições: [plataforma, conselho, marca]
Entregáveis: [lista com proporções a confirmar na especificação atual]
```

## Erros comuns

- Dois ângulos na mesma peça, e o espectador não guarda nenhum.
- Gancho que só se entende com som, sem texto na tela para quem assiste mudo.
- Depoimento ou número "de exemplo" que acaba indo ao ar.
- Promessa de resultado em área regulada sem checar a regra do conselho.
- Briefing sem destino nem nome de arquivo, que quebra o rastreio.

## Exemplo de pedido

> Use o briefing-criativo para um vídeo de 30 segundos do meu curso de confeitaria para público frio. Tenho dois depoimentos autorizados de alunas.
