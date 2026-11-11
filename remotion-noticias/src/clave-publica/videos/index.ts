import type { VideoCP } from "../types";
import { VIDEO as INT_2026_11_10 } from "./2026-11-10";
import { VIDEO as NAC_2026_11_11 } from "./2026-11-11";
import { VIDEO as INT_2026_11_11 } from "./2026-11-11-int";

/** Videos de Clave Pública: cada entrada es una composición en Remotion (id = clave). */
export const VIDEOS: Record<string, VideoCP> = {
  "Internacional-2026-11-10": INT_2026_11_10,
  "Nacional-2026-11-11": NAC_2026_11_11,
  "Internacional-2026-11-11": INT_2026_11_11,
};
