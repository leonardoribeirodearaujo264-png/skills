"""Monta o ambiente do video-editor-pro em ~/.video-agent (Windows, Mac e Linux).

O que faz, nesta ordem, sem apagar nada que já exista:
  1. confere Python 3.10+ e FFmpeg/FFprobe no PATH;
  2. copia os helpers (bin/) e os modos de edição (presets/) desta pasta;
  3. cria um Python isolado em ~/.video-agent/.venv e instala as bibliotecas;
  4. baixa o video-use (browser-use/video-use, licença MIT) do GitHub e aplica
     a correção de caminho do Windows no render;
  5. escreve ~/.video-agent/env.sh, que a skill carrega no início da sessão.

Uso:  python instalar_ambiente.py          (no Mac/Linux: python3)
Rodar de novo é seguro: atualiza helpers e bibliotecas e mantém projetos,
modelos e os modos que você editou.
"""
from __future__ import annotations

import io
import os
import shutil
import subprocess
import sys
import urllib.request
import zipfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
CASA = Path(os.environ.get("VIDEO_AGENT_HOME", Path.home() / ".video-agent"))
WINDOWS = os.name == "nt"
PY_VENV = CASA / ".venv" / ("Scripts/python.exe" if WINDOWS else "bin/python")
BIBLIOTECAS = ["faster-whisper", "numpy", "pillow", "opencv-python-headless", "librosa", "matplotlib", "requests"]
VIDEO_USE_ZIP = "https://codeload.github.com/browser-use/video-use/zip/refs/heads/main"

# Correção do render do video-use no Windows: a barra invertida é escape no filtergraph do ffmpeg
TRECHO_ORIGINAL = 'subs_abs = str(subtitles_path.resolve()).replace(":", r"\\:").replace("\'", r"\\\'")'
TRECHO_CORRIGIDO = ('subs_abs = (str(subtitles_path.resolve()).replace("\\\\", "/")\n'
                    '                    .replace(":", r"\\:").replace("\'", r"\\\'"))')


def passo(texto: str) -> None:
    print(f"\n==> {texto}", flush=True)


def falha(texto: str) -> None:
    print(f"\nERRO: {texto}", flush=True)
    sys.exit(1)


def conferir_requisitos() -> None:
    passo("Conferindo Python e FFmpeg")
    if sys.version_info < (3, 10):
        falha(f"Python {sys.version.split()[0]} é antigo. Instale o Python 3.10 ou mais novo em python.org e rode de novo.")
    faltam = [p for p in ("ffmpeg", "ffprobe") if shutil.which(p) is None]
    if faltam:
        dica = "winget install Gyan.FFmpeg" if WINDOWS else ("brew install ffmpeg" if sys.platform == "darwin" else "sudo apt install ffmpeg")
        falha(f"Não achei {', '.join(faltam)} no PATH. Instale o FFmpeg ({dica}), feche e abra o terminal e rode de novo.")
    print(f"Python {sys.version.split()[0]} e FFmpeg encontrados.")


def copiar_agente() -> None:
    passo(f"Copiando helpers e modos de edição para {CASA}")
    (CASA / "projects").mkdir(parents=True, exist_ok=True)
    (CASA / "models").mkdir(parents=True, exist_ok=True)
    shutil.copytree(AQUI / "bin", CASA / "bin", dirs_exist_ok=True)
    # Modos de edição: só entram os que ainda não existem, para não desfazer o que você ajustou
    for origem in (AQUI / "presets").rglob("*.json"):
        destino = CASA / "presets" / origem.relative_to(AQUI / "presets")
        if not destino.exists():
            destino.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(origem, destino)


def criar_venv() -> None:
    passo("Criando o Python isolado e instalando as bibliotecas (pode levar alguns minutos)")
    if not PY_VENV.exists():
        subprocess.run([sys.executable, "-m", "venv", str(CASA / ".venv")], check=True)
    subprocess.run([str(PY_VENV), "-m", "pip", "install", "-q", "-U", "pip"], check=True)
    subprocess.run([str(PY_VENV), "-m", "pip", "install", "-q", "-U", *BIBLIOTECAS], check=True)


def baixar_video_use() -> None:
    passo("Baixando o video-use do GitHub (browser-use/video-use, licença MIT)")
    destino = CASA / "tools" / "video-use"
    with urllib.request.urlopen(VIDEO_USE_ZIP, timeout=120) as r:
        dados = r.read()
    with zipfile.ZipFile(io.BytesIO(dados)) as z:
        raiz = z.namelist()[0].split("/")[0]
        temp = CASA / "tools" / "_download"
        if temp.exists():
            shutil.rmtree(temp)
        z.extractall(temp)
    if destino.exists():
        shutil.rmtree(destino)
    destino.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(temp / raiz), str(destino))
    shutil.rmtree(temp, ignore_errors=True)
    render = destino / "helpers" / "render.py"
    texto = render.read_text(encoding="utf-8")
    if TRECHO_ORIGINAL in texto:
        render.write_text(texto.replace(TRECHO_ORIGINAL, TRECHO_CORRIGIDO), encoding="utf-8")
        print("Correção de caminho do Windows aplicada ao render.")
    elif TRECHO_CORRIGIDO not in texto:
        print("Aviso: o render do video-use mudou e a correção do Windows não foi aplicada. No Mac e no Linux não faz diferença.")


def escrever_env() -> None:
    passo("Escrevendo env.sh")
    casa = CASA.as_posix()
    if WINDOWS and len(casa) > 1 and casa[1] == ":":
        casa = f"/{casa[0].lower()}{casa[2:]}"  # C:/Users/x -> /c/Users/x (Git Bash do Claude Code)
    py = f"$VA_HOME/.venv/{'Scripts/python.exe' if WINDOWS else 'bin/python'}"
    (CASA / "env.sh").write_text(f"""# Ambiente do video-editor-pro. Uso:  source ~/.video-agent/env.sh
# PYTHONUTF8 não é opcional: sem ele o Python no Windows corrompe acentos entre os helpers.
export VA_HOME="{casa}"
export VA_BIN="$VA_HOME/bin"
export VA_VU="$VA_HOME/tools/video-use/helpers"
export VA_PY="{py}"
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8

# va <script> [args...]  ->  helper do agente
va() {{ "$VA_PY" "$VA_BIN/$1.py" "${{@:2}}"; }}
# vu <helper> [args...]  ->  helper do video-use
vu() {{ "$VA_PY" "$VA_VU/$1.py" "${{@:2}}"; }}
""", encoding="utf-8", newline="\n")


def testar() -> None:
    passo("Testando")
    teste = "import faster_whisper, numpy, PIL, cv2, librosa; print('bibliotecas ok')"
    subprocess.run([str(PY_VENV), "-c", teste], check=True)
    subprocess.run([str(PY_VENV), str(CASA / "bin" / "probe.py"), "--help"], check=True, stdout=subprocess.DEVNULL)
    if not (CASA / "tools" / "video-use" / "helpers" / "render.py").exists():
        falha("o video-use não ficou no lugar.")
    print("helpers ok")


def main() -> None:
    # Console do Windows em cp1252/cp850 estraga os acentos das mensagens
    for fluxo in (sys.stdout, sys.stderr):
        if hasattr(fluxo, "reconfigure"):
            fluxo.reconfigure(encoding="utf-8", errors="replace")
    conferir_requisitos()
    copiar_agente()
    criar_venv()
    baixar_video_use()
    escrever_env()
    testar()
    print(f"""
Pronto. O ambiente está em {CASA}.
O modelo de transcrição (small, cerca de 460 MB) baixa sozinho na primeira transcrição.
Feche e abra o Claude de novo e peça: "Use a skill video-editor-pro para editar o meu vídeo [CAMINHO]".""")


if __name__ == "__main__":
    main()
