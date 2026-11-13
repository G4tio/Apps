import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-13-int.timing.json";

// Clave Pública · 6 noticias internacionales · viernes 13 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "13 de noviembre de 2026",
  resumen: "NOTICIAS INTERNACIONALES",
  resumenIcono: "globo",
  voz: "audio/2026-11-13-int/voz_limpia.wav",
  musica: "audio/2026-11-13-int/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  noticias: [
    { seccion: "INTERNACIONAL", titulo: "Choque de versiones en Baréin", viz: "golfo", etiquetas: [["mina", "MINA EN ORMUZ, SEGÚN IRÁN"]] },
    { seccion: "INTERNACIONAL", titulo: "OIEA busca uranio de Irán", viz: "uranio", etiquetas: [["saber", "PARADERO DESCONOCIDO"]] },
    { seccion: "INTERNACIONAL", titulo: "Caída global de Microsoft", viz: "microsoft", etiquetas: [["ciber", "DESCARTAN CIBERATAQUE"]] },
    { seccion: "INTERNACIONAL", titulo: "Rubio recibe a Asfura", viz: "rubioasfura" },
    { seccion: "INTERNACIONAL", titulo: "Bebé muere de frío en Gaza", viz: "gazafrio", etiquetas: [["onu", "AYUDA BLOQUEADA EN LA FRONTERA"]] },
    { seccion: "INTERNACIONAL", titulo: "Starship va por doble captura", viz: "starship", etiquetas: [["torre", "PRIMER INTENTO DE DOBLE CAPTURA"]] },
  ],
  fuentes: [
    { nombre: "Agencia EFE", sigla: "EFE" },
    { nombre: "Infobae" },
    { nombre: "ABC News" },
    { nombre: "Al Jazeera" },
    { nombre: "ONU Noticias" },
  ],
};
