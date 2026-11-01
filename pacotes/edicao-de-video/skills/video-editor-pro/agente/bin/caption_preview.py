"""Etapa "Escolha o estilo da legenda": gera os cards de preview.

Como o preview e feito: o frame escolhido vira um video de 1 frame, o ASS do
preset e queimado nele pelo ffmpeg/libass e o resultado volta como PNG. Ou
seja, o card NAO e um desenho aproximado - e o proprio motor do render final
rodando sobre o frame real do video do usuario.

Escolha do frame (nesta ordem):
  1. rosto detectado (OpenCV), entre 20% e 50% da duracao
  2. entre os candidatos, o mais bem iluminado (luminancia media na area do
     rosto, descartando sub e superexposto)
  3. se nao houver rosto, o frame mais bem iluminado da mesma janela

Uso:
    python caption_preview.py <video> --out-dir <dir> [--transcript t.json]
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

PRESETS = Path(__file__).resolve().parent.parent / "presets" / "legendas"
# Fonte da folha de escolha: a do sistema (Windows, Mac ou Linux); sem nenhuma, a padrão do Pillow
FONTES_UI = [
    ("C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/segoeui.ttf"),
    ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf"),
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
]
FONT_UI, FONT_UI_R = next(((b, r) for b, r in FONTES_UI if Path(b).exists() and Path(r).exists()), (None, None))


def fonte(caminho, tamanho):
    return ImageFont.truetype(caminho, tamanho) if caminho else ImageFont.load_default()


def dur(v: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "format=duration", "-of", "csv=p=0", str(v)],
                       capture_output=True, text=True)
    return float(r.stdout.strip() or 0)


def frame_png(v: Path, t: float, dst: Path) -> bool:
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "%.2f" % t,
                        "-i", str(v), "-frames:v", "1", str(dst)],
                       capture_output=True, text=True)
    return r.returncode == 0 and dst.exists()


def escolher_frame(v: Path, tmp: Path) -> tuple[float, dict | None]:
    """Melhor frame na janela 20%-50%: rosto visivel e bem iluminado."""
    import cv2
    total = dur(v)
    t0, t1 = total * 0.20, total * 0.50
    casc = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

    cands = []
    passos = 14
    for i in range(passos):
        t = t0 + (t1 - t0) * i / max(1, passos - 1)
        p = tmp / ("c%02d.png" % i)
        if not frame_png(v, t, p):
            continue
        img = np.array(Image.open(p).convert("RGB"))
        g = np.array(Image.open(p).convert("L"))
        fs = casc.detectMultiScale(cv2.equalizeHist(g), 1.12, 6,
                                   minSize=(int(img.shape[1] * 0.14),) * 2)
        if len(fs):
            x, y, w, h = max(fs, key=lambda r: r[2] * r[3])
            luz = float(g[y:y + h, x:x + w].mean())
            # penaliza sub (<70) e superexposto (>200); o ideal fica perto de 135
            score = 100 - abs(luz - 135) * 0.6
            cands.append((score, t, {"x": int(x), "y": int(y),
                                     "w": int(w), "h": int(h), "luz": round(luz, 1)}))
        else:
            luz = float(g.mean())
            cands.append((50 - abs(luz - 135) * 0.6, t, None))

    if not cands:
        return dur(v) * 0.33, None
    cands.sort(key=lambda c: -c[0])
    return cands[0][1], cands[0][2]


def trecho_real(v: Path, t: float, tmp: Path, transcript: Path | None) -> list[dict]:
    """Palavras reais em volta do frame escolhido. Se ja existe transcricao do
    video, usa ela; senao transcreve so ~14s, que basta para o exemplo."""
    if transcript and transcript.exists():
        d = json.loads(transcript.read_text(encoding="utf-8"))
        ws = [w for w in d["words"]
              if w.get("type") == "word" and (w.get("text") or "").strip()]
        perto = [w for w in ws if t - 7 <= w["start"] <= t + 7]
        return (perto or ws)[:14]

    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from transcribe_local import transcribe_one
    ini = max(0.0, t - 7)
    corte = tmp / "trecho.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "%.2f" % ini,
                    "-i", str(v), "-t", "14", "-c", "copy", str(corte)],
                   capture_output=True)
    if not corte.exists():
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "%.2f" % ini,
                        "-i", str(v), "-t", "14", str(corte)], capture_output=True)
    out = transcribe_one(corte, tmp, "pt", "small", 0, True, False, vad=False)
    d = json.loads(Path(out).read_text(encoding="utf-8"))
    return [w for w in d["words"]
            if w.get("type") == "word" and (w.get("text") or "").strip()][:14]


def preview_de(preset: Path, frame: Path, words: list[dict], tmp: Path,
               dst: Path) -> None:
    """Queima o ASS do preset no frame real, pelo mesmo libass do render."""
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from caption_styles import gerar

    p = json.loads(preset.read_text(encoding="utf-8"))
    # reancora as palavras em 0 para a legenda aparecer no frame unico
    base = words[0]["start"]
    ws = [{**w, "start": w["start"] - base, "end": w["end"] - base} for w in words]
    # instante escolhido: meio do bloco, para pegar uma palavra ativa no meio
    alvo = ws[min(len(ws) - 1, p["max_palavras"] // 2)]
    quando = (alvo["start"] + alvo["end"]) / 2

    ass = tmp / ("p_%s.ass" % p["id"])
    ass.write_text(gerar(p, ws, 0.0), encoding="utf-8")

    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error",
                        "-loop", "1", "-i", str(frame),
                        "-vf", "ass=%s" % ass.name,
                        "-ss", "%.3f" % quando, "-frames:v", "1", str(dst)],
                       capture_output=True, text=True, cwd=str(tmp))
    if r.returncode != 0 or not dst.exists():
        raise RuntimeError("preview falhou (%s):\n%s" % (p["id"], r.stderr[-800:]))


def montar_cards(previews: list[tuple[dict, Path]], dst: Path, cols: int = 4) -> None:
    """Folha de cards: preview + numero + nome + descricao."""
    cw, ch = 300, 533
    cab, leg = 56, 96
    cel_w, cel_h = cw + 24, ch + cab + leg + 24
    linhas = (len(previews) + cols - 1) // cols
    sheet = Image.new("RGB", (cel_w * cols, cel_h * linhas), (18, 18, 20))
    d = ImageDraw.Draw(sheet)
    f_num = fonte(FONT_UI, 22)
    f_nome = fonte(FONT_UI, 26)
    f_desc = fonte(FONT_UI_R, 17)

    for i, (p, png) in enumerate(previews):
        cx, cy = (i % cols) * cel_w + 12, (i // cols) * cel_h + 12
        d.text((cx, cy + 4), "ESTILO %s" % p["id"][:2], font=f_num, fill=(150, 150, 158))
        d.text((cx, cy + 28), p["nome"], font=f_nome, fill=(255, 255, 255))
        im = Image.open(png).convert("RGB").resize((cw, ch), Image.LANCZOS)
        sheet.paste(im, (cx, cy + cab))
        y = cy + cab + ch + 8
        palavras, linha = p["descricao"].split(), ""
        for w in palavras:
            t = (linha + " " + w).strip()
            if d.textlength(t, font=f_desc) <= cw:
                linha = t
            else:
                d.text((cx, y), linha, font=f_desc, fill=(176, 176, 184)); y += 21
                linha = w
        if linha:
            d.text((cx, y), linha, font=f_desc, fill=(176, 176, 184))
    sheet.save(dst)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("--out-dir", type=Path, required=True)
    ap.add_argument("--transcript", type=Path, default=None)
    a = ap.parse_args()
    a.out_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        t, rosto = escolher_frame(a.video, tmp)
        print("frame escolhido: %.2fs  %s"
              % (t, ("rosto em y %d-%d, luz %.0f" % (rosto["y"], rosto["y"] + rosto["h"],
                                                     rosto["luz"]))
                 if rosto else "sem rosto detectado"))
        frame = a.out_dir / "frame_base.png"
        frame_png(a.video, t, frame)

        words = trecho_real(a.video, t, tmp, a.transcript)
        frase = " ".join(w["text"] for w in words)
        print("frase de exemplo: %s\n" % frase[:90])

        previews = []
        for pj in sorted(PRESETS.glob("[0-9]*.json")):
            p = json.loads(pj.read_text(encoding="utf-8"))
            png = a.out_dir / ("preview_%s.png" % p["id"])
            preview_de(pj, frame, words, tmp, png)
            previews.append((p, png))
            print("  %-24s %s" % (p["id"], png.name))

        cards = a.out_dir / "ESCOLHA_O_ESTILO.png"
        montar_cards(previews, cards)
        (a.out_dir / "contexto.json").write_text(json.dumps(
            {"video": str(a.video), "frame_s": round(t, 2),
             "rosto": rosto, "frase": frase,
             "estilos": [p["id"] for p, _ in previews]},
            indent=2, ensure_ascii=False), encoding="utf-8")
        print("\ncards: %s" % cards)


if __name__ == "__main__":
    main()
