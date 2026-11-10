#!/usr/bin/env python3
"""Genera la locución con Fish Audio bloque por bloque, verifica cada uno y los une con pausas.

Uso: python3 scripts/voz_por_bloques.py <carpeta_voz> <carpeta_que_contiene_el_modelo_asr> [pausa_noticias=0.7] [pausa_gancho=0.35]
- Lee <carpeta_voz>/locucion_tts.txt (o locucion.txt): una línea por bloque (gancho, noticia 1, …).
- Cada bloque se genera aparte (evita sílabas sueltas entre bloques), se transcribe y se compara con
  el texto; si se parece poco o trae palabras de más al inicio, se repite (hasta 4 intentos).
- Recorta silencios de los extremos y une: gancho + pausa corta + noticias con pausa entre ellas.
Salida: <carpeta_voz>/voz_limpia.wav y bloques/bNN.wav. Después: transcribir.py + alinear.py.
"""
import difflib, json, os, re, subprocess, sys, unicodedata
import numpy as np

carpeta, modelo = sys.argv[1:3]
p_not = float(sys.argv[3]) if len(sys.argv) > 3 else 0.7
p_gan = float(sys.argv[4]) if len(sys.argv) > 4 else 0.35
AQUI = os.path.dirname(os.path.abspath(__file__))
SKILL = os.environ.get('SKILL_SCRIPTS', os.path.join(AQUI))
TTS = os.path.join(SKILL, 'fish_tts.py') if os.path.exists(os.path.join(SKILL, 'fish_tts.py')) else 'fish_tts.py'
ASR = os.path.join(SKILL, 'transcribir.py') if os.path.exists(os.path.join(SKILL, 'transcribir.py')) else 'transcribir.py'
src = f'{carpeta}/locucion_tts.txt' if os.path.exists(f'{carpeta}/locucion_tts.txt') else f'{carpeta}/locucion.txt'
lineas = [l.strip() for l in open(src, encoding='utf8') if l.strip()]
os.makedirs(f'{carpeta}/bloques', exist_ok=True)
SR = 44100

def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9ñ ]', ' ', s).split()

def leer(p):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'])
    return np.frombuffer(raw, np.float32).astype(np.float64)

def recortar(x):
    env = np.convolve(np.abs(x), np.ones(441) / 441, mode='same')
    idx = np.where(env > 10 ** (-40 / 20))[0]
    if not len(idx):
        return x
    a = max(0, idx[0] - int(0.03 * SR)); b = min(len(x), idx[-1] + int(0.08 * SR))
    return x[a:b]

piezas = []
for i, texto in enumerate(lineas):
    mejor = None
    for intento in range(1, int(os.environ.get('MAX_TOMAS', '4')) + 1):
        tmp_txt = f'{carpeta}/bloques/b{i:02d}.txt'
        open(tmp_txt, 'w', encoding='utf8').write(texto)
        mp3 = f'{carpeta}/bloques/b{i:02d}_{intento}.mp3'
        if not os.path.exists(mp3):  # reutiliza tomas ya generadas (no gasta créditos)
            subprocess.run([sys.executable, TTS, tmp_txt, mp3], check=True, stdout=subprocess.DEVNULL)
        wav16 = f'{carpeta}/bloques/b{i:02d}_16k.wav'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-ar', '16000', '-ac', '1', wav16], check=True)
        r = subprocess.run([sys.executable, ASR, wav16, modelo], capture_output=True, text=True)
        if r.returncode != 0:
            sys.exit('Error al transcribir (¿ruta del modelo? debe ser la carpeta que CONTIENE el modelo):\n' + r.stderr[-500:])
        oido = norm(r.stderr)
        esperado = norm(texto)
        sim = difflib.SequenceMatcher(None, ' '.join(esperado), ' '.join(oido), autojunk=False).ratio()
        # palabras de más al inicio (sílabas sueltas): la primera palabra oída debe parecerse a la esperada
        inicio_ok = bool(oido) and difflib.SequenceMatcher(None, oido[0], esperado[0]).ratio() >= 0.5
        extra = len(oido) - len(esperado)
        ok = sim >= 0.80 and inicio_ok and extra <= 2
        print(f'bloque {i} intento {intento}: similitud {sim:.2f}, inicio {"ok" if inicio_ok else "MAL"}, '
              f'palabras {len(oido)}/{len(esperado)} -> {"OK" if ok else "repetir"}')
        if mejor is None or sim > mejor[0]:
            mejor = (sim, mp3)
        if ok:
            break
    x = recortar(leer(mejor[1]))
    piezas.append(x)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-',
                    f'{carpeta}/bloques/b{i:02d}.wav'], input=x.astype(np.float32).tobytes(), check=True)

salida = []
for i, x in enumerate(piezas):
    if i:
        salida.append(np.zeros(int((p_gan if i == 1 else p_not) * SR)))
    salida.append(x)
y = np.concatenate(salida)
y = y / (np.abs(y).max() + 1e-9) * 0.9
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-',
                f'{carpeta}/voz_limpia.wav'], input=y.astype(np.float32).tobytes(), check=True)
print(f'voz_limpia.wav: {len(y) / SR:.2f} s, {len(piezas)} bloques')
