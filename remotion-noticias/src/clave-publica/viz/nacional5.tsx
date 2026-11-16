import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { EscudoCanada } from "./nacional2";
import { MAPA, MapaGuatemala } from "./nacional3";

// Ilustraciones de la edición nacional del 16 nov 2026.
const FOTOS = "fotos/2026-11-16/";
const cuenta = (f: number, at: number, hasta: number, d = 22) =>
  Math.round(interpolate(f, [at, at + d], [0, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));

const Chip: React.FC<{ x: number; y: number; texto: string; k: number; color?: string; size?: number }> = ({ x, y, texto, k, color = C.blanco, size = 26 }) => {
  const w = texto.length * size * 0.66 + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-size - 4} width={w} height={size * 2 + 8} rx={size + 4} fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="2.5" />
      <text y={size * 0.36} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize={size} fill={color} letterSpacing="1.5">{texto}</text>
    </g>
  );
};
const Barrera: React.FC = () => (
  <g>
    <rect x="-34" y="-8" width="68" height="16" rx="4" fill="#FFFFFF" />
    {[-22, -2, 18].map((x) => <rect key={x} x={x} y="-8" width="10" height="16" fill="#E5484D" />)}
    <rect x="-30" y="8" width="6" height="22" fill={C.grisClaro} />
    <rect x="24" y="8" width="6" height="22" fill={C.grisClaro} />
  </g>
);
const Persona: React.FC<{ x: number; y: number; s?: number; color?: string; f?: number; i?: number }> = ({ x, y, s = 1, color = C.claro, f = 0, i = 0 }) => (
  <g transform={`translate(${x} ${y + Math.sin(f / 5 + i) * 2}) scale(${s})`} fill={color}>
    <circle cy="-24" r="12" />
    <path d="M-19 14 a19 21 0 0 1 38 0 z" />
  </g>
);

/* ---------- 1. Estado de sitio en Zacapa e Izabal ---------- */
export const EstadoSitio: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const m = pop(f, 6, 16);
  const on = P(f, c("zacapa") - 4, 14);
  const s = 0.86, MX = 50, MY = 60;
  return (
    <Lienzo>
      <g transform={`translate(${MX} ${MY}) scale(${s * m})`} opacity={Math.min(1, m * 1.5)}>
        <MapaGuatemala resaltar={["Zacapa", "Izabal"]} on={on} f={f} idp="sitio" />
        {(["Izabal", "Zacapa"] as const).map((d, i) => {
          const [cx, cy] = MAPA.centros[d];
          const k = pop(f, c("registro") - 2 + i * 6);
          const u = (f % 40) / 40;
          return (
            <g key={d}>
              {on > 0 && <circle cx={cx} cy={cy} r={16 + u * 60} fill="none" stroke="#E5484D" strokeWidth="5" opacity={(1 - u) * on} />}
              <text x={cx} y={cy - 26} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.blanco} letterSpacing="2" opacity={on}>{d.toUpperCase()}</text>
              <g transform={`translate(${cx} ${cy + 26}) scale(${k * 1.3})`} opacity={Math.min(1, k * 1.5)}><Barrera /></g>
            </g>
          );
        })}
      </g>
      <Cifra x={800} y={300} valor={`${cuenta(f, c("dias") - 4, 30, 16)} DÍAS`} rotulo="ESTADO DE SITIO" k={P(f, c("dias") - 8, 12, outBack)} size={96} />
      <Chip x={800} y={460} texto="CONTRA ESTRUCTURAS" k={pop(f, c("arevalo") + 10)} size={22} />
      <Chip x={800} y={530} texto="CRIMINALES" k={pop(f, c("arevalo") + 16)} size={22} />
      <Chip x={800} y={640} texto="PUESTOS DE REGISTRO" k={pop(f, c("registro") - 2)} color="#F2B544" size={22} />
    </Lienzo>
  );
};

/* ---------- 2. Lancha con droga interceptada en el Pacífico (motion graphics) ---------- */
export const LanchaPacifico: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const persigue = P(f, c("ejercito") - 6, 50, inOut);
  const lanchaX = lerp(660, 760, persigue);
  const patrullaX = lerp(-200, 520, persigue);
  const olas = (y: number, k: number) => (
    <path d={`M40 ${y} ${Array.from({ length: 16 }).map((_, i) => `q 32 ${(i % 2 ? 1 : -1) * 10} 64 0`).join(" ")}`} fill="none" stroke={C.celeste} strokeOpacity={0.45 - k * 0.12} strokeWidth="5" transform={`translate(${((f * (1.5 + k)) % 128) - 64} 0)`} />
  );
  return (
    <Lienzo>
      {/* costa */}
      <path d="M40 40 H1040 V110 Q800 150 540 120 Q300 90 40 140 Z" fill="#1F3A5C" stroke={C.claro} strokeOpacity="0.5" strokeWidth="2" opacity={fade(f, 4)} />
      <text x="80" y="90" fontFamily={F.mono} fontWeight={700} fontSize="22" fill={C.suave} letterSpacing="2" opacity={fade(f, 4)}>COSTA DEL PACÍFICO</text>
      {/* distancia */}
      <g opacity={fade(f, c("millas") - 4)}>
        <line x1={lanchaX} x2={lanchaX} y1="150" y2="320" stroke="#F2B544" strokeWidth="3" strokeDasharray="8 8" />
        <Chip x={lanchaX} y={200} texto="41 MILLAS NÁUTICAS" k={pop(f, c("millas") - 4)} color="#F2B544" size={22} />
      </g>
      {olas(380, 0)}{olas(420, 1)}{olas(460, 2)}
      {/* lancha sospechosa */}
      <g transform={`translate(${lanchaX} ${360 + Math.sin(f / 5) * 4})`} opacity={fade(f, c("lancha") - 10)}>
        <path d="M-70 -6 H60 L80 -20 L70 14 H-60 Z" fill="#E5E7EB" stroke={C.marinoOsc} strokeWidth="3" />
        {[-40, -14, 12].map((x) => <rect key={x} x={x} y="-24" width="22" height="18" rx="3" fill="#8B5E3C" />)}
      </g>
      {/* patrulla naval */}
      <g transform={`translate(${patrullaX} ${370 + Math.sin(f / 6) * 3})`} opacity={fade(f, c("ejercito") - 6)}>
        <path d="M-120 -10 H110 L140 -24 L120 20 H-110 Z" fill="#4B5563" stroke={C.claro} strokeWidth="3" />
        <rect x="-50" y="-44" width="70" height="34" rx="4" fill="#6B7280" />
        <rect x="-10" y="-64" width="6" height="22" fill={C.claro} />
        <circle cx="-7" cy="-68" r="6" fill={Math.floor(f / 6) % 2 ? "#E5484D" : "#3D9BE9"} />
      </g>
      {/* paquetes */}
      {Array.from({ length: 12 }).map((_, i) => {
        const k = pop(f, c("paquetes") - 6 + i * 2, 10);
        const col = i % 6, fila = Math.floor(i / 6);
        return <rect key={i} x={120 + col * 64} y={560 - fila * 40} width="56" height="34" rx="6" fill="#8B5E3C" stroke="#5C3D2E" strokeWidth="3" opacity={Math.min(1, k * 1.5)} transform={`scale(${k}) translate(${(1 - k) * 100} 0)`} />;
      })}
      <Cifra x={760} y={620} valor={`${cuenta(f, c("paquetes") - 4, 550)}`} rotulo="PAQUETES" k={P(f, c("paquetes") - 8, 12, outBack)} size={110} />
      <g opacity={fade(f, c("detenidos") - 14)}>
        {[0, 1, 2].map((i) => <Persona key={i} x={240 + i * 70} y={700} s={1.1} color="#F2B544" f={f} i={i} />)}
        <text x="310" y="760" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.blanco} letterSpacing="2">3 DETENIDOS</text>
      </g>
    </Lienzo>
  );
};

/* ---------- 3. Veteranos militares anuncian bloqueos (Congreso + motion graphics) ---------- */
export const BloqueosVeteranos: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const blq = c("bloqueos");
  return (
    <Lienzo>
      <Sticker src={FOTOS + "congreso.png"} id="cong16" x={240} y={30} w={600} h={400} k={k} opacity={Math.min(1, k * 2) * lerp(1, 0.55, P(f, blq, 10))} fadeBottom fadeLeft />
      {/* carretera bloqueada */}
      <g opacity={fade(f, blq - 6)}>
        <rect x="80" y="470" width="920" height="120" fill="#1F2937" />
        <line x1="80" x2="1000" y1="530" y2="530" stroke="#F2B544" strokeWidth="5" strokeDasharray="34 26" />
        {[200, 380, 560, 740, 900].map((x, i) => {
          const kk = pop(f, blq - 4 + i * 3);
          return (
            <g key={x} transform={`translate(${x} 530) scale(${kk})`} opacity={Math.min(1, kk * 1.5)}>
              <path d="M-22 26 L-8 -30 H8 L22 26 Z" fill="#F28C28" />
              <path d="M-14 0 H14 L16 10 H-16 Z" fill="#FFFFFF" />
            </g>
          );
        })}
        {Array.from({ length: 9 }).map((_, i) => <Persona key={i} x={150 + i * 95} y={455} s={0.9} f={f} i={i} />)}
      </g>
      <Chip x={300} y={660} texto="LUNES 16" k={pop(f, blq + 10)} />
      <Chip x={540} y={660} texto="MARTES 17" k={pop(f, blq + 16)} />
      <Chip x={540} y={750} texto="INICIATIVA 6416" k={pop(f, c("iniciativa") - 2)} color="#F2B544" />
    </Lienzo>
  );
};

/* ---------- 4. Asturias ya descansa en Guatemala (busto + motion graphics) ---------- */
export const AsturiasTumba: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const urna = P(f, c("cenizas") - 6, 30, inOut);
  const puerta = P(f, c("tumba") - 20, 20, inOut);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "busto.png"} id="busto" x={40} y={170} w={440} h={581} k={k} opacity={Math.min(1, k * 2)} />
      {/* urna que desciende */}
      <g transform={`translate(780 ${lerp(160, 360, urna)})`} opacity={fade(f, c("cenizas") - 6)}>
        <path d="M-40 -60 H40 L34 -40 Q60 -10 50 30 Q40 60 0 64 Q-40 60 -50 30 Q-60 -10 -34 -40 Z" fill="#C9A227" stroke="#8A6A00" strokeWidth="4" />
        <rect x="-46" y="-74" width="92" height="16" rx="5" fill="#8A6A00" />
        <path d="M-30 6 H30" stroke="#8A6A00" strokeWidth="4" />
      </g>
      {/* lápida / tumba que se abre al público */}
      <g transform="translate(780 560)" opacity={fade(f, c("centro") - 6)}>
        <rect x="-170" y="-40" width="340" height="110" rx="12" fill="#1F3A5C" stroke={C.claro} strokeWidth="4" />
        <text y="0" textAnchor="middle" fontFamily={F.inter} fontWeight={900} fontSize="28" fill={C.blanco}>MIGUEL ÁNGEL ASTURIAS</text>
        <text y="40" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="24" fill={C.suave} letterSpacing="3">1899 – 1974</text>
        {/* rejas que se abren */}
        <g opacity={1 - puerta * 0.9}>
          <rect x={-170 - puerta * 150} y="-40" width="170" height="110" fill="rgba(11,18,32,0.85)" />
          <rect x={puerta * 150} y="-40" width="170" height="110" fill="rgba(11,18,32,0.85)" />
        </g>
      </g>
      {/* flores */}
      {Array.from({ length: 5 }).map((_, i) => {
        const kk = pop(f, c("tumba") - 10 + i * 3);
        return (
          <g key={i} transform={`translate(${640 + i * 70} 660) scale(${kk})`} opacity={Math.min(1, kk * 1.5)}>
            {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-12" rx="8" ry="13" fill={["#F472B6", "#FBBF24", "#F9A8D4", "#A78BFA", "#FB7185"][i]} transform={`rotate(${a})`} />)}
            <circle r="6" fill="#F2B544" />
          </g>
        );
      })}
      <Chip x={780} y={750} texto="ABIERTA AL PÚBLICO DESDE HOY" k={pop(f, c("tumba") - 4)} color="#5CCB9B" size={20} />
    </Lienzo>
  );
};

/* ---------- 5. Hoy, la vuelta en Toronto (logos + motion graphics) ---------- */
export const VueltaToronto: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const gt = pop(f, 6, 14);
  const ca = pop(f, 10, 14);
  const avion = P(f, c("charter") - 10, 34, inOut);
  return (
    <Lienzo>
      <g transform={`translate(230 210) scale(${gt * 0.8})`} opacity={Math.min(1, gt * 1.5)}>
        <image href={staticFile(FOTOS + "fedefut.png")} x="-165" y="-110" width="330" height="220" style={{ clipPath: "inset(0 round 24px)" }} filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
      </g>
      <g transform={`translate(850 210) scale(${ca * 0.9})`} opacity={Math.min(1, ca * 1.5)}><EscudoCanada /></g>
      <g transform="translate(540 220)" opacity={fade(f, 14)}>
        <text y="0" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.suave} letterSpacing="2">IDA</text>
        <text y="70" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="80" fill={C.blanco}>2–3</text>
      </g>
      {/* vuelo chárter a Toronto */}
      <g opacity={fade(f, c("charter") - 10)}>
        <path d="M160 440 Q540 300 920 440" fill="none" stroke={C.suave} strokeWidth="4" strokeDasharray="10 12" />
        {[[160, "GUATEMALA"], [920, "TORONTO"]].map(([x, t]) => (
          <g key={t as string} transform={`translate(${x} 440)`}>
            <circle r="11" fill={C.celeste} />
            <text y="40" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.blanco} letterSpacing="2">{t as string}</text>
          </g>
        ))}
        <g transform={`translate(${lerp(160, 920, avion)} ${440 - 140 * Math.sin(Math.PI * avion) + 0}) rotate(${lerp(-25, 25, avion)})`}>
          <path d="M-34 0 L30 -6 Q42 0 30 6 Z M-6 -2 L-20 -30 L-10 -30 L12 -3 Z M-6 2 L-20 30 L-10 30 L12 3 Z M-30 0 L-40 -14 L-34 -14 L-22 -1 Z" fill={C.claro} transform="scale(1.4)" />
        </g>
        <text x="540" y="360" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill="#F2B544" letterSpacing="2" opacity={fade(f, c("charter") - 4)}>VUELO CHÁRTER</text>
      </g>
      <Cifra x={540} y={680} valor="+2 GOLES" rotulo="PARA AVANZAR" k={P(f, c("goles") - 6, 12, outBack)} size={110} />
    </Lienzo>
  );
};

export const VIZ_NACIONAL_5: Record<string, React.FC<VizProps>> = {
  estadositio: EstadoSitio,
  lancha: LanchaPacifico,
  bloqueos: BloqueosVeteranos,
  asturiastumba: AsturiasTumba,
  vueltatoronto: VueltaToronto,
};
