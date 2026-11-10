#!/usr/bin/env bash
# Prepara la voz que trae el usuario y sincroniza todo el video.
# Uso: bash scripts/preparar_audio.sh <voz.mp3|mp4> <carpeta_voz_con_locucion.txt> <pantalla.json> <carpeta_modelo_asr>
set -euo pipefail
VOZ_IN="$1"; CARPETA="$2"; PLAN="$3"; ASR="$4"
cd "$(dirname "$0")/.."
mkdir -p public/audio
# recorta silencio inicial y final, normaliza a -16 LUFS
ffmpeg -v error -y -i "$VOZ_IN" -af "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 44100 -ac 2 public/audio/voz.wav
ffmpeg -v error -y -i public/audio/voz.wav -ar 16000 -ac 1 "$CARPETA/voz16k.wav"
python3 scripts/transcribir.py "$CARPETA/voz16k.wav" "$ASR" > "$CARPETA/palabras_asr.json" 2> "$CARPETA/oido_texto.txt"
python3 scripts/sincronizar.py "$CARPETA" "$PLAN"
# duración de la parte con música (del resumen al final de FUENTES)
FIN=$(node -e '
const fs=require("fs");const t=fs.readFileSync("src/timing.ts","utf8");
const B=JSON.parse(t.match(/BLOQUES: [^=]+= (.*);/)[1]);const FV=+t.match(/FIN_VOZ = ([\d.]+)/)[1];
const vf=x=>96+Math.round(x*30);const rec=vf(B[7].inicio);const RECAP=Math.max(210,vf(FV)-rec+36);
console.log(((rec+RECAP+156)/30).toFixed(3));')
python3 scripts/musica.py public/audio/voz.wav "$FIN" public/audio/musica.wav
echo "listo: voz y música en public/audio, src/timing.ts actualizado"
