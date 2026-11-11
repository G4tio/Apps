import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { DURACION_TOTAL, VideoNoticias } from "./Video";
import { DURACION_INTERNACIONAL, VideoInternacional } from "./internacional/Video";

export const RemotionRoot: React.FC = () => (
  <>
    {/* Edición nacional (src/data.ts + src/timing.ts) */}
    <Composition id="Noticias" component={VideoNoticias} durationInFrames={DURACION_TOTAL} fps={30} width={1080} height={1920} />
    {/* Edición internacional (src/internacional/, datos del día en src/internacional/videos/) */}
    <Composition id="Internacional" component={VideoInternacional} durationInFrames={DURACION_INTERNACIONAL} fps={30} width={1080} height={1920} />
  </>
);
