import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { NOTICIAS } from "./data";
import { s } from "./theme";
import { Transicion } from "./components";
import { Logo } from "./scenes/Logo";
import { Fuentes, Noticia, Recap, Resumen } from "./scenes/Escenas";

const DUR = {
  intro: s(3.0),
  resumen: s(3.0),
  noticia: s(5.0),
  recap: s(7.0),
  fuentes: s(5.2),
  cierre: s(3.6),
};

type Esc = { key: string; dur: number; el: (dur: number) => React.ReactNode };

const ESCENAS: Esc[] = [
  { key: "intro", dur: DUR.intro, el: (d) => <Logo dur={d} /> },
  { key: "resumen", dur: DUR.resumen, el: (d) => <Resumen dur={d} /> },
  ...NOTICIAS.map((n, i) => ({ key: `n${i}`, dur: DUR.noticia, el: (d: number) => <Noticia noticia={n} n={i + 1} dur={d} /> })),
  { key: "recap", dur: DUR.recap, el: () => <Recap /> },
  { key: "fuentes", dur: DUR.fuentes, el: () => <Fuentes /> },
  { key: "cierre", dur: DUR.cierre, el: (d) => <Logo dur={d} salida /> },
];

let acc = 0;
const TIMELINE = ESCENAS.map((e) => {
  const from = acc;
  acc += e.dur;
  return { ...e, from };
});
export const DURACION_TOTAL = acc;

export const VideoNoticias: React.FC = () => (
  <AbsoluteFill style={{ background: "#04122A" }}>
    {TIMELINE.map((e) => (
      <Sequence key={e.key} from={e.from} durationInFrames={e.dur}>
        {e.el(e.dur)}
      </Sequence>
    ))}
    {TIMELINE.slice(1).map((e) => (
      <Transicion key={"t" + e.key} cut={e.from} />
    ))}
  </AbsoluteFill>
);
