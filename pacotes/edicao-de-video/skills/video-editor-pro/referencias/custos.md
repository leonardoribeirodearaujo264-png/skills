# Custos

**Estado atual: nenhum serviço pago está ativo. Nada aqui cobra.**

Todo o pipeline padrão roda local: FFmpeg, faster-whisper, video-use e
HyperFrames com Chrome headless. Zero chamada de rede na edição.

## O que cobraria, se ativado

Nenhum destes está configurado. Não ative sem autorização explícita do usuário.

| Serviço | Finalidade | Custo | Alternativa gratuita já instalada |
|---|---|---|---|
| **ElevenLabs Scribe** | transcrição do video-use (`helpers/transcribe.py`) | por minuto de áudio | `va transcribe_local` — mesmo schema JSON, roda aqui |
| **HeyGen TTS** (`media-use`) | narração sintética | por caractere | gravar a voz |
| **HeyGen Cloud Render** (`hyperframes cloud render`) | render na nuvem | por render | `hyperframes render` local — já funciona |
| **AWS Lambda render** (`hyperframes lambda`) | render distribuído | AWS por invocação | idem |
| **Gemini API** (`motion-graphics`, opcional) | localizar elemento na imagem | ~US$0,001/imagem | o protocolo de grade (`grounding/locate.mjs`) faz o mesmo sem chave |
| **Google Cloud Run** | render | GCP | render local |

## Por que a transcrição local substitui o ElevenLabs por completo

O `transcribe_local.py` escreve **exatamente o mesmo schema** que o Scribe
(`{language_code, text, words:[{text,start,end,type,speaker_id}]}`, com
entradas `spacing` carregando os intervalos). Isso foi testado: o
`pack_transcripts.py` e o `render.py` do video-use consomem o arquivo local sem
nenhuma alteração.

## Onde o local é pior — e o que fazer

1. **Whisper normaliza disfluência.** Ele foi treinado para limpar hesitação.
   Parte dos "ahn", repetições e falsos inícios pode não aparecer no texto.
   O `transcribe_local.py` combate isso com um `initial_prompt` cheio de
   hesitações, o que aumenta bastante a retenção — mas não é o verbatim
   perfeito do Scribe.

   **Mitigação:** silêncio e pausa vêm do `va audio_analyze`, que mede o
   waveform real e não depende de ASR nenhum. O sinal editorial mais
   importante fica exato.

2. **Sem diarização.** Todos os `speaker_id` saem como `speaker_0`. Em podcast
   com dois participantes, a separação de locutor precisa ser feita à mão (ou
   por faixas de áudio separadas, se a gravação tiver).

3. **Erra número e nome próprio.** Use `--model medium` quando isso importar.
   Em JURIDICO-PRO isso é obrigatório e a revisão manual do SRT também.

Se em algum momento o usuário quiser precisão verbatim e diarização
automáticas, o ElevenLabs Scribe é a opção — mas apresente o custo por minuto
e espere ele autorizar. Nunca escreva uma chave de API sem que ele peça.

## Regra

Se uma funcionalidade exigir API paga, créditos, assinatura, serviço de nuvem,
geração paga ou armazenamento pago:

**não contrate, não ative.** Informe SERVIÇO / FINALIDADE / CUSTO /
ALTERNATIVA GRATUITA e espere autorização.
