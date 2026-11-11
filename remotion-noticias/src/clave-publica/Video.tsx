import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile } from "remotion";
import { VOZ_DESDE, type VideoCP } from "./types";
import { s } from "../theme";
import { Transicion } from "./components";
import { Fuentes, Noticia, Recap, Resumen } from "./Escenas";
import { VideoCtx } from "./contexto";

const INTRO = 90; // clip oficial: 3,0 s
const CIERRE = 108; // clip oficial: 3,6 s
const RECAP = s(6.5);
const FUENTES_DUR = s(5.2);
const PAUSA_FINAL = s(0.9); // tras la última palabra, antes de la recapitulación

/** Construye la composición de un día de Clave Pública a partir de sus datos. */
export const crearVideo = (VIDEO: VideoCP) => {
  const vozF = (t: number) => Math.round(VOZ_DESDE + t * 30);
  const B = VIDEO.timing.bloques;
  type Esc = { key: string; from: number; dur: number; el: (dur: number, from: number) => React.ReactNode };
  const esc: Esc[] = [];
  esc.push({ key: "intro", from: 0, dur: INTRO, el: () => <OffthreadVideo src={staticFile("marca/intro.mp4")} /> });
  esc.push({ key: "resumen", from: INTRO, dur: vozF(B[1].inicio) - INTRO, el: (d, fr) => <Resumen dur={d} desde={fr} /> });
  VIDEO.noticias.forEach((n, i) => {
    const from = vozF(B[i + 1].inicio);
    const to = i + 1 < VIDEO.noticias.length ? vozF(B[i + 2].inicio) : vozF(VIDEO.timing.fin_voz) + PAUSA_FINAL;
    esc.push({ key: `n${i + 1}`, from, dur: to - from, el: (d, fr) => <Noticia noticia={n} n={i + 1} dur={d} desde={fr} /> });
  });
  let t = esc[esc.length - 1].from + esc[esc.length - 1].dur;
  esc.push({ key: "recap", from: t, dur: RECAP, el: () => <Recap /> }); t += RECAP;
  esc.push({ key: "fuentes", from: t, dur: FUENTES_DUR, el: () => <Fuentes /> }); t += FUENTES_DUR;
  esc.push({ key: "cierre", from: t, dur: CIERRE, el: () => <OffthreadVideo src={staticFile("marca/cierre.mp4")} /> }); t += CIERRE;
  const cortes = esc.slice(1).map((e) => e.from);

  const Componente: React.FC = () => (
    <VideoCtx.Provider value={VIDEO}>
      <AbsoluteFill style={{ background: "#04122A" }}>
        {esc.map((e) => (
          <Sequence key={e.key} from={e.from} durationInFrames={e.dur}>
            {e.el(e.dur, e.from)}
          </Sequence>
        ))}
        {cortes.map((c) => <Transicion key={"t" + c} cut={c} />)}
        <Sequence from={VOZ_DESDE}>
          <Audio src={staticFile(VIDEO.voz)} />
        </Sequence>
        {VIDEO.musica && (
          <Sequence from={INTRO}>
            <Audio src={staticFile(VIDEO.musica)} />
          </Sequence>
        )}
      </AbsoluteFill>
    </VideoCtx.Provider>
  );
  return { Componente, duracion: t, cortes };
};
