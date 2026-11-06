// Exportación de resultados a Excel con formato profesional (ExcelJS).
// El archivo original nunca se modifica: se genera una copia nueva que conserva el
// listado original y agrega las columnas de resultados.
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { db, json } from './db.js';
import { runItems, runSummary } from './stats.js';
import { INCIDENT_TYPES } from './engine.js';

const COLORS = {
  navy: 'FF0B1F3A',
  electric: 'FF1E6BFF',
  green: 'FF16A34A',
  greenLight: 'FFDCFCE7',
  redLight: 'FFFEE2E2',
  amberLight: 'FFFEF3C7',
  grayLight: 'FFF1F5F9',
  blueLight: 'FFDBEAFE',
};

const STATUS_FILL = {
  'APROBADO': COLORS.greenLight,
  'NO APROBADO': COLORS.redLight,
  'REVISIÓN NECESARIA': COLORS.amberLight,
  'SIN DOCUMENTO': COLORS.grayLight,
  'PENDIENTE': COLORS.blueLight,
};

function styleHeader(row, color = COLORS.navy) {
  row.eachCell((c) => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    c.border = { bottom: { style: 'thin', color: { argb: 'FF94A3B8' } } };
  });
  row.height = 30;
}

function fill(cell, argb) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function addTableSheet(wb, name, columns, rows, { statusKey = null, headerColor } = {}) {
  const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width || 16, style: c.style }));
  styleHeader(ws.getRow(1), headerColor);
  rows.forEach((r) => {
    const row = ws.addRow(r);
    row.alignment = { vertical: 'top', wrapText: true };
    if (statusKey && STATUS_FILL[r[statusKey]]) fill(row.getCell(statusKey), STATUS_FILL[r[statusKey]]);
  });
  if (rows.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1 + rows.length, column: columns.length } };
  return ws;
}

function observationText(it) {
  if (it.status === 'done') return it.feedback?.observation || '';
  if (it.status === 'no_document') return 'No se encontró el documento del estudiante en la carpeta de Google Drive.';
  if (it.status === 'incident') return `Revisión necesaria: ${it.error || 'incidencia pendiente'}`;
  return 'Evaluación pendiente.';
}

export async function buildRunWorkbook(runId) {
  const data = runItems(runId);
  if (!data) return null;
  const { run, items } = data;
  const activity = run.activity;
  const summary = runSummary(runId);
  const rubric = run.rubric;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'EduGrade AI';
  wb.created = new Date();

  // ---- Hoja 1: Resultados generales (listado original + columnas nuevas) ----
  const roster = activity.roster_id ? db.prepare('SELECT * FROM rosters WHERE id = ?').get(activity.roster_id) : null;
  const byStudent = new Map(items.map((i) => [i.student_id, i]));
  const ws1 = wb.addWorksheet('Resultados generales');
  const extraHeaders = ['Nota final', 'Resultado', 'Estado de evaluación', 'Observaciones'];

  if (roster) {
    const mapping = json.parse(roster.mapping, {});
    const owb = XLSX.read(roster.original_file, { type: 'buffer', cellDates: true });
    const rows = XLSX.utils.sheet_to_json(owb.Sheets[roster.sheet_name], { header: 1, defval: null, raw: true, blankrows: true });
    const width = Math.max(1, ...rows.map((r) => r.length));
    const studentsByRow = new Map(db.prepare('SELECT * FROM students WHERE roster_id = ? AND row_index IS NOT NULL').all(roster.id).map((s) => [s.row_index, s]));
    const headerRow = mapping.headerRow ?? 0;

    rows.forEach((r, idx) => {
      const values = Array.from({ length: width }, (_, c) => (r[c] === undefined ? null : r[c]));
      if (idx === headerRow) values.push(...extraHeaders);
      else if (idx > headerRow) {
        const st = studentsByRow.get(idx);
        const it = st ? byStudent.get(st.id) : null;
        if (it) values.push(it.status === 'done' ? it.score : null, it.status === 'done' ? it.result : '', it.display_status, observationText(it));
        else if (st?.deleted) values.push(null, '', 'EXCLUIDO DEL LISTADO', '');
        else if (st) values.push(null, '', 'NO INCLUIDO EN ESTA ACTIVIDAD', '');
      }
      const row = ws1.addRow(values);
      if (idx === headerRow) {
        styleHeader(row);
      } else if (idx > headerRow && values.length > width) {
        const status = values[width + 2];
        const cell = ws1.getCell(row.number, width + 3);
        if (STATUS_FILL[status]) fill(cell, STATUS_FILL[status]);
        const res = ws1.getCell(row.number, width + 2);
        if (res.value === 'APROBADO') res.font = { bold: true, color: { argb: COLORS.green } };
        if (res.value === 'NO APROBADO') res.font = { bold: true, color: { argb: 'FFDC2626' } };
        ws1.getCell(row.number, width + 4).alignment = { wrapText: true, vertical: 'top' };
      }
    });
    // Estudiantes agregados manualmente (no existen en el archivo original).
    const manual = db.prepare('SELECT * FROM students WHERE roster_id = ? AND row_index IS NULL AND deleted = 0 ORDER BY order_idx').all(roster.id);
    const nameCol = mapping.name >= 0 ? mapping.name : Math.max(0, mapping.firstName ?? 0);
    for (const st of manual) {
      const it = byStudent.get(st.id);
      const values = Array.from({ length: width }, () => null);
      values[nameCol] = st.full_name;
      if (mapping.code >= 0) values[mapping.code] = st.code;
      if (mapping.grade >= 0) values[mapping.grade] = st.grade;
      if (mapping.section >= 0) values[mapping.section] = st.section;
      values.push(it?.status === 'done' ? it.score : null, it?.status === 'done' ? it.result : '', it ? it.display_status : 'NO INCLUIDO EN ESTA ACTIVIDAD', it ? `${observationText(it)} (Agregado manualmente en EduGrade AI)` : 'Agregado manualmente en EduGrade AI');
      const row = ws1.addRow(values);
      const status = values[width + 2];
      if (STATUS_FILL[status]) fill(ws1.getCell(row.number, width + 3), STATUS_FILL[status]);
    }
    for (let c = 1; c <= width; c++) ws1.getColumn(c).width = Math.min(40, Math.max(10, ...rows.slice(0, 200).map((r) => String(r[c - 1] ?? '').length + 2)));
    ws1.getColumn(width + 1).width = 12;
    ws1.getColumn(width + 2).width = 16;
    ws1.getColumn(width + 3).width = 24;
    ws1.getColumn(width + 4).width = 70;
    ws1.getColumn(width + 1).numFmt = '0.00';
    ws1.views = [{ state: 'frozen', ySplit: headerRow + 1 }];
    ws1.autoFilter = { from: { row: headerRow + 1, column: 1 }, to: { row: ws1.rowCount, column: width + 4 } };
  }

  // ---- Hoja 2: Desglose de rúbrica ----
  const criteria = rubric?.criteria || [];
  addTableSheet(wb, 'Desglose de rúbrica', [
    { header: 'No.', key: 'n', width: 6 },
    { header: 'Estudiante', key: 'name', width: 32 },
    ...criteria.map((c) => ({ header: `${c.name}\n(${c.weight}% · máx. ${c.max_score})`, key: `c_${c.id}`, width: 18 })),
    { header: 'Porcentaje logrado', key: 'percent', width: 14 },
    { header: `Nota final (/${activity.scale_max})`, key: 'score', width: 14 },
    { header: 'Resultado', key: 'status', width: 22 },
  ], items.map((it) => {
    const r = { n: it.number, name: it.name, percent: it.percent !== null && it.percent !== undefined ? `${it.percent}%` : '', score: it.status === 'done' ? it.score : '', status: it.display_status };
    for (const c of criteria) {
      const sc = (it.criteria || []).find((x) => String(x.criterion_id) === String(c.id));
      r[`c_${c.id}`] = sc ? `${sc.score} (${sc.level_name || ''})` : '';
    }
    return r;
  }), { statusKey: 'status', headerColor: COLORS.electric });

  // ---- Hoja 3: Retroalimentación ----
  const list = (a) => (a && a.length ? a.map((x) => `• ${x}`).join('\n') : '');
  addTableSheet(wb, 'Retroalimentación', [
    { header: 'No.', key: 'n', width: 6 },
    { header: 'Estudiante', key: 'name', width: 30 },
    { header: 'Resultado', key: 'status', width: 20 },
    { header: 'Fortalezas', key: 'strengths', width: 45 },
    { header: 'Dificultades', key: 'difficulties', width: 45 },
    { header: 'Recomendaciones', key: 'recommendations', width: 45 },
    { header: 'Observación', key: 'observation', width: 60 },
    { header: 'Justificación por criterio', key: 'justification', width: 70 },
  ], items.map((it) => ({
    n: it.number,
    name: it.name,
    status: it.display_status,
    strengths: list(it.feedback?.strengths),
    difficulties: list(it.feedback?.difficulties),
    recommendations: list(it.feedback?.recommendations),
    observation: observationText(it),
    justification: (it.criteria || []).map((c) => `${c.name}: ${c.justification}${c.evidence?.length ? ` Evidencias: ${c.evidence.join('; ')}` : ''}`).join('\n'),
  })), { statusKey: 'status', headerColor: COLORS.electric });

  // ---- Hoja 4: Estadísticas ----
  const ws4 = wb.addWorksheet('Estadísticas');
  ws4.columns = [{ width: 38 }, { width: 22 }];
  const title = ws4.addRow([`EduGrade AI — ${activity.name}`]);
  title.font = { bold: true, size: 14, color: { argb: COLORS.navy } };
  ws4.addRow([`${activity.subject} · ${activity.level}${activity.grade ? ` · ${activity.grade}` : ''}${activity.section ? ` · Sección ${activity.section}` : ''}`]);
  ws4.addRow([`Rúbrica: ${rubric?.name || '—'} · Escala 0–${activity.scale_max} · Nota mínima ${activity.pass_mark}`]);
  ws4.addRow([`Generado: ${new Date().toLocaleString('es-GT')}`]);
  ws4.addRow([]);
  styleHeader(ws4.addRow(['Indicador', 'Valor']));
  const stats = [
    ['Total de estudiantes', summary.total],
    ['Evaluados', summary.evaluated],
    ['Aprobados', summary.approved],
    ['No aprobados', summary.failed],
    ['Promedio general', summary.average ?? '—'],
    ['Porcentaje de aprobación', summary.pass_rate !== null ? `${summary.pass_rate}%` : '—'],
    ['Porcentaje de no aprobación', summary.evaluated ? `${Math.round((summary.failed / summary.evaluated) * 1000) / 10}%` : '—'],
    ['Sin documento', summary.no_document],
    ['Con incidencias / revisión necesaria', summary.errors],
    ['Pendientes', summary.pending],
  ];
  const done = items.filter((i) => i.status === 'done');
  if (done.length) {
    stats.push(['Nota más alta', Math.max(...done.map((i) => i.score))]);
    stats.push(['Nota más baja', Math.min(...done.map((i) => i.score))]);
  }
  stats.forEach(([k, v], idx) => {
    const row = ws4.addRow([k, v]);
    if (idx % 2) row.eachCell((c) => fill(c, COLORS.grayLight));
  });
  if (criteria.length && done.length) {
    ws4.addRow([]);
    styleHeader(ws4.addRow(['Rendimiento por criterio', 'Promedio de logro']), COLORS.electric);
    for (const c of criteria) {
      const vals = done.map((i) => (i.criteria || []).find((x) => String(x.criterion_id) === String(c.id))).filter(Boolean);
      const avg = vals.length ? vals.reduce((a, x) => a + x.score / x.max_score, 0) / vals.length : 0;
      ws4.addRow([c.name, `${Math.round(avg * 1000) / 10}%`]);
    }
    ws4.addRow([]);
    styleHeader(ws4.addRow(['Distribución de calificaciones (%)', 'Estudiantes']), COLORS.electric);
    for (let k = 0; k < 10; k++) {
      const n = done.filter((i) => Math.min(9, Math.floor((i.percent ?? 0) / 10)) === k).length;
      ws4.addRow([`${k * 10}–${k === 9 ? 100 : k * 10 + 9}%`, n]);
    }
  }

  // ---- Hoja 5: Incidencias ----
  const incidents = db.prepare('SELECT * FROM incidents WHERE run_id = ? ORDER BY id').all(runId);
  const incRows = [
    ...items.filter((i) => i.status === 'no_document').map((i) => ({ name: i.name, type: 'Sin documento', file: '', detail: 'No se encontró un PDF identificado para el estudiante.', status: 'Pendiente' })),
    ...incidents.map((inc) => {
      const d = json.parse(inc.detail, null);
      const student = inc.student_id ? db.prepare('SELECT full_name FROM students WHERE id = ?').get(inc.student_id)?.full_name : '';
      return {
        name: student || '',
        type: INCIDENT_TYPES[inc.type] || inc.type,
        file: inc.file_name || '',
        detail: (d && typeof d === 'object' ? d.message : inc.detail) || '',
        status: inc.status === 'open' ? 'Abierta' : inc.status === 'resolved' ? `Resuelta: ${inc.resolution || ''}` : 'Ignorada',
      };
    }),
  ];
  addTableSheet(wb, 'Incidencias', [
    { header: 'Estudiante', key: 'name', width: 30 },
    { header: 'Tipo', key: 'type', width: 24 },
    { header: 'Archivo', key: 'file', width: 36 },
    { header: 'Detalle', key: 'detail', width: 70 },
    { header: 'Estado', key: 'status', width: 30 },
  ], incRows, { headerColor: 'FFB45309' });

  return { workbook: wb, filename: exportFilename(activity, runId) };
}

function exportFilename(activity, runId) {
  const base = `${activity.name || 'evaluacion'}_${activity.grade || ''}_${activity.section || ''}`
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  return `EduGrade_${base}_eval${runId}.xlsx`;
}
