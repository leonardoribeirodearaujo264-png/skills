"""Quality control on a rendered video, before it is delivered.

Runs the checks that catch the failures a human editor would be embarrassed
by and that are invisible in a scrubbing preview: black frames left by a bad
concat, accidental freezes, clipped audio, silence at the head or tail,
wrong resolution or fps for the target platform.

Every check reports OK / AVISO / FALHA. FALHA means do not ship.

Usage:
    python qc.py <video> [--expect-duration 42.0] [--format reels]
                 [--srt master.srt] [--json out.json]
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from fractions import Fraction
from pathlib import Path

FORMATS = {
    "reels": (1080, 1920), "shorts": (1080, 1920), "tiktok": (1080, 1920),
    "youtube": (1920, 1080), "feed": (1080, 1350), "square": (1080, 1080),
}

OK, WARN, FAIL = "OK", "AVISO", "FALHA"


class Report:
    def __init__(self) -> None:
        self.rows: list[tuple[str, str, str]] = []

    def add(self, level: str, check: str, detail: str) -> None:
        self.rows.append((level, check, detail))

    @property
    def failures(self) -> int:
        return sum(1 for lv, _, _ in self.rows if lv == FAIL)

    @property
    def warnings(self) -> int:
        return sum(1 for lv, _, _ in self.rows if lv == WARN)


def ff(args: list[str]) -> str:
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostats", *args],
                          capture_output=True, text=True).stderr


def probe(path: Path) -> dict:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_format",
                        "-show_streams", "-of", "json", str(path)],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError("ffprobe falhou:\n" + r.stderr[-1000:])
    return json.loads(r.stdout)


def num(s, default=0.0) -> float:
    try:
        return float(s)
    except (TypeError, ValueError):
        return default


def check_container(rep: Report, data: dict, fmt: str | None,
                    expect_dur: float | None) -> float:
    f = data.get("format") or {}
    streams = data.get("streams") or []
    v = next((s for s in streams if s.get("codec_type") == "video"), None)
    a = next((s for s in streams if s.get("codec_type") == "audio"), None)
    dur = num(f.get("duration"))

    if not v:
        rep.add(FAIL, "video", "arquivo sem stream de video")
        return dur
    if not a:
        rep.add(WARN, "audio", "arquivo sem stream de audio")

    codec = v.get("codec_name")
    rep.add(OK if codec == "h264" else WARN, "codec de video",
            "%s (esperado h264 para compatibilidade maxima)" % codec)
    if a:
        ac = a.get("codec_name")
        rep.add(OK if ac == "aac" else WARN, "codec de audio",
                "%s (esperado aac)" % ac)
    pix = v.get("pix_fmt")
    rep.add(OK if pix == "yuv420p" else FAIL, "pix_fmt",
            "%s%s" % (pix, "" if pix == "yuv420p"
                      else " - players moveis nao decodificam; use yuv420p"))

    w, h = int(v.get("width", 0)), int(v.get("height", 0))
    try:
        fps = float(Fraction(v.get("r_frame_rate", "0/1")))
    except (ZeroDivisionError, ValueError):
        fps = 0.0
    rep.add(OK, "resolucao", "%dx%d (%.4f)" % (w, h, w / h if h else 0))
    rep.add(OK if fps >= 23.9 else WARN, "fps", "%.3f" % fps)

    if w % 2 or h % 2:
        rep.add(FAIL, "dimensoes pares", "%dx%d - h264 exige largura e altura pares" % (w, h))

    if fmt:
        tw, th = FORMATS[fmt]
        if (w, h) == (tw, th):
            rep.add(OK, "formato %s" % fmt, "%dx%d exato" % (w, h))
        elif abs((w / h) - (tw / th)) < 0.01:
            rep.add(WARN, "formato %s" % fmt,
                    "proporcao certa mas resolucao %dx%d (esperado %dx%d)"
                    % (w, h, tw, th))
        else:
            rep.add(FAIL, "formato %s" % fmt,
                    "proporcao %.4f nao bate com %.4f (%dx%d)"
                    % (w / h, tw / th, tw, th))

    if expect_dur is not None:
        delta = abs(dur - expect_dur)
        rep.add(OK if delta <= 0.5 else FAIL, "duracao",
                "%.2fs (esperado %.2fs, delta %.2fs)" % (dur, expect_dur, delta))
    else:
        rep.add(OK, "duracao", "%.2fs" % dur)

    if not f.get("format_name", "").startswith("mov,mp4"):
        rep.add(WARN, "container", f.get("format_name"))
    return dur


def check_black(rep: Report, path: Path, dur: float) -> None:
    out = ff(["-i", str(path), "-vf", "blackdetect=d=0.15:pix_th=0.10",
              "-an", "-f", "null", "-"])
    hits = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", out)
    spans = [(float(s), float(e)) for s, e in hits]
    # A fade to black at the very end is intentional, not a defect.
    mid = [(s, e) for s, e in spans if e < dur - 0.5 and s > 0.3]
    if not spans:
        rep.add(OK, "frames pretos", "nenhum")
    elif not mid:
        rep.add(OK, "frames pretos", "%d, apenas nas pontas (fade)" % len(spans))
    else:
        rep.add(FAIL, "frames pretos",
                "%d no meio do video: %s"
                % (len(mid), ", ".join("%.2f-%.2fs" % s for s in mid[:5])))


def check_freeze(rep: Report, path: Path, dur: float) -> None:
    out = ff(["-i", str(path), "-vf", "freezedetect=n=-58dB:d=1.0",
              "-an", "-f", "null", "-"])
    starts = [float(x) for x in
              re.findall(r"freeze_start: ([\d.]+)", out)]
    mid = [s for s in starts if s < dur - 1.2]
    if not mid:
        rep.add(OK, "frames congelados", "nenhum acidental")
    else:
        rep.add(WARN, "frames congelados",
                "%d trecho(s) parado(s) >=1s em %s - confirme se e intencional"
                % (len(mid), ", ".join("%.2fs" % s for s in mid[:5])))


def check_audio(rep: Report, path: Path, dur: float, has_audio: bool) -> None:
    if not has_audio:
        return
    out = ff(["-i", str(path), "-af", "astats=metadata=1:reset=0",
              "-f", "null", "-"])

    def grab(label: str):
        m = re.findall(r"%s:\s*(-?[\d.]+|-inf)" % re.escape(label), out)
        if not m:
            return None
        return float("-inf") if m[-1] == "-inf" else float(m[-1])

    peak = grab("Peak level dB")
    flat = grab("Flat factor")
    if peak is None:
        rep.add(WARN, "niveis de audio", "nao medidos")
    elif peak >= -0.1:
        rep.add(FAIL, "clipping", "pico em %.2f dBFS - audio estourado" % peak)
    elif peak > -1.0:
        rep.add(WARN, "clipping", "pico em %.2f dBFS - margem apertada, "
                                  "limite em -1.5 dBTP" % peak)
    else:
        rep.add(OK, "clipping", "pico em %.2f dBFS" % peak)
    if flat is not None and flat > 1.0:
        rep.add(WARN, "distorcao", "flat factor %.2f - amostras saturadas" % flat)

    ln = ff(["-i", str(path),
             "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
             "-f", "null", "-"])
    m = re.search(r'"input_i"\s*:\s*"(-?[\d.]+|-inf)"', ln)
    if m and m.group(1) != "-inf":
        i = float(m.group(1))
        lvl = OK if -20 <= i <= -12 else WARN
        rep.add(lvl, "loudness", "%.1f LUFS%s"
                % (i, "" if lvl == OK else " - fora da faixa util -20..-12"))

    # Silence at the head or tail reads as a broken file to a viewer who
    # taps play and hears nothing.
    sil = ff(["-i", str(path), "-af", "silencedetect=noise=-45dB:d=0.4",
              "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", sil)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", sil)]
    head = ends[0] if starts and starts[0] <= 0.05 and ends else 0.0
    if head > 0.7:
        rep.add(WARN, "silencio inicial", "%.2fs de silencio no comeco - "
                                          "corte, o gancho perde forca" % head)
    else:
        rep.add(OK, "silencio inicial", "%.2fs" % head)
    tail = dur - starts[-1] if starts and (len(starts) > len(ends)) else 0.0
    if tail > 1.2:
        rep.add(WARN, "silencio final", "%.2fs de silencio no fim" % tail)


def check_srt(rep: Report, srt: Path, dur: float) -> None:
    if not srt.exists():
        rep.add(FAIL, "legendas", "arquivo nao encontrado: %s" % srt)
        return
    text = srt.read_text(encoding="utf-8", errors="replace")
    times = re.findall(
        r"(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})",
        text)
    if not times:
        rep.add(FAIL, "legendas", "SRT sem blocos de tempo validos")
        return

    def secs(h, m, s, ms):
        return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000

    spans = [(secs(*t[:4]), secs(*t[4:])) for t in times]
    over = [e for _, e in spans if e > dur + 0.5]
    neg = [(s, e) for s, e in spans if e <= s]
    overlap = sum(1 for i in range(len(spans) - 1)
                  if spans[i + 1][0] < spans[i][1] - 0.001)
    rep.add(OK, "legendas", "%d blocos, %.2fs a %.2fs"
            % (len(spans), spans[0][0], spans[-1][1]))
    if over:
        rep.add(FAIL, "sincronia das legendas",
                "%d bloco(s) alem do fim do video (%.2fs)" % (len(over), dur))
    if neg:
        rep.add(FAIL, "sincronia das legendas",
                "%d bloco(s) com duracao zero ou negativa" % len(neg))
    if overlap:
        rep.add(WARN, "sincronia das legendas",
                "%d bloco(s) sobrepostos" % overlap)
    if spans[0][0] > 3.0:
        rep.add(WARN, "legendas", "primeira legenda so em %.2fs" % spans[0][0])

    blocks = [b for b in re.split(r"\n\s*\n", text.strip()) if b.strip()]
    longs = []
    for b in blocks:
        lines = [ln for ln in b.splitlines()[2:] if ln.strip()]
        for ln in lines:
            if len(ln) > 42:
                longs.append(ln[:38] + "...")
    if longs:
        rep.add(WARN, "quebra de linha",
                "%d linha(s) com mais de 42 caracteres, ex: %s"
                % (len(longs), longs[0]))


def main() -> None:
    ap = argparse.ArgumentParser(description="Controle de qualidade do render")
    ap.add_argument("video", type=Path)
    ap.add_argument("--expect-duration", type=float, default=None)
    ap.add_argument("--format", choices=sorted(FORMATS), default=None)
    ap.add_argument("--srt", type=Path, default=None)
    ap.add_argument("--json", type=Path, default=None)
    a = ap.parse_args()

    path = a.video.resolve()
    if not path.exists():
        sys.exit("nao encontrado: %s" % path)

    rep = Report()
    data = probe(path)
    has_audio = any(s.get("codec_type") == "audio"
                    for s in data.get("streams") or [])
    print("QC: %s\n" % path.name, flush=True)
    dur = check_container(rep, data, a.format, a.expect_duration)
    check_black(rep, path, dur)
    check_freeze(rep, path, dur)
    check_audio(rep, path, dur, has_audio)
    if a.srt:
        check_srt(rep, a.srt, dur)

    width = max(len(c) for _, c, _ in rep.rows)
    for lv, check, detail in rep.rows:
        print("[%-5s] %-*s  %s" % (lv, width, check, detail))

    print("\n%d verificacoes | %d falhas | %d avisos"
          % (len(rep.rows), rep.failures, rep.warnings))
    if a.json:
        a.json.parent.mkdir(parents=True, exist_ok=True)
        a.json.write_text(json.dumps(
            {"file": str(path), "duration_s": dur,
             "checks": [{"level": lv, "check": c, "detail": d}
                        for lv, c, d in rep.rows],
             "failures": rep.failures, "warnings": rep.warnings},
            indent=2, ensure_ascii=False), encoding="utf-8")
        print("salvo: %s" % a.json)

    if rep.failures:
        print("\nNAO ENTREGAR: corrija as falhas e renderize de novo.")
        sys.exit(1)


if __name__ == "__main__":
    main()
