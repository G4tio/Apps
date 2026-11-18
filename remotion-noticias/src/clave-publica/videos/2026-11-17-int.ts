import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-17-int.timing.json";

// Clave Pública · 5 noticias internacionales · miércoles 17 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "17 de noviembre de 2026",
  resumen: "NOTICIAS INTERNACIONALES",
  resumenIcono: "globo",
  voz: "audio/2026-11-17-int/voz_limpia.wav",
  musica: "audio/2026-11-17-int/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  escenaCy: 1050,
  noticias: [
    { seccion: "INTERNACIONAL", titulo: "Tres países pierden estatus libre de sarampión", viz: "sarampion", etiquetas: [["ops", "ALERTA DE LA OPS"]] },
    { seccion: "INTERNACIONAL", titulo: "Ciberataque afecta a casi 200 sitios web", viz: "ciberataque", etiquetas: [["ciber", "ATAQUE MASIVO"], ["bloqueo", "FALLA BLOQUEADA"]] },
    { seccion: "INTERNACIONAL", titulo: "Haitianos marchan en apoyo a Bukele", viz: "haitibukele", etiquetas: [["principe", "PUERTO PRÍNCIPE, HAITÍ"]] },
    { seccion: "INTERNACIONAL", titulo: "Choque de trenes en Praga deja 46 heridos", viz: "trenespraga", etiquetas: [["praga", "PRAGA, REPÚBLICA CHECA"]] },
    { seccion: "INTERNACIONAL", titulo: "Haaland lleva a Noruega a cuartos", viz: "noruegaremonta", etiquetas: [["cuartos", "LIGA DE NACIONES"]] },
  ],
  fuentes: [
    { nombre: "Prensa Libre" },
    { nombre: "La Hora" },
    { nombre: "Soy502" },
    { nombre: "Publinews" },
  ],
};
