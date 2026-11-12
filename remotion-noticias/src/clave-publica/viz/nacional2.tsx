import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";

// Ilustraciones de la edición nacional del 12 nov 2026.
const FOTOS = "fotos/2026-11-12/";
const cuenta = (f: number, at: number, hasta: number, d = 22) =>
  Math.round(interpolate(f, [at, at + d], [0, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));

/** Píldora con texto (chip de dato). */
const Chip: React.FC<{ x: number; y: number; texto: string; k: number; color?: string; size?: number }> = ({ x, y, texto, k, color = C.blanco, size = 28 }) => {
  const w = texto.length * size * 0.66 + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-size - 4} width={w} height={size * 2 + 8} rx={size + 4} fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="2.5" />
      <text y={size * 0.36} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize={size} fill={color} letterSpacing="1.5">{texto}</text>
    </g>
  );
};

/** Logo sobre tarjeta blanca (para logos con fondo blanco o colores oscuros). */
const LogoCard: React.FC<{ src: string; x: number; y: number; w: number; h: number; k: number; pad?: number }> = ({ src, x, y, w, h, k, pad = 18 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <rect x={-w / 2 - pad} y={-h / 2 - pad} width={w + pad * 2} height={h + pad * 2} rx="24" fill="#FFFFFF" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
    <image href={staticFile(src)} x={-w / 2} y={-h / 2} width={w} height={h} />
  </g>
);

const Persona: React.FC<{ x: number; y: number; s?: number; cartel?: boolean; f: number; i: number }> = ({ x, y, s = 1, cartel, f, i }) => (
  <g transform={`translate(${x} ${y + Math.sin(f / 5 + i) * 3}) scale(${s})`}>
    {cartel && (
      <g transform={`rotate(${Math.sin(f / 7 + i) * 6})`}>
        <line x1="22" y1="-10" x2="22" y2="-72" stroke={C.suave} strokeWidth="4" />
        <rect x="-4" y="-110" width="52" height="40" rx="4" fill={C.grisClaro} />
      </g>
    )}
    <circle cy="-24" r="13" fill={C.claro} />
    <path d="M-20 16 a20 22 0 0 1 40 0 z" fill={C.claro} />
  </g>
);

/* ---------- 1. Protesta frente al Congreso y Luis Contreras ---------- */
export const ProtestaCongreso: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const cont = P(f, c("contreras") - 4, 16, outCubic);
  const dim = lerp(1, 0.22, cont);
  return (
    <Lienzo>
      <g opacity={dim}>
        <Sticker src={FOTOS + "congreso.png"} id="cong12" x={240} y={40} w={600} h={400} k={k} opacity={Math.min(1, k * 2)} fadeBottom fadeLeft />
        {Array.from({ length: 11 }).map((_, i) => {
          const a = pop(f, c("protesta") + i * 2);
          return <g key={i} opacity={a}><Persona x={180 + i * 72} y={700} s={0.95} cartel={i % 3 === 1} f={f} i={i} /></g>;
        })}
        <Cifra x={300} y={555} valor={`${cuenta(f, c("horas") - 6, 12, 16)} HORAS`} rotulo="FRENTE AL CONGRESO" k={P(f, c("horas") - 10, 12, outBack)} size={88} />
        <Chip x={770} y={520} texto="DECRETO 51-2022" k={pop(f, c("decreto") - 4)} />
      </g>
      <Sticker src={FOTOS + "contreras.png"} id="contreras" x={lerp(700, 200, cont)} y={300} w={640} h={431} k={1} opacity={cont} fadeBottom />
    </Lienzo>
  );
};

/* ---------- 2. El edificio de la zona 5 queda en manos del MP ---------- */
const Edificio: React.FC<{ h: number }> = ({ h }) => (
  <g>
    <rect x="-110" y={-h} width="220" height={h} fill="#12345E" stroke={C.claro} strokeWidth="5" />
    {Array.from({ length: Math.floor(h / 46) - 1 }).map((_, r) =>
      [-70, -24, 22, 68].map((x) => <rect key={`${r}-${x}`} x={x - 14} y={-h + 24 + r * 46} width="28" height="24" rx="3" fill={C.celeste} opacity={0.35 + 0.4 * ((r + x) % 3 === 0 ? 1 : 0)} />)
    )}
    <rect x="-24" y="-44" width="48" height="44" fill={C.marinoOsc} stroke={C.claro} strokeWidth="3" />
  </g>
);

export const EdificioMP: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const sube = P(f, 8, 28, outCubic);
  const golpe = interpolate(f, [c("fallo") - 4, c("fallo") + 2, c("fallo") + 10], [-40, 10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mp = P(f, c("mp"), 14, outBack);
  return (
    <Lienzo>
      <LogoCard src={FOTOS + "mp.png"} x={780} y={150} w={250} h={150} k={pop(f, 6)} />
      <g transform={`translate(320 700)`} opacity={fade(f, 8)}>
        <g transform={`scale(1 ${sube})`}><Edificio h={460} /></g>
        <text y="44" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.suave} letterSpacing="2">ZONA 5</text>
        {/* sello «MP» cuando queda en manos del Ministerio Público */}
        <g transform={`translate(80 -380) scale(${mp}) rotate(-12)`} opacity={Math.min(1, mp * 1.5)}>
          <circle r="62" fill={C.celeste} />
          <path d="M-26 2 l18 18 l36 -40" fill="none" stroke={C.marino} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <Cifra x={780} y={430} valor="Q35.1 M" rotulo="VALOR DE LA COMPRA" k={P(f, c("monto") - 8, 12, outBack)} size={96} />
      {/* mazo del tribunal */}
      <g transform={`translate(790 640)`} opacity={fade(f, Math.min(c("fallo") - 8, 40))}>
        <rect x="-110" y="40" width="220" height="26" rx="8" fill="#5C3D2E" />
        <g transform={`rotate(${golpe}) translate(0 0)`}>
          <rect x="-12" y="-120" width="24" height="120" rx="8" fill="#8B5E3C" transform="rotate(35)" />
          <rect x="-60" y="-26" width="120" height="52" rx="12" fill="#8B5E3C" transform="translate(-60 -60) rotate(35)" />
        </g>
      </g>
    </Lienzo>
  );
};

/* ---------- 3. Orden de captura en el COG; Aguirre con arraigo ---------- */
export const CasoCOG: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const ag = P(f, c("aguirre") - 6, 16, outCubic);
  return (
    <Lienzo>
      <LogoCard src={FOTOS + "cog.png"} x={240} y={250} w={140} h={247} k={pop(f, 6)} />
      {/* documento con sello de orden de captura */}
      <g transform={`translate(${lerp(540, 240, ag)} ${lerp(330, 560, ag)}) scale(${lerp(1, 0.7, ag) * pop(f, c("orden") - 4)})`}>
        <rect x="-110" y="-140" width="220" height="280" rx="10" fill={C.grisClaro} />
        {[-90, -60, -30, 0].map((y) => <rect key={y} x="-80" y={y} width="160" height="10" rx="5" fill="#9AA7B8" />)}
        <g transform="translate(0 70) rotate(-14)">
          <rect x="-96" y="-28" width="192" height="56" rx="8" fill="none" stroke="#E5484D" strokeWidth="6" />
          <text y="11" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="30" fill="#E5484D">CAPTURA</text>
        </g>
      </g>
      <Sticker src={FOTOS + "aguirre.png"} id="aguirre" x={lerp(900, 470, ag)} y={260} w={470} h={469} k={1} opacity={ag} fadeBottom />
      <Chip x={720} y={150} texto="ARRAIGO" k={pop(f, c("arraigo") - 2)} color="#F2B544" />
      <Chip x={720} y={230} texto="CUENTAS EMBARGADAS" k={pop(f, c("arraigo") + 16)} color="#F2B544" size={24} />
    </Lienzo>
  );
};

/* ---------- 4. Dos temblores e Insivumeh ---------- */
export const Temblores: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const sismos = [
    { at: c("zacapa"), x: 740, y: 260, mag: "3.3", lugar: "ZACAPA · 8:53" },
    { at: c("pacifico"), x: 330, y: 420, mag: "4.4", lugar: "PACÍFICO · 9:34" },
  ];
  // sismógrafo: picos en cada temblor
  const pts = Array.from({ length: 120 }).map((_, i) => {
    const x = 120 + i * 7;
    const t = f - i * 0.6;
    let a = 4 * Math.sin(t / 2 + i);
    sismos.forEach((s, k) => {
      const d = t - s.at;
      if (d > 0 && d < 40) a += (k ? 70 : 45) * Math.exp(-d / 12) * Math.sin(d * 1.6 + i * 0.9);
    });
    return `${x},${660 + a}`;
  });
  return (
    <Lienzo>
      <LogoCard src={FOTOS + "insivumeh.png"} x={190} y={140} w={130} h={130} k={pop(f, 6)} pad={10} />
      {sismos.map((s, i) => {
        const a = pop(f, s.at - 4);
        return (
          <g key={i} transform={`translate(${s.x} ${s.y})`} opacity={Math.min(1, a * 1.5)}>
            {[0, 1, 2].map((r) => {
              const u = (((f - s.at) / 30 + r / 3) % 1 + 1) % 1;
              return f > s.at ? <circle key={r} r={30 + u * 110} fill="none" stroke={C.celeste} strokeWidth="4" opacity={1 - u} /> : null;
            })}
            <circle r="26" fill={C.celeste} transform={`scale(${a})`} />
            <text y="-50" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="72" fill={C.claro}>{s.mag}</text>
            <text y="74" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.blanco} letterSpacing="2">{s.lugar}</text>
          </g>
        );
      })}
      <polyline points={pts.join(" ")} fill="none" stroke={C.claro} strokeWidth="4" opacity={fade(f, c("temblores") - 6)} />
      <Chip x={760} y={540} texto={`${cuenta(f, c("sismos") - 4, 58)} SISMOS EN 24 H`} k={pop(f, c("sismos") - 6)} />
    </Lienzo>
  );
};

/* ---------- 5. Adriana Ruano: plata y boleto a Los Ángeles 2028 ---------- */
export const Ruano: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const med = pop(f, c("plata") - 4, 16);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "ruano.png"} id="ruano" x={20} y={180} w={560} h={536} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      {/* medalla de plata */}
      <g transform={`translate(790 220) scale(${med}) rotate(${Math.sin(f / 10) * 4})`} opacity={Math.min(1, med * 1.5)}>
        <path d="M-50 -150 L-10 -40 M50 -150 L10 -40" stroke="#4997D0" strokeWidth="34" />
        <path d="M-50 -150 L-10 -40 M50 -150 L10 -40" stroke="#FFFFFF" strokeWidth="10" />
        <circle r="78" fill="#C9CFD6" stroke="#8D96A0" strokeWidth="8" />
        <circle r="56" fill="none" stroke="#EEF2F6" strokeWidth="4" />
        <text y="22" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="64" fill="#5D6670">2</text>
        <path d={`M-60 -20 Q0 -70 60 -20`} stroke="#FFFFFF" strokeWidth="6" fill="none" opacity={0.5 + 0.5 * Math.sin(f / 6)} />
      </g>
      <Chip x={790} y={380} texto="DOHA · TIRO" k={pop(f, c("doha") - 4)} size={26} />
      <Cifra x={790} y={570} valor="LA 2028" rotulo="CLASIFICADA" k={P(f, c("la28") - 8, 12, outBack)} size={96} />
    </Lienzo>
  );
};

/* ---------- 6. Guatemala vs. Canadá ---------- */
/** Escudo de Canada Soccer redibujado en vectores (blanco sobre rojo), a partir de la imagen del usuario. */
const EscudoCanada: React.FC = () => (
  <g>
    <circle r="120" fill="#D52B1E" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
    <g fill="#FFFFFF">
      {/* hoja de maple (parte superior) */}
      <path d="M0 -92 L12 -66 L26 -72 L22 -46 L44 -60 L46 -48 L64 -52 L58 -32 H-58 L-64 -52 L-46 -48 L-44 -60 L-22 -46 L-26 -72 L-12 -66 Z" />
      <text y="10" textAnchor="middle" fontFamily={F.inter} fontWeight={900} fontSize="44" letterSpacing="-1">CANADA</text>
      {/* medio balón */}
      <path d="M-74 22 H74 A74 74 0 0 1 -74 22 Z" />
    </g>
    <g fill="#D52B1E">
      <path d="M-18 34 H18 L26 56 L0 72 L-26 56 Z" />
      <path d="M-62 30 H-34 L-40 52 L-58 56 Z" />
      <path d="M62 30 H34 L40 52 L58 56 Z" />
      <path d="M-30 80 L-8 90 L-14 96 Q-26 94 -34 88 Z" />
      <path d="M30 80 L8 90 L14 96 Q26 94 34 88 Z" />
    </g>
  </g>
);

export const GuateCanada: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const gt = pop(f, c("seleccion") - 4, 14);
  const ca = pop(f, c("canada") - 4, 14);
  const vs = pop(f, c("canada") + 6);
  const copa = pop(f, c("copa") - 4, 16);
  return (
    <Lienzo>
      <g transform={`translate(270 210) scale(${gt})`} opacity={Math.min(1, gt * 1.5)}>
        <image href={staticFile(FOTOS + "fedefut.png")} x="-165" y="-110" width="330" height="220" style={{ clipPath: "inset(0 round 24px)" }} filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
      </g>
      <g transform={`translate(810 210) scale(${ca})`} opacity={Math.min(1, ca * 1.5)}><EscudoCanada /></g>
      <text x="540" y="236" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontStyle="italic" fontSize="80" fill={C.celeste} opacity={vs} transform={`translate(540 210) scale(${vs}) translate(-540 -210)`}>VS</text>
      <Cifra x={540} y={500} valor="20:00" rotulo="VIERNES 13 · EL TRÉBOL" k={P(f, c("hora") - 8, 12, outBack)} size={110} />
      {/* trofeo de la Copa Oro */}
      <g transform={`translate(540 660) scale(${copa})`} opacity={Math.min(1, copa * 1.5)}>
        <path d="M-46 -70 H46 V-30 Q46 10 0 22 Q-46 10 -46 -30 Z" fill="#E8B923" />
        <path d="M-46 -60 Q-80 -60 -76 -34 Q-72 -12 -44 -12 M46 -60 Q80 -60 76 -34 Q72 -12 44 -12" fill="none" stroke="#E8B923" strokeWidth="9" />
        <rect x="-10" y="20" width="20" height="26" fill="#E8B923" />
        <rect x="-40" y="46" width="80" height="18" rx="4" fill="#C99A12" />
        <circle cx="-16" cy="-50" r="6" fill="#FFF3C4" opacity={0.6 + 0.4 * Math.sin(f / 4)} />
      </g>
    </Lienzo>
  );
};

export const VIZ_NACIONAL_2: Record<string, React.FC<VizProps>> = {
  protesta: ProtestaCongreso,
  edificiomp: EdificioMP,
  cog: CasoCOG,
  temblores: Temblores,
  ruano: Ruano,
  guatecanada: GuateCanada,
};
