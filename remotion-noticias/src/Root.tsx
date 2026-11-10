import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { DURACION_TOTAL, VideoNoticias } from "./Video";

export const RemotionRoot: React.FC = () => (
  <Composition id="Noticias" component={VideoNoticias} durationInFrames={DURACION_TOTAL} fps={30} width={1080} height={1920} />
);
