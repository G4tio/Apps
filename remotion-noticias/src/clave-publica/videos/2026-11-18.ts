import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-18.timing.json";

// Clave Pública · 6 noticias nacionales · miércoles 18 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "18 de noviembre de 2026",
  resumen: "NOTICIAS DE GUATEMALA",
  resumenIcono: "bandera-gt",
  voz: "audio/2026-11-18/voz_limpia.wav",
  musica: "audio/2026-11-18/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  escenaCy: 1050,
  noticias: [
    { seccion: "GUATEMALA", titulo: "Villeda, candidato a la Corte IDH", viz: "villedacidh", etiquetas: [["corte", "CORTE INTERAMERICANA DE DD. HH."]] },
    { seccion: "GUATEMALA", titulo: "Pausan cámaras corporales de la PNC", viz: "camarascorporales", etiquetas: [["detuvo", "PLAN PILOTO EN PAUSA"]] },
    { seccion: "GUATEMALA", titulo: "Bono de Q5 mil para policías y guardias", viz: "bonopolicias", etiquetas: [["bono", "BONO NAVIDEÑO"]] },
    { seccion: "GUATEMALA", titulo: "Cárcel El Triunfo supera 23 % de avance", viz: "carceltriunfo", etiquetas: [["triunfo", "CÁRCEL DE MÁXIMA SEGURIDAD"]] },
    { seccion: "GUATEMALA", titulo: "Extraditados por enviar cocaína a Atlanta", viz: "extraditados", etiquetas: [["georgia", "TRIBUNAL FEDERAL DE EE. UU."]] },
    { seccion: "GUATEMALA", titulo: "Illescas deja Raíces y no se reelegirá", viz: "illescas", etiquetas: [["illescas", "CONGRESO DE LA REPÚBLICA"]] },
  ],
  fuentes: [
    { nombre: "La Hora" },
    { nombre: "Prensa Libre" },
    { nombre: "Publinews" },
    { nombre: "Emisoras Unidas" },
  ],
};
