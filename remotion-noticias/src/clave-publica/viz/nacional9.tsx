import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { MAPA, MapaGuatemala } from "./nacional3";

// Ilustraciones de la edición nacional del 20 nov 2026 (fotos y logos reutilizados de días anteriores).
const cuenta = (f: number, at: number, desde: number, hasta: number, d = 22) =>
  Math.round(interpolate(f, [at, at + d], [desde, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));
const ROJO = "#E5484D";
const AMARILLO = "#F2B544";

const Chip: React.FC<{ x: number; y: number; texto: string; k: number; color?: string; size?: number }> = ({ x, y, texto, k, color = C.blanco, size = 26 }) => {
  const w = texto.length * size * 0.66 + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-size - 4} width={w} height={size * 2 + 8} rx={size + 4} fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="2.5" />
      <text y={size * 0.36} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize={size} fill={color} letterSpacing="1.5">{texto}</text>
    </g>
  );
};
const LogoCard: React.FC<{ src: string; x: number; y: number; w: number; h: number; k: number; pad?: number }> = ({ src, x, y, w, h, k, pad = 14 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <rect x={-w / 2 - pad} y={-h / 2 - pad} width={w + pad * 2} height={h + pad * 2} rx="20" fill="#FFFFFF" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
    <image href={staticFile(src)} x={-w / 2} y={-h / 2} width={w} height={h} />
  </g>
);
const Calendario: React.FC<{ mes: string; dia: string; rojo?: boolean }> = ({ mes, dia, rojo }) => (
  <g filter="drop-shadow(0 8px 16px rgba(0,0,0,0.4))">
    <rect x="-80" y="-85" width="160" height="170" rx="18" fill={C.grisClaro} />
    <rect x="-80" y="-85" width="160" height="48" rx="18" fill={rojo ? ROJO : C.celeste} />
    <rect x="-80" y="-55" width="160" height="18" fill={rojo ? ROJO : C.celeste} />
    <text y="-52" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill="#FFFFFF" letterSpacing="3">{mes}</text>
    <text y="55" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="84" fill={C.marino}>{dia}</text>
  </g>
);

/* ---------- 1. Nueva Ley de Contrataciones: umbral de licitación de Q900 mil a Q2 millones ---------- */
const Pensamiento: React.FC = () => (
  <g>
    <circle r="34" fill="rgba(14,44,82,0.92)" stroke={C.suave} strokeWidth="3" />
    <path d="M0 -18 a14 14 0 0 1 9 25 v6 h-18 v-6 a14 14 0 0 1 9 -25z" fill={AMARILLO} />
    <rect x="-7" y="15" width="14" height="5" rx="2" fill={C.claro} />
  </g>
);
export const LeyContrataciones: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const fb = P(f, c("comision") - 8, 14, inOut); // fase 2: dictamen y revisión
  const X0 = 150, X1 = 930; // escala de Q0 a Q2.4 millones
  const xq = (m: number) => X0 + ((X1 - X0) * m) / 2.4;
  const mueve = P(f, c("dos") - 4, 22, inOut);
  const umbral = lerp(0.9, 2, mueve);
  const km = pop(f, c("licitar") - 8, 14);
  return (
    <Lienzo>
      <Sticker src="fotos/2026-11-16/congreso.png" id="cong20" x={240} y={0} w={600} h={400} k={k} opacity={Math.min(1, k * 2)} fadeBottom fadeLeft />
      {/* escala del umbral de licitación */}
      <g opacity={Math.min(1, km * 1.5) * (1 - fb)}>
        <rect x={X0} y="560" width={X1 - X0} height="22" rx="11" fill="rgba(127,184,230,0.25)" />
        <rect x={X0} y="560" width={xq(umbral) - X0} height="22" rx="11" fill={C.celeste} />
        <rect x={xq(umbral)} y="560" width={X1 - xq(umbral)} height="22" rx="11" fill={AMARILLO} opacity="0.85" />
        {/* marca anterior */}
        <line x1={xq(0.9)} y1="540" x2={xq(0.9)} y2="602" stroke={C.claro} strokeWidth="4" strokeDasharray="6 6" opacity={mueve} />
        <text x={xq(0.9)} y="640" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.suave} opacity={mueve > 0.05 ? 0.7 : 0} textDecoration={mueve > 0.6 ? "line-through" : undefined}>Q900 MIL</text>
        {/* marcador que se mueve */}
        <g transform={`translate(${xq(umbral)} 540)`}>
          <path d="M-22 -34 H22 L0 0 Z" fill={C.blanco} />
          <text y="-48" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="56" fill={C.claro}>{umbral < 1 ? "Q900 MIL" : umbral > 1.97 ? "Q2 MILLONES" : `Q${umbral.toFixed(1)} M`}</text>
        </g>
        <text x={X0} y="640" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.suave} opacity={fade(f, c("dos"))}>COTIZACIÓN</text>
        <text x={X1} y="640" textAnchor="end" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={AMARILLO} opacity={fade(f, c("dos"))}>LICITACIÓN</text>
      </g>
      {/* dictamen el lunes y 7 centros de pensamiento */}
      <g opacity={fb}>
        <g transform={`translate(260 600) scale(${pop(f, c("lunes") - 8, 14)})`}><Calendario mes="LUN" dia="23" /></g>
        <text x="260" y="730" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.suave} letterSpacing="2" opacity={fade(f, c("lunes"))}>DICTAMEN</text>
        {Array.from({ length: 7 }).map((_, i) => {
          const kk = pop(f, c("centros") - 6 + i * 3, 10);
          const x = 520 + (i % 4) * 100 + (i >= 4 ? 50 : 0);
          const y = i < 4 ? 520 : 610;
          return <g key={i} transform={`translate(${x} ${y}) scale(${kk})`} opacity={Math.min(1, kk * 1.5)}><Pensamiento /></g>;
        })}
        <Chip x={720} y={715} texto="PIDEN REVISIÓN TÉCNICA" k={pop(f, c("revision") - 6)} color={AMARILLO} size={24} />
      </g>
    </Lienzo>
  );
};

/* ---------- 2. Salario mínimo 2027: decide Arévalo ---------- */
const PROPUESTAS = [
  { quien: "GOBIERNO", cue: "gobierno", de: 4, a: 7, color: C.celeste },
  { quien: "EMPLEADORES", cue: "empleadores", de: 3, a: 4, color: C.suave },
  { quien: "TRABAJADORES", cue: "trabajadores", de: 10, a: 10, color: AMARILLO },
] as const;
export const SalarioMinimo: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = pop(f, 6, 16);
  const X0 = 480, PX = 44; // 0 % en x=480, 44 px por punto
  const kj = pop(f, c("junta") - 6);
  const kd = pop(f, c("diciembre") - 8);
  return (
    <Lienzo>
      <Cifra x={540} y={110} valor="2027" rotulo="SALARIO MÍNIMO" k={P(f, c("salario") - 6, 12, outBack)} size={110} />
      <Sticker src="fotos/2026-11-17/presidente.png" id="pres20" x={0} y={250} w={420} h={355} k={k} opacity={Math.min(1, k * 2)} />
      {/* eje 0–10 % */}
      <g opacity={P(f, c("gobierno") - 10, 10)}>
        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line x1={X0 + v * PX} y1="250" x2={X0 + v * PX} y2="560" stroke={C.suave} strokeOpacity="0.25" strokeWidth="2" />
            <text x={X0 + v * PX} y="590" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="22" fill={C.suave}>{v} %</text>
          </g>
        ))}
      </g>
      {PROPUESTAS.map((p, i) => {
        const t = P(f, c(p.cue) - 4, 16);
        const y = 290 + i * 105;
        const ancho = Math.max(18, (p.a - p.de) * PX);
        const x = X0 + p.de * PX - (p.a === p.de ? 9 : 0);
        return (
          <g key={p.quien} opacity={Math.min(1, t * 2)}>
            <text x={X0} y={y - 16} fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.claro} letterSpacing="2">{p.quien}</text>
            <rect x={X0} y={y} width={(x - X0 + ancho) * t} height="34" rx="8" fill="rgba(127,184,230,0.12)" />
            <rect x={x} y={y} width={ancho * t} height="34" rx="8" fill={p.color} />
            <text x={x + ancho + 12} y={y + 27} fontFamily={F.exo} fontWeight={900} fontSize="32" fill={p.color} opacity={t}>{p.de === p.a ? `${p.a} %` : `${p.de}–${p.a} %`}</text>
          </g>
        );
      })}
      <Chip x={600} y={680} texto="FALTA INFORME JUNTA MONETARIA" k={kj * (1 - P(f, c("diciembre") - 10, 8))} size={22} />
      <Chip x={600} y={680} texto="DECISIÓN EN DICIEMBRE" k={kd} color={AMARILLO} size={28} />
    </Lienzo>
  );
};

/* ---------- 3. Gas propano: precio alto pese a las multas ---------- */
const Cilindro: React.FC<{ f: number }> = ({ f }) => (
  <g filter="drop-shadow(0 14px 24px rgba(0,0,0,0.45))">
    {/* asa y válvula */}
    <path d="M-62 -205 V-250 Q-62 -270 -42 -270 H42 Q62 -270 62 -250 V-205" fill="none" stroke="#A9B4C2" strokeWidth="16" />
    <rect x="-20" y="-238" width="40" height="40" rx="6" fill="#C9D2DC" />
    <rect x="-8" y="-262" width="16" height="26" rx="4" fill="#8C98A6" />
    {/* cuerpo */}
    <rect x="-120" y="-205" width="240" height="390" rx="90" fill="#D9792F" />
    <rect x="-120" y="-205" width="80" height="390" rx="60" fill="#E89452" opacity="0.6" />
    <rect x="-120" y="-40" width="240" height="64" fill="#F5F8FC" />
    <text y="2" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="34" fill="#9C4F18">25 LB</text>
    <text y="18" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="13" fill="#9C4F18" letterSpacing="3">GAS PROPANO</text>
    {/* base */}
    <rect x="-104" y="178" width="208" height="34" rx="8" fill="#8C98A6" />
    {/* brillo */}
    <rect x="58" y="-150" width="16" height="260" rx="8" fill="#FFFFFF" opacity={0.18 + 0.08 * Math.sin(f / 10)} />
  </g>
);
const Distribuidora: React.FC<{ multa: number }> = ({ multa }) => (
  <g>
    <rect x="-46" y="-20" width="92" height="56" rx="6" fill="#5B6676" />
    <path d="M-52 -18 L0 -50 L52 -18 Z" fill="#7A8696" />
    <rect x="-14" y="6" width="28" height="30" fill="#1F2937" />
    <g transform={`rotate(-14) scale(${lerp(1.6, 1, multa)})`} opacity={multa}>
      <rect x="-50" y="-16" width="100" height="32" rx="6" fill="rgba(10,38,71,0.85)" stroke={ROJO} strokeWidth="4" />
      <text y="9" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="22" fill="#FF8A8D" letterSpacing="2">MULTA</text>
    </g>
  </g>
);
export const GasPropano: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const kc = pop(f, 4, 18);
  const fm = P(f, c("multo") - 8, 14, inOut); // fase de multas
  return (
    <Lienzo>
      <g transform={`translate(260 430) scale(${kc * 0.95})`} opacity={Math.min(1, kc * 1.5)}><Cilindro f={f} /></g>
      <g opacity={1 - fm}>
        <Cifra x={730} y={180} valor="Q138–140" rotulo="EN DISTRIBUIDORAS" k={P(f, c("precio") - 6, 12, outBack)} size={96} />
        <LogoCard src="fotos/2026-11-17/logo-mem.png" x={730} y={360} w={300} h={106} k={pop(f, c("referencia") - 8, 14)} />
        <Cifra x={730} y={560} valor={`Q${cuenta(f, c("veinte") - 10, 0, 120, 16)}`} rotulo="PRECIO DE REFERENCIA" k={P(f, c("veinte") - 12, 12, outBack)} size={96} />
        {/* diferencia */}
        <Chip x={730} y={690} texto="+Q18 SOBRE LA REFERENCIA" k={pop(f, c("veinte") + 6)} color={AMARILLO} size={22} />
      </g>
      <g opacity={fm}>
        <LogoCard src="fotos/2026-11-17/logo-mem.png" x={730} y={90} w={250} h={88} k={fm} />
        <Cifra x={730} y={290} valor={`+Q${cuenta(f, c("millones") - 4, 0, 39, 22)} M`} rotulo="EN MULTAS" k={P(f, c("millones") - 8, 12, outBack)} size={110} />
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={i} transform={`translate(${600 + (i % 2) * 260 - (i >= 2 ? 0 : 0)} ${470 + Math.floor(i / 2) * 140}) scale(${pop(f, c("distribuidoras") - 10 + i * 3, 10)})`}>
            <Distribuidora multa={P(f, c("distribuidoras") + i * 4, 8, outBack)} />
          </g>
        ))}
      </g>
    </Lienzo>
  );
};

/* ---------- 4. La Aurora: temporada alta de fin de año (motion graphics) ---------- */
const AvionMini: React.FC<{ color?: string }> = ({ color = C.claro }) => (
  <g fill={color}>
    <path d="M-48 -6 L40 -6 Q58 0 40 6 L-48 6 Z" />
    <path d="M-8 -4 L-28 -34 L-16 -34 L14 -4 Z" /><path d="M-8 4 L-28 34 L-16 34 L14 4 Z" />
    <path d="M-42 -4 L-52 -20 L-44 -20 L-32 -4 Z" />
  </g>
);
const Persona: React.FC<{ on: number }> = ({ on }) => (
  <g opacity={0.35 + 0.65 * on}>
    <circle cy="-22" r="11" fill={on > 0.5 ? C.celeste : C.suave} />
    <path d="M-16 16 a16 22 0 0 1 32 0 z" fill={on > 0.5 ? C.celeste : C.suave} />
    <rect x="12" y="-2" width="12" height="18" rx="3" fill={AMARILLO} opacity={on} />
  </g>
);
export const LaAurora: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const fd = P(f, c("destinos") - 8, 14, inOut);
  const ORIGEN: [number, number] = [190, 470];
  const destinos = Array.from({ length: 10 }, (_, i) => [430 + (i % 5) * 120, 250 + Math.floor(i / 5) * 110 + (i % 2) * 30] as [number, number]);
  return (
    <Lienzo>
      <Cifra x={540} y={140} valor={`${cuenta(f, c("sesenta") - 2, 65, 95, 34)}`} rotulo="VUELOS DIARIOS" k={P(f, c("vuelos") - 6, 12, outBack)} size={150} />
      {/* fase 1: pasajeros por día */}
      <g opacity={1 - fd}>
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i} transform={`translate(${190 + i * 100} 360) scale(${pop(f, c("pasajeros") - 8 + i * 2, 10) * 1.4})`}>
            <Persona on={P(f, c("pasajeros") + 4 + i * 2, 6)} />
          </g>
        ))}
        <text x="540" y="460" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.suave} letterSpacing="2" opacity={fade(f, c("pasajeros") + 6)}>6 A 8 MIL PASAJEROS AL DÍA</text>
      </g>
      {/* fase 2: 10 destinos nuevos */}
      <g opacity={fd}>
        <circle cx={ORIGEN[0]} cy={ORIGEN[1]} r="16" fill={C.celeste} />
        <text x={ORIGEN[0]} y={ORIGEN[1] + 46} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.claro} letterSpacing="2">GUA</text>
        {destinos.map(([x, y], i) => {
          const t = P(f, c("destinos") - 4 + i * 3, 14, inOut);
          const mx = (ORIGEN[0] + x) / 2, my = Math.min(ORIGEN[1], y) - 70;
          return (
            <g key={i}>
              <path d={`M${ORIGEN[0]} ${ORIGEN[1]} Q${mx} ${my} ${x} ${y}`} fill="none" stroke={C.suave} strokeWidth="3" strokeDasharray={`${t} 1`} pathLength={1} />
              <circle cx={x} cy={y} r={9 * t} fill={AMARILLO} />
            </g>
          );
        })}
        <Chip x={780} y={490} texto="HASTA EL 31 DE ENERO" k={pop(f, c("enero") - 8)} color={AMARILLO} size={24} />
      </g>
      {/* pista con despegues continuos */}
      <g opacity={P(f, c("aurora") - 10, 12)}>
        <rect x="60" y="640" width="960" height="70" rx="10" fill="#26303F" />
        <line x1="80" y1="675" x2="1000" y2="675" stroke="#E6EDF5" strokeWidth="4" strokeDasharray="34 26" opacity="0.7" />
        {/* torre de control */}
        <g transform="translate(130 560)">
          <rect x="-12" y="0" width="24" height="80" fill="#5B6676" />
          <path d="M-38 -26 H38 L28 4 H-28 Z" fill="#9CC9EC" stroke={C.claro} strokeWidth="3" />
          <rect x="-42" y="-34" width="84" height="10" rx="4" fill="#5B6676" />
        </g>
        {[0, 1, 2].map((j) => {
          const per = 70;
          const t = ((f + j * 23) % per) / per;
          const x = 260 + t * 680;
          const y = 670 - Math.max(0, t - 0.35) * 160;
          const ang = t > 0.35 ? -18 : 0;
          return <g key={j} transform={`translate(${x} ${y}) rotate(${ang})`} opacity={Math.min(1, t * 8) * (1 - P(t * 100, 75, 20))}><AvionMini /></g>;
        })}
      </g>
    </Lienzo>
  );
};

/* ---------- 5. Vuelca un bus en la Interamericana, en Tecpán (motion graphics) ---------- */
const Bus: React.FC = () => (
  <g>
    <rect x="-110" y="-46" width="220" height="80" rx="14" fill={AMARILLO} stroke="#B8862D" strokeWidth="4" />
    <rect x="-110" y="-4" width="220" height="10" fill="#C9363B" />
    {[-82, -40, 2, 44].map((x) => <rect key={x} x={x} y="-36" width="34" height="26" rx="4" fill="#9CC9EC" />)}
    <rect x="80" y="-36" width="22" height="40" rx="4" fill="#9CC9EC" />
    <circle cx="-66" cy="36" r="18" fill="#1F2937" stroke="#8C98A6" strokeWidth="5" />
    <circle cx="66" cy="36" r="18" fill="#1F2937" stroke="#8C98A6" strokeWidth="5" />
  </g>
);
const Ambulancia: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x="-70" y="-40" width="140" height="70" rx="10" fill={C.grisClaro} />
    <rect x="30" y="-30" width="34" height="30" rx="4" fill="#9CC9EC" />
    <rect x="-36" y="-26" width="12" height="36" fill={ROJO} /><rect x="-48" y="-14" width="36" height="12" fill={ROJO} />
    <rect x="-20" y="-52" width="40" height="12" rx="4" fill={f % 12 < 6 ? ROJO : C.celeste} />
    <circle cx="-40" cy="32" r="14" fill="#1F2937" /><circle cx="40" cy="32" r="14" fill="#1F2937" />
  </g>
);
export const BusTecpan: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const km = P(f, 4, 18, outBack);
  const on = P(f, c("tecpan") - 6, 12);
  const kb = pop(f, c("bus") - 6, 12);
  const vuelca = P(f, c("bus") + 14, 22, inOut);
  const amb = P(f, c("hospitales") - 6, 40, inOut);
  const [cx, cy] = MAPA.centros["Chimaltenango"];
  const s = 0.6;
  return (
    <Lienzo>
      {/* mapa con Chimaltenango */}
      <g transform={`translate(10 30) scale(${s * km})`} opacity={Math.min(1, km * 1.5)}>
        <MapaGuatemala resaltar="Chimaltenango" on={on} f={f} idp="chim" color="242,181,68" />
      </g>
      <text x={10 + cx * s + 30} y={30 + cy * s - 20} fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.blanco} letterSpacing="2" opacity={on}>TECPÁN</text>
      {/* rótulo de carretera */}
      <g transform={`translate(760 120) scale(${pop(f, c("kilometro") - 6, 14)})`}>
        <rect x="-120" y="-60" width="240" height="120" rx="12" fill="#1E7A46" stroke="#FFFFFF" strokeWidth="5" />
        <text y="-12" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill="#FFFFFF" letterSpacing="2">CA-1</text>
        <text y="40" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="52" fill="#FFFFFF">KM 77</text>
        <rect x="-6" y="60" width="12" height="60" fill="#8C98A6" />
      </g>
      {/* carretera y hondonada */}
            <rect x="430" y="400" width="500" height="44" rx="6" fill="#26303F" />
      <line x1="440" y1="422" x2="920" y2="422" stroke={AMARILLO} strokeWidth="4" strokeDasharray="26 20" />
      <path d="M720 444 Q760 610 860 600 L930 600 L930 444 Z" fill="#2E5B3A" opacity={0.85} />
      <path d="M720 444 Q760 610 860 600" fill="none" stroke="#5E8C66" strokeWidth="4" />
      {/* el bus vuelca hacia la hondonada */}
      <g transform={`translate(${lerp(560, 810, vuelca)} ${lerp(362, 548, vuelca)}) rotate(${lerp(0, 105, vuelca)}) scale(${kb * 0.9})`} opacity={Math.min(1, kb * 1.5)}><Bus /></g>
      <Cifra x={230} y={560} valor={`${cuenta(f, c("catorce") - 4, 0, 14, 16)}`} rotulo="HERIDOS" k={P(f, c("catorce") - 8, 12, outBack)} size={130} />
      <g transform={`translate(${lerp(1100, 560, amb)} 690) scale(0.9)`} opacity={amb > 0 ? 1 : 0}><Ambulancia f={f} /></g>
      <Chip x={800} y={690} texto="CHIRIJUYÚ" k={pop(f, c("chirijuyu") - 8)} size={24} />
    </Lienzo>
  );
};

export const VIZ_NACIONAL_9: Record<string, React.FC<VizProps>> = {
  leycontrataciones: LeyContrataciones,
  salariominimo: SalarioMinimo,
  gaspropano: GasPropano,
  laaurora: LaAurora,
  bustecpan: BusTecpan,
};
