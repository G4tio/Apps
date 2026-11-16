import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-16.timing.json";

// Clave Pública · 5 noticias nacionales · lunes 16 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "16 de noviembre de 2026",
  resumen: "NOTICIAS DE GUATEMALA",
  resumenIcono: "bandera-gt",
  voz: "audio/2026-11-16/voz_limpia.wav",
  musica: "audio/2026-11-16/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  noticias: [
    { seccion: "GUATEMALA", titulo: "Estado de sitio en el oriente", viz: "estadositio", etiquetas: [["sitio", "ZACAPA E IZABAL"]] },
    { seccion: "GUATEMALA", titulo: "Incautan lancha con droga", viz: "lancha", etiquetas: [["golpe", "GOLPE AL NARCOTRÁFICO"]] },
    { seccion: "GUATEMALA", titulo: "Veteranos anuncian bloqueos", viz: "bloqueos", etiquetas: [["congreso", "CONCENTRACIÓN FRENTE AL CONGRESO"]] },
    { seccion: "GUATEMALA", titulo: "Asturias ya descansa en casa", viz: "asturiastumba", etiquetas: [["centro", "CENTRO CULTURAL M. Á. ASTURIAS"]] },
    { seccion: "GUATEMALA", titulo: "Hoy, la vuelta en Toronto", viz: "vueltatoronto", etiquetas: [["noche", "HOY: GUATEMALA VS. CANADÁ"]] },
  ],
  fuentes: [
    { nombre: "Emisoras Unidas" },
    { nombre: "Prensa Libre" },
    { nombre: "Publinews" },
    { nombre: "Diario de Centro América" },
    { nombre: "Canal Antigua" },
  ],
};
