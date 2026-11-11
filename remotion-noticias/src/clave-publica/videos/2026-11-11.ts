import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-11.timing.json";

// Clave Pública · 5 noticias nacionales · miércoles 11 de noviembre de 2026
export const VIDEO: VideoCP = {
  fecha: "11 de noviembre de 2026",
  resumen: "NOTICIAS DE GUATEMALA",
  resumenIcono: "bandera-gt",
  voz: "audio/2026-11-11/voz_limpia.wav",
  musica: "audio/2026-11-11/musica.wav",
  timing: timing as unknown as Timing,
  noticias: [
    { seccion: "GUATEMALA", titulo: "Ley del MetroRiel sancionada", viz: "metroriel", etiquetas: [["ley", "LEY SANCIONADA"], ["fegua", "FEGUA A CARGO"], ["inicio", "OBRAS EN 2027"]] },
    { seccion: "GUATEMALA", titulo: "Aprueban Ley de Cine", viz: "cine", etiquetas: [["congreso", "URGENCIA NACIONAL"], ["instituto", "INSTITUTO DE CINE"], ["ejecutivo", "PASA AL EJECUTIVO"]] },
    { seccion: "GUATEMALA", titulo: "Extorsiones bajan 40.9 %", viz: "extorsiones", etiquetas: [["actual", "ENERO A OCTUBRE"], ["advierten", "VÍCTIMAS NO DENUNCIAN"]] },
    { seccion: "GUATEMALA", titulo: "Más de 25 capturas", viz: "operativos", etiquetas: [["deptos", "3 DEPARTAMENTOS"]] },
    { seccion: "GUATEMALA", titulo: "Más desnutrición infantil", viz: "desnutricion", etiquetas: [["pgn", "DATOS DE LA PGN"], ["anterior", "+51 % FRENTE A 2025"]] },
  ],
  fuentes: [
    { nombre: "Diario de Centro América" },
    { nombre: "Prensa Libre" },
    { nombre: "Emisoras Unidas" },
    { nombre: "La Hora" },
    { nombre: "Infobae" },
  ],
};
