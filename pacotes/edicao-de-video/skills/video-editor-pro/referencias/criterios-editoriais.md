# Critérios editoriais

## Hook — os primeiros segundos

A janela é diferente por modo (está no preset): 2s em anúncio, 3s em Reels,
4s em jurídico, 15s em YouTube longo.

O hook precisa entregar rápido pelo menos um de: curiosidade, problema,
benefício, pergunta, promessa legítima, afirmação relevante.

**Cold open.** Se existir mais adiante no vídeo uma frase melhor para abrir,
pode sugerir movê-la para o começo — desde que o contexto continue fiel. Se
mover a frase faz ela significar outra coisa fora do contexto original, não
mova. Em JURIDICO-PRO cold open está desativado por padrão: tirar uma
afirmação jurídica do contexto é como se cria desinformação.

Um hook que não pode ser feito honestamente com o material existente é um
hook que não existe. Diga isso ao usuário em vez de fabricar um.

## Storytelling

Quando o material comportar:

```
HOOK -> PROBLEMA -> CURIOSIDADE -> EXPLICAÇÃO -> SOLUÇÃO -> PROVA -> CTA
```

Cada preset traz sua própria estrutura em `estrutura`. Use a do modo.

**Não reorganize falas se isso alterar significado ou contexto.** Reordenar é
permitido quando os trechos são independentes (uma lista de pontos, exemplos
paralelos). É proibido quando um trecho responde ao anterior, cita algo dito
antes, ou muda de sentido isolado.

## O que remover

- erros evidentes e tentativas erradas
- silêncios excessivos e pausas sem função
- repetições involuntárias
- falsos inícios ("ahn, quer dizer, deixa eu começar de novo")
- trechos vazios e partes sem valor para a mensagem

## O que nunca fazer

- alterar o sentido da fala
- montar frase enganosa a partir de pedaços
- fazer a pessoa parecer dizer algo diferente
- cortar palavra no meio
- produzir áudio artificialmente truncado

Preserve naturalidade. Uma pausa curta antes de uma frase importante é
retórica, não defeito — mantenha. Use fades de 30ms para esconder emendas.

## Silêncios: o que é cortável

Da medição real do waveform (`va audio_analyze`), não da transcrição:

| Duração do silêncio | Uso |
|---|---|
| >= 0,40s | ponto de corte limpo, o mais seguro |
| 0,15 – 0,40s | utilizável, mas confira o frame antes |
| < 0,15s | meio de frase — **não corte** |

Ao cortar um silêncio, deixe um resíduo (`silencio_residual_s` no preset).
Remover 100% do silêncio produz fala que soa robótica e sem ar.

Troca de locutor pede mais ar: 400–600ms é o comum. Menos para ritmo acelerado,
mais para tom cinematográfico.

## Ritmo e retenção

Cada preset tem `cortes_por_minuto_alvo` e `evento_visual_a_cada_s`.

Evento visual = corte, punch-in, B-roll, card, destaque, mudança de
enquadramento ou transição. Trecho visualmente parado por mais tempo que
`plano_maximo_sem_evento_s` é onde a retenção cai.

**Teste de cada efeito.** Ele explica, enfatiza, recupera atenção, contextualiza,
demonstra ou organiza informação? Se não faz nenhuma, sai. Efeito por efeito
cansa mais rápido do que plano parado.

## Zoom e punch-in

Use em: frase importante, mudança de argumento, momento emocional, quebra de
ritmo, CTA.

Limites no preset: `maximo_por_minuto`, `escala_punch_in`, `duracao_s`.
Escala típica 1,06–1,15. Acima de 1,20 já parece amador em talking head.

Nunca: zoom em toda frase, movimento constante, zoom exagerado, ou
enquadramento que corte olhos ou boca.

Easing sempre cúbico, nunca linear — linear parece robótico.

```python
def ease_out_cubic(t):     return 1 - (1 - t) ** 3
def ease_in_out_cubic(t):
    if t < 0.5: return 4 * t ** 3
    return 1 - (-2 * t + 2) ** 3 / 2
```

`ease_out_cubic` para revelação única (pouso lento). `ease_in_out_cubic` para
movimento contínuo.

## B-roll

Classifique cada ponto:

- **NECESSÁRIO** — a fala referencia algo visual que o espectador precisa ver
  para entender.
- **RECOMENDADO** — ajuda a compreensão ou quebra um trecho visualmente parado.
- **DESNECESSÁRIO** — só ocuparia tempo.

Nunca invente fato visual. Se a fala diz "o documento tinha três assinaturas",
não gere um documento com três assinaturas: isso fabrica prova.

Sem B-roll disponível, os substitutos honestos são texto, ícone, gráfico,
destaque, movimento e composição.

Cobertura máxima está no preset (`broll.cobertura_maxima_pct`). Passar disso e o
vídeo deixa de ser da pessoa e vira montagem de banco de imagem.

## Transições

Corte seco é o padrão. Uma transição precisa ter motivo: mudança de bloco,
salto no tempo, troca de assunto.

Evite: transições chamativas entre frases da mesma ideia, e mais de dois tipos
diferentes no mesmo vídeo.

## Design

Padrão: moderno, profissional, premium, minimalista, limpo, elegante.

Evite excesso de emojis, muitas fontes, efeitos aleatórios, transições
exageradas, excesso de cores, elementos cobrindo o rosto, estética infantil
quando não pedida.

Hierarquia, nesta ordem:

1. conteúdo / rosto
2. legenda
3. informação principal
4. elementos gráficos secundários

Se o item 4 está competindo com o item 1, o item 4 sai.
