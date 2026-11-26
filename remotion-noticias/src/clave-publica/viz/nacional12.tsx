import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, fade, pop, type VizProps } from "./internacional";
import { Canada } from "./banderas";
import { MAPA } from "./nacional3";
import { BanderaGT } from "./nacional7";

// Ilustraciones de la edición nacional del 26 nov 2026.
const FOTOS = "fotos/2026-11-26/";
const cuenta = (f: number, at: number, hasta: number, d = 22) =>
  Math.round(interpolate(f, [at, at + d], [0, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));
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
const Logo: React.FC<{ src: string; x: number; y: number; w: number; h: number; ar: number; k: number }> = ({ src, x, y, w, h, ar, k }) => {
  const lw = Math.min(w, h * ar), lh = lw / ar;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <image href={staticFile(src)} x={-lw / 2} y={-lh / 2} width={lw} height={lh} style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.45))" }} />
    </g>
  );
};
const LogoCard: React.FC<{ src: string; x: number; y: number; w: number; h: number; k: number; pad?: number }> = ({ src, x, y, w, h, k, pad = 14 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <rect x={-w / 2 - pad} y={-h / 2 - pad} width={w + pad * 2} height={h + pad * 2} rx="22" fill="#FFFFFF" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
    <image href={staticFile(src)} x={-w / 2} y={-h / 2} width={w} height={h} />
  </g>
);
/** Foto en tarjeta redondeada (38 px) con borde celeste fino, sombra suave, zoom lento y nombre opcional. */
const FotoCard: React.FC<{ src: string; id: string; x: number; y: number; w: number; h: number; k: number; f: number; nombre?: string; align?: string; r?: number }> = ({ src, id, x, y, w, h, k, f, nombre, align = "xMidYMid", r = 38 }) => {
  const z = 1 + Math.min(0.06, Math.max(0, f) * 0.0004);
  return (
    <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${k}) translate(${-w / 2} ${-h / 2})`} opacity={Math.min(1, k * 1.5)}>
      <defs><clipPath id={`fc-${id}`}><rect width={w} height={h} rx={r} /></clipPath></defs>
      <rect width={w} height={h} rx={r} fill="#0B1220" filter="drop-shadow(0 14px 26px rgba(0,0,0,0.45))" />
      <g style={{ clipPath: `url(#fc-${id})` }}>
        <image href={staticFile(src)} width={w} height={h} preserveAspectRatio={`${align} slice`} transform={`translate(${w / 2} ${h / 2}) scale(${z}) translate(${-w / 2} ${-h / 2})`} />
        {nombre && <rect y={h - 56} width={w} height={56} fill="rgba(4,18,42,0.82)" />}
      </g>
      <rect width={w} height={h} rx={r} fill="none" stroke={C.celeste} strokeOpacity="0.8" strokeWidth="3" />
      {nombre && <text x={w / 2} y={h - 19} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize={Math.min(24, (w - 30) / (nombre.length * 0.62))} fill={C.blanco} letterSpacing="1.5">{nombre}</text>}
    </g>
  );
};
const Sello: React.FC<{ k: number; texto: string; size?: number }> = ({ k, texto, size = 30 }) => {
  const w = texto.length * size * 0.7 + 40;
  return (
    <g transform={`rotate(-10) scale(${0.6 + 0.4 * k})`} opacity={k}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.8} rx="10" fill="rgba(11,18,32,0.78)" stroke={ROJO} strokeWidth="5" />
      <text y={size * 0.35} textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize={size} fill={ROJO} letterSpacing="2">{texto}</text>
    </g>
  );
};

/* ---------- 1. Arévalo vetará el Presupuesto 2027 ---------- */
export const VetoPresupuesto: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const kf = pop(f, 4, 16);
  const veto = P(f, c("veto") - 2, 12, outBack);
  const barras = P(f, c("millones") - 8, 26, inOut);
  const recortes: [string, string][] = [["SALUD", "recortes"], ["EDUCACIÓN", "recortes"], ["COMUNICACIONES", "recortes"]];
  return (
    <Lienzo>
      <FotoCard src={FOTOS + "arevalo.jpg"} id="arev" x={30} y={20} w={560} h={340} k={kf} f={f} nombre="BERNARDO ARÉVALO" align="xMaxYMid" />
      {/* decreto con sello */}
      <g transform={`translate(830 190) scale(${pop(f, c("veto") - 10)})`}>
        <rect x="-150" y="-170" width="300" height="340" rx="14" fill={C.grisClaro} filter="drop-shadow(0 12px 22px rgba(0,0,0,0.45))" />
        <text y="-120" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.marino} letterSpacing="2">DECRETO 32-2026</text>
        <text y="-88" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="18" fill={C.grisOsc}>PRESUPUESTO 2027</text>
        {[-40, -10, 20, 50, 80, 110].map((y, i) => <rect key={y} x="-110" y={y} width={i % 2 ? 180 : 220} height="12" rx="6" fill="#CBD5E1" />)}
        <g transform="translate(0 0)"><Sello k={veto} texto="VETO" size={60} /></g>
      </g>
      {/* comparación: lo que pidió el Ejecutivo vs. lo aprobado */}
      <g opacity={fade(f, c("votos") - 6)}>
        <text x="40" y="430" fontFamily={F.mono} fontWeight={800} fontSize="20" fill={C.suave} letterSpacing="2">PEDIDO POR EL EJECUTIVO</text>
        <rect x="40" y="445" width={420 * barras} height="44" rx="10" fill={C.suave} />
        <text x={50 + 420 * barras} y="478" fontFamily={F.exo} fontWeight={900} fontSize="30" fill={C.blanco} opacity={barras}>Q192 MIL M</text>
        <text x="40" y="540" fontFamily={F.mono} fontWeight={800} fontSize="20" fill={C.suave} letterSpacing="2">APROBADO · {cuenta(f, c("votos") - 6, 117, 16)} VOTOS</text>
        <rect x="40" y="555" width={377 * barras} height="44" rx="10" fill={C.celeste} />
        <text x={50 + 377 * barras} y="588" fontFamily={F.exo} fontWeight={900} fontSize="30" fill={C.blanco} opacity={barras}>Q172 MIL M</text>
        <g transform="translate(600 650)" opacity={P(f, c("menos") - 6, 10)}>
          <text textAnchor="end" fontFamily={F.exo} fontWeight={900} fontSize="34" fill={ROJO}>−Q20 MIL MILLONES</text>
        </g>
      </g>
      {/* recortes */}
      {recortes.map(([t], i) => {
        const k = P(f, c("recortes") - 4 + i * 5, 12, outBack);
        return (
          <g key={t} transform={`translate(${lerp(1120, 840, k)} ${470 + i * 80})`} opacity={Math.min(1, k * 1.5)}>
            <rect x="-180" y="-32" width="360" height="64" rx="32" fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="2.5" />
            <path d="M-140 -14 v28 m-12 -12 l12 12 l12 -12" stroke={ROJO} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x="10" y="9" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.blanco} letterSpacing="1.5">{t}</text>
          </g>
        );
      })}
      <Chip x={540} y={745} texto="+ FONDOS A CODEDES" k={pop(f, c("codedes") - 6)} color={AMARILLO} size={26} />
    </Lienzo>
  );
};

/* ---------- 2. MP desarticula «Limpieza Humana» en Petén ---------- */
export const LimpiezaHumana: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const on = P(f, c("peten") - 10, 14);
  const S = 1.35;
  const [px, py] = MAPA.centros["Petén"];
  // 30 puntos de allanamiento dentro de Petén (distribución fija)
  const puntos = Array.from({ length: 30 }).map((_, i) => [px - 110 + ((i * 73) % 220), py - 100 + ((i * 47) % 190)] as [number, number]);
  return (
    <Lienzo>
      <defs><clipPath id="clippet"><rect x="20" y="40" width="560" height="740" rx="24" /></clipPath></defs>
      <rect x="20" y="40" width="560" height="740" rx="24" fill="rgba(4,18,42,0.6)" stroke={C.suave} strokeWidth="2" opacity={fade(f, 4)} />
      <g style={{ clipPath: "url(#clippet)" }} opacity={fade(f, 4)}>
        <g transform={`translate(${300 - px * S} ${330 - py * S}) scale(${S})`}>
          {Object.entries(MAPA.deps).map(([n, d]) => {
            const es = n === "Petén";
            return <path key={n} d={d} fill={es ? `rgba(229,72,77,${0.2 + 0.45 * on})` : "#1A4778"} stroke={es && on > 0 ? "#FFB3B5" : C.claro} strokeOpacity={es && on > 0 ? 1 : 0.55} strokeWidth={es && on > 0 ? 2.5 : 1.2} strokeLinejoin="round" />;
          })}
          {puntos.map(([x, y], i) => {
            const k = pop(f, c("allanamientos") - 8 + i * 0.7, 8);
            const u = ((f + i * 5) % 30) / 30;
            return (
              <g key={i} transform={`translate(${x} ${y})`} opacity={Math.min(1, k * 1.5)}>
                <circle r={4 + u * 10} fill="none" stroke={ROJO} strokeWidth="1.5" opacity={1 - u} />
                <circle r={4 * k} fill={AMARILLO} />
              </g>
            );
          })}
        </g>
        <text x="300" y="90" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.blanco} letterSpacing="4" opacity={on}>PETÉN</text>
      </g>
      <LogoCard src={FOTOS + "logo-mp.png"} x={830} y={80} w={170} h={106} k={pop(f, c("mp") - 8)} pad={12} />
      <Cifra x={830} y={290} valor={`${cuenta(f, c("allanamientos") - 6, 30, 16)}`} rotulo="ALLANAMIENTOS" k={P(f, c("allanamientos") - 8, 12, outBack)} size={110} />
      <Cifra x={830} y={460} valor={`${cuenta(f, c("capturo") - 6, 15, 14)}`} rotulo="CAPTURADOS" k={P(f, c("capturo") - 8, 12, outBack)} size={110} />
      <Logo src={FOTOS + "pnc.png"} x={700} y={590} w={70} h={80} ar={319 / 364} k={pop(f, c("pnc") - 6)} />
      <text x="750" y="584" fontFamily={F.mono} fontWeight={800} fontSize="20" fill={C.blanco} letterSpacing="1" opacity={fade(f, c("pnc") - 2)}>AGENTES ENTRE</text>
      <text x="750" y="610" fontFamily={F.mono} fontWeight={800} fontSize="20" fill={C.blanco} letterSpacing="1" opacity={fade(f, c("pnc") - 2)}>LOS DETENIDOS</text>
      <Chip x={830} y={720} texto="+40 ATAQUES" k={pop(f, c("cuarenta") - 6)} color={ROJO} size={26} />
    </Lienzo>
  );
};

/* ---------- 3. Canadá mantiene sanciones contra Porras, Curruchiche, Monterroso y Bremer ---------- */
const SANCIONADOS: [string, string, string, string][] = [
  ["porras", "porras.jpg", "CONSUELO PORRAS", "xMidYMid"],
  ["curruchiche", "curruchiche.jpg", "RAFAEL CURRUCHICHE", "xMaxYMid"],
  ["monterroso", "monterroso.jpg", "CINTHIA MONTERROSO", "xMidYMin"],
  ["bremer", "bremer.jpg", "JIMI BREMER", "xMidYMin"],
];
export const SancionesCanada: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  return (
    <Lienzo>
      <g transform={`translate(540 75) scale(${pop(f, c("canada") - 6)}) translate(-100 -50)`}><Canada id="sc-ca" w={200} /></g>
      {SANCIONADOS.map(([cue, src, nombre, align], i) => {
        const col = i % 2, fila = Math.floor(i / 2);
        const x = 50 + col * 520, y = 165 + fila * 255;
        const k = pop(f, c(cue) - 8, 14);
        const s = P(f, c(cue) + 6, 10, outBack);
        return (
          <g key={cue}>
            <FotoCard src={FOTOS + src} id={`sc-${cue}`} x={x} y={y} w={460} h={230} k={k} f={f} nombre={nombre} align={align} r={30} />
            <g transform={`translate(${x + 385} ${y + 32})`}><Sello k={s} texto="SANCIONADO" size={15} /></g>
          </g>
        );
      })}
      <Chip x={300} y={745} texto="BIENES CONGELADOS" k={pop(f, c("bienes") - 6)} color={AMARILLO} size={21} />
      <Chip x={790} y={745} texto="SIN ENTRADA A CANADÁ" k={pop(f, c("prohibicion") - 6)} color={ROJO} size={21} />
    </Lienzo>
  );
};

/* ---------- 4. Primer préstamo del Banco Europeo de Inversiones ---------- */
const Banco: React.FC = () => (
  <g>
    <path d="M-150 -40 L0 -110 L150 -40 Z" fill="#1F3A5C" stroke={C.claro} strokeWidth="5" strokeLinejoin="round" />
    <rect x="-140" y="-40" width="280" height="16" fill={C.claro} />
    {[-105, -52, 0, 52, 105].map((x) => <rect key={x} x={x - 12} y="-24" width="24" height="100" fill={C.claro} />)}
    <rect x="-160" y="76" width="320" height="22" rx="4" fill={C.claro} />
    <text y="-58" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="30" fill={C.blanco}>BEI</text>
  </g>
);
export const PrestamoBEI: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const ku = pop(f, c("ue") - 8, 14);
  return (
    <Lienzo>
      <g transform={`translate(230 170) scale(${ku})`} opacity={Math.min(1, ku * 1.5)}>
        <image href={staticFile(FOTOS + "bandera-ue.png")} x="-150" y="-100" width="300" height="200" style={{ filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))" }} />
        <rect x="-150" y="-100" width="300" height="200" rx="4" fill="none" stroke={C.claro} strokeOpacity="0.7" strokeWidth="2" />
        <text y="140" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.blanco} letterSpacing="2">UNIÓN EUROPEA</text>
      </g>
      <g transform={`translate(850 170) scale(${pop(f, c("finanzas") - 6)})`}>
        <g transform="translate(-130 -81)"><BanderaGT w={260} /></g>
        <text y="140" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.blanco} letterSpacing="2">GUATEMALA</text>
      </g>
      {/* flujo de euros */}
      <path d="M390 170 Q540 60 690 170" fill="none" stroke={C.suave} strokeWidth="4" strokeDasharray="10 12" opacity={fade(f, c("bei") - 6)} />
      {Array.from({ length: 4 }).map((_, i) => {
        const u = ((f - c("bei") + i * 12) % 48) / 48;
        if (f < c("bei") - 4) return null;
        const x = lerp(390, 690, u), y = 170 - 220 * u * (1 - u) * 2;
        return (
          <g key={i} transform={`translate(${x} ${y})`} opacity={Math.sin(Math.PI * u)}>
            <circle r="24" fill={AMARILLO} stroke="#FFF0C2" strokeWidth="3" />
            <text y="10" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="28" fill="#8A5A00">€</text>
          </g>
        );
      })}
      <g transform={`translate(540 500) scale(${pop(f, c("bei") - 4, 14)})`}><Banco /></g>
      <Chip x={540} y={650} texto="PRIMER PRÉSTAMO" k={pop(f, c("bei") + 6)} color={AMARILLO} size={26} />
      <Chip x={540} y={740} texto="SE PRESENTARÍA EN 2027" k={pop(f, c("anio") - 8)} size={22} />
    </Lienzo>
  );
};

/* ---------- 5. Alejandro Cabeza deja Municipal ---------- */
export const CabezaMunicipal: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const kf = pop(f, 4, 16);
  const stats: [string, number, string][] = [["meses", 10, "MESES"], ["partidos", 23, "PARTIDOS"], ["goles", 4, "GOLES"]];
  return (
    <Lienzo>
      <FotoCard src={FOTOS + "cabeza.jpg"} id="cabeza" x={30} y={40} w={580} h={440} k={kf} f={f} nombre="ALEJANDRO CABEZA" align="xMidYMin" />
      <Logo src={FOTOS + "logo-municipal.png"} x={850} y={170} w={200} h={230} ar={735 / 1036} k={pop(f, c("municipal") - 8)} />
      {/* flecha de salida */}
      <g transform={`translate(${lerp(640, 700, P(f, c("municipal"), 20, inOut))} 260)`} opacity={fade(f, c("municipal"))}>
        <path d="M0 0 H-40 M-28 -12 L-40 0 L-28 12" stroke={AMARILLO} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {stats.map(([cue, n, t], i) => {
        const k = P(f, c(cue) - 8, 12, outBack);
        return (
          <g key={cue} transform={`translate(${190 + i * 330} 640) scale(${0.6 + 0.4 * k})`} opacity={Math.min(1, k * 1.5)}>
            <rect x="-140" y="-90" width="280" height="180" rx="26" fill="rgba(14,44,82,0.94)" stroke={cue === "goles" ? ROJO : C.suave} strokeWidth="3" />
            <text y="20" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="96" fill={cue === "goles" ? ROJO : C.claro}>{cuenta(f, c(cue) - 6, n, 14)}</text>
            <text y="66" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.suave} letterSpacing="2">{t}</text>
          </g>
        );
      })}
    </Lienzo>
  );
};

export const VIZ_NACIONAL_12: Record<string, React.FC<VizProps>> = {
  vetopresupuesto: VetoPresupuesto,
  limpiezahumana: LimpiezaHumana,
  sancionescanada: SancionesCanada,
  prestamobei: PrestamoBEI,
  cabezamunicipal: CabezaMunicipal,
};
