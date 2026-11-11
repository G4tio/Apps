import { createContext, useContext } from "react";
import type { VideoCP } from "./types";

/** Video (día) que se está renderizando; lo provee crearVideo() en Video.tsx. */
export const VideoCtx = createContext<VideoCP | null>(null);
export const useVideo = (): VideoCP => {
  const v = useContext(VideoCtx);
  if (!v) throw new Error("Falta VideoCtx.Provider");
  return v;
};
