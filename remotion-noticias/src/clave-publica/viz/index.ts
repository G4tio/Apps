import type React from "react";
import { VIZ_INTERNACIONAL, type VizProps } from "./internacional";
import { VIZ_NACIONAL } from "./nacional";

/** Registro de ilustraciones disponibles: la clave es el campo `viz` de cada noticia. */
export const VIZ: Record<string, React.FC<VizProps>> = { ...VIZ_INTERNACIONAL, ...VIZ_NACIONAL };
