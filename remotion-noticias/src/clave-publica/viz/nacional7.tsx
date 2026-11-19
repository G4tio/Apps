import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { EEUU, ElSalvador } from "./banderas";
import { MAPA } from "./nacional3";

// Ilustraciones de la edición nacional del 18 nov 2026.
const FOTOS = "fotos/2026-11-18/";
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
const LogoCard: React.FC<{ src: string; x: number; y: number; w: number; h: number; k: number; pad?: number }> = ({ src, x, y, w, h, k, pad = 14 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <rect x={-w / 2 - pad} y={-h / 2 - pad} width={w + pad * 2} height={h + pad * 2} rx="22" fill="#FFFFFF" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
    <image href={staticFile(src)} x={-w / 2} y={-h / 2} width={w} height={h} />
  </g>
);
const BanderaGT: React.FC<{ w: number }> = ({ w }) => {
  const h = (w * 5) / 8;
  return (
    <g filter="drop-shadow(0 8px 16px rgba(0,0,0,0.35))">
      <rect width={w / 3} height={h} fill="#4997D0" /><rect x={w / 3} width={w / 3} height={h} fill="#FFFFFF" /><rect x={(2 * w) / 3} width={w / 3} height={h} fill="#4997D0" />
      <circle cx={w / 2} cy={h / 2} r={h * 0.13} fill="none" stroke="#3E7D3A" strokeWidth={w * 0.015} />
      <rect width={w} height={h} rx={4} fill="none" stroke="#BFEAFF" strokeOpacity="0.7" strokeWidth={2} />
    </g>
  );
};

/* ---------- 1. Villeda, candidato a juez de la Corte IDH ---------- */
const Balanza: React.FC<{ f: number }> = ({ f }) => {
  const a = Math.sin(f / 18) * 6;
  return (
    <g stroke={C.claro} strokeWidth="6" strokeLinecap="round" fill="none">
      <line x1="0" y1="-80" x2="0" y2="80" />
      <path d="M-50 80 H50" strokeWidth="10" />
      <g transform={`rotate(${a} 0 -60)`}>
        <line x1="-110" y1="-60" x2="110" y2="-60" />
        <line x1="-110" y1="-60" x2="-140" y2="0" /><line x1="-110" y1="-60" x2="-80" y2="0" />
        <line x1="110" y1="-60" x2="80" y2="0" /><line x1="110" y1="-60" x2="140" y2="0" />
        <path d="M-145 0 Q-110 30 -75 0 Z" fill={C.celeste} />
        <path d="M75 0 Q110 30 145 0 Z" fill={C.celeste} />
      </g>
      <circle cy="-84" r="10" fill={C.claro} />
    </g>
  );
};
export const VilledaCIDH: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = pop(f, 4, 16);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "villeda.png"} id="villeda" x={0} y={290} w={560} h={438} k={k} opacity={Math.min(1, k * 2)} />
      <g transform={`translate(820 150) scale(${pop(f, c("corte") - 8, 14)})`}><Balanza f={f} /></g>
      <text x="820" y="290" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="44" fill={C.blanco} opacity={fade(f, c("corte"))}>CORTE IDH</text>
      {/* 7 jueces, uno por país */}
      {Array.from({ length: 7 }).map((_, i) => {
        const kk = pop(f, c("siete") - 4 + i * 3);
        const gt = i === 3;
        return (
          <g key={i} transform={`translate(${655 + i * 55} 360) scale(${kk})`} opacity={Math.min(1, kk * 1.5)}>
            <circle cy="-10" r="12" fill={gt ? C.celeste : C.suave} />
            <path d="M-18 22 a18 20 0 0 1 36 0 z" fill={gt ? C.celeste : C.suave} />
            {gt && <text y="-34" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="26" fill={AMARILLO}>?</text>}
          </g>
        );
      })}
      <Chip x={820} y={470} texto="PERÍODO 2028–2033" k={pop(f, c("periodo") - 6)} color={AMARILLO} size={24} />
      <Chip x={820} y={560} texto="ELECCIÓN: OEA, JUNIO 2027" k={pop(f, c("oea") - 6)} size={21} />
      <Chip x={820} y={650} texto="7 JUECES · 1 POR PAÍS" k={pop(f, c("pais") - 10)} color={C.menta} size={21} />
    </Lienzo>
  );
};

/* ---------- 2. Gobernación pausa las cámaras corporales de la PNC ---------- */
const Camara: React.FC<{ f: number; pausa: number }> = ({ f, pausa }) => (
  <g>
    <rect x="-110" y="-150" width="220" height="300" rx="34" fill="#1F2937" stroke={C.claro} strokeWidth="6" />
    <circle cy="-40" r="66" fill="#0B1220" stroke={C.suave} strokeWidth="8" />
    <circle cy="-40" r="36" fill="#123B6B" />
    <circle cx="-14" cy="-54" r="10" fill={C.claro} opacity="0.7" />
    <rect x="-70" y="60" width="140" height="56" rx="12" fill="#0B1220" />
    <circle cx="-40" cy="88" r="11" fill={ROJO} opacity={pausa > 0.5 ? 0.25 : f % 24 < 14 ? 1 : 0.3} />
    <text x="0" y="98" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.blanco}>{pausa > 0.5 ? "OFF" : "REC"}</text>
    <rect x="-130" y="-170" width="60" height="40" rx="8" fill={C.suave} />
  </g>
);
export const CamarasCorporales: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const pausa = P(f, c("detuvo") - 4, 12);
  const cam = 1 - P(f, c("ortiz") - 10, 10);
  const ks = pop(f, c("ortiz") - 6, 16);
  return (
    <Lienzo>
      <LogoCard src={FOTOS + "logo-mingob.png"} x={540} y={80} w={280} h={110} k={pop(f, 4)} />
      <g opacity={cam}>
        <g transform={`translate(270 450) scale(${pop(f, 8, 14)})`}><Camara f={f} pausa={pausa} /></g>
        <g transform={`translate(270 440) scale(${P(f, c("detuvo") - 4, 12, outBack)})`} opacity={pausa}>
          <circle r="88" fill="rgba(229,72,77,0.9)" stroke="#FFB3B5" strokeWidth="6" />
          <rect x="-34" y="-42" width="22" height="84" rx="6" fill={C.blanco} />
          <rect x="12" y="-42" width="22" height="84" rx="6" fill={C.blanco} />
        </g>
      </g>
      <Sticker src={FOTOS + "ortiz.png"} id="ortiz" x={20} y={300} w={480} h={422} k={ks} opacity={Math.min(1, ks * 2)} />
      <Cifra x={800} y={320} valor={`${cuenta(f, c("quinientas") - 6, 500, 18)}`} rotulo="CÁMARAS" k={P(f, c("quinientas") - 8, 12, outBack)} size={110} />
      <Cifra x={800} y={500} valor={`Q${cuenta(f, c("millones") - 6, 20, 16)} MILLONES`} rotulo="INVERSIÓN ESTIMADA" k={P(f, c("millones") - 8, 12, outBack)} size={74} />
      <Chip x={800} y={660} texto="DECISIÓN: FIN DE NOVIEMBRE" k={pop(f, c("noviembre") - 8)} color={AMARILLO} size={21} />
    </Lienzo>
  );
};

/* ---------- 3. Bono navideño de Q5 mil ---------- */
const Escudo: React.FC = () => (
  <g>
    <path d="M0 -60 L50 -40 V5 Q50 45 0 66 Q-50 45 -50 5 V-40 Z" fill="#123B6B" stroke={C.claro} strokeWidth="5" />
    <path d="M0 -26 L9 -6 L30 -4 L14 10 L19 31 L0 20 L-19 31 L-14 10 L-30 -4 L-9 -6 Z" fill={AMARILLO} />
  </g>
);
const Llave: React.FC = () => (
  <g fill="none" stroke={C.claro} strokeWidth="8" strokeLinecap="round">
    <circle cx="-26" cy="0" r="26" />
    <path d="M0 0 H62 M44 0 V20 M58 0 V16" />
  </g>
);
export const BonoPolicias: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const kb = pop(f, 6, 16);
  const abre = P(f, c("cinco") - 6, 16, outBack);
  return (
    <Lienzo>
      {/* regalo */}
      <g transform={`translate(280 380) scale(${kb})`} opacity={Math.min(1, kb * 1.5)}>
        <g transform={`translate(0 ${-170 - 50 * abre})`} opacity={1 - abre * 0.2}>
          <text textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="90" fill={C.menta} opacity={abre}>Q5,000</text>
        </g>
        <rect x="-150" y="-60" width="300" height="200" rx="14" fill={ROJO} stroke="#FFB3B5" strokeWidth="4" />
        <rect x="-22" y="-60" width="44" height="200" fill={AMARILLO} />
        <g transform={`translate(0 ${-60 - 40 * abre}) rotate(${-14 * abre})`}>
          <rect x="-170" y="-50" width="340" height="56" rx="12" fill="#C9363B" stroke="#FFB3B5" strokeWidth="4" />
          <rect x="-22" y="-50" width="44" height="56" fill={AMARILLO} />
          <path d="M0 -50 C-60 -110 -100 -60 0 -50 C100 -60 60 -110 0 -50" fill="none" stroke={AMARILLO} strokeWidth="12" />
        </g>
      </g>
      <Chip x={280} y={650} texto="BONO NAVIDEÑO" k={pop(f, c("bono") - 4)} color={AMARILLO} size={26} />
      <Chip x={280} y={740} texto="PAGO: ANTES DEL 15 DE DIC." k={pop(f, c("diciembre") - 8)} size={20} />
      {/* beneficiarios */}
      <g transform={`translate(640 200) scale(${pop(f, c("agentes") - 8)})`}>
        <Escudo />
        <text x="80" y="10" fontFamily={F.exo} fontWeight={900} fontSize="64" fill={C.blanco}>+{cuenta(f, c("agentes") - 4, 45, 18)} MIL</text>
        <text x="82" y="50" fontFamily={F.mono} fontWeight={700} fontSize="24" fill={C.suave} letterSpacing="2">AGENTES DE LA PNC</text>
      </g>
      <g transform={`translate(640 420) scale(${pop(f, c("guardias") - 8)})`}>
        <Llave />
        <text x="80" y="10" fontFamily={F.exo} fontWeight={900} fontSize="64" fill={C.blanco}>{cuenta(f, c("guardias") - 4, 4, 12)} MIL</text>
        <text x="82" y="50" fontFamily={F.mono} fontWeight={700} fontSize="24" fill={C.suave} letterSpacing="2">GUARDIAS PENITENCIARIOS</text>
      </g>
      {/* copos/destellos navideños */}
      {Array.from({ length: 8 }).map((_, i) => {
        const u = ((f * 1.2 + i * 37) % 120) / 120;
        return <circle key={i} cx={60 + i * 130} cy={lerp(20, 780, u)} r={3 + (i % 3)} fill={C.claro} opacity={0.35 * fade(f, 8)} />;
      })}
    </Lienzo>
  );
};

/* ---------- 4. Cárcel El Triunfo, Izabal ---------- */
export const CarcelTriunfo: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const on = P(f, c("izabal") - 10, 14);
  const S = 1.15;
  const [ix, iy] = MAPA.centros["Izabal"];
  const av = P(f, c("avance") - 6, 30, inOut);
  const pasos = [
    { cue: "tierras", t: "MOVIMIENTO DE TIERRAS", sub: "PRÓXIMAS SEMANAS" },
    { cue: "enero", t: "INICIO DE CONSTRUCCIÓN", sub: "ENERO 2027" },
    { cue: "entrega", t: "ENTREGA A GOBERNACIÓN", sub: "FINALES DE 2027" },
  ];
  return (
    <Lienzo>
      <LogoCard src={FOTOS + "logo-mindef.png"} x={540} y={80} w={290} h={118} k={pop(f, c("mindef") - 10)} />
      <g opacity={fade(f, 6)}>
        <defs><clipPath id="cliptri"><rect x="20" y="190" width="500" height="590" rx="24" /></clipPath></defs>
        <rect x="20" y="190" width="500" height="590" rx="24" fill="rgba(4,18,42,0.6)" stroke={C.suave} strokeWidth="2" />
        <g style={{ clipPath: "url(#cliptri)" }}>
          <g transform={`translate(${270 - ix * S} ${480 - iy * S}) scale(${S})`}>
            {Object.entries(MAPA.deps).map(([n, d]) => {
              const es = n === "Izabal";
              return <path key={n} d={d} fill={es ? `rgba(229,72,77,${0.25 + 0.6 * on})` : "#1A4778"} stroke={es && on > 0 ? "#FFB3B5" : C.claro} strokeOpacity={es && on > 0 ? 1 : 0.55} strokeWidth={es && on > 0 ? 3 : 1.4} strokeLinejoin="round" />;
            })}
          </g>
        </g>
        {/* icono de cárcel sobre Izabal */}
        <g transform={`translate(270 470) scale(${pop(f, c("triunfo") - 6)})`}>
          <rect x="-70" y="-50" width="140" height="100" rx="8" fill="#0B1220" stroke={C.claro} strokeWidth="5" />
          {[-45, -15, 15, 45].map((x) => <rect key={x} x={x - 5} y="-50" width="10" height="100" fill={C.claro} />)}
          <path d="M-84 -50 L0 -96 L84 -50 Z" fill="#1F3A5C" stroke={C.claro} strokeWidth="5" />
        </g>
        <text x="270" y="250" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.blanco} letterSpacing="3" opacity={on}>IZABAL</text>
        <text x="270" y="580" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="36" fill={C.blanco} opacity={fade(f, c("triunfo"))}>EL TRIUNFO</text>
      </g>
      {/* avance */}
      <g transform={`translate(800 320) scale(${pop(f, c("avance") - 8)})`}>
        <circle r="110" fill="none" stroke="rgba(127,184,230,0.25)" strokeWidth="24" />
        <circle r="110" fill="none" stroke={AMARILLO} strokeWidth="24" strokeLinecap="round" strokeDasharray={`${691 * 0.23 * av} 691`} transform="rotate(-90)" />
        <text y="18" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="72" fill={C.blanco}>{Math.round(23 * av)}%</text>
        <text y="58" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="2">AVANCE</text>
      </g>
      {pasos.map((p, i) => {
        const kk = P(f, c(p.cue) - 8, 12, outBack);
        return (
          <g key={p.cue} transform={`translate(${lerp(1120, 800, kk)} ${520 + i * 96})`} opacity={Math.min(1, kk * 1.5)}>
            <rect x="-235" y="-40" width="470" height="80" rx="18" fill="rgba(14,44,82,0.94)" stroke={i === 1 ? AMARILLO : C.suave} strokeWidth="3" />
            <text y="-6" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="21" fill={C.blanco} letterSpacing="1">{p.t}</text>
            <text y="24" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="19" fill={i === 1 ? AMARILLO : C.suave} letterSpacing="1.5">{p.sub}</text>
          </g>
        );
      })}
    </Lienzo>
  );
};

/* ---------- 5. Extraditados a EE. UU. por enviar cocaína a Atlanta ---------- */
export const Extraditados: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const vuelo = P(f, c("guate") + 6, 50, inOut);
  const px = lerp(230, 850, vuelo);
  const py = 340 - 170 * Math.sin(Math.PI * vuelo);
  return (
    <Lienzo>
      <g transform={`translate(70 60) scale(${pop(f, 4)})`}><BanderaGT w={150} /></g>
      <text x="145" y="180" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="20" fill={C.blanco} letterSpacing="2" opacity={fade(f, 6)}>GUATEMALTECO</text>
      <g transform={`translate(250 60) scale(${pop(f, 8)})`}><ElSalvador id="ex-sv" w={150} /></g>
      <text x="325" y="180" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="20" fill={C.blanco} letterSpacing="2" opacity={fade(f, 10)}>SALVADOREÑO</text>
      <g transform={`translate(780 40) scale(${pop(f, c("georgia") - 8)})`}><EEUU id="ex-us" w={170} /></g>
      {/* ruta del vuelo */}
      <g opacity={fade(f, c("guate"))}>
        <path d="M230 340 Q540 0 850 340" fill="none" stroke={C.suave} strokeWidth="4" strokeDasharray="10 12" />
        <circle cx="230" cy="340" r="12" fill={C.celeste} />
        <circle cx="850" cy="340" r="12" fill={ROJO} />
        <text x="230" y="385" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.blanco} letterSpacing="2">GUATEMALA</text>
        <text x="850" y="385" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.blanco} letterSpacing="2" opacity={fade(f, c("georgia") - 4)}>ATLANTA, GEORGIA</text>
        <g transform={`translate(${px} ${py - 40}) rotate(${lerp(-40, 40, vuelo)})`}>
          <path d="M-34 0 L30 -6 Q42 0 30 6 Z M-6 -2 L-20 -30 L-10 -30 L12 -3 Z M-6 2 L-20 30 L-10 30 L12 3 Z M-30 0 L-40 -14 L-34 -14 L-22 -1 Z" fill={C.claro} transform="scale(1.4)" />
        </g>
      </g>
      {/* paquetes de droga */}
      {Array.from({ length: 6 }).map((_, i) => {
        const kk = pop(f, c("libras") - 8 + i * 2);
        const x = 110 + (i % 3) * 92 + (i >= 3 ? 46 : 0);
        const y = i >= 3 ? 560 : 625;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${kk})`} opacity={Math.min(1, kk * 1.5)}>
            <rect x="-44" y="-30" width="88" height="60" rx="10" fill="#E9E3D2" stroke="#A89F86" strokeWidth="3" />
            <path d="M-44 -6 H44 M-10 -30 V30" stroke="#A89F86" strokeWidth="3" />
          </g>
        );
      })}
      <Cifra x={240} y={740} valor={`${cuenta(f, c("libras") - 6, 330, 18)} LIBRAS`} rotulo="" k={P(f, c("libras") - 8, 12, outBack)} size={64} />
      <Chip x={790} y={510} texto="RED «LOS POCHOS»" k={pop(f, c("pochos") - 6)} color={AMARILLO} size={24} />
      <Chip x={790} y={600} texto="DESTINO: ATLANTA" k={pop(f, c("atlanta") - 8)} size={22} />
      <Chip x={790} y={690} texto="SIN DERECHO A FIANZA" k={pop(f, c("fianza") - 8)} color={ROJO} size={22} />
    </Lienzo>
  );
};

/* ---------- 6. Illescas no buscará la reelección y deja Raíces ---------- */
export const Illescas: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = pop(f, 4, 16);
  const tacha = P(f, c("reeleccion") + 2, 12);
  const sale = P(f, c("raices") - 6, 24, inOut);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "illescas.png"} id="illescas" x={0} y={290} w={590} h={438} k={k} opacity={Math.min(1, k * 2)} />
      {/* urna con X */}
      <g transform={`translate(830 150) scale(${pop(f, c("reeleccion") - 8)})`}>
        <rect x="-90" y="-60" width="180" height="140" rx="14" fill={C.grisClaro} stroke={C.claro} strokeWidth="4" />
        <rect x="-50" y="-74" width="100" height="18" rx="6" fill={C.marino} />
        <path d="M-20 -110 h40 v50 h-40 z" fill={C.celeste} />
        <text y="40" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.marino}>2027</text>
        <g opacity={tacha} stroke={ROJO} strokeWidth="16" strokeLinecap="round">
          <line x1={-100 * tacha} y1={-90 * tacha} x2={100 * tacha} y2={90 * tacha} />
          <line x1={100 * tacha} y1={-90 * tacha} x2={-100 * tacha} y2={90 * tacha} />
        </g>
      </g>
      <Chip x={830} y={330} texto="NO BUSCARÁ REELECCIÓN" k={pop(f, c("reeleccion") + 4)} color={ROJO} size={22} />
      {/* sale de Raíces */}
      <g transform={`translate(830 450) scale(${pop(f, c("raices") - 10)})`}>
        <rect x="-180" y="-40" width="230" height="80" rx="18" fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="3" />
        <text x="-65" y="12" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="38" fill={C.blanco}>RAÍCES</text>
        <g transform={`translate(${lerp(80, 130, sale)} 0)`} opacity={1 - sale * 0.3}>
          <circle cy="-22" r="12" fill={AMARILLO} />
          <path d="M-18 16 a18 20 0 0 1 36 0 z" fill={AMARILLO} />
          <path d="M-40 0 h-24 m8 -10 l-10 10 l10 10" stroke={AMARILLO} strokeWidth="5" fill="none" transform="scale(-1 1) translate(-8 0)" />
        </g>
      </g>
      <Chip x={830} y={560} texto="SE SEPARA DEL PARTIDO" k={pop(f, c("raices") + 2)} size={21} />
      <Chip x={830} y={660} texto="INDEPENDIENTE" k={pop(f, c("independencia") - 6)} color={C.menta} size={22} />
      <Chip x={830} y={745} texto="LEY DE AISLAMIENTO PENITENCIARIO" k={pop(f, c("ley") - 6)} size={16} />
    </Lienzo>
  );
};

export const VIZ_NACIONAL_7: Record<string, React.FC<VizProps>> = {
  villedacidh: VilledaCIDH,
  camarascorporales: CamarasCorporales,
  bonopolicias: BonoPolicias,
  carceltriunfo: CarcelTriunfo,
  extraditados: Extraditados,
  illescas: Illescas,
};
