// ⚠️ CONTENIDO DE PRUEBA: noticias y fuentes ficticias, solo para mostrar la plantilla.
// Para un video real, reemplaza este archivo con las noticias del día.

export type Viz = "bomba" | "lluvia" | "barras" | "banderas" | "barco" | "patrulla";

export type Noticia = {
  seccion: "GUATEMALA" | "INTERNACIONAL";
  /** Título corto para la recapitulación (≤ 28 caracteres). */
  titulo: string;
  /** Subtítulos: segundos desde el inicio de la escena.
   *  *palabra* = clave (celeste) · #cifra# = cifra destacada (azul claro). */
  captions: { at: number; text: string }[];
  viz: Viz;
  /** Etiqueta bajo la ilustración (máx. 3 palabras). */
  etiqueta: string;
};

export const NOTICIAS: Noticia[] = [
  {
    seccion: "GUATEMALA",
    titulo: "Combustibles a la baja",
    viz: "bomba",
    etiqueta: "−Q2.60 por galón",
    captions: [
      { at: 0.3, text: "Los *combustibles* bajan de precio esta semana" },
      { at: 2.6, text: "la gasolina súper cae #Q2.60# por galón" },
    ],
  },
  {
    seccion: "GUATEMALA",
    titulo: "Alerta por lluvias",
    viz: "lluvia",
    etiqueta: "Alerta amarilla",
    captions: [
      { at: 0.3, text: "Declaran *alerta amarilla* por lluvias intensas" },
      { at: 2.6, text: "se esperan #120# milímetros en dos días" },
    ],
  },
  {
    seccion: "GUATEMALA",
    titulo: "Exportaciones crecen 8 %",
    viz: "barras",
    etiqueta: "+8 % anual",
    captions: [
      { at: 0.3, text: "Las *exportaciones* siguen en aumento" },
      { at: 2.6, text: "crecen un #8# por ciento este año" },
    ],
  },
  {
    seccion: "INTERNACIONAL",
    titulo: "Acuerdo con la UE",
    viz: "banderas",
    etiqueta: "Acuerdo firmado",
    captions: [
      { at: 0.3, text: "Guatemala y la *Unión Europea* firman acuerdo" },
      { at: 2.6, text: "para ampliar el *comercio* agrícola" },
    ],
  },
  {
    seccion: "INTERNACIONAL",
    titulo: "Ruta marítima bloqueada",
    viz: "barco",
    etiqueta: "Ruta bloqueada",
    captions: [
      { at: 0.3, text: "Una *ruta marítima* clave queda bloqueada" },
      { at: 2.6, text: "y los buques deben *detenerse*" },
    ],
  },
  {
    seccion: "GUATEMALA",
    titulo: "498 capturados en operativos",
    viz: "patrulla",
    etiqueta: "498 capturas",
    captions: [
      { at: 0.3, text: "Operativos en *todo el país*" },
      { at: 2.6, text: "dejan #498# personas capturadas" },
    ],
  },
];

export const FUENTES: { nombre: string; sigla?: string }[] = [
  { nombre: "Medio de ejemplo 1" },
  { nombre: "Medio de ejemplo 2" },
  { nombre: "Agencia de ejemplo", sigla: "AE" },
  { nombre: "Medio de ejemplo 3" },
];

export const FECHA_REFERENCIA = "10 de noviembre de 2026";
