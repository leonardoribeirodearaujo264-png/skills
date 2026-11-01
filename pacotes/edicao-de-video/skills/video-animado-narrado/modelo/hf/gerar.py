"""Gera hf/index.html a partir do template, da narração (../falas.json, ../palavras.json) e das cenas.

Cada cena começa no início de uma fala ou numa palavra dela. Rode de dentro da pasta hf/: python gerar.py
"""
import json
import re
import sys
from pathlib import Path

A = Path(__file__).resolve().parents[1]
# (id da cena, fala, palavra que abre a cena ou None = começo da fala, fundo: escuro ou claro)
CENAS = [
    ("c1", "abertura", None, "escuro"),
    ("c2", "virada", None, "claro"),
    ("c3", "cta", None, "escuro"),
]


def ancoras():
    F = json.load(open(A / "falas.json", encoding="utf-8"))
    P = json.load(open(A / "palavras.json", encoding="utf-8"))
    fala = {f["cena"]: f for f in F["falas"]}
    norm = lambda x: re.sub(r"[^\w-]", "", x.lower())
    saida = []
    for i, (cid, cena, palavra, fundo) in enumerate(CENAS):
        if cena not in fala:
            sys.exit(f"cena {cid}: a fala '{cena}' não existe em falas.json")
        f = fala[cena]
        if palavra is None:
            t = 0.0 if i == 0 else max(0.0, f["inicio"] - 0.12)
        else:
            achou = [w["t"] for w in P if w["fala"] == f["i"] and norm(w["texto"]).startswith(palavra)]
            if not achou:
                sys.exit(f"cena {cid}: a palavra '{palavra}' não existe na fala '{cena}'")
            t = achou[0] - 0.12
        saida.append({"id": cid, "t": round(t, 3), "fundo": fundo})
    return F, P, saida


if __name__ == "__main__":
    F, P, C = ancoras()
    h = Path("template.html.tpl").read_text(encoding="utf-8")
    for k, v in {"__FALAS__": json.dumps(F["falas"], ensure_ascii=False), "__PALAVRAS__": json.dumps(P, ensure_ascii=False),
                 "__CENAS__": json.dumps(C, ensure_ascii=False), "__DURACAO__": f"{F['total']:.3f}"}.items():
        h = h.replace(k, v)
    Path("index.html").write_text(h, encoding="utf-8")
    print("ok", F["total"], "s,", len(C), "cenas")
