"""Efeitos sonoros gerados no computador (síntese procedural): whoosh, pop, click e impacto.

Grátis, offline, sem licença de terceiros e sempre iguais (semente fixa). Precisa de numpy, scipy e soundfile.
"""
from pathlib import Path

import numpy as np

SR = 48000

SONS = {
    "whoosh": {"duracao_s": 0.38, "f0": 400, "f1": 4500, "q": 1.4, "ataque": 0.6, "pan": 0.6},
    "pop": {"duracao_s": 0.09, "f0": 1200, "f1": 420, "queda_tom_s": 0.012, "decaimento_s": 0.025},
    "click": {"duracao_s": 0.05, "passa_alta_hz": 2500, "tom_hz": 2200, "decaimento_s": 0.012},
    "impacto": {"duracao_s": 0.7, "f0": 110, "f1": 45, "decaimento_s": 0.3},
}


def _env(n, ataque, total):
    t = np.linspace(0, 1, n, endpoint=False)
    return np.clip(t / max(ataque, 1e-3), 0, 1) ** 2 * np.exp(-np.clip(t - ataque, 0, None) / max(1e-3, (1 - ataque) / total))


def _varredura(x, f0, f1, q, blocos=96):
    """Passa-banda que varre de f0 a f1, em blocos com estado contínuo."""
    import scipy.signal as ss

    out, zi = np.zeros_like(x), None
    bordas = np.linspace(0, len(x), blocos + 1).astype(int)
    for i, (a, b) in enumerate(zip(bordas[:-1], bordas[1:])):
        fc = f0 * (f1 / f0) ** (i / max(1, blocos - 1))
        sos = ss.butter(2, [max(20.0, fc - fc / q / 2), min(SR / 2 - 100, fc + fc / q / 2)], btype="band", fs=SR, output="sos")
        if zi is None:
            zi = ss.sosfilt_zi(sos) * 0
        out[a:b], zi = ss.sosfilt(sos, x[a:b], zi=zi)
    return out


def _whoosh(p, rnd):
    n = int(p["duracao_s"] * SR)
    y = _varredura(rnd.standard_normal(n), p["f0"], p["f1"], p["q"]) * _env(n, p["ataque"], 6)
    pan = np.linspace(-p["pan"], p["pan"], n)
    return np.stack([y * np.sqrt((1 - pan) / 2), y * np.sqrt((1 + pan) / 2)], axis=1)


def _pop(p, rnd):
    n = int(p["duracao_s"] * SR)
    t = np.arange(n) / SR
    f = p["f1"] + (p["f0"] - p["f1"]) * np.exp(-t / p["queda_tom_s"])
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / p["decaimento_s"]) + 0.15 * rnd.standard_normal(n) * np.exp(-t / 0.002)
    return np.stack([y, y], axis=1)


def _click(p, rnd):
    import scipy.signal as ss

    n = int(p["duracao_s"] * SR)
    t = np.arange(n) / SR
    r = ss.sosfilt(ss.butter(2, p["passa_alta_hz"], btype="high", fs=SR, output="sos"), rnd.standard_normal(n))
    y = r * np.exp(-t / 0.003) + 0.5 * np.sin(2 * np.pi * p["tom_hz"] * t) * np.exp(-t / p["decaimento_s"])
    return np.stack([y, y], axis=1)


def _impacto(p, rnd):
    import scipy.signal as ss

    n = int(p["duracao_s"] * SR)
    t = np.arange(n) / SR
    f = p["f1"] + (p["f0"] - p["f1"]) * np.exp(-t / 0.08)
    grave = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / p["decaimento_s"])
    corpo = ss.sosfilt(ss.butter(2, 900, btype="low", fs=SR, output="sos"), rnd.standard_normal(n)) * np.exp(-t / 0.05)
    y = grave + 0.6 * corpo / (np.abs(corpo).max() + 1e-9)
    return np.stack([y, y], axis=1)


_GERADORES = {"whoosh": _whoosh, "pop": _pop, "click": _click, "impacto": _impacto}


def som(nome: str) -> np.ndarray:
    """Um efeito estéreo com pico em -1 dBFS e fade-out de 10 ms (sem estalo no fim)."""
    y = _GERADORES[nome](SONS[nome], np.random.default_rng(7))
    f = min(len(y) // 4, int(0.01 * SR))
    y[-f:] *= np.linspace(1, 0, f)[:, None]
    return (y / (np.abs(y).max() + 1e-9) * 10 ** (-1 / 20)).astype(np.float32)


def faixa(eventos: list, duracao: float, ref_voz_db: float, intervalo_min_s: float = 0.12) -> np.ndarray:
    """Faixa estéreo com um som por evento {t, som, nivel_db}; o nível é relativo ao volume da voz."""
    total = np.zeros((int(duracao * SR) + SR, 2), np.float32)
    cache, ultimo = {}, -99.0
    for ev in sorted(eventos, key=lambda e: e["t"]):
        if ev["t"] - ultimo < intervalo_min_s:
            continue
        y = cache.setdefault(ev["som"], som(ev["som"]))
        alvo = 10 ** ((ref_voz_db + ev["nivel_db"]) / 20)
        a = int(max(0.0, ev["t"]) * SR)
        b = min(len(total), a + len(y))
        total[a:b] += y[: b - a] * (alvo / (float(np.sqrt(np.mean(y ** 2))) + 1e-9))
        ultimo = ev["t"]
    return total[: int(duracao * SR)]


if __name__ == "__main__":  # gera os 4 efeitos em wav para ouvir
    import soundfile as sf

    pasta = Path(__file__).parent / "sfx"
    pasta.mkdir(exist_ok=True)
    for nome in SONS:
        sf.write(str(pasta / f"{nome}.wav"), som(nome), SR, subtype="PCM_16")
    print("efeitos em", pasta)
