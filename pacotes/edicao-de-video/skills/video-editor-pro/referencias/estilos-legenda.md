# Escolha do estilo da legenda — etapa obrigatória

**Não renderize o vídeo final antes do usuário escolher ou confirmar o estilo.**
Esta etapa vem depois da transcrição e antes do corte/render.

## O fluxo

```bash
va caption_preview <video> --out-dir <projeto>/estilos [--transcript <t.json>]
```

Isso faz, sozinho:

1. **Escolhe um frame real** — varre 14 pontos entre 20% e 50% da duração,
   detecta rosto com OpenCV e pontua a iluminação (penaliza luma fora de ~135,
   que é sub ou superexposto). Fica com o melhor.
2. **Pega uma frase real** — usa a transcrição se já existir; senão transcreve
   ~14s em volta do frame. Nunca usa texto genérico.
3. **Renderiza os 8 previews** — e aqui está o ponto: o preview é gerado
   **queimando o mesmo ASS pelo mesmo libass** que o render final usa, sobre o
   frame real. O card não é uma aproximação desenhada à parte; é o motor de
   produção rodando num frame só. O que o usuário escolhe é o que ele recebe.
4. **Monta `ESCOLHA_O_ESTILO.png`** — cards lado a lado com preview, número,
   nome e descrição.

Mostre o arquivo de cards ao usuário e **espere a escolha**.

## Os 8 estilos

| # | Nome | Caráter |
|---|---|---|
| 01 | REELS IMPACTO | pesada, palavra ativa em **vermelho**, contorno forte |
| 02 | REELS AMARELO | padrão TikTok/Reels, palavra ativa **amarela** |
| 03 | BOX | palavra ativa dentro de **caixa colorida** |
| 04 | POP | 1–3 palavras, a falada **cresce** e ganha cor |
| 05 | KARAOKÊ | **preenchimento progressivo** acompanhando a fala |
| 06 | CLEAN | branca, contorno discreto, movimento suave |
| 07 | MINIMAL | elegante, quase sem movimento |
| 08 | JURÍDICO PREMIUM | termos jurídicos em vermelho, animação discreta |

Presets em `~/.video-agent/presets/legendas/*.json`.

## Aplicar o estilo escolhido

```bash
va caption_styles <transcript.json> \
   --preset $VA_HOME/presets/legendas/08-juridico-premium.json \
   --out <projeto>/captions/legenda.ass --inicio 2.24
```

## Personalizar

Qualquer campo do preset vira `--sobrepor chave=valor`, sem editar o arquivo:

```bash
--sobrepor tamanho=74 --sobrepor y_pct=72 --sobrepor cor_destaque=E02020 \
--sobrepor max_palavras=3 --sobrepor maiusculas=false --sobrepor animacao=suave
```

Campos: `fonte, tamanho, y_pct, max_palavras, cor, cor_destaque, contorno_px,
sombra_px, caixa, caixa_cor, caixa_espessura, animacao, intensidade,
maiusculas, espacamento, alinhamento, margem_lateral_pct, destaque_chave,
pop_ms`. Cores em **RGB** (o ASS usa BGR; a conversão é interna).

`animacao`: `escala` · `suave` · `karaoke` · `nenhuma`.

## Salvar como padrão

```bash
va caption_styles ... --salvar-padrao
```

Grava `presets/legendas/_meu_padrao.json`. **Nos próximos vídeos, ofereça esse
padrão primeiro** e só mostre os 8 cards se o usuário pedir outro.

## Sincronia

Sempre **timestamp por palavra**, nunca por frase. Para isso a transcrição
precisa de `--no-vad`: com o VAD ligado o faster-whisper devolve tempos numa
linha comprimida (33,1s de áudio voltavam como 25,9s) e a legenda sai à frente
da fala.

A palavra em locução recebe o destaque no instante em que é pronunciada: cada
bloco gera um diálogo por palavra ativa, não um diálogo por bloco. A exceção é
o KARAOKÊ, que usa o `\kf` nativo do ASS.

## Marca d'água

```bash
va watermark --out marca.png --arroba "@usuario" --pos sup-esq \
   --tamanho 34 --opacidade 0.78 [--fundo 115] [--icone icone.png]
```

Posições: `sup-esq`, `sup-dir`, `inf-esq`, `inf-dir`. A ferramenta imprime a
caixa resultante e confirma se ficou fora dos controles do Reels.

**Não existe posição inferior central** — é onde ficam legenda do post,
@usuário e áudio.

**Sobre o ícone do Instagram:** o glifo da câmera é marca registrada da Meta e
tem regras próprias de uso. Sem um asset licenciado no projeto, a marca sai
como texto. Se o usuário fornecer o PNG, passe `--icone`.

## Validação obrigatória antes de entregar

```bash
va face_track <video> --out rostos.json --fps 3
va face_track <video> --check rostos.json \
   --caixa "x,y,w,h" --nome legenda --caixa "x,y,w,h" --nome marca
```

Nenhum elemento pode sobrepor a envoltória do rosto. Some a isso o
`va qc` e a extração de frames (início, meio, fim e um de cada tipo de
legenda).

## Safe area em 9:16 (1080×1920)

| Região | Limite |
|---|---|
| lateral | ≥ 6% (≥ 65px) — os presets usam 6,3% |
| topo | nada acima de 8% (154px) |
| rodapé | nada abaixo de 85% (1632px) |
| legenda | 68%–78% da altura é a faixa que funciona |

A faixa de legenda pode precisar de ajuste por vídeo: se as mãos da pessoa
gesticulam nessa altura, meça com `face_track` e decida com o número na mão,
não no olho.
