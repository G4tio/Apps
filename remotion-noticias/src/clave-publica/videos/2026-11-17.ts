import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-17.timing.json";

// Clave Pública · 5 noticias nacionales · martes 17 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "16 de noviembre de 2026",
  resumen: "NOTICIAS DE GUATEMALA",
  resumenIcono: "bandera-gt",
  voz: "audio/2026-11-17/voz_limpia.wav",
  musica: "audio/2026-11-17/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  noticias: [
    { seccion: "GUATEMALA", titulo: "Sancionan Ley de Ciberseguridad", viz: "ciberseguridad", etiquetas: [["ley", "DECRETO 26-2026"]] },
    { seccion: "GUATEMALA", titulo: "TSE define perfil de juntas", viz: "juntastse", etiquetas: [["juntas", "ELECCIONES 2027"]] },
    { seccion: "GUATEMALA", titulo: "Mapean minería ilegal en Izabal", viz: "mineriaizabal", etiquetas: [["izabal", "JADE Y ORO"]] },
    { seccion: "GUATEMALA", titulo: "Alerta por frío en 7 departamentos", viz: "friomaga", etiquetas: [["temp", "PROTEGE CULTIVOS Y ANIMALES"]] },
    { seccion: "GUATEMALA", titulo: "Roosevelt impulsa cuidado renal", viz: "renalroosevelt", etiquetas: [["renal", "SEMANA DEL CUIDADO RENAL INFANTIL"]] },
  ],
  fuentes: [
    { nombre: "La Hora" },
    { nombre: "Prensa Libre" },
    { nombre: "Publinews" },
    { nombre: "Diario de Centro América" },
    { nombre: "AGN" },
  ],
};
