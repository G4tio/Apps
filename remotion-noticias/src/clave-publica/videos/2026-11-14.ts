import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-14.timing.json";

// Clave Pública · 5 noticias nacionales · sábado 14 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "14 de noviembre de 2026",
  resumen: "NOTICIAS DE GUATEMALA",
  resumenIcono: "bandera-gt",
  voz: "audio/2026-11-14/voz_limpia.wav",
  musica: "audio/2026-11-14/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  noticias: [
    { seccion: "GUATEMALA", titulo: "Asturias vuelve a Guatemala", viz: "asturias", etiquetas: [["sepultado", "SEPELIO: DOMINGO 15"]] },
    { seccion: "GUATEMALA", titulo: "Guatemala cae ante Canadá", viz: "marcador", etiquetas: [["tena", "TENA ASUME LA RESPONSABILIDAD"]] },
    { seccion: "GUATEMALA", titulo: "Selección sin vuelo a Toronto", viz: "vuelocancelado", etiquetas: [["charter", "FEDEFUT BUSCA UN CHÁRTER"], ["martes", "PIDE MOVER EL PARTIDO"]] },
    { seccion: "GUATEMALA", titulo: "Ceniza del volcán de Fuego", viz: "ceniza", etiquetas: [["actividad", "SIN AUMENTO DE ACTIVIDAD"]] },
    { seccion: "GUATEMALA", titulo: "Festival de las Flores", viz: "festival" },
  ],
  fuentes: [
    { nombre: "Diario de Centro América" },
    { nombre: "Prensa Libre" },
    { nombre: "Emisoras Unidas" },
    { nombre: "La Hora" },
    { nombre: "Antorcha Deportiva" },
  ],
};
