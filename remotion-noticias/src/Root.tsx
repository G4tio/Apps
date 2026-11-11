import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { DURACION_TOTAL, VideoNoticias } from "./Video";
import { crearVideo } from "./clave-publica/Video";
import { VIDEOS } from "./clave-publica/videos";

const DIAS = Object.entries(VIDEOS).map(([id, v]) => ({ id, ...crearVideo(v) }));

export const RemotionRoot: React.FC = () => (
  <>
    {/* Edición nacional (src/data.ts + src/timing.ts) */}
    <Composition id="Noticias" component={VideoNoticias} durationInFrames={DURACION_TOTAL} fps={30} width={1080} height={1920} />
    {/* Videos por día con el motor de src/clave-publica/ (datos en src/clave-publica/videos/) */}
    {DIAS.map((d) => (
      <Composition key={d.id} id={d.id} component={d.Componente} durationInFrames={d.duracion} fps={30} width={1080} height={1920} />
    ))}
  </>
);
