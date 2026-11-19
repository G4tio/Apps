import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-19.timing.json";

// Clave Pública · 5 noticias nacionales · jueves 19 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "19 de noviembre de 2026",
  resumen: "NOTICIAS DE GUATEMALA",
  resumenIcono: "bandera-gt",
  voz: "audio/2026-11-19/voz_limpia.wav",
  musica: "audio/2026-11-19/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  escenaCy: 1050,
  noticias: [
    { seccion: "GUATEMALA", titulo: "Presupuesto sin dictamen", viz: "presupuesto2027", etiquetas: [["presupuesto", "PRESUPUESTO 2027"]] },
    { seccion: "GUATEMALA", titulo: "Homicidios suben en octubre", viz: "homicidios", etiquetas: [["cien", "DATOS DEL CIEN"]] },
    { seccion: "GUATEMALA", titulo: "Baldetti va al hospital", viz: "baldettihospital", etiquetas: [["baldetti", "ROXANA BALDETTI"]] },
    { seccion: "GUATEMALA", titulo: "Sequía arrasa con el maíz", viz: "sequiamaiz", etiquetas: [["oxfam", "ESTUDIO DE OXFAM"]] },
    { seccion: "GUATEMALA", titulo: "Obras en bulevar Liberación", viz: "bulevarliberacion", etiquetas: [["bulevar", "BULEVAR LIBERACIÓN"]] },
  ],
  fuentes: [
    { nombre: "La Hora" },
    { nombre: "Prensa Libre" },
    { nombre: "Emisoras Unidas" },
    { nombre: "Soy502" },
    { nombre: "Publinews" },
  ],
};
