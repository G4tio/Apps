#!/usr/bin/env python3
"""Montaje de audio del formato HISTORIA (una sola historia con chiste recurrente).

Uso: python3 scripts/mezcla_historia.py <carpeta_media> <timing.json> <plan.json> [musica.wav]
- La voz entra casi en el segundo 0 (intro acortada a ~0,5 s).
- En los bloques de chiste ("chiste": true en el plan) suena un disco rayado y la música se corta.
- El cierre entra tras el último bloque (la pregunta hablada).
- Calcula el montaje (intro, desfase de voz, inicio del cierre) y lo escribe en timing.json.
- Mezcla: sonidos de intro y cierre + voz + música de fondo baja con ducking
  + whoosh en cada cambio de noticia. Si no se da música, genera una pista
  instrumental suave (pad + pulso) con numpy.
"""
import json, sys, wave, subprocess, os
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from sfx import whoosh, impacto, click, rayado, SR  # noqa: E402

carpeta, timing_p, plan_p = sys.argv[1:4]
musica_p = sys.argv[4] if len(sys.argv) > 4 else None
T = json.load(open(timing_p, encoding='utf8'))
PLAN = json.load(open(plan_p, encoding='utf8'))
CHISTES = {nt['n'] for nt in PLAN['noticias'] if nt.get('chiste')}

FPS = 30
INTRO = 16            # cuadros de intro acortada (logo + barrido)
CIERRE = 96           # cuadros del cierre
VOZ_OFF = 0.35        # la voz arranca casi en el segundo 0
PAUSA_FINAL = 0.7     # aire tras la pregunta final antes del cierre
cierre_t = T['bloques'][-1]['fin'] + PAUSA_FINAL - 0.8  # 'fin' del último bloque ya trae 0,8 s de cola
cierre_ini = int(round((VOZ_OFF + cierre_t) * FPS))
total = cierre_ini + CIERRE
T['montaje'] = {'fps': FPS, 'intro': INTRO, 'vozOffset': VOZ_OFF, 'cierreInicio': cierre_ini,
                'cierre': CIERRE, 'total': total}
json.dump(T, open(timing_p, 'w', encoding='utf8'), ensure_ascii=False, indent=1)

def leer(p, mono=True):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'])
    return np.frombuffer(raw, np.float32).astype(np.float64)

dur = total / FPS
N = int(dur * SR) + SR
mix = np.zeros(N)
def poner(x, t, g=1.0):
    a = int(t * SR); b = min(N, a + len(x))
    if b > a: mix[a:b] += x[: b - a] * g

voz = leer(f'{carpeta}/voz/voz_limpia.wav')
voz = voz / (np.abs(voz).max() + 1e-9) * 0.70
pista_voz = np.zeros(N); a = int(VOZ_OFF * SR); pista_voz[a:a + len(voz)] = voz[: N - a]

# --- música ---
mus_ini, mus_fin = 0.0, cierre_ini / FPS + 1.2
L = int((mus_fin - mus_ini) * SR)
if musica_p:
    m = leer(musica_p)
    m = np.tile(m, int(np.ceil(L / len(m))))[:L]
else:
    rng = np.random.default_rng(3)
    t = np.arange(L) / SR
    bpm = 96; beat = 60 / bpm; bar = beat * 4
    acordes = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    hz = lambda n: 440 * 2 ** ((n - 69) / 12)
    m = np.zeros(L)
    for i in range(int(np.ceil(L / SR / bar)) + 1):
        a0 = int(i * bar * SR); a1 = min(L, int((i + 1) * bar * SR))
        if a0 >= L: break
        tt = np.arange(a1 - a0) / SR
        env = np.minimum(1, tt / 0.4) * np.minimum(1, (bar - tt) / 0.3)
        ac = acordes[i % 4]
        for n_ in ac:
            for det in (-0.08, 0.08):
                f = hz(n_ + det)
                m[a0:a1] += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * env * 0.05
        # bajo en negras
        fb = hz(ac[0] - 24)
        for k in range(4):
            b0 = a0 + int(k * beat * SR); b1 = min(a1, b0 + int(0.45 * SR))
            if b0 >= a1: break
            tb = np.arange(b1 - b0) / SR
            m[b0:b1] += np.sin(2 * np.pi * fb * tb) * np.exp(-tb * 6) * 0.35
        # hi-hat suave en corcheas
        for k in range(8):
            h0 = a0 + int(k * beat / 2 * SR); h1 = min(a1, h0 + int(0.05 * SR))
            if h0 >= a1: break
            nz = rng.standard_normal(h1 - h0); nz = np.diff(np.concatenate([[0], nz]))
            m[h0:h1] += nz * np.exp(-np.arange(h1 - h0) / SR * 70) * (0.05 if k % 2 else 0.03)
    # paso bajo suave para el pad
    X = np.fft.rfft(m); fr = np.fft.rfftfreq(len(m), 1 / SR); X *= 1 / (1 + (fr / 5000) ** 4); m = np.fft.irfft(X, len(m))
m = m / (np.sqrt((m ** 2).mean()) + 1e-9) * 0.05  # nivel base (≈ −26 dBFS RMS)
fade = np.ones(L); fi = int(0.8 * SR); fo = int(1.4 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
m *= fade
pista_mus = np.zeros(N); a = int(mus_ini * SR); pista_mus[a:a + L] = m[: N - a]

# ducking: baja la música cuando habla la voz
win = int(0.12 * SR)
env = np.sqrt(np.convolve(pista_voz ** 2, np.ones(win) / win, mode='same'))
env = env / (env.max() + 1e-9)
k = int(0.25 * SR); env = np.convolve(env, np.ones(k) / k, mode='same')
gain = 1 - 0.45 * np.clip(env * 4, 0, 1)
# la música se corta en seco durante los chistes (vuelve al empezar el bloque siguiente)
for b in T['bloques']:
    if b['bloque'] in CHISTES:
        a = int((VOZ_OFF + b['inicio']) * SR); z = int((VOZ_OFF + b['fin']) * SR)
        g = np.zeros(z - a); r = min(len(g), int(0.25 * SR)); g[-r:] = np.linspace(0, 1, r)
        gain[a:z] *= g
mix += pista_voz + pista_mus * gain

# efectos: final de la intro (whoosh del barrido) y cierre
intro = leer('public/sfx/intro.wav'); poner(intro[int(60 / FPS * SR):], 0, 0.9)
poner(leer('public/sfx/cierre.wav'), cierre_ini / FPS, 0.9)
# disco rayado al congelar; whoosh en los demás cambios de bloque; tic suave en cada rótulo
for b in T['bloques'][1:]:
    if b['bloque'] in CHISTES:
        poner(rayado(), VOZ_OFF + b['inicio'] - 0.05, 0.75)
    else:
        poner(whoosh(0.4), VOZ_OFF + b['inicio'] - 0.22, 0.32)
for nt in T['noticias']:
    for r in nt['rotulos']:
        poner(click(1900, 0.04), VOZ_OFF + r['t'], 0.18)

mix = mix[: int(dur * SR)]
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix *= 0.89 / (np.abs(mix).max() + 1e-9)
st = np.stack([mix, mix], 1)
out = f'{carpeta}/mezcla.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print(f'montaje: total {total} cuadros ({dur:.2f} s), cierre en {cierre_ini}; mezcla -> {out}')
