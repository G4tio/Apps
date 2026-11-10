import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Fondo} from './Logo';
import {LogoAnim, Barrido, Tiempos} from './LogoAnim';
import {prog, lerp, outCubic} from './marca';

// Intro ≈ 2,5 s (76 cuadros a 30 fps). El barrido rojo final se encadena
// con la primera noticia: el panel sube y la descubre.
export const INTRO_DUR = 76;

const T: Tiempos = {
  bloque: [0, 8],
  bloqueDesde: 'centro',
  estrella: [5, 20],
  estrellaModo: 'zoom',
  contraccion: [10, 23],
  punto: [24, 30],
  mover: [25, 37],
  letras: 29,
  plus: 37,
  brillo: [42, 56],
};

export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const deriva = lerp(1, 1.035, outCubic(prog(f, 30, 66)));
  return (
    <AbsoluteFill>
      <Fondo f={f} glow={prog(f, 8, 24)} />
      <AbsoluteFill style={{transform: `scale(${deriva})`}}>
        <LogoAnim f={f} t={T} />
      </AbsoluteFill>
      <Barrido f={f} a={60} b={76} salida />
      <Audio src={staticFile('sfx/intro.wav')} />
    </AbsoluteFill>
  );
};
