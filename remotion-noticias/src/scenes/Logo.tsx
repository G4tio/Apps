import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F, P, W, inOut, outCubic, outExpo, s } from "../theme";

/**
 * Logo animado PROVISIONAL (hecho con tipografía). Cuando tengas el PNG del logo,
 * se reemplaza cada capa (símbolo, CLAVE, PÚBLICA, barra, lema) por su recorte.
 */
export const Logo: React.FC<{ salida?: boolean; dur: number }> = ({ salida = false, dur }) => {
  const f = useCurrentFrame();
  const cy = 950;

  // Bandas diagonales que cruzan
  const bandas = [0, 1, 2].map((i) => {
    const t = P(f, i * 3, 22, inOut);
    const x = -900 + t * 2600;
    return (
      <div key={i} style={{
        position: "absolute", top: -200, left: x - i * 180, width: i === 1 ? 70 : 140, height: 2400,
        background: i === 1 ? C.celeste : "rgba(31,182,255,0.12)", transform: "skewX(-20deg)",
      }} />
    );
  });

  const sym = P(f, s(0.25), 16, outExpo);
  const linea = P(f, s(0.75), 12, outCubic);
  const clave = P(f, s(0.9), 14, outExpo);
  const publica = P(f, s(1.05), 14, outExpo);
  const barra = P(f, s(1.45), 14, outExpo);
  const flash = P(f, s(1.45) + 6, 10) * (1 - P(f, s(1.45) + 16, 10));
  const lema = P(f, s(1.75), 14, outCubic);
  const lineaInf = P(f, s(2.0), 16, outCubic);

  const exit = salida ? 0 : P(f, dur - 10, 10, inOut);
  const zoom = 1 + exit * 0.08;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${cy}px, rgba(31,182,255,0.22), rgba(31,182,255,0) 50%), linear-gradient(180deg, ${C.marino}, ${C.marinoOsc})`, overflow: "hidden" }}>
      {/* trama de puntos en esquinas */}
      <svg width={W} height={1920} style={{ position: "absolute" }}>
        <defs>
          <pattern id="logo-dots" width="34" height="34" patternUnits="userSpaceOnUse">
            <circle cx="17" cy="17" r="3" fill={C.celeste} opacity="0.35" />
          </pattern>
          <radialGradient id="logo-fadeA" cx="0" cy="0" r="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
          <mask id="logo-maskA"><rect width={W} height={1920} fill="black" /><circle cx="0" cy="0" r="420" fill="url(#logo-fadeA)" /><circle cx={W} cy={1920} r="420" fill="url(#logo-fadeA)" /></mask>
        </defs>
        <rect width={W} height={1920} fill="url(#logo-dots)" mask="url(#logo-maskA)" opacity={P(f, 0, 12)} />
      </svg>
      {bandas}

      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 1920, opacity: 1 - exit, transform: `scale(${zoom})`, transformOrigin: `540px ${cy}px` }}>
        {/* bloque del logo ≈ 940 px de ancho */}
        <div style={{ position: "absolute", left: 70, top: cy - 150, width: 940, height: 300, display: "flex", alignItems: "center" }}>
          {/* símbolo CP con máscara desde la izquierda */}
          <div style={{ width: 280, height: 260, clipPath: `inset(0 ${(1 - sym) * 100}% 0 0)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              width: 240, height: 240, borderRadius: 48, border: `12px solid ${C.logoCeleste}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: F.exo, fontStyle: "italic", fontWeight: 900, fontSize: 130, color: C.blanco, letterSpacing: "-0.04em",
            }}>CP</div>
          </div>
          {/* línea vertical */}
          <div style={{ width: 8, height: 250 * linea, background: C.blanco, margin: "0 34px", alignSelf: "center", borderRadius: 4 }} />
          {/* textos */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontFamily: F.exo, fontStyle: "italic", fontWeight: 900, fontSize: 118, lineHeight: 1, color: C.blanco, transform: `translateY(${(1 - clave) * 110}%)` }}>CLAVE</div>
            </div>
            <div style={{ overflow: "hidden", paddingTop: 6 }}>
              <div style={{ fontFamily: F.exo, fontStyle: "italic", fontWeight: 900, fontSize: 118, lineHeight: 1, color: C.logoCeleste, transform: `translateY(${(1 - publica) * 110}%)` }}>PÚBLICA</div>
            </div>
            <div style={{ position: "relative", height: 14, marginTop: 14, width: 520 * barra, background: C.celeste, borderRadius: 7, boxShadow: `0 0 ${40 * flash}px ${12 * flash}px rgba(142,216,255,${0.8 * flash})` }} />
          </div>
        </div>
        {/* lema que se abre desde el centro */}
        <div style={{
          position: "absolute", left: 0, right: 0, top: cy + 190, textAlign: "center", clipPath: `inset(0 ${(1 - lema) * 50}% 0 ${(1 - lema) * 50}%)`,
          fontFamily: F.mont, fontWeight: 600, fontSize: 40, letterSpacing: "0.32em", color: C.claro,
        }}>NOTICIAS · GUATEMALA</div>
        <div style={{ position: "absolute", left: 540 - 300 * lineaInf, width: 600 * lineaInf, top: cy + 270, height: 3, background: C.suave, opacity: 0.7 }} />
      </div>
    </AbsoluteFill>
  );
};
