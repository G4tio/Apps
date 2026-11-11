import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-11-int.timing.json";

// Clave Pública · 6 noticias internacionales · miércoles 11 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "11 de noviembre de 2026",
  resumen: "NOTICIAS INTERNACIONALES",
  resumenIcono: "globo",
  voz: "audio/2026-11-11-int/voz_limpia.wav",
  musica: "audio/2026-11-11-int/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  noticias: [
    { seccion: "INTERNACIONAL", titulo: "Cierra ronda en Abu Dabi", viz: "abudabi", etiquetas: [["fin", "CIERRA RONDA EN ABU DABI"], ["canje", "NUEVO CANJE DE PRISIONEROS"], ["moscu", "PRÓXIMA PARADA: MOSCÚ"]] },
    { seccion: "INTERNACIONAL", titulo: "León XIV llega a Perú", viz: "papaperu", etiquetas: [["peru", "ÚLTIMA PARADA DE LA GIRA"], ["misa", "MISA EN LAS PALMAS"]] },
    { seccion: "INTERNACIONAL", titulo: "Ortega reaparece a los 81", viz: "ortega", etiquetas: [["ortega", "REAPARECE EN MANAGUA"], ["vice", "ELIMINAN VICEPRESIDENCIA"]] },
    { seccion: "INTERNACIONAL", titulo: "Huelga general en España", viz: "huelga", etiquetas: [["anio", "PRIMERA DESDE 2012"], ["transporte", "VUELOS, TRENES Y METRO"]] },
    { seccion: "INTERNACIONAL", titulo: "10 años de paz en Colombia", viz: "colombia", etiquetas: [["defensoria", "DEFENSORÍA DEL PUEBLO"]] },
    { seccion: "INTERNACIONAL", titulo: "Irán exhibe misiles", viz: "iranarsenal", etiquetas: [["fuerza", "MENSAJE DE FUERZA"]] },
  ],
  fuentes: [
    { nombre: "Agencia EFE", sigla: "EFE" },
    { nombre: "Infobae" },
    { nombre: "Andina" },
    { nombre: "El Universo" },
    { nombre: "Noticias RCN" },
  ],
};
