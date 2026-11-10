// Identidad Movie Plus (tomada del logo oficial).
export const MARCA = {
  rojo: '#ED1C24',
  carbon: '#3A3A3C', // letras del logo sobre fondo claro
  fondo: '#0B0D12', // negro cinematográfico
  fondoGlow: '#1A2236', // resplandor azul noche (como el ícono)
  blanco: '#FFFFFF',
};

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const outExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const inExpo = (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10));
export const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const inOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const outBack = (t: number, s = 1.7) =>
  1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
