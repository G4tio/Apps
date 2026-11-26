import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-26.timing.json";

// Clave Pública · 5 noticias nacionales · jueves 26 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "26 de noviembre de 2026",
  resumen: "NOTICIAS DE GUATEMALA",
  resumenIcono: "bandera-gt",
  voz: "audio/2026-11-26/voz_limpia.wav",
  musica: "audio/2026-11-26/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  escenaCy: 1050,
  noticias: [
    { seccion: "GUATEMALA", titulo: "Arévalo vetará el presupuesto", viz: "vetopresupuesto", etiquetas: [["veto", "DECRETO 32-2026"]] },
    { seccion: "GUATEMALA", titulo: "Caen 15 de «Limpieza Humana»", viz: "limpiezahumana", etiquetas: [["estructura", "OPERATIVO EN PETÉN"]] },
    { seccion: "GUATEMALA", titulo: "Canadá mantiene sanciones a Porras", viz: "sancionescanada", etiquetas: [["canada", "SANCIONES DE CANADÁ"]] },
    { seccion: "GUATEMALA", titulo: "Primer préstamo del BEI", viz: "prestamobei", etiquetas: [["ue", "BANCO EUROPEO DE INVERSIONES"]] },
    { seccion: "GUATEMALA", titulo: "Cabeza deja Municipal", viz: "cabezamunicipal", etiquetas: [["municipal", "DE MUTUO ACUERDO"]] },
  ],
  fuentes: [
    { nombre: "La Hora" },
    { nombre: "Prensa Libre" },
    { nombre: "Soy502" },
    { nombre: "Emisoras Unidas" },
    { nombre: "Publinews" },
  ],
};
