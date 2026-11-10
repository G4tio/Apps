import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F, P, W, outBack, outCubic } from "./theme";

/* ---------- Fondo común: degradado marino + trama de puntos ---------- */
export const Fondo: React.FC<{ glowY?: number }> = ({ glowY = 900 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 50% ${glowY}px, rgba(31,182,255,0.16) 0%, rgba(31,182,255,0) 45%), linear-gradient(180deg, ${C.marino} 0%, ${C.marinoOsc} 100%)`,
    }}
  >
    <svg width="100%" height="100%" style={{ position: "absolute" }}>
      <defs>
        <pattern id="bg-dots" width="110" height="110" patternUnits="userSpaceOnUse">
          <circle cx="55" cy="55" r="3" fill={C.celeste} opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg-dots)" />
    </svg>
  </AbsoluteFill>
);

/* ---------- Transición: dos barras inclinadas que cruzan el corte ---------- */
export const Transicion: React.FC<{ cut: number }> = ({ cut }) => {
  const f = useCurrentFrame();
  const a = cut - 7;
  const b = cut + 8;
  if (f < a || f > b) return null;
  const t = interpolate(f, [a, b], [0, 1]);
  const x = (off: number) => interpolate(t, [0, 1], [-1700 + off, 1500 + off]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: -100, left: x(0), width: 1300, height: 2200, background: C.marino, transform: "skewX(-12deg)" }} />
      <div style={{ position: "absolute", top: -100, left: x(-260), width: 220, height: 2200, background: C.celeste, transform: "skewX(-12deg)" }} />
    </AbsoluteFill>
  );
};

/* ---------- Encabezado fijo (§2b-A) + barra de progreso ---------- */
export const HEADER_CY = 160;

const Pin = () => (
  <svg width="26" height="30" viewBox="0 0 26 30">
    <path d="M13 28s10-9.5 10-16.5A10 10 0 0 0 3 11.5C3 18.5 13 28 13 28z" fill="none" stroke={C.suave} strokeWidth="2.6" />
    <circle cx="13" cy="11.5" r="3.6" fill="none" stroke={C.suave} strokeWidth="2.6" />
  </svg>
);

export const Encabezado: React.FC<{ seccion: string; n: number; total: number; avance: number }> = ({ seccion, n, total, avance }) => {
  const dd = (x: number) => String(x).padStart(2, "0");
  return (
    <>
      <div
        style={{
          position: "absolute", left: 70, top: HEADER_CY - 31, height: 62, padding: "0 26px 0 22px",
          borderRadius: 31, display: "flex", alignItems: "center", gap: 12,
          background: "linear-gradient(180deg, rgba(18,52,94,0.85), rgba(10,38,71,0.85))",
          border: `2px solid rgba(127,184,230,0.45)`,
          fontFamily: F.mono, fontWeight: 800, fontSize: 26, color: C.blanco, letterSpacing: "0.06em",
        }}
      >
        <Pin />
        {seccion}
      </div>
      <div
        style={{
          position: "absolute", right: 70, top: HEADER_CY - 20, height: 40, display: "flex", alignItems: "center",
          fontFamily: F.mono, fontWeight: 800, fontSize: 30, color: C.suave, letterSpacing: "0.04em",
        }}
      >
        NOTICIA {dd(n)} / {dd(total)}
      </div>
      {/* barra de progreso por noticias */}
      <div style={{ position: "absolute", left: 70, top: 214, width: W - 140, display: "flex", gap: 10 }}>
        {Array.from({ length: total }).map((_, i) => {
          const fill = i < n - 1 ? 1 : i === n - 1 ? avance : 0;
          return (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(127,184,230,0.18)", overflow: "hidden" }}>
              <div style={{ width: `${fill * 100}%`, height: "100%", background: C.celeste }} />
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ---------- Subtítulos cinéticos palabra por palabra ---------- */
type Tok = { w: string; kind: "n" | "k" | "c" };
const tokenize = (text: string): Tok[] => {
  const out: Tok[] = [];
  const re = /\*([^*]+)\*|#([^#]+)#|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m[1]) m[1].split(" ").forEach((w) => out.push({ w, kind: "k" }));
    else if (m[2]) out.push({ w: m[2], kind: "c" });
    else out.push({ w: m[3], kind: "n" });
  }
  return out;
};

export const Subtitulos: React.FC<{ captions: { at: number; text: string }[]; fin: number }> = ({ captions, fin }) => {
  const f = useCurrentFrame();
  return (
    <>
      {captions.map((c, i) => {
        const start = Math.round(c.at * 30);
        const end = i + 1 < captions.length ? Math.round(captions[i + 1].at * 30) - 2 : fin;
        if (f < start - 1 || f > end) return null;
        const out = 1 - P(f, end - 5, 5);
        const toks = tokenize(c.text);
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: 70, right: 70, top: 250, height: 250,
              display: "flex", flexWrap: "wrap", alignContent: "flex-start", justifyContent: "center",
              columnGap: 20, rowGap: 4, opacity: out,
              fontFamily: F.exo, fontWeight: 800, fontSize: 72, lineHeight: 1.12, textAlign: "center",
            }}
          >
            {toks.map((t, j) => {
              const ws = start + j * 3;
              const p = P(f, ws, 8, outCubic);
              return (
                <span
                  key={j}
                  style={{
                    display: "inline-block",
                    opacity: P(f, ws, 5),
                    transform: `translateY(${(1 - p) * 26}px) scale(${0.85 + 0.15 * p})`,
                    color: t.kind === "k" ? C.celeste : t.kind === "c" ? C.claro : C.blanco,
                    textShadow: "0 4px 18px rgba(0,0,0,0.35)",
                  }}
                >
                  {t.w}
                </span>
              );
            })}
          </div>
        );
      })}
    </>
  );
};

/* ---------- Escenario de ilustración: círculo tenue con borde punteado giratorio ---------- */
export const Escenario: React.FC<{ cy?: number; r?: number; children: React.ReactNode; etiqueta?: string; etiquetaAt?: number }> = ({
  cy = 1010, r = 340, children, etiqueta, etiquetaAt = 70,
}) => {
  const f = useCurrentFrame();
  const inn = P(f, 4, 16, outBack);
  return (
    <>
      <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={`translate(${W / 2} ${cy}) scale(${inn})`} opacity={P(f, 4, 10)}>
          <circle r={r} fill="rgba(31,182,255,0.06)" />
          <circle r={r + 18} fill="none" stroke={C.celeste} strokeOpacity="0.35" strokeWidth="3" strokeDasharray="4 16" strokeLinecap="round" transform={`rotate(${f * 0.6})`} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, top: cy - 400, width: W, height: 800 }}>{children}</div>
      {etiqueta && (
        <div
          style={{
            position: "absolute", left: 0, right: 0, top: cy + r + 60, textAlign: "center",
            fontFamily: F.exo, fontStyle: "italic", fontWeight: 800, fontSize: 64, color: C.claro,
            ...entStyle(f, etiquetaAt),
          }}
        >
          {etiqueta}
        </div>
      )}
    </>
  );
};

const entStyle = (f: number, at: number): React.CSSProperties => {
  const t = P(f, at, 12, outBack);
  return { opacity: P(f, at, 8), transform: `translateY(${(1 - t) * 40}px) scale(${0.8 + 0.2 * t})` };
};
