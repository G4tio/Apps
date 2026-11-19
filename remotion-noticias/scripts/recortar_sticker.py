#!/usr/bin/env python3
"""Recorta un sticker (dibujo con borde blanco sobre fondo negro): quita el negro conectado a los bordes.
Uso: python3 scripts/recortar_sticker.py <entrada> <salida.png>"""
import sys
from PIL import Image, ImageFilter
import numpy as np
src, dst = sys.argv[1:3]
im=Image.open(src).convert("RGB"); a=np.array(im)
dark=a.max(-1)<60
bg=np.zeros_like(dark); bg[0]=dark[0]; bg[-1]=dark[-1]; bg[:,0]=dark[:,0]; bg[:,-1]=dark[:,-1]
while True:
    g=bg.copy(); g[1:]|=bg[:-1]; g[:-1]|=bg[1:]; g[:,1:]|=bg[:,:-1]; g[:,:-1]|=bg[:,1:]; g&=dark
    if (g==bg).all(): break
    bg=g
al=np.where(bg,0,255).astype('uint8')
alpha=Image.fromarray(al,'L').filter(ImageFilter.GaussianBlur(1.2))
out=im.convert("RGBA"); out.putalpha(alpha); out=out.crop(Image.fromarray(al,'L').getbbox())
out.save(dst); print(dst, out.size, round(bg.mean(),2))
