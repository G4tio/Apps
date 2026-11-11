#!/usr/bin/env python3
"""Genera el timing de un video de Clave Pública a partir del guion y la transcripción real.

Uso: python3 scripts/timing_cp.py <carpeta_audio> <plan.json> <salida.json>
  <carpeta_audio>: contiene locucion.txt (una línea por bloque: gancho, noticia 1…) y palabras_asr.json
  <plan.json>: {"pausa_bloques": [...opcional], "pantalla": [[["león","catorce"], "León XIV", "k"], ...],
                "claves": ["rusia", "abu dabi", ...], "cues": {"n1": {"usa": "Estados", ...}, ...}}
Salida: {"bloques": [{"inicio", "fin", "frases": [[{"w","k","t"}]], "cues": {nombre: t}}], "fin_voz"}
Tiempos en segundos desde el inicio de la voz. Aparición de palabra = t0 − 0,08; corte = t0 − 0,04.
"""
import difflib, json, re, sys, unicodedata

carpeta, plan_p, out_p = sys.argv[1:4]
plan = json.load(open(plan_p, encoding="utf8"))
lineas = [l.strip() for l in open(f"{carpeta}/locucion.txt", encoding="utf8") if l.strip()]
asr = json.load(open(f"{carpeta}/palabras_asr.json"))

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9ñ]", "", s)

# tokens del guion con bloque y puntuación final
toks = []
for b, l in enumerate(lineas):
    for raw in l.split():
        toks.append({"raw": raw, "n": norm(raw), "b": b})

# Needleman–Wunsch guion ↔ ASR
A = [t["n"] for t in toks]; B = [norm(w["w"]) for w in asr]
GAP = -0.55
n, m = len(A), len(B)
S = [[0.0] * (m + 1) for _ in range(n + 1)]
P = [[0] * (m + 1) for _ in range(n + 1)]
for i in range(1, n + 1): S[i][0] = i * GAP; P[i][0] = 1
for j in range(1, m + 1): S[0][j] = j * GAP; P[0][j] = 2
for i in range(1, n + 1):
    for j in range(1, m + 1):
        sim = difflib.SequenceMatcher(None, A[i - 1], B[j - 1]).ratio()
        opts = (S[i - 1][j - 1] + (sim * 2 - 1), S[i - 1][j] + GAP, S[i][j - 1] + GAP)
        k = max(range(3), key=lambda x: opts[x]); S[i][j] = opts[k]; P[i][j] = k
i, j = n, m
t0 = [None] * n
while i > 0 and j > 0:
    k = P[i][j]
    if k == 0:
        if difflib.SequenceMatcher(None, A[i - 1], B[j - 1]).ratio() >= 0.4:
            t0[i - 1] = asr[j - 1]["t0"]
        i -= 1; j -= 1
    elif k == 1: i -= 1
    else: j -= 1
# interpola las no emparejadas
known = [(i, t) for i, t in enumerate(t0) if t is not None]
for i in range(n):
    if t0[i] is None:
        prev = max([k for k in known if k[0] < i], default=(None, None), key=lambda k: k[0])
        nxt = min([k for k in known if k[0] > i], default=(None, None), key=lambda k: k[0])
        if prev[0] is None: t0[i] = nxt[1]
        elif nxt[0] is None: t0[i] = prev[1] + 0.3 * (i - prev[0])
        else: t0[i] = prev[1] + (nxt[1] - prev[1]) * (i - prev[0]) / (nxt[0] - prev[0])
for i, t in enumerate(toks): t["t"] = round(t0[i], 3)
no_emp = sum(1 for k in range(n) if k not in dict(known))
print(f"palabras guion {n}, ASR {m}, sin emparejar {no_emp}", file=sys.stderr)

# Texto en pantalla: sustituciones (cifras) y claves
pant = [(tuple(norm(w) for w in seq), txt, kind) for seq, txt, kind in plan.get("pantalla", [])]
claves = [tuple(norm(w) for w in c.split()) for c in plan.get("claves", [])]

bloques = []
for b in range(len(lineas)):
    bt = [t for t in toks if t["b"] == b]
    words = []
    i = 0
    while i < len(bt):
        hit = None
        for seq, txt, kind in pant:
            L = len(seq)
            if tuple(t["n"] for t in bt[i:i + L]) == seq:
                hit = (L, txt, kind); break
        if hit:
            L, txt, kind = hit
            punct = re.sub(r"^.*?([.,:;]*)$", r"\1", bt[i + L - 1]["raw"])
            words.append({"w": txt + punct, "k": kind, "t": bt[i]["t"], "end": bool(punct)})
            i += L; continue
        k = "n"
        for c in claves:
            L = len(c)
            for off in range(L):
                if i - off >= 0 and tuple(t["n"] for t in bt[i - off:i - off + L]) == c:
                    k = "k"
        raw = bt[i]["raw"]
        words.append({"w": raw, "k": k, "t": bt[i]["t"], "end": bool(re.search(r"[.,:;]$", raw))})
        i += 1
    # frases: corta tras puntuación (≥3 palabras) o a las 7 palabras
    frases, cur = [], []
    for w in words:
        cur.append(w)
        if (w["end"] and len(cur) >= 3) or len(cur) >= 7:
            frases.append(cur); cur = []
    if cur:
        if frases and len(cur) <= 2: frases[-1] += cur
        else: frases.append(cur)
    frases = [[{"w": w["w"], "k": w["k"], "t": round(w["t"] - 0.08, 3)} for w in f] for f in frases]
    # cues: nombre -> palabra (usa "palabra#2" para la segunda aparición)
    cues = {}
    for name, spec in plan.get("cues", {}).get(str(b), {}).items():
        word, _, nth = spec.partition("#"); nth = int(nth or 1); c = 0
        for t in bt:
            if t["n"] == norm(word):
                c += 1
                if c == nth: cues[name] = t["t"]; break
        if name not in cues: print(f"AVISO: cue {name} ({spec}) no encontrada en bloque {b}", file=sys.stderr)
    bloques.append({"frases": frases, "cues": cues, "primera": bt[0]["t"], "ultima": bt[-1]["t"]})

for b, bl in enumerate(bloques):
    bl["inicio"] = 0.0 if b == 0 else round(bl["primera"] - 0.04, 3)
for b, bl in enumerate(bloques):
    bl["fin"] = bloques[b + 1]["inicio"] if b + 1 < len(bloques) else None
import subprocess
fin_voz = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"{carpeta}/voz_limpia.wav"]))
bloques[-1]["fin"] = round(fin_voz, 3)
json.dump({"bloques": bloques, "fin_voz": round(fin_voz, 3)}, open(out_p, "w", encoding="utf8"), ensure_ascii=False, indent=1)
for b, bl in enumerate(bloques):
    print(f"bloque {b}: {bl['inicio']:.2f}–{bl['fin']:.2f} s, {len(bl['frases'])} frases, cues {bl['cues']}", file=sys.stderr)
