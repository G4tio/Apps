#!/usr/bin/env python3
"""Alinea la locución con la transcripción real y escribe src/timing.ts.

Uso:
  python3 scripts/sincronizar.py <carpeta_voz> <pantalla.json> [--simular]

<carpeta_voz>/locucion.txt      una línea por bloque: entrada, noticias 1..6, cierre
<carpeta_voz>/palabras_asr.json salida de transcribir.py (omitir con --simular)
pantalla.json:
  "cifras":  [[bloque, "frase hablada", "texto en pantalla"], ...]   (se muestran en azul claro)
  "claves":  [[bloque, "palabra"], ...]                              (se muestran en celeste)
  "cues":    {"nombre": [bloque, "palabra#n"]}                       (acciones de las ilustraciones)
Con --simular se inventan tiempos (≈3,4 palabras/s) para previsualizar sin audio.
Tiempos en segundos desde el inicio de la voz.
"""
import difflib, json, re, sys, unicodedata

carpeta, plan_p = sys.argv[1:3]
SIMULAR = '--simular' in sys.argv
lineas = [l.strip() for l in open(f'{carpeta}/locucion.txt', encoding='utf8') if l.strip()]
plan = json.load(open(plan_p, encoding='utf8'))


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9ñ]', '', s)


guion = []
for b, l in enumerate(lineas):
    for w in l.split():
        limpio = w.strip('.,:;¡!¿?«»"')
        if limpio:
            guion.append({'w': limpio, 'k': norm(limpio), 'b': b, 'punt': w[-1] in '.,:;'})

if SIMULAR:
    t, prev = 0.15, 0
    for g in guion:
        if g['b'] != prev:
            t += 0.6
            prev = g['b']
        g['t0'] = round(t, 3)
        t += 0.27 + 0.012 * len(g['w']) + (0.18 if g['punt'] else 0)
    emp = len(guion)
else:
    asr = json.load(open(f'{carpeta}/palabras_asr.json', encoding='utf8'))
    G = [g['k'] for g in guion]
    A = [norm(x['w']) for x in asr]
    n, m, GAP = len(G), len(A), -0.55
    S = [[0.0] * (m + 1) for _ in range(n + 1)]
    P = [[None] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        S[i][0], P[i][0] = i * GAP, 'u'
    for j in range(1, m + 1):
        S[0][j], P[0][j] = j * GAP, 'l'
    sim = lambda a, b: difflib.SequenceMatcher(None, a, b).ratio()
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            s_ = sim(G[i - 1], A[j - 1])
            S[i][j], P[i][j] = max((S[i - 1][j - 1] + (s_ if s_ >= 0.45 else s_ - 1), 'd'),
                                   (S[i - 1][j] + GAP, 'u'), (S[i][j - 1] + GAP, 'l'))
    i, j, match = n, m, {}
    while i > 0 or j > 0:
        p = P[i][j]
        if p == 'd':
            if sim(G[i - 1], A[j - 1]) >= 0.45:
                match[i - 1] = asr[j - 1]['t0']
            i, j = i - 1, j - 1
        elif p == 'u':
            i -= 1
        else:
            j -= 1
    T = [match.get(k) for k in range(n)]
    for k in range(n):
        if T[k] is None:
            a = next((x for x in range(k - 1, -1, -1) if T[x] is not None), None)
            b = next((x for x in range(k + 1, n) if T[x] is not None), None)
            ta = T[a] if a is not None else 0.0
            tb = T[b] if b is not None else ta + 0.3 * (k - (a if a is not None else 0))
            ia, ib = (a if a is not None else -1), (b if b is not None else n)
            T[k] = ta + (tb - ta) * (k - ia) / (ib - ia)
    for k, g in enumerate(guion):
        g['t0'] = round(T[k], 3)
    emp = len(match)
    # diferencias guion/audio para el informe
    oido = ' '.join(x['w'] for x in asr)
    open(f'{carpeta}/oido.txt', 'w', encoding='utf8').write(oido + '\n')

# tipo de cada palabra
for g in guion:
    g['kind'], g['pant'] = 'n', g['w']
for b, frase, texto in plan.get('cifras', []):
    seq = [norm(x) for x in frase.split()]
    for k in range(len(guion) - len(seq) + 1):
        if guion[k]['b'] == b and all(guion[k + q]['b'] == b and guion[k + q]['k'] == seq[q] and guion[k + q]['kind'] == 'n' and guion[k + q]['pant'] == guion[k + q]['w'] for q in range(len(seq))):
            guion[k]['pant'], guion[k]['kind'] = texto, 'c'
            for q in range(1, len(seq)):
                guion[k + q]['pant'] = ''
            # conserva la puntuación final de la frase
            guion[k]['punt'] = guion[k + len(seq) - 1]['punt']
            break
    else:
        print('AVISO cifra no encontrada:', b, frase)
for b, w in plan.get('claves', []):
    for g in guion:
        if g['b'] == b and g['k'] == norm(w) and g['kind'] == 'n':
            g['kind'] = 'k'

# frases de subtítulo: máximo dos líneas (~21 caracteres por línea a 72 px)
MAXL, frases = 21, []
for b in range(len(lineas)):
    ws = [g for g in guion if g['b'] == b and g['pant']]
    cur, lines, linelen = [], 1, 0
    for g in ws:
        L = len(g['pant'])
        if cur and linelen + 1 + L > MAXL:
            if lines == 2:
                # no terminar una frase en palabra corta (el, de, y, en…): pásala a la siguiente
                pasa = []
                while len(cur) > 3 and len(cur[-1]['pant']) <= 3 and not cur[-1]['punt'] and len(pasa) < 2:
                    pasa.insert(0, cur.pop())
                frases.append(cur); cur, lines = pasa, 1
                linelen = len(' '.join(x['pant'] for x in pasa))
            else:
                lines, linelen = 2, 0
        cur.append(g)
        linelen += (1 if linelen else 0) + L
        # corta en punto o dos puntos si la frase ya tiene contenido
        if g['punt'] and len(cur) >= 2:
            frases.append(cur); cur, lines, linelen = [], 1, 0
    if cur:
        frases.append(cur)

bloques = []
for b in range(len(lineas)):
    ws = [g for g in guion if g['b'] == b]
    bloques.append({'inicio': round(ws[0]['t0'] - 0.04, 3), 'ultima': ws[-1]['t0']})
fin_voz = round(guion[-1]['t0'] + 0.9, 3)


def cue(b, palabra):
    palabra, _, nth = palabra.partition('#')
    nth, k0 = int(nth or 1), norm(palabra)
    for g in guion:
        if g['b'] == b and g['k'] == k0:
            nth -= 1
            if nth == 0:
                return round(g['t0'] - bloques[b]['inicio'], 3)
    raise SystemExit(f'cue no encontrado: {b} {palabra}')


cues = {k: cue(*v) for k, v in plan.get('cues', {}).items()}
out_frases = []
for fr in frases:
    b = fr[0]['b']
    out_frases.append({'b': b, 'toks': [{'w': g['pant'], 't': round(g['t0'] - bloques[b]['inicio'], 3), 'k': g['kind']} for g in fr]})

ts = '// Generado por scripts/sincronizar.py — no editar a mano.\n'
ts += f'// {"SIMULADO (sin audio)" if SIMULAR else "Tiempos de la transcripción real"}.\n'
ts += 'export type Tok = { w: string; t: number; k: "n" | "k" | "c" };\n'
ts += 'export type Frase = { b: number; toks: Tok[] };\n'
ts += f'export const AUDIO_REAL = {"false" if SIMULAR else "true"};\n'
ts += f'export const BLOQUES: {{ inicio: number; ultima: number }}[] = {json.dumps(bloques)};\n'
ts += f'export const FIN_VOZ = {fin_voz};\n'
ts += f'export const FRASES: Frase[] = {json.dumps(out_frases, ensure_ascii=False)};\n'
ts += f'export const CUES: Record<string, number> = {json.dumps(cues, ensure_ascii=False)};\n'
open('src/timing.ts', 'w', encoding='utf8').write(ts)
print(f'palabras {len(guion)}, emparejadas {emp} ({100*emp/len(guion):.0f} %), frases {len(frases)}, voz {fin_voz:.2f} s')
for b, bl in enumerate(bloques):
    print(f'bloque {b}: {bl["inicio"]:.2f} s')
print('cues:', cues)
