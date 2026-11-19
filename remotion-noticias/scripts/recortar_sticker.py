#!/usr/bin/env python3
"""Recorta un sticker (ilustración con borde blanco sobre fondo negro): vuelve transparente el negro
conectado a los bordes de la imagen, suaviza el alfa 1,2 px y recorta al contenido.

Uso: python3 scripts/recortar_sticker.py <entrada> <salida.png> [--sin-abajo]
  --sin-abajo: no rellena desde el borde inferior (para figuras cortadas abajo, sin contorno blanco
               en la base; si no, el relleno se come la ropa oscura).
"""
import sys
from PIL import Image, ImageFilter
import numpy as np

args = [a for a in sys.argv[1:] if not a.startswith("--")]
sin_abajo = "--sin-abajo" in sys.argv
src, dst = args[:2]
im = Image.open(src).convert("RGB")
a = np.array(im)
dark = a.max(-1) < 60
bg = np.zeros_like(dark)
bg[0] = dark[0]
bg[:, 0] = dark[:, 0]
bg[:, -1] = dark[:, -1]
if not sin_abajo:
    bg[-1] = dark[-1]
while True:  # relleno por inundación vectorizado (sin scipy)
    g = bg.copy()
    g[1:] |= bg[:-1]; g[:-1] |= bg[1:]; g[:, 1:] |= bg[:, :-1]; g[:, :-1] |= bg[:, 1:]
    g &= dark
    if (g == bg).all():
        break
    bg = g
al = np.where(bg, 0, 255).astype("uint8")
alpha = Image.fromarray(al, "L").filter(ImageFilter.GaussianBlur(1.2))
out = im.convert("RGBA")
out.putalpha(alpha)
out = out.crop(Image.fromarray(al, "L").getbbox())
out.save(dst)
print(dst, out.size, f"fondo {bg.mean():.0%}")
