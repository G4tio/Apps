import React from "react";

// Banderas con sus colores reales y proporción 3:2 (simplificadas donde llevan escudo).
// Se dibujan en (0,0) con ancho w; borde fino claro para integrarlas al fondo marino.
type B = { w?: number; id: string };

const Marco: React.FC<{ w: number; h: number; id: string; children: React.ReactNode }> = ({ w, h, id, children }) => (
  <g filter="drop-shadow(0 8px 16px rgba(0,0,0,0.35))">
    <clipPath id={`clip-${id}`}><rect width={w} height={h} rx={4} /></clipPath>
    <g clipPath={`url(#clip-${id})`}>{children}</g>
    <rect width={w} height={h} rx={4} fill="none" stroke="#BFEAFF" strokeOpacity="0.7" strokeWidth={2} />
  </g>
);

const tres = (w: number, h: number, cols: string[], vertical = false) =>
  cols.map((c, i) =>
    vertical ? <rect key={i} x={(i * w) / 3} width={w / 3 + 0.5} height={h} fill={c} /> : <rect key={i} y={(i * h) / 3} width={w} height={h / 3 + 0.5} fill={c} />
  );

export const Rusia: React.FC<B> = ({ w = 240, id }) => { const h = (w * 2) / 3; return <Marco w={w} h={h} id={id}>{tres(w, h, ["#FFFFFF", "#0039A6", "#D52B1E"])}</Marco>; };
export const Ucrania: React.FC<B> = ({ w = 240, id }) => { const h = (w * 2) / 3; return <Marco w={w} h={h} id={id}><rect width={w} height={h / 2} fill="#0057B7" /><rect y={h / 2} width={w} height={h / 2} fill="#FFD700" /></Marco>; };
export const Alemania: React.FC<B> = ({ w = 120, id }) => { const h = (w * 2) / 3; return <Marco w={w} h={h} id={id}>{tres(w, h, ["#000000", "#DD0000", "#FFCE00"])}</Marco>; };
export const Francia: React.FC<B> = ({ w = 120, id }) => { const h = (w * 2) / 3; return <Marco w={w} h={h} id={id}>{tres(w, h, ["#0055A4", "#FFFFFF", "#EF4135"], true)}</Marco>; };
export const Italia: React.FC<B> = ({ w = 120, id }) => { const h = (w * 2) / 3; return <Marco w={w} h={h} id={id}>{tres(w, h, ["#009246", "#FFFFFF", "#CE2B37"], true)}</Marco>; };
export const Japon: React.FC<B> = ({ w = 120, id }) => { const h = (w * 2) / 3; return <Marco w={w} h={h} id={id}><rect width={w} height={h} fill="#FFFFFF" /><circle cx={w / 2} cy={h / 2} r={h * 0.3} fill="#BC002D" /></Marco>; };

export const Canada: React.FC<B> = ({ w = 120, id }) => {
  const h = w / 2; // proporción oficial 2:1
  const s = h / 100;
  return (
    <Marco w={w} h={h} id={id}>
      <rect width={w} height={h} fill="#FFFFFF" />
      <rect width={w / 4} height={h} fill="#D80621" />
      <rect x={(w * 3) / 4} width={w / 4} height={h} fill="#D80621" />
      <path transform={`translate(${w / 2} ${h / 2}) scale(${s})`} fill="#D80621"
        d="M0 -38 L7 -24 L15 -28 L11 -6 L24 -18 L27 -11 L40 -13 L35 2 L42 6 L18 24 L21 32 L2 29 L2 44 L-2 44 L-2 29 L-21 32 L-18 24 L-42 6 L-35 2 L-40 -13 L-27 -11 L-24 -18 L-11 -6 L-15 -28 L-7 -24 Z" />
    </Marco>
  );
};

export const ReinoUnido: React.FC<B> = ({ w = 120, id }) => {
  const h = w / 2; // 2:1
  return (
    <Marco w={w} h={h} id={id}>
      <rect width={w} height={h} fill="#012169" />
      <path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#FFFFFF" strokeWidth={h * 0.2} />
      <path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#C8102E" strokeWidth={h * 0.067} />
      <path d={`M${w / 2} 0 V${h} M0 ${h / 2} H${w}`} stroke="#FFFFFF" strokeWidth={h * 0.33} />
      <path d={`M${w / 2} 0 V${h} M0 ${h / 2} H${w}`} stroke="#C8102E" strokeWidth={h * 0.2} />
    </Marco>
  );
};

export const EEUU: React.FC<B> = ({ w = 120, id }) => {
  const h = w / 1.9;
  const sh = h / 13;
  const cw = w * 0.4, ch = sh * 7;
  return (
    <Marco w={w} h={h} id={id}>
      {Array.from({ length: 13 }).map((_, i) => <rect key={i} y={i * sh} width={w} height={sh + 0.3} fill={i % 2 ? "#FFFFFF" : "#B22234"} />)}
      <rect width={cw} height={ch} fill="#3C3B6E" />
      {Array.from({ length: 9 }).map((_, r) =>
        Array.from({ length: r % 2 ? 5 : 6 }).map((_, c) => (
          <circle key={`${r}-${c}`} cx={(cw / 12) * (c * 2 + (r % 2 ? 2 : 1))} cy={(ch / 10) * (r + 1)} r={Math.max(0.8, w / 160)} fill="#FFFFFF" />
        ))
      )}
    </Marco>
  );
};

/** Irán: verde, blanco y rojo con el emblema rojo al centro (simplificado; sin las inscripciones de los bordes). */
export const Iran: React.FC<B> = ({ w = 200, id }) => {
  const h = (w * 4) / 7;
  const r = h * 0.13;
  return (
    <Marco w={w} h={h} id={id}>
      {tres(w, h, ["#239F40", "#FFFFFF", "#DA0000"])}
      <g transform={`translate(${w / 2} ${h / 2})`} fill="none" stroke="#DA0000" strokeWidth={Math.max(1.5, w / 90)} strokeLinecap="round">
        <path d={`M${-r * 0.9} ${-r * 0.6} Q${-r * 1.2} ${r * 0.4} ${-r * 0.2} ${r}`} />
        <path d={`M${r * 0.9} ${-r * 0.6} Q${r * 1.2} ${r * 0.4} ${r * 0.2} ${r}`} />
        <path d={`M0 ${-r} V${r}`} />
      </g>
    </Marco>
  );
};

export const Peru: React.FC<B> = ({ w = 200, id }) => { const h = (w * 2) / 3; return <Marco w={w} h={h} id={id}>{tres(w, h, ["#D91023", "#FFFFFF", "#D91023"], true)}</Marco>; };

/** Nicaragua: azul, blanco y azul con el triángulo del escudo (simplificado). */
export const Nicaragua: React.FC<B> = ({ w = 200, id }) => {
  const h = (w * 3) / 5;
  const r = h * 0.12;
  return (
    <Marco w={w} h={h} id={id}>
      {tres(w, h, ["#0067C6", "#FFFFFF", "#0067C6"])}
      <circle cx={w / 2} cy={h / 2} r={r * 1.25} fill="none" stroke="#C8A100" strokeWidth={Math.max(1, w / 140)} />
      <path d={`M${w / 2} ${h / 2 - r * 0.8} L${w / 2 + r * 0.9} ${h / 2 + r * 0.65} H${w / 2 - r * 0.9} Z`} fill="#3E8EDE" stroke="#C8A100" strokeWidth={Math.max(1, w / 160)} />
    </Marco>
  );
};

/** España: rojo, amarillo (doble) y rojo (escudo omitido). */
export const Espana: React.FC<B> = ({ w = 240, id }) => {
  const h = (w * 2) / 3;
  return <Marco w={w} h={h} id={id}><rect width={w} height={h} fill="#AA151B" /><rect y={h / 4} width={w} height={h / 2} fill="#F1BF00" /></Marco>;
};

export const Colombia: React.FC<B> = ({ w = 210, id }) => {
  const h = (w * 2) / 3;
  return <Marco w={w} h={h} id={id}><rect width={w} height={h / 2} fill="#FCD116" /><rect y={h / 2} width={w} height={h / 4} fill="#003893" /><rect y={(h * 3) / 4} width={w} height={h / 4 + 0.5} fill="#CE1126" /></Marco>;
};
