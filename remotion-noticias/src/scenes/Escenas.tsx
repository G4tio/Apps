import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, W, ent, inOut, lerp, outBack, outCubic } from "../theme";
import { Encabezado, Escenario, Fondo, Subtitulos } from "../components";
import { Ilustracion } from "../viz";
import { FECHA_REFERENCIA, FUENTES, NOTICIAS, Noticia as N } from "../data";

/* ---------- Resumen inicial (como en el video de referencia) ---------- */
export const Resumen: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const total = NOTICIAS.length;
  const n = Math.round(lerp(0, total, P(f, 6, 22, outCubic)));
  const k = P(f, 4, 16, outBack);
  return (
    <AbsoluteFill>
      <Fondo glowY={900} />
      <Encabezado seccion="RESUMEN DEL DÍA" n={0} total={total} avance={0} derecha={`${String(total).padStart(2, "0")} NOTICIAS`} />
      <Subtitulos captions={[{ at: 0.2, text: "Estas son las noticias importantes de *Guatemala*" }]} fin={dur} />
      <div style={{
        position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", opacity: P(f, 4, 8),
        transform: `scale(${0.5 + 0.5 * k})`, transformOrigin: "50% 60%",
        fontFamily: F.exo, fontStyle: "italic", fontWeight: 900, fontSize: 520, lineHeight: "440px",
        background: "linear-gradient(180deg, #A8E4FF 0%, #1FB6FF 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
      }}>{n}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1112, textAlign: "center",
        fontFamily: F.mono, fontWeight: 700, fontSize: 44, letterSpacing: "0.12em", color: C.suave, ...ent(f, 14, "up") }}>
        NOTICIAS DE GUATEMALA
      </div>
      <Img src={staticFile("marca/bandera-gt.png")} style={{
        position: "absolute", left: 540 - 150, top: 1182, width: 300, height: 183, borderRadius: 6,
        border: "2px solid rgba(191,234,255,0.6)", boxShadow: "0 10px 26px rgba(0,0,0,0.4)", ...ent(f, 20, "pop", 14),
      }} />
    </AbsoluteFill>
  );
};

/* ---------- Escena de noticia ---------- */
export const Noticia: React.FC<{ noticia: N; n: number; dur: number }> = ({ noticia, n, dur }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fondo glowY={917} />
      <Encabezado seccion={noticia.seccion} n={n} total={NOTICIAS.length} avance={f / dur} />
      <Subtitulos captions={noticia.captions} fin={dur} />
      <Escenario etiqueta={noticia.etiqueta} etiquetaAt={84}>
        <Ilustracion viz={noticia.viz} />
      </Escenario>
    </AbsoluteFill>
  );
};

/* ---------- Recapitulación (§2b-B) ---------- */
const Check = ({ k }: { k: number }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: `scale(${k})` }}>
    <circle cx="30" cy="30" r="30" fill={C.menta} />
    <path d="M17 31 l9 9 l17 -19" fill="none" stroke={C.marino} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Icono = ({ tipo }: { tipo: "campana" | "compartir" | "seguir" }) => {
  const st = { fill: "none", stroke: C.marino, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (tipo === "campana")
    return (<g><path d="M-30 18 V-6 a30 30 0 0 1 60 0 V18 l8 10 H-38 Z" {...st} /><path d="M-10 36 a10 10 0 0 0 20 0" {...st} /></g>);
  if (tipo === "compartir")
    return (<g><path d="M0 12 V-38 M-20 -18 L0 -38 L20 -18" {...st} /><path d="M-30 -2 V30 H30 V-2" {...st} /></g>);
  return (<g><circle cx="-8" cy="-14" r="16" {...st} /><path d="M-40 34 a32 26 0 0 1 64 0" {...st} /><path d="M30 -12 v28 M16 2 h28" {...st} /></g>);
};

export const Recap: React.FC = () => {
  const f = useCurrentFrame();
  const rowH = 86, gap = 17, top0 = 380;
  const rowsBottom = top0 + NOTICIAS.length * rowH + (NOTICIAS.length - 1) * gap;
  const btnCy = rowsBottom + 56 + 84;
  const botones: { tipo: "campana" | "compartir" | "seguir"; label: string; x: number }[] = [
    { tipo: "campana", label: "INFÓRMATE", x: W / 5 },
    { tipo: "compartir", label: "COMPARTE", x: W / 2 },
    { tipo: "seguir", label: "SÍGUENOS", x: (W * 4) / 5 },
  ];
  return (
    <AbsoluteFill>
      <Fondo glowY={800} />
      {NOTICIAS.map((nt, i) => {
        const at = 4 + i * 6;
        return (
          <div key={i} style={{
            position: "absolute", left: 70, width: W - 140, top: top0 + i * (rowH + gap), height: rowH, borderRadius: 34,
            background: "linear-gradient(180deg, rgba(20,56,100,0.75), rgba(10,38,71,0.75))", border: "2px solid rgba(92,203,155,0.45)",
            boxShadow: "0 8px 22px rgba(0,0,0,0.28)", display: "flex", alignItems: "center", padding: "0 13px 0 34px", boxSizing: "border-box",
            ...ent(f, at, "left", 12),
          }}>
            <span style={{ fontFamily: F.mono, fontWeight: 800, fontSize: 30, color: C.suave, width: 70 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ flex: 1, fontFamily: F.inter, fontWeight: 800, fontSize: 32, color: C.blanco }}>{nt.titulo}</span>
            <Check k={P(f, at + 8, 10, outBack)} />
          </div>
        );
      })}
      <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {botones.map((b, i) => {
          const at = 46 + i * 5;
          const k = P(f, at, 12, outBack);
          const pulso = ((f - 70 - i * 10) % 45 + 45) % 45 / 45;
          return (
            <g key={b.tipo} transform={`translate(${b.x} ${btnCy})`} opacity={P(f, at, 6)}>
              {f > 70 && <circle r={84 * (1 + 0.18 * pulso)} fill={C.suave} opacity={0.35 * (1 - pulso)} />}
              <circle r={92} fill="rgba(127,184,230,0.14)" />
              <g transform={`scale(${k})`}>
                <circle r="84" fill={C.suave} />
                <Icono tipo={b.tipo} />
              </g>
              <text y="150" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" letterSpacing="2" fill={C.suave}>{b.label}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- Fuentes (§2b-C) ---------- */
const Doc = () => (
  <svg width="34" height="40" viewBox="0 0 34 40">
    <path d="M3 3 H22 L31 12 V37 H3 Z" fill="none" stroke={C.suave} strokeWidth="3" strokeLinejoin="round" />
    <path d="M22 3 V12 H31 M9 19 H25 M9 25 H25 M9 31 H19" fill="none" stroke={C.suave} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const Fuentes: React.FC = () => {
  const f = useCurrentFrame();
  const rowH = 107, gap = 30;
  const listH = FUENTES.length * rowH + (FUENTES.length - 1) * gap;
  const total = 96 + 20 + 4 + 70 + listH + 40 + 30;
  const top = 130 + (1370 - total) / 2;
  const listTop = top + 96 + 20 + 4 + 70;
  return (
    <AbsoluteFill>
      <Fondo glowY={900} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: F.inter, fontWeight: 900, fontSize: 94, letterSpacing: "0.12em", color: C.blanco, lineHeight: "96px", ...ent(f, 2, "up") }}>FUENTES</div>
      <div style={{ position: "absolute", left: 540 - 125 * P(f, 8, 12), width: 250 * P(f, 8, 12), top: top + 116, height: 4, background: C.suave, borderRadius: 2 }} />
      {FUENTES.map((fu, i) => (
        <div key={i} style={{
          position: "absolute", left: (W - 820) / 2, width: 820, top: listTop + i * (rowH + gap), height: rowH, borderRadius: 44,
          background: "rgba(14,44,82,0.72)", border: "1.5px solid rgba(127,184,230,0.3)", boxShadow: "0 8px 22px rgba(0,0,0,0.28)",
          display: "flex", alignItems: "center", gap: 26, padding: "0 18px", boxSizing: "border-box", ...ent(f, 12 + i * 6, "up"),
        }}>
          <div style={{ width: 72, height: 72, borderRadius: 36, border: `2.5px solid ${C.suave}`, background: "rgba(127,184,230,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Doc /></div>
          <span style={{ fontFamily: F.inter, fontWeight: 800, fontSize: 48, color: C.blanco }}>{fu.nombre}</span>
          {fu.sigla && <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 22, color: C.suave, marginLeft: -12 }}>({fu.sigla})</span>}
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: listTop + listH + 40, textAlign: "center", fontFamily: F.mono, fontWeight: 600, fontSize: 26, color: C.suave, ...ent(f, 40, "fade") }}>
        Fecha de referencia: {FECHA_REFERENCIA}
      </div>
    </AbsoluteFill>
  );
};
