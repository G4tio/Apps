import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-21.timing.json";

// Clave Pública · 5 noticias nacionales · sábado 21 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "21 de noviembre de 2026",
  resumen: "NOTICIAS DE GUATEMALA",
  resumenIcono: "bandera-gt",
  voz: "audio/2026-11-21/voz_limpia.wav",
  musica: "audio/2026-11-21/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  escenaCy: 1050,
  noticias: [
    { seccion: "GUATEMALA", titulo: "Ataque en discoteca zona 9", viz: "discotecazona9", etiquetas: [["discoteca", "CIUDAD DE GUATEMALA"]] },
    { seccion: "GUATEMALA", titulo: "Apagón en la capital", viz: "apagon", etiquetas: [["corte", "ÁREA METROPOLITANA"]] },
    { seccion: "GUATEMALA", titulo: "Tráiler daña puente", viz: "trailerpuente", etiquetas: [["trailer", "ANILLO PERIFÉRICO"]] },
    { seccion: "GUATEMALA", titulo: "35 sismos en 24 horas", viz: "sismos35", etiquetas: [["insivumeh", "INSIVUMEH"]] },
    { seccion: "GUATEMALA", titulo: "Xelajú y Mixco ganan", viz: "ligaxelajumixco", etiquetas: [["liga", "LIGA NACIONAL · APERTURA 2026"]] },
  ],
  fuentes: [
    { nombre: "Prensa Libre" },
    { nombre: "La Hora" },
    { nombre: "Soy502" },
    { nombre: "Emisoras Unidas" },
    { nombre: "Publinews" },
    { nombre: "Guatefútbol" },
  ],
};
