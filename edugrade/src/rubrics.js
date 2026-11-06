// Rúbricas: validación, plantillas iniciales e importación (JSON / Excel).
import * as XLSX from 'xlsx';
import { db } from './db.js';
import { normalizeText } from './matching.js';

export function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

/** Valida y normaliza una rúbrica. Lanza un error 400 con el detalle si no es válida. */
export function normalizeRubric(input) {
  const name = String(input?.name || '').trim();
  if (!name) throw httpError(400, 'La rúbrica necesita un nombre.');
  const criteriaIn = Array.isArray(input.criteria) ? input.criteria : [];
  if (!criteriaIn.length) throw httpError(400, 'La rúbrica debe tener al menos un criterio.');
  const usedIds = new Set();
  const criteria = criteriaIn.map((c, i) => {
    const cname = String(c?.name || '').trim();
    if (!cname) throw httpError(400, `El criterio ${i + 1} no tiene nombre.`);
    const weight = Number(c.weight);
    if (!(weight > 0)) throw httpError(400, `La ponderación de "${cname}" debe ser mayor que 0.`);
    const max = Number(c.max_score);
    if (!(max > 0)) throw httpError(400, `La puntuación máxima de "${cname}" debe ser mayor que 0.`);
    let id = String(c.id || '').trim() || `c${i + 1}`;
    while (usedIds.has(id)) id = `${id}_${i + 1}`;
    usedIds.add(id);
    const levels = (Array.isArray(c.levels) ? c.levels : [])
      .map((l) => ({ name: String(l?.name || '').trim(), score: Number(l?.score), descriptor: String(l?.descriptor || '').trim() }))
      .filter((l) => l.name);
    for (const l of levels) {
      if (!Number.isFinite(l.score) || l.score < 0 || l.score > max) {
        throw httpError(400, `El nivel "${l.name}" de "${cname}" debe tener una puntuación entre 0 y ${max}.`);
      }
    }
    levels.sort((a, b) => b.score - a.score);
    const indicators = (Array.isArray(c.indicators) ? c.indicators : String(c.indicators || '').split(/\n|;/))
      .map((s) => String(s).trim())
      .filter(Boolean);
    return { id, name: cname, description: String(c.description || '').trim(), weight, max_score: max, indicators, levels };
  });
  const total = criteria.reduce((a, c) => a + c.weight, 0);
  if (Math.abs(total - 100) > 0.001) {
    throw httpError(400, `La suma de las ponderaciones debe ser exactamente 100 % (actualmente ${Math.round(total * 100) / 100} %).`);
  }
  const passMark = input.pass_mark === '' || input.pass_mark === null || input.pass_mark === undefined ? null : Number(input.pass_mark);
  return {
    name,
    description: String(input.description || '').trim(),
    level: input.level || null,
    subject: input.subject ? String(input.subject).trim() : null,
    activity: input.activity ? String(input.activity).trim() : null,
    is_template: input.is_template ? 1 : 0,
    pass_mark: Number.isFinite(passMark) ? passMark : null,
    criteria,
  };
}

export function rowToRubric(r) {
  if (!r) return null;
  return { ...r, is_template: Boolean(r.is_template), criteria: JSON.parse(r.criteria) };
}

export function saveRubric(data, id = null) {
  const r = normalizeRubric(data);
  if (id) {
    db.prepare(`UPDATE rubrics SET name=?, description=?, level=?, subject=?, activity=?, is_template=?, pass_mark=?, criteria=?, updated_at=datetime('now') WHERE id=?`)
      .run(r.name, r.description, r.level, r.subject, r.activity, r.is_template, r.pass_mark, JSON.stringify(r.criteria), id);
    return Number(id);
  }
  const res = db.prepare('INSERT INTO rubrics(name, description, level, subject, activity, is_template, pass_mark, criteria) VALUES(?,?,?,?,?,?,?,?)')
    .run(r.name, r.description, r.level, r.subject, r.activity, r.is_template, r.pass_mark, JSON.stringify(r.criteria));
  return Number(res.lastInsertRowid);
}

const lv = (name, score, descriptor) => ({ name, score, descriptor });
const four = (max, d) => [lv('Excelente', max, d[0]), lv('Bueno', max * 0.75, d[1]), lv('En proceso', max * 0.5, d[2]), lv('Inicial', max * 0.25, d[3])];

export const BASE_TEMPLATES = [
  {
    name: 'Preprimaria – Actividad gráfica (trazo y coloreado)',
    description: 'Plantilla para hojas de trabajo de trazo, coloreado, dibujo y reconocimiento visual.',
    level: 'Preprimaria', subject: 'Destrezas de aprendizaje', is_template: 1, pass_mark: 60,
    criteria: [
      { id: 'trazo', name: 'Trazo y motricidad fina', weight: 35, max_score: 4, description: 'Realiza los trazos indicados siguiendo la dirección y forma solicitada.',
        indicators: ['Sigue la dirección del trazo', 'Respeta aproximadamente el contorno'], levels: four(4, ['Trazos completos y controlados para su edad', 'Trazos completos con pequeñas irregularidades', 'Completa parte de los trazos', 'Inicia los trazos con apoyo'] ) },
      { id: 'coloreado', name: 'Coloreado', weight: 25, max_score: 4, description: 'Colorea las figuras indicadas.',
        indicators: ['Cubre la mayor parte de la figura', 'Usa los colores indicados cuando se pide'], levels: four(4, ['Colorea todas las figuras cubriendo su superficie', 'Colorea casi todas las figuras', 'Colorea algunas figuras', 'Colorea de forma mínima']) },
      { id: 'consigna', name: 'Cumplimiento de la consigna', weight: 25, max_score: 4, description: 'Responde a lo solicitado en la actividad (identificar, unir, encerrar, contar).',
        indicators: ['Realiza lo que pide cada ejercicio'], levels: four(4, ['Realiza todos los ejercicios correctamente', 'Realiza la mayoría de ejercicios', 'Realiza algunos ejercicios', 'Realiza uno o ningún ejercicio']) },
      { id: 'presentacion', name: 'Completitud y presentación', weight: 15, max_score: 4, description: 'Entrega la hoja completa y cuidada para su edad.',
        indicators: ['Hoja completa', 'Trabajo cuidado'], levels: four(4, ['Completa y cuidada', 'Completa con detalles por mejorar', 'Incompleta', 'Muy incompleta']) },
    ],
  },
  {
    name: 'Primaria – Resolución de problemas matemáticos',
    description: 'Ejercicios de operaciones y problemas contextualizados.',
    level: 'Primaria', subject: 'Matemáticas', is_template: 1, pass_mark: 60,
    criteria: [
      { id: 'operaciones', name: 'Operaciones correctas', weight: 40, max_score: 10, description: 'Resuelve correctamente las operaciones planteadas.',
        indicators: ['Resultados correctos', 'Algoritmos bien aplicados'], levels: four(10, ['Todas o casi todas correctas', 'La mayoría correctas', 'La mitad correctas', 'Pocas correctas']) },
      { id: 'procedimiento', name: 'Procedimiento', weight: 30, max_score: 10, description: 'Muestra el procedimiento ordenado.',
        indicators: ['Escribe los pasos', 'Orden lógico'], levels: four(10, ['Procedimiento completo y claro', 'Procedimiento con omisiones menores', 'Procedimiento parcial', 'Sin procedimiento']) },
      { id: 'problemas', name: 'Interpretación de problemas', weight: 20, max_score: 10, description: 'Comprende qué se pide y responde con una oración.',
        indicators: ['Identifica datos', 'Escribe respuesta completa'], levels: four(10, ['Interpreta y responde todos los problemas', 'Interpreta la mayoría', 'Interpreta algunos', 'No interpreta los problemas']) },
      { id: 'orden', name: 'Orden y presentación', weight: 10, max_score: 10, description: 'Trabajo limpio y legible.',
        indicators: ['Letra legible', 'Organización'], levels: four(10, ['Muy ordenado y legible', 'Ordenado', 'Poco ordenado', 'Desordenado o ilegible']) },
    ],
  },
  {
    name: 'Básicos – Análisis y argumentación',
    description: 'Trabajos de comprensión conceptual, análisis y respuesta argumentada.',
    level: 'Básicos', subject: 'Ciencias Sociales', is_template: 1, pass_mark: 60,
    criteria: [
      { id: 'conceptos', name: 'Comprensión conceptual', weight: 30, max_score: 4, description: 'Explica correctamente los conceptos clave.',
        indicators: ['Define con precisión', 'Sin errores conceptuales'], levels: four(4, ['Conceptos precisos y completos', 'Conceptos correctos con imprecisiones menores', 'Conceptos incompletos', 'Errores conceptuales importantes']) },
      { id: 'aplicacion', name: 'Aplicación de conocimientos', weight: 25, max_score: 4, description: 'Relaciona los conceptos con ejemplos o situaciones.',
        indicators: ['Usa ejemplos pertinentes'], levels: four(4, ['Aplicación pertinente y variada', 'Aplicación adecuada', 'Aplicación limitada', 'Sin aplicación']) },
      { id: 'analisis', name: 'Análisis y argumentación', weight: 30, max_score: 4, description: 'Sostiene sus ideas con razones y evidencias.',
        indicators: ['Argumentos coherentes', 'Usa evidencias'], levels: four(4, ['Argumentación sólida con evidencias', 'Argumentación coherente', 'Argumentación débil', 'Sin argumentación']) },
      { id: 'redaccion', name: 'Redacción y ortografía', weight: 15, max_score: 4, description: 'Expresa las ideas con claridad y corrección.',
        indicators: ['Ortografía', 'Cohesión'], levels: four(4, ['Clara y sin errores relevantes', 'Clara con algunos errores', 'Poco clara o con varios errores', 'Confusa o con muchos errores']) },
    ],
  },
  {
    name: 'Diversificado – Informe de investigación',
    description: 'Informes de investigación con fuentes, análisis crítico y conclusiones.',
    level: 'Diversificado', subject: 'Seminario', is_template: 1, pass_mark: 60,
    criteria: [
      { id: 'dominio', name: 'Dominio del contenido', weight: 25, max_score: 5, description: 'Demuestra conocimiento profundo del tema.',
        indicators: ['Precisión', 'Profundidad'], levels: [lv('Sobresaliente', 5, 'Dominio amplio y preciso'), lv('Satisfactorio', 4, 'Dominio adecuado'), lv('Básico', 3, 'Dominio superficial'), lv('Insuficiente', 1, 'Errores importantes o contenido ausente')] },
      { id: 'investigacion', name: 'Investigación y fuentes', weight: 25, max_score: 5, description: 'Utiliza y cita fuentes confiables.',
        indicators: ['Fuentes variadas', 'Citas y referencias'], levels: [lv('Sobresaliente', 5, 'Fuentes confiables, variadas y bien citadas'), lv('Satisfactorio', 4, 'Fuentes adecuadas con citas'), lv('Básico', 3, 'Pocas fuentes o sin citar'), lv('Insuficiente', 1, 'Sin fuentes')] },
      { id: 'critico', name: 'Pensamiento crítico', weight: 25, max_score: 5, description: 'Analiza, compara y valora la información.',
        indicators: ['Contrasta posturas', 'Conclusiones propias'], levels: [lv('Sobresaliente', 5, 'Análisis crítico original y fundamentado'), lv('Satisfactorio', 4, 'Análisis adecuado'), lv('Básico', 3, 'Mayormente descriptivo'), lv('Insuficiente', 1, 'Sin análisis')] },
      { id: 'redaccion', name: 'Redacción académica', weight: 25, max_score: 5, description: 'Estructura, coherencia y corrección del texto.',
        indicators: ['Estructura', 'Coherencia', 'Ortografía'], levels: [lv('Sobresaliente', 5, 'Texto académico claro y bien estructurado'), lv('Satisfactorio', 4, 'Texto claro con errores menores'), lv('Básico', 3, 'Estructura o redacción deficiente'), lv('Insuficiente', 1, 'Texto desorganizado')] },
    ],
  },
];

export function seedTemplates() {
  const count = db.prepare('SELECT COUNT(*) n FROM rubrics').get().n;
  if (count > 0) return;
  for (const t of BASE_TEMPLATES) saveRubric(t);
}

/**
 * Importa criterios desde Excel. Columnas reconocidas (encabezados en la primera fila):
 * Criterio | Descripción | Ponderación | Puntuación máxima | Indicadores | Niveles
 * Indicadores separados por ";". Niveles con el formato "Excelente:4:descriptor | Bueno:3:descriptor".
 */
export function rubricFromExcel(buffer, name) {
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: false });
  if (rows.length < 2) throw httpError(400, 'El archivo no contiene criterios.');
  const headers = rows[0].map((h) => normalizeText(h));
  const col = (...hints) => headers.findIndex((h) => hints.some((x) => h.startsWith(x)));
  const iName = col('criterio', 'nombre');
  const iDesc = col('descripcion');
  const iWeight = col('ponderacion', 'peso', 'porcentaje');
  const iMax = col('puntuacion maxima', 'puntaje maximo', 'maximo', 'punteo');
  const iInd = col('indicador');
  const iLev = col('nivel');
  if (iName < 0 || iWeight < 0) throw httpError(400, 'El Excel debe tener al menos las columnas "Criterio" y "Ponderación".');
  const criteria = rows.slice(1).filter((r) => String(r[iName]).trim()).map((r, i) => {
    const max = iMax >= 0 ? Number(String(r[iMax]).replace(',', '.')) || 4 : 4;
    const levels = iLev >= 0 && String(r[iLev]).trim()
      ? String(r[iLev]).split('|').map((p) => {
        const [lname, score, ...desc] = p.split(':');
        return { name: lname.trim(), score: Number(String(score).replace(',', '.')), descriptor: desc.join(':').trim() };
      })
      : [];
    return {
      id: `c${i + 1}`,
      name: String(r[iName]).trim(),
      description: iDesc >= 0 ? String(r[iDesc]).trim() : '',
      weight: Number(String(r[iWeight]).replace('%', '').replace(',', '.')),
      max_score: max,
      indicators: iInd >= 0 ? String(r[iInd]).split(';') : [],
      levels,
    };
  });
  return normalizeRubric({ name: name || 'Rúbrica importada', criteria });
}
