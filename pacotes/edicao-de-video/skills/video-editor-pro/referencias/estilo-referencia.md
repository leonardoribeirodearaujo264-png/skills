# Aprender estilo de um vídeo de referência

Quando o usuário disser *"use este vídeo só como referência de ritmo e
linguagem visual"*:

```bash
va style_probe referencia.mp4 --name "meu-estilo" --out presets/estilo-meu.json
```

## O que é extraído — e o que não é

Sai um conjunto de **números sobre a edição**, não conteúdo:

- **canvas** — resolução, proporção, orientação, fps
- **ritmo** — total de cortes, cortes por minuto, duração mediana/média/mín/máx
  do plano, e uma leitura em português ("rápido — Reels/Shorts padrão")
- **movimento** — energia de 0 a 1, diferença média entre frames consecutivos;
  distingue plano fixo de punch-in pontual de câmera solta
- **imagem** — luma médio e saturação média, com leitura ("escuro/
  cinematográfico", "dessaturado/sóbrio")
- **fala** — proporção do tempo com voz e número de pausas; diz se a referência
  é falada de ponta a ponta ou deixa espaço para música e B-roll
- **sugestões** — `cut_intensity`, `zoom_intensity`, `target_shot_length_s`,
  `format_hint`, já no vocabulário dos presets

**Nunca copie material protegido.** Nenhum frame, áudio, texto, fonte, trilha
ou asset da referência é reutilizado. O que se extrai são fatos sobre a
montagem — cadência de corte, densidade de movimento, faixa tonal — que não são
elemento protegível.

Se o usuário pedir para reproduzir a identidade visual de um canal (a fonte
exata, a paleta exata, o pacote gráfico), isso é outra conversa: aponte que
copiar a identidade de terceiro é problema jurídico, não técnico.

## Aplicar

O JSON gerado tem `suggested_preset_overrides`. Aplique-os sobre o preset do
modo:

```bash
# ler os dois e decidir o que sobrepor
cat presets/reels.json
cat presets/estilo-meu.json
```

Sobreponha só o que a referência realmente ensina — ritmo, zoom, duração de
plano, formato. Não sobreponha alvo de loudness, safe zone ou regras
editoriais: essas são exigências de plataforma e de honestidade, não estilo.

Diga ao usuário qual valor mudou e por quê:

> "A referência corta a cada 2,1s (28 cortes/min). Seu preset REELS-PRO está em
> 22. Subo para 28 no ritmo e mantenho o resto?"

## Limite da medição

A detecção de corte usa diferença de cena (`select='gt(scene,0.30)'`).
Ela acha corte entre planos visualmente distintos. **Não acha jump cut dentro
do mesmo enquadramento** — que é justamente o corte mais comum em talking head.

Então em vídeo de uma pessoa só, plano fixo, o `cuts_per_minute` sai baixo
demais. Use `--scene-threshold 0.15` para ficar mais sensível, e trate o número
como piso, não como verdade.

Para talking head, o sinal mais útil da referência é o `speech_ratio` e a
energia de movimento, não a contagem de cortes.

## Guardar

Salve cada estilo aprendido em `presets/estilo-<nome>.json`. Eles acumulam:
com o tempo o usuário terá o vocabulário de ritmo dele mapeado, e pedir "no
meu estilo de sempre" passa a ter significado concreto.
