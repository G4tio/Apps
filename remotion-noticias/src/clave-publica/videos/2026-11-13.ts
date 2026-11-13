import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-13.timing.json";

// Clave Pública · 6 noticias nacionales · viernes 13 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "13 de noviembre de 2026",
  resumen: "NOTICIAS DE GUATEMALA",
  resumenIcono: "bandera-gt",
  voz: "audio/2026-11-13/voz_limpia.wav",
  musica: "audio/2026-11-13/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  noticias: [
    { seccion: "GUATEMALA", titulo: "Masacre en Zacapa", viz: "zacapa", etiquetas: [["comando", "COMANDO ARMADO EN 10 PICOPS"], ["patrulla", "PNC RECIBIDA A BALAZOS"]] },
    { seccion: "GUATEMALA", titulo: "Remesas récord en octubre", viz: "remesas", etiquetas: [["anio", "DATOS DEL BANGUAT"]] },
    { seccion: "GUATEMALA", titulo: "Corre plazo del presupuesto", viz: "presupuesto", etiquetas: [["congreso", "CONGRESO: HASTA EL 30 DE NOV."], ["alto", "EL MÁS ALTO DE LA HISTORIA"]] },
    { seccion: "GUATEMALA", titulo: "Fondo de Becas ya es ley", viz: "becas", etiquetas: [["estado", "BECAS COMO POLÍTICA DE ESTADO"]] },
    { seccion: "GUATEMALA", titulo: "Nuevo embajador de EE. UU.", viz: "cabrera", etiquetas: [["cabrera", "PEDRO CABRERA"], ["senado", "FALTA CONFIRMACIÓN DEL SENADO"]] },
    { seccion: "GUATEMALA", titulo: "Hoy, Guatemala vs. Canadá", viz: "partidohoy", etiquetas: [["seleccion", "IDA · CUARTOS DE FINAL"], ["transito", "PREVEA DESVÍOS DE TRÁNSITO"]] },
  ],
  fuentes: [
    { nombre: "Prensa Libre" },
    { nombre: "Emisoras Unidas" },
    { nombre: "Soy502" },
    { nombre: "La Hora" },
    { nombre: "Publinews" },
    { nombre: "Diario de Centro América" },
  ],
};
