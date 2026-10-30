# Aulas

Os vídeos não ficam no repositório (o `.gitignore` exclui `*.mp4`, `*.wav` e afins).

- **Arquivos de trabalho e render:** `D:\automacao-leo\tmp\aulas-hf\<slug>\` (projetos HyperFrames).
- **Vídeo final:** `D:\automacao-leo\aulas\<slug>\aula.mp4`, com `aula.vtt` e `aula.srt`.
- **Hospedagem:** bucket privado `loja-aulas` do Supabase Storage, em `<slug>/aula.mp4` e `<slug>/aula.vtt`. A área de membros entrega por URL assinada de 10 minutos, só para quem comprou.
- **Roteiro e legenda versionados:** `pacotes/<slug>/aula/roteiro.md` e `pacotes/<slug>/aula/legenda.srt`.

Para subir uma aula nova ou refeita: `npm run pacotes:publicar` (ver `docs/CONFIGURAR.md`).
