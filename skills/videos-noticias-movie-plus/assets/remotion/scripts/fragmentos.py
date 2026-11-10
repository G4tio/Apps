#!/usr/bin/env python3
"""Prepara cada fragmento de tráiler con la duración exacta de su espacio en el montaje.

Uso: python3 scripts/fragmentos.py <timing.json>
- Recorta [desde, hasta] del tráiler (ya sin audio).
- Si el espacio es más largo que el fragmento, lo ralentiza hasta ×0,6 y, si aún falta,
  congela el último cuadro. Si es más corto, simplemente lo corta.
- Escribe public/<carpeta>/frag/<noticia>_<i>.mp4 (30 fps) y anota "archivo" en timing.json.
"""
import json, os, subprocess, sys

FPS = 30
p = sys.argv[1]
T = json.load(open(p, encoding='utf8'))
for nt in T['noticias']:
    ms = nt['medios']
    for i, m in enumerate(ms):
        if m['tipo'] != 'video':
            continue
        a = round(m['t'] * FPS)
        b = round((ms[i + 1]['t'] if i + 1 < len(ms) else nt['fin']) * FPS)
        slot = (b - a + 10) / FPS  # +10 cuadros para el fundido con el siguiente medio
        clip = m['hasta'] - m['desde']
        rate = max(0.6, min(1.0, clip / slot))
        carpeta = os.path.dirname(m['src'])
        rel = f"{carpeta}/frag/n{nt['n']}_{i}.mp4"
        out = f'public/{rel}'
        os.makedirs(os.path.dirname(out), exist_ok=True)
        # borra las dos posiciones de la marca de agua de TikTok (video 576×1024)
        logo = "delogo=x=1:y=440:w=158:h=132,delogo=x=428:y=752:w=146:h=140,"
        vf = (f"trim=start={m['desde']}:end={m['hasta']},{logo}setpts=(PTS-STARTPTS)/{rate:.4f},fps={FPS},"
              f"tpad=stop_mode=clone:stop_duration={slot:.3f},trim=duration={slot:.3f}")
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f"public/{m['src']}", '-vf', vf, '-an',
                        '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-pix_fmt', 'yuv420p', out], check=True)
        m['archivo'] = rel
        print(f"{rel}: espacio {slot:.2f}s, fragmento {clip:.2f}s, velocidad ×{rate:.2f}")
json.dump(T, open(p, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
