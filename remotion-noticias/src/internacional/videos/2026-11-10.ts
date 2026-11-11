import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-10.timing.json";

// Clave Pública · 5 noticias internacionales · martes 10 de noviembre de 2026
export const VIDEO: VideoCP = {
  fecha: "10 de noviembre de 2026",
  resumen: "NOTICIAS INTERNACIONALES",
  resumenIcono: "globo",
  voz: "audio/2026-11-10/voz_limpia.wav",
  musica: "audio/2026-11-10/musica.wav",
  timing: timing as unknown as Timing,
  noticias: [
    { seccion: "INTERNACIONAL", titulo: "Diálogo Rusia-Ucrania", viz: "negociacion", etiquetas: [["abudabi", "ABU DABI"]] },
    { seccion: "INTERNACIONAL", titulo: "León XIV en Sudamérica", viz: "papa", etiquetas: [["cordoba", "HOY: CÓRDOBA"], ["peru", "CIERRA EN PERÚ · 17 NOV"]] },
    { seccion: "INTERNACIONAL", titulo: "Choque de mensajes en Irán", viz: "iran", etiquetas: [["iran", "IRÁN NIEGA DIÁLOGO"]] },
    { seccion: "INTERNACIONAL", titulo: "Nueva caravana migrante", viz: "caravana", etiquetas: [["tapachula", "SALE DE TAPACHULA"]] },
    { seccion: "INTERNACIONAL", titulo: "El G7 se reúne en París", viz: "g7", etiquetas: [["paris", "PARÍS, FRANCIA"], ["g7", "G7 EN PARÍS"]] },
  ],
  fuentes: [
    { nombre: "Agencia EFE", sigla: "EFE" },
    { nombre: "Infobae" },
    { nombre: "Euronews" },
    { nombre: "Telemundo" },
  ],
};
