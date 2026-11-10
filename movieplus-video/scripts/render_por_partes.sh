#!/usr/bin/env bash
# Renderiza MoviePlusNews en tramos (si uno falla, se reintenta solo ese) y une con la mezcla.
# Uso: bash scripts/render_por_partes.sh <total_cuadros> <mezcla.wav> <salida.mp4>
set -u
TOTAL=$1; MEZCLA=$2; SALIDA=$3; TRAMO=460
mkdir -p out/partes; : > out/partes/lista.txt
for ((a=0; a<TOTAL; a+=TRAMO)); do
  b=$(( a+TRAMO-1 < TOTAL-1 ? a+TRAMO-1 : TOTAL-1 ))
  f=out/partes/p_$(printf %05d $a).mp4
  for intento in 1 2 3; do
    [ -s "$f" ] && break
    conc=$([ $intento -eq 1 ] && echo 3 || echo 1)  # si falla, reintenta con una sola pestaña
    echo "tramo $a-$b (intento $intento, concurrencia $conc)"
    npx remotion render MoviePlusNews "$f" --frames=$a-$b --muted --codec=h264 --crf=17 \
      --concurrency=$conc --timeout=180000 --browser-executable=/opt/pw-browsers/chromium --log=error || rm -f "$f"
  done
  [ -s "$f" ] || { echo "FALLÓ tramo $a-$b"; exit 1; }
  echo "file '$(basename $f)'" >> out/partes/lista.txt
done
ffmpeg -v error -y -f concat -safe 0 -i out/partes/lista.txt -i "$MEZCLA" -map 0:v -map 1:a \
  -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -color_range tv -c:a aac -b:a 192k \
  -shortest -movflags +faststart "$SALIDA"
echo "LISTO $SALIDA"
