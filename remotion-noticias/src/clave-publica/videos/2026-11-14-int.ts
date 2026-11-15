import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-14-int.timing.json";

// Clave Pública · 5 noticias internacionales · sábado 14 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "14 de noviembre de 2026",
  resumen: "NOTICIAS INTERNACIONALES",
  resumenIcono: "globo",
  voz: "audio/2026-11-14-int/voz_limpia.wav",
  musica: "audio/2026-11-14-int/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  noticias: [
    { seccion: "INTERNACIONAL", titulo: "Petroleros arden en Ormuz", viz: "ormuz", etiquetas: [["minas", "VERSIÓN DE IRÁN"]] },
    { seccion: "INTERNACIONAL", titulo: "Manila alista cumbre ASEAN", viz: "asean", etiquetas: [["domingo", "CUMBRE DE LA ASEAN"]] },
    { seccion: "INTERNACIONAL", titulo: "EE. UU. normaliza sus vuelos", viz: "vuelos", etiquetas: [["falla", "FALLA DE COMUNICACIONES"], ["normalidad", "NORMALIDAD AL CIERRE DEL DOMINGO"]] },
    { seccion: "INTERNACIONAL", titulo: "Kast visita Vietnam", viz: "kast", etiquetas: [["kast", "JOSÉ ANTONIO KAST"]] },
    { seccion: "INTERNACIONAL", titulo: "Tragedia vial en Emiratos", viz: "choque", etiquetas: [["emiratos", "FUJAIRAH, EMIRATOS"]] },
  ],
  fuentes: [
    { nombre: "Agencia EFE", sigla: "EFE" },
    { nombre: "Infobae" },
    { nombre: "Al Jazeera" },
    { nombre: "The Washington Post" },
    { nombre: "Telemundo" },
  ],
};
