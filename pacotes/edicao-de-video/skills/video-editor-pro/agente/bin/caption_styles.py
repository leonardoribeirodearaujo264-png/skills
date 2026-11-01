"""Gera o ASS da legenda a partir de um preset de estilo.

Um unico motor serve o preview e o render final. E de proposito: se o preview
fosse desenhado por outro codigo (PIL, por exemplo), o card mostraria uma coisa
e o video entregaria outra. Aqui o preview e o video passam pelo MESMO ASS e
pelo MESMO libass, entao o que o usuario escolhe e o que ele recebe.

Animacoes suportadas:
  escala    palavra ativa cresce e volta em pop_ms (um dialogo por palavra)
  pop       sinonimo de escala
  suave     igual, com intensidade baixa
  bounce    passa do tamanho e volta, em duas etapas de \\t
  fade      bloco entra em fade, sem escala na palavra
  highlight so cor na palavra ativa, sem movimento
  nenhuma   so troca de cor
  karaoke   preenchimento progressivo nativo do ASS (\\kf), um dialogo por bloco

Caixa: `caixa` desenha atras da PALAVRA ativa (contorno grosso na cor da
caixa, porque o ASS nao tem fundo por palavra). `caixa_bloco` desenha uma
faixa atras do BLOCO inteiro, via BorderStyle 3 do proprio ASS.

Cores nos presets sao RGB (como no CSS). O ASS usa BGR, a conversao e aqui.

Uso:
    python caption_styles.py <transcript.json> --preset <preset.json>
        --out <saida.ass> [--inicio 0] [--sobrepor chave=valor ...]
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

W, H = 1080, 1920

# Termos que ganham destaque extra quando destaque_chave esta ligado.
CHAVE = {"requisitos", "preso", "presos", "direito", "direitos", "visita",
         "saidinha", "semiaberto", "temporaria", "judiciario", "automatico",
         "beneficio", "pena", "regime", "familiar", "lei", "artigo", "prazo",
         "audiencia", "juiz", "juiza", "advogado", "advogada", "processo"}


def rgb_ass(hexrgb: str, alpha: int = 0) -> str:
    """RGB do preset -> &HAABBGGRR do ASS."""
    h = hexrgb.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return "&H%02X%02X%02X%02X" % (alpha, b, g, r)


def sem_acento(s: str) -> str:
    return s.translate(str.maketrans(
        "áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ",
        "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC"))


def eh_chave(w: str) -> bool:
    return re.sub(r"[^\w]", "", sem_acento(w)).lower() in CHAVE


def ts(t: float) -> str:
    t = max(0.0, t)
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return "%d:%02d:%05.2f" % (h, m, s)


def blocos(words: list[dict], maxp: int, gap: float = 0.45):
    out, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        fim = (w["text"] or "").rstrip()[-1:] in ".?!"
        pausa = (nxt["start"] - w["end"]) if nxt else 0.0
        if not nxt or len(cur) >= maxp or fim or pausa >= gap:
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
Style: L,{fonte},{tam},{cor},{cor2},{contorno},{fundo},0,0,0,0,100,100,{esp},0,{bstyle},{bord},{shad},{align},{ml},{mr},{mv},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def gerar(p: dict, words: list[dict], inicio: float) -> str:
    cor = rgb_ass(p["cor"])
    dest = rgb_ass(p["cor_destaque"])
    contorno = borda_normal = rgb_ass("000000")
    fundo = rgb_ass("000000", 160)
    base = int(W * p["margem_lateral_pct"] / 100.0)
    # desloc_x_pct move o bloco na horizontal sem tirar o alinhamento central:
    # o ASS centraliza entre MarginL e MarginR, entao desbalancear as duas
    # desloca o texto. E o que permite arrastar a legenda de lado na interface.
    dx = int(W * float(p.get("desloc_x_pct", 0)) / 100.0)
    ml, mr = max(0, base + dx), max(0, base - dx)
    mv = int(H - (p["y_pct"] / 100.0) * H)

    # No karaoke a SecondaryColour e a cor "ainda nao falada": o \kf pinta da
    # secundaria para a primaria conforme a fala avanca.
    cor2 = cor if p["animacao"] != "karaoke" else cor
    prim = cor if p["animacao"] != "karaoke" else dest

    # BorderStyle 3 = o proprio libass pinta uma caixa opaca atras da linha.
    # E o unico jeito de ter faixa atras do BLOCO; o contorno vira padding.
    if p.get("caixa_bloco"):
        bstyle = 3
        contorno = rgb_ass(p.get("caixa_cor", "000000"),
                           int(p.get("caixa_alpha", 40)))
        bord = max(6, p["contorno_px"])
    else:
        bstyle = 1
        bord = p["contorno_px"]

    L = [CAB.format(W=W, H=H, fonte=p["fonte"], tam=p["tamanho"],
                    cor=prim, cor2=cor2, contorno=contorno, fundo=fundo,
                    esp=p.get("espacamento", 0), bstyle=bstyle, bord=bord,
                    shad=p["sombra_px"], align=p.get("alinhamento", 2),
                    ml=ml, mr=mr, mv=mv)]

    bs = blocos(words, p["max_palavras"])
    for g in bs:
        g0, g1 = g[0]["start"], g[-1]["end"]
        if g1 <= inicio:
            continue

        if p["animacao"] == "fade":
            # um dialogo por bloco: nada se move e nenhuma palavra muda de cor,
            # entao nao ha motivo para gerar um dialogo por palavra.
            txt = " ".join(
                ((x["text"] or "").strip().upper() if p["maiusculas"]
                 else (x["text"] or "").strip()).replace("{", "(").replace("}", ")")
                for x in g)
            L.append("Dialogue: 0,%s,%s,L,,0,0,0,,{\\fad(%d,%d)}%s"
                     % (ts(max(g0, inicio)), ts(g1 + 0.08),
                        p.get("pop_ms", 120), p.get("pop_ms", 120), txt))
            continue

        if p["animacao"] == "maquina":
            # Maquina de escrever: um dialogo por caractere revelado, no ritmo
            # da fala. O cursor e um "_" que pisca em 2 Hz -- dois dialogos
            # alternados, porque o ASS nao tem animacao de alpha ciclica.
            txt = " ".join((x["text"] or "").strip() for x in g)
            if p["maiusculas"]:
                txt = txt.upper()
            txt = txt.replace("{", "(").replace("}", ")")
            n = len(txt)
            dur = max(0.12, g1 - g0)
            for i in range(1, n + 1):
                a = g0 + dur * (i - 1) / n
                b = g0 + dur * i / n if i < n else g1 + 0.3
                if b <= max(a, inicio):
                    continue
                cursor = "_" if (int((a - g0) * 2) % 2 == 0) else "\\h"
                L.append("Dialogue: 0,%s,%s,L,,0,0,0,,%s%s"
                         % (ts(max(a, inicio)), ts(b), txt[:i], cursor))
            continue

        if p["animacao"] == "escada":
            # Escada: cada palavra numa linha propria, com recuo crescente.
            # O ASS centraliza a linha inteira e nao da para posicionar palavra
            # a palavra sem calcular a largura do texto, que o Python aqui nao
            # tem. Quebrar em linhas com \h de recuo produz o mesmo degrau.
            for j, w in enumerate(g):
                ini = max(w["start"], inicio) if j == 0 else w["start"]
                fim = w["end"] if j < len(g) - 1 else g1 + 0.06
                if fim <= ini:
                    continue
                linhas = []
                for k, x in enumerate(g):
                    t = (x["text"] or "").strip()
                    if p["maiusculas"]:
                        t = t.upper()
                    t = t.replace("{", "(").replace("}", ")")
                    recuo = "\\h" * (k * 2)
                    c = dest if (k == j or k % 2 == 1) else prim
                    if k == j:
                        ms = p.get("pop_ms", 150)
                        linhas.append("{\\c%s\\fscx%d\\fscy%d"
                                      "\\t(0,%d,\\fscx100\\fscy100)}%s%s{\\c%s}"
                                      % (c, p["intensidade"], p["intensidade"],
                                         ms, recuo, t, prim))
                    else:
                        linhas.append("{\\c%s}%s%s{\\c%s}" % (c, recuo, t, prim))
                L.append("Dialogue: 0,%s,%s,L,,0,0,0,,%s"
                         % (ts(ini), ts(fim), "\\N".join(linhas)))
            continue

        if p["animacao"] == "karaoke":
            # um dialogo por bloco; o \kf carrega o tempo de cada palavra
            partes = []
            for x in g:
                cs = max(1, int(round((x["end"] - x["start"]) * 100)))
                t = (x["text"] or "").strip()
                if p["maiusculas"]:
                    t = t.upper()
                partes.append("{\\kf%d}%s" % (cs, t.replace("{", "(").replace("}", ")")))
            L.append("Dialogue: 0,%s,%s,L,,0,0,0,,%s"
                     % (ts(max(g0, inicio)), ts(g1 + 0.05), " ".join(partes)))
            continue

        for j, w in enumerate(g):
            ini = max(w["start"], inicio) if j == 0 else w["start"]
            fim = w["end"] if j < len(g) - 1 else g1 + 0.06
            if fim <= ini:
                continue
            partes = []
            for k, x in enumerate(g):
                t = (x["text"] or "").strip()
                if p["maiusculas"]:
                    t = t.upper()
                t = t.replace("{", "(").replace("}", ")")
                chave = p.get("destaque_chave") and eh_chave(x["text"])
                # Rotacao "aleatoria" por palavra: derivada do indice, nunca
                # de random(). Cada palavra ativa reemite o bloco inteiro, e um
                # angulo sorteado de novo a cada dialogo faria o texto tremer.
                giro = ""
                if p.get("giro_graus"):
                    g_ = float(p["giro_graus"])
                    giro = "\\frz%.1f" % (((k * 2654435761) % 2001 / 1000.0 - 1) * g_)
                if k == j:
                    esc = p["intensidade"] + (4 if chave else 0)
                    tags = "\\c%s%s" % (dest, giro)
                    if p.get("destaque_fonte"):
                        tags += "\\fn%s" % p["destaque_fonte"]
                    if p.get("destaque_italico"):
                        tags += "\\i1"
                    if p.get("destaque_tamanho_pct", 100) != 100:
                        tags += "\\fs%d" % int(
                            p["tamanho"] * p["destaque_tamanho_pct"] / 100.0)
                    if p.get("caixa"):
                        # ASS nao desenha caixa por palavra: um contorno grosso
                        # na cor da caixa produz o mesmo efeito visual
                        tags += "\\3c%s\\bord%d" % (
                            rgb_ass(p["caixa_cor"]), max(10, p["contorno_px"] * 2))
                    ms = p.get("pop_ms", 100)
                    if p["animacao"] in ("escala", "suave", "pop"):
                        tags += "\\fscx%d\\fscy%d\\t(0,%d,\\fscx100\\fscy100)" % (
                            esc, esc, ms)
                    elif p["animacao"] in ("bounce", "giro"):
                        # cresce passando do alvo e assenta: duas transicoes
                        # encadeadas, ao contrario do pop que so encolhe.
                        meio = max(1, ms // 2)
                        tags += ("\\fscx100\\fscy100"
                                 "\\t(0,%d,\\fscx%d\\fscy%d)"
                                 "\\t(%d,%d,\\fscx100\\fscy100)"
                                 % (meio, esc, esc, meio, ms))
                    elif p["animacao"] == "mola":
                        # entra menor, passa do alvo e assenta (0.8 -> 1.05 -> 1)
                        meio = max(1, int(ms * 0.55))
                        tags += ("\\fscx80\\fscy80"
                                 "\\t(0,%d,\\fscx%d\\fscy%d)"
                                 "\\t(%d,%d,\\fscx100\\fscy100)"
                                 % (meio, esc, esc, meio, ms))
                    elif p["animacao"] == "gigante":
                        tags += ("\\fscx130\\fscy130"
                                 "\\t(0,%d,\\fscx100\\fscy100)" % ms)
                    elif p["animacao"] == "blur":
                        tags += "\\blur6\\t(0,%d,\\blur%d)" % (ms, p["sombra_px"] or 0)
                    elif p["animacao"] == "subir":
                        # fade-up: o \move sobe 8px (em 1080) enquanto entra
                        tags += "\\t(0,%d,\\fscx100\\fscy100)" % ms
                    elif p["animacao"] == "glow":
                        # neon: o contorno vira a propria cor, borrado e
                        # pulsando. Nao e o glow em camadas do CSS, mas e o
                        # que o libass alcanca sem outro renderizador.
                        tags += ("\\3c%s\\bord%d\\blur%d"
                                 "\\t(0,%d,\\blur%d)"
                                 % (dest, max(3, p["contorno_px"]),
                                    max(4, p["contorno_px"]), ms,
                                    max(2, p["contorno_px"] - 2)))
                    fecha = "\\c%s\\fscx100\\fscy100\\blur0" % prim
                    if p.get("destaque_fonte"):
                        fecha += "\\fn%s" % p["fonte"]
                    if p.get("destaque_italico"):
                        fecha += "\\i0"
                    if p.get("destaque_tamanho_pct", 100) != 100:
                        fecha += "\\fs%d" % p["tamanho"]
                    if p.get("caixa") or p["animacao"] == "glow":
                        fecha += "\\3c%s\\bord%d" % (borda_normal, p["contorno_px"])
                    partes.append("{%s}%s{%s}" % (tags, t, fecha))
                elif chave:
                    partes.append("{\\c%s%s}%s{\\c%s}" % (dest, giro, t, prim))
                elif p["animacao"] == "alternada" and k % 2 == 1:
                    # linhas/palavras alternando entre a cor base e a de
                    # destaque, independente de qual esta sendo falada
                    partes.append("{\\c%s%s}%s{\\c%s}" % (dest, giro, t, prim))
                elif giro:
                    partes.append("{%s}%s{\\frz0}" % (giro, t))
                else:
                    partes.append(t)
            # Entrada do bloco. No `subir` o texto sobe 8px enquanto aparece:
            # com alinhamento 2 a ancora do \move e o centro-base da linha,
            # que fica em (W/2, H - MarginV) -- os mesmos numeros que a margem
            # do estilo ja definiu, para a legenda nao sair do lugar.
            ms0 = p.get("pop_ms", 120)
            if j != 0:
                fx = ""
            elif p["animacao"] == "subir":
                ay = H - mv
                fx = ("{\\fad(%d,0)\\move(%d,%d,%d,%d,0,%d)}"
                      % (ms0, W // 2, ay + 8, W // 2, ay, ms0))
            elif p["animacao"] == "lento":
                fx = "{\\fad(%d,%d)}" % (max(200, ms0), max(200, ms0))
            else:
                fx = "{\\fad(40,0)}"
            L.append("Dialogue: 0,%s,%s,L,,0,0,0,,%s%s"
                     % (ts(ini), ts(fim), fx, " ".join(partes)))
    return "\n".join(L) + "\n"


def carregar(preset: Path, sobrepor: list[str]) -> dict:
    p = json.loads(preset.read_text(encoding="utf-8"))
    # campos que nem todo preset declara, mas que a interface pode ajustar
    OPCIONAIS = {"desloc_x_pct": 0.0, "caixa_bloco": False, "caixa_alpha": 40}
    for kv in sobrepor:
        k, _, v = kv.partition("=")
        if k not in p:
            if k not in OPCIONAIS:
                raise SystemExit("parametro desconhecido: %s" % k)
            p[k] = OPCIONAIS[k]
        atual = p[k]
        if isinstance(atual, bool):
            p[k] = v.lower() in ("1", "true", "sim")
        elif isinstance(atual, int):
            p[k] = int(float(v))
        elif isinstance(atual, float):
            p[k] = float(v)
        else:
            p[k] = v
    return p


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("transcript", type=Path)
    ap.add_argument("--preset", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--inicio", type=float, default=0.0)
    ap.add_argument("--sobrepor", action="append", default=[],
                    help="chave=valor para ajustar o preset nesta geracao")
    ap.add_argument("--salvar-padrao", action="store_true",
                    help="grava este estilo (com os ajustes) como padrao dos "
                         "proximos videos")
    a = ap.parse_args()

    p = carregar(a.preset, a.sobrepor)
    if a.salvar_padrao:
        pad = a.preset.parent / "_meu_padrao.json"
        pad.write_text(json.dumps({**p, "derivado_de": p["id"]}, indent=2,
                                  ensure_ascii=False), encoding="utf-8")
        print("padrao salvo: %s" % pad)
    d = json.loads(a.transcript.read_text(encoding="utf-8"))
    words = [w for w in d["words"]
             if w.get("type") == "word" and (w.get("text") or "").strip()]
    a.out.write_text(gerar(p, words, a.inicio), encoding="utf-8")
    n = sum(1 for l in a.out.read_text(encoding="utf-8").splitlines()
            if l.startswith("Dialogue"))
    print("%s | %s %dpx | y %.0f%% | %d palavras/tela | %d dialogos -> %s"
          % (p["nome"], p["fonte"], p["tamanho"], p["y_pct"],
             p["max_palavras"], n, a.out))


if __name__ == "__main__":
    main()
