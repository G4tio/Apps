import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { EEUU } from "./banderas";
import { EscudoCanada } from "./nacional2";
import mapa from "./mapa-guatemala.json";

// Ilustraciones de la edición nacional del 13 nov 2026.
const FOTOS = "fotos/2026-11-13/";
const MAPA = mapa as unknown as { w: number; h: number; deps: Record<string, string>; centros: Record<string, [number, number]> };
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

/** Mapa de Guatemala por departamentos (Natural Earth, simplificado) con uno resaltado. */
export const MapaGuatemala: React.FC<{ resaltar?: string; on: number; f: number; idp: string }> = ({ resaltar, on, f, idp }) => (
  <g>
    {Object.entries(MAPA.deps).map(([n, d]) => {
      const es = n === resaltar;
      return (
        <path key={n} d={d} fill={es ? `rgba(229,72,77,${0.25 + 0.6 * on})` : "#1A4778"} stroke={es && on > 0 ? "#FFB3B5" : C.claro}
          strokeOpacity={es && on > 0 ? 1 : 0.55} strokeWidth={es && on > 0 ? 3 : 1.4} strokeLinejoin="round" />
      );
    })}
    {resaltar && on > 0 && (() => {
      const [cx, cy] = MAPA.centros[resaltar];
      const u = (f % 36) / 36;
      return (
        <g transform={`translate(${cx} ${cy})`} key={idp}>
          <circle r={14 + u * 60} fill="none" stroke="#E5484D" strokeWidth="5" opacity={(1 - u) * on} />
          <circle r="12" fill="#E5484D" opacity={on} />
        </g>
      );
    })()}
  </g>
);

/* ---------- 1. Masacre en Zacapa ---------- */
export const MasacreZacapa: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const m = P(f, 4, 18, outBack);
  const on = P(f, c("zacapa") - 4, 12);
  const lado = P(f, c("muertos") - 10, 18, inOut); // el mapa se hace a un lado para mostrar las cifras
  const s = lerp(0.95, 0.62, lado);
  const x = lerp(540 - (MAPA.w * 0.95) / 2, 30, lado);
  const y = lerp(80, 200, lado);
  return (
    <Lienzo>
      <g transform={`translate(${x} ${y}) scale(${s * m})`} opacity={Math.min(1, m * 1.5)}>
        <MapaGuatemala resaltar="Zacapa" on={on} f={f} idp="zac" />
        <g transform={`translate(${MAPA.centros.Zacapa[0] + 40} ${MAPA.centros.Zacapa[1] - 60})`} opacity={on * (1 - lado)}>
          <text fontFamily={F.mono} fontWeight={800} fontSize="34" fill={C.blanco} letterSpacing="2">ZACAPA</text>
          <text y="36" fontFamily={F.mono} fontWeight={700} fontSize="24" fill={C.suave} letterSpacing="1.5">ALDEA LA MAJADA</text>
        </g>
      </g>
      <Cifra x={760} y={260} valor={`${cuenta(f, c("muertos") - 2, 5, 14)}`} rotulo="MUERTOS" k={P(f, c("muertos") - 6, 12, outBack)} size={130} />
      <Cifra x={760} y={460} valor={`${cuenta(f, c("heridas") - 6, 3, 12)}`} rotulo="MUJERES HERIDAS" k={P(f, c("heridas") - 10, 12, outBack)} size={100} />
      <Chip x={760} y={570} texto="1 SECUESTRADO" k={pop(f, c("secuestro") - 2)} color="#F2B544" />
      <Chip x={760} y={660} texto="PNC ATACADA" k={pop(f, c("patrulla") + 2)} color="#FF8A8D" />
    </Lienzo>
  );
};

/* ---------- 2. Remesas récord (motion graphics) ---------- */
export const Remesas: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const arco = (u: number): [number, number] => [lerp(180, 900, u), 270 - 160 * Math.sin(Math.PI * u)];
  const flujo = fade(f, c("remesas") - 4);
  const mes = P(f, c("mes") - 4, 30, outCubic);
  const anio = P(f, c("anio") - 4, 30, outCubic);
  return (
    <Lienzo>
      <path d={`M180 270 Q540 -50 900 270`} fill="none" stroke={C.suave} strokeOpacity="0.5" strokeWidth="4" strokeDasharray="10 12" opacity={flujo} />
      {[["EE. UU.", 180], ["GUATEMALA", 900]].map(([t, x]) => (
        <g key={t as string} transform={`translate(${x} 300)`} opacity={flujo}>
          <circle cy="-30" r="14" fill={C.celeste} />
          <text y="20" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.blanco} letterSpacing="2">{t}</text>
        </g>
      ))}
      {/* billetes que viajan */}
      {Array.from({ length: 7 }).map((_, i) => {
        const u = (((f - c("remesas")) / 50 + i / 7) % 1 + 1) % 1;
        if (f < c("remesas")) return null;
        const [bx, by] = arco(u);
        return (
          <g key={i} transform={`translate(${bx} ${by - 30}) rotate(${Math.sin(f / 6 + i) * 12})`} opacity={flujo * Math.min(1, u * 6, (1 - u) * 6)}>
            <rect x="-34" y="-18" width="68" height="36" rx="5" fill="#5CCB9B" stroke="#2F8F65" strokeWidth="3" />
            <text y="9" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="24" fill="#1F5A3F">$</text>
          </g>
        );
      })}
      <g transform={`translate(540 380) scale(${pop(f, c("record") - 4)})`} opacity={fade(f, c("record") - 4)}>
        <rect x="-120" y="-30" width="240" height="60" rx="30" fill="#F2B544" />
        <text y="11" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="32" fill={C.marino}>¡RÉCORD!</text>
      </g>
      <Cifra x={540} y={520} valor={`US$${(2469 * mes).toLocaleString("en-US", { maximumFractionDigits: 0 })} M`} rotulo="OCTUBRE 2026" k={P(f, c("mes") - 8, 12, outBack)} size={104} />
      <Cifra x={360} y={700} valor={`US$${(22485 * anio).toLocaleString("en-US", { maximumFractionDigits: 0 })} M`} rotulo="ENERO A OCTUBRE" k={P(f, c("anio") - 8, 12, outBack)} size={64} />
      <Chip x={800} y={680} texto="+5.3 %" k={pop(f, c("pct") - 4)} color="#5CCB9B" size={34} />
    </Lienzo>
  );
};

/* ---------- 3. Presupuesto 2027: plazo en el Congreso ---------- */
export const Presupuesto: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const cal = pop(f, c("fecha") - 6);
  const dict = pop(f, c("dictamen") - 2);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "congreso.png"} id="cong13" x={240} y={40} w={600} h={400} k={k} opacity={Math.min(1, k * 2)} fadeBottom fadeLeft />
      {/* calendario con la fecha límite */}
      <g transform={`translate(260 600) scale(${cal})`} opacity={Math.min(1, cal * 1.5)}>
        <rect x="-110" y="-110" width="220" height="220" rx="22" fill={C.grisClaro} />
        <rect x="-110" y="-110" width="220" height="62" rx="22" fill="#E5484D" />
        <rect x="-110" y="-70" width="220" height="22" fill="#E5484D" />
        <text y="-66" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="30" fill="#FFFFFF" letterSpacing="3">NOV</text>
        <text y="60" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="110" fill={C.marino}>{f < c("dictamen") ? "30" : "24"}</text>
      </g>
      <Chip x={260} y={760} texto={f < c("dictamen") ? "PLAZO LÍMITE" : "DICTAMEN"} k={Math.max(cal * 0.999, dict)} size={24} />
      <Cifra x={760} y={600} valor="Q192 MIL M" rotulo="PRESUPUESTO 2027" k={P(f, c("monto") - 8, 12, outBack)} size={82} />
    </Lienzo>
  );
};

/* ---------- 4. Fondo Nacional de Becas (motion graphics) ---------- */
export const Becas: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const birrete = pop(f, c("ley") - 6, 16);
  const votos = cuenta(f, c("votos") - 10, 138, 30);
  // hemiciclo de 160 curules; se encienden 138
  const curules: [number, number][] = [];
  [5, 6, 7, 8].forEach((fila, fi) => {
    const r = 120 + fi * 40;
    const n = [28, 36, 44, 52][fi];
    for (let i = 0; i < n; i++) {
      const a = Math.PI - (i / (n - 1)) * Math.PI;
      curules.push([Math.cos(a) * r, -Math.sin(a) * r]);
    }
    void fila;
  });
  const orden = curules.map((p, i) => ({ p, i, a: Math.atan2(-p[1], p[0]) })).sort((x, y) => y.a - x.a);
  return (
    <Lienzo>
      {/* birrete y diploma */}
      <g transform={`translate(540 190) scale(${birrete}) rotate(${Math.sin(f / 10) * 3})`} opacity={Math.min(1, birrete * 1.5)}>
        <path d="M-150 0 L0 -64 L150 0 L0 64 Z" fill={C.marinoOsc} stroke={C.claro} strokeWidth="5" />
        <path d="M-90 26 V86 Q0 130 90 86 V26" fill="#12345E" stroke={C.claro} strokeWidth="5" />
        <path d="M120 12 V92" stroke="#F2B544" strokeWidth="6" />
        <circle cx="120" cy="100" r="12" fill="#F2B544" />
      </g>
      <Chip x={540} y={380} texto="DECRETO 28-2026" k={pop(f, c("decreto") - 4)} />
      <g transform="translate(700 720)" opacity={fade(f, c("votos") - 14)}>
        {orden.map(({ p, i }, j) => (
          <circle key={i} cx={p[0] * 0.95} cy={p[1] * 0.95} r="6.5" fill={j < votos * (orden.length / 160) ? C.celeste : "rgba(127,184,230,0.22)"} />
        ))}
      </g>
      <Cifra x={240} y={640} valor={`${votos}`} rotulo="VOTOS A FAVOR" k={P(f, c("votos") - 14, 12, outBack)} size={130} />
    </Lienzo>
  );
};

/* ---------- 5. Pedro Cabrera, nominado a embajador de EE. UU. ---------- */
export const Cabrera: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const sen = pop(f, c("senado") - 6);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "cabrera.png"} id="cabrera" x={40} y={180} w={460} h={552} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      <g transform={`translate(770 150) scale(${pop(f, c("casa") - 4)}) translate(-95 -50)`} opacity={fade(f, c("casa") - 4)}><EEUU id="us13" w={190} /></g>
      <Chip x={770} y={290} texto="EMBAJADOR NOMINADO" k={pop(f, c("embajador") - 2)} size={24} />
      <Chip x={770} y={370} texto="DORAL, FLORIDA" k={pop(f, c("doral") - 4)} size={24} />
      {/* cúpula del Capitolio: falta el Senado */}
      <g transform={`translate(770 600) scale(${sen})`} opacity={Math.min(1, sen * 1.5)}>
        <path d="M-120 60 H120 V40 H-120 Z M-100 40 V0 H100 V40 M-80 0 Q-80 -90 0 -96 Q80 -90 80 0 M0 -96 V-130" fill="none" stroke={C.claro} strokeWidth="7" strokeLinejoin="round" />
        {[-60, -20, 20, 60].map((x) => <line key={x} x1={x} x2={x} y1="0" y2="40" stroke={C.claro} strokeWidth="6" />)}
        <circle cx="96" cy="-70" r="34" fill="#F2B544" />
        <text x="96" y="-58" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="38" fill={C.marino}>?</text>
      </g>
    </Lienzo>
  );
};

/* ---------- 6. Hoy: Guatemala vs. Canadá (logos de las selecciones) ---------- */
export const PartidoHoy: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const gt = pop(f, c("seleccion") - 4, 14);
  const ca = pop(f, c("canada") - 4, 14);
  const vs = pop(f, c("canada") + 6);
  const conos = c("transito");
  return (
    <Lienzo>
      <g transform={`translate(270 210) scale(${gt})`} opacity={Math.min(1, gt * 1.5)}>
        <image href={staticFile(FOTOS + "fedefut.png")} x="-165" y="-110" width="330" height="220" style={{ clipPath: "inset(0 round 24px)" }} filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
      </g>
      <g transform={`translate(810 210) scale(${ca})`} opacity={Math.min(1, ca * 1.5)}><EscudoCanada /></g>
      <text x="540" y="236" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontStyle="italic" fontSize="80" fill={C.celeste} opacity={vs} transform={`translate(540 210) scale(${vs}) translate(-540 -210)`}>VS</text>
      <Cifra x={540} y={500} valor="20:00" rotulo="HOY · ESTADIO EL TRÉBOL" k={P(f, c("hora") - 8, 12, outBack)} size={110} />
      {/* conos de tránsito */}
      {[380, 540, 700].map((x, i) => {
        const k = pop(f, conos - 4 + i * 4);
        return (
          <g key={x} transform={`translate(${x} 700) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
            <path d="M-34 40 L-12 -50 H12 L34 40 Z" fill="#F28C28" />
            <path d="M-22 -2 H22 L26 14 H-26 Z M-14 -34 H14 L17 -20 H-17 Z" fill="#FFFFFF" />
            <rect x="-46" y="40" width="92" height="12" rx="3" fill="#C2410C" />
          </g>
        );
      })}
    </Lienzo>
  );
};

export const VIZ_NACIONAL_3: Record<string, React.FC<VizProps>> = {
  zacapa: MasacreZacapa,
  remesas: Remesas,
  presupuesto: Presupuesto,
  becas: Becas,
  cabrera: Cabrera,
  partidohoy: PartidoHoy,
};
