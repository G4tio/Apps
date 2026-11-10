#!/usr/bin/env python3
"""Música de fondo generada (pad Am–F–C–G + arpegio suave) con ducking bajo la voz
y un whoosh en cada corte de escena.

Uso: python3 scripts/musica.py public/audio/voz.wav <duración_total_s> <salida.wav>
- La música empieza al terminar la intro (3,0 s); la voz entra 0,2 s después.
- Los cortes se leen de src/timing.ts (BLOQUES).
"""
import json, re, subprocess, sys
import numpy as np

voz_p, total, salida = sys.argv[1], float(sys.argv[2]), sys.argv[3]
SR = 44100
DUR = total - 3.0  # la música arranca con el resumen
OFF_VOZ = 0.2
n = int(DUR * SR)
t = np.arange(n) / SR

ts = open('src/timing.ts', encoding='utf8').read()
bloques = json.loads(re.search(r'BLOQUES: [^=]+= (.*);', ts).group(1))
cortes = [OFF_VOZ + b['inicio'] for b in bloques[1:]]

def nota(m):  # midi → Hz
    return 440 * 2 ** ((m - 69) / 12)

acordes = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
compas = 4 * 60 / 96  # 96 bpm
y = np.zeros(n)
for i in range(int(DUR / compas) + 1):
    a, b = int(i * compas * SR), min(n, int((i + 1) * compas * SR) + int(0.4 * SR))
    if a >= n:
        break
    tt = np.arange(b - a) / SR
    env = np.minimum(1, tt / 0.6) * np.minimum(1, (compas + 0.4 - tt) / 0.5).clip(0)
    ac = acordes[i % 4]
    for m in ac:
        for det in (-0.12, 0.12):
            y[a:b] += 0.05 * env * np.sin(2 * np.pi * nota(m) * (1 + det / 100) * tt)
    y[a:b] += 0.05 * env * np.sin(2 * np.pi * nota(ac[0] - 12) * tt)
    # arpegio en corcheas
    paso = compas / 8
    for k in range(8):
        s0 = a + int(k * paso * SR)
        if s0 >= n:
            break
        L = min(int(0.35 * SR), n - s0)
        tk = np.arange(L) / SR
        f0 = nota(ac[k % 3] + 12 + (12 if k in (3, 7) else 0))
        y[s0:s0 + L] += 0.025 * np.exp(-tk * 7) * np.sin(2 * np.pi * f0 * tk)

# whoosh en cada corte (ruido filtrado con barrido)
rng = np.random.default_rng(7)
for c in cortes + [bloques[-1]['inicio'] + OFF_VOZ]:
    s0 = int((c - 0.3) * SR)
    L = int(0.55 * SR)
    if s0 < 0 or s0 + L > n:
        continue
    ruido = rng.standard_normal(L)
    k = np.linspace(0, 1, L)
    ventana = np.sin(np.pi * k) ** 2
    # filtro paso bajo móvil sencillo (media exponencial con coeficiente variable)
    out = np.zeros(L); acc = 0.0
    alfa = 0.02 + 0.25 * np.sin(np.pi * k)
    for j in range(L):
        acc += alfa[j] * (ruido[j] - acc); out[j] = acc
    y[s0:s0 + L] += 0.35 * out * ventana

# ducking con la envolvente de la voz
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', voz_p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'])
v = np.frombuffer(raw, np.float32).astype(np.float64)
venv = np.zeros(n)
a = int(OFF_VOZ * SR)
seg = v[:max(0, n - a)]
venv[a:a + len(seg)] = np.abs(seg)
win = int(0.25 * SR)
venv = np.convolve(venv, np.ones(win) / win, mode='same')
venv = venv / (venv.max() + 1e-9)
gain = 1 - 0.55 * np.clip(venv * 4, 0, 1)
y *= gain
# fundido al final
fin = int(2.0 * SR)
y[-fin:] *= np.linspace(1, 0, fin)
y = y / (np.abs(y).max() + 1e-9) * 0.35
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-ac', '2', salida],
               input=y.tobytes(), check=True)
print(f'música: {DUR:.1f} s, {len(cortes)} cortes')
