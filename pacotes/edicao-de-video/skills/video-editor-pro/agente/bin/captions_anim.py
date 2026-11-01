"""Legenda animada estilo creator (ASS) a partir de transcricao palavra a palavra.

Por que ASS e nao Remotion/pycaps: o destaque por palavra, o pop de entrada e o
contorno sao todos nativos do formato (\\t, \\fscx/\\fscy, \\bord/\\shad) e o
libass renderiza isso dentro do proprio ffmpeg, numa passagem. Remotion exigiria
projeto React + render por Chromium headless - mais lento nesta maquina e, para
trabalho pago, com a ressalva de licenca comercial do proprio repositorio.

Como o destaque por palavra e feito: para cada grupo de 3-4 palavras sao
emitidos N dialogos, um por palavra ativa, todos mostrando o grupo inteiro e
mudando so a cor da palavra corrente. E o jeito de ter cor por palavra em ASS
sem depender de karaoke (\\k), que muda cor mas nao aceita escala por palavra.

Uso:
    python captions_anim.py <transcript.json> --out <captions.ass>
        [--y-pct 73] [--size 76] [--por-tela 4] [--inicio 3.0]
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

W, H = 1080, 1920

BRANCO = "&H00FFFFFF"
DOURADO = "&H0045C8E8"      # BGR: dourado quente, mesma familia do video anterior
CONTORNO = "&H00000000"

# Termos que ganham enfase extra (escala maior + dourado garantido).
CHAVE = {"requisitos", "preso", "presos", "direito", "direitos", "visita",
         "saidinha", "semiaberto", "temporaria", "temporarias", "judiciario",
         "automatico", "beneficio", "pena", "regime", "familiar"}


def sem_acento(s: str) -> str:
    tab = str.maketrans("áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ",
                        "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC")
    return s.translate(tab)


def limpo(w: str) -> str:
    return re.sub(r"[^\wÀ-ÿ]", "", w).lower()


def ts(t: float) -> str:
    t = max(0.0, t)
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return "%d:%02d:%05.2f" % (h, m, s)


def grupos(words: list[dict], por_tela: int, gap_quebra: float):
    """Agrupa palavras em telas de ate `por_tela`, quebrando em pontuacao
    final e em pausa longa - uma tela nunca comeca no meio de uma frase."""
    out, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        fim_frase = (w["text"] or "").rstrip()[-1:] in ".?!"
        gap = (nxt["start"] - w["end"]) if nxt else 0.0
        if not nxt or len(cur) >= por_tela or fim_frase or gap >= gap_quebra:
            out.append(cur)
            cur = []
    return out


CAB = """[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Fala,{fonte},{size},{branco},{branco},{contorno},&H64000000,0,0,0,0,100,100,0,0,1,{bord},{shad},2,{ml},{mr},{mv},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("transcript", type=Path)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--y-pct", type=float, default=73.0,
                    help="altura do centro da legenda, em %% de 1920")
    ap.add_argument("--size", type=int, default=76)
    ap.add_argument("--por-tela", type=int, default=4)
    ap.add_argument("--gap", type=float, default=0.45)
    ap.add_argument("--inicio", type=float, default=0.0,
                    help="so emite legenda a partir deste tempo (gancho antes)")
    ap.add_argument("--fonte", default="Montserrat ExtraBold")
    ap.add_argument("--pop-ms", type=int, default=100)
    a = ap.parse_args()

    d = json.loads(a.transcript.read_text(encoding="utf-8"))
    words = [w for w in d["words"]
             if w.get("type") == "word" and (w.get("text") or "").strip()]
    if not words:
        raise SystemExit("transcricao sem palavras")

    gs = grupos(words, a.por_tela, a.gap)

    # margens: 6% lateral de zona segura; MarginV e medido do RODAPE
    ml = mr = int(W * 0.063)   # 68px: 6.0% exato daria 64.8 e arredondava para baixo
    mv = int(H - (a.y_pct / 100.0) * H)

    linhas = [CAB.format(W=W, H=H, fonte=a.fonte, size=a.size, branco=BRANCO,
                         contorno=CONTORNO, bord=5, shad=2,
                         ml=ml, mr=mr, mv=mv)]

    pop = a.pop_ms
    for g in gs:
        g0, g1 = g[0]["start"], g[-1]["end"]
        if g1 <= a.inicio:
            continue
        for j, w in enumerate(g):
            ini = max(w["start"], a.inicio) if j == 0 else w["start"]
            fim = w["end"] if j < len(g) - 1 else g1 + 0.06
            if fim <= ini:
                continue
            partes = []
            for k, x in enumerate(g):
                txt = (x["text"] or "").strip().upper().replace("{", "(").replace("}", ")")
                chave = limpo(sem_acento(x["text"])) in CHAVE
                if k == j:
                    # palavra corrente: dourado + pop curto de escala
                    esc = 112 if chave else 108
                    partes.append("{\\c%s\\fscx%d\\fscy%d\\t(0,%d,\\fscx100\\fscy100)}%s{\\c%s\\fscx100\\fscy100}"
                                  % (DOURADO, esc, esc, pop, txt, BRANCO))
                elif chave:
                    partes.append("{\\c%s}%s{\\c%s}" % (DOURADO, txt, BRANCO))
                else:
                    partes.append(txt)
            texto = " ".join(partes)
            fx = "{\\fad(40,0)}" if j == 0 else ""
            linhas.append("Dialogue: 0,%s,%s,Fala,,0,0,0,,%s%s"
                          % (ts(ini), ts(fim), fx, texto))

    a.out.write_text("\n".join(linhas) + "\n", encoding="utf-8")
    n_dlg = sum(1 for l in linhas if l.startswith("Dialogue"))
    print("fonte       %s %dpx" % (a.fonte, a.size))
    print("posicao     centro em %.0f%% da altura (MarginV=%d do rodape)"
          % (a.y_pct, mv))
    print("margens     %dpx lateral (%.0f%% de seguranca)" % (ml, ml / W * 100))
    print("telas       %d grupos, ate %d palavras cada" % (len(gs), a.por_tela))
    print("dialogos    %d (um por palavra ativa)" % n_dlg)
    print("salvo       %s" % a.out)


if __name__ == "__main__":
    main()
