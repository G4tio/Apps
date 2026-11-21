import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-20.timing.json";

// Clave Pública · 5 noticias nacionales · viernes 20 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "20 de noviembre de 2026",
  resumen: "NOTICIAS DE GUATEMALA",
  resumenIcono: "bandera-gt",
  voz: "audio/2026-11-20/voz_limpia.wav",
  musica: "audio/2026-11-20/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  escenaCy: 1050,
  noticias: [
    { seccion: "GUATEMALA", titulo: "Ley de Contrataciones", viz: "leycontrataciones", etiquetas: [["congreso", "CONGRESO DE LA REPÚBLICA"]] },
    { seccion: "GUATEMALA", titulo: "Salario mínimo, en espera", viz: "salariominimo", etiquetas: [["arevalo", "BERNARDO ARÉVALO"]] },
    { seccion: "GUATEMALA", titulo: "Gas propano sigue caro", viz: "gaspropano", etiquetas: [["cilindro", "CILINDRO DE 25 LIBRAS"]] },
    { seccion: "GUATEMALA", titulo: "La Aurora, a 95 vuelos", viz: "laaurora", etiquetas: [["aurora", "AEROPUERTO LA AURORA"]] },
    { seccion: "GUATEMALA", titulo: "Bus vuelca en Tecpán", viz: "bustecpan", etiquetas: [["bus", "RUTA INTERAMERICANA"]] },
  ],
  fuentes: [
    { nombre: "Prensa Libre" },
    { nombre: "La Hora" },
    { nombre: "Soy502" },
    { nombre: "Publinews" },
  ],
};
