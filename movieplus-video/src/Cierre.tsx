import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Fondo} from './Logo';
import {LogoAnim, Tiempos} from './LogoAnim';
import {MARCA, prog, lerp, outCubic, outBack, outExpo, inOutCubic} from './marca';

// Cierre ≈ 3,2 s (96 cuadros). Entra con el barrido rojo que viene de la
// última noticia, el rojo se contrae en el aro, se arma el logo y aparece el CTA.
export const CIERRE_DUR = 96;

const T: Tiempos = {
  bloque: [0, 8],
  bloqueDesde: 'abajo',
  estrella: [10, 22],
  estrellaModo: 'pop',
  contraccion: [8, 20],
  punto: [21, 27],
  mover: [22, 34],
  letras: 25,
  plus: 32,
  brillo: [52, 66],
};

export const Cierre: React.FC<{sinAudio?: boolean; transparenteAlInicio?: boolean}> = ({
  sinAudio,
  transparenteAlInicio,
}) => {
  const f = useCurrentFrame();
  // Mientras el panel rojo sube (cuadros 0–8) se sigue viendo la última noticia.
  const tapado = !transparenteAlInicio || f >= 8;
  const subir = lerp(0, -140, outExpo(prog(f, 36, 48)));
  const pill = prog(f, 40, 50);
  const lema = outCubic(prog(f, 46, 56));
  const fuera = inOutCubic(prog(f, 80, 96));
  return (
    <AbsoluteFill style={{background: tapado ? MARCA.fondo : 'transparent'}}>
      <AbsoluteFill style={{opacity: 1 - fuera, transform: `scale(${lerp(1, 0.94, fuera)})`}}>
        {tapado ? <Fondo f={f} glow={prog(f, 8, 24)} /> : null}
        <LogoAnim f={f} t={T} logoY={subir} />
        {/* CTA */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: 1080,
            top: 1085,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 34,
          }}
        >
          <div
            style={{
              transform: `scale(${pill > 0 ? outBack(pill, 2) : 0})`,
              background: MARCA.rojo,
              color: '#fff',
              fontFamily: 'Saira Condensed',
              fontWeight: 900,
              fontSize: 64,
              letterSpacing: '0.08em',
              padding: '10px 54px 12px',
              borderRadius: 999,
              fontStyle: 'italic',
              boxShadow: '0 12px 40px rgba(237,28,36,0.35)',
            }}
          >
            SÍGUENOS
          </div>
          <div
            style={{
              opacity: lema,
              transform: `translateY(${lerp(24, 0, lema)}px)`,
              color: 'rgba(255,255,255,0.82)',
              fontFamily: 'Montserrat',
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: '0.26em',
            }}
          >
            NOTICIAS DE CINE CADA DÍA
          </div>
        </div>
      </AbsoluteFill>
      {!sinAudio ? <Audio src={staticFile('sfx/cierre.wav')} /> : null}
    </AbsoluteFill>
  );
};
