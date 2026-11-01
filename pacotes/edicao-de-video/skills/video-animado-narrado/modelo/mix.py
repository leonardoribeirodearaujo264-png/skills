"""Mixagem final: voz (vo.wav) + efeitos sonoros nos mesmos tempos da animação, loudnorm -14 LUFS
e junção com o vídeo mudo do HyperFrames.

Uso: python mix.py hf/video_mudo.mp4 video_final.mp4
Edite EVENTOS com as mesmas palavras que disparam animação no template (função tw da cena).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

from sfx import SR, faixa

AQUI = Path(__file__).parent
F = {f["cena"]: f for f in json.load(open(AQUI / "falas.json", encoding="utf-8"))["falas"]}
TOTAL = json.load(open(AQUI / "falas.json", encoding="utf-8"))["total"]
PAL = json.load(open(AQUI / "palavras.json", encoding="utf-8"))


def tw(cena: str, termo: str) -> float:
    """Tempo da primeira palavra da fala `cena` que começa com `termo` (igual à tw do template)."""
    f = F[cena]
    for w in PAL:
        if w["fala"] == f["i"] and re.sub(r"[^\w-]", "", w["texto"].lower()).startswith(termo.lower()):
            return w["t"]
    sys.exit(f"palavra '{termo}' não achada na cena {cena}: confira a âncora")


# Troca de cena = whoosh; elemento que entra = pop; botão ou comentário = click; revelação = impacto
EVENTOS = [{"t": max(0.0, F[c]["inicio"] - 0.15), "som": "whoosh", "nivel_db": -18} for c in list(F)[1:]]
EVENTOS += [
    {"t": tw("virada", "pronto"), "som": "impacto", "nivel_db": -12},
    {"t": tw("cta", "comenta"), "som": "click", "nivel_db": -12},
]

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("uso: python mix.py <video_mudo.mp4> <saida.mp4>")
    voz, sr = sf.read(str(AQUI / "vo.wav"), dtype="float32", always_2d=True)
    voz = voz.mean(1)
    voz48 = np.interp(np.arange(int(len(voz) * SR / sr)) / SR, np.arange(len(voz)) / sr, voz).astype(np.float32)
    fala = voz48[np.abs(voz48) > 0.01]
    ref_db = 20 * np.log10(float(np.sqrt(np.mean(fala ** 2))) + 1e-9) if len(fala) else -20.0
    efeitos = faixa(EVENTOS, TOTAL, ref_db)
    n = min(len(voz48), len(efeitos))
    sf.write(str(AQUI / "mix_bruto.wav"), np.stack([voz48[:n], voz48[:n]], 1) + efeitos[:n], SR)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", sys.argv[1], "-i", str(AQUI / "mix_bruto.wav"),
                    "-filter_complex", "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest",
                    "-movflags", "+faststart", sys.argv[2]], check=True)
    print(f"{len(EVENTOS)} efeitos; saída {sys.argv[2]}")
