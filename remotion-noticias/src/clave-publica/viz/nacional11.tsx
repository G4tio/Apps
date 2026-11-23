import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { MAPA } from "./nacional3";
import mapaCA from "./mapa-centroamerica.json";

// Ilustraciones de la edición nacional del 23 nov 2026.
const FOTOS = "fotos/2026-11-23/";
const CA = mapaCA as unknown as { w: number; h: number; lon: [number, number]; lat: [number, number]; paises: Record<string, string> };
const cuenta = (f: number, at: number, hasta: number, d = 22) =>
  Math.round(interpolate(f, [at, at + d], [0, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));
const fase = (f: number, a: number, b: number) => Math.min(P(f, a, 10), 1 - P(f, b, 10));
const ROJO = "#E5484D";
const AMARILLO = "#F2B544";
const MORADO = "#8B5CF6";
const FRIO = "#7DD3FC";

const Chip: React.FC<{ x: number; y: number; texto: string; k: number; color?: string; size?: number }> = ({ x, y, texto, k, color = C.blanco, size = 26 }) => {
  const w = texto.length * size * 0.66 + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-size - 4} width={w} height={size * 2 + 8} rx={size + 4} fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="2.5" />
      <text y={size * 0.36} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize={size} fill={color} letterSpacing="1.5">{texto}</text>
    </g>
  );
};
/** Logo sin fondo, centrado en (x,y) dentro de una caja w×h sin deformar. */
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
/** Departamentos de Guatemala; `col(n)` devuelve [relleno, borde] o null para el color base. */
const Deps: React.FC<{ col: (n: string) => [string, string] | null }> = ({ col }) => (
  <g>
    {Object.entries(MAPA.deps).map(([n, d]) => {
      const cc = col(n);
      return <path key={n} d={d} fill={cc ? cc[0] : "#1A4778"} stroke={cc ? cc[1] : C.claro} strokeOpacity={cc ? 1 : 0.55} strokeWidth={cc ? 2.5 : 1.2} strokeLinejoin="round" />;
    })}
  </g>
);
const Pin: React.FC<{ k: number; color?: string; r?: number }> = ({ k, color = ROJO, r = 14 }) => (
  <g transform={`scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <path d={`M0 0 C${-r} ${-r * 1.4} ${-r} ${-r * 2.6} 0 ${-r * 2.6} C${r} ${-r * 2.6} ${r} ${-r * 1.4} 0 0 Z`} fill={color} stroke="#FFFFFF" strokeWidth={r / 6} />
    <circle cy={-r * 1.75} r={r * 0.38} fill="#FFFFFF" />
  </g>
);

/* ---------- 1. Fin de semana violento: 16 muertos (mapa del país y luego del departamento) ---------- */
const PUNTOS_PAIS: [string, number][] = [["Guatemala", 0], ["Retalhuleu", 1], ["Suchitepéquez", 2], ["Zacapa", 3], ["Petén", 4], ["Izabal", 5]];
// lugares del departamento de Guatemala (coordenadas del mapa; ubicación aproximada)
const PUNTOS_DEPTO: [string, number, number, string][] = [
  ["ZONA 9", 256, 503, "DISCOTECA"], ["ZONA 3", 250, 494, ""], ["ZONA 18", 270, 487, ""], ["CHINAUTLA", 259, 472, ""], ["S. P. AYAMPUC", 283, 466, ""],
];
export const FinSemanaViolento: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const zoom = P(f, c("diez") - 10, 34, inOut);
  // vista país → vista departamento de Guatemala
  const S = lerp(0.92, 6.2, zoom);
  const cx = lerp(300, 262, zoom), cy = lerp(316, 494, zoom);
  const tx = 300 - cx * S, ty = 430 - cy * S;
  const on = P(f, c("violento") - 4, 14);
  return (
    <Lienzo>
      <defs><clipPath id="clipviol"><rect x="20" y="90" width="580" height="690" rx="24" /></clipPath></defs>
      <rect x="20" y="90" width="580" height="690" rx="24" fill="rgba(4,18,42,0.6)" stroke={C.suave} strokeWidth="2" opacity={fade(f, 4)} />
      <g style={{ clipPath: "url(#clipviol)" }} opacity={fade(f, 4)}>
        <g transform={`translate(${tx} ${ty}) scale(${S})`}>
          <Deps col={(n) => (n === "Guatemala" ? [`rgba(229,72,77,${0.25 + 0.55 * Math.max(on * 0.5, zoom)})`, "#FFB3B5"] : PUNTOS_PAIS.some(([d]) => d === n) && zoom < 0.5 ? [`rgba(229,72,77,${0.25 * on})`, C.claro] : null)} />
        </g>
        {/* pines del país */}
        {PUNTOS_PAIS.map(([d, i]) => {
          const [x, y] = MAPA.centros[d];
          const k = pop(f, c("bomberos") - 2 + i * 4) * (1 - zoom);
          return <g key={d} transform={`translate(${tx + x * S} ${ty + y * S})`}><Pin k={k} /></g>;
        })}
        {/* pines del departamento */}
        {PUNTOS_DEPTO.map(([t, x, y, extra], i) => {
          const k = pop(f, c("diez") + 20 + i * 4);
          const z9 = extra !== "";
          return (
            <g key={t} transform={`translate(${tx + x * S} ${ty + y * S})`}>
              <Pin k={k} color={z9 ? ROJO : "#C9363B"} r={z9 ? 18 : 13} />
              <text x="20" y={-16} fontFamily={F.mono} fontWeight={800} fontSize={z9 ? 22 : 17} fill={C.blanco} letterSpacing="1" opacity={k}>{t}</text>
              {z9 && <text x="20" y={8} fontFamily={F.mono} fontWeight={800} fontSize="17" fill={AMARILLO} letterSpacing="1" opacity={P(f, c("discoteca") - 4, 10)}>{extra}</text>}
            </g>
          );
        })}
        <text x="310" y="140" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.blanco} letterSpacing="3" opacity={fade(f, c("diez") + 10)}>DEPARTAMENTO DE GUATEMALA</text>
      </g>
      {/* cifras */}
      <Cifra x={850} y={250} valor={`${cuenta(f, c("dieciseis") - 6, 16, 18)}`} rotulo="MUERTOS" k={P(f, c("dieciseis") - 8, 12, outBack)} size={150} />
      <Chip x={850} y={360} texto="VIERNES A DOMINGO" k={pop(f, c("dieciseis") + 4)} size={20} />
      <g transform={`translate(850 470) scale(${pop(f, c("fuego") - 10)})`}>
        <text textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="64" fill={ROJO}>15</text>
        <text y="36" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="2">POR ARMA DE FUEGO</text>
      </g>
      <g transform={`translate(850 640) scale(${pop(f, c("diez") - 4)})`}>
        <text textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="92" fill={C.claro}>10</text>
        <text y="40" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="2">EN EL DEPARTAMENTO</text>
      </g>
    </Lienzo>
  );
};

/* ---------- 2. Turba ataca a policías en San Pedro Soloma ---------- */
const SOLOMA: [number, number] = [118, 322];
const Subestacion: React.FC = () => (
  <g>
    <rect x="-120" y="-70" width="240" height="140" rx="8" fill="#1F3A5C" stroke={C.claro} strokeWidth="4" />
    <rect x="-130" y="-92" width="260" height="30" rx="6" fill="#123B6B" stroke={C.claro} strokeWidth="3" />
    <text y="-70" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="20" fill={C.blanco} letterSpacing="2">PNC</text>
    {[-80, 40].map((x) => <rect key={x} x={x} y="-40" width="40" height="34" rx="4" fill={C.marinoOsc} />)}
    <rect x="-22" y="10" width="44" height="60" rx="4" fill={C.marinoOsc} />
  </g>
);
const Llama: React.FC<{ f: number; s?: number }> = ({ f, s = 1 }) => {
  const a = Math.sin(f / 3) * 6, b = Math.cos(f / 4) * 5;
  return (
    <g transform={`scale(${s})`}>
      <path d={`M0 0 C-30 -10 -26 ${-50 + a} -4 ${-86 + b} C2 ${-60 + a} 20 -56 14 ${-36 + b} C30 -40 34 -14 0 0 Z`} fill="#F97316" />
      <path d={`M0 -2 C-14 -8 -12 ${-30 + b} 0 ${-50 + a} C6 -32 18 -28 0 -2 Z`} fill={AMARILLO} />
    </g>
  );
};
const Moto: React.FC = () => (
  <g fill="none" stroke={C.claro} strokeWidth="6" strokeLinecap="round">
    <circle cx="-34" cy="14" r="16" /><circle cx="34" cy="14" r="16" />
    <path d="M-34 14 L-6 -10 H18 L34 14 M-6 -10 L-14 -22 M18 -10 L24 -24" />
  </g>
);
const Auto: React.FC = () => (
  <g>
    <path d="M-60 10 V-6 L-38 -26 H30 L52 -6 V10 Z" fill="#334155" stroke={C.claro} strokeWidth="4" />
    <circle cx="-34" cy="14" r="12" fill="#0B1220" stroke={C.suave} strokeWidth="3" /><circle cx="30" cy="14" r="12" fill="#0B1220" stroke={C.suave} strokeWidth="3" />
  </g>
);
export const TurbaSoloma: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const mapa = 1 - P(f, c("quinientas") - 12, 12);
  const escena = P(f, c("quinientas") - 6, 12);
  const on = P(f, c("huehue") - 6, 14);
  const S = 2.3;
  return (
    <Lienzo>
      <Logo src={FOTOS + "pnc.png"} x={110} y={95} w={150} h={170} ar={319 / 364} k={pop(f, 4)} />
      {/* Fase A: mapa de Huehuetenango con Soloma */}
      <g opacity={mapa}>
        <defs><clipPath id="cliphue"><rect x="240" y="30" width="800" height="540" rx="24" /></clipPath></defs>
        <rect x="240" y="30" width="800" height="540" rx="24" fill="rgba(4,18,42,0.6)" stroke={C.suave} strokeWidth="2" />
        <g style={{ clipPath: "url(#cliphue)" }}>
          <g transform={`translate(${640 - 104 * S} ${300 - 340 * S}) scale(${S})`}>
            <Deps col={(n) => (n === "Huehuetenango" ? [`rgba(229,72,77,${0.2 + 0.5 * on})`, "#FFB3B5"] : null)} />
          </g>
          <g transform={`translate(${640 + (SOLOMA[0] - 104) * S} ${300 + (SOLOMA[1] - 340) * S})`}>
            <circle r={20 + ((f % 36) / 36) * 60} fill="none" stroke={ROJO} strokeWidth="5" opacity={(1 - (f % 36) / 36) * fade(f, c("soloma"))} />
            <Pin k={pop(f, c("soloma") - 4)} r={18} />
            <text x="26" y="-22" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.blanco} letterSpacing="2" opacity={fade(f, c("soloma"))}>SAN PEDRO SOLOMA</text>
          </g>
        </g>
        <text x="640" y="610" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.blanco} letterSpacing="3" opacity={on}>HUEHUETENANGO</text>
      </g>
      {/* Fase B: la turba frente a la subestación */}
      <g opacity={escena}>
        <g transform="translate(560 250)"><Subestacion /></g>
        {Array.from({ length: 22 }).map((_, i) => {
          const fila = Math.floor(i / 11), col = i % 11;
          const k = pop(f, c("quinientas") - 4 + i * 0.8, 10);
          const x = 290 + col * 56 + fila * 28, y = 420 + fila * 40;
          const sac = Math.sin(f / 4 + i) * 4;
          return (
            <g key={i} transform={`translate(${x} ${y + sac}) scale(${k * (1 - fila * 0.1)})`} opacity={Math.min(1, k * 1.5)}>
              <circle cy="-24" r="12" fill={fila ? C.suave : C.claro} />
              <path d="M-19 14 a19 21 0 0 1 38 0 z" fill={fila ? C.suave : C.claro} />
              {i % 4 === 0 && <line x1="12" y1="-6" x2={22} y2={-44 + sac} stroke={C.claro} strokeWidth="5" strokeLinecap="round" />}
            </g>
          );
        })}
        <Cifra x={190} y={300} valor={`${cuenta(f, c("quinientas") - 4, 500, 18)}`} rotulo="PERSONAS" k={P(f, c("quinientas") - 6, 12, outBack)} size={86} />
        {/* vehículos quemados */}
        <g transform={`translate(820 590) scale(${pop(f, c("quemo") - 6)})`}>
          <Moto /><g transform="translate(0 0)"><Llama f={f} s={0.9} /></g>
        </g>
        <g transform={`translate(960 590) scale(${pop(f, c("quemo"))})`}>
          <Auto /><g transform="translate(0 -14)"><Llama f={f + 7} /></g>
        </g>
        <Chip x={300} y={610} texto="2 CAPTURADOS" k={pop(f, c("capturados") - 6)} color={AMARILLO} size={26} />
        <Chip x={540} y={720} texto="CALMA RESTABLECIDA" k={pop(f, c("calma") - 6)} color={C.menta} size={24} />
      </g>
    </Lienzo>
  );
};

/* ---------- 3. Presupuesto 2027 fuera de la agenda (Congreso + billetes) ---------- */
const Billete: React.FC<{ w?: number }> = ({ w = 150 }) => {
  const h = w * 0.46;
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="8" fill="#4E9A76" stroke="#B9F5D8" strokeWidth="3" />
      <rect x={-w / 2 + 8} y={-h / 2 + 8} width={w - 16} height={h - 16} rx="5" fill="none" stroke="#B9F5D8" strokeWidth="1.5" opacity="0.7" />
      <circle r={h * 0.28} fill="#3B7F60" stroke="#B9F5D8" strokeWidth="2" />
      <text y={h * 0.12} textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize={h * 0.34} fill="#E7FFF3">Q</text>
    </g>
  );
};
export const PresupuestoAgenda: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = pop(f, 4, 16);
  const sello = P(f, c("agenda") - 2, 12, outBack);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "congreso.png"} id="congreso23" x={20} y={20} w={600} h={400} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      {/* sello sobre la agenda */}
      <g transform={`translate(830 150) rotate(-10) scale(${0.6 + 0.4 * sello})`} opacity={sello}>
        <rect x="-190" y="-64" width="380" height="128" rx="14" fill="rgba(11,18,32,0.8)" stroke={ROJO} strokeWidth="6" />
        <text y="-8" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="44" fill={ROJO}>FUERA DE</text>
        <text y="42" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="44" fill={ROJO}>AGENDA</text>
      </g>
      <Chip x={830} y={320} texto="SIN DICTAMEN" k={pop(f, c("dictamen") - 8)} color={AMARILLO} size={26} />
      {/* billetes cayendo y apilándose */}
      {Array.from({ length: 14 }).map((_, i) => {
        const at = c("millones") - 10 + i * 2;
        const t = P(f, at, 18, outCubic);
        const col = i % 4, fila = Math.floor(i / 4);
        const x = 130 + col * 120 + (fila % 2) * 30;
        const y = lerp(380, 700 - fila * 34, t);
        return t > 0 ? <g key={i} transform={`translate(${x} ${y}) rotate(${lerp((i % 2 ? 1 : -1) * 40, (i % 3) * 4 - 4, t)})`} opacity={Math.min(1, t * 3)}><Billete w={140} /></g> : null;
      })}
      <Cifra x={830} y={520} valor={`Q${cuenta(f, c("millones") - 6, 192, 20)} MIL`} rotulo="MILLONES" k={P(f, c("millones") - 8, 12, outBack)} size={92} />
      {/* fecha límite */}
      <g transform={`translate(830 690) scale(${pop(f, c("treinta") - 8)})`}>
        <rect x="-150" y="-50" width="300" height="100" rx="18" fill={C.grisClaro} />
        <rect x="-150" y="-50" width="110" height="100" rx="18" fill={ROJO} />
        <rect x="-60" y="-50" width="20" height="100" fill={ROJO} />
        <text x="-95" y="-6" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.blanco}>NOV</text>
        <text x="-95" y="34" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="44" fill={C.blanco}>30</text>
        <text x="50" y="-4" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.marino}>FECHA</text>
        <text x="50" y="26" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.marino}>LÍMITE</text>
      </g>
    </Lienzo>
  );
};

/* ---------- 4. Línea Morada 120 ---------- */
const Telefono: React.FC<{ f: number; num: number; anillo: number }> = ({ f, num, anillo }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const u = ((f + i * 12) % 36) / 36;
      return <circle key={i} r={150 + u * 90} fill="none" stroke={MORADO} strokeWidth="5" opacity={(1 - u) * 0.6 * anillo} />;
    })}
    <rect x="-110" y="-200" width="220" height="400" rx="34" fill="#1F2937" stroke={C.claro} strokeWidth="6" />
    <rect x="-94" y="-170" width="188" height="320" rx="14" fill="#2E1065" />
    <rect x="-30" y="-188" width="60" height="8" rx="4" fill={C.suave} />
    <circle cy="176" r="12" fill="none" stroke={C.suave} strokeWidth="3" />
    <text y="-90" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="20" fill="#DDD6FE" letterSpacing="2">LLAMANDO…</text>
    <text y="10" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="90" fill={C.blanco}>{num > 0 ? num : ""}</text>
    <circle cy="100" r="30" fill="#22C55E" />
    <path d="M-12 92 q4 -10 10 -4 l4 6 q2 4 -2 6 q4 8 12 12 q2 -4 6 -2 l6 4 q6 6 -4 10 q-26 -4 -32 -32z" fill="#FFFFFF" transform="translate(-4 -6)" />
  </g>
);
export const LineaMorada: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const n = f < c("numero") - 4 ? 0 : cuenta(f, c("numero") - 4, 120, 14);
  const items: [string, string, string][] = [["gratuita", "GRATIS", C.menta], ["horas", "24 HORAS", C.blanco], ["saldo", "SIN SALDO", C.blanco], ["interpretes", "CON INTÉRPRETES", AMARILLO]];
  return (
    <Lienzo>
      <LogoCard src={FOTOS + "logo-mingob.png"} x={250} y={70} w={260} h={102} k={pop(f, c("mingob") - 8)} pad={12} />
      <Logo src={FOTOS + "pnc.png"} x={520} y={70} w={100} h={120} ar={319 / 364} k={pop(f, c("mingob") - 2)} />
      <g transform={`translate(300 460) scale(${pop(f, c("linea") - 8, 14)})`}><Telefono f={f} num={n} anillo={fade(f, c("numero"))} /></g>
      <g transform={`translate(800 160) scale(${pop(f, c("linea") - 2)})`}>
        <rect x="-200" y="-56" width="400" height="112" rx="56" fill={MORADO} stroke="#DDD6FE" strokeWidth="4" />
        <text y="18" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="50" fill={C.blanco}>LÍNEA MORADA</text>
      </g>
      {items.map(([cue, t, col], i) => {
        const k = P(f, c(cue) - 6, 12, outBack);
        return (
          <g key={cue} transform={`translate(${lerp(1100, 800, k)} ${310 + i * 110})`} opacity={Math.min(1, k * 1.5)}>
            <rect x="-200" y="-40" width="400" height="80" rx="40" fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="2.5" />
            <circle cx="-158" r="22" fill={MORADO} />
            <path d="M-168 0 l7 8 l14 -16" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x="20" y="10" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={col} letterSpacing="1.5">{t}</text>
          </g>
        );
      })}
    </Lienzo>
  );
};

/* ---------- 5. Primer frente frío (Centroamérica y el Caribe → Guatemala) ---------- */
const lonlat = (lon: number, lat: number): [number, number] => [((lon - CA.lon[0]) / (CA.lon[1] - CA.lon[0])) * CA.w, ((CA.lat[1] - lat) / (CA.lat[1] - CA.lat[0])) * CA.h];
const REGIONES = ["Petén", "Alta Verapaz", "Baja Verapaz", "Izabal"];
const ALTIPLANO = ["Huehuetenango", "San Marcos", "Quezaltenango", "Totonicapán", "Sololá", "Quiché", "Chimaltenango"];
export const FrenteFrio: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const a = 1 - P(f, c("peten") - 14, 12);
  const b = P(f, c("peten") - 8, 12);
  const avance = P(f, 10, Math.max(40, c("miercoles") - 4), inOut);
  const SC = 1.04;
  // frente frío: línea de lon -97 a -78 que baja desde el golfo hasta Yucatán/Guatemala
  const desplaza = lerp(-120, 150, avance);
  const frente = Array.from({ length: 9 }).map((_, i) => {
    const [x, y] = lonlat(-96 + i * 2.4, 25.5 - i * 0.55);
    return [x, y + desplaza] as [number, number];
  });
  const dFrente = "M" + frente.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
  const [gx, gy] = lonlat(-90.3, 15.6);
  return (
    <Lienzo>
      <LogoCard src={FOTOS + "insivumeh.png"} x={110} y={90} w={120} h={120} k={pop(f, c("insivumeh") - 8)} pad={10} />
      {/* Fase A: mapa regional con el frente */}
      <g opacity={a}>
        <defs><clipPath id="clipca"><rect x="10" y="200" width="1060" height={CA.h * SC} rx="24" /></clipPath></defs>
        <rect x="10" y="200" width="1060" height={CA.h * SC} rx="24" fill="rgba(4,18,42,0.6)" stroke={C.suave} strokeWidth="2" opacity={fade(f, 4)} />
        <g style={{ clipPath: "url(#clipca)" }} opacity={fade(f, 4)}>
          <g transform={`translate(10 200) scale(${SC})`}>
            {Object.entries(CA.paises).map(([n, d]) => (
              <path key={n} d={d} fill={n === "Guatemala" ? "rgba(31,182,255,0.75)" : "#1A4778"} stroke={n === "Guatemala" ? C.blanco : C.claro} strokeOpacity={n === "Guatemala" ? 1 : 0.5} strokeWidth={n === "Guatemala" ? 2.5 : 1} strokeLinejoin="round" />
            ))}
            {/* frente frío */}
            <path d={dFrente} fill="none" stroke={FRIO} strokeWidth="6" strokeLinejoin="round" />
            {frente.slice(0, -1).map(([x, y], i) => {
              const [x2, y2] = frente[i + 1];
              const mx = (x + x2) / 2, my = (y + y2) / 2;
              const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
              return <path key={i} d="M-12 0 L12 0 L0 18 Z" fill={FRIO} transform={`translate(${mx} ${my}) rotate(${ang})`} />;
            })}
            {/* viento frío */}
            {Array.from({ length: 6 }).map((_, i) => {
              const u = ((f * 1.4 + i * 30) % 120) / 120;
              const [x0, y0] = lonlat(-95 + i * 3, 26);
              return <path key={i} d={`M${x0 + u * 60} ${y0 + desplaza - 60 + u * 120} l18 24 m0 0 l-22 2 m22 -2 l2 -22`} stroke={FRIO} strokeWidth="4" fill="none" strokeLinecap="round" opacity={(1 - u) * 0.8} />;
            })}
            <text x={gx - 10} y={gy + 70} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.blanco} letterSpacing="2">GUATEMALA</text>
          </g>
        </g>
        <Chip x={760} y={130} texto="PRIMER FRENTE FRÍO" k={pop(f, c("frente") - 4)} color={FRIO} size={26} />
      </g>
      {/* Fase B: Guatemala, regiones con lluvia y altiplano frío */}
      <g opacity={b}>
        <defs><clipPath id="clipgtf"><rect x="20" y="200" width="560" height="580" rx="24" /></clipPath></defs>
        <rect x="20" y="200" width="560" height="580" rx="24" fill="rgba(4,18,42,0.6)" stroke={C.suave} strokeWidth="2" />
        <g style={{ clipPath: "url(#clipgtf)" }}>
          <g transform="translate(40 215) scale(0.88)">
            <Deps col={(n) => {
              const r = REGIONES.indexOf(n);
              if (r >= 0) { const k = P(f, c("peten") - 4 + r * 5, 10); return k > 0 ? [`rgba(31,182,255,${0.2 + 0.55 * k})`, C.blanco] : null; }
              if (ALTIPLANO.includes(n)) { const k = P(f, c("minimas") - 2, 12); return k > 0 ? [`rgba(125,211,252,${0.15 + 0.3 * k})`, FRIO] : null; }
              return null;
            }} />
            {/* lluvia sobre el norte */}
            {Array.from({ length: 26 }).map((_, i) => {
              const x = 160 + ((i * 53) % 420), y0 = 30 + ((i * 37) % 300);
              const u = ((f * 2 + i * 13) % 40) / 40;
              return <line key={i} x1={x} y1={y0 + u * 40} x2={x - 5} y2={y0 + u * 40 + 14} stroke={C.claro} strokeWidth="3" strokeLinecap="round" opacity={0.7 * P(f, c("peten"), 12)} />;
            })}
          </g>
        </g>
        <g transform={`translate(820 380) scale(${pop(f, c("minimas") - 8)})`}>
          <rect x="-24" y="-150" width="48" height="230" rx="24" fill={C.grisClaro} />
          <circle cy="100" r="42" fill={FRIO} />
          <rect x="-11" y={lerp(-120, 0, P(f, c("minimas"), 30, inOut))} width="22" height={lerp(220, 100, P(f, c("minimas"), 30, inOut))} rx="11" fill={FRIO} />
        </g>
        <text x="820" y="540" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="64" fill={C.claro} opacity={fade(f, c("minimas"))}>3 a 5 °C</text>
        <text x="820" y="576" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="2" opacity={fade(f, c("altiplano") - 4)}>MÍNIMAS EN EL ALTIPLANO</text>
        <Chip x={820} y={690} texto="16 FRENTES EN LA TEMPORADA" k={pop(f, c("dieciseis") - 6)} color={FRIO} size={19} />
        <Chip x={700} y={110} texto="LLUVIAS: PETÉN, VERAPACES, CARIBE" k={pop(f, c("caribe") - 4)} size={18} />
      </g>
    </Lienzo>
  );
};

/* ---------- 6. Municipal 0-0 Antigua ---------- */
const Tarjeta: React.FC<{ k: number }> = ({ k }) => (
  <g transform={`scale(${k}) rotate(${(1 - k) * 30})`} opacity={Math.min(1, k * 1.5)}>
    <rect x="-26" y="-38" width="52" height="76" rx="6" fill={ROJO} stroke="#FFB3B5" strokeWidth="3" />
  </g>
);
export const MunicipalAntigua: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const m = pop(f, 6, 14);
  const pts = cuenta(f, c("cuarenta") - 6, 40, 18);
  return (
    <Lienzo>
      <g transform={`translate(540 190) scale(${m})`} opacity={Math.min(1, m * 1.5)}>
        <rect x="-490" y="-150" width="980" height="300" rx="30" fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="3" />
        <text x="-300" y="125" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.blanco} letterSpacing="2">MUNICIPAL</text>
        <text x="300" y="125" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.blanco} letterSpacing="2">ANTIGUA</text>
        <text x="-80" y="40" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="130" fill={C.blanco}>0</text>
        <text y="28" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="70" fill={C.suave}>–</text>
        <text x="80" y="40" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="130" fill={C.blanco}>0</text>
      </g>
      <Logo src={FOTOS + "logo-municipal.png"} x={240} y={170} w={190} h={190} ar={735 / 1037} k={pop(f, c("municipal") - 6)} />
      <Logo src={FOTOS + "logo-antigua.png"} x={840} y={170} w={190} h={190} ar={500 / 637} k={pop(f, c("municipal") + 2)} />
      {/* expulsados */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${380 + i * 90} 470)`}><Tarjeta k={pop(f, c("expulsados") - 10 + i * 5)} /></g>
      ))}
      <Chip x={470} y={575} texto="3 EXPULSADOS" k={pop(f, c("expulsados") + 2)} color={ROJO} size={24} />
      {/* líder */}
      <g transform={`translate(840 520) scale(${pop(f, c("antigua") - 6)})`}>
        <path d="M-50 -70 H50 V-30 Q50 20 0 30 Q-50 20 -50 -30 Z" fill={AMARILLO} stroke="#FFF0C2" strokeWidth="4" />
        <path d="M-50 -60 Q-90 -60 -80 -30 Q-70 -6 -46 -10 M50 -60 Q90 -60 80 -30 Q70 -6 46 -10" fill="none" stroke={AMARILLO} strokeWidth="8" />
        <rect x="-14" y="28" width="28" height="30" fill={AMARILLO} />
        <rect x="-44" y="58" width="88" height="18" rx="4" fill={AMARILLO} />
        <text y="130" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="60" fill={C.blanco}>{pts} PTS</text>
        <text y="165" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="2">ANTIGUA, LÍDER</text>
      </g>
      <Chip x={470} y={700} texto="FALTA UNA FECHA" k={pop(f, c("fecha") - 6)} size={22} />
    </Lienzo>
  );
};

export const VIZ_NACIONAL_11: Record<string, React.FC<VizProps>> = {
  finsemanaviolento: FinSemanaViolento,
  turbasoloma: TurbaSoloma,
  presupuestoagenda: PresupuestoAgenda,
  lineamorada: LineaMorada,
  frentefrio: FrenteFrio,
  municipalantigua: MunicipalAntigua,
};
