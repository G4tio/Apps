import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame,
} from 'remotion';
import {Intro} from './Intro';
import {Cierre} from './Cierre';
import {Fondo} from './Logo';
import {MARCA, W, H, prog, lerp, outBack, outCubic, outExpo, inOutCubic, clamp} from './marca';
import plan from './videos/2026-11-10.json';
import {PanelDatos, Dato} from './PanelDatos';
import timing from './videos/2026-11-10.timing.json';

// ---------- tipos ----------
type Medio = {
  tipo: 'imagen' | 'video'; src: string; t: number; desde?: number; hasta?: number;
  ajuste?: 'contain' | 'cover'; foco?: string; archivo?: string; zoom?: number;
};
type Rotulo = {texto: string; t: number; contador?: number; prefijo?: string; sufijo?: string};
type Noticia = {n: number; inicio: number; fin: number; medios: Medio[]; rotulos: Rotulo[]};
type Palabra = {w: string; t: number; b: number; clave: boolean};

const TM = timing as unknown as {
  palabras: Palabra[]; bloques: {bloque: number; inicio: number; fin: number}[];
  noticias: Noticia[];
  montaje: {fps: number; intro: number; vozOffset: number; cierreInicio: number; cierre: number; total: number};
};
const PLAN = plan as unknown as {voz: string; noticias: {n: number; fondo: string; titulo: string; categoria: string}[]};
const FPS = TM.montaje.fps;
const VOZ = TM.montaje.vozOffset;
export const NEWS_DUR = TM.montaje.total;
const TOTAL_NOTICIAS = TM.noticias.length;

// tiempo de voz (s) → cuadro del video
const fr = (tv: number) => Math.round((VOZ + tv) * FPS);

// ---------- estilos ----------
const SAIRA: React.CSSProperties = {fontFamily: 'Saira Condensed', fontWeight: 900, fontStyle: 'italic'};
const contorno = (px: number): React.CSSProperties => ({
  WebkitTextStroke: `${px}px #000`,
  paintOrder: 'stroke fill',
  textShadow: '0 8px 0 rgba(0,0,0,0.55), 0 14px 30px rgba(0,0,0,0.5)',
});

// Tarjeta principal
const CARD = {x: 90, y: 240, w: 900, h: 900, r: 28};
const ZOOM_VIDEO = 1.2; // saca del encuadre la marca de agua de TikTok

// ---------- medio (imagen o fragmento de video) ----------
const VistaMedio: React.FC<{m: Medio; dur: number; f: number}> = ({m, dur, f}) => {
  // f = cuadro local desde que empieza este medio
  const pIn = outCubic(prog(f, 0, 7));
  const zoom = lerp(1, 1.06, prog(f, 0, dur));
  const base: React.CSSProperties = {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: m.ajuste ?? 'cover', objectPosition: m.foco ?? 'center 30%',
  };
  let contenido: React.ReactNode;
  if (m.tipo === 'imagen') {
    const contain = m.ajuste === 'contain';
    contenido = (
      <>
        {contain ? (
          <Img src={staticFile(m.src)} style={{...base, objectFit: 'cover', filter: 'blur(28px) brightness(0.45)', transform: 'scale(1.2)'}} />
        ) : null}
        <Img src={staticFile(m.src)} style={{...base, transform: `scale(${zoom})`}} />
      </>
    );
  } else {
    // fragmento preparado por scripts/fragmentos.py con la duración exacta de su espacio
    contenido = (
      <OffthreadVideo
        src={staticFile(m.archivo!)}
        muted
        style={{...base, objectPosition: 'center center', transform: `scale(${(m.zoom ?? ZOOM_VIDEO) * zoom})`}}
      />
    );
  }
  return (
    <AbsoluteFill style={{opacity: pIn, transform: `scale(${lerp(1.07, 1, pIn)})`}}>{contenido}</AbsoluteFill>
  );
};

// ---------- escena de noticia ----------
const Escena: React.FC<{nt: Noticia; frame: number; finExtra?: number}> = ({nt, frame, finExtra}) => {
  const ini = fr(nt.inicio);
  const fin = finExtra ?? fr(nt.fin);
  const fl = frame - ini;
  const info = PLAN.noticias.find((x) => x.n === nt.n)!;
  const fondo = info.fondo;
  const pop = outBack(prog(fl, 0, 12), 1.6);
  const medios = nt.medios.map((m, i) => ({
    m, a: fr(m.t), b: i + 1 < nt.medios.length ? fr(nt.medios[i + 1].t) : fin,
  }));
  // medio actual y el anterior (para el fundido)
  const idx = Math.max(0, medios.findIndex((x) => frame >= x.a && frame < x.b));
  // panel de datos: título de la noticia y luego cada dato en su palabra
  const lista: Dato[] = [
    {tipo: 'titulo', texto: info.titulo, categoria: info.categoria, t: nt.inicio} as Dato,
    ...(nt.rotulos as unknown as Dato[]),
  ];
  const datos = lista.map((d, i) => ({d, a: i === 0 ? ini : fr(d.t), b: i + 1 < lista.length ? fr(lista[i + 1].t) : fin}));
  return (
    <AbsoluteFill>
      {/* fondo desenfocado de la noticia */}
      <Img
        src={staticFile(fondo)}
        style={{position: 'absolute', inset: -120, width: W + 240, height: H + 240, objectFit: 'cover',
          filter: 'blur(42px) brightness(0.42) saturate(1.1)', transform: `scale(${lerp(1.15, 1.25, prog(fl, 0, fin - ini))})`}}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,13,18,0.85) 0%, rgba(11,13,18,0.15) 30%, rgba(11,13,18,0.25) 62%, rgba(11,13,18,0.92) 100%)'}} />
      {/* tarjeta */}
      <div
        style={{
          position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: CARD.r,
          overflow: 'hidden', background: '#05070b', boxShadow: '0 40px 90px rgba(0,0,0,0.65)',
          outline: '3px solid rgba(255,255,255,0.10)',
          transform: `scale(${lerp(0.86, 1, pop)})`, opacity: prog(fl, 0, 4),
        }}
      >
        {medios.map(({m, a, b}, i) =>
          i === idx || (i === idx - 1 && frame - medios[idx].a < 8) ? (
            <AbsoluteFill key={i} style={{zIndex: i}}>
              {/* el Sequence hace que el recorte del video cuente desde el inicio de este medio */}
              <Sequence from={a} layout="none">
                <VistaMedio m={m} dur={b - a} f={frame - a} />
              </Sequence>
            </AbsoluteFill>
          ) : null,
        )}
        {/* viñeta inferior para que el rótulo se lea */}
        <AbsoluteFill style={{zIndex: 50, background: 'linear-gradient(180deg, rgba(0,0,0,0) 75%, rgba(0,0,0,0.3) 100%)'}} />
      </div>
      <PanelDatos datos={datos} frame={frame} inicio={ini} />
    </AbsoluteFill>
  );
};

// ---------- encabezado: contador + progreso ----------
const Encabezado: React.FC<{frame: number}> = ({frame}) => {
  const actual = TM.noticias.findIndex((nt, i) =>
    frame >= fr(nt.inicio) && frame < (i === TM.noticias.length - 1 ? TM.montaje.cierreInicio + 10 : fr(nt.fin)));
  if (actual < 0) return null;
  const nt = TM.noticias[actual];
  const pIn = outExpo(prog(frame, fr(TM.noticias[0].inicio), fr(TM.noticias[0].inicio) + 12));
  const avance = prog(frame, fr(nt.inicio), fr(nt.fin));
  const pad = (x: number) => String(x).padStart(2, '0');
  const seg = (CARD.w - 4 * 12) / TOTAL_NOTICIAS;
  return (
    <div style={{position: 'absolute', left: CARD.x, top: 150, width: CARD.w, opacity: pIn, transform: `translateY(${lerp(-30, 0, pIn)}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 54, height: 54, borderRadius: '50%', background: MARCA.rojo, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(237,28,36,0.4)'}}>
          <Img src={staticFile('logo/estrella.png')} style={{width: 34, height: 35}} />
        </div>
        <div style={{...SAIRA, fontWeight: 700, fontSize: 40, color: '#fff', letterSpacing: '0.06em'}}>
          NOTICIA <span style={{color: MARCA.rojo}}>{pad(actual + 1)}</span>
          <span style={{opacity: 0.55}}> / {pad(TOTAL_NOTICIAS)}</span>
        </div>
      </div>
      <div style={{display: 'flex', gap: 12, marginTop: 18}}>
        {TM.noticias.map((_, i) => (
          <div key={i} style={{width: seg, height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}>
            <div style={{width: `${(i < actual ? 1 : i === actual ? avance : 0) * 100}%`, height: '100%', background: MARCA.rojo}} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- gancho «5 NOTICIAS DE CINE Y SERIES DE HOY» ----------
const Gancho: React.FC<{frame: number}> = ({frame}) => {
  const fin = fr(TM.bloques[1].inicio);
  const pal = TM.palabras.filter((p) => p.b === 0);
  const at = (w: string) => fr(pal.find((p) => p.w.toLowerCase() === w)!.t);
  const lineas = [
    {txt: 'NOTICIAS', a: at('noticias')},
    {txt: 'DE CINE', a: at('cine')},
    {txt: 'Y SERIES', a: at('series')},
    {txt: 'DE HOY', a: at('hoy')},
  ];
  const p5 = prog(frame, at('5') - 2, at('5') + 10);
  const salida = prog(frame, fin - 6, fin);
  return (
    <AbsoluteFill style={{opacity: 1 - salida, transform: `scale(${lerp(1, 1.08, salida)})`}}>
      <div style={{position: 'absolute', left: 70, top: 600, height: 560, display: 'flex', alignItems: 'center', gap: 26}}>
        <div style={{...SAIRA, fontSize: 600, lineHeight: 0.8, color: MARCA.rojo, ...contorno(14),
          transform: `scale(${lerp(2.4, 1, outBack(p5, 1.4))}) rotate(-4deg)`, opacity: Math.min(1, p5 * 2)}}>
          5
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          {lineas.map((l, i) => {
            const p = prog(frame, l.a - 3, l.a + 6);
            return (
              <div key={i} style={{...SAIRA, fontSize: 112, lineHeight: 1, color: '#fff', ...contorno(10),
                opacity: p, transform: `translateX(${lerp(80, 0, outExpo(p))}px) rotate(-4deg)`}}>
                {l.txt}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- subtítulos palabra por palabra ----------
type Bloque = {pal: Palabra[]; a: number; b: number};
const BLOQUES_SUB: Bloque[] = (() => {
  const out: Bloque[] = [];
  const visibles = TM.palabras.filter((p) => p.w && p.b > 0 && p.b < TM.bloques.length - 1);
  let cur: Palabra[] = [];
  const cerrar = () => { if (cur.length) out.push({pal: cur, a: 0, b: 0}); cur = []; };
  visibles.forEach((p, i) => {
    const prev = visibles[i - 1];
    const chars = cur.reduce((s, x) => s + x.w.length + 1, 0);
    if (cur.length && (cur.length >= 3 || chars + p.w.length > 17 || p.b !== prev.b || p.t - prev.t > 0.55)) cerrar();
    cur.push(p);
  });
  cerrar();
  out.forEach((bl, i) => {
    bl.a = fr(bl.pal[0].t);
    const finBloque = fr(TM.bloques[bl.pal[0].b].fin) - 2;
    bl.b = i + 1 < out.length && out[i + 1].pal[0].b === bl.pal[0].b ? fr(out[i + 1].pal[0].t) : finBloque;
  });
  return out;
})();

const Subtitulos: React.FC<{frame: number}> = ({frame}) => {
  const bl = BLOQUES_SUB.find((x) => frame >= x.a && frame < x.b);
  if (!bl) return null;
  return (
    <div style={{position: 'absolute', left: 60, width: W - 120, top: 1402, minHeight: 180, display: 'flex',
      flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', columnGap: 22, rowGap: 0}}>
      {bl.pal.map((p, i) => {
        const a = fr(p.t);
        const pp = prog(frame, a, a + 5);
        if (frame < a) return <span key={i} style={{visibility: 'hidden', ...SAIRA, fontSize: 84}}>{p.w.toUpperCase()}</span>;
        return (
          <span key={i} style={{...SAIRA, fontSize: 84, lineHeight: 1.08, textTransform: 'uppercase',
            color: p.clave ? MARCA.rojo : '#fff', ...contorno(11), display: 'inline-block',
            transform: `scale(${lerp(0.75, 1, outBack(pp, 2))}) translateY(${lerp(14, 0, pp)}px)`, opacity: Math.min(1, pp * 2)}}>
            {p.w.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

// ---------- transición entre noticias: barra roja diagonal ----------
const Transicion: React.FC<{frame: number}> = ({frame}) => {
  const cortes = TM.bloques.slice(1, -1).map((b) => fr(b.inicio));
  const c = cortes.find((x) => frame >= x - 6 && frame <= x + 6);
  if (c === undefined) return null;
  const p = inOutCubic(prog(frame, c - 6, c + 6));
  const x = lerp(-2500, 1500, p);
  return (
    <>
      <div style={{position: 'absolute', top: -100, left: x - 140, width: 2000, height: H + 200, background: '#fff', opacity: 0.9, transform: 'skewX(-14deg)'}} />
      <div style={{position: 'absolute', top: -100, left: x, width: 2000, height: H + 200, background: MARCA.rojo, transform: 'skewX(-14deg)'}} />
    </>
  );
};

// ---------- composición completa ----------
export const MoviePlusNews: React.FC = () => {
  const frame = useCurrentFrame();
  const M = TM.montaje;
  const finGancho = fr(TM.bloques[1].inicio);
  return (
    <AbsoluteFill style={{background: MARCA.fondo}}>
      {/* contenido de noticias (debajo de intro y cierre) */}
      {frame >= M.intro - 12 && frame < M.cierreInicio + 10 ? (
        <AbsoluteFill>
          <Fondo f={frame} />
          {frame < finGancho + 1 ? <Gancho frame={frame} /> : null}
          {TM.noticias.map((nt, i) => {
            const ultima = i === TM.noticias.length - 1;
            const finEsc = ultima ? M.cierreInicio + 10 : fr(nt.fin);
            return frame >= fr(nt.inicio) && frame < finEsc ? (
              <Escena key={nt.n} nt={nt} frame={frame} finExtra={ultima ? finEsc : undefined} />
            ) : null;
          })}
          <Encabezado frame={frame} />
          <Subtitulos frame={frame} />
          <Transicion frame={frame} />
        </AbsoluteFill>
      ) : null}
      <Sequence durationInFrames={M.intro}>
        <Intro sinAudio transparenteAlFinal />
      </Sequence>
      <Sequence from={M.cierreInicio} durationInFrames={M.cierre}>
        <Cierre sinAudio transparenteAlInicio />
      </Sequence>
      <Audio src={staticFile('media/2026-11-10/mezcla.wav')} />
    </AbsoluteFill>
  );
};
