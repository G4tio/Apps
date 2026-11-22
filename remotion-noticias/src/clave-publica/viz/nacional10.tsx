import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, fade, pop, type VizProps } from "./internacional";
import { MAPA, MapaGuatemala } from "./nacional3";

// Ilustraciones de la edición nacional del 21 nov 2026.
const FOTOS = "fotos/2026-11-21/";
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
/** Logo sin fondo dentro de una caja w×h, centrado y sin deformar (proporción del archivo). */
const Logo: React.FC<{ src: string; x: number; y: number; w: number; h: number; ar: number; k: number }> = ({ src, x, y, w, h, ar, k }) => {
  const lw = Math.min(w, h * ar), lh = lw / ar;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <image href={staticFile(src)} x={-lw / 2} y={-lh / 2} width={lw} height={lh} style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.45))" }} />
    </g>
  );
};

/* ---------- 1. Ataque armado en discoteca de la zona 9 (motion graphics) ---------- */
const Patrulla: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x="-70" y="-24" width="140" height="44" rx="12" fill={C.grisClaro} />
    <path d="M-38 -24 L-24 -48 H28 L40 -24 Z" fill="#1F3A5F" />
    <rect x="-70" y="-6" width="140" height="10" fill="#1F3A5F" />
    <rect x="-22" y="-58" width="20" height="10" rx="3" fill={f % 10 < 5 ? ROJO : "#5B1E22"} />
    <rect x="2" y="-58" width="20" height="10" rx="3" fill={f % 10 < 5 ? "#1E3A8A" : C.celeste} />
    <circle cx="-40" cy="22" r="14" fill="#1F2937" /><circle cx="40" cy="22" r="14" fill="#1F2937" />
  </g>
);
const Pin: React.FC<{ texto: string; color: string }> = ({ texto, color }) => (
  <g>
    <path d="M0 0 C-30 -34 -30 -70 0 -70 C30 -70 30 -34 0 0Z" fill={color} />
    <circle cy="-46" r="11" fill="#FFFFFF" />
    <text y="40" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.blanco} letterSpacing="2">{texto}</text>
  </g>
);
const Arma: React.FC<{ tipo: "fusil" | "pistola" | "granada" }> = ({ tipo }) => (
  <g fill="#C9D2DC">
    {tipo === "fusil" && (<g><rect x="-110" y="-10" width="190" height="20" rx="4" /><rect x="70" y="-6" width="60" height="10" rx="3" /><path d="M-110 -10 L-150 -4 L-150 22 L-110 14 Z" /><rect x="-20" y="8" width="18" height="40" rx="4" transform="rotate(12 -11 8)" /><rect x="14" y="8" width="14" height="30" rx="3" /></g>)}
    {tipo === "pistola" && (<g><rect x="-46" y="-22" width="92" height="24" rx="5" /><path d="M-40 0 H-6 L-14 46 H-44 Z" /><rect x="-8" y="0" width="16" height="14" rx="4" fill="none" stroke="#C9D2DC" strokeWidth="5" /></g>)}
    {tipo === "granada" && (<g><ellipse cy="10" rx="34" ry="40" fill="#5E7A55" /><rect x="-14" y="-40" width="28" height="16" rx="4" /><path d="M14 -34 Q40 -40 34 -10" fill="none" stroke="#C9D2DC" strokeWidth="6" /><circle cx="-12" cy="-44" r="10" fill="none" stroke="#C9D2DC" strokeWidth="5" />{[-10, 10, 30].map((y) => <line key={y} x1="-32" y1={y} x2="32" y2={y} stroke="#4A6243" strokeWidth="4" />)}</g>)}
  </g>
);
const Marcador: React.FC<{ n: number }> = ({ n }) => (
  <g>
    <path d="M-22 18 L0 -22 L22 18 Z" fill={AMARILLO} stroke="#B8862D" strokeWidth="3" strokeLinejoin="round" />
    <text y="12" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="24" fill={C.marino}>{n}</text>
  </g>
);
export const DiscotecaZona9: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const kb = pop(f, 4, 16);
  const s1 = P(f, c("persiguio") - 14, 8); // sale la escena del local
  const f2 = P(f, c("persiguio") - 6, 10, inOut);
  const s2 = P(f, c("fusil") - 16, 8);
  const f3 = P(f, c("fusil") - 8, 10, inOut);
  const ruta = P(f, c("persiguio"), c("dieciocho") - c("persiguio") + 8, inOut);
  return (
    <Lienzo>
      {/* fase 1: el local con cinta policial y la cifra de fallecidos */}
      <g opacity={1 - s1}>
        <g transform={`translate(330 380) scale(${kb})`} opacity={Math.min(1, kb * 1.5)}>
          <rect x="-200" y="-200" width="400" height="330" rx="10" fill="#1A2A44" stroke={C.suave} strokeWidth="3" />
          <rect x="-150" y="-180" width="300" height="70" rx="12" fill="#0B1220" stroke={f % 20 < 12 ? "#C77DFF" : "#5B3A7A"} strokeWidth="6" />
          <text y="-131" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="44" fill={f % 20 < 12 ? "#E3B8FF" : "#7A5A9A"} letterSpacing="8">DISCO</text>
          <rect x="-60" y="-10" width="120" height="140" rx="6" fill="#0B1220" />
          {[-150, 110].map((x) => <rect key={x} x={x} y="-80" width="40" height="60" rx="4" fill="#2E4466" />)}
          {/* cinta policial */}
          <g transform="rotate(-8)">
            <rect x="-240" y="40" width="480" height="34" fill={AMARILLO} />
            <text x="0" y="65" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="20" fill="#1F2937" letterSpacing="3">ESCENA DEL CRIMEN · NO PASAR</text>
          </g>
        </g>
        <Cifra x={790} y={330} valor={`${cuenta(f, c("muertos") - 4, 0, 4, 12)}`} rotulo="FALLECIDOS" k={P(f, c("muertos") - 8, 12, outBack)} size={170} />
        <Chip x={790} y={480} texto="ZONA 9" k={pop(f, c("discoteca") + 4)} size={28} />
      </g>
      {/* fase 2: persecución de la zona 9 a la zona 18 */}
      <g opacity={f2 * (1 - s2)}>
        <g transform="translate(180 300)"><Pin texto="ZONA 9" color={C.suave} /></g>
        <g transform={`translate(880 300) scale(${pop(f, c("dieciocho") - 6)})`}><Pin texto="ZONA 18" color={ROJO} /></g>
        <path d="M180 300 C380 120 660 480 880 300" fill="none" stroke={C.celeste} strokeWidth="8" strokeDasharray={`${ruta} 1`} pathLength={1} strokeLinecap="round" />
        {(() => {
          // la patrulla recorre la misma curva
          const t = ruta;
          const bz = (a: number, b: number, cc: number, d: number) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * cc + t ** 3 * d;
          return <g transform={`translate(${bz(180, 380, 660, 880)} ${bz(300, 120, 480, 300) - 30}) scale(0.7)`} opacity={P(t * 100, 8, 8) * (1 - P(t * 100, 80, 10))}><Patrulla f={f} /></g>;
        })()}
        <Chip x={540} y={560} texto="PRESUNTO SICARIO ABATIDO" k={pop(f, c("sicario") - 4)} color="#FF8A8D" size={24} />
        <Chip x={540} y={660} texto="ADOLESCENTE DE 15 AÑOS DETENIDO" k={pop(f, c("adolescente") - 4)} color={AMARILLO} size={22} />
      </g>
      {/* fase 3: lo decomisado */}
      <g opacity={f3}>
        <rect x="120" y="470" width="840" height="30" rx="8" fill="#5B6676" />
        {([["fusil", 300, 410], ["pistola", 620, 400], ["granada", 840, 395]] as const).map(([t, x, y], i) => {
          const k = pop(f, c(t) - 6, 12);
          return (
            <g key={t}>
              <g transform={`translate(${x} ${y}) scale(${k * 1.3})`} opacity={Math.min(1, k * 1.5)}><Arma tipo={t} /></g>
              <g transform={`translate(${x} ${560}) scale(${k})`} opacity={Math.min(1, k * 1.5)}><Marcador n={i + 1} /></g>
              <text x={x} y="630" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.suave} letterSpacing="2" opacity={fade(f, c(t))}>{t.toUpperCase()}</text>
            </g>
          );
        })}
        <Chip x={540} y={240} texto="DECOMISO" k={f3} size={30} />
      </g>
    </Lienzo>
  );
};

/* ---------- 2. Apagón en la capital, Villa Nueva y San Miguel Petapa (motion graphics) ---------- */
const Torre: React.FC = () => (
  <g stroke={C.claro} strokeWidth="5" fill="none" strokeLinejoin="round">
    <path d="M-40 120 L-10 -100 L10 -100 L40 120" />
    <path d="M-60 -60 H60 M-48 0 H48 M-30 -60 L30 0 M30 -60 L-30 0 M-34 40 L34 40 M-34 40 L20 0 M34 40 L-20 0" />
    <path d="M-60 -60 L-60 -48 M60 -60 L60 -48" />
  </g>
);
export const Apagon: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const apaga = P(f, c("corte") + 4, 14);
  const vuelve = P(f, c("perdida") - 4, 20);
  const luz = 1 - apaga + vuelve * apaga; // 1 = encendido
  const kt = pop(f, c("administrador") - 6, 14);
  const escudo = P(f, c("proteger") - 4, 12, outBack);
  const edificios = [[90, 260, 110], [210, 190, 90], [310, 300, 120], [440, 220, 100], [550, 330, 110], [670, 250, 90]];
  const zonas = [["CAPITAL", "capital"], ["VILLA NUEVA", "villa"], ["SAN MIGUEL PETAPA", "petapa"]] as const;
  return (
    <Lienzo>
      {/* ciudad: las ventanas se apagan */}
      {edificios.map(([x, h, w], i) => (
        <g key={i} opacity={pop(f, 4 + i * 2, 12)}>
          <rect x={x} y={640 - h * 0.6} width={w} height={h * 0.6} fill="#1A2A44" stroke="#2E4466" strokeWidth="2" />
          {Array.from({ length: Math.floor((h * 0.6) / 46) }).map((_, r) => [0, 1].map((cc) => (
            <rect key={`${r}${cc}`} x={x + 18 + cc * (w / 2 - 6)} y={640 - h * 0.6 + 20 + r * 46} width={w / 2 - 30} height="24" rx="3"
              fill={AMARILLO} opacity={0.15 + 0.85 * luz * ((r + cc + i) % 3 === 0 ? 0.6 : 1)} />
          )))}
        </g>
      ))}
      <rect x="60" y="640" width="760" height="8" fill={C.suave} opacity="0.5" />
      {/* foco que se apaga */}
      <g transform="translate(540 120)" opacity={pop(f, c("corte") - 8, 12)}>
        <circle r="70" fill={AMARILLO} opacity={0.18 * luz} />
        <path d="M0 -50 a34 34 0 0 1 22 60 v14 h-44 v-14 a34 34 0 0 1 22 -60z" fill={luz > 0.5 ? AMARILLO : "#5B6676"} />
        <rect x="-18" y="28" width="36" height="14" rx="4" fill={C.claro} />
        {apaga > 0.5 && vuelve < 0.5 && <line x1="-46" y1="-46" x2="46" y2="46" stroke={ROJO} strokeWidth="9" strokeLinecap="round" />}
      </g>
      {/* zonas afectadas */}
      {zonas.map(([t, cue], i) => (
        <Chip key={t} x={250} y={230 + i * 80} texto={t} k={pop(f, c(cue) - 6) * (1 - P(f, c("administrador") - 12, 8))} size={24} />
      ))}
      {/* torre del sistema y escudo de protección */}
      <g transform={`translate(880 500) scale(${kt * 0.9})`} opacity={Math.min(1, kt * 1.5)}><Torre /></g>
      <g transform={`translate(880 270) scale(${escudo})`} opacity={Math.min(1, escudo * 1.5)}>
        <path d="M0 -60 L50 -40 V5 Q50 45 0 66 Q-50 45 -50 5 V-40 Z" fill="#123B6B" stroke={C.menta} strokeWidth="5" />
        <path d="M-20 2 L-5 18 L22 -14" fill="none" stroke={C.menta} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <Chip x={420} y={250} texto="CORTE PEDIDO POR EL AMM" k={pop(f, c("administrador") - 2)} color={AMARILLO} size={24} />
      <Chip x={420} y={350} texto="PARA PROTEGER EL SISTEMA" k={pop(f, c("proteger") - 2)} color={C.menta} size={24} />
    </Lienzo>
  );
};

/* ---------- 3. Tráiler queda atrapado bajo el puente del Periférico (motion graphics) ---------- */
const Trailer: React.FC = () => (
  <g>
    <rect x="-250" y="-150" width="330" height="150" rx="6" fill="#DCE3EA" stroke="#8C98A6" strokeWidth="4" />
    {[-200, -130, -60, 10].map((x) => <line key={x} x1={x} y1="-146" x2={x} y2="-4" stroke="#B7C3CF" strokeWidth="3" />)}
    <path d="M90 -110 H160 Q190 -110 196 -76 L200 0 H90 Z" fill="#C9363B" />
    <rect x="112" y="-98" width="52" height="36" rx="4" fill="#9CC9EC" />
    <rect x="-250" y="0" width="450" height="14" fill="#3A4656" />
    {[-210, -150, 40, 160].map((x) => <circle key={x} cx={x} cy="22" r="22" fill="#1F2937" stroke="#8C98A6" strokeWidth="5" />)}
  </g>
);
export const TrailerPuente: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const kp = pop(f, 4, 16);
  const avance = P(f, c("trailer") - 4, 26, inOut);
  const choque = P(f, c("atrapado") - 6, 6);
  const sacude = choque > 0 && choque < 1 ? Math.sin(f * 2.2) * 6 : 0;
  const grietas = P(f, c("danos") - 6, 12);
  const f2 = P(f, c("altura") - 30, 12, inOut);
  return (
    <Lienzo>
      {/* carretera */}
      <rect x="40" y="600" width="900" height="16" fill="#26303F" />
      <line x1="60" y1="608" x2="930" y2="608" stroke={AMARILLO} strokeWidth="3" strokeDasharray="30 22" />
      {/* columnas del puente, detrás del tráiler */}
      <g opacity={Math.min(1, kp * 1.5)}>{[400, 920].map((x) => <rect key={x} x={x - 26} y="450" width="52" height="150" fill="#4A5462" />)}</g>
      {/* tráiler que avanza y choca (va detrás de la viga del puente) */}
      <g transform={`translate(${lerp(-200, 470, avance)} ${586 + sacude * 0.3}) rotate(${sacude * 0.2})`}><Trailer /></g>
      {/* puente */}
      <g opacity={Math.min(1, kp * 1.5)}>
        <rect x="380" y="380" width="560" height="70" fill="#5B6676" stroke={C.claro} strokeWidth="3" />
        <rect x="380" y="366" width="560" height="14" fill="#7A8696" />
        <g transform="translate(660 320)">
          <rect x="-90" y="-26" width="180" height="40" rx="6" fill="#1E7A46" stroke="#FFFFFF" strokeWidth="3" />
          <text y="2" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill="#FFFFFF" letterSpacing="2">→ USAC</text>
        </g>
        {/* grietas */}
        <g stroke={ROJO} strokeWidth="5" fill="none" strokeLinecap="round" opacity={grietas}>
          <path d="M560 450 l12 -22 l-10 -14 l14 -20" /><path d="M600 450 l-8 -18 l12 -16" /><path d="M640 450 l10 -26" />
        </g>
      </g>
      <g transform="translate(560 440)" opacity={choque * (1 - P(f, c("atrapado") + 20, 10))}>
        {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1="0" y1="0" x2={Math.cos(i) * 50} y2={Math.sin(i) * 50 - 10} stroke={AMARILLO} strokeWidth="6" strokeLinecap="round" />)}
      </g>
      <Chip x={230} y={180} texto="ZONA 12" k={pop(f, c("usac") - 4) * (1 - f2)} size={28} />
      <Chip x={230} y={180} texto="EVALUACIÓN TÉCNICA" k={pop(f, c("evaluacion") - 4) * (1 - f2)} color={AMARILLO} size={20} />
      {/* señal de altura máxima */}
      <g transform={`translate(230 200) scale(${f2})`} opacity={f2}>
        <rect x="-110" y="-70" width="220" height="140" rx="16" fill={AMARILLO} stroke="#1F2937" strokeWidth="6" />
        <path d="M0 -54 l-16 18 h32 z M0 54 l-16 -18 h32 z" fill="#1F2937" />
        <text y="16" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="44" fill="#1F2937">ALTURA</text>
      </g>
    </Lienzo>
  );
};

/* ---------- 4. 35 sismos en 24 horas (motion graphics) ---------- */
export const Sismos35: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const s1 = P(f, c("fuertes") - 14, 8);
  const f2 = P(f, c("fuertes") - 6, 12, inOut);
  const ksis = P(f, 4, 14);
  // sismógrafo que se dibuja
  const pts = Array.from({ length: 120 }, (_, i) => {
    const x = 120 + i * 7;
    const fase = (i + f * 1.2) % 120;
    const pico = Math.exp(-((fase - 60) ** 2) / 60) * 120 + Math.exp(-((fase - 20) ** 2) / 20) * 50;
    return `${x},${460 + Math.sin(i * 1.7 + f * 0.4) * (8 + pico * 0.8) * Math.sin(i * 0.9)}`;
  }).join(" ");
  const [ex, ey] = MAPA.centros["Escuintla"];
  const s = 0.8, ox = 300, oy = 0;
  return (
    <Lienzo>
      <g opacity={1 - s1}>
        <Cifra x={540} y={220} valor={`${cuenta(f, c("sismos") - 6, 0, 35, 24)}`} rotulo="SISMOS EN 24 HORAS" k={P(f, c("sismos") - 10, 12, outBack)} size={180} />
        <g opacity={ksis}>
          <rect x="100" y="340" width="880" height="240" rx="18" fill="rgba(245,248,252,0.06)" stroke={C.suave} strokeOpacity="0.4" strokeWidth="2" />
          <polyline points={pts} fill="none" stroke={C.celeste} strokeWidth="4" strokeLinejoin="round" />
        </g>
      </g>
      {/* mapa: epicentros en el Pacífico frente a Escuintla */}
      <g opacity={f2}>
        <g transform={`translate(${ox} ${oy}) scale(${s})`}><MapaGuatemala on={0} f={f} idp="sis" /></g>
        {[{ m: "4.5", dx: -80, dy: 100, cue: "magnitud" }, { m: "4.0", dx: 90, dy: 125, cue: "pacifico" }].map((e, i) => {
          const x = ox + ex * s + e.dx, y = oy + ey * s + e.dy;
          const k = pop(f, c(e.cue) - 6 + i * 6, 12);
          const u = ((f + i * 15) % 40) / 40;
          return (
            <g key={i} opacity={Math.min(1, k * 1.5)}>
              <circle cx={x} cy={y} r={14 + u * 70} fill="none" stroke={AMARILLO} strokeWidth="5" opacity={1 - u} />
              <circle cx={x} cy={y} r={14 * k} fill={AMARILLO} />
              <text x={x} y={y + 50} textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="40" fill={C.claro}>{e.m}</text>
            </g>
          );
        })}
        <text x={ox + ex * s - 120} y={oy + ey * s + 230} fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.suave} letterSpacing="3" opacity={fade(f, c("pacifico"))}>OCÉANO PACÍFICO</text>
        <Chip x={850} y={160} texto="SIN DAÑOS" k={pop(f, c("danos") - 6)} color={C.menta} size={30} />
      </g>
    </Lienzo>
  );
};

/* ---------- 5. Liga Nacional: ganan Xelajú y Mixco ---------- */
const AR = { xelaju: 487 / 488, suchi: 484 / 468, mixco: 574 / 795, toros: 348 / 400, antigua: 500 / 637 };
const Marcadorf: React.FC<{ y: number; izq: [string, number]; der: [string, number]; gl: number; gv: number; k: number; kg: number }> = ({ y, izq, der, gl, gv, k, kg }) => (
  <g opacity={Math.min(1, k * 1.5)}>
    <rect x="90" y={y - 95} width="900" height="190" rx="30" fill="rgba(14,44,82,0.9)" stroke={C.suave} strokeOpacity="0.5" strokeWidth="2" />
    <Logo src={izq[0]} x={230} y={y} w={170} h={170} ar={izq[1]} k={k} />
    <Logo src={der[0]} x={850} y={y} w={170} h={170} ar={der[1]} k={k} />
    <g transform={`translate(540 ${y + 34}) scale(${0.6 + 0.4 * kg})`} opacity={kg}>
      <text textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="110" fill={C.blanco}>{gl} – {gv}</text>
    </g>
  </g>
);
export const LigaXelajuMixco: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const s1 = P(f, c("puntos") - 14, 8);
  const f2 = P(f, c("puntos") - 6, 12, inOut);
  const tabla = [
    { n: "ANTIGUA", pts: 39, logo: [FOTOS + "logo-antigua.png", AR.antigua] as [string, number] },
    { n: "XELAJÚ", pts: 37, logo: [FOTOS + "logo-xelaju.png", AR.xelaju] as [string, number] },
    { n: "MIXCO", pts: 37, logo: [FOTOS + "logo-mixco.png", AR.mixco] as [string, number] },
  ];
  return (
    <Lienzo>
      <g opacity={1 - s1}>
        <Marcadorf y={150} izq={[FOTOS + "logo-xelaju.png", AR.xelaju]} der={[FOTOS + "logo-suchitepequez.png", AR.suchi]} gl={3} gv={1}
          k={pop(f, c("xelaju") - 8, 14)} kg={P(f, c("suchi") - 4, 12, outBack)} />
        <Chip x={540} y={290} texto="DOBLETE DE YILTON DÍAZ" k={pop(f, c("yilton") - 4)} color={AMARILLO} size={24} />
        <Marcadorf y={470} izq={[FOTOS + "logo-mixco.png", AR.mixco]} der={[FOTOS + "logo-malacateco.png", AR.toros]} gl={2} gv={0}
          k={pop(f, c("mixco") - 8, 14)} kg={P(f, c("malacateco") - 4, 12, outBack)} />
      </g>
      {/* tabla: la pelea por el pase directo */}
      <g opacity={f2}>
        <text x="540" y="70" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.suave} letterSpacing="3">PELEA POR EL PASE DIRECTO</text>
        {tabla.map((t, i) => {
          const y = 170 + i * 150;
          const k = pop(f, c("puntos") - 2 + i * 4, 12);
          const w = (t.pts / 39) * 520 * P(f, c("puntos") + i * 4, 18);
          const lider = i === 0;
          return (
            <g key={t.n} opacity={Math.min(1, k * 1.5)}>
              {t.logo ? <Logo src={t.logo[0]} x={170} y={y} w={110} h={110} ar={t.logo[1]} k={k} />
                : <g transform={`translate(170 ${y})`}><circle r="52" fill="rgba(14,44,82,0.92)" stroke={C.suave} strokeWidth="3" /><text y="14" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="40" fill={C.claro}>A</text></g>}
              <text x="250" y={y - 30} fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.claro} letterSpacing="2">{t.n}{lider ? " · LÍDER" : ""}</text>
              <rect x="250" y={y - 12} width={w} height="44" rx="10" fill={lider ? C.suave : C.celeste} />
              <text x={260 + w} y={y + 24} fontFamily={F.exo} fontWeight={900} fontSize="44" fill={C.blanco} opacity={P(f, c("puntos") + 10 + i * 4, 8)}>{t.pts}</text>
            </g>
          );
        })}
        <Chip x={540} y={650} texto="DOMINGO: MUNICIPAL VS. ANTIGUA" k={pop(f, c("antigua") - 6)} color={AMARILLO} size={24} />
      </g>
    </Lienzo>
  );
};

export const VIZ_NACIONAL_10: Record<string, React.FC<VizProps>> = {
  discotecazona9: DiscotecaZona9,
  apagon: Apagon,
  trailerpuente: TrailerPuente,
  sismos35: Sismos35,
  ligaxelajumixco: LigaXelajuMixco,
};
