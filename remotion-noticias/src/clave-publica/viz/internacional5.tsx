import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { Chile, EAU, EEUU, Iran as BanderaIran, Vietnam } from "./banderas";

// Ilustraciones de la edición internacional del 14 nov 2026.
const FOTOS = "fotos/2026-11-14-int/";
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
const Bandera: React.FC<{ x: number; y: number; k: number; w: number; h: number; children: React.ReactNode }> = ({ x, y, k, w, h, children }) => (
  <g transform={`translate(${x} ${y}) scale(${k}) translate(${-w / 2} ${-h / 2})`} opacity={Math.min(1, k * 1.5)}>{children}</g>
);
const Avion: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <path d="M-34 0 L30 -6 Q42 0 30 6 Z M-6 -2 L-20 -30 L-10 -30 L12 -3 Z M-6 2 L-20 30 L-10 30 L12 3 Z M-30 0 L-40 -14 L-34 -14 L-22 -1 Z" fill={C.claro} transform={`scale(${s})`} />
);

/* ---------- 1. Petroleros en llamas en Ormuz (motion graphics + Trump) ---------- */
const Petrolero: React.FC<{ fuego: number; f: number }> = ({ fuego, f }) => (
  <g>
    <path d="M-80 -6 H80 L60 22 H-66 Z" fill="#12345E" stroke={C.celeste} strokeWidth="4" />
    <rect x="-60" y="-20" width="100" height="14" rx="4" fill="#9AA7B8" />
    <rect x="44" y="-40" width="26" height="34" rx="4" fill={C.grisClaro} />
    {fuego > 0 && (
      <g opacity={fuego}>
        <path d={`M-30 -18 Q-20 ${-60 - Math.sin(f / 2) * 8} -6 -18 Q2 ${-46 - Math.cos(f / 3) * 6} 12 -18 Z`} fill="#F28C28" />
        <path d={`M-22 -18 Q-14 ${-40 - Math.sin(f / 2) * 5} -6 -18 Z`} fill="#F2B544" />
        {[0, 1, 2].map((i) => {
          const u = ((f / 30 + i / 3) % 1);
          return <circle key={i} cx={-12 + Math.sin(i * 2) * 10} cy={-60 - u * 70} r={10 + u * 14} fill="#4B5563" opacity={0.5 * (1 - u)} />;
        })}
      </g>
    )}
  </g>
);

export const OrmuzPetroleros: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 14, outBack);
  const avance = P(f, 6, 90, inOut);
  const tr = P(f, c("trump") - 6, 16, outCubic);
  const minas = [c("minas"), c("minas") + 8, c("minas") + 16];
  return (
    <Lienzo>
      <Bandera x={170} y={90} k={pop(f, 6)} w={170} h={97}><BanderaIran id="ir14" w={170} /></Bandera>
      {/* esquema del estrecho: costa de Irán arriba, península abajo */}
      <g opacity={k}>
        <path d="M60 170 Q300 210 520 180 Q760 150 1020 210 L1020 140 L60 140 Z" fill="#1F3A5C" stroke={C.claro} strokeOpacity="0.5" strokeWidth="2" />
        <path d="M60 520 Q260 470 460 500 Q640 530 760 440 Q860 380 1020 420 L1020 560 L60 560 Z" fill="#1F3A5C" stroke={C.claro} strokeOpacity="0.5" strokeWidth="2" />
        <text x="760" y="170" fontFamily={F.mono} fontWeight={700} fontSize="22" fill={C.suave} letterSpacing="2">IRÁN</text>
        <text x="420" y="300" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.claro} letterSpacing="3" opacity="0.8">ESTRECHO DE ORMUZ</text>
        <path d="M80 420 Q420 380 980 330" fill="none" stroke="#F2B544" strokeWidth="3" strokeDasharray="12 10" opacity="0.7" />
      </g>
      {minas.map((m, i) => {
        const x = 200 + i * 270 + avance * 70 * (1 - P(f, m, 10)), y = 420 - (x - 80) * 0.09;
        const fuego = P(f, m, 6);
        const boom = P(f, m, 3) * (1 - P(f, m + 4, 12));
        return (
          <g key={i} transform={`translate(${x} ${y + Math.sin(f / 8 + i) * 3}) scale(1.25)`}>
            <circle r={20 + 80 * boom} fill="#F2B544" opacity={boom * 0.8} />
            <Petrolero fuego={fuego} f={f + i * 20} />
          </g>
        );
      })}
      <Chip x={250} y={620} texto="NO VERIFICADO" k={pop(f, c("reuters") - 2)} color="#F2B544" size={24} />
      <Sticker src={FOTOS + "trump-senala.png"} id="trump14a" x={lerp(1100, 560, tr)} y={480} w={420} h={280} k={1} opacity={tr} fadeBottom />
      <Chip x={290} y={720} texto="TRUMP EVALÚA FRENAR ATAQUES" k={pop(f, c("frenar") - 2)} size={22} />
    </Lienzo>
  );
};

/* ---------- 2. Cumbre de la ASEAN en Manila (logo + Trump) ---------- */
export const CumbreASEAN: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const logo = pop(f, 6, 16);
  const tr = P(f, c("trump") - 6, 16, outCubic);
  return (
    <Lienzo>
      <g transform={`translate(540 200) scale(${logo})`} opacity={Math.min(1, logo * 1.5)}>
        <rect x="-220" y="-180" width="440" height="360" rx="30" fill="#FFFFFF" filter="drop-shadow(0 12px 24px rgba(0,0,0,0.45))" />
        <image href={staticFile(FOTOS + "asean.png")} x="-190" y="-154" width="380" height="308" />
      </g>
      <Chip x={540} y={430} texto="MANILA · 15 AL 17 DE NOV." k={pop(f, c("domingo") - 4)} size={24} />
      <Cifra x={270} y={620} valor={`${cuenta(f, c("policias") - 4, 20)} MIL`} rotulo="POLICÍAS EN MANILA" k={P(f, c("policias") - 8, 12, outBack)} size={92} />
      <Sticker src={FOTOS + "trump-serio.png"} id="trump14b" x={lerp(1100, 560, tr)} y={480} w={400} h={313} k={1} opacity={tr} fadeBottom />
      <Chip x={270} y={490} texto="LLEGA EL MARTES" k={pop(f, c("martes") - 2)} color={C.claro} size={22} />
    </Lienzo>
  );
};

/* ---------- 3. EE. UU. normaliza sus vuelos (bandera + motion graphics) ---------- */
export const VuelosEEUU: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const det = f >= c("detuvo") - 2 && f < c("normalidad") - 2;
  const ok = f >= c("normalidad") - 2;
  const blink = Math.floor(f / 10) % 2 === 0;
  const destinos = ["NUEVA YORK", "MIAMI", "CHICAGO", "LOS ÁNGELES"];
  const estado = (i: number) => (ok ? "A TIEMPO" : det ? "CANCELADO" : i % 2 ? "RETRASADO" : "A TIEMPO");
  const color = (s: string) => (s === "CANCELADO" ? (blink ? "#FF5A5F" : "#7A2B2E") : s === "RETRASADO" ? "#F2B544" : "#5CCB9B");
  const torre = pop(f, c("falla") - 6);
  const señal = f < c("normalidad") - 2;
  return (
    <Lienzo>
      <Bandera x={540} y={80} k={pop(f, 4)} w={190} h={100}><EEUU id="us14" w={190} /></Bandera>
      <g transform={`translate(540 330) scale(${pop(f, 8)})`}>
        <rect x="-400" y="-150" width="800" height="300" rx="18" fill="#0B1220" stroke={C.suave} strokeWidth="3" />
        <text x="-370" y="-108" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.suave} letterSpacing="3">SALIDAS · DEPARTURES</text>
        {destinos.map((d, i) => {
          const s = estado(i);
          return (
            <g key={d} transform={`translate(0 ${-50 + i * 54})`}>
              <text x="-370" y="10" fontFamily={F.mono} fontWeight={800} fontSize="30" fill={C.blanco}>{d}</text>
              <text x="370" y="10" textAnchor="end" fontFamily={F.mono} fontWeight={800} fontSize="30" fill={color(s)}>{s}</text>
            </g>
          );
        })}
      </g>
      {/* torre de control con señal cortada */}
      <g transform={`translate(230 640) scale(${torre})`} opacity={Math.min(1, torre * 1.5)}>
        <path d="M-20 90 L-12 -20 H12 L20 90 Z" fill={C.grisClaro} />
        <path d="M-46 -20 H46 L36 -60 H-36 Z" fill="#12345E" stroke={C.claro} strokeWidth="4" />
        {[1, 2].map((i) => <path key={i} d={`M${36 + i * 18} ${-80 - i * 6} q ${14} ${18} 0 ${36 + i * 8}`} fill="none" stroke={señal ? "#E5484D" : "#5CCB9B"} strokeWidth="5" strokeLinecap="round" opacity={señal ? (blink ? 1 : 0.2) : 1} />)}
      </g>
      <Cifra x={700} y={690} valor={`~${cuenta(f, c("vuelos") - 4, 7000, 24).toLocaleString("en-US")}`} rotulo="VUELOS RETRASADOS O CANCELADOS" k={P(f, c("vuelos") - 8, 12, outBack)} size={92} />
    </Lienzo>
  );
};

/* ---------- 4. Kast visita Vietnam ---------- */
export const KastVietnam: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const vuelo = P(f, c("vietnam") - 8, 40, inOut);
  const A: [number, number] = [640, 300], B: [number, number] = [930, 300];
  const px = lerp(A[0], B[0], vuelo), py = A[1] - 130 * Math.sin(Math.PI * vuelo);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "kast.png"} id="kast" x={20} y={200} w={500} h={522} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      <Bandera x={640} y={390} k={pop(f, c("chile") - 4)} w={150} h={100}><Chile id="cl14" w={150} /></Bandera>
      <Bandera x={900} y={390} k={pop(f, c("vietnam") - 4)} w={150} h={100}><Vietnam id="vn14" w={150} /></Bandera>
      <g opacity={fade(f, c("vietnam") - 8)}>
        <path d={`M${A[0]} ${A[1]} Q${(A[0] + B[0]) / 2} ${A[1] - 260} ${B[0]} ${B[1]}`} fill="none" stroke={C.suave} strokeWidth="4" strokeDasharray="10 12" />
        <g transform={`translate(${px} ${py}) rotate(${lerp(-40, 40, vuelo)})`}><Avion s={1.2} /></g>
      </g>
      <Chip x={770} y={530} texto="INVITA TO LAM" k={pop(f, c("tolam") - 2)} />
      <Cifra x={770} y={700} valor="15–17 NOV" rotulo="VISITA OFICIAL" k={P(f, c("fecha") - 8, 12, outBack)} size={86} />
    </Lienzo>
  );
};

/* ---------- 5. Tragedia vial en Emiratos (bandera + motion graphics) ---------- */
export const ChoqueEAU: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const choque = c("choque");
  const frena = P(f, 6, Math.max(10, choque - 6), inOut);
  const boom = P(f, choque, 3) * (1 - P(f, choque + 4, 16));
  const camionX = lerp(-120, 520, frena);
  const autos = [600, 700, 800, 900];
  return (
    <Lienzo>
      <Bandera x={540} y={90} k={pop(f, 4)} w={200} h={100}><EAU id="ae14" w={200} /></Bandera>
      {/* carretera */}
      <rect x="40" y="250" width="1000" height="200" fill="#1F2937" />
      <line x1="40" x2="1040" y1="350" y2="350" stroke="#F2B544" strokeWidth="6" strokeDasharray="40 30" />
      {autos.map((x, i) => {
        const empuje = P(f, choque, 14, outCubic) * (10 + i * 6);
        const rot = P(f, choque, 14) * (i % 2 ? 18 : -14);
        return (
          <g key={x} transform={`translate(${x + empuje} ${i % 2 ? 310 : 395}) rotate(${rot})`}>
            <rect x="-40" y="-18" width="80" height="36" rx="10" fill={["#3D9BE9", "#E5E7EB", "#F2B544", "#5CCB9B"][i]} />
            <rect x="-14" y="-14" width="28" height="28" rx="5" fill="#0B1220" opacity="0.6" />
          </g>
        );
      })}
      {/* camión */}
      <g transform={`translate(${camionX} 350) rotate(${P(f, choque, 10) * -8})`}>
        <rect x="-110" y="-34" width="150" height="68" rx="6" fill={C.grisClaro} />
        <rect x="40" y="-30" width="54" height="60" rx="8" fill="#E5484D" />
        <rect x="70" y="-22" width="18" height="44" rx="3" fill="#0B1220" opacity="0.6" />
      </g>
      <circle cx="580" cy="350" r={20 + 120 * boom} fill="#F2B544" opacity={boom * 0.8} />
      {f > choque && [0, 1, 2].map((i) => {
        const u = (((f - choque) / 34 + i / 3) % 1);
        return <circle key={i} cx={560 + Math.sin(i * 2) * 20} cy={320 - u * 120} r={16 + u * 24} fill="#4B5563" opacity={0.5 * (1 - u)} />;
      })}
      <Chip x={540} y={510} texto={`${cuenta(f, c("vehiculos") - 4, 23, 14)} VEHÍCULOS`} k={pop(f, c("vehiculos") - 4)} />
      <Cifra x={300} y={700} valor={`${cuenta(f, c("muertos") - 4, 14, 14)}`} rotulo="MUERTOS" k={P(f, c("muertos") - 8, 12, outBack)} size={120} />
      <Cifra x={780} y={700} valor={`${cuenta(f, c("heridos") - 4, 30, 14)}`} rotulo="HERIDOS" k={P(f, c("heridos") - 8, 12, outBack)} size={120} />
    </Lienzo>
  );
};

export const VIZ_INTERNACIONAL_5: Record<string, React.FC<VizProps>> = {
  ormuz: OrmuzPetroleros,
  asean: CumbreASEAN,
  vuelos: VuelosEEUU,
  kast: KastVietnam,
  choque: ChoqueEAU,
};
