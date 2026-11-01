# Áudio

**A voz é prioridade.** Todo o resto se ajusta a ela.

## Diagnóstico

```bash
va audio_analyze entrada.mp4 --out edit/audio.json
```

Mede, do waveform real: silêncios, EBU R128 (LUFS), true peak, RMS, piso de
ruído, faixa dinâmica, flat factor (indicador de clipping já gravado).

Leituras:

| Sintoma | Valor | Ação |
|---|---|---|
| voz muito baixa | I < -23 LUFS | normalizar, obrigatório |
| voz baixa | I < -19 LUFS | normalizar |
| voz alta demais | I > -11 LUFS | atenuar; distorce no player |
| risco de clipping | TP > -0,5 dBTP | limitar em -1,5 dBTP |
| ruído alto | piso > -50 dBFS | `--denoise` |
| clipping já gravado | flat factor > 0 | não é reparável, só atenuável |

## Masterização

```bash
va audio_master entrada.mp4 -o saida.mp4 --target reels --denoise 0.4
```

A cadeia, nesta ordem — que não é gosto:

```
highpass 80Hz -> afftdn (denoise) -> deesser -> acompressor -> loudnorm 2 passadas -> alimiter -> 48kHz
```

Limpar antes de nivelar; nivelar antes de limitar. Inverter qualquer par
amplifica o ruído que você queria remover, ou esmaga a dinâmica que o loudnorm
precisa medir.

- **highpass 80Hz** — abaixo do fundamental de qualquer voz falada. Tira ruído
  de mesa, manuseio e zumbido de rede sem tocar na voz.
- **afftdn** — 12 dB de redução é transparente; 24 dB começa a soar
  subaquático numa sala barulhenta. `--denoise 0..1` mapeia nessa faixa.
- **acompressor 3:1 acima de -20 dB, release 250ms** — nivela a entrega sem o
  bombeio que um ajuste de broadcast daria a uma voz só.
- **loudnorm em duas passadas** — a primeira mede, a segunda aplica linear.
  Uma passada só faz correção dinâmica e altera a dinâmica da fala.
- **alimiter** — teto final.

## Alvos de loudness

| Alvo | LUFS | Onde |
|---|---|---|
| `reels` / `social` | -16 | Reels, Shorts, TikTok, web geral |
| `youtube` | -14 | YouTube |
| `podcast` | -19 | podcast, fala longa |
| `broadcast` | -23 | TV / EBU R128 |

True peak em -1,5 dBTP em todos. Encoders com perda ultrapassam o pico na
decodificação: um master em 0 dBFS clipa no aparelho do espectador, não no seu.

## Música

**Só com autorização.** Não baixe nem use música protegida sem direito de uso.
Se o usuário fornecer uma trilha, use a que ele deu. Se pedir para "achar uma
música", pergunte de onde — não busque em serviço pago nem em fonte com
licença desconhecida.

```bash
va audio_master voz.mp4 -o saida.mp4 --target reels --music trilha.mp3 --music-db -22
```

O que acontece: a trilha é nivelada, depois comprimida por sidechain com a voz
**já limpa** como chave (`sidechaincompress`, threshold 0.03, ratio 8, attack
20ms, release 300ms). O leito cai ~9 dB sob a fala e volta em 300ms — rápido o
bastante para preencher as pausas, lento o bastante para não respirar entre
palavras.

`--no-duck` desliga o ducking (mixa direto). Use só quando a música é o assunto.

Regras: música sempre abaixo da voz, fades naturais, e nunca ao ponto de
prejudicar a compreensão. Se você precisa se esforçar para entender a fala, a
música está alta.

## Emendas

Fade de 30ms em cada fronteira de segmento. O `render.py` do video-use já
aplica (`afade=t=in:st=0:d=0.03` + `afade=t=out`). Sem isso há estalo audível em
cada corte — é o defeito mais comum de corte automático.

## Verificação final

O `va qc` checa pico, clipping, loudness, silêncio no início e no fim.
Silêncio inicial acima de 0,7s é sinalizado: o espectador dá play, não ouve
nada e sai.
