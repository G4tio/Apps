import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../theme";
import type { Viz } from "../data";

// Todas las ilustraciones dibujan en un lienzo 1080×800 con centro en (540, 400).
const Lienzo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={800} viewBox="0 0 1080 800" style={{ overflow: "visible" }}>
    {children}
  </svg>
);

/* 1. Bomba de combustible: el nivel y el precio bajan */
const Bomba = () => {
  const f = useCurrentFrame();
  const baja = P(f, 78, 30, inOut);
  const nivel = lerp(0.85, 0.45, baja);
  const precio = lerp(32.5, 29.9, baja);
  const inn = P(f, 8, 16, outBack);
  const tankH = 300;
  return (
    <Lienzo>
      <g transform={`translate(470 400) scale(${inn}) translate(-470 -400)`}>
        {/* manguera */}
        <path d="M590 270 h40 a30 30 0 0 1 30 30 v170 a22 22 0 0 0 44 0 v-120" fill="none" stroke={C.suave} strokeWidth="14" strokeLinecap="round" />
        <rect x="690" y="330" width="28" height="50" rx="6" fill={C.suave} />
        {/* cuerpo */}
        <rect x="340" y="180" width="260" height="440" rx="34" fill="#12345E" stroke={C.celeste} strokeWidth="6" />
        <rect x="310" y="600" width="320" height="40" rx="12" fill="#0E2B50" stroke={C.celeste} strokeWidth="4" />
        {/* pantalla de precio */}
        <rect x="370" y="210" width="200" height="90" rx="14" fill={C.marinoOsc} stroke={C.suave} strokeWidth="3" />
        <text x="470" y="272" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="44" fill={baja > 0 ? C.claro : C.blanco}>
          Q{precio.toFixed(2)}
        </text>
        {/* tanque con nivel */}
        <clipPath id="bomba-tank"><rect x="385" y="320" width="170" height={tankH - 20} rx="16" /></clipPath>
        <rect x="385" y="320" width="170" height={tankH - 20} rx="16" fill="rgba(31,182,255,0.08)" stroke={C.suave} strokeWidth="3" />
        <g clipPath="url(#bomba-tank)">
          <rect x="385" y={320 + (tankH - 20) * (1 - nivel)} width="170" height={tankH} fill={C.celeste} opacity="0.85" />
          <path
            d={`M385 ${320 + (tankH - 20) * (1 - nivel)} q 21 ${-8 * Math.sin(f / 5)} 42 0 t 42 0 t 42 0 t 44 0`}
            fill="none" stroke={C.claro} strokeWidth="4"
          />
        </g>
      </g>
      {/* flecha hacia abajo */}
      <g opacity={P(f, 80, 8)} transform={`translate(800 ${lerp(250, 360, baja)})`}>
        <path d="M0 -70 v120 M-38 12 l38 42 l38 -42" fill="none" stroke={C.claro} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </Lienzo>
  );
};

/* 2. Lluvia: nube, gotas y medidor que sube con alerta */
const Lluvia = () => {
  const f = useCurrentFrame();
  const inn = P(f, 6, 16, outBack);
  const sube = P(f, 78, 36, inOut);
  const gotas = Array.from({ length: 18 }).map((_, i) => {
    const x = 330 + ((i * 37) % 300);
    const per = 22 + (i % 5) * 3;
    const y = 330 + (((f + i * 9) % per) / per) * 260;
    return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 34} stroke={C.celeste} strokeWidth="6" strokeLinecap="round" opacity={P(f, 14, 10) * 0.85} />;
  });
  const alerta = P(f, 18, 12, outBack);
  return (
    <Lienzo>
      {gotas}
      <g transform={`translate(480 250) scale(${inn})`}>
        <path d="M-200 60 a80 80 0 0 1 40 -150 a110 110 0 0 1 200 -20 a90 90 0 0 1 150 80 a70 70 0 0 1 -20 140 h-330 a70 70 0 0 1 -40 -50z" fill="#1A4778" stroke={C.claro} strokeWidth="6" />
      </g>
      {/* medidor de nivel de agua */}
      <g transform="translate(780 240)">
        <rect x="0" y="0" width="70" height="380" rx="35" fill="rgba(31,182,255,0.08)" stroke={C.suave} strokeWidth="4" />
        <clipPath id="lluvia-med"><rect x="0" y="0" width="70" height="380" rx="35" /></clipPath>
        <rect clipPath="url(#lluvia-med)" x="0" y={380 * (1 - lerp(0.25, 0.8, sube))} width="70" height="380" fill={C.celeste} opacity="0.8" />
        {[0.25, 0.5, 0.75].map((m) => (
          <line key={m} x1="70" x2="92" y1={380 * (1 - m)} y2={380 * (1 - m)} stroke={C.suave} strokeWidth="4" />
        ))}
      </g>
      {/* señal de alerta (ámbar = estado de alerta) */}
      <g transform={`translate(230 560) scale(${alerta})`} opacity={P(f, 18, 6)}>
        <path d="M0 -70 L66 48 H-66 Z" fill="#F2B544" stroke="#0A2647" strokeWidth="6" strokeLinejoin="round" opacity={0.75 + 0.25 * Math.sin(f / 4)} />
        <rect x="-6" y="-30" width="12" height="44" rx="6" fill={C.marino} />
        <circle cx="0" cy="30" r="7" fill={C.marino} />
      </g>
    </Lienzo>
  );
};

/* 3. Barras de exportaciones */
const Barras = () => {
  const f = useCurrentFrame();
  const vals = [0.55, 0.62, 0.68, 0.74];
  const anios = ["2023", "2024", "2025", "2026"];
  const pct = Math.round(lerp(0, 8, P(f, 80, 30, outCubic)));
  return (
    <Lienzo>
      <line x1="260" x2="820" y1="620" y2="620" stroke={C.suave} strokeWidth="4" />
      {vals.map((v, i) => {
        const g = P(f, 10 + i * 8 + (i === 3 ? 64 : 0), 20, outCubic);
        const h = 420 * v * g;
        const x = 290 + i * 135;
        const top = i === 3;
        return (
          <g key={i}>
            <rect x={x} y={620 - h} width="100" height={h} rx="12" fill={top ? C.celeste : "#2A5A8C"} opacity={top ? 1 : 0.85} />
            <text x={x + 50} y="668" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="28" fill={C.suave}>{anios[i]}</text>
          </g>
        );
      })}
      <g opacity={P(f, 82, 8)} transform={`translate(${290 + 3 * 135 + 50} ${620 - 420 * 0.74 - 30})`}>
        <text textAnchor="middle" fontFamily={F.exo} fontWeight={800} fontSize="64" fill={C.claro}>+{pct}%</text>
      </g>
      <path d="M300 470 L440 430 L580 400 L700 330" fill="none" stroke={C.claro} strokeWidth="5" strokeDasharray="600" strokeDashoffset={600 * (1 - P(f, 90, 30))} strokeLinecap="round" />
    </Lienzo>
  );
};

/* 4. Banderas: Guatemala (simplificada, sin escudo) y Unión Europea con sus colores reales */
const Bandera: React.FC<{ tipo: "gt" | "ue" }> = ({ tipo }) => {
  const w = 300, h = 200;
  if (tipo === "gt")
    return (
      <g>
        <rect x={0} y={0} width={w / 3} height={h} fill="#4997D0" />
        <rect x={w / 3} y={0} width={w / 3} height={h} fill="#FFFFFF" />
        <rect x={(2 * w) / 3} y={0} width={w / 3} height={h} fill="#4997D0" />
        <circle cx={w / 2} cy={h / 2} r="26" fill="none" stroke="#6C9A3B" strokeWidth="6" opacity="0.8" />
        <rect width={w} height={h} fill="none" stroke={C.claro} strokeWidth="3" rx="4" />
      </g>
    );
  return (
    <g>
      <rect width={w} height={h} fill="#003399" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const cx = w / 2 + Math.cos(a) * 66, cy = h / 2 + Math.sin(a) * 66;
        const pts = Array.from({ length: 10 }).map((_, k) => {
          const r = k % 2 ? 5 : 12, aa = -Math.PI / 2 + (k * Math.PI) / 5;
          return `${cx + Math.cos(aa) * r},${cy + Math.sin(aa) * r}`;
        });
        return <polygon key={i} points={pts.join(" ")} fill="#FFCC00" />;
      })}
      <rect width={w} height={h} fill="none" stroke={C.claro} strokeWidth="3" rx="4" />
    </g>
  );
};

const Banderas = () => {
  const f = useCurrentFrame();
  const a = P(f, 8, 18, outBack);
  const b = P(f, 16, 18, outBack);
  const une = P(f, 78, 22, inOut);
  const ondea = (k: number) => Math.sin((f + k) / 8) * 2;
  return (
    <Lienzo>
      <g transform={`translate(${lerp(140, 200, une)} 260) rotate(${ondea(0)}) scale(${a})`} filter="drop-shadow(0 10px 20px rgba(0,0,0,0.35))">
        <Bandera tipo="gt" />
      </g>
      <g transform={`translate(${lerp(640, 580, une)} 260) rotate(${ondea(10)}) scale(${b})`} filter="drop-shadow(0 10px 20px rgba(0,0,0,0.35))">
        <Bandera tipo="ue" />
      </g>
      {/* línea de unión y sello */}
      <line x1="500" x2="580" y1="360" y2="360" stroke={C.celeste} strokeWidth="8" strokeLinecap="round" opacity={une} />
      <g transform={`translate(540 590) scale(${P(f, 92, 14, outBack)})`}>
        <circle r="80" fill={C.celeste} />
        <path d="M-36 2 l24 26 l48 -56" fill="none" stroke={C.marino} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </Lienzo>
  );
};

/* 5. Barco que avanza y se detiene ante una X */
const Barco = () => {
  const f = useCurrentFrame();
  const avanza = P(f, 6, 90, inOut);
  const x = lerp(170, 560, avanza);
  const balanceo = Math.sin(f / 9) * 2.5;
  const xMark = P(f, 74, 12, outBack);
  return (
    <Lienzo>
      {/* ruta */}
      <line x1="140" x2="900" y1="520" y2="520" stroke={C.suave} strokeWidth="5" strokeDasharray="18 18" opacity="0.6" />
      {/* olas */}
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M120 ${560 + k * 34} ${Array.from({ length: 12 }).map((_, i) => `q 33 ${(i % 2 ? 1 : -1) * 12} 66 0`).join(" ")}`}
          fill="none" stroke={C.celeste} strokeOpacity={0.5 - k * 0.12} strokeWidth="5" transform={`translate(${((f * (1.5 + k)) % 132) - 66} 0)`} />
      ))}
      {/* barco */}
      <g transform={`translate(${x} 520) rotate(${balanceo})`}>
        <path d="M-150 -10 H150 L110 50 H-120 Z" fill="#12345E" stroke={C.celeste} strokeWidth="5" />
        <rect x="-100" y="-70" width="60" height="60" fill="#E07A5F" stroke={C.marinoOsc} strokeWidth="3" />
        <rect x="-35" y="-70" width="60" height="60" fill="#3D9BE9" stroke={C.marinoOsc} strokeWidth="3" />
        <rect x="-68" y="-128" width="60" height="58" fill="#F2B544" stroke={C.marinoOsc} strokeWidth="3" />
        <rect x="40" y="-110" width="70" height="100" rx="6" fill={C.grisClaro} />
        <rect x="52" y="-96" width="46" height="18" rx="4" fill={C.marino} />
      </g>
      {/* X de bloqueo */}
      <g transform={`translate(810 470) scale(${xMark})`}>
        <circle r="78" fill="rgba(229,72,77,0.15)" stroke="#E5484D" strokeWidth="6" />
        <path d="M-36 -36 L36 36 M36 -36 L-36 36" stroke="#E5484D" strokeWidth="16" strokeLinecap="round" />
      </g>
    </Lienzo>
  );
};

/* 6. Patrulla con luces y contador */
const Patrulla = () => {
  const f = useCurrentFrame();
  const llega = P(f, 4, 26, outCubic);
  const n = Math.round(interpolate(f, [78, 112], [0, 498], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));
  const blink = Math.floor(f / 5) % 2 === 0;
  return (
    <Lienzo>
      <g transform={`translate(${lerp(-200, 540, llega)} 420)`}>
        {/* luces */}
        <ellipse cx="-40" cy="-150" rx="90" ry="50" fill="#E5484D" opacity={blink ? 0.35 : 0.05} />
        <ellipse cx="40" cy="-150" rx="90" ry="50" fill="#3D9BE9" opacity={blink ? 0.05 : 0.4} />
        <rect x="-60" y="-150" width="50" height="22" rx="6" fill={blink ? "#FF6B6F" : "#7A2B2E"} />
        <rect x="10" y="-150" width="50" height="22" rx="6" fill={blink ? "#22477A" : "#5BB4FF"} />
        {/* carrocería */}
        <path d="M-230 30 V-30 Q-225 -60 -180 -64 L-110 -70 L-60 -128 H90 L150 -70 L210 -60 Q240 -50 240 -10 V30 Z" fill={C.grisClaro} stroke={C.marinoOsc} strokeWidth="5" />
        <path d="M-40 -116 H80 L124 -72 H-80 Z" fill="#1A4778" />
        <rect x="-230" y="-30" width="470" height="30" fill="#1A4778" />
        <text x="5" y="-6" textAnchor="middle" fontFamily={F.exo} fontWeight={800} fontStyle="italic" fontSize="26" fill={C.blanco}>POLICÍA</text>
        {[-130, 140].map((cx) => (
          <g key={cx} transform={`translate(${cx} 34) rotate(${f * -12})`}>
            <circle r="46" fill={C.grisOsc} stroke={C.marinoOsc} strokeWidth="5" />
            <circle r="18" fill={C.suave} />
            <line x1="-18" x2="18" y1="0" y2="0" stroke={C.marino} strokeWidth="5" />
          </g>
        ))}
      </g>
      <text x="540" y="680" textAnchor="middle" fontFamily={F.exo} fontWeight={800} fontSize="130" fill={C.claro} opacity={P(f, 76, 6)}>
        {n}
      </text>
    </Lienzo>
  );
};

export const Ilustracion: React.FC<{ viz: Viz }> = ({ viz }) => {
  switch (viz) {
    case "bomba": return <Bomba />;
    case "lluvia": return <Lluvia />;
    case "barras": return <Barras />;
    case "banderas": return <Banderas />;
    case "barco": return <Barco />;
    case "patrulla": return <Patrulla />;
  }
};
