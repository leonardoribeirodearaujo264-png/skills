"""Technical inspection of a media file (ffprobe wrapper).

Prints a human-readable report and, with --json, the raw ffprobe payload.
This is step 1 of every edit: never plan a cut before knowing the FPS,
the rotation flag and whether there is usable audio.

Usage:
    python probe.py <media> [--json] [--out report.json]
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from fractions import Fraction
from pathlib import Path


def ffprobe(path: Path) -> dict:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_format", "-show_streams",
         "-of", "json", str(path)],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        raise RuntimeError("ffprobe failed:\n" + r.stderr[-1500:])
    return json.loads(r.stdout)


def rate(s: str | None) -> float:
    """'30000/1001' -> 29.97. Returns 0.0 for the '0/0' ffprobe writes for
    streams with no meaningful rate."""
    if not s:
        return 0.0
    try:
        f = Fraction(s)
        return float(f) if f.denominator else 0.0
    except (ZeroDivisionError, ValueError):
        return 0.0


def rotation_of(stream: dict) -> int:
    for sd in stream.get("side_data_list") or []:
        if sd.get("rotation") is not None:
            return int(sd["rotation"])
    tags = stream.get("tags") or {}
    try:
        return int(tags.get("rotate", 0))
    except ValueError:
        return 0


def summarize(data: dict, path: Path) -> dict:
    fmt = data.get("format") or {}
    streams = data.get("streams") or []
    v = next((s for s in streams if s.get("codec_type") == "video"), None)
    audios = [s for s in streams if s.get("codec_type") == "audio"]
    a = audios[0] if audios else None

    out: dict = {
        "file": str(path),
        "size_mb": round(int(fmt.get("size", 0)) / 1048576, 2),
        "container": fmt.get("format_name"),
        "duration_s": round(float(fmt.get("duration", 0) or 0), 3),
        "bitrate_kbps": round(int(fmt.get("bit_rate", 0) or 0) / 1000),
        "video": None,
        "audio": None,
        "audio_track_count": len(audios),
    }

    if v:
        w, h = int(v.get("width", 0)), int(v.get("height", 0))
        rot = rotation_of(v)
        dw, dh = (h, w) if rot in (90, -90, 270, -270) else (w, h)
        out["video"] = {
            "codec": v.get("codec_name"),
            "profile": v.get("profile"),
            "pix_fmt": v.get("pix_fmt"),
            "stored_resolution": "%dx%d" % (w, h),
            "display_resolution": "%dx%d" % (dw, dh),
            "rotation": rot,
            "orientation": ("vertical" if dh > dw else
                            "square" if dh == dw else "horizontal"),
            "aspect": round(dw / dh, 4) if dh else None,
            "fps": round(rate(v.get("r_frame_rate")), 3),
            "avg_fps": round(rate(v.get("avg_frame_rate")), 3),
            "bitrate_kbps": round(int(v.get("bit_rate", 0) or 0) / 1000) or None,
            "frames": v.get("nb_frames"),
        }
    if a:
        out["audio"] = {
            "codec": a.get("codec_name"),
            "sample_rate": a.get("sample_rate"),
            "channels": a.get("channels"),
            "channel_layout": a.get("channel_layout"),
            "bitrate_kbps": round(int(a.get("bit_rate", 0) or 0) / 1000) or None,
        }
    return out


def platform_hint(s: dict) -> list[str]:
    """Flags that change how the edit must be planned."""
    notes = []
    v, a = s.get("video"), s.get("audio")
    if not v:
        notes.append("SEM VIDEO - arquivo so de audio.")
    if not a:
        notes.append("SEM AUDIO - transcricao e cortes por fala sao impossiveis.")
    if v:
        if v["rotation"]:
            notes.append("Rotacao %d gravada nos metadados: use a resolucao de "
                         "EXIBICAO (%s), nao a armazenada."
                         % (v["rotation"], v["display_resolution"]))
        if v["fps"] and abs(v["fps"] - round(v["fps"])) > 0.01:
            notes.append("FPS fracionario (%.3f): mantenha o mesmo fps em todos "
                         "os segmentos ou o concat dessincroniza." % v["fps"])
        if v["orientation"] == "horizontal":
            notes.append("Fonte horizontal: para Reels/Shorts sera preciso "
                         "reframe 9:16 (crop, nunca esticar).")
    if s["audio_track_count"] > 1:
        notes.append("%d faixas de audio: confirme qual e a voz "
                     "(--audio-track)." % s["audio_track_count"])
    return notes


def main() -> None:
    ap = argparse.ArgumentParser(description="ffprobe technical report")
    ap.add_argument("media", type=Path)
    ap.add_argument("--json", action="store_true", help="print raw ffprobe json")
    ap.add_argument("--out", type=Path, default=None, help="write summary json here")
    args = ap.parse_args()

    path = args.media.resolve()
    if not path.exists():
        sys.exit("nao encontrado: %s" % path)

    data = ffprobe(path)
    if args.json:
        print(json.dumps(data, indent=2))
        return

    s = summarize(data, path)
    v, a = s["video"], s["audio"]
    print("ARQUIVO      %s" % path.name)
    print("  container  %s | %.2f MB | %.2fs | %d kbps"
          % (s["container"], s["size_mb"], s["duration_s"], s["bitrate_kbps"]))
    if v:
        print("  video      %s (%s) %s @ %.3f fps | %s | rot %d"
              % (v["codec"], v["pix_fmt"], v["display_resolution"], v["fps"],
                 v["orientation"], v["rotation"]))
    else:
        print("  video      -")
    if a:
        print("  audio      %s | %s Hz | %d ch (%s)%s"
              % (a["codec"], a["sample_rate"], a["channels"] or 0,
                 a["channel_layout"],
                 " | faixas: %d" % s["audio_track_count"]
                 if s["audio_track_count"] > 1 else ""))
    else:
        print("  audio      -")

    notes = platform_hint(s)
    if notes:
        print("\nATENCAO")
        for n in notes:
            print("  - %s" % n)

    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(s, indent=2, ensure_ascii=False),
                            encoding="utf-8")
        print("\nresumo salvo: %s" % args.out)


if __name__ == "__main__":
    main()
