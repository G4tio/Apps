import type { Timing, VideoCP } from "../types";
import timing from "./2026-11-12-int.timing.json";

// Clave Pública · 6 noticias internacionales · jueves 12 de noviembre de 2026 (con cierre hablado)
export const VIDEO: VideoCP = {
  fecha: "12 de noviembre de 2026",
  resumen: "NOTICIAS INTERNACIONALES",
  resumenIcono: "globo",
  voz: "audio/2026-11-12-int/voz_limpia.wav",
  musica: "audio/2026-11-12-int/musica.wav",
  timing: timing as unknown as Timing,
  cierreHablado: true,
  noticias: [
    { seccion: "INTERNACIONAL", titulo: "Trump presiona a México", viz: "aranceles", etiquetas: [["trump", "AMENAZA A MÉXICO"], ["sheinbaum", "SHEINBAUM RESPONDE"]] },
    { seccion: "INTERNACIONAL", titulo: "Jensen Huang deja Nvidia", viz: "nvidia", etiquetas: [["huang", "RENUNCIA JENSEN HUANG"], ["espionaje", "SOSPECHAS DE ESPIONAJE"]] },
    { seccion: "INTERNACIONAL", titulo: "Enviados de Trump con Putin", viz: "putinmoscu", etiquetas: [["moscu", "REUNIÓN EN MOSCÚ"], ["tropas", "NO A TROPAS EXTRANJERAS"], ["dublin", "LUEGO, ZELENSKI EN DUBLÍN"]] },
    { seccion: "INTERNACIONAL", titulo: "Ataque a hospital en Gaza", viz: "hospitalgaza", etiquetas: [["hospital", "HOSPITAL NASSER, JAN YUNIS"], ["israel", "ISRAEL: ATACABA A HAMÁS"]] },
    { seccion: "INTERNACIONAL", titulo: "León XIV con jóvenes en Perú", viz: "papavigilia", etiquetas: [["vigilia", "VIGILIA CON JÓVENES"]] },
    { seccion: "INTERNACIONAL", titulo: "OMS alerta por ébola", viz: "ebolacongo", etiquetas: [["oms", "ORGANIZACIÓN MUNDIAL DE LA SALUD"], ["ebola", "BROTE DE ÉBOLA"]] },
  ],
  fuentes: [
    { nombre: "Agencia EFE", sigla: "EFE" },
    { nombre: "Infobae" },
    { nombre: "Expansión" },
    { nombre: "CNN" },
    { nombre: "Time" },
  ],
};
