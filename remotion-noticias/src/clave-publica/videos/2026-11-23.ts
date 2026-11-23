import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-23.timing.json";

// Clave Pública · 6 noticias nacionales · lunes 23 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "23 de noviembre de 2026",
  resumen: "NOTICIAS DE GUATEMALA",
  resumenIcono: "bandera-gt",
  voz: "audio/2026-11-23/voz_limpia.wav",
  musica: "audio/2026-11-23/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  escenaCy: 1050,
  noticias: [
    { seccion: "GUATEMALA", titulo: "Fin de semana deja 16 muertos", viz: "finsemanaviolento", etiquetas: [["bomberos", "CONTEO DE BOMBEROS"]] },
    { seccion: "GUATEMALA", titulo: "Turba ataca a policías en Soloma", viz: "turbasoloma", etiquetas: [["soloma", "SAN PEDRO SOLOMA, HUEHUETENANGO"]] },
    { seccion: "GUATEMALA", titulo: "Presupuesto 2027, aún sin fecha", viz: "presupuestoagenda", etiquetas: [["agenda", "FUERA DE LA AGENDA DEL MARTES"]] },
    { seccion: "GUATEMALA", titulo: "Línea Morada 120 para mujeres", viz: "lineamorada", etiquetas: [["linea", "LÍNEA MORADA 120"]] },
    { seccion: "GUATEMALA", titulo: "Llega el primer frente frío", viz: "frentefrio", etiquetas: [["miercoles", "DESDE EL MIÉRCOLES 25"]] },
    { seccion: "GUATEMALA", titulo: "Municipal y Antigua empatan", viz: "municipalantigua", etiquetas: [["empataron", "TORNEO APERTURA 2026"]] },
  ],
  fuentes: [
    { nombre: "La Hora" },
    { nombre: "Prensa Libre" },
    { nombre: "Emisoras Unidas" },
    { nombre: "Diario de Centro América" },
    { nombre: "Soy502" },
    { nombre: "AGN" },
  ],
};
