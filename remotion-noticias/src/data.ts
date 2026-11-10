// Noticias del martes 10 de noviembre de 2026 (edición nacional).
// Los subtítulos y los momentos de cada acción vienen de src/timing.ts (scripts/sincronizar.py).

export type Viz =
  | "bomba" | "lluvia" | "barras" | "banderas" | "barco" | "patrulla"
  | "sismo" | "mosh" | "limitadores" | "inflacion" | "baldetti" | "belice";

export type Noticia = {
  seccion: "GUATEMALA" | "INTERNACIONAL";
  /** Título corto para la recapitulación (≤ 28 caracteres). */
  titulo: string;
  viz: Viz;
  /** Etiqueta bajo la ilustración (máx. 3 palabras). */
  etiqueta: string;
  /** Segundos (desde el inicio de la escena) en que aparece la etiqueta. */
  etiquetaAt?: number;
};

export const NOTICIAS: Noticia[] = [
  { seccion: "GUATEMALA", titulo: "Sismo de 5.2 en el Pacífico", viz: "sismo", etiqueta: "Frente a Escuintla" },
  { seccion: "GUATEMALA", titulo: "Capturan a alias «Mosh»", viz: "mosh", etiqueta: "Los Huistas" },
  { seccion: "GUATEMALA", titulo: "CC frena limitadores", viz: "limitadores", etiqueta: "Suspensión provisional" },
  { seccion: "GUATEMALA", titulo: "Inflación baja a 4.38 %", viz: "inflacion", etiqueta: "Inflación 4.38 %" },
  { seccion: "GUATEMALA", titulo: "Brazalete para Baldetti", viz: "baldetti", etiqueta: "Control telemático" },
  { seccion: "GUATEMALA", titulo: "Tensión en el río Sarstún", viz: "belice", etiqueta: "Río Sarstún" },
];

export const FUENTES: { nombre: string; sigla?: string }[] = [
  { nombre: "Prensa Libre" },
  { nombre: "Emisoras Unidas" },
  { nombre: "Diario de Centro América" },
  { nombre: "TN23" },
  { nombre: "La Red 106.1" },
];

export const FECHA_REFERENCIA = "10 de noviembre de 2026";
