"""Local word-level transcription with faster-whisper.

Drop-in replacement for video-use's helpers/transcribe.py (ElevenLabs Scribe).
Writes the SAME JSON schema to <edit_dir>/transcripts/<stem>.json, so every
downstream video-use helper (pack_transcripts.py, render.py) works unchanged.

Cost: zero. Everything runs on this machine.

Schema produced:
    {"language_code", "language_probability", "text",
     "words": [{"text","start","end","type","speaker_id"}]}
    type is "word" or "spacing"; spacing entries carry the inter-word gap,
    which is what pack_transcripts.py reads to break phrases.

Usage:
    python transcribe_local.py <video> [--edit-dir DIR] [--language pt]
                               [--model small] [--audio-track 0] [--force]
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

# Nudges Whisper toward verbatim output. Whisper is trained to clean up
# disfluencies; a prompt full of them raises the odds it keeps hesitations,
# repetitions and false starts -- which is exactly the editorial signal we cut on.
VERBATIM_PROMPT = {
    "pt": "Ahn... entao, tipo assim, eh... quer dizer, nao, espera, deixa eu comecar de novo. E, e, e isso ai, ne?",
    "en": "Uh... so, like, um... I mean, no, wait, let me start over. And, and, and that is it, right?",
    "es": "Eh... entonces, o sea, este... quiero decir, no, espera, dejame empezar de nuevo.",
}


def run(cmd: list[str], **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def count_audio_tracks(video: Path) -> int:
    out = run(["ffprobe", "-v", "error", "-select_streams", "a",
               "-show_entries", "stream=index", "-of", "csv=p=0", str(video)])
    return len([ln for ln in out.stdout.splitlines() if ln.strip()])


def extract_audio(video: Path, dest: Path, track: int = 0) -> None:
    cmd = ["ffmpeg", "-y", "-i", str(video), "-map", f"0:a:{track}",
           "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(dest)]
    r = run(cmd)
    if r.returncode != 0 or not dest.exists():
        raise RuntimeError("ffmpeg audio extraction failed:\n" + r.stderr[-1500:])


def transcript_path(edit_dir: Path, video: Path, track: int = 0) -> Path:
    suffix = "" if track == 0 else ".track%d" % track
    return edit_dir / "transcripts" / (video.stem + suffix + ".json")


def to_scribe_schema(segments, info) -> dict:
    """faster-whisper segments -> ElevenLabs-Scribe-shaped dict."""
    words: list[dict] = []
    full_text: list[str] = []
    prev_end: float | None = None
    SPK = "speaker_0"  # faster-whisper does not diarize; single speaker assumed

    for seg in segments:
        seg_words = getattr(seg, "words", None) or []
        if not seg_words:
            # No word timestamps for this segment: fall back to the segment span
            # so the timeline stays continuous rather than silently losing text.
            txt = (seg.text or "").strip()
            if txt:
                if prev_end is not None and seg.start > prev_end:
                    words.append({"text": " ", "start": round(prev_end, 3),
                                  "end": round(seg.start, 3), "type": "spacing",
                                  "speaker_id": SPK})
                words.append({"text": txt, "start": round(seg.start, 3),
                              "end": round(seg.end, 3), "type": "word",
                              "speaker_id": SPK})
                full_text.append(txt)
                prev_end = seg.end
            continue

        for w in seg_words:
            txt = (w.word or "").strip()
            if not txt:
                continue
            if prev_end is not None and w.start > prev_end:
                words.append({"text": " ", "start": round(prev_end, 3),
                              "end": round(w.start, 3), "type": "spacing",
                              "speaker_id": SPK})
            words.append({"text": txt, "start": round(w.start, 3),
                          "end": round(w.end, 3), "type": "word",
                          "speaker_id": SPK,
                          "logprob": round(getattr(w, "probability", 1.0), 4)})
            full_text.append(txt)
            prev_end = w.end

    return {
        "language_code": info.language,
        "language_probability": round(info.language_probability, 4),
        "text": " ".join(full_text),
        "words": words,
        "_engine": "faster-whisper (local)",
    }


def transcribe_one(video: Path, edit_dir: Path, language: str | None = "pt",
                   model_size: str = "small", track: int = 0,
                   force: bool = False, verbose: bool = True,
                   vad: bool = True) -> Path:
    out_path = transcript_path(edit_dir, video, track)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if out_path.exists() and not force:
        if verbose:
            print("cached: %s" % out_path)
        return out_path

    from faster_whisper import WhisperModel  # imported late: heavy

    n_tracks = count_audio_tracks(video)
    if n_tracks == 0:
        raise RuntimeError("%s has no audio stream" % video.name)
    if n_tracks > 1 and verbose:
        print("  note: %d audio tracks, using track %d" % (n_tracks, track), flush=True)

    t0 = time.time()
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / (video.stem + ".wav")
        if verbose:
            print("  extracting audio from %s" % video.name, flush=True)
        extract_audio(video, wav, track)

        if verbose:
            print("  loading model '%s' (int8/CPU)" % model_size, flush=True)
        model = WhisperModel(model_size, device="cpu", compute_type="int8",
                             download_root=str(MODELS_DIR),
                             cpu_threads=max(1, (os.cpu_count() or 4)))

        if verbose:
            print("  transcribing (word-level, verbatim-biased)", flush=True)
        segments, info = model.transcribe(
            str(wav),
            language=language,
            beam_size=5,
            word_timestamps=True,
            condition_on_previous_text=False,   # stops repetition-loop drift
            initial_prompt=VERBATIM_PROMPT.get((language or "pt")[:2]),
            # VAD fora para alinhamento forcado: ele descarta os silencios e
            # devolve timestamps numa linha de tempo COMPRIMIDA. Num audio de
            # 33.1s a transcricao voltava como 25.9s, e a conferencia de
            # sincronia acusava 1.1s de desvio que nao existia.
            vad_filter=vad,
            vad_parameters=({"min_silence_duration_ms": 700,
                             "speech_pad_ms": 200} if vad else None),
            temperature=[0.0, 0.2, 0.4],
        )
        payload = to_scribe_schema(segments, info)

    out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False),
                        encoding="utf-8")
    if verbose:
        n = sum(1 for w in payload["words"] if w["type"] == "word")
        print("  saved: %s (%d words, lang=%s, %.1fs)"
              % (out_path, n, payload["language_code"], time.time() - t0))
    return out_path


def main() -> None:
    ap = argparse.ArgumentParser(description="Local word-level transcription (faster-whisper)")
    ap.add_argument("video", type=Path)
    ap.add_argument("--edit-dir", type=Path, default=None)
    ap.add_argument("--language", default="pt", help="ISO code, or 'auto' to detect")
    ap.add_argument("--model", default="small",
                    help="tiny|base|small|medium|large-v3 (default small)")
    ap.add_argument("--audio-track", type=int, default=0)
    ap.add_argument("--force", action="store_true", help="ignore cache")
    ap.add_argument("--no-vad", action="store_true",
                    help="desliga o VAD; obrigatorio para alinhamento forcado")
    a = ap.parse_args()

    video = a.video.resolve()
    if not video.exists():
        sys.exit("video not found: %s" % video)
    edit_dir = (a.edit_dir or (video.parent / "edit")).resolve()
    lang = None if a.language == "auto" else a.language

    transcribe_one(video, edit_dir, lang, a.model, a.audio_track, a.force,
                   vad=not a.no_vad)


if __name__ == "__main__":
    main()
