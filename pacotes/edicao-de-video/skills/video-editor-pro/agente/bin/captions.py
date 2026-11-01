"""Build professional captions from a word-level transcript.

Reads the Scribe-shaped transcript JSON (from transcribe_local.py or
ElevenLabs) and writes:
  - master.srt  : plain SRT, for players and for uploading as a sidecar
  - captions.ass: styled ASS with per-word highlight, for burning in

Why ASS and not just SRT+force_style: SRT can only carry one style for the
whole file. Highlighting a number or a key term inside a line requires inline
override tags, which only ASS has.

MarginV is a platform safe-zone rule, not taste. The Reels/Shorts/TikTok UI
covers roughly the bottom 25-30% of a 1080x1920 frame. libass scales margins
against PlayResY, so the values below are resolution-independent.

Usage:
    python captions.py <transcript.json> --out-dir <dir> [--style reels]
                       [--words-per-line 3] [--highlight-numbers]
                       [--highlight "LGPD,prazo,recurso"] [--offset 0.0]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------- styles ----
# PlayResY is fixed at 1080 so MarginV/FontSize read as "at 1080p" regardless
# of the real frame size; libass rescales linearly.
STYLES = {
    "reels": {
        "font": "Montserrat SemiBold", "size": 78, "bold": -1,
        "primary": "&H00FFFFFF", "outline_col": "&H00000000",
        "back": "&H90000000", "border_style": 1, "outline": 4, "shadow": 1,
        "align": 2, "margin_v": 420, "margin_lr": 90,
        "highlight": "&H0000E5FF",       # amber, BGR order
        "words_per_line": 3, "uppercase": True,
        "note": "9:16. MarginV=420/1080 mantem a legenda acima da UI da plataforma.",
    },
    "youtube": {
        "font": "Inter SemiBold", "size": 52, "bold": -1,
        "primary": "&H00FFFFFF", "outline_col": "&H00000000",
        "back": "&H80000000", "border_style": 1, "outline": 3, "shadow": 0,
        "align": 2, "margin_v": 90, "margin_lr": 160,
        "highlight": "&H00F5C542",
        "words_per_line": 7, "uppercase": False,
        "note": "16:9. Linhas mais longas, caixa normal, leitura confortavel.",
    },
    "juridico": {
        "font": "Inter Medium", "size": 58, "bold": 0,
        "primary": "&H00F5F5F5", "outline_col": "&H00000000",
        "back": "&HA0141414", "border_style": 4, "outline": 0, "shadow": 0,
        "align": 2, "margin_v": 380, "margin_lr": 110,
        "highlight": "&H0086C5D4",       # dourado sobrio (BGR)
        "words_per_line": 4, "uppercase": False,
        "note": "Caixa solida discreta, sem caixa alta. Sobriedade institucional.",
    },
    "anuncio": {
        "font": "Montserrat ExtraBold", "size": 84, "bold": -1,
        "primary": "&H00FFFFFF", "outline_col": "&H00000000",
        "back": "&H00000000", "border_style": 1, "outline": 5, "shadow": 2,
        "align": 2, "margin_v": 440, "margin_lr": 80,
        "highlight": "&H002B2BFF",       # vermelho forte (BGR)
        "words_per_line": 2, "uppercase": True,
        "note": "Maxima retencao: 2 palavras, peso alto, contraste maximo.",
    },
    "podcast": {
        "font": "Inter SemiBold", "size": 60, "bold": -1,
        "primary": "&H00FFFFFF", "outline_col": "&H00000000",
        "back": "&H90000000", "border_style": 1, "outline": 3, "shadow": 1,
        "align": 2, "margin_v": 360, "margin_lr": 100,
        "highlight": "&H0055D6FF",
        "words_per_line": 4, "uppercase": False,
        "note": "Fala natural, quebra em pausas, identificacao de locutor opcional.",
    },
    "institucional": {
        "font": "Inter Regular", "size": 54, "bold": 0,
        "primary": "&H00FFFFFF", "outline_col": "&H00000000",
        "back": "&H00000000", "border_style": 1, "outline": 2, "shadow": 0,
        "align": 2, "margin_v": 130, "margin_lr": 180,
        "highlight": "&H00D9A441",
        "words_per_line": 6, "uppercase": False,
        "note": "Discreto. A legenda apoia, nao compete com a marca.",
    },
}

# Filler words dropped from captions only (never from the audio) so the line
# reads clean while the delivery stays natural.
FILLERS_PT = {"eh", "ah", "ahn", "hum", "hmm", "ne", "tipo", "assim", "entao"}

NUMBERISH = re.compile(
    r"^(?:R\$|US\$|\$)?[\d]+(?:[.,]\d+)*%?$|^\d+\bº?$|^art\.?$|^§$", re.I)


# ------------------------------------------------------------- transcript ----
def load_words(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    return [w for w in data.get("words", [])
            if w.get("type") == "word" and (w.get("text") or "").strip()]


def chunk(words: list[dict], per_line: int, max_gap: float,
          max_dur: float) -> list[list[dict]]:
    """Group words into caption lines.

    Breaks on: the word budget, a silence longer than max_gap, sentence-final
    punctuation, or a line that would sit on screen longer than max_dur.
    Punctuation wins over the word budget so a line never ends mid-sentence
    when a natural boundary is one word away.
    """
    lines: list[list[dict]] = []
    cur: list[dict] = []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        ends_sentence = (w.get("text") or "").rstrip()[-1:] in ".?!:"
        gap = (nxt["start"] - w["end"]) if nxt else 0.0
        span = w["end"] - cur[0]["start"]
        if (not nxt or len(cur) >= per_line or ends_sentence
                or gap >= max_gap or span >= max_dur):
            lines.append(cur)
            cur = []
    if cur:
        lines.append(cur)
    return lines


def should_highlight(word: str, terms: set[str], numbers: bool) -> bool:
    clean = word.strip(".,;:!?()[]\"'").lower()
    if not clean:
        return False
    if terms and clean in terms:
        return True
    return bool(numbers and NUMBERISH.match(word.strip(".,;:!?()")))


# ------------------------------------------------------------------ SRT ------
def ts_srt(t: float) -> str:
    t = max(0.0, t)
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return "%02d:%02d:%02d,%03d" % (h, m, int(s), round((s - int(s)) * 1000))


def write_srt(lines: list[list[dict]], out: Path, offset: float,
              uppercase: bool, drop_fillers: bool) -> int:
    blocks, n = [], 0
    for ln in lines:
        text = render_text(ln, uppercase, drop_fillers)
        if not text:
            continue
        n += 1
        blocks.append("%d\n%s --> %s\n%s\n"
                      % (n, ts_srt(ln[0]["start"] + offset),
                         ts_srt(ln[-1]["end"] + offset), text))
    out.write_text("\n".join(blocks), encoding="utf-8")
    return n


def render_text(ln: list[dict], uppercase: bool, drop_fillers: bool) -> str:
    parts = []
    for w in ln:
        t = (w.get("text") or "").strip()
        if drop_fillers and t.strip(".,;:!?").lower() in FILLERS_PT and len(ln) > 1:
            continue
        parts.append(t)
    text = " ".join(parts)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    return text.upper() if uppercase else text


# ------------------------------------------------------------------ ASS ------
def ts_ass(t: float) -> str:
    t = max(0.0, t)
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return "%d:%02d:%05.2f" % (h, m, s)


ASS_HEADER = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Main,{font},{size},{primary},{primary},{outline_col},{back},{bold},0,0,0,100,100,0,0,{border_style},{outline},{shadow},{align},{margin_lr},{margin_lr},{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def write_ass(lines: list[list[dict]], out: Path, st: dict, offset: float,
              terms: set[str], numbers: bool, drop_fillers: bool,
              pop: bool) -> int:
    body, n = [], 0
    for ln in lines:
        toks = []
        for w in ln:
            raw = (w.get("text") or "").strip()
            if not raw:
                continue
            if drop_fillers and raw.strip(".,;:!?").lower() in FILLERS_PT and len(ln) > 1:
                continue
            txt = raw.upper() if st["uppercase"] else raw
            txt = txt.replace("{", "(").replace("}", ")")  # ASS override chars
            if should_highlight(raw, terms, numbers):
                toks.append("{\\c%s\\b1}%s{\\c%s\\b%d}"
                            % (st["highlight"], txt, st["primary"],
                               1 if st["bold"] else 0))
            else:
                toks.append(txt)
        if not toks:
            continue
        text = " ".join(toks)
        text = re.sub(r"\s+([,.;:!?])", r"\1", text)
        # Small scale-up on entry. 120ms is under the flicker threshold and
        # reads as a beat rather than an effect.
        fx = "{\\fad(60,60)}" if not pop else "{\\fad(50,50)\\t(0,120,\\fscx104\\fscy104)\\t(120,200,\\fscx100\\fscy100)}"
        n += 1
        body.append("Dialogue: 0,%s,%s,Main,,0,0,0,,%s%s"
                    % (ts_ass(ln[0]["start"] + offset),
                       ts_ass(ln[-1]["end"] + offset), fx, text))
    out.write_text(ASS_HEADER.format(**st) + "\n".join(body) + "\n",
                   encoding="utf-8")
    return n


# ----------------------------------------------------------------- main ------
def main() -> None:
    ap = argparse.ArgumentParser(description="Professional captions from a transcript")
    ap.add_argument("transcript", type=Path)
    ap.add_argument("--out-dir", type=Path, required=True)
    ap.add_argument("--style", default="reels", choices=sorted(STYLES))
    ap.add_argument("--words-per-line", type=int, default=None)
    ap.add_argument("--margin-v", type=int, default=None,
                    help="altura da legenda em unidades de PlayResY=1080; sobrepoe a do estilo")
    ap.add_argument("--font-size", type=int, default=None)
    ap.add_argument("--max-gap", type=float, default=0.45,
                    help="quebra a linha em silencio >= N s (default 0.45)")
    ap.add_argument("--max-duration", type=float, default=3.2,
                    help="tempo maximo de uma linha na tela (default 3.2s)")
    ap.add_argument("--offset", type=float, default=0.0,
                    help="deslocamento global em segundos (timeline de saida)")
    ap.add_argument("--highlight", default="",
                    help="termos a destacar, separados por virgula")
    ap.add_argument("--highlight-numbers", action="store_true",
                    help="destacar numeros, valores, percentuais e artigos")
    ap.add_argument("--keep-fillers", action="store_true",
                    help="manter 'eh', 'tipo', 'ne' no texto da legenda")
    ap.add_argument("--no-pop", action="store_true", help="sem animacao de entrada")
    a = ap.parse_args()

    tpath = a.transcript.resolve()
    if not tpath.exists():
        sys.exit("transcricao nao encontrada: %s" % tpath)

    st = dict(STYLES[a.style])
    if a.margin_v:
        st["margin_v"] = a.margin_v
    if a.font_size:
        st["size"] = a.font_size
    per_line = a.words_per_line or st["words_per_line"]
    terms = {t.strip().lower() for t in a.highlight.split(",") if t.strip()}

    words = load_words(tpath)
    if not words:
        sys.exit("transcricao sem palavras utilizaveis")
    lines = chunk(words, per_line, a.max_gap, a.max_duration)

    a.out_dir.mkdir(parents=True, exist_ok=True)
    srt = a.out_dir / "master.srt"
    ass = a.out_dir / "captions.ass"
    n1 = write_srt(lines, srt, a.offset, st["uppercase"], not a.keep_fillers)
    n2 = write_ass(lines, ass, st, a.offset, terms, a.highlight_numbers,
                   not a.keep_fillers, not a.no_pop)

    dur = words[-1]["end"] - words[0]["start"]
    print("estilo      %s  (%s)" % (a.style, st["note"]))
    print("palavras    %d em %d linhas (%.1f palavras/linha)"
          % (len(words), n2, len(words) / max(1, n2)))
    print("ritmo       %.1f linhas/min" % (n2 / (dur / 60) if dur else 0))
    print("destaque    %s%s"
          % (", ".join(sorted(terms)) or "nenhum termo",
             " + numeros/valores" if a.highlight_numbers else ""))
    print("SRT         %s (%d blocos)" % (srt, n1))
    print("ASS         %s (%d dialogos)" % (ass, n2))


if __name__ == "__main__":
    main()
