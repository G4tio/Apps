import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../theme";
import { CUES } from "../timing";

// Ilustraciones de la edición nacional del 10 nov 2026.
// Lienzo 1080×800 con centro en (540, 400); el círculo del escenario tiene radio 360.
// Cada acción se dispara con un cue de src/timing.ts (segundos desde el inicio de la escena).
const cue = (k: string) => Math.round((CUES[k] ?? 0) * 30);

const Lienzo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={800} viewBox="0 0 1080 800" style={{ overflow: "visible" }}>
    {children}
  </svg>
);

const sombra = (id: string) => (
  <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000" floodOpacity="0.4" />
  </filter>
);

/** Píldora de texto (nombres, chips) con la paleta de marca. */
const Pildora: React.FC<{ x: number; y: number; texto: string; k: number; size?: number }> = ({ x, y, texto, k, size = 34 }) => {
  const w = texto.length * size * 0.66 + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * k})`} opacity={Math.min(1, k * 1.4)}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx={size * 0.95} fill="#0E2E57" stroke={C.suave} strokeOpacity="0.7" strokeWidth="2.5" />
      <text y={size * 0.34} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize={size} letterSpacing="1.5" fill={C.blanco}>
        {texto}
      </text>
    </g>
  );
};

/* 1. Sismo: sismograma que se dibuja, cifra 5.2, logo del INSIVUMEH y segundo sismo de 5.0 */
export const Sismo = () => {
  const f = useCurrentFrame();
  const t1 = cue("sismo_onda");
  const tLogo = cue("sismo_logo");
  const t2 = cue("sismo_segundo");
  const draw = P(f, t1, 40, inOut);
  const k52 = P(f, t1 + 8, 16, outBack);
  // sismograma: amplitud que crece y decae
  const N = 140, x0 = 210, x1 = 870, yb = 520;
  const pts = Array.from({ length: N }).map((_, i) => {
    const u = i / (N - 1);
    const env = Math.exp(-Math.pow((u - 0.42) / 0.16, 2)) * 110 + 6;
    const y = yb + Math.sin(i * 1.9 + Math.sin(i * 0.7) * 2) * env * (0.55 + 0.45 * Math.sin(i * 0.31));
    return [x0 + u * (x1 - x0), y];
  });
  const vivo = Math.sin(f / 2.2) * 3; // leve temblor de la línea final
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${(y + (i > N - 6 ? vivo : 0)).toFixed(1)}`).join(" ");
  const len = 4200;
  const shake = f >= t1 && f < t1 + 24 ? Math.sin(f * 2.4) * 8 * (1 - (f - t1) / 24) : 0;
  // ondas expansivas
  const ondas = [0, 1, 2].map((i) => {
    const ph = (((f - t1 - i * 14) % 42) + 42) % 42 / 42;
    return f > t1 ? { r: 60 + ph * 260, o: 0.35 * (1 - ph) } : null;
  });
  const k2 = P(f, t2, 14, outBack);
  const pulso2 = f >= t2 && f < t2 + 18 ? Math.sin(f * 2.6) * 5 * (1 - (f - t2) / 18) : 0;
  return (
    <Lienzo>
      <defs>
        {sombra("sis-sh")}
        <linearGradient id="sis-num" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A8E4FF" /><stop offset="1" stopColor={C.celeste} /></linearGradient>
      </defs>
      {ondas.map((o, i) => o && <circle key={i} cx="540" cy="250" r={o.r} fill="none" stroke={C.celeste} strokeWidth="3" opacity={o.o} />)}
      <g transform={`translate(${shake} 0)`}>
        {/* rejilla del sismógrafo */}
        <g opacity={P(f, 4, 12) * 0.5}>
          {[400, 460, 520, 580, 640].map((y) => <line key={y} x1={x0} x2={x1} y1={y} y2={y} stroke={C.suave} strokeOpacity="0.25" strokeWidth="1.5" />)}
          {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={x0 + i * 60} x2={x0 + i * 60} y1="400" y2="640" stroke={C.suave} strokeOpacity="0.18" strokeWidth="1.5" />)}
        </g>
        <path d={d} fill="none" stroke={C.celeste} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        {/* aguja */}
        {draw > 0 && draw < 1 && <circle cx={lerp(x0, x1, draw)} cy={yb} r="9" fill={C.claro} />}
      </g>
      {/* cifra */}
      <g transform={`translate(540 285) scale(${0.4 + 0.6 * k52})`} opacity={P(f, t1 + 8, 8)}>
        <text textAnchor="middle" fontFamily={F.exo} fontStyle="italic" fontWeight={900} fontSize="210" fill="url(#sis-num)">5.2</text>
        <text y="58" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="32" letterSpacing="6" fill={C.suave}>MAGNITUD</text>
      </g>
      {/* logo del INSIVUMEH (archivo del usuario) */}
      <g transform={`translate(800 650) scale(${P(f, tLogo, 14, outBack)})`} opacity={P(f, tLogo, 8)} filter="url(#sis-sh)">
        <circle r="92" fill={C.blanco} />
        <image href={staticFile("logos/insivumeh.png")} x="-86" y="-86" width="172" height="172" />
      </g>
      {/* segundo sismo */}
      <g transform={`translate(${290 + pulso2} 150) scale(${k2})`} opacity={P(f, t2, 8)}>
        <circle r="74" fill="#0E2E57" stroke={C.claro} strokeWidth="3" />
        <text y="22" textAnchor="middle" fontFamily={F.exo} fontStyle="italic" fontWeight={900} fontSize="64" fill={C.claro}>5.0</text>
      </g>
    </Lienzo>
  );
};

/* Bandera de EE. UU. con sus colores reales (13 franjas y cantón azul con estrellas). */
const BanderaEEUU: React.FC<{ w: number }> = ({ w }) => {
  const h = w * 0.526, fh = h / 13, cw = w * 0.4, ch = fh * 7;
  return (
    <g>
      <rect width={w} height={h} fill="#FFFFFF" />
      {Array.from({ length: 7 }).map((_, i) => <rect key={i} y={i * 2 * fh} width={w} height={fh} fill="#B22234" />)}
      <rect width={cw} height={ch} fill="#3C3B6E" />
      {Array.from({ length: 9 }).map((_, r) =>
        Array.from({ length: r % 2 ? 5 : 6 }).map((_, c) => (
          <circle key={r + "-" + c} cx={(c * 2 + (r % 2 ? 2 : 1)) * (cw / 12)} cy={(r + 1) * (ch / 10)} r={w * 0.0085} fill="#FFFFFF" />
        ))
      )}
      <rect width={w} height={h} fill="none" stroke="rgba(191,234,255,0.6)" strokeWidth="2" />
    </g>
  );
};

/* Retrato recortado (foto del usuario con efecto halftone ya aplicado) con zoom lento. */
const Retrato: React.FC<{ src: string; w: number; h: number; cx: number; cy: number; at: number; f: number }> = ({ src, w, h, cx, cy, at, f }) => {
  const k = P(f, at, 18, outBack);
  const zoom = 1 + 0.04 * P(f, at, 240, (x) => x);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${(0.85 + 0.15 * k) * zoom})`} opacity={P(f, at, 10)} filter="url(#ret-sh)">
      <image href={staticFile(src)} x={-w / 2} y={-h / 2} width={w} height={h} />
    </g>
  );
};

/* 2. Captura de «Mosh»: retrato, nombre, bandera de EE. UU. (acusación) y cocaína */
export const Mosh = () => {
  const f = useCurrentFrame();
  const tF = Math.max(2, cue("mosh_foto") - 6), tU = cue("mosh_eeuu"), tC = cue("mosh_coca");
  const kU = P(f, tU, 14, outBack);
  const kC = P(f, tC, 14, outBack);
  return (
    <Lienzo>
      <defs>{sombra("ret-sh")}</defs>
      <Retrato src="fotos/mosh.png" w={460} h={500} cx={540} cy={360} at={tF} f={f} />
      <Pildora x={540} y={660} texto="ALIAS «MOSH»" k={P(f, tF + 10, 14, outBack)} />
      {/* EE. UU. lo acusa */}
      <g transform={`translate(790 150) rotate(${lerp(-14, 6, kU)}) scale(${kU})`} opacity={P(f, tU, 8)} filter="url(#ret-sh)">
        <g transform="translate(-90 -47)"><BanderaEEUU w={180} /></g>
      </g>
      {/* paquete de cocaína */}
      <g transform={`translate(270 200) rotate(${lerp(10, -8, kC)}) scale(${kC})`} opacity={P(f, tC, 8)} filter="url(#ret-sh)">
        <rect x="-70" y="-48" width="140" height="96" rx="16" fill="#E9EEF4" stroke="#9FB3C8" strokeWidth="4" />
        <path d="M-70 -10 H70 M-20 -48 V48" stroke="#B7C6D6" strokeWidth="5" />
        <rect x="-38" y="-30" width="56" height="26" rx="5" fill="#C9D6E3" />
      </g>
    </Lienzo>
  );
};

/* 3. CC suspende los limitadores: logo de la CC, bus, velocímetro que se libera y contador */
export const Limitadores = () => {
  const f = useCurrentFrame();
  const tL = Math.max(2, cue("cc_logo") - 4), tS = cue("cc_stop"), tB = cue("cc_bus"), tN = cue("cc_contador");
  const kLogo = P(f, tL, 16, outBack);
  const salidaLogo = P(f, tN - 8, 12, inOut);
  const llega = P(f, tB, 26, outCubic);
  // aguja: fija en 80 (tope) y, tras la suspensión, el tope se apaga
  const tope = 1 - P(f, tB + 30, 16);
  const ang = lerp(-120, 40, P(f, tB + 8, 20, outCubic)) + (tope < 0.5 ? Math.sin(f / 3) * 4 : 0);
  const n = Math.round(interpolate(f, [tN, tN + 36], [0, 35871], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));
  return (
    <Lienzo>
      <defs>{sombra("cc-sh")}</defs>
      {/* logo de la CC (archivo del usuario) con señal de pausa */}
      <g transform={`translate(540 ${lerp(170, 120, salidaLogo)}) scale(${kLogo * (1 - 0.55 * salidaLogo)})`} opacity={P(f, tL, 8) * (1 - salidaLogo)} filter="url(#cc-sh)">
        <circle r="128" fill={C.blanco} />
        <image href={staticFile("logos/cc.png")} x="-124" y="-124" width="248" height="248" />
        <g transform={`translate(110 90) scale(${P(f, tS, 12, outBack)})`}>
          <circle r="42" fill={C.marino} stroke={C.claro} strokeWidth="4" />
          <rect x="-16" y="-20" width="11" height="40" rx="3" fill={C.claro} />
          <rect x="5" y="-20" width="11" height="40" rx="3" fill={C.claro} />
        </g>
      </g>
      {/* contador de vehículos con limitador */}
      <g opacity={P(f, tN, 8)} transform={`translate(540 185) scale(${0.8 + 0.2 * P(f, tN, 14, outBack)})`}>
        <text textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="118" fill={C.claro}>{n.toLocaleString("en-US")}</text>
        <text y="52" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="30" letterSpacing="5" fill={C.suave}>VEHÍCULOS</text>
      </g>
      {/* bus (ilustración del usuario) */}
      <g transform={`translate(${lerp(-420, 500, llega)} 520)`} opacity={P(f, tB, 6)} filter="url(#cc-sh)">
        <image href={staticFile("fotos/bus.png")} x="-260" y="-210" width="520" height="419" />
      </g>
      {/* velocímetro con tope a 80 km/h */}
      <g transform={`translate(810 440) scale(${P(f, tB + 6, 14, outBack)})`} opacity={P(f, tB + 6, 8)} filter="url(#cc-sh)">
        <circle r="92" fill="#0E2E57" stroke={C.suave} strokeWidth="4" />
        <path d="M-64 46 A78 78 0 1 1 64 46" fill="none" stroke={C.suave} strokeOpacity="0.35" strokeWidth="10" strokeLinecap="round" />
        {/* tope a 80 */}
        <path d="M38 -58 A78 78 0 0 1 64 46" fill="none" stroke="#E5A23A" strokeOpacity={0.25 + 0.75 * tope} strokeWidth="10" strokeLinecap="round" />
        <g transform={`rotate(${ang})`}>
          <line x1="0" y1="0" x2="0" y2="-66" stroke={C.claro} strokeWidth="7" strokeLinecap="round" />
        </g>
        <circle r="12" fill={C.claro} />
        <text y="64" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="34" fill={C.blanco}>80</text>
      </g>
    </Lienzo>
  );
};

/* 4. Inflación: barras SEP 4.69 → OCT 4.38 y cilindro de gas de Q122 a Q126 */
export const Inflacion = () => {
  const f = useCurrentFrame();
  const tB = Math.max(2, cue("inf_barras") - 2), tBaja = cue("inf_baja"), tG = cue("inf_gas"), tP = cue("inf_precio");
  const crece = P(f, tB, 22, outCubic);
  const baja = P(f, tBaja, 18, inOut);
  const mover = P(f, tG - 4, 18, inOut); // el gráfico se corre a la izquierda para dar lugar al gas
  const escala = 70; // px por punto porcentual
  const hSep = 4.69 * escala * crece;
  const hOct = lerp(4.69, 4.38, baja) * escala * crece;
  const yb = 600;
  const precio = Math.round(interpolate(f, [tP, tP + 24], [122, 126], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const kGas = P(f, tG, 16, outBack);
  return (
    <Lienzo>
      <defs>
        {sombra("inf-sh")}
        <linearGradient id="inf-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.celeste} /><stop offset="1" stopColor="#1270A8" /></linearGradient>
        <linearGradient id="inf-gas" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8A97A6" /><stop offset="0.45" stopColor="#D9E1EA" /><stop offset="1" stopColor="#7E8C9C" /></linearGradient>
      </defs>
      <g transform={`translate(${lerp(0, -150, mover)} 0)`}>
        <line x1="330" x2="750" y1={yb} y2={yb} stroke={C.suave} strokeWidth="3" opacity={P(f, tB, 8)} />
        {[{ x: 420, h: hSep, v: 4.69, lab: "SEP", on: 0.55 }, { x: 640, h: hOct, v: lerp(4.69, 4.38, baja), lab: "OCT", on: 1 }].map((b) => (
          <g key={b.lab} opacity={P(f, tB, 8)}>
            <rect x={b.x - 70} y={yb - b.h} width="140" height={b.h} rx="12" fill="url(#inf-bar)" opacity={b.on} />
            <text x={b.x} y={yb - b.h - 22} textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="54" fill={b.lab === "OCT" ? C.claro : C.suave}>
              {b.v.toFixed(2)}
            </text>
            <text x={b.x} y={yb + 46} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="30" letterSpacing="3" fill={C.suave}>{b.lab}</text>
          </g>
        ))}
        {/* flecha de baja */}
        <g opacity={P(f, tBaja + 6, 8) * (1 - mover)} transform={`translate(530 ${lerp(160, 210, baja)})`}>
          <path d="M-40 -30 Q10 -20 30 30 M8 26 L32 34 L40 8" fill="none" stroke={C.claro} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      {/* cilindro de gas propano */}
      <g transform={`translate(760 ${lerp(470, 440, kGas)}) scale(${kGas})`} opacity={P(f, tG, 8)} filter="url(#inf-sh)">
        <rect x="-26" y="-210" width="52" height="38" rx="8" fill="#6F7D8C" />
        <path d="M-58 -186 h116 a10 10 0 0 1 10 10 v18 h-136 v-18 a10 10 0 0 1 10 -10z" fill="#5E6B79" />
        <rect x="-100" y="-160" width="200" height="300" rx="70" fill="url(#inf-gas)" stroke="#4A5664" strokeWidth="4" />
        <rect x="-100" y="-40" width="200" height="16" fill="#9AA7B5" opacity="0.6" />
        <rect x="-86" y="140" width="172" height="34" rx="8" fill="#4A5664" />
        {/* precio */}
        <g transform="translate(0 30)" opacity={P(f, tP, 8)}>
          <rect x="-96" y="-44" width="192" height="80" rx="16" fill={C.marino} stroke="#E5A23A" strokeWidth="4" />
          <text y="18" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="54" fill={C.blanco}>Q{precio}</text>
        </g>
        <g opacity={P(f, tP + 20, 8)} transform="translate(124 18)">
          <path d="M0 26 V-26 M-20 -6 L0 -28 L20 -6" fill="none" stroke="#E5A23A" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </Lienzo>
  );
};

/* 5. Baldetti: retrato, nombre, brazalete electrónico (sí) y casa (permiso revocado) */
export const Baldetti = () => {
  const f = useCurrentFrame();
  const tF = Math.max(2, cue("bal_foto") - 4), tBr = cue("bal_brazalete"), tCa = cue("bal_casa");
  const kBr = P(f, tBr, 16, outBack);
  const kCa = P(f, tCa, 16, outBack);
  const tacha = P(f, tCa + 14, 12, outCubic);
  const blink = Math.floor((f - tBr) / 8) % 2 === 0;
  return (
    <Lienzo>
      <defs>{sombra("ret-sh")}</defs>
      <Retrato src="fotos/baldetti.png" w={470} h={542} cx={540} cy={340} at={tF} f={f} />
      <Pildora x={540} y={660} texto="ROXANA BALDETTI" k={P(f, tF + 10, 14, outBack)} />
      {/* brazalete */}
      <g transform={`translate(810 300) scale(${kBr})`} opacity={P(f, tBr, 8)} filter="url(#ret-sh)">
        <circle r="96" fill="#0E2E57" stroke={C.suave} strokeWidth="4" />
        <ellipse cx="0" cy="18" rx="62" ry="26" fill="none" stroke={C.claro} strokeWidth="14" />
        <rect x="-30" y="-24" width="60" height="50" rx="10" fill="#1F2937" stroke={C.claro} strokeWidth="4" />
        <circle cx="0" cy="0" r="7" fill={blink ? C.menta : "#2A5E48"} />
        {[0, 1].map((i) => (
          <path key={i} d={`M${-26 - i * 14} ${-40 - i * 12} a${40 + i * 18} ${40 + i * 18} 0 0 1 ${52 + i * 28} 0`} fill="none" stroke={C.celeste} strokeWidth="4" strokeLinecap="round" opacity={0.4 + 0.6 * ((Math.floor(f / 6) + i) % 2)} />
        ))}
      </g>
      {/* casa con permiso revocado */}
      <g transform={`translate(270 300) scale(${kCa})`} opacity={P(f, tCa, 8)} filter="url(#ret-sh)">
        <circle r="96" fill="#0E2E57" stroke={C.suave} strokeWidth="4" />
        <path d="M-52 2 L0 -44 L52 2 V54 H-52 Z" fill="none" stroke={C.claro} strokeWidth="9" strokeLinejoin="round" />
        <rect x="-14" y="18" width="28" height="36" fill={C.claro} />
        <g opacity={tacha} stroke="#E5484D" strokeWidth="12" strokeLinecap="round">
          <line x1={-58} y1={-58} x2={lerp(-58, 58, tacha)} y2={lerp(-58, 58, tacha)} />
          <line x1={58} y1={-58} x2={lerp(58, -58, tacha)} y2={lerp(-58, 58, tacha)} />
        </g>
      </g>
    </Lienzo>
  );
};

/* 6. Guatemala y Belice: banderas reales, río Sarstún, embarcaciones y La Haya */
const Lancha: React.FC<{ dir: 1 | -1 }> = ({ dir }) => (
  <g transform={`scale(${dir} 1)`}>
    <path d="M-80 0 H70 L95 -22 H-70 Z" fill="#5F6E7E" stroke="#2C3846" strokeWidth="3" />
    <rect x="-40" y="-52" width="58" height="32" rx="6" fill="#8796A6" stroke="#2C3846" strokeWidth="3" />
    <rect x="-30" y="-46" width="16" height="12" rx="2" fill={C.claro} />
    <rect x="-8" y="-46" width="16" height="12" rx="2" fill={C.claro} />
    <line x1="-12" y1="-52" x2="-12" y2="-78" stroke="#2C3846" strokeWidth="4" />
  </g>
);

export const Belice = () => {
  const f = useCurrentFrame();
  const tF = Math.max(2, cue("bel_banderas")), tB = cue("bel_botes"), tP = cue("bel_protesta"), tH = cue("bel_haya");
  const kGT = P(f, tF, 16, outBack), kBZ = P(f, tF + 8, 16, outBack);
  const botes = P(f, tB, 30, outCubic);
  const tension = f > tB + 30 ? Math.sin(f / 4) * 3 : 0;
  const kP = P(f, tP, 14, outBack);
  const kH = P(f, tH, 16, outBack);
  const salida = P(f, tH - 6, 12, inOut); // la protesta deja su lugar a La Haya
  const ola = (y: number, a: number, ph: number) =>
    `M190 ${y} ` + Array.from({ length: 12 }).map((_, i) => `q 30 ${((i % 2 ? a : -a) * Math.cos(ph)).toFixed(2)} 60 0`).join(" ");
  return (
    <Lienzo>
      <defs>
        {sombra("bel-sh")}
        <clipPath id="bel-circ"><circle cx="540" cy="400" r="356" /></clipPath>
      </defs>
      {/* río */}
      <g clipPath="url(#bel-circ)" opacity={P(f, tF, 12)}>
        <rect x="180" y="520" width="720" height="260" fill="#1C5E8C" opacity="0.55" />
        <path d={ola(520, 10, f / 8)} fill="none" stroke={C.celeste} strokeWidth="4" opacity="0.7" />
        <path d={ola(600, 7, f / 6 + 1)} fill="none" stroke={C.claro} strokeWidth="3" opacity="0.35" />
      </g>
      {/* banderas con sus colores reales (archivos del usuario) */}
      <g transform={`translate(330 260) rotate(-4) scale(${kGT})`} opacity={P(f, tF, 8)} filter="url(#bel-sh)">
        <image href={staticFile("logos/bandera-gt.svg")} x="-130" y="-81" width="260" height="162" preserveAspectRatio="none" />
        <rect x="-130" y="-81" width="260" height="162" fill="none" stroke="rgba(191,234,255,0.6)" strokeWidth="2" />
      </g>
      <g transform={`translate(750 260) rotate(4) scale(${kBZ})`} opacity={P(f, tF + 8, 8)} filter="url(#bel-sh)">
        <image href={staticFile("logos/bandera-belice.svg")} x="-130" y="-78" width="260" height="156" preserveAspectRatio="none" />
        <rect x="-130" y="-78" width="260" height="156" fill="none" stroke="rgba(191,234,255,0.6)" strokeWidth="2" />
      </g>
      {/* embarcaciones que se acercan */}
      <g opacity={P(f, tB, 8)}>
        <g transform={`translate(${lerp(150, 390, botes) + tension} ${590 + Math.sin(f / 7) * 4}) scale(1.7)`}><Lancha dir={1} /></g>
        <g transform={`translate(${lerp(930, 690, botes) - tension} ${590 + Math.sin(f / 7 + 1) * 4}) scale(1.7)`}><Lancha dir={-1} /></g>
      </g>
      {/* protesta diplomática */}
      <g transform={`translate(540 420) scale(${kP * (1 - salida)})`} opacity={P(f, tP, 8) * (1 - salida)} filter="url(#bel-sh)">
        <circle r="70" fill="#0E2E57" stroke={C.suave} strokeWidth="4" />
        <path d="M-26 -36 H14 L30 -20 V36 H-26 Z" fill={C.blanco} />
        <path d="M-14 -12 H18 M-14 4 H18 M-14 20 H8" stroke={C.marino} strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* La Haya: balanza y fecha de audiencias */}
      <g transform={`translate(540 410) scale(${kH})`} opacity={P(f, tH, 8)} filter="url(#bel-sh)">
        <circle r="82" fill="#0E2E57" stroke={C.claro} strokeWidth="4" />
        <g stroke={C.claro} strokeWidth="6" strokeLinecap="round" fill="none">
          <line x1="0" y1="-44" x2="0" y2="40" />
          <line x1="-46" y1="-30" x2="46" y2="-30" />
          <path d="M-46 -30 L-62 6 H-30 Z M46 -30 L30 6 H62 Z" />
          <line x1="-24" y1="40" x2="24" y2="40" />
        </g>
      </g>
      <g opacity={P(f, tH + 10, 8)}>
        <Pildora x={540} y={545} texto="FEB 2027" k={P(f, tH + 10, 14, outBack)} size={30} />
      </g>
    </Lienzo>
  );
};
