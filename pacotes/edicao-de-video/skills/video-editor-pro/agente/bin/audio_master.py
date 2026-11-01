"""Voice-first audio mastering: clean, normalize, limit, and duck music.

Chain order matters and is not taste:
    highpass -> denoise -> de-esser -> compressor -> loudnorm -> limiter
Cleaning before levelling, levelling before limiting. Reversing any pair
either amplifies the noise you meant to remove or squashes the dynamics
loudnorm needs to measure.

Loudness targets (platform-published):
    -16 LUFS  vertical social (Reels / Shorts / TikTok) and general web
    -14 LUFS  YouTube
    -19 LUFS  podcast / spoken-word long form
True peak is held at -1.5 dBTP everywhere: lossy encoders overshoot on
decode, and 0 dBFS masters clip on the viewer's device, not on yours.

Usage:
    python audio_master.py <in> -o <out> [--target reels|youtube|podcast]
                           [--denoise 0..1] [--music track.mp3 --music-db -22]
                           [--video-copy] [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

TARGETS = {
    "reels":    {"I": -16, "TP": -1.5, "LRA": 11},
    "social":   {"I": -16, "TP": -1.5, "LRA": 11},
    "youtube":  {"I": -14, "TP": -1.5, "LRA": 11},
    "podcast":  {"I": -19, "TP": -1.5, "LRA": 9},
    "broadcast": {"I": -23, "TP": -1.0, "LRA": 7},
}


def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    r = subprocess.run(cmd, capture_output=True, text=True)
    if check and r.returncode != 0:
        raise RuntimeError("comando falhou: %s\n%s" % (" ".join(cmd[:6]),
                                                       r.stderr[-2000:]))
    return r


def measure(path: Path, t: dict) -> dict | None:
    """Pass 1 of loudnorm. Returns measured values, or None if ffmpeg did not
    emit them (very short or silent input) so the caller can fall back to
    single-pass."""
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(path),
         "-af", "loudnorm=I=%g:TP=%g:LRA=%g:print_format=json"
                % (t["I"], t["TP"], t["LRA"]),
         "-f", "null", "-"], capture_output=True, text=True)
    m = re.search(r"\{[^{}]*input_i[^{}]*\}", r.stderr, re.S)
    if not m:
        return None
    try:
        d = json.loads(m.group(0))
    except json.JSONDecodeError:
        return None
    # loudnorm reports -inf for digital silence; feeding that back into pass 2
    # makes ffmpeg error out, so treat it as unmeasurable.
    if any(str(d.get(k)) in ("-inf", "inf", "nan")
           for k in ("input_i", "input_tp", "input_lra", "input_thresh")):
        return None
    return d


def voice_chain(t: dict, denoise: float, measured: dict | None,
                deess: bool) -> str:
    """The full voice filter chain as one ffmpeg filter string."""
    parts = [
        # 80 Hz: below the fundamental of any speaking voice. Removes desk
        # rumble, handling noise and AC hum without touching the voice.
        "highpass=f=80",
    ]
    if denoise > 0:
        # afftdn nr is in dB of reduction; 12 dB is transparent, 24 dB starts
        # to sound underwater on a noisy room.
        parts.append("afftdn=nr=%g:nf=-45:tn=1" % (12 + 12 * min(1.0, denoise)))
    if deess:
        # 6 kHz shelf pulled down only when sibilance triggers it.
        parts.append("deesser=i=0.35:m=0.5:f=0.5:s=o")
    parts.append(
        # Gentle 3:1 above -20 dB with slow release: evens out the delivery
        # without the pumping a broadcast setting would give a single voice.
        "acompressor=threshold=-20dB:ratio=3:attack=15:release=250:makeup=2"
    )
    if measured:
        parts.append(
            "loudnorm=I=%g:TP=%g:LRA=%g:measured_I=%s:measured_TP=%s:"
            "measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true:print_format=summary"
            % (t["I"], t["TP"], t["LRA"], measured["input_i"],
               measured["input_tp"], measured["input_lra"],
               measured["input_thresh"], measured.get("target_offset", "0.0"))
        )
    else:
        parts.append("loudnorm=I=%g:TP=%g:LRA=%g" % (t["I"], t["TP"], t["LRA"]))
    parts.append("alimiter=limit=%gdB:level=false" % t["TP"])
    parts.append("aresample=48000")
    return ",".join(parts)


def build(src: Path, out: Path, t: dict, denoise: float, deess: bool,
          music: Path | None, music_db: float, duck: bool,
          video_copy: bool) -> list[str]:
    measured = measure(src, t)
    chain = voice_chain(t, denoise, measured, deess)

    cmd = ["ffmpeg", "-y", "-i", str(src)]
    if music:
        cmd += ["-stream_loop", "-1", "-i", str(music)]

    if music:
        # Music is levelled first, then ducked by the *cleaned* voice, so the
        # sidechain reacts to the final voice level rather than the raw take.
        graph = (
            "[0:a]%s,asplit=2[voice][key];"
            "[1:a]volume=%gdB,afade=t=in:st=0:d=1.5[bed];" % (chain, music_db)
        )
        if duck:
            graph += (
                # threshold/ratio tuned so the bed drops ~9 dB under speech and
                # recovers over 300 ms - fast enough to fill pauses, slow enough
                # not to breathe between words.
                "[bed][key]sidechaincompress=threshold=0.03:ratio=8:"
                "attack=20:release=300:makeup=1[ducked];"
                "[voice][ducked]amix=inputs=2:duration=first:dropout_transition=2,"
                "alimiter=limit=%gdB[aout]" % t["TP"]
            )
        else:
            graph += ("[voice][bed]amix=inputs=2:duration=first:"
                      "dropout_transition=2,alimiter=limit=%gdB[aout]" % t["TP"])
        cmd += ["-filter_complex", graph, "-map", "[aout]"]
    else:
        cmd += ["-af", chain]

    has_video = bool(subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=index", "-of", "csv=p=0", str(src)],
        capture_output=True, text=True).stdout.strip())

    if has_video and not music:
        cmd += ["-map", "0:v:0", "-map", "0:a:0"]
    elif has_video and music:
        cmd += ["-map", "0:v:0"]

    if has_video:
        cmd += ["-c:v", "copy" if video_copy else "libx264"]
        if not video_copy:
            cmd += ["-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p"]

    cmd += ["-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
    if out.suffix.lower() in (".wav",):
        cmd = [c for c in cmd if c not in ("-c:a", "aac", "-b:a", "192k")]
        cmd += ["-c:a", "pcm_s16le"]
    cmd.append(str(out))
    return cmd


def main() -> None:
    ap = argparse.ArgumentParser(description="Voice-first audio mastering")
    ap.add_argument("src", type=Path)
    ap.add_argument("-o", "--out", type=Path, required=True)
    ap.add_argument("--target", default="reels", choices=sorted(TARGETS))
    ap.add_argument("--denoise", type=float, default=0.0,
                    help="0 = off, 0.5 = moderado, 1 = agressivo")
    ap.add_argument("--deess", action="store_true")
    ap.add_argument("--music", type=Path, default=None,
                    help="trilha de fundo (o usuario deve ter os direitos)")
    ap.add_argument("--music-db", type=float, default=-22.0,
                    help="ganho da musica em dB antes do ducking (default -22)")
    ap.add_argument("--no-duck", action="store_true")
    ap.add_argument("--video-copy", action="store_true",
                    help="copiar o video sem reencodar (padrao: reencoda)")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    src = a.src.resolve()
    if not src.exists():
        sys.exit("nao encontrado: %s" % src)
    if a.music and not a.music.exists():
        sys.exit("musica nao encontrada: %s" % a.music)
    if src.resolve() == a.out.resolve():
        sys.exit("recusado: saida igual a entrada (o original nunca e sobrescrito)")

    t = TARGETS[a.target]
    a.out.parent.mkdir(parents=True, exist_ok=True)
    cmd = build(src, a.out, t, a.denoise, a.deess, a.music, a.music_db,
                not a.no_duck, a.video_copy)

    if a.dry_run:
        print(" ".join(cmd))
        return

    print("masterizando para %s (I=%g LUFS, TP=%g dBTP)..."
          % (a.target, t["I"], t["TP"]), flush=True)
    run(cmd)
    print("ok: %s" % a.out)


if __name__ == "__main__":
    main()
