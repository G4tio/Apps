// Algoritmo de coincidencia entre nombres de archivo y registros de estudiantes.
//
// Principio rector: NUNCA asignar automáticamente un documento cuando exista una
// duda significativa. Solo se devuelve "confirmed" cuando la evidencia es fuerte y
// no hay otro estudiante que compita; en cualquier otro caso "probable" o "none".

const NOISE_WORDS = new Set([
  'tarea', 'tareas', 'actividad', 'actividades', 'trabajo', 'trabajos', 'final', 'pdf', 'doc', 'docx',
  'hoja', 'hojas', 'ejercicio', 'ejercicios', 'proyecto', 'ensayo', 'entrega', 'entregable', 'informe',
  'reporte', 'investigacion', 'examen', 'prueba', 'practica', 'laboratorio', 'lab', 'guia', 'taller',
  'scan', 'scanned', 'escaneo', 'escaneado', 'img', 'imagen', 'foto', 'copia', 'documento', 'version',
  'grado', 'seccion', 'alumno', 'alumna', 'estudiante', 'nombre', 'apellido', 'unidad', 'bloque',
  'bimestre', 'trimestre', 'semana', 'clase', 'curso', 'materia', 'parte', 'pag', 'pagina', 'no', 'num',
  'primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'basico', 'primaria', 'diversificado',
  'matematica', 'matematicas', 'lenguaje', 'comunicacion', 'ciencias', 'sociales', 'naturales', 'ingles',
  'idioma', 'fisica', 'quimica', 'biologia', 'historia', 'arte', 'musica', 'computacion', 'mate', 'final',
  'copy', 'new', 'nuevo', 'nueva', 'corregido', 'corregida', 'v', 'a', 'b', 'c', 'd', 'e', 'f',
]);

// Partículas frecuentes en nombres hispanos que no aportan identidad.
const NAME_PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'da', 'do', 'dos', 'van', 'von', 'san']);

export function normalizeText(s) {
  return String(s ?? '')
    .replace(/\.(pdf|docx?|jpe?g|png)$/i, '')
    .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2') // AnaLopez -> Ana Lopez
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ñ/g, 'n')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function nameTokens(fullName) {
  return normalizeText(fullName).split(' ').filter((t) => t && !NAME_PARTICLES.has(t) && !/^\d+$/.test(t));
}

export function fileTokens(fileName) {
  return normalizeText(fileName)
    .split(' ')
    .filter((t) => t && !NAME_PARTICLES.has(t));
}

function fileNameLikeTokens(tokens) {
  return tokens.filter((t) => !NOISE_WORDS.has(t) && !/^\d+$/.test(t) && t.length > 1);
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

function tokenSimilarity(a, b) {
  if (a === b) return 1;
  if (a.length < 4 || b.length < 4) return 0;
  const d = levenshtein(a, b);
  const ratio = 1 - d / Math.max(a.length, b.length);
  return ratio >= 0.8 ? ratio : 0;
}

function normalizeCode(code) {
  return String(code ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function codeInFile(code, fileName) {
  const c = normalizeCode(code);
  if (c.length < 3) return false;
  const tokens = String(fileName).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/);
  if (tokens.includes(c)) return true;
  // Códigos alfanuméricos largos (p. ej. "A12345", "2024-0153") pueden ir pegados a otro texto.
  const compact = tokens.join('');
  return c.length >= 5 && /\d/.test(c) && compact.includes(c);
}

/** Puntúa un estudiante frente a un nombre de archivo. */
export function scoreStudent(student, fileName) {
  const fTokensAll = fileTokens(fileName);
  const fTokens = fileNameLikeTokens(fTokensAll);
  const sTokens = nameTokens(student.full_name);
  if (student.code && codeInFile(student.code, fileName)) {
    return { exact: sTokens.length, fuzzy: 0, score: 1, byCode: true, coverage: 1, precision: 1 };
  }
  if (!sTokens.length || !fTokens.length) return { exact: 0, fuzzy: 0, score: 0, byCode: false, coverage: 0, precision: 0 };

  const usedFile = new Set();
  let exact = 0;
  let fuzzy = 0;
  let weight = 0;
  for (const st of sTokens) {
    let bestIdx = -1;
    let bestSim = 0;
    fTokens.forEach((ft, idx) => {
      if (usedFile.has(idx)) return;
      const sim = tokenSimilarity(st, ft);
      if (sim > bestSim) { bestSim = sim; bestIdx = idx; }
    });
    if (bestIdx >= 0) {
      usedFile.add(bestIdx);
      if (bestSim === 1) exact++; else fuzzy++;
      weight += bestSim === 1 ? 1 : 0.8 * bestSim;
    }
  }
  const coverage = weight / sTokens.length;      // qué parte del nombre del alumno aparece
  const precision = weight / fTokens.length;     // qué parte del nombre del archivo se explica
  const score = coverage + precision === 0 ? 0 : (2 * coverage * precision) / (coverage + precision);
  return { exact, fuzzy, score, byCode: false, coverage, precision };
}

export const MATCH_THRESHOLDS = {
  confirmedMinScore: 0.66,
  confirmedMinExactTokens: 2,
  confirmedMinMargin: 0.25,
  probableMinScore: 0.4,
};

/**
 * Determina a qué estudiante pertenece un archivo.
 * @returns {{status:'confirmed'|'probable'|'none', studentId:number|null, score:number, reason:string, candidates:Array}}
 */
export function matchFile(fileName, students) {
  const scored = students
    .map((s) => ({ student: s, ...scoreStudent(s, fileName) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.exact - a.exact);

  const candidates = scored.slice(0, 3).map((r) => ({
    studentId: r.student.id,
    name: r.student.full_name,
    score: Math.round(r.score * 100) / 100,
    byCode: r.byCode,
  }));

  if (!scored.length) {
    return { status: 'none', studentId: null, score: 0, reason: 'Ningún nombre o código del listado aparece en el nombre del archivo.', candidates };
  }
  const best = scored[0];
  const second = scored[1];

  const codeHits = scored.filter((r) => r.byCode);
  if (codeHits.length === 1) {
    return { status: 'confirmed', studentId: best.student.id, score: 1, reason: `Código de estudiante (${best.student.code}) encontrado en el nombre del archivo.`, candidates };
  }
  if (codeHits.length > 1) {
    return { status: 'probable', studentId: null, score: 1, reason: 'El nombre del archivo contiene códigos de varios estudiantes.', candidates };
  }

  const margin = second ? best.score - second.score : best.score;
  const T = MATCH_THRESHOLDS;
  if (best.exact >= T.confirmedMinExactTokens && best.score >= T.confirmedMinScore && margin >= T.confirmedMinMargin) {
    return {
      status: 'confirmed',
      studentId: best.student.id,
      score: best.score,
      reason: `Coinciden ${best.exact} palabra(s) del nombre${best.fuzzy ? ` y ${best.fuzzy} con variación ortográfica` : ''}.`,
      candidates,
    };
  }
  if (best.score >= T.probableMinScore || best.exact + best.fuzzy >= 1) {
    let reason;
    if (second && margin < T.confirmedMinMargin) reason = `Varios estudiantes son compatibles (${best.student.full_name} / ${second.student.full_name}).`;
    else if (best.exact < T.confirmedMinExactTokens) reason = 'Solo coincide parcialmente el nombre (una palabra o con variaciones ortográficas).';
    else reason = 'La coincidencia es parcial y no alcanza el umbral de confirmación.';
    return { status: 'probable', studentId: best.student.id, score: best.score, reason, candidates };
  }
  return { status: 'none', studentId: null, score: best.score, reason: 'No se encontró un estudiante compatible con suficiente certeza.', candidates };
}

export function fileMatchesKeyword(fileName, keyword) {
  if (!keyword || !String(keyword).trim()) return true;
  const f = ` ${normalizeText(fileName)} `;
  const compactF = f.replace(/ /g, '');
  return String(keyword)
    .split(/[,;|]/)
    .map((k) => normalizeText(k))
    .filter(Boolean)
    .some((k) => f.includes(` ${k} `) || compactF.includes(k.replace(/ /g, '')));
}

/** Normalización para detectar duplicados en el listado. */
export function duplicateKey(fullName) {
  return nameTokens(fullName).sort().join(' ');
}
