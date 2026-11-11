import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { Colombia, EEUU, Espana, Iran as BanderaIran, Nicaragua, Peru, Rusia, Ucrania } from "./banderas";

// Ilustraciones de la edición internacional del 11 nov 2026.
const FOTOS = "fotos/2026-11-11-int/";
const cuenta = (f: number, at: number, hasta: number, d = 24) =>
  Math.round(interpolate(f, [at, at + d], [0, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));

const Persona: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.claro }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
    <circle cy="-22" r="12" />
    <path d="M-18 14 a18 20 0 0 1 36 0 z" />
  </g>
);

/* ---------- 1. Cierra la ronda de Abu Dabi: canje de prisioneros y viaje a Moscú ---------- */
export const AbuDabiCierre: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const entra = P(f, c("banderas") - 10, 16, outCubic);
  const usa = pop(f, c("usa"));
  const canje = P(f, c("canje"), 40, inOut);
  const rubio = P(f, c("rubio"), 14, outCubic);
  const moscu = P(f, c("moscu") - 6, 30, inOut);
  return (
    <Lienzo>
      <ellipse cx="540" cy="470" rx="330" ry="56" fill="#12345E" stroke={C.celeste} strokeWidth="4" opacity={fade(f, 4)} />
      <g transform={`translate(${lerp(-260, 200, entra)} 300)`}><Rusia id="ad-ru" w={220} /></g>
      <g transform={`translate(${lerp(1340, 660, entra)} 300)`}><Ucrania id="ad-ua" w={220} /></g>
      <g transform={`translate(540 160) scale(${usa}) translate(-75 -40)`}><EEUU id="ad-us" w={150} /></g>
      {/* canje: personas que cruzan en ambos sentidos por arcos */}
      {[0, 1, 2].map((i) => {
        const u = Math.min(1, Math.max(0, canje * 1.4 - i * 0.2));
        const a = lerp(310, 770, u), b = lerp(770, 310, u);
        const arco = (x: number) => 560 + 70 * Math.sin(((x - 310) / 460) * Math.PI);
        return (
          <g key={i} opacity={fade(f, c("canje") + i * 4)}>
            <Persona x={a} y={arco(a)} s={0.9} color={C.claro} />
            <Persona x={b} y={arco(b) + 60} s={0.9} color={C.celeste} />
          </g>
        );
      })}
      {/* cita de Rubio */}
      <g transform={`translate(540 ${lerp(70, 50, rubio)})`} opacity={rubio * (1 - P(f, c("moscu") - 8, 8))}>
        <rect x="-250" y="-40" width="500" height="80" rx="40" fill={C.celeste} />
        <text y="13" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="38" fill={C.marino}>«MUY PRODUCTIVA»</text>
      </g>
      {/* avión hacia Moscú */}
      <g opacity={fade(f, c("moscu") - 6)}>
        <path d="M200 120 Q540 -20 880 90" fill="none" stroke={C.suave} strokeWidth="4" strokeDasharray="10 12" />
        <g transform={`translate(${lerp(200, 880, moscu)} ${lerp(120, 90, moscu) - 140 * Math.sin(Math.PI * moscu) * 0.6}) rotate(${lerp(-25, 20, moscu)})`}>
          <path d="M-34 0 L30 -6 Q42 0 30 6 Z M-6 -2 L-20 -30 L-10 -30 L12 -3 Z M-6 2 L-20 30 L-10 30 L12 3 Z M-30 0 L-40 -14 L-34 -14 L-22 -1 Z" fill={C.claro} />
        </g>
        <circle cx="880" cy="90" r="12" fill={C.celeste} />
      </g>
    </Lienzo>
  );
};

/* ---------- 2. León XIV llega a Perú ---------- */
export const PapaPeru: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const ciudades = [
    { n: "LIMA", at: c("lima") },
    { n: "CHICLAYO", at: c("chiclayo") },
    { n: "CUSCO", at: c("cusco") },
    { n: "PUCALLPA", at: c("pucallpa") },
  ];
  return (
    <Lienzo>
      <Sticker src={FOTOS + "papa.png"} id="papa11" x={10} y={330} w={570} h={385} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      <g transform={`translate(780 150) scale(${pop(f, c("peru"))}) translate(-100 -67)`}><Peru id="peru" w={200} /></g>
      <Cifra x={780} y={330} valor="16 NOV" rotulo="HASTA EL" k={P(f, c("fecha") - 6, 12, outBack)} size={86} />
      {ciudades.map((ci, i) => {
        const a = pop(f, ci.at - 4);
        const y = 430 + i * 72;
        return (
          <g key={ci.n} transform={`translate(660 ${y})`} opacity={Math.min(1, a * 1.5)}>
            <path d="M0 14 c0 0 -16 -16 -16 -28 a16 16 0 0 1 32 0 c0 12 -16 28 -16 28 z" fill={C.celeste} transform={`scale(${a})`} />
            <text x="34" y="2" fontFamily={F.mono} fontWeight={800} fontSize="32" fill={C.blanco} letterSpacing="2">{ci.n}</text>
          </g>
        );
      })}
    </Lienzo>
  );
};

/* ---------- 3. Ortega reaparece y cumple 81 años ---------- */
export const Ortega: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  return (
    <Lienzo>
      <g transform={`translate(230 140) scale(${pop(f, 8)}) translate(-100 -60)`}><Nicaragua id="nic" w={200} /></g>
      <Sticker src={FOTOS + "ortega.png"} id="ortega" x={390} y={250} w={610} h={447} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      <Cifra x={225} y={380} valor={`${cuenta(f, c("dias") - 4, 68)} DÍAS`} rotulo="SIN APARECER" k={P(f, c("dias") - 8, 12, outBack)} size={92} />
      <Cifra x={225} y={580} valor={`${cuenta(f, c("edad") - 4, 81, 18)} AÑOS`} rotulo="CUMPLE HOY" k={P(f, c("edad") - 8, 12, outBack)} size={92} />
    </Lienzo>
  );
};

/* ---------- 4. Huelga general en España ---------- */
const Icono: React.FC<{ tipo: "avion" | "tren" | "metro" }> = ({ tipo }) => {
  const st = { fill: "none", stroke: C.marino, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (tipo === "avion") return <path d="M-30 4 L26 -2 Q36 2 26 6 Z M-4 0 L-16 -24 L-8 -24 L10 -1 Z M-4 4 L-16 28 L-8 28 L10 5 Z" fill={C.marino} />;
  if (tipo === "tren") return <g {...st}><rect x="-22" y="-28" width="44" height="46" rx="10" /><path d="M-22 -4 H22 M-12 18 L-20 30 M12 18 L20 30" /><circle cx="-10" cy="8" r="2" /><circle cx="10" cy="8" r="2" /></g>;
  return <g {...st}><path d="M-26 22 V-14 Q-26 -28 -12 -28 H12 Q26 -28 26 -14 V22 Z" /><text y="10" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="30" fill={C.marino} stroke="none">M</text></g>;
};

export const HuelgaEspana: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const horas = P(f, c("horas"), 40, inOut);
  const reloj = pop(f, c("horas") - 6);
  const iconos: ("avion" | "tren" | "metro")[] = ["avion", "tren", "metro"];
  return (
    <Lienzo>
      <g transform={`translate(540 110) scale(${pop(f, c("huelga") - 6)}) translate(-120 -80)`}><Espana id="esp" w={240} /></g>
      {/* reloj de 24 horas */}
      <g transform={`translate(330 400) scale(${reloj})`} opacity={Math.min(1, reloj * 1.5)}>
        <circle r="120" fill="#12345E" stroke={C.suave} strokeOpacity="0.4" strokeWidth="10" />
        <circle r="120" fill="none" stroke={C.celeste} strokeWidth="10" strokeDasharray={2 * Math.PI * 120} strokeDashoffset={2 * Math.PI * 120 * (1 - horas)} transform="rotate(-90)" strokeLinecap="round" />
        <text y="22" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="76" fill={C.claro}>24 H</text>
      </g>
      {["CCOO", "UGT"].map((s, i) => {
        const k = pop(f, c("sindicatos") + 30 + i * 30);
        return (
          <g key={s} transform={`translate(760 ${330 + i * 110}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
            <rect x="-120" y="-38" width="240" height="76" rx="38" fill="rgba(14,44,82,0.92)" stroke={C.suave} strokeWidth="2.5" />
            <text y="13" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="40" fill={C.blanco}>{s}</text>
          </g>
        );
      })}
      {iconos.map((t, i) => {
        const k = pop(f, c("transporte") + i * 10);
        const x = [330, 540, 750][i];
        const tacha = P(f, c("transporte") + i * 10 + 8, 8);
        return (
          <g key={t} transform={`translate(${x} 660) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
            <circle r="56" fill={C.suave} />
            <Icono tipo={t} />
            <line x1="-44" y1="-44" x2={-44 + 88 * tacha} y2={-44 + 88 * tacha} stroke="#E5484D" strokeWidth="10" strokeLinecap="round" />
          </g>
        );
      })}
    </Lienzo>
  );
};

/* ---------- 5. Colombia: 10 años del acuerdo de paz y 480 firmantes asesinados ---------- */
export const PazColombia: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const n = cuenta(f, c("cifra") - 4, 480, 30);
  const paloma = pop(f, c("paz") - 6);
  return (
    <Lienzo>
      <g transform={`translate(240 130) scale(${pop(f, 6)}) translate(-105 -70)`}><Colombia id="col" w={210} /></g>
      {/* paloma de la paz */}
      <g transform={`translate(780 140) scale(${paloma * 1.7}) translate(0 ${Math.sin(f / 8) * 3})`} opacity={Math.min(1, paloma * 1.5)}>
        <path d="M-40 10 Q-10 -40 34 -30 Q14 -20 18 -2 Q36 10 50 2 Q34 34 -6 28 L-30 46 L-24 22 Q-38 20 -40 10 Z" fill={C.claro} />
        <path d="M30 -28 l14 -6 l-8 10 z" fill="#F2B544" />
      </g>
      <Cifra x={270} y={360} valor="10 AÑOS" rotulo="DEL ACUERDO DE PAZ" k={P(f, c("paz") - 8, 12, outBack)} size={92} />
      <Cifra x={780} y={360} valor={`${n}`} rotulo="FIRMANTES ASESINADOS" k={P(f, c("cifra") - 8, 12, outBack)} size={110} />
      {/* 48 personas = 480 firmantes (cada una representa 10) */}
      {Array.from({ length: 48 }).map((_, i) => {
        const col = i % 12, fila = Math.floor(i / 12);
        const on = n >= (i + 1) * 10;
        return <Persona key={i} x={250 + col * 52} y={500 + fila * 62} s={0.8} color={on ? "#F2B544" : "rgba(127,184,230,0.35)"} />;
      })}
      <text x="540" y="770" textAnchor="middle" fontFamily={F.mono} fontWeight={600} fontSize="20" fill={C.suave} opacity={fade(f, c("cifra"))}>CADA FIGURA = 10 PERSONAS</text>
    </Lienzo>
  );
};

/* ---------- 6. Irán exhibe misiles y drones ---------- */
export const IranArsenal: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  return (
    <Lienzo>
      <g transform={`translate(540 100) scale(${pop(f, 6)}) translate(-110 -63)`}><BanderaIran id="iran2" w={220} /></g>
      {/* misiles que se elevan */}
      {[0, 1, 2].map((i) => {
        const at = c("misiles") - 4 + i * 6;
        const sube = P(f, at, 30, outCubic);
        const x = 250 + i * 120;
        return (
          <g key={i} transform={`translate(${x} ${lerp(760, 470 - i * 30, sube)})`} opacity={fade(f, at)}>
            <path d="M0 -110 Q18 -84 18 -60 V60 L36 92 H-36 L-18 60 V-60 Q-18 -84 0 -110 Z" fill={C.grisClaro} stroke={C.marinoOsc} strokeWidth="4" />
            <rect x="-18" y="-40" width="36" height="14" fill="#DA0000" />
            <path d={`M-12 96 Q0 ${130 + 20 * Math.sin(f / 2)} 12 96 Z`} fill="#F2B544" opacity={1 - sube * 0.5} />
          </g>
        );
      })}
      {/* drones que cruzan */}
      {[0, 1].map((i) => {
        const at = c("drones") - 2 + i * 8;
        const u = P(f, at, 70, inOut);
        return (
          <g key={i} transform={`translate(${lerp(1100, 640 + i * 120, u)} ${230 + i * 70})`} opacity={fade(f, at)}>
            <path d="M-40 0 L30 -18 L20 0 L30 18 Z" fill={C.suave} stroke={C.marinoOsc} strokeWidth="3" />
          </g>
        );
      })}
      <Cifra x={760} y={560} valor={`${cuenta(f, c("guerra") - 6, 8, 16)} MESES`} rotulo="DE GUERRA" k={P(f, c("guerra") - 10, 12, outBack)} size={100} />
    </Lienzo>
  );
};

export const VIZ_INTERNACIONAL_2: Record<string, React.FC<VizProps>> = {
  abudabi: AbuDabiCierre,
  papaperu: PapaPeru,
  ortega: Ortega,
  huelga: HuelgaEspana,
  colombia: PazColombia,
  iranarsenal: IranArsenal,
};
