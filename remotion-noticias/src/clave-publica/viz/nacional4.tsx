import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { EscudoCanada } from "./nacional2";
import { MAPA, MapaGuatemala } from "./nacional3";

// Ilustraciones de la edición nacional del 14 nov 2026.
const FOTOS = "fotos/2026-11-14/";
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
/** Imagen de escena completa en tarjeta redondeada con borde claro. */
const Tarjeta: React.FC<{ src: string; x: number; y: number; w: number; h: number; k: number; zoom?: number }> = ({ src, x, y, w, h, k, zoom = 1 }) => (
  <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <foreignObject x={-w / 2} y={-h / 2} width={w} height={h}>
      <div style={{ width: w, height: h, borderRadius: 28, overflow: "hidden", border: `3px solid ${C.claro}`, boxSizing: "border-box", boxShadow: "0 14px 30px rgba(0,0,0,0.5)" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
      </div>
    </foreignObject>
  </g>
);

/* ---------- 1. Miguel Ángel Asturias vuelve a Guatemala ---------- */
export const Asturias: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const vuelo = P(f, c("regreso") - 6, 40, inOut);
  const A: [number, number] = [900, 120], B: [number, number] = [640, 330];
  const pos = (u: number): [number, number] => [lerp(A[0], B[0], u), lerp(A[1], B[1], u) - 120 * Math.sin(Math.PI * u)];
  const [px, py] = pos(vuelo);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "asturias.png"} id="asturias" x={10} y={260} w={560} h={458} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      <Chip x={280} y={200} texto="PREMIO NOBEL 1967" k={pop(f, c("nobel") - 4)} color="#F2B544" size={24} />
      <g opacity={fade(f, c("regreso") - 10)}>
        <path d={`M${A[0]} ${A[1]} Q${(A[0] + B[0]) / 2} ${(A[1] + B[1]) / 2 - 240} ${B[0]} ${B[1]}`} fill="none" stroke={C.suave} strokeWidth="4" strokeDasharray="10 12" />
        {[[A, "PARÍS"], [B, "GUATEMALA"]].map(([p, t]) => (
          <g key={t as string} transform={`translate(${(p as number[])[0]} ${(p as number[])[1]})`}>
            <circle r="12" fill={C.celeste} />
            <text y={t === "PARÍS" ? -24 : 44} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.blanco} letterSpacing="2">{t as string}</text>
          </g>
        ))}
        <g transform={`translate(${px} ${py}) rotate(${lerp(200, 150, vuelo)})`}>
          <path d="M-34 0 L30 -6 Q42 0 30 6 Z M-6 -2 L-20 -30 L-10 -30 L12 -3 Z M-6 2 L-20 30 L-10 30 L12 3 Z" fill={C.claro} transform="scale(1.2)" />
        </g>
      </g>
      <Cifra x={790} y={500} valor={`${cuenta(f, c("anios") - 4, 52, 18)} AÑOS`} rotulo="FUERA DEL PAÍS" k={P(f, c("anios") - 8, 12, outBack)} size={92} />
      <Chip x={790} y={600} texto="KAMINALJUYÚ" k={pop(f, c("kaminaljuyu") - 4)} />
      <Chip x={790} y={680} texto="PALACIO NACIONAL" k={pop(f, c("palacio") - 4)} size={24} />
    </Lienzo>
  );
};

/* ---------- 2. Guatemala 2-3 Canadá ---------- */
export const Marcador: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const gt = pop(f, 6, 14);
  const ca = pop(f, 10, 14);
  const m = pop(f, c("marcador") - 4, 14);
  return (
    <Lienzo>
      <g transform={`translate(230 230) scale(${gt * 0.8})`} opacity={Math.min(1, gt * 1.5)}>
        <image href={staticFile(FOTOS + "fedefut.png")} x="-165" y="-110" width="330" height="220" style={{ clipPath: "inset(0 round 24px)" }} filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
      </g>
      <g transform={`translate(850 230) scale(${ca * 0.9})`} opacity={Math.min(1, ca * 1.5)}><EscudoCanada /></g>
      <g transform={`translate(540 270) scale(${m})`} opacity={Math.min(1, m * 1.5)}>
        <text textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="150" fill={C.blanco}>2–3</text>
      </g>
      <Chip x={540} y={390} texto="AL DESCANSO: 0–3" k={pop(f, c("descanso") - 2)} size={24} />
      {[["⚽ SANTIS", c("santis")], ["⚽ EVANS", c("evans")]].map(([t, at], i) => (
        <Chip key={i} x={i ? 760 : 320} y={500} texto={t as string} k={pop(f, (at as number) - 2)} color="#5CCB9B" size={26} />
      ))}
      <Cifra x={540} y={690} valor="+2 GOLES" rotulo="LO QUE NECESITA EN TORONTO" k={P(f, c("necesita") - 6, 12, outBack)} size={96} />
    </Lienzo>
  );
};

/* ---------- 3. Vuelo cancelado (motion graphics) ---------- */
export const VueloCancelado: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const tablero = pop(f, 6, 14);
  const cancel = P(f, c("cancelo") - 2, 6);
  const blink = Math.floor(f / 10) % 2 === 0;
  const charter = pop(f, c("charter") - 4);
  const cal = pop(f, c("martes") - 6);
  return (
    <Lienzo>
      {/* tablero de salidas */}
      <g transform={`translate(540 190) scale(${tablero})`} opacity={Math.min(1, tablero * 1.5)}>
        <rect x="-390" y="-110" width="780" height="220" rx="18" fill="#0B1220" stroke={C.suave} strokeWidth="3" />
        <text x="-350" y="-60" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.suave} letterSpacing="3">SALIDAS · DEPARTURES</text>
        <line x1="-370" x2="370" y1="-40" y2="-40" stroke={C.suave} strokeOpacity="0.3" strokeWidth="2" />
        <text x="-350" y="20" fontFamily={F.mono} fontWeight={800} fontSize="40" fill="#F2B544">GUA → TORONTO</text>
        <text x="-350" y="78" fontFamily={F.mono} fontWeight={800} fontSize="34" fill={cancel > 0.5 ? (blink ? "#FF5A5F" : "#7A2B2E") : "#5CCB9B"}>{cancel > 0.5 ? "CANCELADO" : "A TIEMPO"}</text>
      </g>
      {/* avión en pista con sello */}
      <g transform="translate(540 430)" opacity={fade(f, 10)}>
        <line x1="-300" x2="300" y1="60" y2="60" stroke={C.suave} strokeWidth="4" strokeDasharray="30 20" />
        <path d="M-150 30 L130 20 Q170 30 130 40 Z M-40 28 L-100 -40 L-70 -40 L30 26 Z M-40 34 L-100 100 L-70 100 L30 36 Z M-140 30 L-170 -10 L-150 -10 L-110 28 Z" fill={C.grisClaro} opacity={1 - 0.5 * cancel} />
        <g transform={`rotate(-12) scale(${lerp(1.6, 1, cancel)})`} opacity={cancel}>
          <rect x="-170" y="-34" width="340" height="68" rx="10" fill="none" stroke="#E5484D" strokeWidth="7" />
          <text y="16" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="44" fill="#E5484D">CANCELADO</text>
        </g>
      </g>
      <g transform={`translate(270 640) scale(${charter})`} opacity={Math.min(1, charter * 1.5)}>
        <rect x="-150" y="-50" width="300" height="100" rx="20" fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="2.5" />
        <path d="M-120 2 L-60 -2 Q-48 2 -60 6 Z M-96 0 L-106 -20 L-100 -20 L-86 0 Z M-96 4 L-106 24 L-100 24 L-86 4 Z" fill={C.claro} transform="scale(1.3) translate(20 0)" />
        <text x="30" y="10" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.blanco}>CHÁRTER</text>
      </g>
      {/* calendario: lunes 16 → ¿martes 17? */}
      <g transform={`translate(760 640) scale(${cal})`} opacity={Math.min(1, cal * 1.5)}>
        {[[-80, "LUN", "16"], [80, "MAR", "17?"]].map(([x, d, n], i) => (
          <g key={i} transform={`translate(${x} 0)`}>
            <rect x="-62" y="-70" width="124" height="140" rx="14" fill={C.grisClaro} />
            <rect x="-62" y="-70" width="124" height="40" rx="14" fill={i ? "#F2B544" : "#9AA7B8"} />
            <text y="-42" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.marino}>{d}</text>
            <text y="36" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize={i ? 52 : 60} fill={C.marino}>{n}</text>
          </g>
        ))}
        <path d="M-130 -60 L-30 60" stroke="#E5484D" strokeWidth="8" strokeLinecap="round" opacity={P(f, c("martes") + 4, 6)} />
      </g>
    </Lienzo>
  );
};

/* ---------- 4. Ceniza del volcán de Fuego ---------- */
export const CenizaFuego: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const v = pop(f, 6, 16);
  const mapaK = pop(f, c("caer") - 8, 14);
  const on = P(f, c("caer") - 2, 12);
  const s = 0.52;
  const MX = 520, MY = 440;
  return (
    <Lienzo>
      <Tarjeta src={FOTOS + "volcan.jpg"} x={190} y={30} w={700} h={394} k={v} zoom={1 + 0.06 * P(f, 0, 400, inOut)} />
      <g transform={`translate(230 600) scale(${pop(f, c("insivumeh") - 6)})`} opacity={fade(f, c("insivumeh") - 6)}>
        <circle r="90" fill="#FFFFFF" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
        <image href={staticFile(FOTOS + "insivumeh.png")} x="-82" y="-82" width="164" height="164" />
      </g>
      <g transform={`translate(${MX} ${MY}) scale(${s * mapaK})`} opacity={Math.min(1, mapaK * 1.5)}>
        <MapaGuatemala resaltar={["Sacatepéquez", "Guatemala"]} on={on} f={f} idp="ceniza" color="148,163,184" />
      </g>
      {/* ceniza que cae sobre los departamentos */}
      {on > 0 && Array.from({ length: 26 }).map((_, i) => {
        const [cx, cy] = MAPA.centros[i % 2 ? "Guatemala" : "Sacatepéquez"];
        const per = 40 + (i % 5) * 6;
        const u = ((f + i * 7) % per) / per;
        const x = MX + cx * s + Math.sin(i * 3.1) * 28;
        const y = MY + cy * s - 60 + u * 70;
        return <circle key={i} cx={x} cy={y} r={2.5 + (i % 3)} fill="#CBD5E1" opacity={on * (1 - u) * 0.9} />;
      })}
      <g opacity={on}>
        <text x={MX + 300 * s} y={MY + 640 * s + 34} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.blanco} letterSpacing="1.5">SACATEPÉQUEZ · GUATEMALA</text>
      </g>
    </Lienzo>
  );
};

/* ---------- 5. Festival de las Flores en Antigua ---------- */
const Flor: React.FC<{ color: string; s?: number }> = ({ color, s = 1 }) => (
  <g transform={`scale(${s})`}>
    {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-16" rx="11" ry="17" fill={color} transform={`rotate(${a})`} />)}
    <circle r="9" fill="#F2B544" />
  </g>
);

export const FestivalFlores: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = pop(f, 6, 16);
  const colores = ["#F472B6", "#FB7185", "#FBBF24", "#A78BFA", "#F9A8D4", "#FDBA74"];
  return (
    <Lienzo>
      <Tarjeta src={FOTOS + "antigua.jpg"} x={130} y={50} w={820} h={487} k={k} zoom={1 + 0.06 * P(f, 0, 300, inOut)} />
      {/* pétalos que caen sobre la escena */}
      {Array.from({ length: 22 }).map((_, i) => {
        const per = 70 + (i % 6) * 10;
        const u = ((f + i * 13) % per) / per;
        const x = 140 + ((i * 97) % 800) + Math.sin(f / 12 + i) * 18;
        const y = 30 + u * 560;
        return <ellipse key={i} cx={x} cy={y} rx="7" ry="4" fill={colores[i % colores.length]} opacity={fade(f, c("antigua") + 4) * 0.85 * Math.min(1, (1 - u) * 4)} transform={`rotate(${f * 3 + i * 40} ${x} ${y})`} />;
      })}
      {/* hilera de flores */}
      {Array.from({ length: 7 }).map((_, i) => {
        const fk = pop(f, c("antigua") + 20 + i * 3);
        return <g key={i} transform={`translate(${200 + i * 113} 600) scale(${fk}) rotate(${Math.sin(f / 10 + i) * 8})`} opacity={Math.min(1, fk * 1.5)}><Flor color={colores[i % colores.length]} s={1.6} /></g>;
      })}
      <Cifra x={540} y={730} valor="10.ª EDICIÓN" rotulo="ANTIGUA GUATEMALA" k={P(f, c("edicion") - 6, 12, outBack)} size={70} />
    </Lienzo>
  );
};

export const VIZ_NACIONAL_4: Record<string, React.FC<VizProps>> = {
  asturias: Asturias,
  marcador: Marcador,
  vuelocancelado: VueloCancelado,
  ceniza: CenizaFuego,
  festival: FestivalFlores,
};
