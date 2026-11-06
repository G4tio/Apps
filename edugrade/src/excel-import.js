// Lectura de listados de estudiantes (.xlsx / .xls) con SheetJS.
// El archivo original se conserva intacto (se guarda tal cual en la base de datos).
import * as XLSX from 'xlsx';
import { normalizeText, duplicateKey } from './matching.js';

const NAME_HINTS = ['nombre completo', 'nombres y apellidos', 'apellidos y nombres', 'alumno', 'estudiante', 'nombre del alumno', 'nombre del estudiante', 'nombre', 'nombres'];
const FIRST_HINTS = ['nombres', 'nombre', 'primer nombre'];
const LAST_HINTS = ['apellidos', 'apellido'];
const CODE_HINTS = ['codigo', 'codigo personal', 'carne', 'carnet', 'clave', 'id', 'matricula', 'cui', 'codigo mineduc', 'codigo del estudiante'];
const GRADE_HINTS = ['grado', 'curso', 'ano'];
const SECTION_HINTS = ['seccion', 'sec'];
const LEVEL_HINTS = ['nivel', 'nivel educativo'];

export function readWorkbook(buffer) {
  return XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true, dense: false });
}

export function sheetRows(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`La hoja "${sheetName}" no existe en el archivo.`);
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false, blankrows: true });
}

function findHeaderRow(rows) {
  // Primera fila (de las 15 primeras) que tenga al menos 2 celdas de texto y una pista de "nombre".
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const cells = rows[i].map((c) => normalizeText(c));
    if (cells.filter(Boolean).length >= 1 && cells.some((c) => NAME_HINTS.some((h) => c === h || c.startsWith(h)))) return i;
  }
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    if (rows[i].filter((c) => String(c).trim()).length >= 2) return i;
  }
  return 0;
}

function findCol(headers, hints, exclude = []) {
  const norm = headers.map((h) => normalizeText(h));
  for (const hint of hints) {
    const idx = norm.findIndex((h, i) => !exclude.includes(i) && h === hint);
    if (idx >= 0) return idx;
  }
  for (const hint of hints) {
    const idx = norm.findIndex((h, i) => !exclude.includes(i) && h && (h.startsWith(hint + ' ') || h.endsWith(' ' + hint)));
    if (idx >= 0) return idx;
  }
  return -1;
}

function guessNameColumnByContent(rows, headerRow) {
  // Columna con más celdas que parecen nombres (2+ palabras alfabéticas).
  const sample = rows.slice(headerRow + 1, headerRow + 40);
  const width = Math.max(0, ...sample.map((r) => r.length));
  let best = -1;
  let bestCount = 0;
  for (let c = 0; c < width; c++) {
    const count = sample.filter((r) => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'.-]+(\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'.-]+)+$/.test(String(r[c] ?? '').trim())).length;
    if (count > bestCount) { bestCount = count; best = c; }
  }
  return best;
}

/** Propone el mapeo de columnas para una hoja. */
export function detectMapping(rows) {
  const headerRow = findHeaderRow(rows);
  const headers = (rows[headerRow] || []).map((h) => String(h ?? '').trim());
  const mapping = { headerRow, name: -1, firstName: -1, lastName: -1, code: -1, grade: -1, section: -1, level: -1 };

  const firstIdx = findCol(headers, FIRST_HINTS);
  const lastIdx = findCol(headers, LAST_HINTS);
  const fullIdx = findCol(headers, ['nombre completo', 'nombres y apellidos', 'apellidos y nombres', 'alumno', 'estudiante', 'nombre del alumno', 'nombre del estudiante']);
  if (fullIdx >= 0) mapping.name = fullIdx;
  else if (firstIdx >= 0 && lastIdx >= 0 && firstIdx !== lastIdx) { mapping.firstName = firstIdx; mapping.lastName = lastIdx; }
  else if (firstIdx >= 0) mapping.name = firstIdx;
  else mapping.name = guessNameColumnByContent(rows, headerRow);

  const used = [mapping.name, mapping.firstName, mapping.lastName].filter((i) => i >= 0);
  mapping.code = findCol(headers, CODE_HINTS, used);
  mapping.grade = findCol(headers, GRADE_HINTS, used);
  mapping.section = findCol(headers, SECTION_HINTS, used);
  mapping.level = findCol(headers, LEVEL_HINTS, used);
  return { mapping, headers };
}

function cell(row, idx) {
  return idx >= 0 ? String(row[idx] ?? '').replace(/\s+/g, ' ').trim() : '';
}

/** Extrae estudiantes según el mapeo; conserva el índice de fila original. */
export function extractStudents(rows, mapping) {
  const students = [];
  for (let r = mapping.headerRow + 1; r < rows.length; r++) {
    const row = rows[r] || [];
    let fullName = '';
    if (mapping.name >= 0) fullName = cell(row, mapping.name);
    else if (mapping.firstName >= 0 || mapping.lastName >= 0) {
      fullName = [cell(row, mapping.firstName), cell(row, mapping.lastName)].filter(Boolean).join(' ');
    }
    if (!fullName || !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(fullName)) continue;
    students.push({
      row_index: r,
      full_name: fullName,
      code: cell(row, mapping.code) || null,
      grade: cell(row, mapping.grade) || null,
      section: cell(row, mapping.section) || null,
      level: cell(row, mapping.level) || null,
    });
  }
  return students;
}

/** Marca duplicados por nombre normalizado o por código. */
export function findDuplicates(students) {
  const byName = new Map();
  const byCode = new Map();
  students.forEach((s, i) => {
    const k = duplicateKey(s.full_name);
    if (k) byName.set(k, [...(byName.get(k) || []), i]);
    if (s.code) {
      const c = String(s.code).toLowerCase();
      byCode.set(c, [...(byCode.get(c) || []), i]);
    }
  });
  const dup = new Set();
  for (const list of [...byName.values(), ...byCode.values()]) if (list.length > 1) list.forEach((i) => dup.add(i));
  return dup;
}

export function previewWorkbook(buffer, sheetName) {
  const wb = readWorkbook(buffer);
  const sheets = wb.SheetNames;
  const target = sheetName && sheets.includes(sheetName) ? sheetName : sheets[0];
  const rows = sheetRows(wb, target);
  const { mapping, headers } = detectMapping(rows);
  return { sheets, sheet: target, headers, mapping, rows: rows.slice(0, 200), totalRows: rows.length };
}
