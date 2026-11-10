import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Capa, Estrella, AroContraccion, LOGO, LETRAS, PLUS} from './Logo';
import {
  MARCA, W, H, prog, lerp, outExpo, outBack, outCubic, inOutCubic, inExpo,
} from './marca';

/** Tiempos (en cuadros) de la construcción del logo. */
export type Tiempos = {
  bloque: [number, number]; // bloque rojo que se expande / barre
  bloqueDesde: 'centro' | 'abajo';
  estrella: [number, number]; // zoom de la estrella
  estrellaModo: 'zoom' | 'pop';
  contraccion: [number, number]; // rojo → aro
  punto: [number, number];
  mover: [number, number]; // ícono del centro a su lugar en el logo
  letras: number; // inicio de M V I E
  plus: number; // inicio de P L U S
  brillo: [number, number];
  subirLogo?: [number, number]; // cierre: el logo sube para dejar el CTA
};

const S = 0.95; // escala del logo: ~960 px de ancho
const ICONO_K = 1.55; // tamaño del ícono antes de ir a su lugar

export const LogoAnim: React.FC<{f: number; t: Tiempos; logoY?: number}> = ({
  f,
  t,
  logoY = 0,
}) => {
  // 1. Bloque rojo
  const pb = outExpo(prog(f, t.bloque[0], t.bloque[1]));
  const kc = outExpo(prog(f, t.contraccion[0], t.contraccion[1]));
  const usarCirculo = f >= t.contraccion[0];
  const aroListo = f >= t.contraccion[1] - 1;

  // 2. Ícono: del centro (grande) a su lugar en el logo
  const pm = outExpo(prog(f, t.mover[0], t.mover[1]));
  const ks = lerp(ICONO_K, 1, pm);
  const dx = lerp(LOGO.cx - LOGO.aroCx, 0, pm); // en px del logo

  const cy = H / 2 + logoY;
  const origenX = W / 2 - S * LOGO.cx;
  const origenY = cy - S * LOGO.cy;
  // centro del aro en pantalla
  const aroX = origenX + S * (LOGO.aroCx + dx);
  const aroY = origenY + S * LOGO.aroCy;

  // 3. Estrella
  const pe = prog(f, t.estrella[0], t.estrella[1]);
  const escalaEstrella =
    t.estrellaModo === 'zoom' ? lerp(11, 1, outExpo(pe)) : outBack(pe, 2.2);
  const rotEstrella =
    t.estrellaModo === 'zoom' ? lerp(-35, 0, outExpo(pe)) : lerp(140, 0, outCubic(pe));
  const brillo = prog(f, t.brillo[0], t.brillo[1]);

  // 4. Aro PNG (con sus cortes) y punto
  const rotAro = lerp(-28, 0, outCubic(prog(f, t.contraccion[1] - 1, t.contraccion[1] + 9)));
  const pp = prog(f, t.punto[0], t.punto[1]);

  const origenIcono = `${LOGO.aroCx}px ${LOGO.aroCy}px`;
  const icono: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    transformOrigin: origenIcono,
    transform: `translate(${dx}px,0) scale(${ks})`,
  };

  return (
    <AbsoluteFill>
      {/* Bloque rojo */}
      {!usarCirculo && pb > 0 ? (
        t.bloqueDesde === 'centro' ? (
          <div
            style={{
              position: 'absolute',
              left: W / 2 - (W / 2) * pb,
              top: cy - (H / 2 + Math.abs(logoY)) * pb,
              width: W * pb,
              height: (H + 2 * Math.abs(logoY)) * pb,
              background: MARCA.rojo,
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: lerp(H, 0, pb),
              width: W,
              height: H,
              background: MARCA.rojo,
            }}
          />
        )
      ) : null}
      {usarCirculo && !aroListo ? (
        <AroContraccion k={kc} cx={aroX} cy={aroY} escala={S * ks} />
      ) : null}

      {/* Logo en coordenadas del PNG */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1225,
          height: 463,
          transformOrigin: '0 0',
          transform: `translate(${origenX}px,${origenY}px) scale(${S})`,
        }}
      >
        {/* Letras M V I E: entran desde una máscara inferior, escalonadas */}
        {LETRAS.map((n, i) => {
          const a = t.letras + (n === 'm' ? 0 : 1 + i * 2);
          const p = outExpo(prog(f, a, a + 9));
          if (p <= 0) return null;
          const desdeDerecha = n === 'm';
          return (
            <Capa
              key={n}
              n={n}
              clip
              inner={{
                transform: desdeDerecha
                  ? `translateX(${lerp(105, 0, p)}%)`
                  : `translateY(${lerp(105, 0, p)}%)`,
              }}
            />
          );
        })}
        {/* PLUS */}
        {PLUS.map((n, i) => {
          const a = t.plus + i * 2;
          const p = outCubic(prog(f, a, a + 7));
          return (
            <Capa
              key={n}
              n={n}
              style={{opacity: p, transform: `translateY(${lerp(28, 0, p)}px)`}}
            />
          );
        })}

        {/* Ícono: aro + punto + estrella */}
        <div style={icono}>
          {aroListo ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transformOrigin: origenIcono,
                transform: `rotate(${rotAro}deg)`,
              }}
            >
              <Capa n="aro_sup" />
              <Capa n="aro_inf" />
            </div>
          ) : null}
          {pp > 0 ? (
            <Capa
              n="punto"
              style={{transform: `scale(${outBack(pp, 3)})`, opacity: Math.min(1, pp * 3)}}
            />
          ) : null}
          {pe > 0 ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transformOrigin: origenIcono,
                transform: `scale(${escalaEstrella}) rotate(${rotEstrella}deg)`,
              }}
            >
              <Estrella shine={brillo} />
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Barrido rojo de salida/entrada a pantalla completa (de abajo hacia arriba). */
export const Barrido: React.FC<{f: number; a: number; b: number; salida?: boolean}> = ({
  f,
  a,
  b,
  salida,
}) => {
  const p = prog(f, a, b);
  if (p <= 0) return null;
  // entra cubriendo y, si "salida", continúa hacia arriba descubriendo
  const mitad = salida ? 0.55 : 1;
  const top =
    p < mitad ? lerp(H, 0, outExpo(p / mitad)) : lerp(0, -H, inOutCubic((p - mitad) / (1 - mitad)));
  return (
    <div
      style={{position: 'absolute', left: 0, top, width: W, height: H, background: MARCA.rojo}}
    />
  );
};

export {inExpo};
