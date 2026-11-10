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
const PLAN = plan as unknown as {voz: string; fechaTexto: string; noticias: {n: number; fondo: string; titulo: string; categoria: string}[]};
const FPS = TM.montaje.fps;
const VOZ = TM.montaje.vozOffset;
export const NEWS_DUR = TM.montaje.total;
const TOTAL_NOTICIAS = TM.noticias.length;

// tiempo de voz (s) → cuadro del video
const fr = (tv: number) => Math.round((VOZ + tv) * FPS);

// ---------- estilos ----------
const SAIRA: React.CSSProperties = {fontFamily: 'Saira Condensed', fontWeight: 900, fontStyle: 'italic'};
// Tipografía de los subtítulos: Montserrat Black (distinta de los datos, que van en Bebas Neue).
const SUBT: React.CSSProperties = {fontFamily: 'Montserrat', fontWeight: 900, fontStyle: 'normal', letterSpacing: '-0.01em'};
const contorno = (px: number): React.CSSProperties => ({
  WebkitTextStroke: `${px}px #000`,
  paintOrder: 'stroke fill',
  textShadow: '0 8px 0 rgba(0,0,0,0.55), 0 14px 30px rgba(0,0,0,0.5)',
});

// Tarjeta principal
const CARD = {x: 90, y: 290, w: 900, h: 900, r: 28};
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

// ---------- gancho «5 NOTICIAS DE CINE Y SERIES DE HOY» (centrado) ----------
// El «5» dentro del aro rojo de Movie Plus, abanico con las imágenes de las 5 noticias detrás,
// titular centrado palabra por palabra y la fecha del día.
const Gancho: React.FC<{frame: number}> = ({frame}) => {
  const fin = fr(TM.bloques[1].inicio);
  const pal = TM.palabras.filter((p) => p.b === 0);
  const at = (w: string) => fr(pal.find((p) => p.w.toLowerCase() === w)!.t);
  const a5 = at('5');
  const salida = prog(frame, fin - 6, fin);
  const CX = W / 2;
  const CY = 740;
  const R = 235;
  // abanico de imágenes
  const fondos = PLAN.noticias.map((n) => n.fondo);
  // aro que se dibuja
  const pAro = outExpo(prog(frame, a5 - 2, a5 + 12));
  const circ = 2 * Math.PI * R;
  const p5 = outBack(prog(frame, a5, a5 + 10), 1.8);
  const palabras: {txt: string; a: number; rojo?: boolean; linea: number}[] = [
    {txt: 'NOTICIAS', a: at('noticias'), linea: 0},
    {txt: 'DE', a: at('cine') - 2, linea: 0},
    {txt: 'CINE', a: at('cine'), rojo: true, linea: 0},
    {txt: 'Y', a: at('series') - 2, linea: 1},
    {txt: 'SERIES', a: at('series'), rojo: true, linea: 1},
    {txt: 'DE', a: at('hoy') - 2, linea: 1},
    {txt: 'HOY', a: at('hoy'), linea: 1},
  ];
  const pFecha = outBack(prog(frame, at('hoy') + 4, at('hoy') + 13), 2);
  return (
    <AbsoluteFill style={{opacity: 1 - salida, transform: `scale(${lerp(1, 1.06, salida)})`}}>
      {/* abanico de las 5 noticias */}
      {fondos.map((src, i) => {
        const k = i - 2;
        const p = outExpo(prog(frame, a5 - 8 + i * 2, a5 + 6 + i * 2));
        const deriva = prog(frame, a5, fin) * 14 * Math.sign(k || 1);
        return (
          <div key={i} style={{position: 'absolute', left: CX - 150 + k * 175 + deriva, top: CY - 210 + Math.abs(k) * 34,
            width: 300, height: 420, borderRadius: 22, overflow: 'hidden', opacity: 0.42 * p,
            transform: `translateY(${lerp(260, 0, p)}px) rotate(${k * 9}deg)`, boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            zIndex: 2 - Math.abs(k)}}>
            <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6) saturate(0.9)'}} />
          </div>
        );
      })}
      {/* viñeta para que el centro respire */}
      <AbsoluteFill style={{zIndex: 5, background: `radial-gradient(circle at 50% ${CY / 19.2}%, rgba(11,13,18,0.92) 0%, rgba(11,13,18,0.55) 22%, rgba(11,13,18,0) 45%)`}} />
      {/* aro rojo + «5» */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, zIndex: 10}}>
        <circle cx={CX} cy={CY} r={R - 18} fill="rgba(11,13,18,0.88)" opacity={pAro} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={MARCA.rojo} strokeWidth={26} strokeLinecap="round"
          strokeDasharray={`${circ * 0.84 * pAro} ${circ}`} transform={`rotate(${lerp(-200, -62, pAro)} ${CX} ${CY})`} />
        <circle cx={CX + R * Math.cos((-50 * Math.PI) / 180)} cy={CY + R * Math.sin((-50 * Math.PI) / 180)}
          r={15 * outBack(prog(frame, a5 + 8, a5 + 14), 3)} fill={MARCA.rojo} />
      </svg>
      <div style={{position: 'absolute', zIndex: 11, left: 0, width: W, top: CY - 215, height: 430, display: 'flex',
        alignItems: 'center', justifyContent: 'center'}}>
        <div style={{...SAIRA, fontSize: 380, lineHeight: 1, color: '#fff', ...contorno(10),
          textShadow: `0 0 50px rgba(237,28,36,0.55), 0 12px 0 rgba(0,0,0,0.5)`,
          transform: `scale(${lerp(2.2, 1, p5)}) translateX(-8px)`, opacity: Math.min(1, prog(frame, a5 - 1, a5 + 4))}}>
          5
        </div>
      </div>
      {/* titular centrado */}
      {[0, 1].map((linea) => (
        <div key={linea} style={{position: 'absolute', zIndex: 11, left: 0, width: W, top: 1030 + linea * 128, display: 'flex',
          justifyContent: 'center', gap: 22}}>
          {palabras.filter((x) => x.linea === linea).map((x, i) => {
            const p = prog(frame, x.a - 2, x.a + 6);
            return (
              <span key={i} style={{...SAIRA, fontSize: 124, lineHeight: 1, color: x.rojo ? MARCA.rojo : '#fff', ...contorno(10),
                display: 'inline-block', opacity: Math.min(1, p * 2),
                transform: `translateY(${lerp(40, 0, outExpo(p))}px) scale(${lerp(1.3, 1, outBack(p, 2))})`}}>
                {x.txt}
              </span>
            );
          })}
        </div>
      ))}
      {/* fecha del día */}
      <div style={{position: 'absolute', zIndex: 11, left: 0, width: W, top: 1300, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: MARCA.rojo, color: '#fff', fontFamily: 'Bebas Neue', fontSize: 46, letterSpacing: '0.12em',
          padding: '6px 34px 2px', borderRadius: 999, transform: `scale(${pFecha})`, boxShadow: '0 10px 30px rgba(237,28,36,0.4)'}}>
          {PLAN.fechaTexto}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- subtítulos palabra por palabra ----------
type Bloque = {pal: Palabra[]; a: number; b: number};
const BLOQUES_SUB: Bloque[] = (() => {
  const out: Bloque[] = [];
  const visibles = TM.palabras.filter((p) => p.w && p.b > 0 && p.b <= TOTAL_NOTICIAS);
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
    <div style={{position: 'absolute', left: 60, width: W - 120, top: 1470, minHeight: 170, display: 'flex',
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

// ---------- transición entre noticias: barra roja diagonal ----------
const Transicion: React.FC<{frame: number}> = ({frame}) => {
  const cortes = TM.bloques.slice(1, TOTAL_NOTICIAS + 1).map((b) => fr(b.inicio));
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
