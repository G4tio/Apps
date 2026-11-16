import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-16-int.timing.json";

// Clave Pública · 5 noticias internacionales · lunes 16 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "16 de noviembre de 2026",
  resumen: "NOTICIAS INTERNACIONALES",
  resumenIcono: "globo",
  voz: "audio/2026-11-16-int/voz_limpia.wav",
  musica: "audio/2026-11-16-int/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  noticias: [
    { seccion: "INTERNACIONAL", titulo: "Trump, Xi y Putin, cara a cara", viz: "cumbretres", etiquetas: [["shenzhen", "FORO APEC EN CHINA"]] },
    { seccion: "INTERNACIONAL", titulo: "Ataque récord de drones", viz: "dronesrecord", etiquetas: [["ataque", "EL MAYOR DE LA GUERRA"]] },
    { seccion: "INTERNACIONAL", titulo: "Irán vuelve a atacar Baréin", viz: "bareindrones", etiquetas: [["interceptaron", "SIN DAÑOS, SEGÚN BARÉIN Y EE. UU."]] },
    { seccion: "INTERNACIONAL", titulo: "León XIV se despide de Perú", viz: "papadespedida", etiquetas: [["peru", "MISA DE DESPEDIDA EN LIMA"]] },
    { seccion: "INTERNACIONAL", titulo: "Récord migrante en Canarias", viz: "canarias", etiquetas: [["canarias", "RÉCORD DESDE 2020"]] },
  ],
  fuentes: [
    { nombre: "Infobae" },
    { nombre: "CNBC" },
    { nombre: "CBS News" },
    { nombre: "Milenio" },
    { nombre: "Yahoo Noticias" },
  ],
};
