// Cálculo de estadísticas para el dashboard, resultados e historial.
import { db, json } from './db.js';
import { normalizeText } from './matching.js';

export function displayStatus(item) {
  switch (item.status) {
    case 'done': return item.result || 'PENDIENTE';
    case 'no_document': return 'SIN DOCUMENTO';
    case 'incident': return 'REVISIÓN NECESARIA';
    default: return 'PENDIENTE';
  }
}

export function evaluationState(item) {
  return {
    pending: 'En cola', processing: 'Procesando', done: item.reused_from ? 'Evaluado (sin cambios)' : 'Evaluado',
    incident: 'Con incidencia', no_document: 'Sin documento',
  }[item.status] || item.status;
}

export function runItems(runId) {
  const run = db.prepare('SELECT * FROM runs WHERE id = ?').get(runId);
  if (!run) return null;
  const activity = json.parse(run.activity_snapshot, {});
  const rows = db.prepare(`SELECT i.*, s.code, s.grade AS s_grade, s.section AS s_section, s.level AS s_level, f.web_view_link
    FROM run_items i LEFT JOIN students s ON s.id = i.student_id LEFT JOIN drive_files f ON f.id = i.file_id
    WHERE i.run_id = ? ORDER BY i.order_idx`).all(runId);
  const items = rows.map((r, idx) => ({
    id: r.id,
    number: idx + 1,
    student_id: r.student_id,
    name: r.student_name,
    code: r.code,
    level: r.s_level || activity.level,
    grade: r.s_grade || activity.grade,
    section: r.s_section || activity.section,
    activity: activity.name,
    file_id: r.file_id,
    file_name: r.file_name,
    web_view_link: r.web_view_link,
    status: r.status,
    score: r.score,
    percent: r.percent,
    result: r.result,
    display_status: displayStatus(r),
    evaluation_state: evaluationState(r),
    criteria: json.parse(r.criteria_scores, []),
    feedback: json.parse(r.feedback, null),
    ai_meta: json.parse(r.ai_meta, null),
    error: r.error,
    attempts: r.attempts,
    reused_from: r.reused_from,
    updated_at: r.updated_at,
  }));
  return { run: { ...run, activity, rubric: json.parse(run.rubric_snapshot, null) }, items };
}

export function runSummary(runId) {
  const r = db.prepare(`SELECT
      COUNT(*) total,
      SUM(status='done') evaluated,
      SUM(status IN ('pending','processing')) pending,
      SUM(status='processing') processing,
      SUM(status='incident') incident_items,
      SUM(status='no_document') no_document,
      SUM(status='done' AND result='APROBADO') approved,
      SUM(status='done' AND result='NO APROBADO') failed,
      AVG(CASE WHEN status='done' THEN score END) average,
      SUM(status='pending' AND error IS NOT NULL) retrying
    FROM run_items WHERE run_id = ?`).get(runId);
  const incidents = db.prepare("SELECT COUNT(*) n FROM incidents WHERE run_id = ? AND status = 'open'").get(runId).n;
  const evaluated = r.evaluated || 0;
  return {
    total: r.total || 0,
    evaluated,
    pending: r.pending || 0,
    processing: r.processing || 0,
    errors: r.incident_items || 0,
    no_document: r.no_document || 0,
    approved: r.approved || 0,
    failed: r.failed || 0,
    average: r.average === null ? null : Math.round(r.average * 100) / 100,
    pass_rate: evaluated ? Math.round(((r.approved || 0) / evaluated) * 1000) / 10 : null,
    open_incidents: incidents,
    retrying: r.retrying || 0,
  };
}

function matches(value, filter) {
  if (!filter) return true;
  return normalizeText(value) === normalizeText(filter);
}

/** Estadísticas del dashboard sobre la última evaluación de cada actividad. */
export function dashboardStats(filters = {}) {
  const runs = db.prepare(`SELECT r.* FROM runs r
    WHERE r.id IN (SELECT MAX(id) FROM runs WHERE status != 'failed' GROUP BY activity_id)
    ORDER BY r.id DESC`).all()
    .map((r) => ({ ...r, activity: json.parse(r.activity_snapshot, {}) }))
    .filter((r) => matches(r.activity.level, filters.level) && matches(r.activity.subject, filters.subject)
      && (!filters.activity || Number(filters.activity) === r.activity_id));

  let items = [];
  for (const r of runs) {
    const data = runItems(r.id);
    for (const it of data.items) items.push({ ...it, run_id: r.id, pass_mark: Number(r.activity.pass_mark), scale_max: Number(r.activity.scale_max), act_grade: r.activity.grade });
  }
  items = items.filter((i) => matches(i.grade || i.act_grade, filters.grade) && matches(i.section, filters.section));

  // Estudiantes registrados
  let students = db.prepare('SELECT * FROM students WHERE deleted = 0').all();
  students = students.filter((s) => matches(s.level, filters.level && s.level ? filters.level : null)
    && matches(s.grade, filters.grade && s.grade ? filters.grade : null)
    && matches(s.section, filters.section && s.section ? filters.section : null));
  if (filters.activity) {
    const ids = new Set(items.map((i) => i.student_id));
    students = students.filter((s) => ids.has(s.id));
  }

  const docs = db.prepare("SELECT COUNT(*) n FROM drive_files WHERE sync_state != 'removed'").get().n;
  const identified = db.prepare(`SELECT COUNT(DISTINCT m.file_id) n FROM file_matches m JOIN drive_files f ON f.id = m.file_id
    WHERE f.sync_state != 'removed' AND m.status IN ('confirmed','manual')`).get().n;

  const done = items.filter((i) => i.status === 'done');
  const approved = done.filter((i) => i.result === 'APROBADO');
  const runIds = runs.map((r) => r.id);
  const openIncidents = runIds.length
    ? db.prepare(`SELECT COUNT(*) n FROM incidents WHERE status='open' AND run_id IN (${runIds.map(() => '?').join(',')})`).get(...runIds).n
    : 0;

  const distribution = Array.from({ length: 10 }, (_, k) => ({ label: `${k * 10}–${k === 9 ? 100 : k * 10 + 9}%`, count: 0 }));
  for (const i of done) distribution[Math.min(9, Math.floor((i.percent ?? 0) / 10))].count++;

  const crit = new Map();
  for (const i of done) {
    for (const c of i.criteria || []) {
      const k = c.name;
      const e = crit.get(k) || { name: k, sum: 0, n: 0 };
      e.sum += c.max_score ? (c.score / c.max_score) * 100 : 0;
      e.n++;
      crit.set(k, e);
    }
  }
  const byGradeMap = new Map();
  for (const i of done) {
    const k = i.grade || i.act_grade || 'Sin grado';
    const e = byGradeMap.get(k) || { grade: k, sum: 0, n: 0, approved: 0 };
    e.sum += i.percent ?? 0;
    e.n++;
    if (i.result === 'APROBADO') e.approved++;
    byGradeMap.set(k, e);
  }

  const reinforcement = done
    .filter((i) => i.result === 'NO APROBADO' || (i.scale_max && i.score < i.pass_mark + i.scale_max * 0.1))
    .sort((a, b) => (a.percent ?? 0) - (b.percent ?? 0))
    .slice(0, 25)
    .map((i) => {
      const weakest = [...(i.criteria || [])].sort((a, b) => a.score / a.max_score - b.score / b.max_score)[0];
      return { item_id: i.id, run_id: i.run_id, name: i.name, grade: i.grade, section: i.section, activity: i.activity, score: i.score, scale_max: i.scale_max, result: i.result, weakest: weakest?.name || null };
    });

  const avgPercent = done.length ? done.reduce((a, i) => a + (i.percent ?? 0), 0) / done.length : null;
  const avgScore = done.length ? done.reduce((a, i) => a + (i.score ?? 0), 0) / done.length : null;
  const scales = [...new Set(done.map((i) => i.scale_max))];

  return {
    totals: {
      students: students.length,
      documents: docs,
      identified,
      evaluated: done.length,
      pending: items.filter((i) => i.status === 'pending' || i.status === 'processing').length,
      incidents: openIncidents,
      approved: approved.length,
      failed: done.length - approved.length,
      average: avgScore === null ? null : Math.round(avgScore * 100) / 100,
      average_percent: avgPercent === null ? null : Math.round(avgPercent * 10) / 10,
      average_scale: scales.length === 1 ? scales[0] : null,
      pass_rate: done.length ? Math.round((approved.length / done.length) * 1000) / 10 : null,
    },
    charts: {
      distribution,
      passFail: { approved: approved.length, failed: done.length - approved.length },
      criteria: [...crit.values()].map((c) => ({ name: c.name, average: Math.round((c.sum / c.n) * 10) / 10 })),
      byGrade: [...byGradeMap.values()].map((g) => ({ grade: g.grade, average: Math.round((g.sum / g.n) * 10) / 10, pass_rate: Math.round((g.approved / g.n) * 1000) / 10, n: g.n })),
    },
    reinforcement,
    runs: runs.map((r) => ({ id: r.id, activity: r.activity.name, status: r.status })),
  };
}

export function historyList() {
  return db.prepare('SELECT * FROM runs ORDER BY id DESC').all().map((r) => {
    const activity = json.parse(r.activity_snapshot, {});
    const rubric = json.parse(r.rubric_snapshot, null);
    return {
      id: r.id,
      activity_id: r.activity_id,
      date: r.created_at,
      finished_at: r.finished_at,
      status: r.status,
      activity: activity.name,
      subject: activity.subject,
      level: activity.level,
      grade: activity.grade,
      section: activity.section,
      rubric: rubric?.name || '—',
      error: r.error,
      ...runSummary(r.id),
    };
  });
}
