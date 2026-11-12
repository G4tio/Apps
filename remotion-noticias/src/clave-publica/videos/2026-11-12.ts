import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-12.timing.json";

// Clave Pública · 6 noticias nacionales · jueves 12 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "12 de noviembre de 2026",
  resumen: "NOTICIAS DE GUATEMALA",
  resumenIcono: "bandera-gt",
  voz: "audio/2026-11-12/voz_limpia.wav",
  musica: "audio/2026-11-12/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  noticias: [
    { seccion: "GUATEMALA", titulo: "Protesta frente al Congreso", viz: "protesta", etiquetas: [["protesta", "EXPATRULLEROS PROTESTAN"], ["sin", "SIN ACUERDOS"], ["contreras", "LUIS CONTRERAS, PRESIDENTE"], ["medidas", "NUEVAS MEDIDAS DE SEGURIDAD"]] },
    { seccion: "GUATEMALA", titulo: "Edificio queda en manos del MP", viz: "edificiomp", etiquetas: [["sala", "SALA DE LO CONTENCIOSO"], ["mp", "QUEDA EN MANOS DEL MP"]] },
    { seccion: "GUATEMALA", titulo: "Orden de captura en el COG", viz: "cog", etiquetas: [["orden", "ORDEN DE CAPTURA"], ["malversacion", "POSIBLE MALVERSACIÓN"], ["aguirre", "GERARDO AGUIRRE (COG)"]] },
    { seccion: "GUATEMALA", titulo: "Dos temblores en la mañana", viz: "temblores", etiquetas: [["insivumeh", "DATOS DEL INSIVUMEH"]] },
    { seccion: "GUATEMALA", titulo: "Ruano clasifica a LA 2028", viz: "ruano", etiquetas: [["ruano", "ADRIANA RUANO"], ["plata", "PLATA EN EL MUNDIAL"], ["la28", "1.ª GUATEMALTECA CLASIFICADA"]] },
    { seccion: "GUATEMALA", titulo: "Guatemala recibe a Canadá", viz: "guatecanada", etiquetas: [["seleccion", "CUARTOS · LIGA DE NACIONES"], ["toronto", "VUELTA: LUNES EN TORONTO"], ["copa", "BOLETO A COPA ORO 2027"]] },
  ],
  fuentes: [
    { nombre: "Prensa Libre" },
    { nombre: "La Hora" },
    { nombre: "Soy502" },
    { nombre: "Publinews" },
    { nombre: "Canal Antigua" },
    { nombre: "Emisoras Unidas" },
  ],
};
