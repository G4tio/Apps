import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile } from "remotion";
import { NOTICIAS } from "./data";
import { s } from "./theme";
import { Transicion } from "./components";
import { Fuentes, Noticia, Recap, Resumen } from "./scenes/Escenas";
import { AUDIO_REAL, BLOQUES, FIN_VOZ } from "./timing";

/** La voz entra a los 3,2 s (después del logo de entrada). */
export const VOZ = 96;
const INTRO = 90; // 3,0 s: clip oficial
const CIERRE = 108; // 3,6 s: clip oficial
const vf = (t: number) => VOZ + Math.round(t * 30); // segundo de voz → cuadro

// cortes: inicio de cada noticia (bloques 1..6) y de la recapitulación (bloque 7 = cierre hablado)
const cortes = BLOQUES.map((b) => vf(b.inicio));
const recapIni = cortes[NOTICIAS.length + 1];
const RECAP = Math.max(s(7.0), vf(FIN_VOZ) - recapIni + s(1.2));

type Esc = { key: string; from: number; dur: number; el: (dur: number) => React.ReactNode };

const ESCENAS: Esc[] = [
  { key: "intro", from: 0, dur: INTRO, el: () => <OffthreadVideo src={staticFile("marca/intro.mp4")} /> },
  { key: "resumen", from: INTRO, dur: cortes[1] - INTRO, el: (d) => <Resumen dur={d} voz={VOZ - INTRO} /> },
  ...NOTICIAS.map((n, i) => ({
    key: `n${i}`,
    from: cortes[i + 1],
    dur: cortes[i + 2] - cortes[i + 1],
    el: (d: number) => <Noticia noticia={n} n={i + 1} dur={d} />,
  })),
  { key: "recap", from: recapIni, dur: RECAP, el: () => <Recap /> },
];
const fuentesIni = recapIni + RECAP;
ESCENAS.push({ key: "fuentes", from: fuentesIni, dur: s(5.2), el: () => <Fuentes /> });
ESCENAS.push({ key: "cierre", from: fuentesIni + s(5.2), dur: CIERRE, el: () => <OffthreadVideo src={staticFile("marca/cierre.mp4")} /> });

export const DURACION_TOTAL = fuentesIni + s(5.2) + CIERRE;
export const CORTES = ESCENAS.map((e) => ({ key: e.key, from: e.from }));

export const VideoNoticias: React.FC = () => (
  <AbsoluteFill style={{ background: "#04122A" }}>
    {ESCENAS.map((e) => (
      <Sequence key={e.key} from={e.from} durationInFrames={e.dur}>
        {e.el(e.dur)}
      </Sequence>
    ))}
    {ESCENAS.slice(1).map((e) => (
      <Transicion key={"t" + e.key} cut={e.from} />
    ))}
    {AUDIO_REAL && (
      <>
        <Sequence from={VOZ}>
          <Audio src={staticFile("audio/voz.wav")} />
        </Sequence>
        <Sequence from={INTRO}>
          <Audio src={staticFile("audio/musica.wav")} volume={0.6} />
        </Sequence>
      </>
    )}
  </AbsoluteFill>
);
