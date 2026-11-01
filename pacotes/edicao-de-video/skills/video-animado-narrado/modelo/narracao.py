"""Narração do vídeo + tempo de cada palavra.

Cada fala tem: a cena (nome curto), o texto exibido na legenda e, se precisar, o texto falado
(grafia fonética para corrigir a pronúncia, com o MESMO número de palavras do exibido).
Saída nesta pasta: vo.wav, falas.json (início e fim de cada fala) e palavras.json (tempo de cada palavra exibida).

Uso, nesta ordem e uma vez cada:
  python narracao.py eleven       narra pela ElevenLabs (PAGA: confirme com o usuário antes)
  python narracao.py compactar    encurta pausas longas
  python narracao.py acelerar     acelera 10% sem mudar o tom
Sem ElevenLabs: grave a narração você mesmo como vo.wav e rode `python narracao.py alinhar`.

A chave fica só na variável de ambiente ELEVENLABS_API_KEY. Nunca escreva a chave em arquivo do projeto.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

AQUI = Path(__file__).parent
SR = 24000
LEAD, GAP = 0.25, 0.18  # silêncio no começo e entre falas, em segundos

# Troque pelo seu roteiro. A última fala é o pedido de comentário ("Comenta PALAVRA ...").
# (cena, exibido, falado ou None)
FALAS = [
    ("abertura", "Você ainda edita vídeo arrastando pedaço por pedaço?", None),
    ("virada", "Agora você só pede, e o vídeo sai pronto.", None),
    ("cta", "Comenta VIDEO que eu te mando o passo a passo.", "Comenta vídeo que eu te mando o passo a passo."),
]

# Voz da ElevenLabs: troque pelo ID da voz escolhida (aparece na biblioteca de vozes da ElevenLabs)
VOZ = os.environ.get("ELEVENLABS_VOICE_ID", "")
MODELO = "eleven_multilingual_v2"
VELOCIDADE = 1.05


def _salvar(falas, palavras, total, vo):
    import numpy as np
    import soundfile as sf

    vo = np.concatenate([vo, np.zeros(max(0, int(total * SR) - len(vo)), np.float32)])
    sf.write(str(AQUI / "vo.wav"), vo, SR)
    json.dump({"total": round(total, 3), "falas": falas}, open(AQUI / "falas.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if palavras is not None:
        json.dump(palavras, open(AQUI / "palavras.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)


def eleven():
    """Uma chamada por fala no endpoint with-timestamps: o tempo de cada palavra vem da própria API, sem transcrição."""
    import base64
    import urllib.error
    import urllib.request

    import numpy as np

    chave = os.environ.get("ELEVENLABS_API_KEY")
    if not chave or not VOZ:
        sys.exit("Defina ELEVENLABS_API_KEY e ELEVENLABS_VOICE_ID no ambiente antes de narrar.")
    partes, t, falas, palavras = [np.zeros(int(LEAD * SR), np.float32)], LEAD, [], []
    for i, (cena, exib, fal) in enumerate(FALAS):
        fal = fal or exib
        if len(fal.split()) != len(exib.split()):
            sys.exit(f"fala {cena}: o texto falado e o exibido precisam ter o mesmo número de palavras")
        corpo = {"text": fal, "model_id": MODELO, "language_code": "pt",
                 "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.3, "speed": VELOCIDADE}}
        if i:
            corpo["previous_text"] = FALAS[i - 1][1]
        if i + 1 < len(FALAS):
            corpo["next_text"] = FALAS[i + 1][1]
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOZ}/with-timestamps?output_format=pcm_{SR}",
            data=json.dumps(corpo).encode(), headers={"xi-api-key": chave, "Content-Type": "application/json"})
        try:
            r = json.load(urllib.request.urlopen(req, timeout=120))
        except urllib.error.HTTPError as e:
            sys.exit(f"ElevenLabs {e.code} na fala {cena}: {e.read().decode()[:300]}")
        a = np.frombuffer(base64.b64decode(r["audio_base64"]), np.int16).astype(np.float32) / 32768
        chars, ini = r["alignment"]["characters"], r["alignment"]["character_start_times_seconds"]
        k = 0
        for w, wf in zip(exib.split(), fal.split()):  # anda pelo texto falado e grava a palavra exibida
            while chars[k].isspace():
                k += 1
            palavras.append({"fala": i, "texto": w, "t": round(t + ini[k], 3)})
            k += len(wf)
        falas.append({"i": i, "cena": cena, "texto": exib, "inicio": round(t, 3), "fim": round(t + len(a) / SR, 3)})
        partes += [a, np.zeros(int(GAP * SR), np.float32)]
        t += len(a) / SR + GAP
        print(f"{cena}: {len(a) / SR:.2f} s")
    _salvar(falas, palavras, t + 1.2, np.concatenate(partes))
    print(f"total {t + 1.2:.2f} s, {len(palavras)} palavras")


def alinhar(modelo: str = "small"):
    """Para narração gravada (vo.wav pronto): transcreve com faster-whisper e distribui as falas e palavras.
    As falas são procuradas em ordem; palavras sem par recebem tempo proporcional dentro da fala."""
    import difflib

    import numpy as np
    import soundfile as sf
    from faster_whisper import WhisperModel

    audio, sr = sf.read(str(AQUI / "vo.wav"), dtype="float32", always_2d=True)
    a16 = np.interp(np.arange(int(len(audio) * 16000 / sr)) / 16000, np.arange(len(audio)) / sr, audio.mean(1)).astype(np.float32)
    segs, _ = WhisperModel(modelo, device="cpu", compute_type="int8").transcribe(a16, language="pt", word_timestamps=True, vad_filter=True)
    ditas = [w for s in segs for w in s.words]
    norm = lambda x: re.sub(r"[^\w]", "", x.lower())
    exibidas = [(i, w) for i, (_, exib, _) in enumerate(FALAS) for w in exib.split()]
    sm = difflib.SequenceMatcher(a=[norm(w) for _, w in exibidas], b=[norm(d.word) for d in ditas], autojunk=False)
    tempos = [None] * len(exibidas)
    for b in sm.get_matching_blocks():
        for k in range(b.size):
            tempos[b.a + k] = ditas[b.b + k].start
    total = len(audio) / sr
    conhecidos = [(-1, 0.0)] + [(i, x) for i, x in enumerate(tempos) if x is not None] + [(len(tempos), total)]
    for (i0, t0), (i1, t1) in zip(conhecidos, conhecidos[1:]):
        for j in range(i0 + 1, i1):
            tempos[j] = t0 + (t1 - t0) * (j - i0) / (i1 - i0)
    palavras = [{"fala": i, "texto": w, "t": round(tempos[j], 3)} for j, (i, w) in enumerate(exibidas)]
    falas = []
    for i, (cena, exib, _) in enumerate(FALAS):
        ts = [p["t"] for p in palavras if p["fala"] == i]
        prox = [p["t"] for p in palavras if p["fala"] == i + 1]
        falas.append({"i": i, "cena": cena, "texto": exib, "inicio": ts[0], "fim": round(prox[0] - 0.05 if prox else total, 3)})
    json.dump({"total": round(total, 3), "falas": falas}, open(AQUI / "falas.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump(palavras, open(AQUI / "palavras.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print("transcrição:", " ".join(d.word.strip() for d in ditas))


def compactar(max_pausa: float = 0.3, limiar_db: float = -40.0):
    """Encurta pausas maiores que `max_pausa` e remapeia os tempos. Corta só silêncio."""
    import numpy as np
    import soundfile as sf

    vo, sr = sf.read(str(AQUI / "vo.wav"), dtype="float32")
    jan = int(0.01 * sr)
    n = len(vo) // jan
    db = 20 * np.log10(np.sqrt(np.mean(vo[: n * jan].reshape(n, jan) ** 2, 1)) + 1e-9)
    mudo = db < limiar_db
    cortes, i = [], 0  # (início_s, duração_removida_s)
    while i < n:
        if mudo[i]:
            j = i
            while j < n and mudo[j]:
                j += 1
            dur = (j - i) * 0.01
            if dur > max_pausa and i > 0 and j < n:  # mantém a abertura e o respiro final
                cortes.append((i * 0.01 + max_pausa / 2, dur - max_pausa))
            i = j
        else:
            i += 1

    def remap(t: float) -> float:  # tempo dentro de um trecho removido cai no ponto do corte
        return t - sum(min(d, max(0.0, t - c)) for c, d in cortes)

    partes, ant = [], 0
    for c, d in cortes:
        partes.append(vo[ant:int(c * sr)])
        ant = int((c + d) * sr)
    partes.append(vo[ant:])
    sf.write(str(AQUI / "vo.wav"), np.concatenate(partes), sr)
    _remapear(remap, lambda total: total - sum(d for _, d in cortes))
    print(f"{len(cortes)} pausas encurtadas, -{sum(d for _, d in cortes):.2f} s")


def acelerar(fator: float = 1.1):
    """Acelera com atempo do ffmpeg (o tom não muda) e divide todos os tempos pelo mesmo fator."""
    tmp = AQUI / "vo_tmp.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(AQUI / "vo.wav"), "-af", f"atempo={fator}", str(tmp)], check=True)
    tmp.replace(AQUI / "vo.wav")
    _remapear(lambda t: t / fator, lambda total: total / fator)
    print(f"x{fator}")


def _remapear(f_tempo, f_total):
    F = json.load(open(AQUI / "falas.json", encoding="utf-8"))
    for fala in F["falas"]:
        fala["inicio"], fala["fim"] = round(f_tempo(fala["inicio"]), 3), round(f_tempo(fala["fim"]), 3)
    F["total"] = round(f_total(F["total"]), 3)
    P = json.load(open(AQUI / "palavras.json", encoding="utf-8"))
    for w in P:
        w["t"] = round(f_tempo(w["t"]), 3)
    json.dump(F, open(AQUI / "falas.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump(P, open(AQUI / "palavras.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"total {F['total']:.2f} s")


if __name__ == "__main__":
    comandos = {"eleven": eleven, "alinhar": alinhar, "compactar": compactar, "acelerar": acelerar}
    if len(sys.argv) < 2 or sys.argv[1] not in comandos:
        sys.exit("uso: python narracao.py eleven|alinhar|compactar|acelerar")
    comandos[sys.argv[1]]()
