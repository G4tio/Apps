import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-19-int.timing.json";

// Clave Pública · 5 noticias internacionales · jueves 19 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "19 de noviembre de 2026",
  resumen: "NOTICIAS INTERNACIONALES",
  resumenIcono: "globo",
  voz: "audio/2026-11-19-int/voz_limpia.wav",
  musica: "audio/2026-11-19-int/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  escenaCy: 1050,
  noticias: [
    { seccion: "INTERNACIONAL", titulo: "Fallo histórico de la CIJ", viz: "cijbirmania", etiquetas: [["corte", "CORTE INTERNACIONAL DE JUSTICIA"]] },
    { seccion: "INTERNACIONAL", titulo: "Pacto militar en Caracas", viz: "hegsethcaracas", etiquetas: [["hegseth", "EE. UU. Y VENEZUELA"]] },
    { seccion: "INTERNACIONAL", titulo: "COP31 borra los fósiles", viz: "cop31borrador", etiquetas: [["cop", "ANTALYA, TURQUÍA"]] },
    { seccion: "INTERNACIONAL", titulo: "Ola de fallos en EE. UU.", viz: "falloseeuu", etiquetas: [["trump", "ESTADOS UNIDOS"]] },
    { seccion: "INTERNACIONAL", titulo: "Muere la hipopótamo Fiona", viz: "fionahipopotamo", etiquetas: [["fiona", "ZOOLÓGICO DE CINCINNATI"]] },
  ],
  fuentes: [
    { nombre: "Infobae (EFE)" },
    { nombre: "Euronews" },
    { nombre: "Prensa Libre (BBC)" },
    { nombre: "La Hora" },
  ],
};
