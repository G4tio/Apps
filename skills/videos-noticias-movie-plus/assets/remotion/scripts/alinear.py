#!/usr/bin/env python3
"""Alinea el guion aprobado con la transcripción real de la voz.

Uso: python3 scripts/alinear.py <carpeta_media_del_dia> <plan.json> <salida_timing.json>
  - <carpeta>/voz/locucion.txt   guion (una línea por bloque: gancho, noticias, cierre)
  - <carpeta>/voz/palabras_asr.json  salida de transcribir.py
  - plan.json: "pantalla" (reemplazos de cifras), y por noticia "medios" con "en" (palabra ancla)
    y "rotulos" con {"texto", "en"}.
Salida: palabras con tiempo, bloques, y tiempos de medios y rótulos.
"""
import json, re, sys, difflib, unicodedata

carpeta, plan_p, salida = sys.argv[1:4]
lineas = [l.strip() for l in open(f'{carpeta}/voz/locucion.txt', encoding='utf8') if l.strip()]
asr = json.load(open(f'{carpeta}/voz/palabras_asr.json', encoding='utf8'))
plan = json.load(open(plan_p, encoding='utf8'))

def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9ñ]', '', s)

guion = []  # {w, n, bloque}
for b, l in enumerate(lineas):
    for w in l.split():
        limpio = w.strip('.,:;¡!¿?«»"')
        if limpio:
            guion.append({'w': limpio, 'k': norm(limpio), 'bloque': b})

A = [norm(x['w']) for x in asr]
G = [g['k'] for g in guion]
GAP = -0.55
n, m = len(G), len(A)
S = [[0.0] * (m + 1) for _ in range(n + 1)]
P = [[None] * (m + 1) for _ in range(n + 1)]
for i in range(1, n + 1):
    S[i][0] = i * GAP; P[i][0] = 'u'
for j in range(1, m + 1):
    S[0][j] = j * GAP; P[0][j] = 'l'
for i in range(1, n + 1):
    for j in range(1, m + 1):
        sim = difflib.SequenceMatcher(None, G[i - 1], A[j - 1]).ratio()
        d = S[i - 1][j - 1] + (sim if sim >= 0.45 else sim - 1)
        u = S[i - 1][j] + GAP
        l = S[i][j - 1] + GAP
        S[i][j], P[i][j] = max((d, 'd'), (u, 'u'), (l, 'l'))
i, j = n, m
match = {}
while i > 0 or j > 0:
    p = P[i][j]
    if p == 'd':
        if difflib.SequenceMatcher(None, G[i - 1], A[j - 1]).ratio() >= 0.45:
            match[i - 1] = asr[j - 1]['t0']
        i, j = i - 1, j - 1
    elif p == 'u':
        i -= 1
    else:
        j -= 1

# interpolar las no emparejadas
t = [match.get(k) for k in range(n)]
for k in range(n):
    if t[k] is None:
        a = next((x for x in range(k - 1, -1, -1) if t[x] is not None), None)
        b = next((x for x in range(k + 1, n) if t[x] is not None), None)
        ta = t[a] if a is not None else 0.0
        tb = t[b] if b is not None else ta + 0.3 * (k - (a or 0))
        ia = a if a is not None else -1
        ib = b if b is not None else n
        t[k] = ta + (tb - ta) * (k - ia) / (ib - ia)
for k, g in enumerate(guion):
    g['t'] = round(max(0.0, t[k] - 0.08), 3)  # aparición del subtítulo
    g['t0'] = round(t[k], 3)
    g['pantalla'] = g['w']

# cifras en pantalla: {"bloque": b, "frase": "treinta y un", "texto": "31"}
for r in plan.get('pantalla', []):
    seq = [norm(x) for x in r['frase'].split()]
    for k in range(len(guion) - len(seq) + 1):
        if guion[k]['bloque'] == r['bloque'] and [guion[k + q]['k'] for q in range(len(seq))] == seq:
            guion[k]['pantalla'] = r['texto']
            for q in range(1, len(seq)):
                guion[k + q]['pantalla'] = ''
            break
    else:
        print('AVISO: no encontré', r)

def ancla(bloque, palabra, desde=0):
    # «palabra#2» = segunda aparición de la palabra dentro del bloque
    palabra, _, nth = palabra.partition('#')
    nth = int(nth or 1)
    k0 = norm(palabra)
    for k, g in enumerate(guion):
        if g['bloque'] == bloque and k >= desde and g['k'] == k0:
            nth -= 1
            if nth == 0:
                return k
    raise SystemExit(f'Ancla no encontrada: bloque {bloque} «{palabra}»')

bloques = []
for b in range(len(lineas)):
    ks = [k for k, g in enumerate(guion) if g['bloque'] == b]
    bloques.append({'bloque': b, 'inicio': round(guion[ks[0]]['t0'] - 0.04, 3) if b else 0.0,
                    'primera': ks[0], 'ultima': ks[-1]})
for b in range(len(bloques)):
    bloques[b]['fin'] = bloques[b + 1]['inicio'] if b + 1 < len(bloques) else round(guion[-1]['t0'] + 0.8, 3)

noticias = []
for nt in plan['noticias']:
    b = nt['n']  # bloque = número de noticia (0 = gancho)
    medios = []
    for m_ in nt['medios']:
        k = ancla(b, m_['en']) if m_.get('en') else bloques[b]['primera']
        medios.append({**m_, 't': round(guion[k]['t0'] - 0.04, 3) if k != bloques[b]['primera'] else bloques[b]['inicio']})
    rot = []
    for r in nt.get('rotulos', []):
        r2 = {**r, 't': guion[ancla(b, r['en'])]['t']}
        if 'items' in r:
            r2['items'] = [{**it, 't': guion[ancla(b, it['en'])]['t']} for it in r['items']]
        rot.append(r2)
    noticias.append({'n': b, 'inicio': bloques[b]['inicio'], 'fin': bloques[b]['fin'], 'medios': medios, 'rotulos': rot})

out = {
    'palabras': [{'w': g['pantalla'], 't': g['t'], 'b': g['bloque'], 'clave': g['k'] in set(map(norm, plan.get('claves', [])))
                  or bool(re.match(r'^\$?\d', g['pantalla']))} for g in guion],
    'bloques': bloques,
    'noticias': noticias,
    'duracionVoz': float(plan.get('duracionVoz', guion[-1]['t0'] + 1)),
}
json.dump(out, open(salida, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
emp = len(match)
print(f'palabras guion {n}, emparejadas {emp} ({100*emp/n:.0f} %)')
for bl in bloques:
    print(f"bloque {bl['bloque']}: {bl['inicio']:.2f}–{bl['fin']:.2f} s  «{guion[bl['primera']]['w']} … {guion[bl['ultima']]['w']}»")
