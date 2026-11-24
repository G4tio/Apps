import React from 'react';
import {
  AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame,
} from 'remotion';
import {Intro} from './Intro';
import {Cierre} from './Cierre';
import {Fondo} from './Logo';
import {MARCA, W, H, prog, lerp, outBack, outCubic, outExpo} from './marca';
import {plan, timing} from './videos/historia';
import {PanelDatos, Dato} from './PanelDatos';

// Formato «HISTORIA»: una sola historia cronológica narrada, con un chiste recurrente que el narrador
// corrige en un corte en blanco y negro (imagen congelada + sello FALSO + disco rayado).
// Bloque 0 = gancho (la voz arranca casi en el segundo 0, sobre una intro de ~0,5 s).

type Medio = {
  tipo: 'imagen' | 'video'; src: string; t: number; desde?: number; hasta?: number;
  ajuste?: 'contain' | 'cover'; foco?: string; archivo?: string; zoom?: number; etiqueta?: string;
};
type Bloq = {n: number; inicio: number; fin: number; medios: Medio[]; rotulos: (Dato & {a?: string})[]};
type Palabra = {w: string; t: number; b: number; clave: boolean};

const TM = timing as unknown as {
  palabras: Palabra[]; bloques: {bloque: number; inicio: number; fin: number}[];
  noticias: Bloq[];
  montaje: {fps: number; intro: number; vozOffset: number; cierreInicio: number; cierre: number; total: number};
};
const PLAN = plan as unknown as {
  titulo: string;
  noticias: {n: number; fondo: string; titulo: string; categoria: string; chiste?: boolean}[];
};
const FPS = TM.montaje.fps;
const VOZ = TM.montaje.vozOffset;
export const HISTORIA_DUR = TM.montaje.total;
const fr = (tv: number) => Math.round((VOZ + tv) * FPS);
const esChiste = (n: number) => !!PLAN.noticias.find((x) => x.n === n)?.chiste;

const SAIRA: React.CSSProperties = {fontFamily: 'Saira Condensed', fontWeight: 900, fontStyle: 'italic'};
const SUBT: React.CSSProperties = {fontFamily: 'Montserrat', fontWeight: 900, fontStyle: 'normal', letterSpacing: '-0.01em'};
const contorno = (px: number): React.CSSProperties => ({
  WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill',
  textShadow: '0 8px 0 rgba(0,0,0,0.55), 0 14px 30px rgba(0,0,0,0.5)',
});
const CARD = {x: 90, y: 290, w: 900, h: 900, r: 28};
const ZOOM_VIDEO = 1.2;

// ---------- medio (imagen o fragmento de video) ----------
const VistaMedio: React.FC<{m: Medio; dur: number; f: number; congelado?: boolean}> = ({m, dur, f, congelado}) => {
  // f = cuadro local desde que empieza este medio; congelado = cuadro fijo (bloques de chiste)
  const pIn = congelado ? 1 : outCubic(prog(f, 0, 7));
  const zoom = congelado ? 1.06 : lerp(1, 1.06, prog(f, 0, dur));
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
      m.ajuste === 'contain' ? (
        <>
          {/* cuadro completo (p. ej. placas de texto horizontales) sobre su propio fondo desenfocado */}
          <OffthreadVideo src={staticFile(m.archivo!)} muted
            style={{...base, objectFit: 'cover', filter: 'blur(28px) brightness(0.45)', transform: 'scale(1.2)'}} />
          <OffthreadVideo src={staticFile(m.archivo!)} muted
            style={{...base, objectFit: 'contain', transform: `scale(${zoom})`}} />
        </>
      ) : (
        <OffthreadVideo
          src={staticFile(m.archivo!)}
          muted
          style={{...base, objectPosition: 'center center', transform: `scale(${(m.zoom ?? ZOOM_VIDEO) * zoom})`}}
        />
      )
    );
  }
  return (
    <AbsoluteFill style={{opacity: pIn, transform: `scale(${lerp(1.07, 1, pIn)})`}}>
      {contenido}
      {/* etiqueta visible para imágenes no oficiales (p. ej. hechas con IA) */}
      {m.etiqueta ? (
        <div style={{position: 'absolute', left: 24, top: 24, zIndex: 60, background: 'rgba(0,0,0,0.72)', color: '#fff',
          fontFamily: 'Bebas Neue', fontSize: 34, letterSpacing: '0.1em', padding: '6px 18px 4px', borderRadius: 10,
          border: '2px solid rgba(255,255,255,0.35)'}}>
          {m.etiqueta}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- escena de un bloque ----------
const Escena: React.FC<{nt: Bloq; frame: number; finEsc: number}> = ({nt, frame, finEsc}) => {
  const ini = fr(nt.inicio);
  const fin = finEsc;
  const fl = frame - ini;
  const info = PLAN.noticias.find((x) => x.n === nt.n)!;
  const chiste = !!info.chiste;
  // el chiste congela el último cuadro del bloque anterior: sin animación de entrada
  const pop = chiste ? 1 : outBack(prog(fl, 0, 12), 1.6);
  const medios = nt.medios.map((m, i) => ({
    m, a: fr(m.t), b: i + 1 < nt.medios.length ? fr(nt.medios[i + 1].t) : fin,
  }));
  const idx = Math.max(0, medios.findIndex((x) => frame >= x.a && frame < x.b));
  const lista: Dato[] = [
    {tipo: 'titulo', texto: info.titulo, categoria: info.categoria, t: nt.inicio} as Dato,
    ...(nt.rotulos as unknown as Dato[]),
  ];
  const datos = lista.map((d, i) => ({d, a: i === 0 ? ini : fr(d.t), b: i + 1 < lista.length ? fr(lista[i + 1].t) : fin}));
  return (
    <AbsoluteFill>
      <Img src={staticFile(info.fondo)}
        style={{position: 'absolute', inset: -120, width: W + 240, height: H + 240, objectFit: 'cover',
          filter: 'blur(42px) brightness(0.42) saturate(1.1)',
          transform: `scale(${chiste ? 1.2 : lerp(1.15, 1.2, prog(fl, 0, fin - ini))})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,13,18,0.85) 0%, rgba(11,13,18,0.15) 30%, rgba(11,13,18,0.25) 62%, rgba(11,13,18,0.92) 100%)'}} />
      <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: CARD.r,
        overflow: 'hidden', background: '#05070b', boxShadow: '0 40px 90px rgba(0,0,0,0.65)',
        outline: '3px solid rgba(255,255,255,0.10)',
        transform: `scale(${lerp(0.86, 1, pop)})`, opacity: chiste ? 1 : prog(fl, 0, 4)}}>
        {medios.map(({m, a, b}, i) =>
          i === idx || (!chiste && i === idx - 1 && frame - medios[idx].a < 8) ? (
            <AbsoluteFill key={i} style={{zIndex: i}}>
              <Sequence from={a} layout="none">
                <VistaMedio m={m} dur={b - a} f={frame - a} congelado={chiste} />
              </Sequence>
            </AbsoluteFill>
          ) : null,
        )}
        <AbsoluteFill style={{zIndex: 50, background: 'linear-gradient(180deg, rgba(0,0,0,0) 75%, rgba(0,0,0,0.3) 100%)'}} />
      </div>
      {!chiste ? <PanelDatos datos={datos} frame={frame} inicio={ini} /> : null}
    </AbsoluteFill>
  );
};

// ---------- sello FALSO (sobre el cuadro congelado en blanco y negro) ----------
const Sello: React.FC<{frame: number; a: number}> = ({frame, a}) => {
  const f = frame - a - 3;
  if (f < 0) return null;
  const p = outBack(prog(f, 0, 7), 1.2);
  const tiembla = f < 10 ? Math.sin(f * 2.6) * (10 - f) * 0.6 : 0;
  return (
    <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 90}}>
      <div style={{transform: `translate(${tiembla}px, ${-tiembla * 0.5}px) rotate(-12deg) scale(${lerp(2.4, 1, p)})`,
        opacity: Math.min(1, prog(f, 0, 3)), border: `14px solid ${MARCA.rojo}`, borderRadius: 26, padding: '8px 54px 0',
        boxShadow: `inset 0 0 0 6px rgba(0,0,0,0.25), 0 0 0 6px rgba(237,28,36,0.25)`, background: 'rgba(0,0,0,0.25)'}}>
        <div style={{fontFamily: 'Bebas Neue', fontSize: 300, lineHeight: 0.95, color: MARCA.rojo, letterSpacing: '0.06em',
          textShadow: '0 6px 24px rgba(0,0,0,0.45)'}}>FALSO</div>
      </div>
    </div>
  );
};

// ---------- encabezado: línea de tiempo con los hitos ----------
const HITOS = TM.noticias.flatMap((nt) => nt.rotulos.filter((r) => r.tipo === 'hito').map((r) => ({a: r.a!, t: r.t})));
const Encabezado: React.FC<{frame: number}> = ({frame}) => {
  const pIn = outExpo(prog(frame, 6, 20));
  const activo = HITOS.reduce((k, h, i) => (frame >= fr(h.t) ? i : k), -1);
  const avance = prog(frame, 0, TM.montaje.cierreInicio);
  return (
    <div style={{position: 'absolute', left: CARD.x, top: 140, width: CARD.w, opacity: pIn, transform: `translateY(${lerp(-30, 0, pIn)}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 54, height: 54, borderRadius: '50%', background: MARCA.rojo, display: 'flex', flex: 'none',
          alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(237,28,36,0.4)'}}>
          <Img src={staticFile('logo/estrella.png')} style={{width: 34, height: 35}} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'space-between', position: 'relative'}}>
          <div style={{position: 'absolute', left: 10, right: 10, top: '50%', height: 3, background: 'rgba(255,255,255,0.18)'}} />
          {HITOS.map((h, i) => {
            const on = i === activo; const pasado = i < activo;
            const pp = outBack(prog(frame, fr(h.t), fr(h.t) + 10), 2);
            return (
              <div key={i} style={{position: 'relative', fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: '0.06em',
                padding: '6px 18px 2px', borderRadius: 999, whiteSpace: 'nowrap',
                background: on ? MARCA.rojo : '#0b0d12', color: on || pasado ? '#fff' : 'rgba(255,255,255,0.45)',
                border: `3px solid ${on || pasado ? MARCA.rojo : 'rgba(255,255,255,0.25)'}`,
                transform: `scale(${on ? lerp(1, 1.12, pp) : 1})`, boxShadow: on ? '0 8px 24px rgba(237,28,36,0.45)' : 'none'}}>
                {h.a}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{marginTop: 18, height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}>
        <div style={{width: `${avance * 100}%`, height: '100%', background: MARCA.rojo}} />
      </div>
    </div>
  );
};

// ---------- subtítulos palabra por palabra (todos los bloques) ----------
type BloqueSub = {pal: Palabra[]; a: number; b: number};
const BLOQUES_SUB: BloqueSub[] = (() => {
  const out: BloqueSub[] = [];
  const visibles = TM.palabras.filter((p) => p.w);
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
    <div style={{position: 'absolute', left: 60, width: W - 120, top: 1470, minHeight: 170, display: 'flex', zIndex: 95,
      flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', columnGap: 18, rowGap: 0}}>
      {bl.pal.map((p, i) => {
        const a = fr(p.t);
        const pp = prog(frame, a, a + 5);
        if (frame < a) return <span key={i} style={{visibility: 'hidden', ...SUBT, fontSize: 66}}>{p.w.toUpperCase()}</span>;
        return (
          <span key={i} style={{...SUBT, fontSize: 66, lineHeight: 1.15, textTransform: 'uppercase',
            color: p.clave ? MARCA.rojo : '#fff', ...contorno(11), display: 'inline-block',
            transform: `scale(${lerp(0.75, 1, outBack(pp, 2))}) translateY(${lerp(14, 0, pp)}px)`, opacity: Math.min(1, pp * 2)}}>
            {p.w.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

// ---------- composición ----------
export const MoviePlusHistoria: React.FC = () => {
  const frame = useCurrentFrame();
  const M = TM.montaje;
  const actual = TM.noticias.findIndex((nt, i) =>
    frame >= (i === 0 ? 0 : fr(nt.inicio)) && frame < (i === TM.noticias.length - 1 ? M.cierreInicio + 10 : fr(nt.fin)));
  const nt = actual >= 0 ? TM.noticias[actual] : null;
  const chiste = nt ? esChiste(nt.n) : false;
  const aChiste = nt ? fr(nt.inicio) : 0;
  // destello blanco de 2 cuadros al congelar
  const destello = chiste ? 1 - prog(frame, aChiste, aChiste + 4) : 0;
  return (
    <AbsoluteFill style={{background: MARCA.fondo}}>
      {frame < M.cierreInicio + 10 ? (
        <AbsoluteFill>
          <AbsoluteFill style={{filter: chiste ? 'grayscale(1) contrast(1.15) brightness(0.9)' : undefined}}>
            <Fondo f={frame} />
            {nt ? <Escena key={nt.n} nt={nt} frame={frame}
              finEsc={actual === TM.noticias.length - 1 ? M.cierreInicio + 10 : fr(nt.fin)} /> : null}
          </AbsoluteFill>
          {chiste ? <Sello frame={frame} a={aChiste} /> : null}
          <Encabezado frame={frame} />
          <Subtitulos frame={frame} />
          {destello > 0 ? <AbsoluteFill style={{background: '#fff', opacity: destello * 0.85, zIndex: 99}} /> : null}
        </AbsoluteFill>
      ) : null}
      {/* intro acortada: cuadros 60–75 de la intro (logo completo + barrido rojo), mientras ya suena la voz */}
      <Sequence from={-60} durationInFrames={76}>
        <Intro sinAudio transparenteAlFinal />
      </Sequence>
      <Sequence from={M.cierreInicio} durationInFrames={M.cierre}>
        <Cierre sinAudio transparenteAlInicio />
      </Sequence>
    </AbsoluteFill>
  );
};

