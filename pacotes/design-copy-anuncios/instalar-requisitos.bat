@echo off
rem Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão.
rem Dois cliques: instala o app do Claude e os programas que o pacote precisa.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar-requisitos.ps1"
echo.
pause
