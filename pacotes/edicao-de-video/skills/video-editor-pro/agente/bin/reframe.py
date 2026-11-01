"""Reframe a video to a target aspect ratio without ever stretching it.

Three modes, in order of preference:
  crop     hard crop to the target aspect, anchored where the subject is.
           Loses pixels at the sides. Correct for talking heads.
  blurpad  fit the whole frame inside the target and fill the rest with a
           blurred, scaled copy of itself. Loses nothing. Correct for
           screen recordings, slides, and any frame where cropping would cut
           off information.
  pad      fit inside the target on flat colour bars.

Never uses `scale=W:H` alone: that changes the pixel aspect and makes faces
wide. Every path here preserves the source aspect via crop or letterbox.

The crop anchor defaults to centre. `--anchor top` is the right default for a
horizontal talking head going to 9:16, because a centred crop of a 16:9 frame
usually lands on the chest, not the face.

Usage:
    python reframe.py <in> -o <out> --format reels [--mode crop] [--anchor top]
    python reframe.py <in> -o <out> --size 1080x1350 --mode blurpad
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from fractions import Fraction
from pathlib import Path

FORMATS = {
    "reels":   (1080, 1920),   # 9:16  Reels / Shorts / TikTok
    "shorts":  (1080, 1920),
    "tiktok":  (1080, 1920),
    "youtube": (1920, 1080),   # 16:9
    "feed":    (1080, 1350),   # 4:5   feed do Instagram
    "square":  (1080, 1080),   # 1:1
    "4k":      (3840, 2160),
}

ANCHORS = {"center": 0.5, "top": 0.18, "upper": 0.30,
           "bottom": 0.82, "left": 0.18, "right": 0.82}


def probe(path: Path) -> dict:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,r_frame_rate:stream_side_data=rotation",
         "-of", "json", str(path)], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError("ffprobe falhou:\n" + r.stderr[-1000:])
    st = (json.loads(r.stdout).get("streams") or [{}])[0]
    rot = 0
    for sd in st.get("side_data_list") or []:
        if sd.get("rotation") is not None:
            rot = int(sd["rotation"])
    w, h = int(st.get("width", 0)), int(st.get("height", 0))
    if rot in (90, -90, 270, -270):
        w, h = h, w
    try:
        fps = float(Fraction(st.get("r_frame_rate", "0/1")))
    except (ZeroDivisionError, ValueError):
        fps = 0.0
    return {"w": w, "h": h, "fps": fps, "rotation": rot}


def even(n: float) -> int:
    """H.264 needs even dimensions on both axes."""
    return int(round(n / 2)) * 2


def crop_filter(sw: int, sh: int, tw: int, th: int, anchor: float) -> str:
    src_ar, tgt_ar = sw / sh, tw / th
    if abs(src_ar - tgt_ar) < 1e-4:
        return "scale=%d:%d:flags=lanczos" % (tw, th)
    if src_ar > tgt_ar:
        # Source is wider: crop the sides. Horizontal anchor.
        cw, ch = even(sh * tgt_ar), sh
        x = even((sw - cw) * anchor)
        y = 0
    else:
        # Source is taller: crop top/bottom. Vertical anchor.
        cw, ch = sw, even(sw / tgt_ar)
        x = 0
        y = even((sh - ch) * anchor)
    return ("crop=%d:%d:%d:%d,scale=%d:%d:flags=lanczos"
            % (cw, ch, x, y, tw, th))


def blurpad_filter(tw: int, th: int, blur: int) -> str:
    # The background is the same frame scaled to *cover* the target and blurred;
    # the foreground is the same frame scaled to *fit*. No pixels are lost and
    # the bars carry the shot's own colour, which reads far better than black.
    return (
        "split=2[bg][fg];"
        "[bg]scale=%d:%d:force_original_aspect_ratio=increase,"
        "crop=%d:%d,gblur=sigma=%d,eq=brightness=-0.12:saturation=0.7[bgb];"
        "[fg]scale=%d:%d:force_original_aspect_ratio=decrease:flags=lanczos[fgs];"
        "[bgb][fgs]overlay=(W-w)/2:(H-h)/2"
        % (tw, th, tw, th, blur, tw, th)
    )


def pad_filter(tw: int, th: int, colour: str) -> str:
    return ("scale=%d:%d:force_original_aspect_ratio=decrease:flags=lanczos,"
            "pad=%d:%d:(ow-iw)/2:(oh-ih)/2:%s" % (tw, th, tw, th, colour))


def main() -> None:
    ap = argparse.ArgumentParser(description="Reframe sem esticar")
    ap.add_argument("src", type=Path)
    ap.add_argument("-o", "--out", type=Path, required=True)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--format", choices=sorted(FORMATS))
    g.add_argument("--size", help="WxH, ex: 1080x1350")
    ap.add_argument("--mode", default="crop", choices=["crop", "blurpad", "pad"])
    ap.add_argument("--anchor", default="center",
                    help="center|top|upper|bottom|left|right ou 0.0-1.0")
    ap.add_argument("--blur", type=int, default=28)
    ap.add_argument("--pad-color", default="black")
    ap.add_argument("--fps", type=float, default=None, help="forcar fps de saida")
    ap.add_argument("--crf", type=int, default=18)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    src = a.src.resolve()
    if not src.exists():
        sys.exit("nao encontrado: %s" % src)
    if src == a.out.resolve():
        sys.exit("recusado: saida igual a entrada (o original nunca e sobrescrito)")

    if a.format:
        tw, th = FORMATS[a.format]
    else:
        try:
            tw, th = (int(x) for x in a.size.lower().split("x"))
        except ValueError:
            sys.exit("--size invalido, use WxH (ex: 1080x1350)")

    try:
        anchor = ANCHORS[a.anchor]
    except KeyError:
        try:
            anchor = min(1.0, max(0.0, float(a.anchor)))
        except ValueError:
            sys.exit("--anchor invalido: %s" % a.anchor)

    info = probe(src)
    if not info["w"]:
        sys.exit("sem stream de video")

    if a.mode == "crop":
        vf = crop_filter(info["w"], info["h"], tw, th, anchor)
        graph_flag = "-vf"
    elif a.mode == "blurpad":
        vf = blurpad_filter(tw, th, a.blur)
        graph_flag = "-filter_complex"
    else:
        vf = pad_filter(tw, th, a.pad_color)
        graph_flag = "-vf"

    cmd = ["ffmpeg", "-y", "-i", str(src), graph_flag, vf]
    if a.fps:
        cmd += ["-r", "%g" % a.fps]
    cmd += ["-c:v", "libx264", "-crf", str(a.crf), "-preset", "medium",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            "-c:a", "copy", str(a.out)]

    src_ar = info["w"] / info["h"]
    lost = 0.0
    if a.mode == "crop":
        lost = 1 - min(src_ar, tw / th) / max(src_ar, tw / th)

    print("origem   %dx%d (%.3f) @ %.2f fps" % (info["w"], info["h"], src_ar,
                                                info["fps"]))
    print("destino  %dx%d (%.3f)  modo=%s  anchor=%s"
          % (tw, th, tw / th, a.mode, a.anchor))
    if a.mode == "crop" and lost > 0.01:
        print("aviso    o crop descarta ~%.0f%% da imagem. Se houver informacao "
              "util nas bordas, use --mode blurpad." % (lost * 100))

    if a.dry_run:
        print("\n" + " ".join(cmd))
        return

    a.out.parent.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        # Audio "copy" fails when the source has no audio stream; retry without it.
        if "-c:a" in cmd and ("Stream map" in r.stderr or "does not contain" in r.stderr):
            cmd = [c for c in cmd if c not in ("-c:a", "copy")]
            cmd.insert(-1, "-an")
            r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            sys.exit("ffmpeg falhou:\n" + r.stderr[-2000:])
    print("ok: %s" % a.out)


if __name__ == "__main__":
    main()
