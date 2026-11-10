#!/usr/bin/env python3
"""Inserta silencios en la locución al inicio de cada noticia (más aire entre noticias).

Uso: python3 scripts/pausas.py <voz_entrada> <timing.json> <voz_salida.wav> [pausa_noticias=0.7] [pausa_gancho=0.35]
Necesita un timing.json de una primera alineación (para saber dónde empieza cada bloque).
Después hay que volver a transcribir y alinear la voz resultante.
"""
import json, subprocess, sys

ent, timing, sal = sys.argv[1:4]
p_not = float(sys.argv[4]) if len(sys.argv) > 4 else 0.7
p_gan = float(sys.argv[5]) if len(sys.argv) > 5 else 0.35
T = json.load(open(timing, encoding='utf8'))
cortes = []  # (segundo, pausa)
for b in T['bloques'][1:]:
    cortes.append((b['inicio'] + 0.02, p_gan if b['bloque'] == 1 else p_not))
filtros, etiquetas, prev = [], [], 0.0
for i, (t, pausa) in enumerate(cortes):
    filtros.append(f"[0:a]atrim={prev}:{t},asetpts=PTS-STARTPTS[a{i}]")
    filtros.append(f"anullsrc=r=44100:cl=mono,atrim=0:{pausa}[s{i}]")
    etiquetas += [f"[a{i}]", f"[s{i}]"]
    prev = t
filtros.append(f"[0:a]atrim=start={prev},asetpts=PTS-STARTPTS[fin]")
etiquetas.append("[fin]")
filtros.append(''.join(etiquetas) + f"concat=n={len(etiquetas)}:v=0:a=1[o]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', ent, '-filter_complex', ';'.join(filtros),
                '-map', '[o]', '-ar', '44100', '-ac', '1', sal], check=True)
print(f'{len(cortes)} pausas insertadas -> {sal}')
