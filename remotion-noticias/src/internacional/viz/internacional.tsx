import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Alemania, Canada, EEUU, Francia, Iran as BanderaIran, Italia, Japon, ReinoUnido, Rusia, Ucrania } from "./banderas";

/** c(nombre): cuadro local en que se pronuncia la palabra clave. dur: duración de la escena. */
export type VizProps = { c: (nombre: string) => number; dur: number };

// Lienzo 1080×800 centrado en el círculo del escenario (centro del lienzo = centro del círculo).
const Lienzo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={800} viewBox="0 0 1080 800" style={{ overflow: "visible" }}>{children}</svg>
);

const pop = (f: number, at: number, d = 12) => P(f, at, d, outBack);
const fade = (f: number, at: number, d = 8) => P(f, at, d);

/** Foto recortada tipo sticker (borde blanco), con desvanecido inferior si el recorte es plano. */
const Sticker: React.FC<{ src: string; x: number; y: number; w: number; h: number; id: string; k?: number; opacity?: number; fadeBottom?: boolean }> = ({ src, x, y, w, h, id, k = 1, opacity = 1, fadeBottom }) => (
  <g opacity={opacity} transform={`translate(${x + w / 2} ${y + h}) scale(${k}) translate(${-w / 2} ${-h})`}>
    {fadeBottom && (
      <defs>
        <linearGradient id={`fg-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0.82" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <mask id={`fm-${id}`}><rect width={w} height={h} fill={`url(#fg-${id})`} /></mask>
      </defs>
    )}
    <image href={staticFile(src)} width={w} height={h} mask={fadeBottom ? `url(#fm-${id})` : undefined} filter="drop-shadow(0 14px 26px rgba(0,0,0,0.45))" />
  </g>
);

/** Cifra grande + rótulo mono, como en el video de referencia. */
const Cifra: React.FC<{ x: number; y: number; valor: string; rotulo: string; k: number; size?: number }> = ({ x, y, valor, rotulo, k, size = 150 }) => (
  <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k})`} opacity={Math.min(1, k * 1.5)}>
    <text textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize={size} fill={C.claro} style={{ letterSpacing: "-0.02em" }}>{valor}</text>
    <text y={size * 0.42} textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize={30} fill={C.suave} letterSpacing="3">{rotulo}</text>
  </g>
);

/* ---------- 1. Rusia–Ucrania negocian en Abu Dabi con mediación de EE. UU. ---------- */
export const Negociacion: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const entra = P(f, c("banderas"), 16, outCubic);
  const acerca = P(f, c("mesa"), 20, inOut);
  const usa = pop(f, c("usa"));
  const xR = lerp(-260, lerp(150, 230, acerca), entra);
  const xU = lerp(1340, lerp(690, 610, acerca), entra);
  const iconos: { at: string; d: React.ReactNode; x: number }[] = [
    { at: "seguridad", x: 390, d: <path d="M0 -30 L26 -20 V2 Q26 24 0 34 Q-26 24 -26 2 V-20 Z" fill="none" stroke={C.marino} strokeWidth="7" strokeLinejoin="round" /> },
    { at: "tension", x: 540, d: <path d="M0 -28 V24 M-20 6 L0 26 L20 6" fill="none" stroke={C.marino} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /> },
    { at: "fin", x: 690, d: <path d="M-26 6 Q-6 -24 22 -18 Q8 -12 10 0 Q22 8 30 2 Q20 22 -4 18 L-20 30 L-16 14 Q-24 12 -26 6 Z" fill={C.marino} /> },
  ];
  return (
    <Lienzo>
      {/* mesa */}
      <g opacity={fade(f, c("mesa"))}>
        <ellipse cx="540" cy="520" rx="330" ry="58" fill="#12345E" stroke={C.celeste} strokeWidth="4" />
        <rect x="250" y="520" width="580" height="18" fill="#0E2B50" />
      </g>
      {/* líneas de mediación */}
      <path d={`M540 170 L${xR + 120} 330 M540 170 L${xU + 120} 330`} stroke={C.celeste} strokeWidth="4" strokeDasharray="10 10" opacity={usa * 0.8} strokeDashoffset={-f} />
      <g transform={`translate(${xR} 300)`}><Rusia id="neg-ru" w={240} /></g>
      <g transform={`translate(${xU} 300)`}><Ucrania id="neg-ua" w={240} /></g>
      <g transform={`translate(540 150) scale(${usa}) translate(-80 -42)`}><EEUU id="neg-us" w={160} /></g>
      {iconos.map((ic) => {
        const k = pop(f, c(ic.at));
        return (
          <g key={ic.at} transform={`translate(${ic.x} 640) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
            <circle r="52" fill={C.suave} />
            <circle r="60" fill="none" stroke={C.suave} strokeOpacity="0.35" strokeWidth="3" />
            {ic.d}
          </g>
        );
      })}
    </Lienzo>
  );
};

/* ---------- 2. León XIV: gira por Sudamérica ---------- */
export const Papa: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const zoom = 1 + 0.04 * P(f, 0, 400, inOut);
  const fieles = P(f, c("fieles"), 26, outCubic);
  const ruta = P(f, c("cordoba"), 20, inOut);
  const peru = pop(f, c("peru"));
  const paradas = [
    { n: "BUENOS AIRES", y: 330, at: c("gira") },
    { n: "CÓRDOBA", y: 440, at: c("cordoba") },
    { n: "PERÚ", y: 550, at: c("peru") },
  ];
  return (
    <Lienzo>
      <Sticker src="fotos/2026-11-10/papa.png" id="papa" x={30} y={170} w={560} h={539} k={k * zoom} opacity={Math.min(1, k * 2)} />
      <Cifra x={790} y={150} valor={`${(2.5 * fieles).toFixed(1)} M`} rotulo="FIELES EN BUENOS AIRES" k={P(f, c("fieles") - 4, 12, outBack)} size={130} />
      {/* itinerario */}
      <line x1="640" y1="330" x2="640" y2={330 + 220 * Math.max(ruta * 0.5, peru)} stroke={C.celeste} strokeWidth="5" strokeDasharray="8 10" opacity={fade(f, c("gira"))} />
      {paradas.map((p, i) => {
        const a = pop(f, p.at);
        const activa = i === 0 ? f < c("cordoba") : i === 1 ? f >= c("cordoba") && f < c("peru") : f >= c("peru");
        return (
          <g key={p.n} transform={`translate(640 ${p.y})`} opacity={Math.min(1, a * 1.5)}>
            <circle r={activa ? 18 : 12} fill={activa ? C.celeste : C.suave} transform={`scale(${a})`} />
            {activa && <circle r={18 + 14 * ((f % 30) / 30)} fill="none" stroke={C.celeste} strokeWidth="3" opacity={1 - (f % 30) / 30} />}
            <text x="36" y="11" fontFamily={F.mono} fontWeight={800} fontSize="30" fill={activa ? C.blanco : C.suave} letterSpacing="2">{p.n}</text>
          </g>
        );
      })}
    </Lienzo>
  );
};

/* ---------- 3. Mensajes cruzados sobre Irán ---------- */
export const IranMensajes: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const rubio = P(f, c("rubio"), 16, outCubic);
  const gano = pop(f, c("gano"));
  const est = P(f, c("estancadas"), 20, outCubic);
  const iran = pop(f, c("iran"));
  const atenuaTrump = lerp(1, 0.35, rubio);
  return (
    <Lienzo>
      <Sticker src="fotos/2026-11-10/trump.png" id="trump" x={330} y={250} w={700} h={466} k={k} opacity={Math.min(1, k * 2) * atenuaTrump} fadeBottom />
      {/* «VICTORIA» de Trump */}
      <g transform={`translate(270 190) scale(${gano})`} opacity={Math.min(1, gano * 1.5) * (1 - rubio)}>
        <rect x="-195" y="-48" width="390" height="96" rx="48" fill={C.celeste} />
        <circle cx="-133" cy="0" r="30" fill={C.marino} />
        <path d="M-147 1 l10 11 l20 -22" fill="none" stroke={C.celeste} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <text x="-88" y="16" textAnchor="start" fontFamily={F.exo} fontWeight={900} fontSize="46" fill={C.marino}>VICTORIA</text>
      </g>
      {/* Tarjeta de Rubio (avatar genérico sin rostro) */}
      <g transform={`translate(${lerp(-420, 110, rubio)} 170)`} opacity={rubio}>
        <rect width="440" height="230" rx="28" fill="rgba(14,44,82,0.92)" stroke={C.suave} strokeOpacity="0.6" strokeWidth="2.5" />
        <circle cx="80" cy="82" r="48" fill="#1A4778" stroke={C.suave} strokeWidth="3" />
        <circle cx="80" cy="68" r="17" fill={C.suave} />
        <path d="M50 112 a30 26 0 0 1 60 0 z" fill={C.suave} />
        <text x="150" y="74" fontFamily={F.exo} fontWeight={800} fontSize="38" fill={C.blanco}>Marco Rubio</text>
        <text x="150" y="110" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="1.5">SECRETARIO DE ESTADO</text>
        {/* barra de «negociaciones» que se queda atascada */}
        <text x="30" y="170" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="1.5">NEGOCIACIONES</text>
        <rect x="30" y="184" width="380" height="18" rx="9" fill="rgba(127,184,230,0.18)" />
        <rect x="30" y="184" width={380 * lerp(0, 0.22, est) + Math.sin(f / 3) * 3 * est} height="18" rx="9" fill="#F2B544" />
        <text x="410" y="170" textAnchor="end" fontFamily={F.exo} fontWeight={900} fontSize="24" fill="#F2B544" opacity={est}>ESTANCADAS</text>
      </g>
      {/* Irán niega conversaciones */}
      <g transform={`translate(150 470) scale(${iran})`} opacity={Math.min(1, iran * 1.5)}>
        <BanderaIran id="iran" w={230} />
        <g transform="translate(230 0)">
          <circle r="40" fill="#E5484D" />
          <path d="M-16 -16 L16 16 M16 -16 L-16 16" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
        </g>
      </g>
    </Lienzo>
  );
};

/* ---------- 4. Caravana migrante: de Centroamérica a EE. UU. ---------- */
export const Caravana: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const pts: [number, number][] = [[880, 700], [790, 610], [680, 520], [600, 330], [700, 110]];
  const nombres = ["HONDURAS", "GUATEMALA", "TAPACHULA", "MÉXICO", "EE. UU."];
  const traza = P(f, c("caravana"), 70, inOut);
  // longitud acumulada de la ruta
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const at = (u: number): [number, number] => {
    let d = u * total;
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i]) { const t = d / seg[i]; return [lerp(pts[i][0], pts[i + 1][0], t), lerp(pts[i][1], pts[i + 1][1], t)]; }
      d -= seg[i];
    }
    return pts[pts.length - 1];
  };
  const d = "M" + pts.map((p) => p.join(" ")).join(" L");
  const resaltar = (i: number) => (i === 1 ? f >= c("guatemala") : i === 2 ? f >= c("tapachula") && f < c("eeuu") + 30 : i === 4 ? f >= c("eeuu") : false);
  const visibleNodo = (i: number) => (i === 2 ? c("tapachula") : i === 4 ? c("eeuu") : i === 1 ? c("guatemala") - 40 : c("caravana") + i * 6);
  const n = Math.round(interpolate(f, [c("cifra"), c("cifra") + 26], [0, 2000], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));
  return (
    <Lienzo>
      <path d={d} fill="none" stroke="rgba(127,184,230,0.25)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity={fade(f, c("caravana"))} />
      <path d={d} fill="none" stroke={C.celeste} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={total} strokeDashoffset={total * (1 - traza)} />
      {/* personas que avanzan por la ruta */}
      {Array.from({ length: 14 }).map((_, i) => {
        const u = ((f - c("caravana")) / 260 + i / 14) % 1;
        if (f < c("caravana") + 10 || u > traza) return null;
        const [x, y] = at(u);
        return <circle key={i} cx={x} cy={y} r="7" fill={C.claro} opacity={0.9} />;
      })}
      {pts.map((p, i) => {
        const a = pop(f, visibleNodo(i));
        const on = resaltar(i);
        const izq = i === 3 || i === 2;
        return (
          <g key={i} transform={`translate(${p[0]} ${p[1]})`} opacity={Math.min(1, a * 1.5)}>
            <circle r={on ? 16 : 10} fill={on ? C.celeste : C.suave} />
            {on && <circle r={16 + 14 * ((f % 30) / 30)} fill="none" stroke={C.celeste} strokeWidth="3" opacity={1 - (f % 30) / 30} />}
            <text x={izq ? -28 : 28} y="10" textAnchor={izq ? "end" : "start"} fontFamily={F.mono} fontWeight={800} fontSize={on ? 30 : 24} fill={on ? C.blanco : C.suave} letterSpacing="2">{nombres[i]}</text>
          </g>
        );
      })}
      <Cifra x={270} y={230} valor={n.toLocaleString("en-US")} rotulo="MIGRANTES" k={P(f, c("cifra") - 4, 12, outBack)} size={140} />
    </Lienzo>
  );
};

/* ---------- 5. G7 en París ---------- */
const TorreEiffel: React.FC = () => (
  <g fill="none" stroke={C.claro} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
    <path d="M0 -230 L0 -200 M-12 -200 H12 L30 -40 H-30 Z" />
    <path d="M-30 -40 H30 M-40 -40 H40 L70 60 H-70 Z" />
    <path d="M-70 60 L-120 190 M70 60 L120 190 M-120 190 H-60 Q0 100 60 190 H120" />
    <path d="M-18 -150 H18 M-24 -100 H24 M-55 10 H55" opacity="0.7" />
  </g>
);

export const G7: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const torre = P(f, 4, 18, outBack);
  const banderas = [Canada, Francia, Alemania, Italia, Japon, ReinoUnido, EEUU];
  const pulso = f >= c("economias") ? 1 + 0.06 * Math.sin(((f - c("economias")) / 30) * Math.PI * 2) : 1;
  const temas = [
    { t: "UCRANIA", at: c("temas"), x: 330 },
    { t: "MEDIO ORIENTE", at: c("temas") + 14, x: 720 },
  ];
  return (
    <Lienzo>
      <g transform={`translate(540 440) scale(${torre * 0.9})`} opacity={Math.min(1, torre * 2)}><TorreEiffel /></g>
      {banderas.map((Bd, i) => {
        const ang = -Math.PI / 2 + ((i - 3) * Math.PI) / 4.2;
        const x = 540 + Math.cos(ang) * 300, y = 400 + Math.sin(ang) * 230;
        const k = pop(f, c("g7") + i * 3) * pulso;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${k}) translate(-60 -35)`} opacity={Math.min(1, k * 1.5)}>
            <Bd id={`g7-${i}`} w={120} />
          </g>
        );
      })}
      {temas.map((t) => {
        const k = pop(f, t.at);
        return (
          <g key={t.t} transform={`translate(${t.x} 690) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
            <rect x={-t.t.length * 13 - 26} y="-30" width={t.t.length * 26 + 52} height="60" rx="30" fill="rgba(14,44,82,0.92)" stroke={C.suave} strokeWidth="2.5" />
            <text y="11" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.blanco} letterSpacing="2">{t.t}</text>
          </g>
        );
      })}
    </Lienzo>
  );
};

/* ---------- Globo terráqueo para el resumen internacional ---------- */
export const Globo: React.FC<{ size?: number }> = ({ size = 180 }) => {
  const f = useCurrentFrame();
  const r = size / 2;
  const rot = (f * 1.2) % 60;
  return (
    <svg width={size + 8} height={size + 8} viewBox={`${-r - 4} ${-r - 4} ${size + 8} ${size + 8}`}>
      <defs><clipPath id="globo-clip"><circle r={r} /></clipPath></defs>
      <circle r={r} fill="#12345E" stroke={C.celeste} strokeWidth="4" />
      <g clipPath="url(#globo-clip)" fill="none" stroke={C.suave} strokeWidth="2.5" opacity="0.8">
        {[-0.6, -0.3, 0, 0.3, 0.6].map((k) => <ellipse key={k} cx="0" cy={k * r} rx={r * Math.sqrt(1 - k * k)} ry="0.1" />)}
        {[-60, 0, 60, 120].map((o) => {
          const ph = ((o + rot) / 180) * Math.PI;
          return <ellipse key={o} cx="0" cy="0" rx={Math.abs(Math.cos(ph)) * r} ry={r} />;
        })}
      </g>
    </svg>
  );
};

export const VIZ_INTERNACIONAL: Record<string, React.FC<VizProps>> = {
  negociacion: Negociacion,
  papa: Papa,
  iran: IranMensajes,
  caravana: Caravana,
  g7: G7,
};
