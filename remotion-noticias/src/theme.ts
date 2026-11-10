import { Easing, interpolate } from "remotion";

export const C = {
  marino: "#0A2647",
  marinoOsc: "#04122A",
  celeste: "#1FB6FF",
  claro: "#BFEAFF",
  grisClaro: "#F5F8FC",
  grisOsc: "#1F2937",
  suave: "#7FB8E6",
  menta: "#5CCB9B",
  logoCeleste: "#8ED8FF",
  blanco: "#FFFFFF",
};

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const s = (sec: number) => Math.round(sec * FPS);

export const F = {
  exo: "'Exo 2', sans-serif",
  inter: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
  mont: "'Montserrat', sans-serif",
};

export const outCubic = Easing.out(Easing.cubic);
export const outExpo = Easing.out(Easing.exp);
export const outBack = Easing.out(Easing.back(1.7));
export const inOut = Easing.inOut(Easing.cubic);

/** Progreso 0→1 entre start y start+dur (en cuadros). */
export const P = (f: number, start: number, dur: number, ease = outCubic) =>
  interpolate(f, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Estilo de entrada estándar. */
export const ent = (
  f: number,
  start: number,
  kind: "up" | "left" | "right" | "pop" | "fade" = "up",
  dur = 12
): React.CSSProperties => {
  const t = P(f, start, dur, kind === "pop" ? outBack : outCubic);
  const o = P(f, start, Math.min(dur, 8));
  const tr =
    kind === "up"
      ? `translateY(${(1 - t) * 50}px)`
      : kind === "left"
      ? `translateX(${(1 - t) * -80}px)`
      : kind === "right"
      ? `translateX(${(1 - t) * 80}px)`
      : kind === "pop"
      ? `scale(${0.4 + 0.6 * t})`
      : "none";
  return { opacity: o, transform: tr };
};
