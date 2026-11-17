import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { MAPA } from "./nacional3";

// Ilustraciones de la edición nacional del 17 nov 2026.
const FOTOS = "fotos/2026-11-17/";
const cuenta = (f: number, at: number, hasta: number, d = 22) =>
  Math.round(interpolate(f, [at, at + d], [0, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));
/** Entra en `a`, sale en `b` (crossfade entre fases). */
const fase = (f: number, a: number, b: number) => Math.min(P(f, a, 10), 1 - P(f, b, 10));

const Chip: React.FC<{ x: number; y: number; texto: string; k: number; color?: string; size?: number }> = ({ x, y, texto, k, color = C.blanco, size = 26 }) => {
  const w = texto.length * size * 0.66 + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-size - 4} width={w} height={size * 2 + 8} rx={size + 4} fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="2.5" />
      <text y={size * 0.36} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize={size} fill={color} letterSpacing="1.5">{texto}</text>
    </g>
  );
};

/** Logo sobre tarjeta blanca. */
const LogoCard: React.FC<{ src: string; x: number; y: number; w: number; h: number; k: number; pad?: number }> = ({ src, x, y, w, h, k, pad = 16 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <rect x={-w / 2 - pad} y={-h / 2 - pad} width={w + pad * 2} height={h + pad * 2} rx="22" fill="#FFFFFF" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
    <image href={staticFile(src)} x={-w / 2} y={-h / 2} width={w} height={h} />
  </g>
);

/** Mapa de Guatemala con varios departamentos resaltados (color y borde configurables). */
const Mapa: React.FC<{ resaltar: string[]; on: (d: string) => number; color: string; borde: string }> = ({ resaltar, on, color, borde }) => (
  <g>
    {Object.entries(MAPA.deps).map(([n, d]) => {
      const k = resaltar.includes(n) ? on(n) : 0;
      return (
        <path key={n} d={d} fill={k > 0 ? `rgba(${color},${0.25 + 0.6 * k})` : "#1A4778"} stroke={k > 0 ? borde : C.claro}
          strokeOpacity={k > 0 ? 1 : 0.55} strokeWidth={k > 0 ? 3 : 1.4} strokeLinejoin="round" />
      );
    })}
  </g>
);

/* ---------- 1. Arévalo sanciona la Ley Marco de Ciberseguridad ---------- */
const Candado: React.FC<{ abierto: number }> = ({ abierto }) => (
  <g>
    <path d={`M-48 -20 V-62 A48 48 0 0 1 48 -62 V${-20 - abierto * 40}`} fill="none" stroke={C.claro} strokeWidth="18" strokeLinecap="round" />
    <rect x="-78" y="-26" width="156" height="128" rx="20" fill={C.celeste} stroke={C.claro} strokeWidth="5" />
    <circle cy="28" r="15" fill={C.marinoOsc} />
    <rect x="-6" y="30" width="12" height="34" rx="5" fill={C.marinoOsc} />
  </g>
);
export const Ciberseguridad: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const a = 1 - P(f, c("acceso") - 14, 10); // fase A: presidente + candado
  const b = fase(f, c("acceso") - 8, c("empresas") - 10); // fase B: delitos + 8 años
  const d = P(f, c("empresas") - 4, 10); // fase C: multa, fiscalía, vigencia
  const k = pop(f, 4, 16);
  const cerrar = P(f, c("ley") - 10, 14, outBack);
  return (
    <Lienzo>
      {/* Fase A */}
      <g opacity={a}>
        <Sticker src={FOTOS + "presidente.png"} id="pres" x={10} y={220} w={540} h={456} k={k} opacity={Math.min(1, k * 2)} />
        <g transform={`translate(830 300) scale(${pop(f, 10, 14)})`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <text key={i} x={-150 + i * 60} y={-150 + ((f * 3 + i * 47) % 120)} fontFamily={F.mono} fontWeight={700} fontSize="26" fill={C.suave} opacity={0.5} textAnchor="middle">{(i + Math.floor(f / 6)) % 2 ? "1" : "0"}</text>
          ))}
          <Candado abierto={1 - cerrar} />
          <circle r="150" fill="none" stroke={C.celeste} strokeWidth="4" strokeDasharray="14 16" transform={`rotate(${f * 1.2})`} opacity="0.7" />
        </g>
        <Chip x={830} y={540} texto="DECRETO 26-2026" k={pop(f, c("ley") - 6)} color="#F2B544" size={24} />
        <Chip x={830} y={620} texto="SANCIONADA" k={pop(f, c("ley") + 2)} color="#5CCB9B" size={24} />
      </g>
      {/* Fase B */}
      <g opacity={b}>
        {([["acceso", "ACCESO ILÍCITO"], ["intercepta", "INTERCEPTACIÓN DE DATOS"], ["fraude", "FRAUDE INFORMÁTICO"]] as const).map(([cue, t], i) => {
          const kk = P(f, c(cue) - 6, 12, outBack);
          return (
            <g key={cue} transform={`translate(${lerp(-200, 60, kk)} ${170 + i * 130})`} opacity={Math.min(1, kk * 1.5)}>
              <rect width="560" height="96" rx="20" fill="rgba(14,44,82,0.94)" stroke="#E5484D" strokeWidth="3" />
              <circle cx="52" cy="48" r="26" fill="#E5484D" />
              <text x="52" y="58" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="30" fill={C.blanco}>!</text>
              <text x="100" y="58" fontFamily={F.mono} fontWeight={800} fontSize="25" fill={C.blanco} letterSpacing="1">{t}</text>
            </g>
          );
        })}
        <Cifra x={840} y={380} valor={`${cuenta(f, c("anios") - 6, 8, 14)} AÑOS`} rotulo="DE PRISIÓN (MÁX.)" k={P(f, c("anios") - 8, 12, outBack)} size={110} />
        {/* barrotes */}
        <g opacity={P(f, c("anios"), 12)} transform="translate(840 560)">
          {[-90, -45, 0, 45, 90].map((x, i) => <rect key={x} x={x - 7} y={lerp(-60, 0, P(f, c("anios") + i * 2, 10))} width="14" height="110" rx="6" fill={C.suave} />)}
          <rect x="-120" y="-8" width="240" height="14" rx="6" fill={C.claro} />
        </g>
      </g>
      {/* Fase C */}
      <g opacity={d}>
        <Cifra x={300} y={240} valor={`Q${cuenta(f, c("multa") - 6, 300, 18)} MIL`} rotulo="" k={P(f, c("multa") - 8, 12, outBack)} size={96} />
        <Chip x={300} y={320} texto="MULTA MÁX. A EMPRESAS" k={pop(f, c("multa") - 2)} size={22} />
        <LogoCard src={FOTOS + "logo-mp.png"} x={300} y={520} w={240} h={150} k={pop(f, c("fiscalia") - 10)} />
        <Chip x={300} y={680} texto="FISCALÍA ESPECIALIZADA" k={pop(f, c("fiscalia") - 2)} size={22} />
        {/* calendario de vigencia */}
        <g transform={`translate(800 420) scale(${pop(f, c("dias") - 10)})`}>
          <rect x="-150" y="-170" width="300" height="300" rx="26" fill={C.grisClaro} filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
          <rect x="-150" y="-170" width="300" height="80" rx="26" fill="#E5484D" />
          <rect x="-150" y="-110" width="300" height="20" fill="#E5484D" />
          <text y="-116" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.blanco} letterSpacing="3">VIGENCIA</text>
          <text y="40" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="130" fill={C.marino}>{cuenta(f, c("dias") - 4, 30, 18)}</text>
          <text y="100" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="30" fill={C.marino} letterSpacing="3">DÍAS</text>
        </g>
      </g>
    </Lienzo>
  );
};

/* ---------- 2. TSE define el perfil de las juntas electorales departamentales ---------- */
export const JuntasTSE: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const logo = pop(f, 6, 16);
  const deps = Object.keys(MAPA.deps);
  const birrete = pop(f, c("titulo") - 8, 14);
  return (
    <Lienzo>
      <LogoCard src={FOTOS + "logo-tse.png"} x={540} y={110} w={300} h={149} k={logo} />
      {/* mapa: se encienden las 22 juntas */}
      <g transform={`translate(40 230) scale(0.82)`} opacity={fade(f, c("juntas") - 10)}>
        <Mapa resaltar={deps} on={(d) => P(f, c("juntas") - 6 + deps.indexOf(d) * 1.2, 8)} color="31,182,255" borde={C.claro} />
      </g>
      <Chip x={290} y={770} texto="22 JUNTAS + DISTRITO CENTRAL" k={pop(f, c("juntas") + 20)} size={19} />
      {/* derecha: elecciones 2027 + título universitario */}
      <g transform={`translate(810 330) scale(${pop(f, c("elecciones") - 8)})`}>
        <rect x="-60" y="-40" width="120" height="100" rx="10" fill={C.grisClaro} />
        <rect x="-40" y="-52" width="80" height="14" rx="5" fill={C.marino} />
        <path d={`M-14 ${-60 - 30 * (1 - P(f, c("elecciones"), 14))} h28 v40 h-28 z`} fill={C.celeste} />
        <text y="30" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.marino}>VOTO</text>
        <text y="120" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="56" fill={C.claro}>2027</text>
      </g>
      <g transform={`translate(810 560) scale(${birrete})`} opacity={Math.min(1, birrete * 1.5)}>
        <path d="M0 -60 L110 -20 L0 20 L-110 -20 Z" fill={C.celeste} stroke={C.claro} strokeWidth="4" />
        <path d="M-64 0 V44 Q0 74 64 44 V0 L0 20 Z" fill="#1F3A5C" stroke={C.claro} strokeWidth="4" />
        <path d={`M100 -16 V${30 + Math.sin(f / 6) * 4}`} stroke="#F2B544" strokeWidth="5" />
        <circle cx="100" cy={34 + Math.sin(f / 6) * 4} r="9" fill="#F2B544" />
      </g>
      <Chip x={810} y={680} texto="TÍTULO UNIVERSITARIO" k={pop(f, c("titulo") - 2)} color="#F2B544" size={21} />
      <Chip x={810} y={760} texto="CONVOCATORIA: DICIEMBRE" k={pop(f, c("diciembre") - 8)} color="#5CCB9B" size={19} />
    </Lienzo>
  );
};

/* ---------- 3. Mingob, MEM y MP mapean la minería ilegal en Izabal ---------- */
const Gema: React.FC<{ color: string; borde: string }> = ({ color, borde }) => (
  <g>
    <path d="M-34 -14 L-18 -34 H18 L34 -14 L0 34 Z" fill={color} stroke={borde} strokeWidth="4" strokeLinejoin="round" />
    <path d="M-34 -14 H34 M-18 -34 L-8 -14 L0 34 M18 -34 L8 -14 L0 34" fill="none" stroke={borde} strokeWidth="2.5" />
  </g>
);
export const MineriaIzabal: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const on = P(f, c("izabal") - 10, 14);
  const radar = (f * 3) % 360;
  const S = 1.15, MX = 40, MY = 160;
  const [ix, iy] = MAPA.centros["Izabal"];
  const pts: [number, number, "jade" | "oro"][] = [[ix - 40, iy - 20, "jade"], [ix + 30, iy + 25, "oro"], [ix - 10, iy + 40, "jade"], [ix + 45, iy - 30, "oro"], [ix - 60, iy + 15, "oro"]];
  return (
    <Lienzo>
      {/* logos de las tres instituciones */}
      <LogoCard src={FOTOS + "logo-mingob.png"} x={185} y={100} w={260} h={103} k={pop(f, c("mingob") - 10)} pad={12} />
      <LogoCard src={FOTOS + "logo-mem.png"} x={540} y={100} w={282} h={99} k={pop(f, c("mem") - 10)} pad={12} />
      <LogoCard src={FOTOS + "logo-mp.png"} x={880} y={100} w={150} h={94} k={pop(f, c("mp") - 10)} pad={12} />
      {/* mapa ampliado al oriente con Izabal */}
      <g opacity={fade(f, c("mp") - 6)}>
        <defs><clipPath id="clipmin"><rect x="20" y="200" width="600" height="580" rx="24" /></clipPath></defs>
        <rect x="20" y="200" width="600" height="580" rx="24" fill="rgba(4,18,42,0.6)" stroke={C.suave} strokeWidth="2" />
        <g style={{ clipPath: "url(#clipmin)" }}>
          <g transform={`translate(${MX - (ix - 260) * S} ${MY + 300 - iy * S}) scale(${S})`}>
            <Mapa resaltar={["Izabal"]} on={() => on} color="92,203,155" borde="#B9F5D8" />
            <g transform={`translate(${ix} ${iy})`} opacity={on}>
              <path d={`M0 0 L${Math.cos((radar * Math.PI) / 180) * 140} ${Math.sin((radar * Math.PI) / 180) * 140} A140 140 0 0 0 ${Math.cos(((radar - 40) * Math.PI) / 180) * 140} ${Math.sin(((radar - 40) * Math.PI) / 180) * 140} Z`} fill="rgba(92,203,155,0.28)" />
              <circle r="140" fill="none" stroke="#5CCB9B" strokeWidth="2" strokeDasharray="6 8" />
            </g>
            {pts.map(([x, y, t], i) => {
              const at = c(t === "jade" ? "jade" : "oro") - 6 + i * 3;
              const kk = pop(f, at);
              return (
                <g key={i} transform={`translate(${x} ${y}) scale(${kk * 0.5})`} opacity={Math.min(1, kk * 1.5)}>
                  <Gema color={t === "jade" ? "#3FAE7A" : "#F2B544"} borde={t === "jade" ? "#B9F5D8" : "#FFF0C2"} />
                </g>
              );
            })}
          </g>
        </g>
        <text x="320" y="250" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.blanco} letterSpacing="3" opacity={on}>IZABAL</text>
      </g>
      {/* leyenda jade / oro */}
      {([["jade", "JADE", "#3FAE7A", "#B9F5D8", 250], ["oro", "ORO", "#F2B544", "#FFF0C2", 360]] as const).map(([cue, t, col, bor, y]) => {
        const kk = pop(f, c(cue) - 4);
        return (
          <g key={cue} transform={`translate(700 ${y}) scale(${kk})`} opacity={Math.min(1, kk * 1.5)}>
            <g transform="scale(0.8)"><Gema color={col} borde={bor} /></g>
            <text x="50" y="12" fontFamily={F.exo} fontWeight={900} fontSize="44" fill={C.blanco}>{t}</text>
            <text x="50" y="44" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="2">EXTRACCIÓN ILEGAL</text>
          </g>
        );
      })}
      {/* cómo intervendrán */}
      {([["estado", "TERRENOS DEL ESTADO", "INTERVENCIÓN DIRECTA", "#5CCB9B", 520], ["privadas", "PROPIEDAD PRIVADA", "ORDEN JUDICIAL", "#F2B544", 680]] as const).map(([cue, t1, t2, col, y]) => {
        const kk = P(f, c(cue) - 8, 12, outBack);
        return (
          <g key={cue} transform={`translate(${lerp(1100, 850, kk)} ${y})`} opacity={Math.min(1, kk * 1.5)}>
            <rect x="-200" y="-62" width="400" height="124" rx="20" fill="rgba(14,44,82,0.94)" stroke={col} strokeWidth="3" />
            <text y="-14" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.suave} letterSpacing="1.5">{t1}</text>
            <text y="30" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="25" fill={col} letterSpacing="1.5">→ {t2}</text>
          </g>
        );
      })}
    </Lienzo>
  );
};

/* ---------- 4. MAGA: frío en siete departamentos ---------- */
const SIETE = ["Huehuetenango", "San Marcos", "Quezaltenango", "Totonicapán", "Sololá", "Quiché", "Chimaltenango"];
const Copo: React.FC<{ r?: number }> = ({ r = 16 }) => (
  <g stroke={C.blanco} strokeWidth={r / 6} strokeLinecap="round">
    {[0, 60, 120].map((a) => <line key={a} x1={-r} y1="0" x2={r} y2="0" transform={`rotate(${a})`} />)}
  </g>
);
export const FrioMaga: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const baja = P(f, c("temp") - 6, 40, inOut);
  const S = 1.6, MX = 150, MY = -200;
  return (
    <Lienzo>
      <LogoCard src={FOTOS + "logo-maga.png"} x={540} y={80} w={300} h={116} k={pop(f, c("maga") - 10)} pad={12} />
      {/* mapa ampliado al occidente */}
      <defs><clipPath id="clipfrio"><rect x="20" y="180" width="660" height="600" rx="24" /></clipPath></defs>
      <rect x="20" y="180" width="660" height="600" rx="24" fill="rgba(4,18,42,0.6)" stroke={C.suave} strokeWidth="2" opacity={fade(f, 6)} />
      <g style={{ clipPath: "url(#clipfrio)" }} opacity={fade(f, 6)}>
        <g transform={`translate(${MX} ${MY}) scale(${S})`}>
          <Mapa resaltar={SIETE} on={(d) => P(f, c("huehue") - 6 + SIETE.indexOf(d) * 9, 10)} color="31,182,255" borde={C.claro} />
          {SIETE.map((d, i) => {
            const [x, y] = MAPA.centros[d];
            const kk = pop(f, c("huehue") - 4 + i * 9);
            return <g key={d} transform={`translate(${x} ${y}) rotate(${f * 2}) scale(${kk})`} opacity={Math.min(1, kk * 1.5)}><Copo r={12} /></g>;
          })}
        </g>
      </g>
      {/* copos cayendo */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = 40 + ((i * 83) % 640);
        const y = 180 + ((f * (2 + (i % 3)) + i * 61) % 600);
        return <g key={i} transform={`translate(${x} ${y}) rotate(${f * 3 + i * 30})`} opacity={0.5 * fade(f, c("temp") - 6)}><Copo r={7 + (i % 3) * 3} /></g>;
      })}
      {/* termómetro */}
      <g transform={`translate(780 340) scale(${pop(f, c("temp") - 10)})`}>
        <rect x="-26" y="-170" width="52" height="300" rx="26" fill={C.grisClaro} />
        <circle cy="150" r="46" fill={C.celeste} />
        <rect x="-12" y={lerp(-140, 40, baja)} width="24" height={lerp(290, 110, baja)} rx="12" fill={C.celeste} />
        {[-130, -80, -30, 20, 70].map((y) => <line key={y} x1="26" y1={y} x2="44" y2={y} stroke={C.suave} strokeWidth="4" />)}
      </g>
      <Cifra x={950} y={230} valor={`${cuenta(f, c("siete") - 6, 7, 12)}`} rotulo="DEPTOS." k={P(f, c("siete") - 8, 12, outBack)} size={100} />
      {([["mallas", "MALLAS O PLÁSTICOS", 600], ["paja", "PAJA SOBRE EL SUELO", 670], ["ganado", "RESGUARDAR AL GANADO", 740]] as const).map(([cue, t, y]) => (
        <Chip key={cue} x={870} y={y} texto={t} k={pop(f, c(cue) - 6)} color="#5CCB9B" size={18} />
      ))}
    </Lienzo>
  );
};

/* ---------- 5. Hospital Roosevelt: Semana del Cuidado Renal Infantil ---------- */
const Rinon: React.FC = () => (
  <g>
    <path d="M-20 -90 C-90 -100 -110 -20 -95 30 C-80 85 -20 100 -10 50 C-4 20 -40 10 -30 -20 C-22 -45 0 -40 0 -60 C2 -80 -5 -88 -20 -90 Z" fill="#E5484D" stroke="#FFB3B5" strokeWidth="5" />
    <path d="M20 -90 C90 -100 110 -20 95 30 C80 85 20 100 10 50 C4 20 40 10 30 -20 C22 -45 0 -40 0 -60 C-2 -80 5 -88 20 -90 Z" fill="#E5484D" stroke="#FFB3B5" strokeWidth="5" />
  </g>
);
export const RenalRoosevelt: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = pop(f, 4, 16);
  const late = 1 + Math.sin(f / 4) * 0.04;
  const kr = pop(f, c("renal") - 8, 14);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "roosevelt.png"} id="roos" x={50} y={0} w={570} h={382} k={k} opacity={Math.min(1, k * 2)} />
      <g transform={`translate(860 200) scale(${kr * late})`} opacity={Math.min(1, kr * 1.5)}>
        <circle r="150" fill="rgba(229,72,77,0.12)" stroke="#E5484D" strokeWidth="3" strokeDasharray="10 10" transform={`rotate(${f})`} />
        <Rinon />
      </g>
      <Chip x={300} y={460} texto="PRUEBAS GRATUITAS" k={pop(f, c("pruebas") - 6)} color="#5CCB9B" size={24} />
      <Chip x={300} y={545} texto="PREVENCIÓN" k={pop(f, c("pruebas") + 4)} size={24} />
      {/* aviso: sin síntomas */}
      <g transform={`translate(300 680) scale(${pop(f, c("sintomas") - 6)})`}>
        <rect x="-250" y="-56" width="500" height="112" rx="20" fill="rgba(14,44,82,0.94)" stroke="#F2B544" strokeWidth="3" />
        <path d="M-200 26 L-170 -30 L-140 26 Z" fill="#F2B544" />
        <text x="-170" y="18" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="34" fill={C.marinoOsc}>!</text>
        <text x="20" y="-6" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.blanco} letterSpacing="1">SIN SÍNTOMAS HASTA</text>
        <text x="20" y="28" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill="#F2B544" letterSpacing="1">LAS ETAPAS FINALES</text>
      </g>
      <Cifra x={830} y={560} valor={`${cuenta(f, c("sesiones") - 6, 350, 20)}`} rotulo="HEMODIÁLISIS / SEMANA" k={P(f, c("sesiones") - 8, 12, outBack)} size={140} />
      {/* gotas */}
      {Array.from({ length: 5 }).map((_, i) => {
        const u = ((f + i * 9) % 45) / 45;
        return <circle key={i} cx={690 + i * 70} cy={lerp(660, 740, u)} r="8" fill={C.celeste} opacity={(1 - u) * fade(f, c("hemo") - 4)} />;
      })}
    </Lienzo>
  );
};

export const VIZ_NACIONAL_6: Record<string, React.FC<VizProps>> = {
  ciberseguridad: Ciberseguridad,
  juntastse: JuntasTSE,
  mineriaizabal: MineriaIzabal,
  friomaga: FrioMaga,
  renalroosevelt: RenalRoosevelt,
};
