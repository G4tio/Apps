import type React from "react";
import { VIZ_INTERNACIONAL, type VizProps } from "./internacional";
import { VIZ_NACIONAL } from "./nacional";
import { VIZ_INTERNACIONAL_2 } from "./internacional2";
import { VIZ_NACIONAL_2 } from "./nacional2";
import { VIZ_INTERNACIONAL_3 } from "./internacional3";
import { VIZ_NACIONAL_3 } from "./nacional3";
import { VIZ_INTERNACIONAL_4 } from "./internacional4";
import { VIZ_NACIONAL_4 } from "./nacional4";
import { VIZ_INTERNACIONAL_5 } from "./internacional5";
import { VIZ_NACIONAL_5 } from "./nacional5";
import { VIZ_INTERNACIONAL_6 } from "./internacional6";
import { VIZ_NACIONAL_6 } from "./nacional6";
import { VIZ_INTERNACIONAL_7 } from "./internacional7";
import { VIZ_NACIONAL_7 } from "./nacional7";
import { VIZ_NACIONAL_8 } from "./nacional8";
import { VIZ_INTERNACIONAL_8 } from "./internacional8";
import { VIZ_NACIONAL_9 } from "./nacional9";
import { VIZ_NACIONAL_10 } from "./nacional10";

/** Registro de ilustraciones disponibles: la clave es el campo `viz` de cada noticia. */
export const VIZ: Record<string, React.FC<VizProps>> = { ...VIZ_INTERNACIONAL, ...VIZ_NACIONAL, ...VIZ_INTERNACIONAL_2, ...VIZ_NACIONAL_2, ...VIZ_INTERNACIONAL_3, ...VIZ_NACIONAL_3, ...VIZ_INTERNACIONAL_4, ...VIZ_NACIONAL_4, ...VIZ_INTERNACIONAL_5, ...VIZ_NACIONAL_5, ...VIZ_INTERNACIONAL_6, ...VIZ_NACIONAL_6, ...VIZ_INTERNACIONAL_7, ...VIZ_NACIONAL_7, ...VIZ_NACIONAL_8, ...VIZ_INTERNACIONAL_8, ...VIZ_NACIONAL_9, ...VIZ_NACIONAL_10 };
