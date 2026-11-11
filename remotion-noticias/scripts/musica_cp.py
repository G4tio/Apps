#!/usr/bin/env python3
"""Música de fondo para Clave Pública: pad Am–F–C–G + arpegio suave, ducking bajo la voz y whooshes en cada corte.

Uso: python3 scripts/musica_cp.py <timing.json> <voz.wav> <salida.wav> [--cierre]
  --cierre: el último bloque de la voz es el cierre hablado, que suena sobre la recapitulación.
La pista empieza en el cuadro 90 (fin de la intro) y termina al empezar el cierre; los clips oficiales traen su propio audio.
"""
import json, subprocess, sys
import numpy as np

timing_p, voz_p, out_p = sys.argv[1:4]
CIERRE_HABLADO = "--cierre" in sys.argv[4:]
SR = 44100
T = json.load(open(timing_p))
B = T["bloques"]
VOZ = 96; INTRO = 90; RECAP = 195; FUENTES = 156; PAUSA = 27
vozF = lambda t: round(VOZ + t * 30)
if CIERRE_HABLADO:
    fin_noticias = vozF(B[-1]["inicio"])
    recap = max(RECAP, vozF(T["fin_voz"]) + 36 - fin_noticias)
    cortes = [vozF(b["inicio"]) for b in B[1:]] + [fin_noticias + recap]
else:
    fin_noticias = vozF(T["fin_voz"]) + PAUSA
    recap = RECAP
    cortes = [vozF(b["inicio"]) for b in B[1:]] + [fin_noticias, fin_noticias + recap]
fin = fin_noticias + recap + FUENTES  # empieza el cierre
dur = (fin - INTRO) / 30
n = int(dur * SR); t = np.arange(n) / SR

def nota(m):
    return 440 * 2 ** ((m - 69) / 12)

BPM = 96; beat = 60 / BPM; compas = beat * 4
acordes = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
mus = np.zeros(n)
rng = np.random.default_rng(7)
# pad: tres voces ligeramente desafinadas, con ataque/relajación suaves por compás
for k in range(int(dur / compas) + 1):
    a = int(k * compas * SR); b = min(n, int((k + 1) * compas * SR) + int(0.3 * SR))
    if a >= n: break
    tt = np.arange(b - a) / SR
    env = np.minimum(1, tt / 0.6) * np.minimum(1, np.maximum(0, (b - a) / SR - tt) / 0.5)
    for m in acordes[k % 4]:
        for det in (-0.08, 0.08):
            f0 = nota(m - 12) * 2 ** (det / 12)
            mus[a:b] += 0.05 * env * (np.sin(2 * np.pi * f0 * tt) + 0.3 * np.sin(4 * np.pi * f0 * tt))
    # bajo
    mus[a:b] += 0.06 * env * np.sin(2 * np.pi * nota(acordes[k % 4][0] - 24) * tt)
# arpegio en corcheas
paso = beat / 2
for k in range(int(dur / paso)):
    a = int(k * paso * SR); L = int(0.45 * SR); b = min(n, a + L)
    tt = np.arange(b - a) / SR
    ac = acordes[int(k * paso / compas) % 4]
    m = (ac + [ac[0] + 12])[k % 4] + 12
    mus[a:b] += 0.035 * np.exp(-tt * 7) * np.sin(2 * np.pi * nota(m) * tt)
# hi-hat muy suave en contratiempo
for k in range(int(dur / beat)):
    a = int((k + 0.5) * beat * SR); L = int(0.05 * SR)
    if a + L < n:
        mus[a:a + L] += 0.012 * rng.standard_normal(L) * np.exp(-np.arange(L) / SR * 80)

# ducking con la envolvente de la voz (la voz entra 0,2 s después del inicio de la pista)
raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", voz_p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
v = np.frombuffer(raw, np.float32).astype(np.float64)
voz = np.zeros(n); off = int((VOZ - INTRO) / 30 * SR); voz[off:off + len(v)] = v[: max(0, n - off)]
win = int(0.25 * SR)
envv = np.sqrt(np.convolve(voz ** 2, np.ones(win) / win, mode="same"))
activa = np.clip(envv / 0.03, 0, 1)
duck = 1 - 0.55 * np.convolve(activa, np.ones(int(0.3 * SR)) / int(0.3 * SR), mode="same")
mus *= duck

# whooshes en cada corte (ruido filtrado que sube y baja)
for c in cortes:
    centro = (c - INTRO) / 30; a = int((centro - 0.3) * SR); L = int(0.55 * SR)
    if a < 0 or a + L > n: continue
    x = rng.standard_normal(L)
    x = np.convolve(x, np.ones(18) / 18, mode="same")
    env = np.sin(np.linspace(0, np.pi, L)) ** 2
    mus[a:a + L] += 0.12 * env * x

# fundidos y nivel (≈ −24 dBFS RMS bajo la voz)
fi = int(0.8 * SR); fo = int(1.2 * SR)
mus[:fi] *= np.linspace(0, 1, fi); mus[-fo:] *= np.linspace(1, 0, fo)
mus = mus / (np.abs(mus).max() + 1e-9) * 0.32
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", "-ac", "2", out_p],
               input=mus.astype(np.float64).tobytes(), check=True)
print(f"música: {dur:.2f} s, cortes {cortes}")
