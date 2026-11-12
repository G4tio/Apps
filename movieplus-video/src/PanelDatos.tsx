import React from 'react';
import {MARCA, prog, lerp, outBack, outCubic, outExpo, clamp} from './marca';

// Panel de datos con motion graphics, debajo de la imagen de cada noticia.
export type Dato = {
  tipo: 'titulo' | 'nombre' | 'fecha' | 'contador' | 'insignia' | 'comparacion' | 'salto' | 'bloques' | 'lista';
  texto: string; sub?: string; t: number;
  valor?: number; prefijo?: string; sufijo?: string; mes?: string; dia?: string; a?: string; b?: string;
  categoria?: string;
  decimales?: number; // contador con decimales (p. ej. 1.5)
  icono?: 'trofeo' | 'prohibido'; // insignia
  valorA?: number; valorB?: number; etiqueta?: string; // comparación con valores reales
  items?: {texto: string; t: number}[]; // lista: cada punto se marca en su palabra
  etiquetaBloque?: string; // texto de cada ficha en `bloques` (por defecto «EP»)
};

export const PANEL = {x: 90, y: 1226, w: 900, h: 212};

// Tipografía de los datos: Bebas Neue (distinta de los subtítulos, que van en Montserrat Black).
const SAIRA: React.CSSProperties = {fontFamily: 'Bebas Neue', fontWeight: 400, fontStyle: 'normal', letterSpacing: '0.02em'};
const SUB: React.CSSProperties = {
  fontFamily: 'Bebas Neue', fontWeight: 400, fontSize: 30, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.72)',
};
const ROJO = MARCA.rojo;

// Texto que se revela de izquierda a derecha
const Revela: React.FC<{p: number; children: React.ReactNode; style?: React.CSSProperties}> = ({p, children, style}) => (
  <div style={{clipPath: `inset(-20% ${100 - clamp(p) * 100}% -20% -5%)`, ...style}}>{children}</div>
);

const Titular: React.FC<{f: number; texto: string; sub?: string; size?: number}> = ({f, texto, sub, size = 74}) => (
  <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, minWidth: 0}}>
    <Revela p={outExpo(prog(f, 2, 14))}>
      <div style={{...SAIRA, fontSize: size * 1.12, lineHeight: 0.95, color: '#fff', whiteSpace: 'nowrap'}}>{texto}</div>
    </Revela>
    {sub ? (
      <div style={{...SUB, opacity: prog(f, 8, 16), transform: `translateX(${lerp(-20, 0, outCubic(prog(f, 8, 16)))}px)`}}>{sub}</div>
    ) : null}
  </div>
);

// ---------- tipos ----------
const Titulo: React.FC<{d: Dato; f: number}> = ({d, f}) => (
  <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, height: '100%'}}>
    {d.categoria ? (
      <div style={{alignSelf: 'flex-start', background: ROJO, color: '#fff', ...SAIRA, fontSize: 30,
        letterSpacing: '0.1em', padding: '4px 20px 6px', borderRadius: 999,
        transform: `scale(${outBack(prog(f, 0, 9), 2)})`, transformOrigin: 'left center'}}>
        {d.categoria}
      </div>
    ) : null}
    <Revela p={outExpo(prog(f, 4, 18))}>
      <div style={{...SAIRA, fontSize: d.texto.length > 18 ? Math.min(74, Math.round(800 / (d.texto.length * 0.42))) : 88, lineHeight: 0.95, color: '#fff', whiteSpace: 'nowrap'}}>{d.texto}</div>
    </Revela>
  </div>
);

const Nombre: React.FC<{d: Dato; f: number}> = ({d, f}) => {
  const p = outBack(prog(f, 0, 10), 2);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 30, height: '100%'}}>
      <div style={{width: 128, height: 128, borderRadius: '50%', background: ROJO, flex: 'none', transform: `scale(${p})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(237,28,36,0.45)'}}>
        <svg width="74" height="74" viewBox="0 0 24 24" fill="#fff">
          <circle cx="12" cy="8" r="4.2" />
          <path d="M3.5 21c.8-4.6 4.2-7.2 8.5-7.2s7.7 2.6 8.5 7.2z" />
        </svg>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        <Revela p={outExpo(prog(f, 3, 15))}>
          <div style={{...SAIRA, fontSize: 88, lineHeight: 0.95, color: '#fff', whiteSpace: 'nowrap'}}>{d.texto}</div>
        </Revela>
        <div style={{height: 5, width: `${outExpo(prog(f, 6, 18)) * 100}%`, background: ROJO, borderRadius: 3}} />
        <div style={{...SUB, opacity: prog(f, 10, 18)}}>{d.sub}</div>
      </div>
    </div>
  );
};

const Fecha: React.FC<{d: Dato; f: number}> = ({d, f}) => {
  const flip = outBack(prog(f, 0, 14), 1.4);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 34, height: '100%'}}>
      <div style={{perspective: 600, flex: 'none'}}>
        <div style={{width: 140, height: 160, borderRadius: 16, overflow: 'hidden', background: '#fff',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)', transformOrigin: 'top center',
          transform: `rotateX(${lerp(-100, 0, flip)}deg)`}}>
          <div style={{height: 50, background: ROJO, color: '#fff', ...SAIRA, fontSize: 34, display: 'flex',
            alignItems: 'center', justifyContent: 'center', letterSpacing: '0.08em'}}>{d.mes}</div>
          <div style={{height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', ...SAIRA,
            fontSize: 96, color: '#111', fontStyle: 'normal'}}>{d.dia}</div>
        </div>
      </div>
      <Titular f={f} texto={d.texto} sub={d.sub} />
    </div>
  );
};

const Contador: React.FC<{d: Dato; f: number}> = ({d, f}) => {
  const p = outCubic(prog(f, 0, 22));
  const dec = d.decimales ?? 0;
  const v = ((d.valor ?? 0) * p).toFixed(dec);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 34, height: '100%'}}>
      <div style={{...SAIRA, fontSize: 150, lineHeight: 0.9, color: '#fff', whiteSpace: 'nowrap',
        transform: `scale(${lerp(0.7, 1, outBack(prog(f, 0, 10), 2))})`, transformOrigin: 'left center', minWidth: 300}}>
        {d.prefijo}{v}<span style={{color: ROJO}}>{d.sufijo}</span>
      </div>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div style={{...SUB}}>{d.sub}</div>
        <div style={{height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.12)', overflow: 'hidden', position: 'relative'}}>
          <div style={{width: `${p * 100}%`, height: '100%', borderRadius: 11,
            background: `linear-gradient(90deg, #8E0F14, ${ROJO})`, boxShadow: '0 0 18px rgba(237,28,36,0.7)'}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', ...SUB, fontSize: 18, opacity: 0.6}}>
          <span>0</span><span>{d.prefijo}{d.valor}{d.sufijo}</span>
        </div>
      </div>
    </div>
  );
};

const Insignia: React.FC<{d: Dato; f: number}> = ({d, f}) => {
  const p = outBack(prog(f, 0, 12), 2.2);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 30, height: '100%'}}>
      <div style={{position: 'relative', width: 150, height: 150, flex: 'none'}}>
        <svg width="150" height="150" viewBox="-75 -75 150 150" style={{position: 'absolute', inset: 0,
          transform: `rotate(${f * 2}deg) scale(${p})`, opacity: 0.55}}>
          {Array.from({length: 12}, (_, i) => (
            <polygon key={i} points="-6,-30 6,-30 0,-74" fill={ROJO} transform={`rotate(${i * 30})`} />
          ))}
        </svg>
        {d.icono === 'prohibido' ? (
          <svg width="150" height="150" viewBox="0 0 64 64" style={{position: 'absolute', inset: 0, transform: `scale(${p * 0.8})`}}>
            <text x="32" y="43" textAnchor="middle" fontFamily="Bebas Neue" fontSize="34" fill="#fff">$</text>
            <circle cx="32" cy="32" r="24" fill="none" stroke={ROJO} strokeWidth="7" />
            <line x1="15" y1="49" x2="49" y2="15" stroke={ROJO} strokeWidth="7" strokeLinecap="round" />
          </svg>
        ) : (
        <svg width="150" height="150" viewBox="0 0 64 64" style={{position: 'absolute', inset: 0, transform: `scale(${p * 0.78})`}}>
          <path d="M18 8h28v10c0 9-6 16-14 16S18 27 18 18z" fill="#F5C443" />
          <path d="M18 12H9c0 8 4 13 10 13M46 12h9c0 8-4 13-10 13" fill="none" stroke="#F5C443" strokeWidth="4" />
          <rect x="28" y="33" width="8" height="10" fill="#E0A92B" />
          <rect x="20" y="43" width="24" height="7" rx="2" fill="#F5C443" />
          <path d="M32 14l2.4 5 5.4.6-4 3.7 1.1 5.3L32 26l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z" fill="#fff" />
        </svg>
        )}
      </div>
      <Titular f={f} texto={d.texto} sub={d.sub} />
    </div>
  );
};

const Comparacion: React.FC<{d: Dato; f: number}> = ({d, f}) => {
  const pa = outExpo(prog(f, 4, 22));
  const ratio = d.valorA && d.valorB !== undefined ? Math.max(0.04, d.valorB / d.valorA) : 0.72;
  const pb = outExpo(prog(f, 8, 24)) * ratio;
  const check = outBack(prog(f, 22, 30), 2.5);
  const fila = (label: string, ancho: number, color: string, glow: boolean) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <div style={{...SAIRA, fontSize: 34, color: '#fff', width: 330, whiteSpace: 'nowrap', textAlign: 'right'}}>{label}</div>
      <div style={{flex: 1, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', overflow: 'hidden'}}>
        <div style={{width: `${ancho * 100}%`, height: '100%', borderRadius: 8, background: color,
          boxShadow: glow ? '0 0 18px rgba(237,28,36,0.7)' : 'none'}} />
      </div>
    </div>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, height: '100%', position: 'relative'}}>
      <div style={{...SUB, marginLeft: 348}}>{d.sub}</div>
      {fila(d.a ?? '', pa, `linear-gradient(90deg, #8E0F14, ${ROJO})`, true)}
      {fila(d.b ?? '', pb, 'rgba(255,255,255,0.45)', false)}
      <div style={{position: 'absolute', right: 0, top: 6, background: '#fff', color: ROJO, ...SAIRA, fontSize: 30,
        padding: '2px 16px 4px', borderRadius: 999, transform: `scale(${check})`}}>{d.etiqueta ?? '✓ SUPERA'}</div>
    </div>
  );
};

const Salto: React.FC<{d: Dato; f: number}> = ({d, f}) => {
  const n = d.valor ?? 1;
  const p = outCubic(prog(f, 4, 26));
  const v = Math.round(n * p);
  const W = 470;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 28, height: '100%'}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 6, minWidth: 300}}>
        <div style={{...SAIRA, fontSize: 120, lineHeight: 0.9, color: '#fff', whiteSpace: 'nowrap'}}>
          {d.texto.startsWith('+') ? '+' : ''}{v}<span style={{color: ROJO}}> AÑOS</span>
        </div>
        <div style={{...SUB, fontSize: 27, opacity: prog(f, 10, 18)}}>{d.sub}</div>
      </div>
      <svg width={W + 30} height="120" viewBox={`-15 -60 ${W + 30} 120`}>
        <line x1="0" y1="0" x2={W} y2="0" stroke="rgba(255,255,255,0.18)" strokeWidth="6" strokeLinecap="round" />
        <line x1="0" y1="0" x2={W * p} y2="0" stroke={ROJO} strokeWidth="6" strokeLinecap="round" />
        {Array.from({length: n + 1}, (_, i) => {
          const x = (W * i) / n;
          const on = W * p >= x - 1;
          return <circle key={i} cx={x} cy="0" r={on ? 9 : 6} fill={on ? ROJO : 'rgba(255,255,255,0.35)'} />;
        })}
        <circle cx={W * p} cy="0" r="17" fill="#fff" stroke={ROJO} strokeWidth="6" />
        <text x="0" y="44" fill="rgba(255,255,255,0.6)" fontFamily="Bebas Neue" fontSize="24" letterSpacing="2">ANTES</text>
        <text x={W} y="44" textAnchor="end" fill="#fff" fontFamily="Bebas Neue" fontSize="24" letterSpacing="2">AHORA</text>
      </svg>
    </div>
  );
};

const Bloques: React.FC<{d: Dato; f: number}> = ({d, f}) => {
  const n = d.valor ?? 1;
  const ancho = Math.min(92, Math.floor(470 / n) - 10);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 30, height: '100%'}}>
      <div style={{display: 'flex', gap: n > 4 ? 8 : 14}}>
        {Array.from({length: n}, (_, i) => {
          const p = outBack(prog(f, i * 4, i * 4 + 10), 2.4);
          return (
            <div key={i} style={{width: ancho, height: n > 4 ? 96 : 120, borderRadius: n > 4 ? 10 : 14, background: i === 0 ? ROJO : '#fff',
              transform: `scale(${p}) translateY(${lerp(30, 0, p)}px)`, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4, boxShadow: '0 10px 24px rgba(0,0,0,0.45)'}}>
              <svg width={n > 4 ? 28 : 40} height={n > 4 ? 28 : 40} viewBox="0 0 24 24">
                <path d="M8 6l11 6-11 6z" fill={i === 0 ? '#fff' : ROJO} />
              </svg>
              <div style={{...SAIRA, fontSize: n > 4 ? 20 : 26, color: i === 0 ? '#fff' : '#111'}}>{n > 4 ? i + 1 : `${d.etiquetaBloque ?? 'EP'} ${i + 1}`}</div>
            </div>
          );
        })}
      </div>
      <Titular f={f} texto={d.texto} sub={d.sub} size={68} />
    </div>
  );
};


// lista con palomitas: cada punto se marca en su palabra (f0 = inicio del dato, fps 30)
const Lista: React.FC<{d: Dato; f: number}> = ({d, f}) => {
  const items = d.items ?? [];
  const t0 = d.t;
  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, height: '100%'}}>
      {items.map((it, i) => {
        const a = Math.max(0, Math.round((it.t - t0) * 30));
        const p = outBack(prog(f, a, a + 8), 2.4);
        const on = f >= a;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: on ? 1 : 0.35}}>
            <div style={{width: 50, height: 50, borderRadius: '50%', flex: 'none', border: `3px solid ${on ? ROJO : 'rgba(255,255,255,0.4)'}`,
              background: on ? ROJO : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="30" height="30" viewBox="0 0 24 24" style={{transform: `scale(${on ? p : 0})`}}>
                <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{...SAIRA, fontSize: 58, lineHeight: 1, color: '#fff', whiteSpace: 'nowrap'}}>{it.texto}</div>
          </div>
        );
      })}
    </div>
  );
};

const VISTAS: Record<Dato['tipo'], React.FC<{d: Dato; f: number}>> = {
  titulo: Titulo, nombre: Nombre, fecha: Fecha, contador: Contador, insignia: Insignia,
  comparacion: Comparacion, salto: Salto, bloques: Bloques, lista: Lista,
};

/** Panel completo: caja + dato actual (entra desde la derecha, el anterior sale a la izquierda). */
export const PanelDatos: React.FC<{
  datos: {d: Dato; a: number; b: number}[]; frame: number; inicio: number;
}> = ({datos, frame, inicio}) => {
  const caja = outBack(prog(frame, inicio + 2, inicio + 14), 1.4);
  if (caja <= 0) return null;
  return (
    <div style={{position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h,
      transform: `scaleY(${caja})`, transformOrigin: 'top center'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 26, overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(30,32,42,0.94), rgba(12,13,18,0.94))',
        border: '2px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.55)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: ROJO}} />
        {datos.map(({d, a, b}, i) => {
          if (frame < a || frame >= b + 6) return null;
          const fl = frame - a;
          const pin = outExpo(prog(fl, 0, 10));
          const pout = prog(frame, b, b + 6);
          const Vista = VISTAS[d.tipo];
          return (
            <div key={i} style={{position: 'absolute', left: 44, right: 34, top: 0, bottom: 0,
              opacity: Math.min(pin, 1 - pout),
              transform: `translateX(${lerp(60, 0, pin) + lerp(0, -60, pout)}px)`}}>
              <Vista d={d} f={fl} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
