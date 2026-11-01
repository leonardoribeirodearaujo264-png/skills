"""Transcricao de audio longo em blocos retomaveis.

Uma audiencia de 3h nesta CPU leva horas. Um processo unico que morre no meio
perde tudo, entao aqui cada bloco de N minutos vira um JSON proprio: da para
acompanhar o progresso, retomar de onde parou e ja ler as partes prontas.

Os timestamps sao devolvidos na linha de tempo do ARQUIVO INTEIRO (o offset do
bloco e somado de volta), e o VAD fica desligado por padrao - com ele ligado o
faster-whisper devolve tempos numa linha comprimida, inutil para audiencia.

Uso:
    python transcribe_long.py <midia> --out-dir <dir> [--chunk 600]
                              [--language pt] [--model small]
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"


def duration_of(path: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "format=duration", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True)
    return float(r.stdout.strip() or 0)


def extract(src: Path, dst: Path, start: float, dur: float) -> None:
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error",
                        "-ss", "%.3f" % start, "-i", str(src),
                        "-t", "%.3f" % dur, "-vn", "-ac", "1", "-ar", "16000",
                        "-c:a", "pcm_s16le", str(dst)],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError("ffmpeg falhou:\n" + r.stderr[-1200:])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("media", type=Path)
    ap.add_argument("--out-dir", type=Path, required=True)
    ap.add_argument("--chunk", type=float, default=600.0)
    ap.add_argument("--language", default="pt")
    ap.add_argument("--model", default="small")
    a = ap.parse_args()

    src = a.media.resolve()
    a.out_dir.mkdir(parents=True, exist_ok=True)
    total = duration_of(src)
    n = int(total // a.chunk) + (1 if total % a.chunk else 0)
    print("midia: %s" % src.name)
    print("duracao: %.0fs (%.1f h) -> %d blocos de %.0f min\n"
          % (total, total / 3600, n, a.chunk / 60), flush=True)

    from faster_whisper import WhisperModel
    model = WhisperModel(a.model, device="cpu", compute_type="int8",
                         download_root=str(MODELS_DIR),
                         cpu_threads=max(1, os.cpu_count() or 4))

    t_run = time.time()
    for i in range(n):
        out = a.out_dir / ("bloco_%03d.json" % i)
        if out.exists():
            print("[%03d/%03d] ja feito" % (i + 1, n), flush=True)
            continue
        start = i * a.chunk
        dur = min(a.chunk, total - start)
        wav = a.out_dir / ("_tmp_%03d.wav" % i)
        t0 = time.time()
        extract(src, wav, start, dur)

        segments, info = model.transcribe(
            str(wav), language=a.language, beam_size=5,
            word_timestamps=True, condition_on_previous_text=False,
            vad_filter=False, temperature=[0.0, 0.2, 0.4])

        segs = []
        for s in segments:
            segs.append({
                "start": round(start + s.start, 3),
                "end": round(start + s.end, 3),
                "text": (s.text or "").strip(),
                "words": [{"t": (w.word or "").strip(),
                           "s": round(start + w.start, 3),
                           "e": round(start + w.end, 3)}
                          for w in (getattr(s, "words", None) or [])],
            })
        out.write_text(json.dumps(
            {"bloco": i, "offset": start, "dur": round(dur, 3),
             "lang": info.language, "segments": segs},
            indent=1, ensure_ascii=False), encoding="utf-8")
        wav.unlink(missing_ok=True)

        dt = time.time() - t0
        feito = i + 1
        resta = (n - feito) * (time.time() - t_run) / feito
        print("[%03d/%03d] %5.0fs de audio em %5.0fs (%.1fx) | %3d falas | "
              "faltam ~%.0f min"
              % (feito, n, dur, dt, dt / dur, len(segs), resta / 60), flush=True)

    print("\nconcluido: %d blocos em %s" % (n, a.out_dir))


if __name__ == "__main__":
    main()
