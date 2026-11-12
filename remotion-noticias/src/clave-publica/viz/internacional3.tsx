import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { EEUU, Israel, Mexico, Peru, Rusia, Ucrania } from "./banderas";

// Ilustraciones de la edición internacional del 12 nov 2026.
const FOTOS = "fotos/2026-11-12-int/";

const Chip: React.FC<{ x: number; y: number; texto: string; k: number; color?: string; size?: number; fondo?: string }> = ({ x, y, texto, k, color = C.blanco, size = 28, fondo = "rgba(14,44,82,0.94)" }) => {
  const w = texto.length * size * 0.66 + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-size - 4} width={w} height={size * 2 + 8} rx={size + 4} fill={fondo} stroke={C.suave} strokeWidth="2.5" />
      <text y={size * 0.36} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize={size} fill={color} letterSpacing="1.5">{texto}</text>
    </g>
  );
};
const Bandera: React.FC<{ x: number; y: number; k: number; w: number; h: number; children: React.ReactNode }> = ({ x, y, k, w, h, children }) => (
  <g transform={`translate(${x} ${y}) scale(${k}) translate(${-w / 2} ${-h / 2})`} opacity={Math.min(1, k * 1.5)}>{children}</g>
);

/* ---------- 1. Trump amenaza con duplicar aranceles a México ---------- */
export const Aranceles: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const x2 = P(f, c("duplicar") - 6, 12, outBack);
  return (
    <Lienzo>
      <Bandera x={230} y={120} k={pop(f, c("mexico") - 6)} w={220} h={126}><Mexico id="mx" w={220} /></Bandera>
      <Sticker src={FOTOS + "trump.png"} id="trump12" x={420} y={260} w={580} h={454} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      <g transform={`translate(240 400) scale(${0.6 + 0.4 * x2})`} opacity={Math.min(1, x2 * 1.5)}>
        <text textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="170" fill="#F2B544">×2</text>
        <text y="58" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="30" fill={C.suave} letterSpacing="3">ARANCELES</text>
      </g>
      <Chip x={250} y={560} texto="1,500 MIGRANTES" k={pop(f, c("caravana") + 6)} />
      <Chip x={250} y={650} texto="DESDE TAPACHULA" k={pop(f, c("tapachula") - 4)} size={24} />
    </Lienzo>
  );
};

/* ---------- 2. Jensen Huang renuncia a Nvidia ---------- */
export const Nvidia: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const cae = P(f, c("caida") - 10, 30, inOut);
  const pts = Array.from({ length: 24 }).map((_, i) => {
    const u = i / 23;
    const base = 330 + Math.sin(i * 1.3) * 12 - u * 20;
    const y = u < 0.6 ? base : base + (u - 0.6) / 0.4 * 220 * cae;
    return `${600 + u * 360},${y}`;
  });
  return (
    <Lienzo>
      <Sticker src={FOTOS + "huang.png"} id="huang" x={20} y={190} w={490} h={532} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      <g transform={`translate(780 120) scale(${pop(f, c("nvidia") - 6)})`} opacity={fade(f, c("nvidia") - 6)}>
        <rect x="-130" y="-40" width="260" height="80" rx="16" fill="#76B900" />
        <text y="15" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="44" fill="#FFFFFF" letterSpacing="2">NVIDIA</text>
      </g>
      <g opacity={fade(f, c("nvidia"))}>
        <line x1="600" x2="960" y1="600" y2="600" stroke={C.suave} strokeOpacity="0.5" strokeWidth="3" />
        <polyline points={pts.join(" ")} fill="none" stroke={cae > 0.1 ? "#E5484D" : C.celeste} strokeWidth="6" strokeLinejoin="round" />
      </g>
      <Cifra x={780} y={720} valor={`−${Math.round(13 * cae)} %`} rotulo="ACCIONES" k={P(f, c("caida") - 10, 12, outBack)} size={96} />
      <Chip x={780} y={220} texto="KRESS · CEO INTERINA" k={pop(f, c("kress") - 4)} size={22} />
    </Lienzo>
  );
};

/* ---------- 3. Enviados de Trump con Putin en Moscú ---------- */
export const PutinMoscu: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const tropas = pop(f, c("tropas") - 4);
  const avion = P(f, c("zelenski") - 4, 34, inOut);
  return (
    <Lienzo>
      <Bandera x={180} y={130} k={pop(f, c("moscu") - 8)} w={180} h={120}><Rusia id="ru12" w={180} /></Bandera>
      <Bandera x={900} y={130} k={pop(f, c("enviados") + 4)} w={170} h={89}><EEUU id="us12" w={170} /></Bandera>
      <Sticker src={FOTOS + "putin.png"} id="putin" x={210} y={200} w={660} h={562} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      {/* «no» a tropas de paz extranjeras en Ucrania */}
      <g transform={`translate(890 470) scale(${tropas})`} opacity={Math.min(1, tropas * 1.5)}>
        <g transform="translate(-80 -54)"><Ucrania id="ua12" w={160} /></g>
        <circle cx="70" cy="-50" r="34" fill="#E5484D" />
        <path d="M56 -64 L84 -36 M84 -64 L56 -36" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
      </g>
      {/* avión a Dublín */}
      <g opacity={fade(f, c("zelenski") - 4) * (1 - P(f, c("zelenski") + 60, 10))}>
        <g transform={`translate(${lerp(140, 940, avion)} ${300 - 120 * Math.sin(Math.PI * avion)}) rotate(${lerp(-20, 20, avion)})`}>
          <path d="M-34 0 L30 -6 Q42 0 30 6 Z M-6 -2 L-20 -30 L-10 -30 L12 -3 Z M-6 2 L-20 30 L-10 30 L12 3 Z M-30 0 L-40 -14 L-34 -14 L-22 -1 Z" fill={C.claro} transform="scale(1.5)" />
        </g>
      </g>
    </Lienzo>
  );
};

/* ---------- 4. Bombardeo al hospital Nasser en Gaza ---------- */
export const HospitalGaza: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const at = c("hospital");
  const flash = P(f, at, 4) * (1 - P(f, at + 6, 18));
  const shake = f > at && f < at + 16 ? Math.sin(f * 3) * 6 * (1 - (f - at) / 16) : 0;
  return (
    <Lienzo>
      <Bandera x={540} y={110} k={pop(f, c("israel") - 6)} w={200} h={145}><Israel id="isr" w={200} /></Bandera>
      <g transform={`translate(${540 + shake} 600)`} opacity={fade(f, 6)}>
        <rect x="-200" y="-300" width="400" height="300" fill="#12345E" stroke={C.claro} strokeWidth="5" />
        <rect x="-60" y="-360" width="120" height="60" fill="#12345E" stroke={C.claro} strokeWidth="5" />
        <text y="-312" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="46" fill={C.claro}>H</text>
        {Array.from({ length: 3 }).map((_, r) => [-140, -70, 70, 140].map((x) => <rect key={`${r}${x}`} x={x - 22} y={-270 + r * 80} width="44" height="44" rx="4" fill={C.celeste} opacity="0.4" />))}
        <rect x="-36" y="-80" width="72" height="80" fill={C.marinoOsc} stroke={C.claro} strokeWidth="3" />
        {/* impacto */}
        <g transform="translate(150 -250)" opacity={fade(f, at)}>
          <circle r={40 + 90 * flash} fill="#F2B544" opacity={flash * 0.8} />
          {f > at && Array.from({ length: 5 }).map((_, i) => (
            <circle key={i} cx={Math.sin(i * 2) * 30} cy={-((f - at) * 1.5 + i * 18) % 160} r={26 + i * 4} fill="#6B7280" opacity={0.35} />
          ))}
          <path d="M-30 -10 L-8 6 L-20 30 L4 14 L22 34 L18 6 L40 -6 L12 -12 L8 -38 L-8 -14 Z" fill="#1F2937" opacity={fade(f, at + 4)} />
        </g>
      </g>
      <Cifra x={240} y={740} valor={`${Math.round(interpolate(f, [c("muertos"), c("muertos") + 18], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))}`} rotulo="MUERTOS" k={P(f, c("muertos") - 6, 12, outBack)} size={100} />
      <Cifra x={840} y={740} valor={`+${Math.round(interpolate(f, [c("heridos") - 10, c("heridos") + 10], [0, 20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))}`} rotulo="HERIDOS" k={P(f, c("heridos") - 14, 12, outBack)} size={100} />
    </Lienzo>
  );
};

/* ---------- 5. León XIV, vigilia con jóvenes en Perú ---------- */
export const PapaVigilia: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "papa.png"} id="papa12" x={40} y={170} w={560} h={552} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      <Bandera x={800} y={130} k={pop(f, c("peru") - 4)} w={200} h={133}><Peru id="pe12" w={200} /></Bandera>
      <Cifra x={800} y={340} valor="DÍA 2" rotulo="DE VISITA EN PERÚ" k={P(f, c("papa") - 4, 12, outBack)} size={96} />
      {/* velas de la vigilia */}
      {Array.from({ length: 12 }).map((_, i) => {
        const col = i % 4, fila = Math.floor(i / 4);
        const a = pop(f, c("vigilia") + i * 2);
        const x = 680 + col * 80, y = 480 + fila * 90;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${a})`} opacity={Math.min(1, a * 1.5)}>
            <rect x="-9" y="-6" width="18" height="44" rx="3" fill={C.grisClaro} />
            <path d={`M0 -36 Q${10 + Math.sin(f / 3 + i) * 3} -14 0 -6 Q-10 -14 0 -36 Z`} fill="#F2B544" />
            <circle cy="-18" r="20" fill="#F2B544" opacity={0.18 + 0.08 * Math.sin(f / 4 + i)} />
          </g>
        );
      })}
    </Lienzo>
  );
};

/* ---------- 6. OMS: ébola en la República Democrática del Congo ---------- */
const CONGO: [number, number][] = [
  [0.05, 0.55], [0.12, 0.5], [0.18, 0.52], [0.25, 0.45], [0.3, 0.35], [0.38, 0.3], [0.42, 0.15], [0.55, 0.08], [0.7, 0.05],
  [0.85, 0.1], [0.92, 0.2], [0.9, 0.32], [0.95, 0.42], [0.93, 0.55], [0.97, 0.65], [0.92, 0.75], [0.95, 0.85], [0.85, 0.95],
  [0.78, 0.88], [0.72, 0.95], [0.62, 0.85], [0.55, 0.8], [0.45, 0.82], [0.38, 0.7], [0.25, 0.68], [0.18, 0.6], [0.08, 0.62], [0.02, 0.6],
];

export const EbolaCongo: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const mapa = P(f, c("ebola") - 10, 36, outCubic);
  const W0 = 400, H0 = 380, X0 = 540, Y0 = 300;
  const d = "M" + CONGO.map(([x, y]) => `${X0 + x * W0},${Y0 + y * H0}`).join(" L") + " Z";
  const focos: [number, number][] = [[0.82, 0.3], [0.88, 0.45], [0.75, 0.2], [0.85, 0.62]];
  return (
    <Lienzo>
      <g transform={`translate(270 230) scale(${pop(f, c("oms") - 6)})`} opacity={fade(f, c("oms") - 6)}>
        <image href={staticFile(FOTOS + "oms.png")} x="-180" y="-120" width="360" height="240" style={{ clipPath: "inset(0 round 22px)" }} filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
      </g>
      <path d={d} fill={`rgba(31,182,255,${0.18 * mapa})`} stroke={C.claro} strokeWidth="4" strokeLinejoin="round" strokeDasharray="1800" strokeDashoffset={1800 * (1 - mapa)} />
      <text x={X0 + W0 * 0.42} y={Y0 + H0 * 0.55} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="30" fill={C.blanco} letterSpacing="2" opacity={mapa}>RD CONGO</text>
      {focos.map(([x, y], i) => {
        const at = c("ebola") + i * 6;
        const u = (((f - at) / 30) % 1 + 1) % 1;
        return f > at ? (
          <g key={i} transform={`translate(${X0 + x * W0} ${Y0 + y * H0})`}>
            <circle r={10 + u * 40} fill="none" stroke="#E5484D" strokeWidth="4" opacity={1 - u} />
            <circle r="11" fill="#E5484D" />
          </g>
        ) : null;
      })}
      <Cifra x={270} y={560} valor="6 MESES" rotulo="DE BROTE" k={P(f, c("meses") - 8, 12, outBack)} size={96} />
    </Lienzo>
  );
};

export const VIZ_INTERNACIONAL_3: Record<string, React.FC<VizProps>> = {
  aranceles: Aranceles,
  nvidia: Nvidia,
  putinmoscu: PutinMoscu,
  hospitalgaza: HospitalGaza,
  papavigilia: PapaVigilia,
  ebolacongo: EbolaCongo,
};
