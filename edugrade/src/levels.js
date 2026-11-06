// Niveles y grados del sistema educativo guatemalteco.
export const LEVELS = {
  'Preprimaria': ['Párvulos 1', 'Párvulos 2', 'Preparatoria'],
  'Primaria': ['Primero Primaria', 'Segundo Primaria', 'Tercero Primaria', 'Cuarto Primaria', 'Quinto Primaria', 'Sexto Primaria'],
  'Básicos': ['Primero Básico', 'Segundo Básico', 'Tercero Básico'],
  'Diversificado': ['Cuarto Diversificado', 'Quinto Diversificado', 'Sexto Diversificado'],
};

// Reglas pedagógicas que se inyectan en la instrucción del evaluador según el nivel.
export const LEVEL_RULES = {
  'Preprimaria': {
    age: '4 a 6 años',
    focus: [
      'Reconoce actividades gráficas: dibujos, trazos, coloreado, recortado, pegado y ejercicios visuales.',
      'Evalúa según indicadores de desarrollo y aprendizaje (motricidad fina, percepción, nociones básicas).',
      'NO penalices errores propios de la etapa de desarrollo: trazos irregulares, salirse ligeramente del contorno, letras o números invertidos, proporciones inexactas.',
      'Valora el esfuerzo, la intención y el avance; no exijas escritura convencional ni ortografía.',
    ],
    tone: 'Retroalimentación muy breve, cálida y positiva, pensada para que un adulto (docente o familia) se la lea al niño. Frases cortas y concretas.',
  },
  'Primaria': {
    age: '7 a 12 años',
    focus: [
      'Evalúa comprensión lectora, operaciones matemáticas, escritura y ortografía acordes al grado, resolución de problemas y desarrollo completo de las actividades.',
      'Considera el grado específico: no exijas en primero o segundo lo que corresponde a sexto.',
    ],
    tone: 'Lenguaje sencillo, motivador y concreto, adecuado para niños; explica qué hizo bien y qué puede mejorar con ejemplos simples.',
  },
  'Básicos': {
    age: '13 a 15 años',
    focus: [
      'Evalúa comprensión conceptual, aplicación de conocimientos, análisis, argumentación y resolución de ejercicios.',
      'Verifica procedimientos además de resultados cuando la rúbrica lo indique.',
    ],
    tone: 'Lenguaje claro y respetuoso para adolescentes; señala fortalezas, errores específicos y pasos concretos de mejora.',
  },
  'Diversificado': {
    age: '16 a 18 años',
    focus: [
      'Evalúa dominio de contenidos, investigación, pensamiento crítico, aplicación práctica, redacción y argumentación.',
      'Valora el uso de fuentes, la coherencia y la profundidad del análisis cuando la rúbrica lo indique.',
    ],
    tone: 'Lenguaje académico y directo; retroalimentación precisa con recomendaciones accionables.',
  },
};

export function isValidLevel(level) {
  return Object.prototype.hasOwnProperty.call(LEVELS, level);
}
