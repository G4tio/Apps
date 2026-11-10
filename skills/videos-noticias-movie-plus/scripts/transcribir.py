#!/usr/bin/env python3
"""Transcribe una locución en español con tiempos por palabra (sin scipy).

Uso: python3 transcribir.py voz16k.wav carpeta_modelo > palabras.json
  voz16k.wav: ffmpeg -i voz.mp3 -ar 16000 -ac 1 voz16k.wav
  modelo: sherpa-onnx-nemo-fast-conformer-ctc-es-1424 (GitHub Releases)
Salida: texto completo en stderr y JSON [{"w": palabra, "t0": seg}] en stdout.
"""
import numpy as np, onnxruntime as ort, wave, sys, glob
d=glob.glob(sys.argv[2]+'/*/')[0]
w=wave.open(sys.argv[1]); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
x=np.append(x[0],x[1:]-0.97*x[:-1]); x=np.pad(x,256,mode='reflect')
n=(len(x)-400)//160+1; win=np.hanning(401)[:-1]
fr=np.stack([x[i*160:i*160+400]*win for i in range(n)]); S=np.abs(np.fft.rfft(fr,512))**2
def hz2mel(f):
  f=np.asarray(f,float); m=f/(200/3); lg=f>=1000
  return np.where(lg,15+np.log(np.maximum(f,1e-9)/1000)/(np.log(6.4)/27),m)
def mel2hz(m):
  m=np.asarray(m,float); return np.where(m>=15,1000*np.exp((np.log(6.4)/27)*(m-15)),m*200/3)
pts=mel2hz(np.linspace(hz2mel(0),hz2mel(8000),82)); fft=np.linspace(0,8000,257)
fb=np.zeros((80,257))
for i in range(80):
  l,c,r=pts[i],pts[i+1],pts[i+2]; fb[i]=np.maximum(0,np.minimum((fft-l)/(c-l),(r-fft)/(r-c)))*2/(r-l)
F=np.log(S@fb.T+2**-24).T; F=(F-F.mean(1,keepdims=True))/(F.std(1,keepdims=True)+1e-5)
s=ort.InferenceSession(d+'model.onnx')
lp=s.run(None,{'audio_signal':F[None].astype(np.float32),'length':np.array([F.shape[1]],np.int64)})[0][0]
tok=[l.rsplit(' ',1)[0] for l in open(d+'tokens.txt',encoding='utf8')]
a=lp.argmax(1); out=[];prev=-1
for i,t in enumerate(a):
  if t!=prev and t!=1024: out.append((i*0.08,tok[t]))
  prev=t
import json
words=[]
for t0,t in out:
  if t.startswith('▁') or not words: words.append({'w':t.lstrip('▁'),'t0':round(t0,2)})
  else: words[-1]['w']+=t
sys.stderr.write(' '.join(w['w'] for w in words)+'\n')
print(json.dumps(words,ensure_ascii=False))
