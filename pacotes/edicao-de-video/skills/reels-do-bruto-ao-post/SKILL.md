---
name: reels-do-bruto-ao-post
description: Leva um vídeo bruto de fala até o Reels ou Short pronto em 1080x1920, com transcrição, corte de silêncio e erros, gancho nos 3 primeiros segundos, legenda e render. Use quando pedirem para transformar uma gravação em Reels, Shorts ou TikTok.
---

# Reels do bruto ao post

Fluxo de ponta a ponta para uma gravação de fala (talking head) virar um vídeo vertical pronto para postar. Tudo roda no computador. Esta skill é o mapa: cada passo diz qual skill de terceiro faz o trabalho.

## Quando usar

- Gravação de celular ou câmera com uma pessoa falando, que precisa virar Reels, Shorts ou TikTok.
- O pedido junta várias etapas: cortar, legendar, abrir com gancho, exportar vertical.

Para só legendar um vídeo já editado, use direto o fluxo embedded-captions. Para aula sem câmera, use o fluxo faceless-explainer pela skill hyperframes.

## Antes de começar

Os passos 7 e 8 usam fluxos de trabalho do HyperFrames que não vêm pelo `npx skills add`. Confira com `npx hyperframes skills check` e, se faltarem, instale:

```bash
npx hyperframes skills update embedded-captions talking-head-recut
```

Se um fluxo não estiver disponível, siga a skill hyperframes, que cobre legendas e cartões sobre talking head pelas referências dela.

## Ordem fixa

Corte antes de legendar, e legende antes dos gráficos. Os fluxos embedded-captions e talking-head-recut entregam o vídeo exatamente como recebem: silêncio, erro ou enquadramento ruim na entrada continuam na saída. E cada corte muda os tempos, então a transcrição usada na legenda é sempre a do vídeo cortado.

## Passo a passo

### 1. Preparar o disco

Escolha com o usuário um disco com bastante espaço livre e crie ali a pasta de trabalho (por exemplo `D:\videos\<projeto>`). Transcrição, recortes intermediários, quadros de prévia e render ocupam várias vezes o tamanho do bruto. Grave tudo nessa pasta, incluindo temporários: no Windows, aponte a variável `TEMP` da sessão para uma subpasta dela antes de renderizar. Confira o espaço livre antes de cada render.

Concluído quando: a pasta existe no disco escolhido, o bruto foi copiado para ela e `npx hyperframes doctor` passou (Node 22+, FFmpeg, navegador de render).

### 2. Conferir o bruto

Rode `ffprobe` e anote duração, resolução, fps e trilha de áudio. Skill: ffmpeg.

Concluído quando: os quatro dados estão anotados em `metadata.md` na pasta.

### 3. Transcrever

```bash
npx hyperframes transcribe bruto.mp4 --model small --language pt
```

Skill: hyperframes-cli. Os modelos terminados em `.en` traduzem a fala para inglês; use sempre um modelo sem `.en`. Se o texto vier ruim, repita com um modelo maior sem `.en`.

Concluído quando: `transcript.json` existe, está em português e o último tempo bate com a duração do bruto.

### 4. Escolher gancho e o que sai

Leia a transcrição e defina:

- o gancho: a frase mais forte que cabe nos 3 primeiros segundos, com início e fim;
- os trechos a remover: silêncio, frase recomeçada, erro, repetição, desvio;
- o texto de tela do gancho, em até 6 palavras.

Skill: social, para gancho e legenda do post.

Concluído quando: `roteiro.md` lista o gancho, cada trecho removido com início e fim, e a ordem final dos trechos.

### 5. Cortar

Skill: ffmpeg (ou hyperframes, se o corte for montado como composição HyperFrames; ou moviepy, se um script Python for mais simples).

1. Encontre os silêncios com o filtro `silencedetect` e cruze com os tempos das palavras.
2. Monte a lista de trechos a manter, com o gancho na abertura e uma folga curta antes e depois de cada fala.
3. Gere o vídeo reencodificando. O corte por cópia de stream só acerta em quadro-chave e deixa quadro congelado na emenda.

A skill video-use também monta por lista de cortes, mas exige conta paga da ElevenLabs. Use só com aprovação explícita do usuário.

Concluído quando: `cortado.mp4` existe e `cortes.md` lista cada trecho mantido com início e fim no bruto.

### 6. Reenquadrar para 1080x1920

Skill: ffmpeg. Corte lateral centrado no rosto ou fundo desfocado, sem esticar a imagem. Rosto e boca na área central, longe da faixa inferior onde a rede mostra nome, legenda do post e botões.

Concluído quando: `ffprobe` mostra 1080x1920 e quadros do início, meio e fim mostram o rosto inteiro.

### 7. Legendar

Fluxo: embedded-captions (skill hyperframes, se o fluxo não estiver instalado).

1. Transcreva de novo o vídeo cortado, com o mesmo comando do passo 3.
2. Corrija nomes próprios, marcas, termos técnicos e números.
3. Apresente 2 ou 3 estilos do catálogo do fluxo embedded-captions e recomende um. Para fala, prefira o trilho limpo de legenda com destaque só na palavra de pico.
4. Gere quadros de prévia antes do render completo.

O fluxo embedded-captions espera uma única pessoa em cena. Com vários planos, divida o vídeo por plano antes.

Concluído quando: `legendado.mp4` existe e a prévia mostra legenda sincronizada dentro da área segura.

### 8. Gancho visual e gráficos (opcional)

Fluxo talking-head-recut para cartões e títulos sincronizados com a fala; hyperframes-registry para efeitos prontos. Coloque o texto de tela do gancho nos 3 primeiros segundos, fora do rosto e da legenda.

Concluído quando: `npx hyperframes check` passa e a prévia mostra o gancho no início.

### 9. Render e conferência

Renderize em 1080x1920 na pasta de trabalho. Skill: hyperframes-cli. Depois confira:

| Item | Como conferir |
|---|---|
| Duração | `ffprobe`; bate com a combinada, sem quadro preto no fim |
| Enquadramento | 1080x1920, sem barra preta, rosto na área central |
| Gancho | algo forte nos 3 primeiros segundos |
| Cortes secos | cada emenda do `cortes.md` sem sílaba cortada, quadro congelado ou estalo |
| Legenda | fiel, sincronizada, dentro da área segura |
| Áudio | voz clara, sem estouro; meça com `volumedetect` ou `ebur128` |

Concluído quando: todos os itens da tabela passaram. Informe ao usuário o caminho do arquivo final e qualquer item que não deu para conferir.

## Regras de qualidade

- O bruto fica intacto; tudo sai de cópias.
- Publicação, envio e qualquer gasto de crédito de API só com aprovação explícita do usuário.
- Legenda fiel à fala. Texto de tela usa só o que o criador disse ou forneceu.

## Exemplo de pedido

```text
Use a skill reels-do-bruto-ao-post no arquivo D:\gravacoes\dica-01.mp4.
Quero um Reels de até 45 segundos, legenda simples, gancho forte no começo.
Pasta de trabalho e render em D:\videos\dica-01.
```
