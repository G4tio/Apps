export type Palabra = { w: string; k: "n" | "k" | "c"; t: number };
export type Bloque = { inicio: number; fin: number; frases: Palabra[][]; cues: Record<string, number> };
export type Timing = { bloques: Bloque[]; fin_voz: number };

/** Cuadro global en que empieza la voz (3,2 s, tras la intro de 3,0 s). */
export const VOZ_DESDE = 96;

export type NoticiaCP = {
  seccion: "GUATEMALA" | "INTERNACIONAL";
  /** Título corto para la recapitulación (≤ 28 caracteres). */
  titulo: string;
  /** Clave de la ilustración en src/viz/. */
  viz: string;
  /** Etiquetas en píldora bajo la ilustración: [cue o segundos de voz, texto]. */
  etiquetas?: [string | number, string][];
};

export type VideoCP = {
  fecha: string; // «10 de noviembre de 2026»
  resumen: string; // «NOTICIAS INTERNACIONALES»
  resumenIcono: "bandera-gt" | "globo";
  noticias: NoticiaCP[];
  fuentes: { nombre: string; sigla?: string }[];
  voz: string; // ruta en public/
  musica?: string; // ruta en public/
  timing: Timing;
  /** true: el último bloque de la voz es el cierre hablado («Infórmate, comparte y síguenos en Clave Pública»),
   *  que suena sobre la recapitulación; en el plan, sus cues son informate, comparte y siguenos. */
  cierreHablado?: boolean;
};
