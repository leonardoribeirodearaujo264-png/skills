"""Rastreia o rosto no video e calcula as faixas livres para overlays.

Serve para DECIDIR e depois VALIDAR posicao de legenda e marca d'agua: em vez
de chutar uma altura, mede onde o rosto realmente esta ao longo do video e
devolve a envoltoria (o retangulo que contem todas as deteccoes).

Usa o Haar cascade que ja vem no OpenCV - suficiente aqui porque e um unico
rosto frontal ocupando boa parte do quadro. MediaPipe nao foi instalado: traria
protobuf/absl so para o mesmo resultado neste caso.

Uso:
    python face_track.py <video> --out rostos.json [--fps 2]
    python face_track.py <video> --check rostos.json --caixa x,y,w,h --nome legenda
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np


def detect(video: Path, passo: float) -> dict:
    cap = cv2.VideoCapture(str(video))
    if not cap.isOpened():
        sys.exit("nao abriu: %s" % video)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    salto = max(1, int(round(fps * passo)))

    casc = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

    achados, i, sem = [], 0, 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if i % salto == 0:
            g = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            g = cv2.equalizeHist(g)
            # minSize alto: o rosto ocupa boa parte do quadro, e isso descarta
            # falso positivo em textura de parede e dobra de roupa
            fs = casc.detectMultiScale(g, scaleFactor=1.12, minNeighbors=6,
                                       minSize=(int(W * 0.14), int(W * 0.14)))
            if len(fs):
                x, y, w, h = max(fs, key=lambda r: r[2] * r[3])
                achados.append({"t": round(i / fps, 2), "x": int(x), "y": int(y),
                                "w": int(w), "h": int(h)})
            else:
                sem += 1
        i += 1
    cap.release()

    if not achados:
        sys.exit("nenhum rosto detectado")

    xs = [a["x"] for a in achados]; ys = [a["y"] for a in achados]
    x2 = [a["x"] + a["w"] for a in achados]; y2 = [a["y"] + a["h"] for a in achados]
    env = {"x": min(xs), "y": min(ys), "x2": max(x2), "y2": max(y2)}
    env["w"] = env["x2"] - env["x"]; env["h"] = env["y2"] - env["y"]

    return {"video": str(video), "W": W, "H": H, "fps": round(fps, 3),
            "frames": total, "amostras": len(achados), "sem_rosto": sem,
            "envoltoria": env, "deteccoes": achados}


def relatorio(d: dict) -> None:
    H, W = d["H"], d["W"]
    e = d["envoltoria"]
    print("video %dx%d @ %.2f fps | %d amostras, %d sem rosto\n"
          % (W, H, d["fps"], d["amostras"], d["sem_rosto"]))
    print("ENVOLTORIA DO ROSTO (contem todas as deteccoes):")
    print("  x %4d-%4d  (%.0f%%-%.0f%% da largura)"
          % (e["x"], e["x2"], e["x"] / W * 100, e["x2"] / W * 100))
    print("  y %4d-%4d  (%.0f%%-%.0f%% da altura)"
          % (e["y"], e["y2"], e["y"] / H * 100, e["y2"] / H * 100))
    print("\nFAIXAS LIVRES NA VERTICAL:")
    print("  acima do rosto: y 0-%d   (0%%-%.0f%%)" % (e["y"], e["y"] / H * 100))
    print("  abaixo do rosto: y %d-%d (%.0f%%-100%%)" % (e["y2"], H, e["y2"] / H * 100))


def check(d: dict, caixa: str, nome: str) -> bool:
    e = d["envoltoria"]
    x, y, w, h = (int(v) for v in caixa.split(","))
    bx2, by2 = x + w, y + h
    inter_w = max(0, min(bx2, e["x2"]) - max(x, e["x"]))
    inter_h = max(0, min(by2, e["y2"]) - max(y, e["y"]))
    area = inter_w * inter_h
    ok = area == 0
    print("%-12s caixa y %d-%d  x %d-%d  ->  %s"
          % (nome, y, by2, x, bx2,
             "LIVRE do rosto" if ok else "SOBREPOE o rosto em %d px2" % area))
    return ok


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("--out", type=Path)
    ap.add_argument("--fps", type=float, default=2.0,
                    help="amostras por segundo (default 2)")
    ap.add_argument("--check", type=Path)
    ap.add_argument("--caixa", action="append", default=[],
                    help="x,y,w,h de um overlay a validar")
    ap.add_argument("--nome", action="append", default=[])
    a = ap.parse_args()

    if a.check:
        d = json.loads(a.check.read_text(encoding="utf-8"))
        relatorio(d)
        print()
        todas = True
        for i, c in enumerate(a.caixa):
            nome = a.nome[i] if i < len(a.nome) else "caixa%d" % i
            todas &= check(d, c, nome)
        sys.exit(0 if todas else 1)

    d = detect(a.video, 1.0 / a.fps)
    relatorio(d)
    if a.out:
        a.out.write_text(json.dumps(d, indent=1), encoding="utf-8")
        print("\nsalvo: %s" % a.out)


if __name__ == "__main__":
    main()
