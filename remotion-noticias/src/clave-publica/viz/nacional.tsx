import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";

const FOTOS = "fotos/2026-11-11/";
const cuenta = (f: number, at: number, hasta: number, d = 26) =>
  Math.round(interpolate(f, [at, at + d], [0, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));
const miles = (n: number) => n.toLocaleString("en-US");

/* ---------- 1. Ley del MetroRiel: Arévalo + tren que recorre 21 km de sur a norte ---------- */
export const MetroRiel: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const sale = P(f, c("tren") - 4, 18, inOut); // Arévalo se hace a un lado cuando aparece el tren
  const via = P(f, c("tren"), 24, outCubic);
  const avance = P(f, c("tren") + 10, 90, inOut);
  const yS = 690, yN = 110, xV = 760;
  const yTren = lerp(yS - 40, yN + 60, avance);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "arevalo.png"} id="arevalo" x={lerp(250, 40, sale)} y={lerp(230, 467, sale)} w={lerp(580, 304, sale)} h={lerp(497, 260, sale)} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      {/* vía de sur a norte */}
      <g opacity={via}>
        <rect x={xV - 46} y={yN} width="92" height={(yS - yN) * via} fill="rgba(127,184,230,0.08)" rx="10" />
        {Array.from({ length: 16 }).map((_, i) => {
          const y = yS - i * ((yS - yN) / 15);
          return y > yS - (yS - yN) * via ? <line key={i} x1={xV - 40} x2={xV + 40} y1={y} y2={y} stroke={C.suave} strokeOpacity="0.45" strokeWidth="6" /> : null;
        })}
        <line x1={xV - 26} x2={xV - 26} y1={yS} y2={yS - (yS - yN) * via} stroke={C.claro} strokeWidth="5" />
        <line x1={xV + 26} x2={xV + 26} y1={yS} y2={yS - (yS - yN) * via} stroke={C.claro} strokeWidth="5" />
        <text x={xV + 70} y={yS + 8} fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.suave} letterSpacing="2">SUR</text>
        <text x={xV + 70} y={yN + 18} fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.suave} letterSpacing="2" opacity={fade(f, c("km"))}>NORTE</text>
      </g>
      {/* tren visto desde arriba */}
      <g transform={`translate(${xV} ${yTren})`} opacity={fade(f, c("tren") + 6)}>
        <rect x="-34" y="-70" width="68" height="140" rx="30" fill={C.grisClaro} stroke={C.celeste} strokeWidth="5" />
        <rect x="-22" y="-56" width="44" height="26" rx="10" fill={C.marino} />
        {[-12, 14, 40].map((y) => <rect key={y} x="-20" y={y - 10} width="40" height="14" rx="4" fill={C.celeste} />)}
        <circle cx="0" cy="-80" r={8 + 4 * Math.sin(f / 4)} fill={C.claro} opacity="0.5" />
      </g>
      <Cifra x={340} y={150} valor={`${cuenta(f, c("km"), 21)} KM`} rotulo="DE SUR A NORTE" k={P(f, c("km") - 4, 12, outBack)} size={110} />
      <Cifra x={340} y={330} valor={`US$${cuenta(f, c("inversion") + 20, 930)} M`} rotulo="INVERSIÓN ESTIMADA" k={P(f, c("inversion") + 16, 12, outBack)} size={96} />
    </Lienzo>
  );
};

/* ---------- 2. Ley de Cine: Congreso + claqueta + 132 votos ---------- */
const Claqueta: React.FC<{ abre: number }> = ({ abre }) => (
  <g>
    <rect x="-110" y="-40" width="220" height="150" rx="12" fill="#1F2937" stroke={C.claro} strokeWidth="5" />
    {[-70, -10, 50].map((x) => <line key={x} x1={x} x2={x + 30} y1="10" y2="10" stroke={C.claro} strokeWidth="6" />)}
    <text y="80" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="30" fill={C.claro} letterSpacing="3">CINE</text>
    <g transform={`translate(-110 -40) rotate(${-24 * abre})`}>
      <rect x="0" y="-40" width="220" height="40" rx="8" fill={C.claro} />
      {[20, 70, 120, 170].map((x) => <path key={x} d={`M${x} -40 l26 0 l-22 40 l-26 0 z`} fill="#1F2937" />)}
    </g>
  </g>
);

export const LeyCine: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const cl = pop(f, c("cine"));
  // la claqueta se abre y cierra («¡acción!») al nombrar la ley
  const abre = f < c("cine") ? 1 : interpolate(f, [c("cine"), c("cine") + 8, c("cine") + 14, c("cine") + 18], [1, 1, 0, 0], { extrapolateRight: "clamp" });
  return (
    <Lienzo>
      <Sticker src={FOTOS + "congreso.png"} id="congreso" x={150} y={90} w={760} h={507} k={k} opacity={Math.min(1, k * 2)} fadeBottom fadeLeft />
      <g transform={`translate(780 620) scale(${cl})`} opacity={Math.min(1, cl * 1.5)}><Claqueta abre={abre} /></g>
      <Cifra x={330} y={640} valor={`${cuenta(f, c("votos") - 6, 132)}`} rotulo="VOTOS A FAVOR" k={P(f, c("votos") - 10, 12, outBack)} size={130} />
    </Lienzo>
  );
};

/* ---------- 3. Extorsiones: barras 2025 vs 2026 (enero–octubre) ---------- */
export const Extorsiones: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const base = 640, maxH = 400, max = 22595;
  const b26 = P(f, c("actual"), 24, outCubic);
  const b25 = P(f, c("anterior"), 24, outCubic);
  const pct = interpolate(f, [c("pct"), c("pct") + 24], [0, 40.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic });
  const tel = pop(f, 6);
  const barras = [
    { x: 560, v: 22595, p: b25, lab: "2025", col: "#2A5A8C" },
    { x: 780, v: 13310, p: b26, lab: "2026", col: C.celeste },
  ];
  return (
    <Lienzo>
      {/* teléfono con alerta (extorsión) */}
      <g transform={`translate(250 470) scale(${tel})`} opacity={Math.min(1, tel * 1.5)}>
        <rect x="-70" y="-120" width="140" height="240" rx="24" fill="#12345E" stroke={C.claro} strokeWidth="6" />
        <rect x="-52" y="-92" width="104" height="170" rx="8" fill={C.marinoOsc} />
        <circle cx="0" cy="98" r="9" fill={C.claro} />
        <g transform="translate(0 -8)" opacity={0.6 + 0.4 * Math.sin(f / 4)}>
          <path d="M0 -40 L38 30 H-38 Z" fill="#F2B544" />
          <rect x="-4" y="-16" width="8" height="26" rx="4" fill={C.marino} /><circle cx="0" cy="20" r="5" fill={C.marino} />
        </g>
      </g>
      <Cifra x={250} y={180} valor={`−${pct.toFixed(1)} %`} rotulo="DENUNCIAS ENE–OCT" k={P(f, c("pct") - 6, 12, outBack)} size={110} />
      <line x1="470" x2="880" y1={base} y2={base} stroke={C.suave} strokeWidth="4" opacity={fade(f, 4)} />
      {barras.map((b) => {
        const h = (maxH * b.v) / max * b.p;
        return (
          <g key={b.lab} opacity={fade(f, 4)}>
            <rect x={b.x - 70} y={base - h} width="140" height={h} rx="12" fill={b.col} />
            <text x={b.x} y={base + 44} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="30" fill={C.suave}>{b.lab}</text>
            <text x={b.x} y={base - h - 18} textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="44" fill={C.claro} opacity={b.p}>{miles(Math.round(b.v * b.p))}</text>
          </g>
        );
      })}
      {/* flecha de baja entre barras */}
      <path d="M620 180 Q690 200 720 290" fill="none" stroke={C.celeste} strokeWidth="6" strokeLinecap="round" strokeDasharray="200" strokeDashoffset={200 * (1 - P(f, c("anterior") + 20, 16))} />
      <path d="M700 280 L722 296 L732 270" fill="none" stroke={C.celeste} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity={fade(f, c("anterior") + 34)} />
    </Lienzo>
  );
};

/* ---------- 4. Operativos PNC + MP ---------- */
export const Operativos: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const pnc = pop(f, c("logos") - 6, 14);
  const mp = pop(f, c("mp") - 6, 14);
  const deptos = ["ALTA VERAPAZ", "ZACAPA", "CHIQUIMULA"];
  return (
    <Lienzo>
      <g transform={`translate(330 230) scale(${pnc})`} opacity={Math.min(1, pnc * 1.5)}>
        <circle r="150" fill={C.celeste} opacity="0.12" />
        <image href={staticFile(FOTOS + "pnc.png")} x="-118" y="-135" width="236" height="270" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
      </g>
      <g transform={`translate(740 230) scale(${mp})`} opacity={Math.min(1, mp * 1.5)}>
        <rect x="-160" y="-108" width="320" height="216" rx="26" fill="#FFFFFF" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
        <image href={staticFile(FOTOS + "mp.png")} x="-140" y="-84" width="280" height="168" />
      </g>
      {deptos.map((d, i) => {
        const k = pop(f, c("deptos") + i * 10);
        const x = [250, 540, 820][i];
        return (
          <g key={d} transform={`translate(${x} 450) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
            <rect x={-d.length * 11 - 46} y="-30" width={d.length * 22 + 74} height="60" rx="30" fill="rgba(14,44,82,0.92)" stroke={C.suave} strokeWidth="2.5" />
            <path d={`M${-d.length * 11 - 22} 12 c0 0 -14 -14 -14 -24 a14 14 0 0 1 28 0 c0 10 -14 24 -14 24 z`} fill={C.celeste} />
            <text x="12" y="10" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.blanco} letterSpacing="1.5">{d}</text>
          </g>
        );
      })}
      <Cifra x={350} y={660} valor={`+${cuenta(f, c("capturas") - 6, 25, 20)}`} rotulo="CAPTURADOS" k={P(f, c("capturas") - 10, 12, outBack)} size={130} />
      <Cifra x={740} y={660} valor={`${cuenta(f, c("armas") - 4, 14, 18)}`} rotulo="ARMAS DE FUEGO" k={P(f, c("armas") - 8, 12, outBack)} size={130} />
    </Lienzo>
  );
};

/* ---------- 5. Desnutrición infantil: niño + barras 2025 vs 2026 ---------- */
export const Desnutricion: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const base = 690, maxH = 470, max = 661;
  const b26 = P(f, c("actual"), 26, outCubic);
  const b25 = P(f, c("anterior"), 24, outCubic);
  const barras = [
    { x: 700, v: 439, p: b25, lab: "TODO 2025", col: "#2A5A8C", txt: C.claro },
    { x: 880, v: 661, p: b26, lab: "2026*", col: "#F2B544", txt: "#F2B544" },
  ];
  return (
    <Lienzo>
      <Sticker src={FOTOS + "nino.png"} id="nino" x={20} y={250} w={540} h={455} k={k} opacity={Math.min(1, k * 2)} />
      <line x1="600" x2="960" y1={base} y2={base} stroke={C.suave} strokeWidth="4" opacity={fade(f, c("actual") - 6)} />
      {barras.map((b) => {
        const h = (maxH * b.v) / max * b.p;
        return (
          <g key={b.lab} opacity={fade(f, c("actual") - 6)}>
            <rect x={b.x - 62} y={base - h} width="124" height={h} rx="12" fill={b.col} />
            <text x={b.x} y={base + 40} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.suave}>{b.lab}</text>
            <text x={b.x} y={base - h - 16} textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="56" fill={b.txt} opacity={b.p}>{Math.round(b.v * b.p)}</text>
          </g>
        );
      })}
      <text x="790" y={base + 78} textAnchor="middle" fontFamily={F.mono} fontWeight={600} fontSize="20" fill={C.suave} opacity={fade(f, c("actual") + 20)}>*HASTA EL 15 DE OCTUBRE</text>
    </Lienzo>
  );
};

export const VIZ_NACIONAL: Record<string, React.FC<VizProps>> = {
  metroriel: MetroRiel,
  cine: LeyCine,
  extorsiones: Extorsiones,
  operativos: Operativos,
  desnutricion: Desnutricion,
};
