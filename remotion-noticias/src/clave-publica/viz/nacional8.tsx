import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { MAPA, MapaGuatemala } from "./nacional3";

// Ilustraciones de la edición nacional del 19 nov 2026.
const FOTOS = "fotos/2026-11-19/";
const cuenta = (f: number, at: number, hasta: number, d = 22) =>
  Math.round(interpolate(f, [at, at + d], [0, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));
const miles = (n: number) => n.toLocaleString("en-US");
const ROJO = "#E5484D";
const AMARILLO = "#F2B544";
const VERDE_Q = "#4E9A76";

const Chip: React.FC<{ x: number; y: number; texto: string; k: number; color?: string; size?: number }> = ({ x, y, texto, k, color = C.blanco, size = 26 }) => {
  const w = texto.length * size * 0.66 + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-size - 4} width={w} height={size * 2 + 8} rx={size + 4} fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="2.5" />
      <text y={size * 0.36} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize={size} fill={color} letterSpacing="1.5">{texto}</text>
    </g>
  );
};

/* ---------- 1. Presupuesto 2027 sin dictamen ---------- */
const Billete: React.FC = () => (
  <g filter="drop-shadow(0 6px 10px rgba(0,0,0,0.35))">
    <rect x="-130" y="-58" width="260" height="116" rx="10" fill={VERDE_Q} stroke="#BFE8D3" strokeWidth="4" />
    <rect x="-116" y="-44" width="232" height="88" rx="6" fill="none" stroke="#BFE8D3" strokeOpacity="0.55" strokeWidth="2" />
    <circle r="34" fill="#3B7C5E" stroke="#BFE8D3" strokeWidth="3" />
    <text y="16" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="46" fill="#E8F7EF">Q</text>
    <text x="-100" y="-16" fontFamily={F.exo} fontWeight={900} fontSize="24" fill="#E8F7EF">100</text>
    <text x="100" y="40" textAnchor="end" fontFamily={F.exo} fontWeight={900} fontSize="24" fill="#E8F7EF">100</text>
  </g>
);
const Dia: React.FC<{ x: number; y: number; dia: string; k: number; rojo?: boolean }> = ({ x, y, dia, k, rojo }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <rect x="-90" y="-95" width="180" height="190" rx="20" fill={C.grisClaro} stroke={rojo ? ROJO : C.claro} strokeWidth={rojo ? 6 : 2} />
    <rect x="-90" y="-95" width="180" height="52" rx="20" fill={rojo ? ROJO : C.celeste} />
    <rect x="-90" y="-60" width="180" height="17" fill={rojo ? ROJO : C.celeste} />
    <text y="-58" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" fill="#FFFFFF" letterSpacing="3">NOV</text>
    <text y="62" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="96" fill={C.marino}>{dia}</text>
  </g>
);
export const Presupuesto2027: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const sello = P(f, c("dictamen") - 4, 10, outBack);
  const fase2 = P(f, c("pleno") - 4, 12, inOut); // salen los billetes, entra el calendario
  const corte = P(f, c("recorte") - 8, 14, inOut);
  return (
    <Lienzo>
      <Sticker src="fotos/2026-11-16/congreso.png" id="cong19" x={240} y={10} w={600} h={400} k={k} opacity={Math.min(1, k * 2)} fadeBottom fadeLeft />
      {/* sello SIN DICTAMEN */}
      <g transform={`translate(540 300) rotate(-8) scale(${lerp(1.8, 1, sello)})`} opacity={sello}>
        <rect x="-210" y="-46" width="420" height="92" rx="14" fill="rgba(10,38,71,0.85)" stroke={ROJO} strokeWidth="7" />
        <text y="18" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="50" fill="#FF8A8D" letterSpacing="3">SIN DICTAMEN</text>
      </g>
      {/* billetes + monto */}
      <g opacity={1 - fase2}>
        {Array.from({ length: 6 }).map((_, i) => {
          const kb = pop(f, c("monto") - 10 + i * 3, 12);
          const fuera = i >= 4 ? corte : 0; // el recorte se lleva los dos de arriba
          return (
            <g key={i} transform={`translate(${280 + fuera * 160} ${640 - i * 26 - (1 - kb) * 80 - fuera * 60}) rotate(${(i % 2 ? 3 : -3) + fuera * 25})`} opacity={Math.min(1, kb * 1.5) * (1 - fuera)}>
              <Billete />
            </g>
          );
        })}
        {/* tijeras del recorte */}
        <g transform={`translate(${lerp(120, 450, corte)} 500)`} opacity={P(f, c("recorte") - 12, 6) * (1 - P(f, c("recorte") + 10, 8))}>
          <line x1="-40" y1="0" x2="40" y2="0" stroke={AMARILLO} strokeWidth="5" strokeDasharray="10 8" />
          <g transform={`translate(0 -4) rotate(${Math.sin(f / 2) * 10})`} stroke={C.blanco} strokeWidth="6" fill="none" strokeLinecap="round">
            <circle cx="-34" cy="-16" r="13" /><circle cx="-34" cy="16" r="13" />
            <line x1="-22" y1="-10" x2="30" y2="14" /><line x1="-22" y1="10" x2="30" y2="-14" />
          </g>
        </g>
        <Cifra x={780} y={590} valor="Q192 MIL M" rotulo="PROYECTO 2027" k={P(f, c("monto") - 6, 12, outBack)} size={82} />
      </g>
      {/* calendario: discusión 24-25 nov, plazo 30 nov */}
      <g opacity={fase2}>
        <Dia x={250} y={600} dia="24" k={pop(f, c("veinticuatro") - 6)} />
        <Dia x={470} y={600} dia="25" k={pop(f, c("veinticuatro") + 6)} />
        <Dia x={800} y={600} dia="30" k={pop(f, c("treinta") - 6)} rojo />
        <text x="360" y="740" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.suave} letterSpacing="2" opacity={fade(f, c("veinticuatro") + 8)}>DISCUSIÓN</text>
        <text x="800" y="740" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" fill="#FF8A8D" letterSpacing="2" opacity={fade(f, c("treinta"))}>PLAZO</text>
      </g>
    </Lienzo>
  );
};

/* ---------- 2. Homicidios suben en octubre (motion graphics) ---------- */
const MESES: [string, number][] = [["JUN", 12], ["JUL", 41], ["AGO", 41], ["SEP", 18], ["OCT", 44]];
export const Homicidios: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const fase2 = P(f, c("enero") - 6, 14, inOut);
  const k44 = P(f, c("cuarenta") - 6, 12, outBack);
  return (
    <Lienzo>
      <g opacity={1 - fase2}>
        <Cifra x={540} y={190} valor={`+${cuenta(f, c("cuarenta") - 4, 44, 16)}`} rotulo="OCTUBRE VS. 2025" k={k44} size={170} />
        {/* tendencia al alza desde el inicio; luego se vuelve barras */}
        {(() => {
          const t = P(f, c("homicidios") - 6, 26, inOut);
          const sale = P(f, c("quinto") - 14, 10);
          const pts = MESES.map(([, v], i) => `${230 + i * 155},${640 - (v / 44) * 260}`).join(" ");
          return (
            <g opacity={(1 - sale) * Math.min(1, t * 3)}>
              <polyline points={pts} fill="none" stroke={ROJO} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={`${t} 1`} />
              {MESES.map(([m, v], i) => (
                <circle key={m} cx={230 + i * 155} cy={640 - (v / 44) * 260} r="13" fill="#FF8A8D" opacity={P(f, c("homicidios") - 6 + i * 5, 6)} />
              ))}
            </g>
          );
        })()}
        {/* barras: homicidios de más frente a 2025, mes a mes */}
        <line x1="150" y1="640" x2="930" y2="640" stroke={C.suave} strokeOpacity="0.6" strokeWidth="3" />
        {MESES.map(([m, v], i) => {
          const t = P(f, c("quinto") - 14 + i * 5, 14, outCubic);
          const h = (v / 44) * 260 * t;
          const x = 230 + i * 155;
          const oct = i === 4;
          return (
            <g key={m} opacity={Math.min(1, t * 2)}>
              <rect x={x - 48} y={640 - h} width="96" height={h} rx="10" fill={oct ? ROJO : C.suave} opacity={oct ? 0.95 : 0.75} />
              <text x={x} y={640 - h - 16} textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="38" fill={oct ? "#FF8A8D" : C.claro}>+{v}</text>
              <text x={x} y={690} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.suave} letterSpacing="2">{m}</text>
            </g>
          );
        })}
      </g>
      <g opacity={fase2}>
        <Cifra x={540} y={330} valor={miles(cuenta(f, c("enero") - 2, 2616, 40))} rotulo="HOMICIDIOS ENE–OCT 2026" k={fase2} size={190} />
        {/* comparación con 2025: dos barras casi iguales */}
        {(() => {
          const t = P(f, c("quince") - 10, 16);
          return (
            <g opacity={Math.min(1, t * 2)}>
              <text x="150" y="512" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.suave}>2025</text>
              <rect x="250" y="488" width={680 * t} height="34" rx="8" fill={C.suave} opacity="0.7" />
              <text x="150" y="582" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.claro}>2026</text>
              <rect x="250" y="558" width={676 * t} height="34" rx="8" fill={ROJO} opacity="0.9" />
            </g>
          );
        })()}
        <Chip x={540} y={690} texto="SOLO 15 MENOS" k={pop(f, c("quince") + 4)} color={AMARILLO} size={28} />
      </g>
    </Lienzo>
  );
};

/* ---------- 3. Baldetti, al Hospital San Juan de Dios ---------- */
const Hospital: React.FC = () => (
  <g filter="drop-shadow(0 10px 18px rgba(0,0,0,0.45))">
    <rect x="-150" y="-70" width="300" height="160" rx="10" fill={C.grisClaro} />
    <rect x="-150" y="-70" width="300" height="34" rx="10" fill={C.suave} />
    <rect x="-150" y="-46" width="300" height="10" fill={C.suave} />
    <text y="-46" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.marino} letterSpacing="3">HOSPITAL</text>
    {[-1, 1].map((r) => [-110, -60, 60, 110].map((x) => (
      <rect key={`${r}${x}`} x={x - 17} y={r < 0 ? -22 : 26} width="34" height="30" rx="4" fill="#9CC9EC" stroke="#6E9CC4" strokeWidth="2" />
    )))}
    <rect x="-30" y="22" width="60" height="68" rx="6" fill={C.marino} />
    <line x1="0" y1="26" x2="0" y2="90" stroke={C.suave} strokeWidth="3" />
    <g transform="translate(0 -102)">
      <circle r="34" fill="#FFFFFF" stroke={ROJO} strokeWidth="5" />
      <rect x="-9" y="-22" width="18" height="44" rx="3" fill={ROJO} /><rect x="-22" y="-9" width="44" height="18" rx="3" fill={ROJO} />
    </g>
  </g>
);
const Carcel: React.FC = () => (
  <g filter="drop-shadow(0 10px 18px rgba(0,0,0,0.45))">
    {/* alambre de púas */}
    <path d="M-140 -78 l14 -12 l14 12 l14 -12 l14 12 l14 -12 l14 12 l14 -12 l14 12 l14 -12 l14 12 l14 -12 l14 12 l14 -12 l14 12 l14 -12 l14 12 l14 -12 l14 12 l14 -12 l14 12" fill="none" stroke="#A9B4C2" strokeWidth="3" />
    <rect x="-140" y="-74" width="280" height="150" rx="6" fill="#5B6676" />
    {[-44, -6, 32].map((y) => <line key={y} x1="-140" y1={y} x2="140" y2={y} stroke="#4A5462" strokeWidth="3" />)}
    {[-100, -40, 20, 80].map((x, i) => <line key={x} x1={x + (i % 2) * 20} y1="-74" x2={x + (i % 2) * 20} y2="-44" stroke="#4A5462" strokeWidth="3" />)}
    <rect x="-60" y="-46" width="120" height="96" rx="8" fill="#1F2937" stroke="#A9B4C2" strokeWidth="4" />
    {[-36, -12, 12, 36].map((x) => <rect key={x} x={x - 4} y="-46" width="8" height="96" fill="#A9B4C2" />)}
  </g>
);
const Mazo: React.FC<{ golpe: number }> = ({ golpe }) => (
  <g>
    {/* base */}
    <rect x="-70" y="58" width="110" height="18" rx="6" fill="#8A5A3B" />
    <rect x="-60" y="48" width="90" height="12" rx="5" fill="#B07A52" />
    {golpe > 0.05 && [-1, 1].map((d) => (
      <path key={d} d={`M${-15 + d * 62} 40 l${d * 18} -14 M${-15 + d * 66} 54 l${d * 22} 0`} stroke={C.claro} strokeWidth="5" strokeLinecap="round" opacity={1 - golpe * 0.3} />
    ))}
    {/* mazo: el mango apunta arriba a la derecha y gira para golpear la base */}
    <g transform={`translate(-15 24) rotate(${-28 * (1 - golpe)} 60 -60)`}>
      <line x1="0" y1="0" x2="64" y2="-64" stroke="#B07A52" strokeWidth="14" strokeLinecap="round" />
      <g transform="rotate(45)">
        <rect x="-26" y="-50" width="52" height="100" rx="12" fill="#8A5A3B" />
        <rect x="-30" y="-50" width="60" height="16" rx="7" fill="#C9935F" />
        <rect x="-30" y="34" width="60" height="16" rx="7" fill="#C9935F" />
      </g>
    </g>
  </g>
);
const Palomita: React.FC<{ k: number }> = ({ k }) => (
  <g transform={`scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <circle r="30" fill={C.menta} />
    <path d="M-13 1 L-3 11 L14 -9" fill="none" stroke={C.marino} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
export const BaldettiHospital: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = pop(f, 4, 16);
  const kh = pop(f, c("hospital") - 6, 14);
  const vaH = P(f, c("hospital") - 2, 22, inOut);
  const kc = pop(f, c("jueza") - 6, 14);
  const vaC = P(f, c("jueza") - 2, 18, inOut);
  const golpe = P(f, c("efecto") - 6, 5) * (1 - P(f, c("efecto") - 1, 8));
  const tacha = P(f, c("santateresa") - 8, 10);
  const kp = pop(f, c("santateresa") + 6, 12);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "baldetti.png"} id="baldetti" x={20} y={120} w={420} h={560} k={k} opacity={Math.min(1, k * 2)} />
      {/* destino 1: hospital (sí) */}
      <path d="M440 300 C520 240 560 190 610 190" fill="none" stroke={C.celeste} strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray={`${vaH} 1`} />
      <path d="M592 172 L614 190 L590 206" fill="none" stroke={C.celeste} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity={P(f, c("hospital") + 16, 6)} />
      <g transform={`translate(790 200) scale(${kh})`} opacity={Math.min(1, kh * 1.5)}><Hospital /></g>
      <g transform="translate(925 120)"><Palomita k={kp} /></g>
      {/* destino 2: cárcel de Santa Teresa (orden sin efecto) */}
      <g opacity={1 - 0.45 * tacha}>
        <path d="M440 470 C520 500 570 520 615 520" fill="none" stroke={C.suave} strokeWidth="8" strokeLinecap="round" strokeDasharray="14 12" pathLength={undefined}
          opacity={Math.min(1, vaC * 3)} style={{ clipPath: `inset(0 ${100 - vaC * 100}% 0 0)` }} />
        <g transform={`translate(790 530) scale(${kc})`} opacity={Math.min(1, kc * 1.5)}><Carcel /></g>
      </g>
      <g transform="translate(790 530)" stroke={ROJO} strokeWidth="16" strokeLinecap="round" opacity={tacha}>
        <line x1={-120} y1={-90} x2={-120 + 240 * tacha} y2={-90 + 170 * tacha} />
        <line x1={120} y1={-90} x2={120 - 240 * P(f, c("santateresa") - 4, 10)} y2={-90 + 170 * P(f, c("santateresa") - 4, 10)} />
      </g>
      <Chip x={790} y={660} texto="SANTA TERESA" k={kc} size={24} />
      <g transform={`translate(540 355) scale(${pop(f, c("jueza") - 4, 12) * 0.95})`} opacity={Math.min(1, pop(f, c("jueza") - 4, 12) * 1.5)}><Mazo golpe={golpe} /></g>
      <Chip x={540} y={760} texto="PRISIÓN PREVENTIVA" k={pop(f, c("preventiva") - 6)} color={AMARILLO} size={24} />
    </Lienzo>
  );
};

/* ---------- 4. Sequía y pérdidas de maíz ---------- */
const Sol: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <g transform={`rotate(${f * 0.6})`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x="-7" y="-118" width="14" height="36" rx="7" fill={AMARILLO} transform={`rotate(${i * 30})`} />
      ))}
    </g>
    <circle r="70" fill={AMARILLO} />
    <circle r="70" fill="#F79A3E" opacity={0.25 + 0.15 * Math.sin(f / 8)} />
  </g>
);
const Casa: React.FC<{ on: number }> = ({ on }) => (
  <g>
    <path d="M-30 -6 L0 -32 L30 -6" fill="none" stroke={on > 0.5 ? AMARILLO : C.suave} strokeWidth="6" strokeLinejoin="round" />
    <rect x="-22" y="-8" width="44" height="38" rx="4" fill={on > 0.5 ? AMARILLO : "rgba(127,184,230,0.35)"} />
  </g>
);
export const SequiaMaiz: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const seco = P(f, c("sequia") - 4, 30);
  const f2 = P(f, c("ocho") - 6, 12, inOut);
  const f3 = P(f, c("jalapa") - 10, 16, inOut);
  const sx = lerp(300, 20, f3), sy = lerp(30, 140, f3), sk = lerp(1, 0.78, f3);
  return (
    <Lienzo>
      <g style={{ filter: `sepia(${seco * 0.85}) saturate(${1 - seco * 0.3}) brightness(${1 - seco * 0.12})` }}>
        <Sticker src={FOTOS + "maiz.png"} id="maiz" x={sx} y={sy} w={480 * sk} h={373 * sk} k={k} opacity={Math.min(1, k * 2)} />
      </g>
      <g transform={`translate(890 110) scale(${pop(f, c("sequia") - 6, 14)})`} opacity={1 - f3}><Sol f={f} /></g>
      {/* suelo agrietado */}
      <g opacity={seco * (1 - f3)} stroke="#B8875A" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M150 440 H930" strokeWidth="6" />
        <path d="M260 440 l20 22 l-14 18 M450 440 l-16 24 l18 14 M640 440 l14 20 l-20 22 M820 440 l-18 26" />
      </g>
      <g opacity={1 - f2}>
        <Cifra x={540} y={610} valor={miles(cuenta(f, c("hogares") - 4, 36431, 30))} rotulo="HOGARES CON PÉRDIDAS" k={P(f, c("hogares") - 8, 12, outBack)} size={150} />
      </g>
      <g opacity={f2 * (1 - f3)}>
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i} transform={`translate(${175 + i * 81} 560) scale(${pop(f, c("ocho") - 4 + i * 2, 10) * 1.2})`}>
            <Casa on={P(f, c("ocho") + 10 + i * 3, 4) * (i < 8 ? 1 : 0)} />
          </g>
        ))}
        <Chip x={540} y={690} texto="PERDIERON 75–100 %" k={pop(f, c("setenta") - 4)} color={AMARILLO} size={26} />
      </g>
      {/* mapa: Jalapa y Chiquimula */}
      <g transform={`translate(${lerp(560, 450, f3)} 70) scale(${0.95 * f3})`} opacity={f3}>
        <MapaGuatemala resaltar={["Jalapa", "Chiquimula"]} on={P(f, c("jalapa") - 4, 12)} f={f} idp="seq" color="242,181,68" />
        {(["Jalapa", "Chiquimula"] as const).map((n) => {
          const [x, y] = MAPA.centros[n];
          const on = P(f, c(n === "Jalapa" ? "jalapa" : "chiquimula") - 4, 10);
          return <circle key={n} cx={x} cy={y} r={10} fill={AMARILLO} opacity={on} />;
        })}
      </g>
      <Chip x={lerp(760, 760, f3)} y={720} texto="JALAPA · CHIQUIMULA" k={pop(f, c("chiquimula") - 2) * f3} size={24} />
    </Lienzo>
  );
};

/* ---------- 5. Carriles reducidos en el bulevar Liberación (AeroMetro) ---------- */
const Cono: React.FC = () => (
  <g>
    <path d="M-14 16 L0 -24 L14 16 Z" fill="#F08A2E" />
    <rect x="-8" y="-6" width="16" height="6" fill="#FFFFFF" />
    <rect x="-20" y="14" width="40" height="7" rx="3" fill="#F08A2E" />
  </g>
);
const Carro: React.FC<{ color: string }> = ({ color }) => (
  <g>
    <rect x="-36" y="-15" width="72" height="30" rx="9" fill={color} />
    <rect x="-8" y="-11" width="22" height="22" rx="4" fill="#0B1220" opacity="0.6" />
  </g>
);
export const BulevarLiberacion: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const kg = P(f, 4, 20, outBack);
  const cierre = P(f, c("carriles") - 6, 14);
  const ruta = P(f, c("ruta") - 6, 22, inOut);
  const sway = Math.sin(f / 22) * 3;
  const ROAD_Y = 400, LANE = 52;
  const lanes = [0, 1, 2, 3];
  return (
    <Lienzo>
      {/* góndola del AeroMetro */}
      <g transform={`translate(${lerp(1100, 0, kg)} 0) rotate(${sway} 840 0)`}>
        <Sticker src={FOTOS + "aerometro.png"} id="aero" x={700} y={-10} w={280} h={358} k={1} opacity={Math.min(1, kg * 2)} />
      </g>
      <Chip x={330} y={150} texto="20 NOV → 19 DIC" k={pop(f, c("viernes") - 4)} color={AMARILLO} size={28} />
      <Chip x={330} y={270} texto="ESTACIÓN 3 · ZONA 8" k={pop(f, c("aerometro") - 8)} size={24} />
      {/* bulevar: cuatro carriles, dos se cierran por la obra */}
      <g opacity={P(f, c("bulevar") - 10, 12)}>
        <rect x="40" y={ROAD_Y} width="1000" height={LANE * 4} rx="8" fill="#26303F" />
        <rect x="40" y={ROAD_Y - 6} width="1000" height="6" fill={C.claro} opacity="0.7" />
        <rect x="40" y={ROAD_Y + LANE * 4} width="1000" height="6" fill={C.claro} opacity="0.7" />
        {[1, 2, 3].map((i) => (
          <line key={i} x1="40" y1={ROAD_Y + LANE * i} x2="1040" y2={ROAD_Y + LANE * i} stroke={i === 2 ? AMARILLO : "#E6EDF5"} strokeWidth="4" strokeDasharray={i === 2 ? undefined : "26 22"} strokeDashoffset={-f * 3} opacity="0.75" />
        ))}
        {/* zona de obra */}
        <rect x="360" y={ROAD_Y + 4} width={360 * cierre} height={LANE * 1 - 8} rx="6" fill="rgba(240,138,46,0.28)" />
        <rect x="360" y={ROAD_Y + LANE * 3 + 4} width={360 * cierre} height={LANE - 8} rx="6" fill="rgba(240,138,46,0.28)" />
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i}>
            <g transform={`translate(${380 + i * 64} ${ROAD_Y + LANE * 0.5}) scale(${pop(f, c("carriles") - 6 + i * 2, 10)})`}><Cono /></g>
            <g transform={`translate(${380 + i * 64} ${ROAD_Y + LANE * 3.5}) scale(${pop(f, c("carriles") - 4 + i * 2, 10)})`}><Cono /></g>
          </g>
        ))}
        {/* tránsito: los carros de los carriles cerrados se cambian de carril */}
        {lanes.map((l) => {
          const dir = l < 2 ? 1 : -1;
          return [0, 1].map((j) => {
            const span = 1160;
            const x = ((f * 5 * (l % 2 ? 0.8 : 1) + j * 580 + l * 170) % span) - 60;
            const xx = dir > 0 ? x : 1080 - x;
            const cerrado = l === 0 || l === 3;
            const objetivo = l === 0 ? 1 : l === 3 ? 2 : l;
            const enObra = cerrado && cierre > 0.5 ? (dir > 0 ? xx > 250 && xx < 740 : xx < 760 && xx > 260) : false;
            const carril = enObra ? objetivo : l;
            return (
              <g key={`${l}-${j}`} transform={`translate(${xx} ${ROAD_Y + LANE * (carril + 0.5)}) scale(${dir} 1)`}>
                <Carro color={[C.celeste, "#E6EDF5", "#9CC9EC", C.suave][(l + j) % 4]} />
              </g>
            );
          });
        })}
      </g>
      {/* ruta alterna */}
      <g opacity={Math.min(1, ruta * 3)}>
        <path d="M150 615 V700 H930 V615" fill="none" stroke={C.celeste} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray={`${ruta} 1`} />
        <path d="M930 615 l-14 24 m14 -24 l14 24" stroke={C.celeste} strokeWidth="9" strokeLinecap="round" opacity={P(f, c("ruta") + 14, 6)} />
      </g>
      <Chip x={540} y={700} texto="40 CALLE C" k={pop(f, c("cuarenta") - 4)} color={C.celeste} size={28} />
    </Lienzo>
  );
};

export const VIZ_NACIONAL_8: Record<string, React.FC<VizProps>> = {
  presupuesto2027: Presupuesto2027,
  homicidios: Homicidios,
  baldettihospital: BaldettiHospital,
  sequiamaiz: SequiaMaiz,
  bulevarliberacion: BulevarLiberacion,
};
