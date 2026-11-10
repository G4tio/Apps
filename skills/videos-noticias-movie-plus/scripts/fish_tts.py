#!/usr/bin/env python3
"""Genera la locución con Fish Audio (voz de Movie Plus).

Uso:
  python3 fish_tts.py guion_locucion.txt voz.mp3 [--voz ID] [--modelo s1]

- El texto debe ser SOLO lo que se dice (sin claves @cue ni marcas).
- La clave NO va en el código: el proxy de la sesión la inyecta en
  api.fish.audio (se guarda una vez con request_credential). Si se ejecuta
  fuera de la nube, exporta FISH_API_KEY.
"""
import argparse, json, os, sys, urllib.request

VOZ_MOVIE_PLUS = "ad19d86e04b34fc0a6bfaddd78b35408"  # voz animada (antes: d8363f34e83d466791e2f295214c4deb)

ap = argparse.ArgumentParser()
ap.add_argument("texto")
ap.add_argument("salida")
ap.add_argument("--voz", default=VOZ_MOVIE_PLUS)
ap.add_argument("--modelo", default="s1")
a = ap.parse_args()

texto = open(a.texto, encoding="utf8").read().strip()
cuerpo = json.dumps({
    "text": texto,
    "reference_id": a.voz,
    "format": "mp3",
    "mp3_bitrate": 192,
    "normalize": True,
    "latency": "normal",
}).encode()
req = urllib.request.Request(
    "https://api.fish.audio/v1/tts", data=cuerpo, method="POST",
    headers={
        "Content-Type": "application/json",
        "model": a.modelo,
        # Valor ficticio: el proxy lo reemplaza por la clave guardada.
        "Authorization": "Bearer " + os.environ.get("FISH_API_KEY", "proxy-injected"),
    })
try:
    with urllib.request.urlopen(req, timeout=300) as r, open(a.salida, "wb") as f:
        f.write(r.read())
except urllib.error.HTTPError as e:
    sys.exit(f"Fish Audio respondió {e.code}: {e.read()[:400]!r}")
print("ok ->", a.salida)
