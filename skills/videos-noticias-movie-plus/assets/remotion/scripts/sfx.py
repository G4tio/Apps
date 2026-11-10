#!/usr/bin/env python3
"""Diseño sonoro de la intro y el cierre de Movie Plus (solo numpy)."""
import numpy as np, wave
SR = 48000
rng = np.random.default_rng(7)

def bandpass(x, lo, hi):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR)
    X[(fr < lo) | (fr > hi)] = 0
    return np.fft.irfft(X, len(x))

def whoosh(d=0.38, sube=True):
    n = int(d * SR); t = np.linspace(0, 1, n)
    x = rng.standard_normal(n); out = np.zeros(n); seg = 2048
    for i in range(0, n, seg):
        c = t[i] if sube else 1 - t[i]
        f0 = 300 + 3200 * c
        out[i:i + seg] = bandpass(x[i:i + seg], f0 * 0.6, f0 * 1.6)[: len(out[i:i + seg])]
    env = np.sin(np.pi * t) ** 1.5
    return out * env * 0.5

def impacto(d=0.9):
    n = int(d * SR); t = np.arange(n) / SR
    f = 46 + 70 * np.exp(-t * 18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.2)
    golpe = bandpass(rng.standard_normal(n), 80, 2500) * np.exp(-t * 38)
    return sub * 0.9 + golpe * 0.35

def click(tono=1800, d=0.05):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * tono * t) * np.exp(-t * 90) + bandpass(rng.standard_normal(n), 2000, 9000) * np.exp(-t * 160) * 0.3) * 0.35

def brillo(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for k, fq in enumerate([2093, 2637, 3136, 4186]):
        a = int(k * 0.06 * SR)
        tt = t[: n - a]
        out[a:] += np.sin(2 * np.pi * fq * tt) * np.exp(-tt * 9) * 0.07
    return out

def pop(d=0.12):
    n = int(d * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (300 + 500 * np.exp(-t * 40)) * t) * np.exp(-t * 30) * 0.45

def mezcla(dur, eventos, nombre):
    buf = np.zeros(int(dur * SR) + SR)
    for cuadro, s, g in eventos:
        a = int(cuadro / 30 * SR); buf[a:a + len(s)] += s[: len(buf) - a] * g
    buf = buf[: int(dur * SR)]
    fade = int(0.05 * SR); buf[-fade:] *= np.linspace(1, 0, fade)
    buf = np.tanh(buf * 1.2) / np.tanh(1.2)
    buf *= 0.89 / max(1e-9, np.abs(buf).max())
    st = np.stack([buf, buf], 1)
    with wave.open(nombre, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())

mezcla(76 / 30, [
    (0, whoosh(0.32), 0.8), (6, whoosh(0.5), 0.5), (22, impacto(), 1.0),
    (29, click(1500), 1), (30, click(1700), 1), (32, click(1900), 1), (34, click(2100), 1), (36, click(2300), 1),
    (37, click(2600, 0.03), 0.5), (39, click(2700, 0.03), 0.5), (41, click(2800, 0.03), 0.5), (43, click(2900, 0.03), 0.5),
    (42, brillo(), 1), (60, whoosh(0.45), 0.9),
], 'public/sfx/intro.wav')

mezcla(96 / 30, [
    (0, whoosh(0.3), 0.8), (10, pop(), 0.8), (19, impacto(), 1.0),
    (25, click(1500), 1), (26, click(1700), 1), (28, click(1900), 1), (30, click(2100), 1), (32, click(2300), 1),
    (40, pop(), 1.0), (52, brillo(), 1), (80, whoosh(0.5, sube=False), 0.6),
], 'public/sfx/cierre.wav')
print('ok')
