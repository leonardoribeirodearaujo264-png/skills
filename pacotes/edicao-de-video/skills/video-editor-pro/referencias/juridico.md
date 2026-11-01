# Modo JURIDICO-PRO

Para vídeos de advogado e escritório de advocacia.

Preset: `~/.video-agent/presets/juridico.json`

## Regra que domina todas as outras

**Nunca invente lei, artigo, jurisprudência, prazo, valor ou decisão.**

Isso inclui não "corrigir" o que a pessoa disse. Se a transcrição traz
"artigo 51 do CDC" e você acha que o correto seria outro artigo, você **não
altera**. Mantém o original e sinaliza para revisão humana:

> "Aos 19,4s você cita o artigo 51 do CDC. Confirme antes de eu queimar isso
> na legenda — o Whisper local erra número com frequência e eu não tenho como
> verificar."

Um vídeo jurídico com número errado é dano ao cliente e risco ético para o
advogado. Na dúvida, mantenha o conteúdo original ou pare e pergunte.

## Verificação obrigatória antes de renderizar

Leia o SRT inteiro e confira, palavra por palavra:

- [ ] número de artigo, lei, súmula
- [ ] prazo (dias, meses, corridos vs. úteis)
- [ ] valor em reais
- [ ] nome de tribunal, órgão, parte
- [ ] nome próprio e OAB

Qualquer um desses que você não tenha certeza absoluta: pergunte. Não adivinhe.

O `--model medium` do `transcribe_local` erra menos em números do que o
`small`. Use `medium` neste modo quando houver citação legal:

```bash
va transcribe_local video.mp4 --edit-dir edit --language pt --model medium
```

Custa mais tempo de CPU. Vale.

## Cold open desativado

`hook.permitir_cold_open: false`.

Mover uma afirmação jurídica para fora do contexto em que foi dita é o
mecanismo exato pelo qual se produz desinformação jurídica. "Você tem direito
a receber" isolado da condição que a antecede vira promessa falsa.

Se o material tem um hook fraco, o caminho é gravar um hook novo — não
recortar um.

## Estética

Elegante, séria, moderna, confiável, institucional, premium.

- Legenda `juridico`: caixa sólida discreta, sem caixa alta, 4 palavras por
  linha, margem 380. Sobriedade — não é Reels de dança.
- Destaque em dourado sóbrio, só em prazo, valor, direito e número.
- Ritmo 12 cortes/min. Autoridade vem de calma, não de velocidade. Corte
  demais parece afobado e derruba credibilidade.
- Zoom baixo: máximo 2/min, escala 1,07. Punch-in só em prazo, direito, valor,
  conclusão e CTA.
- Grade `subtle`. Nada de filtro chamativo.
- B-roll baixo (máx. 20%). O rosto do advogado é o ativo; cobri-lo com banco de
  imagem enfraquece.

## Elementos gráficos permitidos

`lower_third_nome_oab`, `card_legislacao`, `prazo_destacado`, `valor`,
`checklist`, `selo_escritorio`.

Um card de legislação deve mostrar exatamente o que foi dito, com a fonte.
Nunca parafraseie um artigo dentro de um card — reproduza ou omita.

## Estrutura

```
PERGUNTA_OU_SITUACAO -> DIREITO_APLICAVEL -> EXPLICACAO -> O_QUE_FAZER -> CTA_CONSULTA
```

O CTA de consulta não pode prometer resultado. "Agende uma análise do seu caso"
é legítimo; "garanta seus R$ 5.000" não é.

## Publicidade advocatícia

O Código de Ética da OAB restringe publicidade advocatícia (captação de
clientela, promessa de resultado, mercantilização). Isto não é uma opinião
jurídica e você não é o advogado do usuário — mas quando o roteiro contiver
promessa de resultado, valor garantido ou linguagem de captação, **aponte** e
deixe a decisão com ele. Ele é quem responde pelo conteúdo.
