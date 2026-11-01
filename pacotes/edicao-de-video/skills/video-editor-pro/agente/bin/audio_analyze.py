"""Ground-truth audio analysis: silences, loudness, clipping, noise floor.

Why this exists separately from the transcript: Whisper normalizes
disfluencies and its VAD invents boundaries. Silence and pause data must come
from the waveform itself, not from the ASR, or the cut plan is built on
guesses. Everything here is measured by ffmpeg on the real samples.

Outputs JSON: silences (start/end/duration), EBU R128 loudness, true peak,
clipping estimate, noise floor, and cut-candidate classification.

Usage:
    python audio_analyze.py <media> [--noise-db -35] [--min-silence 0.35]
                            [--out analysis.json]
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def ff(args: list[str]) -> str:
    """Run ffmpeg and return stderr (where its filters report)."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", *args],
                       capture_output=True, text=True)
    return r.stderr


def duration_of(path: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0


def detect_silences(path: Path, noise_db: float, min_sil: float) -> list[dict]:
    out = ff(["-i", str(path),
              "-af", "silencedetect=noise=%gdB:d=%g" % (noise_db, min_sil),
              "-f", "null", "-"])
    starts = [float(m) for m in re.findall(r"silence_start: (-?[\d.]+)", out)]
    ends = [float(m) for m in re.findall(r"silence_end: (-?[\d.]+)", out)]
    sil = []
    for i, st in enumerate(starts):
        en = ends[i] if i < len(ends) else duration_of(path)
        st = max(0.0, st)
        if en > st:
            sil.append({"start": round(st, 3), "end": round(en, 3),
                        "duration": round(en - st, 3)})
    return sil


def loudness(path: Path) -> dict:
    """EBU R128 measurement via loudnorm's analysis pass."""
    out = ff(["-i", str(path),
              "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
              "-f", "null", "-"])
    m = re.search(r"\{[^{}]*input_i[^{}]*\}", out, re.S)
    if not m:
        return {}
    try:
        d = json.loads(m.group(0))
    except json.JSONDecodeError:
        return {}
    return {k: (float(v) if _isnum(v) else v) for k, v in d.items()}


def _isnum(v) -> bool:
    try:
        float(v)
        return True
    except (TypeError, ValueError):
        return False


def stats(path: Path) -> dict:
    """astats: peak, RMS, noise floor, and the flat-region count that
    stands in for clipping."""
    out = ff(["-i", str(path), "-af", "astats=metadata=1:reset=0",
              "-f", "null", "-"])

    def grab(label: str) -> float | None:
        m = re.findall(r"%s:\s*(-?[\d.]+|-inf)" % re.escape(label), out)
        if not m:
            return None
        v = m[-1]
        return float("-inf") if v == "-inf" else float(v)

    return {
        "peak_dbfs": grab("Peak level dB"),
        "rms_dbfs": grab("RMS level dB"),
        "rms_peak_dbfs": grab("RMS peak dB"),
        "noise_floor_dbfs": grab("Noise floor dB"),
        "dynamic_range_db": grab("Dynamic range"),
        "flat_factor": grab("Flat factor"),
        "peak_count": grab("Peak count"),
    }


def classify(silences: list[dict], total: float) -> dict:
    """Turn raw silences into editorial buckets.

    Thresholds follow video-use's cut craft: >=0.4s is a clean cut point,
    0.15-0.4s is usable with a visual check, below 0.15s is mid-phrase and
    unsafe to cut on.
    """
    clean = [s for s in silences if s["duration"] >= 0.40]
    usable = [s for s in silences if 0.15 <= s["duration"] < 0.40]
    dead = [s for s in silences if s["duration"] >= 1.5]
    total_sil = sum(s["duration"] for s in silences)
    # Trimming every clean silence down to a 0.18s breath is the realistic
    # ceiling on what silence removal alone can save.
    reclaimable = sum(max(0.0, s["duration"] - 0.18) for s in clean)
    return {
        "clean_cut_points": len(clean),
        "usable_cut_points": len(usable),
        "dead_air_over_1_5s": dead,
        "silence_total_s": round(total_sil, 2),
        "silence_ratio": round(total_sil / total, 4) if total else 0.0,
        "reclaimable_s": round(reclaimable, 2),
    }


def verdict(ln: dict, st: dict) -> list[str]:
    notes = []
    i = ln.get("input_i")
    tp = ln.get("input_tp")
    if _isnum(i):
        i = float(i)
        if i < -23:
            notes.append("Voz MUITO baixa (%.1f LUFS). Normalizar e obrigatorio." % i)
        elif i < -19:
            notes.append("Voz baixa (%.1f LUFS). Normalizar para -16 LUFS." % i)
        elif i > -11:
            notes.append("Voz alta demais (%.1f LUFS). Risco de distorcao no "
                         "player da plataforma." % i)
        else:
            notes.append("Loudness em faixa aceitavel (%.1f LUFS)." % i)
    if _isnum(tp) and float(tp) > -0.5:
        notes.append("True peak %.2f dBTP: perigo de clipping. Limitar em -1.5 dBTP."
                     % float(tp))
    nf = st.get("noise_floor_dbfs")
    if nf is not None and nf != float("-inf") and nf > -50:
        notes.append("Piso de ruido alto (%.1f dBFS): aplicar afftdn/highpass." % nf)
    ff_ = st.get("flat_factor")
    if ff_ is not None and ff_ > 0:
        notes.append("Flat factor %.2f: possivel clipping digital ja gravado "
                     "(nao e reparavel, so atenuavel)." % ff_)
    return notes


def main() -> None:
    ap = argparse.ArgumentParser(description="Ground-truth audio analysis")
    ap.add_argument("media", type=Path)
    ap.add_argument("--noise-db", type=float, default=-35.0,
                    help="silence threshold in dB (default -35)")
    ap.add_argument("--min-silence", type=float, default=0.35,
                    help="minimum silence length in seconds (default 0.35)")
    ap.add_argument("--out", type=Path, default=None)
    a = ap.parse_args()

    path = a.media.resolve()
    if not path.exists():
        sys.exit("nao encontrado: %s" % path)

    total = duration_of(path)
    print("analisando audio de %s (%.1fs)..." % (path.name, total), flush=True)
    sil = detect_silences(path, a.noise_db, a.min_silence)
    ln = loudness(path)
    st = stats(path)
    cls = classify(sil, total)
    notes = verdict(ln, st)

    report = {"file": str(path), "duration_s": round(total, 3),
              "silences": sil, "silence_analysis": cls,
              "loudness_ebu_r128": ln, "stats": st, "notes": notes}

    print("\nSILENCIOS  %d detectados (>= %gs), %.1fs no total (%.1f%% do video)"
          % (len(sil), a.min_silence, cls["silence_total_s"],
             cls["silence_ratio"] * 100))
    print("  pontos de corte limpos (>=0.40s): %d" % cls["clean_cut_points"])
    print("  pontos usaveis (0.15-0.40s):      %d" % cls["usable_cut_points"])
    print("  ar morto (>=1.5s):                %d" % len(cls["dead_air_over_1_5s"]))
    print("  recuperavel cortando silencios:   ~%.1fs" % cls["reclaimable_s"])
    print("\nLOUDNESS   I=%s LUFS | TP=%s dBTP | LRA=%s"
          % (ln.get("input_i", "?"), ln.get("input_tp", "?"),
             ln.get("input_lra", "?")))
    print("NIVEIS     pico=%s dBFS | rms=%s dBFS | ruido=%s dBFS"
          % (st.get("peak_dbfs"), st.get("rms_dbfs"), st.get("noise_floor_dbfs")))
    if notes:
        print("\nDIAGNOSTICO")
        for n in notes:
            print("  - %s" % n)

    if a.out:
        a.out.parent.mkdir(parents=True, exist_ok=True)
        a.out.write_text(json.dumps(report, indent=2, ensure_ascii=False),
                         encoding="utf-8")
        print("\nsalvo: %s" % a.out)


if __name__ == "__main__":
    main()
