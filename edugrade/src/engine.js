// Motor de evaluación automática: crea ejecuciones, identifica documentos por estudiante
// y procesa la cola con concurrencia limitada, reintentos y guardado progresivo.
import { db, tx, json } from './db.js';
import { config } from './config.js';
import { sha256 } from './security.js';
import { getPdfBuffer } from './file-store.js';
import { matchFile, fileMatchesKeyword, normalizeText } from './matching.js';
import { downloadFile, fileVersion } from './drive.js';
import { inspectPdf, PdfProblem } from './pdf.js';
import { evaluateDocument, computeGrade, TransientAIError, AIProcessingError } from './ai-evaluator.js';
import { rowToRubric, normalizeRubric, httpError } from './rubrics.js';

export const INCIDENT_TYPES = {
  pdf_ilegible: 'PDF ilegible',
  documento_vacio: 'Documento vacío',
  archivo_danado: 'Archivo dañado',
  alumno_no_identificado: 'Alumno no identificado',
  coincidencia_dudosa: 'Coincidencia dudosa',
  rubrica_no_configurada: 'Rúbrica no configurada',
  evidencia_insuficiente: 'Evidencia insuficiente',
  error_procesamiento: 'Error de procesamiento',
};

// Permite sustituir el evaluador en pruebas automatizadas.
let evaluator = evaluateDocument;
let downloader = downloadFile;
export function _setTestHooks({ evaluate, download } = {}) {
  if (evaluate) evaluator = evaluate;
  if (download) downloader = download;
}

const sameText = (a, b) => normalizeText(a) === normalizeText(b);

export function studentsInScope(activity) {
  if (!activity.roster_id) return [];
  return db.prepare('SELECT * FROM students WHERE roster_id = ? AND deleted = 0 ORDER BY order_idx').all(activity.roster_id)
    .filter((s) => (!activity.grade || !s.grade || sameText(s.grade, activity.grade) || normalizeText(activity.grade).includes(normalizeText(s.grade)))
      && (!activity.section || !s.section || sameText(s.section, activity.section)));
}

function addIncident({ runId, itemId = null, fileId = null, fileName = null, studentId = null, type, detail }) {
  db.prepare('INSERT INTO incidents(run_id, item_id, file_id, file_name, student_id, type, detail) VALUES(?,?,?,?,?,?,?)')
    .run(runId, itemId, fileId, fileName, studentId, type, detail || null);
}

function evalHash(activity, rubric) {
  const relevant = {
    level: activity.level, grade: activity.grade, subject: activity.subject, name: activity.name,
    description: activity.description, objectives: activity.objectives, instructions: activity.instructions,
    scale_max: activity.scale_max, criteria: rubric?.criteria,
  };
  return sha256(JSON.stringify(relevant));
}

/** Calcula qué archivos del Drive corresponden a cada estudiante para una actividad. */
export function planDocuments(activity, students) {
  const folderFiles = db.prepare("SELECT * FROM drive_files WHERE sync_state != 'removed' ORDER BY name").all()
    .filter((f) => fileMatchesKeyword(f.name, activity.file_keyword));
  const manual = new Map(
    db.prepare("SELECT * FROM file_matches WHERE roster_id = ? AND status IN ('manual','ignored')").all(activity.roster_id || 0)
      .map((m) => [m.file_id, m]),
  );
  const scopeIds = new Set(students.map((s) => s.id));
  const allRoster = db.prepare('SELECT * FROM students WHERE roster_id = ? AND deleted = 0').all(activity.roster_id || 0);
  const byStudent = new Map();
  const unresolved = [];
  for (const f of folderFiles) {
    const m = manual.get(f.id);
    if (m?.status === 'ignored') continue;
    if (m?.status === 'manual') {
      if (scopeIds.has(m.student_id)) byStudent.set(m.student_id, [...(byStudent.get(m.student_id) || []), f]);
      continue;
    }
    const r = matchFile(f.name, students);
    if (r.status === 'confirmed') byStudent.set(r.studentId, [...(byStudent.get(r.studentId) || []), f]);
    else {
      // Documentos que pertenecen con certeza a estudiantes de otro grado/sección no son incidencias de esta actividad.
      const other = allRoster.length > students.length ? matchFile(f.name, allRoster) : null;
      if (other?.status === 'confirmed' && !scopeIds.has(other.studentId)) continue;
      unresolved.push({ file: f, match: r });
    }
  }
  return { byStudent, unresolved, totalFiles: folderFiles.length };
}

export function createRun(activityId, { force = false, userId = null } = {}) {
  const activityRow = db.prepare('SELECT * FROM activities WHERE id = ?').get(activityId);
  if (!activityRow) throw httpError(404, 'Actividad no encontrada.');
  if (!activityRow.roster_id) throw httpError(400, 'La actividad no tiene un listado de estudiantes asociado.');
  const active = db.prepare("SELECT id FROM runs WHERE activity_id = ? AND status IN ('queued','running','paused')").get(activityId);
  if (active) throw httpError(409, `Ya existe una evaluación en curso para esta actividad (#${active.id}). Reanúdela o cancélela primero.`);

  const rubricRow = activityRow.rubric_id ? db.prepare('SELECT * FROM rubrics WHERE id = ?').get(activityRow.rubric_id) : null;
  let rubric = null;
  let rubricError = null;
  if (!rubricRow) rubricError = 'La actividad no tiene una rúbrica asignada.';
  else {
    try { rubric = normalizeRubric(rowToRubric(rubricRow)); rubric.id = rubricRow.id; } catch (e) { rubricError = `La rúbrica no es válida: ${e.message}`; }
  }

  return tx(() => {
    const status = rubricError ? 'failed' : 'running';
    const run = db.prepare(`INSERT INTO runs(activity_id, activity_snapshot, rubric_snapshot, status, force_reevaluate, eval_hash, created_by, started_at, error)
      VALUES(?,?,?,?,?,?,?,datetime('now'),?)`)
      .run(activityId, JSON.stringify(activityRow), rubric ? JSON.stringify(rubric) : null, status, force ? 1 : 0,
        evalHash(activityRow, rubric), userId, rubricError);
    const runId = Number(run.lastInsertRowid);
    const students = studentsInScope(activityRow);
    const insItem = db.prepare(`INSERT INTO run_items(run_id, student_id, student_name, order_idx, file_id, file_name, file_version, status, error)
      VALUES(?,?,?,?,?,?,?,?,?)`);

    if (rubricError) {
      addIncident({ runId, type: 'rubrica_no_configurada', detail: rubricError });
      for (const s of students) insItem.run(runId, s.id, s.full_name, s.order_idx, null, null, null, 'incident', rubricError);
      db.prepare("UPDATE runs SET finished_at = datetime('now') WHERE id = ?").run(runId);
      return runId;
    }

    const { byStudent, unresolved } = planDocuments(activityRow, students);
    for (const s of students) {
      const files = byStudent.get(s.id) || [];
      if (files.length === 0) {
        insItem.run(runId, s.id, s.full_name, s.order_idx, null, null, null, 'no_document', null);
      } else if (files.length === 1) {
        const f = files[0];
        insItem.run(runId, s.id, s.full_name, s.order_idx, f.id, f.name, fileVersion(f), 'pending', null);
      } else {
        const detail = `Se encontraron ${files.length} documentos para ${s.full_name}: ${files.map((f) => f.name).join(', ')}. Seleccione cuál evaluar.`;
        const item = insItem.run(runId, s.id, s.full_name, s.order_idx, null, null, null, 'incident', detail);
        addIncident({ runId, itemId: Number(item.lastInsertRowid), studentId: s.id, type: 'coincidencia_dudosa',
          detail: JSON.stringify({ message: detail, files: files.map((f) => ({ id: f.id, name: f.name })) }) });
      }
    }
    for (const { file, match } of unresolved) {
      addIncident({
        runId, fileId: file.id, fileName: file.name, studentId: match.studentId,
        type: match.status === 'probable' ? 'coincidencia_dudosa' : 'alumno_no_identificado',
        detail: JSON.stringify({ message: match.reason, candidates: match.candidates }),
      });
    }
    return runId;
  });
}

// ---------------------------------------------------------------------------
// Cola de procesamiento
// ---------------------------------------------------------------------------
const inFlight = new Set();
let timer = null;
let ticking = false;

export function startEngine() {
  // Recuperación tras reinicio: lo que quedó "procesando" vuelve a la cola.
  db.prepare("UPDATE run_items SET status = 'pending' WHERE status = 'processing'").run();
  if (!timer) timer = setInterval(() => { tick().catch((e) => console.error('[engine]', e)); }, 1000);
  timer.unref?.();
}

export function stopEngine() {
  if (timer) clearInterval(timer);
  timer = null;
}

export async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    const free = config.queue.concurrency - inFlight.size;
    if (free > 0) {
      const now = Date.now();
      const exclude = [...inFlight];
      const items = db.prepare(`SELECT i.* FROM run_items i JOIN runs r ON r.id = i.run_id
        WHERE r.status = 'running' AND i.status = 'pending' AND i.next_attempt_at <= ?
        ${exclude.length ? `AND i.id NOT IN (${exclude.map(() => '?').join(',')})` : ''}
        ORDER BY r.id, i.order_idx LIMIT ?`).all(now, ...exclude, free);
      for (const item of items) {
        inFlight.add(item.id);
        db.prepare("UPDATE run_items SET status = 'processing', updated_at = datetime('now') WHERE id = ?").run(item.id);
        processItem(item)
          .catch((e) => console.error('[engine] item', item.id, e))
          .finally(() => inFlight.delete(item.id));
      }
    }
    // Cerrar ejecuciones sin trabajo pendiente.
    const running = db.prepare("SELECT id FROM runs WHERE status = 'running'").all();
    for (const r of running) {
      const left = db.prepare("SELECT COUNT(*) n FROM run_items WHERE run_id = ? AND status IN ('pending','processing')").get(r.id).n;
      if (left === 0) db.prepare("UPDATE runs SET status = 'completed', finished_at = datetime('now') WHERE id = ? AND status = 'running'").run(r.id);
    }
  } finally {
    ticking = false;
  }
}

/** Espera a que la cola procese todo (usado en pruebas). */
export async function drain(timeoutMs = 30000) {
  const start = Date.now();
  for (;;) {
    await tick();
    const left = db.prepare("SELECT COUNT(*) n FROM run_items i JOIN runs r ON r.id = i.run_id WHERE r.status = 'running' AND i.status IN ('pending','processing')").get().n;
    if (left === 0 && inFlight.size === 0) { await tick(); return; }
    if (Date.now() - start > timeoutMs) throw new Error('drain timeout');
    await new Promise((r) => setTimeout(r, 20));
  }
}

function recordChange(itemId, type, prev, next, reason, userId = null) {
  db.prepare('INSERT INTO grade_changes(item_id, change_type, old_score, new_score, old_result, new_result, reason, user_id) VALUES(?,?,?,?,?,?,?,?)')
    .run(itemId, type, prev?.score ?? null, next.score ?? null, prev?.result ?? null, next.result ?? null, reason || null, userId);
}

function toIncident(item, type, message, meta = null) {
  tx(() => {
    db.prepare(`UPDATE run_items SET status = 'incident', error = ?, ai_meta = COALESCE(?, ai_meta), score = NULL, percent = NULL, result = NULL,
      updated_at = datetime('now') WHERE id = ?`).run(message, meta ? JSON.stringify(meta) : null, item.id);
    db.prepare("UPDATE incidents SET status = 'resolved', resolution = 'Reemplazada por una nueva incidencia', resolved_at = datetime('now') WHERE item_id = ? AND status = 'open'").run(item.id);
    addIncident({ runId: item.run_id, itemId: item.id, fileId: item.file_id, fileName: item.file_name, studentId: item.student_id, type, detail: message });
  });
}

function findReusable(run, item) {
  if (run.force_reevaluate || item.force) return null;
  return db.prepare(`SELECT i.* FROM run_items i JOIN runs r ON r.id = i.run_id
    WHERE i.status = 'done' AND i.file_id = ? AND i.file_version = ? AND i.student_id = ? AND r.eval_hash = ? AND i.id != ?
    ORDER BY i.id DESC LIMIT 1`).get(item.file_id, item.file_version, item.student_id, run.eval_hash, item.id);
}

export async function processItem(item) {
  const run = db.prepare('SELECT * FROM runs WHERE id = ?').get(item.run_id);
  const activity = json.parse(run.activity_snapshot);
  const rubric = json.parse(run.rubric_snapshot);
  const scale = { scaleMax: Number(activity.scale_max), passMark: Number(activity.pass_mark) };

  // Prevención de evaluaciones duplicadas: mismo archivo, misma versión, misma actividad y rúbrica.
  const prev = findReusable(run, item);
  if (prev) {
    // Se conserva la nota previa (incluidas las modificaciones manuales del docente).
    const grade = { score: prev.score, percent: prev.percent, result: prev.score >= scale.passMark ? 'APROBADO' : 'NO APROBADO' };
    db.prepare(`UPDATE run_items SET status='done', score=?, percent=?, result=?, criteria_scores=?, feedback=?, ai_meta=?, reused_from=?, error=NULL, updated_at=datetime('now') WHERE id=?`)
      .run(grade.score, grade.percent, grade.result, prev.criteria_scores, prev.feedback, prev.ai_meta, prev.id, item.id);
    recordChange(item.id, 'ai', null, grade, `Resultado reutilizado de la evaluación #${prev.run_id} (documento sin cambios).`);
    return;
  }

  const attempt = item.attempts + 1;
  db.prepare('UPDATE run_items SET attempts = ? WHERE id = ?').run(attempt, item.id);
  try {
    const pdf = await getPdfBuffer(item.file_id, item.file_version, downloader);
    const info = await inspectPdf(pdf);
    const out = await evaluator({ pdfBuffer: pdf, activity, rubric, studentName: item.student_name, pdfInfo: info });
    const grade = computeGrade(out.criteria, scale);
    const feedback = { strengths: out.strengths, difficulties: out.difficulties, recommendations: out.recommendations, observation: out.observation };
    tx(() => {
      db.prepare(`UPDATE run_items SET status='done', score=?, percent=?, result=?, criteria_scores=?, feedback=?, ai_meta=?, error=NULL, force=0, updated_at=datetime('now') WHERE id=?`)
        .run(grade.score, grade.percent, grade.result, JSON.stringify(out.criteria), JSON.stringify(feedback),
          JSON.stringify({ ...out.meta, pages: info.pages, likelyScanned: info.likelyScanned }), item.id);
      recordChange(item.id, item.score === null || item.score === undefined ? 'ai' : 'reevaluation', item, grade, 'Evaluación automática por IA');
    });
  } catch (e) {
    if (e instanceof PdfProblem) return toIncident(item, e.type, e.message);
    if (e instanceof AIProcessingError) return toIncident(item, e.incidentType, e.message, e.meta);
    if (e?.permanent) {
      // Error de configuración global (p. ej. sin clave de IA): se pausa la ejecución sin perder el progreso.
      db.prepare("UPDATE run_items SET status='pending', attempts = attempts - 1 WHERE id = ?").run(item.id);
      db.prepare("UPDATE runs SET status='paused', error=? WHERE id=?").run(e.message, item.run_id);
      return;
    }
    const transient = e instanceof TransientAIError || isNetworkError(e);
    if (transient && attempt < config.queue.maxAttempts) {
      const delay = Math.min(5 * 60_000, 2000 * 2 ** (attempt - 1));
      db.prepare("UPDATE run_items SET status='pending', next_attempt_at=?, error=?, updated_at=datetime('now') WHERE id=?")
        .run(Date.now() + delay, `Reintento ${attempt}/${config.queue.maxAttempts - 1}: ${e.message}`, item.id);
      return;
    }
    const msg = driveErrorMessage(e) || e?.message || String(e);
    return toIncident(item, 'error_procesamiento', `${msg}${transient ? ` (tras ${attempt} intentos)` : ''}`);
  }
}

function isNetworkError(e) {
  const code = e?.code || e?.cause?.code;
  const status = e?.status || e?.response?.status;
  return ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'UND_ERR_SOCKET'].includes(code)
    || status === 429 || (status >= 500 && status < 600);
}

function driveErrorMessage(e) {
  const status = e?.status || e?.response?.status;
  if (status === 404) return 'El archivo ya no existe en Google Drive o no hay permiso para leerlo.';
  if (status === 401 || status === 403) return 'Google Drive denegó el acceso al archivo. Vuelva a conectar la cuenta.';
  return null;
}

// ---------------------------------------------------------------------------
// Control de ejecuciones e incidencias
// ---------------------------------------------------------------------------
export function setRunStatus(runId, action) {
  const run = db.prepare('SELECT * FROM runs WHERE id = ?').get(runId);
  if (!run) throw httpError(404, 'Evaluación no encontrada.');
  if (action === 'pause') {
    if (run.status !== 'running') throw httpError(409, 'Solo se puede pausar una evaluación en curso.');
    db.prepare("UPDATE runs SET status='paused' WHERE id=?").run(runId);
  } else if (action === 'resume') {
    if (!['paused', 'completed'].includes(run.status)) throw httpError(409, 'La evaluación no está pausada.');
    db.prepare("UPDATE runs SET status='running', error=NULL, finished_at=NULL WHERE id=?").run(runId);
  } else if (action === 'cancel') {
    if (!['running', 'paused', 'queued'].includes(run.status)) throw httpError(409, 'La evaluación ya finalizó.');
    db.prepare("UPDATE runs SET status='cancelled', finished_at=datetime('now') WHERE id=?").run(runId);
  } else throw httpError(400, 'Acción no válida.');
}

function reopenRun(runId) {
  db.prepare("UPDATE runs SET status='running', finished_at=NULL WHERE id=? AND status IN ('completed','paused')").run(runId);
}

export function requeueItem(itemId, { force = true } = {}) {
  const item = db.prepare('SELECT * FROM run_items WHERE id = ?').get(itemId);
  if (!item) throw httpError(404, 'Registro no encontrado.');
  if (!item.file_id) throw httpError(409, 'El estudiante no tiene un documento asignado.');
  const run = db.prepare('SELECT status FROM runs WHERE id = ?').get(item.run_id);
  if (run.status === 'cancelled' || run.status === 'failed') throw httpError(409, 'La evaluación fue cancelada; inicie una nueva.');
  tx(() => {
    db.prepare("UPDATE run_items SET status='pending', attempts=0, next_attempt_at=0, force=?, error=NULL, updated_at=datetime('now') WHERE id=?").run(force ? 1 : 0, itemId);
    db.prepare("UPDATE incidents SET status='resolved', resolution='Reevaluación solicitada', resolved_at=datetime('now') WHERE item_id=? AND status='open'").run(itemId);
    reopenRun(item.run_id);
  });
}

/** Asigna manualmente un archivo a un estudiante dentro de una ejecución y lo encola. */
export function assignFile({ runId, fileId, studentId, incidentId = null, remember = true }) {
  const run = db.prepare('SELECT * FROM runs WHERE id = ?').get(runId);
  if (!run) throw httpError(404, 'Evaluación no encontrada.');
  const file = db.prepare('SELECT * FROM drive_files WHERE id = ?').get(fileId);
  if (!file) throw httpError(404, 'Archivo no encontrado.');
  const item = db.prepare('SELECT * FROM run_items WHERE run_id = ? AND student_id = ?').get(runId, studentId);
  if (!item) throw httpError(404, 'El estudiante no forma parte de esta evaluación.');
  if (item.status === 'processing') throw httpError(409, 'Ese estudiante se está evaluando en este momento.');
  const activity = json.parse(run.activity_snapshot);
  tx(() => {
    if (remember && activity.roster_id) {
      db.prepare(`INSERT INTO file_matches(file_id, roster_id, student_id, status, score, reason) VALUES(?,?,?,'manual',1,'Asignación manual del docente')
        ON CONFLICT(file_id, roster_id) DO UPDATE SET student_id=excluded.student_id, status='manual', score=1, reason=excluded.reason, updated_at=datetime('now')`)
        .run(fileId, activity.roster_id, studentId);
    }
    db.prepare(`UPDATE run_items SET file_id=?, file_name=?, file_version=?, status='pending', attempts=0, next_attempt_at=0, force=1, error=NULL,
      updated_at=datetime('now') WHERE id=?`).run(file.id, file.name, fileVersion(file), item.id);
    db.prepare("UPDATE incidents SET status='resolved', resolution=?, resolved_at=datetime('now') WHERE (item_id=? OR (run_id=? AND file_id=?)) AND status='open'")
      .run(`Documento "${file.name}" asignado a ${item.student_name}`, item.id, runId, fileId);
    if (incidentId) {
      db.prepare("UPDATE incidents SET status='resolved', resolution=?, resolved_at=datetime('now') WHERE id=? AND status='open'")
        .run(`Documento "${file.name}" asignado a ${item.student_name}`, incidentId);
    }
    if (run.status !== 'cancelled' && run.status !== 'failed') reopenRun(runId);
  });
}

export function ignoreFile({ fileId, rosterId }) {
  db.prepare(`INSERT INTO file_matches(file_id, roster_id, student_id, status, reason) VALUES(?,?,NULL,'ignored','Ignorado por el docente')
    ON CONFLICT(file_id, roster_id) DO UPDATE SET student_id=NULL, status='ignored', reason=excluded.reason, updated_at=datetime('now')`).run(fileId, rosterId);
}

/** Modificación manual de una nota (queda registrada en el historial de cambios). */
export function overrideGrade(itemId, { score, reason, userId }) {
  const item = db.prepare('SELECT i.*, r.activity_snapshot FROM run_items i JOIN runs r ON r.id = i.run_id WHERE i.id = ?').get(itemId);
  if (!item) throw httpError(404, 'Registro no encontrado.');
  const activity = json.parse(item.activity_snapshot);
  const s = Number(score);
  if (!Number.isFinite(s) || s < 0 || s > Number(activity.scale_max)) throw httpError(400, `La nota debe estar entre 0 y ${activity.scale_max}.`);
  if (!String(reason || '').trim()) throw httpError(400, 'Indique el motivo de la modificación.');
  const result = s >= Number(activity.pass_mark) ? 'APROBADO' : 'NO APROBADO';
  tx(() => {
    db.prepare(`UPDATE run_items SET score=?, percent=?, result=?, status='done', updated_at=datetime('now') WHERE id=?`)
      .run(s, Math.round((s / Number(activity.scale_max)) * 10000) / 100, result, itemId);
    recordChange(itemId, 'manual', item, { score: s, result }, reason, userId);
    db.prepare("UPDATE incidents SET status='resolved', resolution='Nota asignada manualmente', resolved_at=datetime('now') WHERE item_id=? AND status='open'").run(itemId);
  });
}
