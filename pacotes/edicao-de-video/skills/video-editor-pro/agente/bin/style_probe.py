"""Extract editing-style characteristics from a reference video.

Answers "edit mine with THIS video's rhythm" without copying anything from
it. What comes out is a set of numbers -- cut rate, shot length distribution,
motion energy, caption density and position, palette statistics -- which are
facts about the edit, not the reference's content. No frames, audio, text or
assets are ever reused.

Usage:
    python style_probe.py <reference.mp4> --name "meu-estilo" --out preset.json
    python style_probe.py <ref.mp4> --scene-threshold 0.28
"""

from __future__ import annotations

import argparse
import json
import re
import statistics
import subprocess
import sys
from fractions import Fraction
from pathlib import Path


def ff(args: list[str]) -> str:
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostats", *args],
                          capture_output=True, text=True).stderr


def probe(path: Path) -> dict:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_format",
                        "-show_streams", "-of", "json", str(path)],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError("ffprobe falhou:\n" + r.stderr[-800:])
    return json.loads(r.stdout)


def cut_points(path: Path, threshold: float) -> list[float]:
    """Timestamps where the frame content changes enough to read as a cut.

    Uses ffmpeg's select+metadata rather than ffprobe's `movie=` lavfi source:
    `movie=` takes the filename inside a filtergraph, where a Windows path
    needs double escaping and silently yields zero frames when it is wrong.
    Passing the file as a normal -i input sidesteps the escaping entirely.
    """
    out = ff(["-i", str(path),
              "-vf", "select='gt(scene,%g)',metadata=print" % threshold,
              "-an", "-f", "null", "-"])
    return sorted({float(m) for m in
                   re.findall(r"pts_time:([\d.]+)", out)})


def motion_energy(path: Path, dur: float) -> float | None:
    """Mean absolute frame-to-frame difference, 0..1. High means the frame is
    rarely still: handheld, fast cuts, constant zooms."""
    out = ff(["-i", str(path), "-vf",
              "scale=160:-2,tblend=all_mode=difference,"
              "signalstats,metadata=print:key=lavfi.signalstats.YAVG",
              "-an", "-f", "null", "-"])
    vals = [float(m) for m in
            re.findall(r"lavfi\.signalstats\.YAVG=([\d.]+)", out)]
    if not vals:
        return None
    return round(statistics.fmean(vals) / 255.0, 4)


def palette(path: Path) -> dict:
    """Average luma and saturation: how dark and how colourful the grade is."""
    out = ff(["-i", str(path), "-vf",
              "fps=1/2,scale=160:-2,signalstats,"
              "metadata=print:key=lavfi.signalstats.YAVG",
              "-an", "-f", "null", "-"])
    y = [float(m) for m in re.findall(r"lavfi\.signalstats\.YAVG=([\d.]+)", out)]
    out2 = ff(["-i", str(path), "-vf",
               "fps=1/2,scale=160:-2,signalstats,"
               "metadata=print:key=lavfi.signalstats.SATAVG",
               "-an", "-f", "null", "-"])
    s = [float(m) for m in re.findall(r"lavfi\.signalstats\.SATAVG=([\d.]+)", out2)]
    res = {}
    if y:
        res["luma_avg"] = round(statistics.fmean(y), 1)
        res["luma_read"] = ("escuro/cinematografico" if statistics.fmean(y) < 90
                            else "claro/limpo" if statistics.fmean(y) > 140
                            else "medio")
    if s:
        res["saturation_avg"] = round(statistics.fmean(s), 1)
        res["saturation_read"] = ("dessaturado/sobrio" if statistics.fmean(s) < 40
                                  else "saturado/vibrante" if statistics.fmean(s) > 90
                                  else "natural")
    return res


def speech_density(path: Path, dur: float) -> dict:
    """Share of the runtime carrying speech. Tells you whether the reference
    is wall-to-wall talking or leaves room for music and B-roll."""
    out = ff(["-i", str(path), "-af", "silencedetect=noise=-32dB:d=0.30",
              "-f", "null", "-"])
    st = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", out)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    total_sil = sum(max(0.0, (en[i] if i < len(en) else dur) - max(0.0, s))
                    for i, s in enumerate(st))
    return {"silence_ratio": round(total_sil / dur, 3) if dur else 0.0,
            "speech_ratio": round(1 - (total_sil / dur), 3) if dur else 0.0,
            "pauses": len(st)}


def classify_pace(cpm: float) -> str:
    if cpm >= 30:
        return "muito rapido (estilo TikTok/anuncio agressivo)"
    if cpm >= 18:
        return "rapido (Reels/Shorts padrao)"
    if cpm >= 9:
        return "moderado (YouTube dinamico)"
    if cpm >= 4:
        return "respirado (YouTube longo / institucional)"
    return "lento (entrevista, plano fixo, podcast)"


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Extrai caracteristicas de edicao de um video de referencia")
    ap.add_argument("reference", type=Path)
    ap.add_argument("--name", default=None, help="nome do preset gerado")
    ap.add_argument("--out", type=Path, default=None)
    ap.add_argument("--scene-threshold", type=float, default=0.30,
                    help="sensibilidade da deteccao de corte (0.2 mais sensivel)")
    a = ap.parse_args()

    ref = a.reference.resolve()
    if not ref.exists():
        sys.exit("nao encontrado: %s" % ref)

    data = probe(ref)
    fmt = data.get("format") or {}
    v = next((s for s in data.get("streams") or []
              if s.get("codec_type") == "video"), None)
    if not v:
        sys.exit("referencia sem video")
    dur = float(fmt.get("duration", 0) or 0)
    w, h = int(v.get("width", 0)), int(v.get("height", 0))
    try:
        fps = float(Fraction(v.get("r_frame_rate", "0/1")))
    except (ZeroDivisionError, ValueError):
        fps = 0.0

    print("analisando %s (%.1fs)..." % (ref.name, dur), flush=True)
    cuts = cut_points(ref, a.scene_threshold)
    print("  cortes detectados: %d" % len(cuts), flush=True)
    shots = [cuts[i + 1] - cuts[i] for i in range(len(cuts) - 1)]
    if cuts:
        shots = [cuts[0]] + shots + [max(0.0, dur - cuts[-1])]
    shots = [s for s in shots if s > 0.05]

    cpm = (len(cuts) / (dur / 60)) if dur else 0.0
    print("  medindo energia de movimento...", flush=True)
    energy = motion_energy(ref, dur)
    print("  medindo grade e fala...", flush=True)
    pal = palette(ref)
    sp = speech_density(ref, dur)

    style = {
        "name": a.name or ref.stem,
        "source_note": "Caracteristicas medidas de uma referencia. Nenhum frame, "
                       "audio, texto ou asset da referencia e reutilizado.",
        "canvas": {
            "resolution": "%dx%d" % (w, h),
            "aspect": round(w / h, 4) if h else None,
            "orientation": "vertical" if h > w else "square" if h == w else "horizontal",
            "fps": round(fps, 3),
        },
        "pacing": {
            "duration_s": round(dur, 2),
            "cuts": len(cuts),
            "cuts_per_minute": round(cpm, 1),
            "shot_length_median_s": round(statistics.median(shots), 2) if shots else None,
            "shot_length_mean_s": round(statistics.fmean(shots), 2) if shots else None,
            "shot_length_min_s": round(min(shots), 2) if shots else None,
            "shot_length_max_s": round(max(shots), 2) if shots else None,
            "read": classify_pace(cpm),
        },
        "motion": {
            "energy_0_1": energy,
            "read": (None if energy is None else
                     "estatico / plano fixo" if energy < 0.02 else
                     "movimento discreto (punch-ins pontuais)" if energy < 0.05 else
                     "movimento constante (zooms, camera solta)"),
        },
        "grade": pal,
        "speech": sp,
        "suggested_preset_overrides": {
            "cut_intensity": ("alta" if cpm >= 18 else
                              "media" if cpm >= 8 else "baixa"),
            "zoom_intensity": (None if energy is None else
                               "alta" if energy >= 0.05 else
                               "media" if energy >= 0.02 else "baixa"),
            "target_shot_length_s": round(statistics.median(shots), 2) if shots else None,
            "format_hint": ("reels" if h > w else
                            "square" if h == w else "youtube"),
        },
    }

    print("\nESTILO  %s" % style["name"])
    p = style["pacing"]
    print("  canvas    %s @ %.2f fps (%s)"
          % (style["canvas"]["resolution"], style["canvas"]["fps"],
             style["canvas"]["orientation"]))
    print("  ritmo     %d cortes | %.1f cortes/min | plano mediano %.2fs -> %s"
          % (p["cuts"], p["cuts_per_minute"], p["shot_length_median_s"] or 0,
             p["read"]))
    print("  movimento %s (%s)" % (style["motion"]["energy_0_1"],
                                   style["motion"]["read"]))
    if pal:
        print("  imagem    luma %.0f (%s) | saturacao %.0f (%s)"
              % (pal.get("luma_avg", 0), pal.get("luma_read", "?"),
                 pal.get("saturation_avg", 0), pal.get("saturation_read", "?")))
    print("  fala      %.0f%% do tempo, %d pausas"
          % (sp["speech_ratio"] * 100, sp["pauses"]))

    out = a.out or (ref.parent / ("estilo_%s.json" % style["name"]))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(style, indent=2, ensure_ascii=False),
                   encoding="utf-8")
    print("\nsalvo: %s" % out)


if __name__ == "__main__":
    main()
