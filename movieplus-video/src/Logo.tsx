import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import capas from './logo-layers.json';
import {MARCA, W, H, clamp, lerp} from './marca';

type Capa = {x: number; y: number; w: number; h: number};
const C = capas.capas as Record<string, Capa>;

// Geometría del logo (en píxeles del PNG original 1225×463).
export const LOGO = {
  cx: 612.5, // centro del contenido
  cy: 231,
  aroCx: 525, // centro del aro
  aroCy: 231,
  aroExt: 171,
  aroInt: 149,
};

export const LETRAS = ['m', 'v', 'i', 'e'] as const;
export const PLUS = ['p', 'l', 'u', 's'] as const;

/** Fondo negro cinematográfico con resplandor y partículas suaves. */
export const Fondo: React.FC<{f: number; glow?: number}> = ({f, glow = 1}) => {
  const dots = Array.from({length: 26}, (_, i) => {
    const r = (n: number) => {
      const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    return {
      x: r(1) * W,
      y: (r(2) * H - f * (0.4 + r(3) * 0.8)) % H,
      s: 2 + r(4) * 5,
      o: 0.08 + r(5) * 0.22,
    };
  });
  return (
    <AbsoluteFill style={{background: MARCA.fondo}}>
      <AbsoluteFill
        style={{
          opacity: glow,
          background: `radial-gradient(circle at 50% 48%, ${MARCA.fondoGlow} 0%, rgba(11,13,18,0) 62%)`,
        }}
      />
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: d.x,
            top: (d.y + H) % H,
            width: d.s,
            height: d.s,
            borderRadius: '50%',
            background: '#9FB4D8',
            opacity: d.o * glow,
            filter: 'blur(1.5px)',
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** Capa del logo posicionada en coordenadas del PNG original. */
export const Capa: React.FC<{
  n: string;
  style?: React.CSSProperties;
  inner?: React.CSSProperties;
  clip?: boolean;
}> = ({n, style, inner, clip}) => {
  const c = C[n];
  return (
    <div
      style={{
        position: 'absolute',
        left: c.x,
        top: c.y,
        width: c.w,
        height: c.h,
        overflow: clip ? 'hidden' : 'visible',
        ...style,
      }}
    >
      <Img
        src={staticFile(`logo/${n}.png`)}
        style={{width: c.w, height: c.h, display: 'block', ...inner}}
      />
    </div>
  );
};

/** Estrella con barrido de luz (brillo). shine: 0→1 recorre la estrella. */
export const Estrella: React.FC<{shine: number; style?: React.CSSProperties}> = ({
  shine,
  style,
}) => {
  const c = C.estrella;
  const url = `url(${staticFile('logo/estrella.png')})`;
  const pos = lerp(-60, 160, clamp(shine));
  return (
    <div style={{position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h, ...style}}>
      <Img src={staticFile('logo/estrella.png')} style={{width: c.w, height: c.h, display: 'block'}} />
      {shine > 0 && shine < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            WebkitMaskImage: url,
            maskImage: url,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            background: `linear-gradient(115deg, rgba(237,28,36,0) ${pos - 22}%, rgba(255,120,120,0.95) ${pos}%, rgba(237,28,36,0) ${pos + 22}%)`,
            mixBlendMode: 'normal',
          }}
        />
      ) : null}
    </div>
  );
};

/**
 * Aro rojo "líquido": un disco que se contrae hasta convertirse en el aro.
 * k = 0 → cubre toda la pantalla; k = 1 → aro final (radios del logo × escala).
 */
export const AroContraccion: React.FC<{
  k: number;
  cx: number;
  cy: number;
  escala: number;
  opacity?: number;
}> = ({k, cx, cy, escala, opacity = 1}) => {
  const ext = lerp(2400, LOGO.aroExt * escala, k);
  const int = lerp(0, LOGO.aroInt * escala, Math.pow(k, 0.8));
  const r = (ext + int) / 2;
  const sw = Math.max(0, ext - int);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={MARCA.rojo} strokeWidth={sw} />
    </svg>
  );
};
