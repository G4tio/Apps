import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { EEUU, Honduras, Iran as BanderaIran } from "./banderas";
import gaza from "./mapa-gaza.json";

// Ilustraciones de la edición internacional del 13 nov 2026.
const FOTOS = "fotos/2026-11-13-int/";
const GAZA = gaza as unknown as { w: number; h: number; paises: Record<string, string>; puntos: Record<string, [number, number]> };
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
const ImgCard: React.FC<{ src: string; x: number; y: number; w: number; h: number; k: number; fondo?: string; pad?: number; r?: number }> = ({ src, x, y, w, h, k, fondo, pad = 0, r = 22 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    {fondo && <rect x={-w / 2 - pad} y={-h / 2 - pad} width={w + pad * 2} height={h + pad * 2} rx={r} fill={fondo} filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />}
    <image href={staticFile(src)} x={-w / 2} y={-h / 2} width={w} height={h} style={fondo ? undefined : { clipPath: `inset(0 round ${r}px)` }} filter={fondo ? undefined : "drop-shadow(0 10px 20px rgba(0,0,0,0.45))"} />
  </g>
);
const X: React.FC<{ x: number; y: number; k: number; r?: number }> = ({ x, y, k, r = 30 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <circle r={r} fill="#E5484D" />
    <path d={`M${-r * 0.42} ${-r * 0.42} L${r * 0.42} ${r * 0.42} M${r * 0.42} ${-r * 0.42} L${-r * 0.42} ${r * 0.42}`} stroke="#FFFFFF" strokeWidth={r * 0.26} strokeLinecap="round" />
  </g>
);

/* ---------- 1. Golfo: versiones enfrentadas Irán vs. EE. UU. y mina en Ormuz ---------- */
export const Golfo: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const ir = pop(f, Math.min(c("guardia") - 4, 10), 14);
  const us = pop(f, c("comando") - 4, 14);
  const mina = c("mina");
  const boom = P(f, mina, 4) * (1 - P(f, mina + 6, 20));
  const Tarjeta: React.FC<{ x: number; k: number; titulo: string; children: React.ReactNode; bandera: React.ReactNode }> = ({ x, k, titulo, children, bandera }) => (
    <g transform={`translate(${x} 260) scale(${k * 1.05})`} opacity={Math.min(1, k * 1.5)}>
      <rect x="-200" y="-150" width="400" height="300" rx="26" fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="2.5" />
      <g transform="translate(-60 -128)">{bandera}</g>
      <text y="-34" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.suave} letterSpacing="2">{titulo}</text>
      {children}
    </g>
  );
  return (
    <Lienzo>
      <Tarjeta x={290} k={ir} titulo="VERSIÓN DE IRÁN" bandera={<BanderaIran id="ir13" w={120} />}>
        {/* radar */}
        <g transform="translate(0 50)">
          <path d="M-50 40 H50 M0 40 V0 M-46 -6 Q0 -76 46 -6 Z" fill="none" stroke={C.claro} strokeWidth="7" strokeLinejoin="round" />
          <circle cx="0" cy="-30" r="7" fill={C.claro} />
        </g>
        <X x={70} y={20} k={pop(f, c("radar") - 2)} r={26} />
        <text y="130" textAnchor="middle" fontFamily={F.exo} fontWeight={800} fontSize="28" fill={C.blanco}>«Radar destruido»</text>
      </Tarjeta>
      <Tarjeta x={750} k={us} titulo="VERSIÓN DE EE. UU." bandera={<EEUU id="us13i" w={120} />}>
        {[-55, 55].map((dx, i) => (
          <g key={dx} transform={`translate(${dx} 40) rotate(${-10 + i * 20})`}>
            <path d="M-36 0 L26 -14 L18 0 L26 14 Z" fill={C.suave} />
            <X x={18} y={-22} k={pop(f, c("drones") + i * 6)} r={16} />
          </g>
        ))}
        <text y="130" textAnchor="middle" fontFamily={F.exo} fontWeight={800} fontSize="28" fill={C.blanco}>«2 drones derribados»</text>
      </Tarjeta>
      {/* buque en Ormuz */}
      <g opacity={fade(f, mina - 20)}>
        {[0, 1].map((k) => (
          <path key={k} d={`M160 ${640 + k * 30} ${Array.from({ length: 12 }).map((_, i) => `q 32 ${(i % 2 ? 1 : -1) * 10} 64 0`).join(" ")}`} fill="none" stroke={C.celeste} strokeOpacity={0.5 - k * 0.15} strokeWidth="5" transform={`translate(${((f * (1.5 + k)) % 128) - 64} 0)`} />
        ))}
        <g transform={`translate(540 ${610 + Math.sin(f / 8) * 3}) rotate(${boom * 4})`}>
          <path d="M-150 -10 H150 L110 40 H-120 Z" fill="#12345E" stroke={C.celeste} strokeWidth="5" />
          {[-90, -30, 30].map((x) => <ellipse key={x} cx={x} cy="-28" rx="26" ry="18" fill={C.grisClaro} />)}
          <rect x="70" y="-70" width="50" height="60" rx="6" fill={C.grisClaro} />
        </g>
        <circle cx="580" cy="650" r={20 + 110 * boom} fill="#F2B544" opacity={boom * 0.85} />
        <text x="540" y="740" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.suave} letterSpacing="3">ESTRECHO DE ORMUZ</text>
      </g>
    </Lienzo>
  );
};

/* ---------- 2. OIEA: más de 400 kilos de uranio sin localizar ---------- */
export const UranioOIEA: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const bar = (i: number) => pop(f, c("kilos") - 10 + i * 4);
  return (
    <Lienzo>
      <ImgCard src={FOTOS + "oiea.png"} x={540} y={190} w={460} h={259} k={pop(f, 6)} />
      {[0, 1, 2, 3].map((i) => {
        const x = 300 + i * 160, y = 530;
        const k = bar(i);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5) * (0.55 + 0.45 * Math.abs(Math.sin(f / 9 + i)))}>
            <rect x="-48" y="-70" width="96" height="140" rx="12" fill="#E8B923" stroke="#8A6A00" strokeWidth="4" />
            <rect x="-48" y="-40" width="96" height="10" fill="#8A6A00" />
            <rect x="-48" y="30" width="96" height="10" fill="#8A6A00" />
            <g transform="translate(0 0)">
              <circle r="8" fill="#1F2937" />
              {[0, 120, 240].map((a) => <path key={a} d="M0 0 L-12 -24 A26 26 0 0 1 12 -24 Z" fill="#1F2937" transform={`rotate(${a})`} />)}
            </g>
          </g>
        );
      })}
      {/* signo de interrogación: no se sabe dónde están */}
      <text x="540" y="430" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="110" fill="#F2B544" opacity={fade(f, c("saber") - 4) * (0.6 + 0.4 * Math.sin(f / 5))}>?</text>
      <Cifra x={540} y={730} valor={`+${cuenta(f, c("kilos") - 4, 400, 24)} KG`} rotulo="URANIO MUY ENRIQUECIDO" k={P(f, c("kilos") - 8, 12, outBack)} size={96} />
    </Lienzo>
  );
};

/* ---------- 3. Caída global de Microsoft ---------- */
export const CaidaMicrosoft: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const apps = [
    { n: "OUTLOOK", col: "#0F6CBD", l: "O" },
    { n: "TEAMS", col: "#5B5FC7", l: "T" },
    { n: "COPILOT", col: "#13A10E", l: "C" },
  ];
  const caen = P(f, c("apps") + 10, 20);
  return (
    <Lienzo>
      <ImgCard src={FOTOS + "microsoft.png"} x={540} y={140} w={380} h={96} k={pop(f, c("falla") - 6)} fondo="#FFFFFF" pad={26} />
      {apps.map((a, i) => {
        const k = pop(f, c("apps") - 4 + i * 6);
        const x = 270 + i * 270;
        const gris = caen;
        return (
          <g key={a.n} transform={`translate(${x} 380) scale(${k}) translate(${gris > 0.5 ? Math.sin(f * 2 + i) * 2 : 0} 0)`} opacity={Math.min(1, k * 1.5)}>
            <rect x="-70" y="-70" width="140" height="140" rx="30" fill={a.col} opacity={1 - 0.6 * gris} />
            <rect x="-70" y="-70" width="140" height="140" rx="30" fill="#6B7280" opacity={0.7 * gris} />
            <text y="28" textAnchor="middle" fontFamily={F.inter} fontWeight={900} fontSize="80" fill="#FFFFFF">{a.l}</text>
            <text y="112" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.suave} letterSpacing="2">{a.n}</text>
            <g transform="translate(58 -58)" opacity={gris}>
              <circle r="24" fill="#E5484D" />
              <text y="11" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="32" fill="#FFFFFF">!</text>
            </g>
          </g>
        );
      })}
      <Cifra x={320} y={680} valor={`${cuenta(f, c("paises") - 4, 74)}`} rotulo="PAÍSES AFECTADOS" k={P(f, c("paises") - 8, 12, outBack)} size={120} />
      <Cifra x={760} y={680} valor={`+${cuenta(f, c("horas") - 4, 14, 16)} H`} rotulo="DE FALLAS" k={P(f, c("horas") - 8, 12, outBack)} size={120} />
    </Lienzo>
  );
};

/* ---------- 4. Rubio recibe a Nasry Asfura ---------- */
export const RubioAsfura: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const kr = P(f, 6, 16, outCubic);
  const ka = P(f, c("asfura") - 6, 16, outCubic);
  return (
    <Lienzo>
      <g transform={`translate(230 110) scale(${pop(f, 10)}) translate(-75 -40)`}><EEUU id="us13b" w={150} /></g>
      <g transform={`translate(850 110) scale(${pop(f, c("asfura") - 4)}) translate(-75 -37)`}><Honduras id="hn13" w={150} /></g>
      <Sticker src={FOTOS + "rubio.png"} id="rubio13" x={lerp(-400, 40, kr)} y={190} w={380} h={455} k={1} opacity={kr} fadeBottom />
      <Sticker src={FOTOS + "asfura.png"} id="asfura" x={lerp(1100, 580, ka)} y={200} w={450} h={448} k={1} opacity={ka} fadeBottom />
      <Chip x={330} y={710} texto="SEGURIDAD" k={pop(f, c("agenda") + 4)} />
      <Chip x={750} y={710} texto="MIGRACIÓN" k={pop(f, c("agenda") + 14)} />
      <Chip x={330} y={790} texto="FMI" k={pop(f, c("fmi") - 2)} color={C.claro} size={24} />
      <Chip x={750} y={790} texto="BID" k={pop(f, c("bid") - 2)} color={C.claro} size={24} />
    </Lienzo>
  );
};

/* ---------- 5. Gaza: bebé muere de hipotermia; ayuda bloqueada ---------- */
export const GazaFrio: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const m = P(f, 4, 18, outBack);
  const [jx, jy] = GAZA.puntos.janyunis;
  const onu = P(f, c("onu") - 6, 12);
  const OX = 40, OY = 150, S = 1.0;
  return (
    <Lienzo>
      <defs><clipPath id="gaza-clip"><rect x="0" y="0" width={GAZA.w} height={GAZA.h} rx="26" /></clipPath></defs>
      <g transform={`translate(${OX} ${OY}) scale(${S * m})`} opacity={Math.min(1, m * 1.5)}>
        <rect width={GAZA.w} height={GAZA.h} rx="26" fill="#0B2E55" stroke={C.suave} strokeOpacity="0.5" strokeWidth="2" />
        <g clipPath="url(#gaza-clip)">
          <path d={GAZA.paises.EGY} fill="#1F3A5C" stroke={C.claro} strokeOpacity="0.4" strokeWidth="1.5" />
          <path d={GAZA.paises.ISR} fill="#1F3A5C" stroke={C.claro} strokeOpacity="0.4" strokeWidth="1.5" />
          <path d={GAZA.paises.PSX} fill={`rgba(31,182,255,${0.25 + 0.45 * P(f, c("gaza") - 4, 12)})`} stroke={C.claro} strokeWidth="3" strokeLinejoin="round" />
        </g>
        <text x="70" y="90" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="2" opacity="0.8">MAR MEDITERRÁNEO</text>
        <text x="330" y="420" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="2" opacity="0.8">ISRAEL</text>
        <text x="30" y="480" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="2" opacity="0.8">EGIPTO</text>
        {/* Jan Yunis */}
        <g transform={`translate(${jx} ${jy})`} opacity={fade(f, c("janyunis") - 10)}>
          {(() => { const u = (f % 36) / 36; return <circle r={10 + u * 50} fill="none" stroke="#E5484D" strokeWidth="4" opacity={1 - u} />; })()}
          <circle r="10" fill="#E5484D" />
          <text x="-20" y="-22" textAnchor="end" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.blanco} letterSpacing="1.5">JAN YUNIS</text>
        </g>
        {/* cruces fronterizos donde está detenida la ayuda */}
        {(["rafah", "keremshalom"] as const).map((p, i) => {
          const [x, y] = GAZA.puntos[p];
          return (
            <g key={p} transform={`translate(${x} ${y}) scale(${pop(f, c("onu") + 6 + i * 6)})`} opacity={onu}>
              <rect x="-16" y="-16" width="32" height="32" rx="6" fill="#F2B544" />
              <path d="M-9 -9 L9 9 M9 -9 L-9 9" stroke={C.marino} strokeWidth="4" strokeLinecap="round" />
            </g>
          );
        })}
      </g>
      {/* termómetro */}
      <g transform={`translate(560 260) scale(${pop(f, c("hipotermia") - 4)})`} opacity={fade(f, c("hipotermia") - 4)}>
        <rect x="-16" y="-100" width="32" height="150" rx="16" fill="#12345E" stroke={C.claro} strokeWidth="4" />
        <rect x="-8" y={20 - 70 * (1 - P(f, c("hipotermia"), 30))} width="16" height={70 * (1 - P(f, c("hipotermia"), 30)) + 30} rx="8" fill={C.celeste} />
        <circle cy="60" r="28" fill={C.celeste} stroke={C.claro} strokeWidth="4" />
      </g>
      <Cifra x={790} y={420} valor={`${cuenta(f, c("tiendas") - 4, 150)} MIL`} rotulo="TIENDAS BLOQUEADAS" k={P(f, c("tiendas") - 8, 12, outBack)} size={86} />
      <Cifra x={790} y={600} valor={`${cuenta(f, c("mantas") - 10, 500)} MIL`} rotulo="MANTAS BLOQUEADAS" k={P(f, c("mantas") - 14, 12, outBack)} size={86} />
    </Lienzo>
  );
};

/* ---------- 6. SpaceX: vuelo 15 de Starship, doble captura ---------- */
export const Starship: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const baja1 = P(f, c("cohete") - 20, 34, inOut);
  const baja2 = P(f, c("nave") - 10, 30, inOut);
  const brazos = P(f, c("cohete") + 12, 10);
  const TX = 360;
  return (
    <Lienzo>
      <g transform={`translate(540 110) scale(${pop(f, c("spacex") - 4)})`} opacity={fade(f, c("spacex") - 4)}>
        <image href={staticFile(FOTOS + "spacex.png")} x="-230" y="-28" width="460" height="57" />
      </g>
      {/* torre de lanzamiento */}
      <g opacity={fade(f, 8)}>
        <rect x={TX - 30} y="230" width="60" height="520" fill="none" stroke={C.suave} strokeWidth="5" />
        {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M${TX - 30} ${240 + i * 50} L${TX + 30} ${280 + i * 50}`} stroke={C.suave} strokeWidth="3" opacity="0.7" />)}
        {/* brazos «chopsticks» */}
        <path d={`M${TX + 30} 360 L${TX + 30 + lerp(150, 92, brazos)} ${360 - lerp(30, 0, brazos)}`} stroke={C.claro} strokeWidth="10" strokeLinecap="round" />
        <path d={`M${TX + 30} 380 L${TX + 30 + lerp(150, 92, brazos)} ${380 + lerp(30, 0, brazos)}`} stroke={C.claro} strokeWidth="10" strokeLinecap="round" />
      </g>
      {/* propulsor Super Heavy */}
      <g transform={`translate(${TX + 120} ${lerp(-300, 420, baja1)})`} opacity={fade(f, c("cohete") - 20)}>
        <rect x="-30" y="-60" width="60" height="320" rx="10" fill={C.grisClaro} stroke={C.marinoOsc} strokeWidth="3" />
        {[0, 1, 2].map((i) => <rect key={i} x="-30" y={-40 + i * 90} width="60" height="6" fill="#9AA7B8" />)}
        <path d={`M-20 260 Q0 ${300 + 30 * (1 - baja1) + Math.sin(f) * 6} 20 260 Z`} fill="#F2B544" opacity={1 - baja1 * 0.9} />
      </g>
      {/* nave Starship */}
      <g transform={`translate(780 ${lerp(-280, 470, baja2)})`} opacity={fade(f, c("nave") - 10)}>
        <path d="M-28 -110 Q0 -150 28 -110 V130 H-28 Z" fill={C.grisClaro} stroke={C.marinoOsc} strokeWidth="3" />
        <path d="M-28 -80 L-46 -50 L-28 -50 Z M28 -80 L46 -50 L28 -50 Z M-28 100 L-50 140 L-28 130 Z M28 100 L50 140 L28 130 Z" fill="#9AA7B8" />
        <path d={`M-16 130 Q0 ${170 + Math.sin(f) * 6} 16 130 Z`} fill="#F2B544" opacity={1 - baja2 * 0.9} />
      </g>
      <Chip x={780} y={230} texto={`VUELO ${cuenta(f, c("vuelo") - 4, 15, 10)}`} k={pop(f, c("vuelo") - 4)} size={28} />
      {/* satélites Starlink */}
      {Array.from({ length: 26 }).map((_, i) => {
        const k = pop(f, c("sat") - 6 + i, 10);
        const col = i % 13, fila = Math.floor(i / 13);
        return <rect key={i} x={110 + col * 66} y={700 + fila * 30} width="40" height="12" rx="3" fill={C.celeste} opacity={Math.min(1, k * 1.5) * 0.9} transform={`rotate(-8 ${130 + col * 66} ${706 + fila * 30})`} />;
      })}
    </Lienzo>
  );
};

export const VIZ_INTERNACIONAL_4: Record<string, React.FC<VizProps>> = {
  golfo: Golfo,
  uranio: UranioOIEA,
  microsoft: CaidaMicrosoft,
  rubioasfura: RubioAsfura,
  gazafrio: GazaFrio,
  starship: Starship,
};
