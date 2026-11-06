import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { db, tx, json, audit, getSetting, setSetting } from '../db.js';
import { config, integrationStatus } from '../config.js';
import { LEVELS, isValidLevel } from '../levels.js';
import { hashPassword, verifyPassword, randomToken } from '../security.js';
import { createSession, destroySession, currentUser, requireAuth, loginRateLimit } from '../auth.js';
import { previewWorkbook, readWorkbook, sheetRows, extractStudents, findDuplicates } from '../excel-import.js';
import * as drive from '../drive.js';
import { refreshMatches, refreshAllMatches, filesWithMatches } from '../matches.js';
import { saveRubric, rowToRubric, rubricFromExcel, normalizeRubric, httpError } from '../rubrics.js';
import {
  createRun, setRunStatus, requeueItem, assignFile, ignoreFile, overrideGrade, INCIDENT_TYPES,
  studentsInScope, planDocuments, getPdfBuffer,
} from '../engine.js';
import { runItems, runSummary, dashboardStats, historyList } from '../stats.js';
import { buildRunWorkbook } from '../export.js';
import { purgeCache, applyRetention } from '../retention.js';

export const api = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const id = (v) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw httpError(400, 'Identificador no válido.');
  return n;
};

// ---------------------------------------------------------------- Autenticación
api.get('/auth/status', (req, res) => {
  const users = db.prepare('SELECT COUNT(*) n FROM users').get().n;
  res.json({ setupRequired: users === 0, user: currentUser(req) });
});

api.post('/auth/setup', loginRateLimit, (req, res) => {
  if (db.prepare('SELECT COUNT(*) n FROM users').get().n > 0) throw httpError(409, 'La configuración inicial ya se realizó.');
  const { username, password, display_name } = req.body || {};
  validateCredentials(username, password);
  const r = db.prepare('INSERT INTO users(username, display_name, pass_hash) VALUES(?,?,?)')
    .run(String(username).trim().toLowerCase(), display_name || username, hashPassword(password));
  const token = createSession(res, Number(r.lastInsertRowid));
  audit(Number(r.lastInsertRowid), 'setup');
  res.json({ ok: true, token });
});

api.post('/auth/login', loginRateLimit, (req, res) => {
  const { username, password } = req.body || {};
  const u = db.prepare('SELECT * FROM users WHERE username = ?').get(String(username || '').trim().toLowerCase());
  if (!u || !verifyPassword(password || '', u.pass_hash)) throw httpError(401, 'Usuario o contraseña incorrectos.');
  const token = createSession(res, u.id);
  audit(u.id, 'login');
  res.json({ ok: true, token });
});

api.post('/auth/logout', (req, res) => {
  destroySession(req, res);
  res.json({ ok: true });
});

function validateCredentials(username, password) {
  if (!/^[a-zA-Z0-9._-]{3,40}$/.test(String(username || '').trim())) throw httpError(400, 'El usuario debe tener entre 3 y 40 caracteres (letras, números, punto, guion).');
  if (String(password || '').length < 8) throw httpError(400, 'La contraseña debe tener al menos 8 caracteres.');
}

// ---------------------------------------------------------------- OAuth de Google Drive
// El parámetro "state" se guarda en el servidor junto al docente que inició la conexión,
// por lo que funciona tanto desde la página servida como desde el archivo HTML descargado.
const oauthStates = new Map();   // state -> { userId, popup, expires }
const oauthTickets = new Map();  // ticket de un solo uso -> { userId, expires }
function sweep(map) { const now = Date.now(); for (const [k, v] of map) if (v.expires < now) map.delete(k); }

function startOAuth(res, userId, popup) {
  sweep(oauthStates);
  const state = randomToken(24);
  oauthStates.set(state, { userId, popup, expires: Date.now() + 10 * 60_000 });
  res.redirect(drive.getAuthUrl(state));
}

// Inicio desde el archivo HTML descargado: usa un ticket de un solo uso (no expone el token de sesión en la URL).
api.get('/drive/oauth/start-ticket', (req, res) => {
  sweep(oauthTickets);
  const t = oauthTickets.get(String(req.query.ticket || ''));
  oauthTickets.delete(String(req.query.ticket || ''));
  if (!t) return res.status(400).type('html').send(resultPage('El enlace de conexión expiró. Vuelva a intentarlo desde EduGrade AI.', false));
  startOAuth(res, t.userId, true);
});

api.get('/drive/oauth/callback', async (req, res) => {
  sweep(oauthStates);
  const st = oauthStates.get(String(req.query.state || ''));
  oauthStates.delete(String(req.query.state || ''));
  const done = (ok, msg) => {
    if (st?.popup) return res.type('html').send(resultPage(msg, ok));
    return res.redirect(`/#/drive?${ok ? 'drive_connected=1' : `drive_error=${encodeURIComponent(msg)}`}`);
  };
  if (!st) return done(false, 'Parámetro de seguridad inválido o vencido. Vuelva a conectar.');
  if (req.query.error) return done(false, String(req.query.error));
  try {
    const { email } = await drive.handleOAuthCallback(String(req.query.code));
    audit(st.userId, 'drive.connect', { email });
    done(true, `Cuenta de Google conectada${email ? ` (${email})` : ''}. Ya puede cerrar esta pestaña y volver a EduGrade AI.`);
  } catch (e) {
    done(false, e.message);
  }
});

function resultPage(message, ok) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EduGrade AI</title>
  <style>body{font-family:system-ui,sans-serif;background:#0b1f3a;color:#0f172a;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px}
  div{background:#fff;border-radius:16px;padding:28px;max-width:420px;text-align:center}h1{font-size:20px;color:${ok ? '#16a34a' : '#dc2626'}}</style></head>
  <body><div><h1>${ok ? '✅ Listo' : '⚠️ No se pudo conectar'}</h1><p>${String(message).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))}</p></div></body></html>`;
}

// A partir de aquí, todo requiere sesión.
api.use(requireAuth);

api.get('/me', (req, res) => res.json(req.user));

api.get('/users', (req, res) => res.json(db.prepare('SELECT id, username, display_name, created_at FROM users ORDER BY id').all()));
api.post('/users', (req, res) => {
  const { username, password, display_name } = req.body || {};
  validateCredentials(username, password);
  try {
    db.prepare('INSERT INTO users(username, display_name, pass_hash) VALUES(?,?,?)').run(String(username).trim().toLowerCase(), display_name || username, hashPassword(password));
  } catch {
    throw httpError(409, 'Ese usuario ya existe.');
  }
  audit(req.user.id, 'user.create', { username });
  res.json({ ok: true });
});
api.post('/users/me/password', (req, res) => {
  const { current, password } = req.body || {};
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!verifyPassword(current || '', u.pass_hash)) throw httpError(400, 'La contraseña actual no es correcta.');
  validateCredentials(u.username, password);
  db.prepare('UPDATE users SET pass_hash = ? WHERE id = ?').run(hashPassword(password), u.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- Metadatos
api.get('/meta', (req, res) => {
  res.json({ levels: LEVELS, incidentTypes: INCIDENT_TYPES, integrations: integrationStatus() });
});

api.get('/filters', (req, res) => {
  const acts = db.prepare('SELECT id, name, level, grade, section, subject FROM activities ORDER BY name').all();
  const st = db.prepare('SELECT DISTINCT grade, section FROM students WHERE deleted = 0').all();
  const uniq = (a) => [...new Set(a.filter(Boolean))].sort((x, y) => String(x).localeCompare(String(y), 'es'));
  res.json({
    levels: Object.keys(LEVELS),
    grades: uniq([...acts.map((a) => a.grade), ...st.map((s) => s.grade)]),
    sections: uniq([...acts.map((a) => a.section), ...st.map((s) => s.section)]),
    subjects: uniq(acts.map((a) => a.subject)),
    activities: acts.map((a) => ({ id: a.id, name: a.name })),
  });
});

api.get('/dashboard', (req, res) => {
  res.json(dashboardStats({
    level: req.query.level, grade: req.query.grade, section: req.query.section, subject: req.query.subject, activity: req.query.activity,
  }));
});

// ---------------------------------------------------------------- Estudiantes / listados
api.post('/rosters/preview', upload.single('file'), (req, res) => {
  if (!req.file) throw httpError(400, 'Seleccione un archivo Excel.');
  if (!/\.(xlsx|xls)$/i.test(req.file.originalname)) throw httpError(400, 'Formato no admitido. Use .xlsx o .xls.');
  let preview;
  try {
    preview = previewWorkbook(req.file.buffer, req.body.sheet);
  } catch (e) {
    throw httpError(400, `No se pudo leer el archivo: ${e.message}`);
  }
  const mapping = req.body.mapping ? { ...preview.mapping, ...JSON.parse(req.body.mapping) } : preview.mapping;
  const wb = readWorkbook(req.file.buffer);
  const students = extractStudents(sheetRows(wb, preview.sheet), mapping);
  const dups = findDuplicates(students);
  res.json({ ...preview, mapping, students: students.map((s, i) => ({ ...s, duplicate: dups.has(i) })) });
});

api.post('/rosters', upload.single('file'), (req, res) => {
  if (!req.file) throw httpError(400, 'Seleccione un archivo Excel.');
  const sheet = String(req.body.sheet || '');
  const mapping = JSON.parse(req.body.mapping || '{}');
  const wb = readWorkbook(req.file.buffer);
  const rows = sheetRows(wb, sheet);
  const students = extractStudents(rows, mapping);
  if (!students.length) throw httpError(400, 'No se encontraron nombres de estudiantes con el mapeo indicado.');
  const name = String(req.body.name || '').trim() || req.file.originalname.replace(/\.(xlsx|xls)$/i, '');
  const rosterId = tx(() => {
    const r = db.prepare('INSERT INTO rosters(name, original_filename, original_file, sheet_name, header_row, mapping) VALUES(?,?,?,?,?,?)')
      .run(name, req.file.originalname, req.file.buffer, sheet, mapping.headerRow ?? 0, JSON.stringify(mapping));
    const rid = Number(r.lastInsertRowid);
    const ins = db.prepare('INSERT INTO students(roster_id, row_index, order_idx, full_name, code, level, grade, section, source) VALUES(?,?,?,?,?,?,?,?,?)');
    students.forEach((s, i) => ins.run(rid, s.row_index, i + 1, s.full_name, s.code, s.level, s.grade, s.section, 'excel'));
    return rid;
  });
  refreshMatches(rosterId);
  audit(req.user.id, 'roster.import', { rosterId, students: students.length });
  res.json({ id: rosterId, count: students.length });
});

api.get('/rosters', (req, res) => {
  res.json(db.prepare(`SELECT r.id, r.name, r.original_filename, r.sheet_name, r.created_at,
    (SELECT COUNT(*) FROM students s WHERE s.roster_id = r.id AND s.deleted = 0) AS students
    FROM rosters r ORDER BY r.id DESC`).all());
});

api.get('/rosters/:id', (req, res) => {
  const r = db.prepare('SELECT id, name, original_filename, sheet_name, header_row, mapping, created_at FROM rosters WHERE id = ?').get(id(req.params.id));
  if (!r) throw httpError(404, 'Listado no encontrado.');
  const students = db.prepare('SELECT * FROM students WHERE roster_id = ? ORDER BY order_idx').all(r.id);
  const active = students.filter((s) => !s.deleted);
  const dups = findDuplicates(active);
  const dupIds = new Set([...dups].map((i) => active[i].id));
  res.json({ ...r, mapping: json.parse(r.mapping, {}), students: students.map((s) => ({ ...s, duplicate: dupIds.has(s.id) })) });
});

api.get('/rosters/:id/original', (req, res) => {
  const r = db.prepare('SELECT original_filename, original_file FROM rosters WHERE id = ?').get(id(req.params.id));
  if (!r) throw httpError(404, 'Listado no encontrado.');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(r.original_filename)}`);
  res.type(r.original_filename.endsWith('.xls') ? 'application/vnd.ms-excel' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(Buffer.from(r.original_file));
});

api.patch('/rosters/:id', (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) throw httpError(400, 'Indique un nombre.');
  db.prepare('UPDATE rosters SET name = ? WHERE id = ?').run(name, id(req.params.id));
  res.json({ ok: true });
});

api.delete('/rosters/:id', (req, res) => {
  const rid = id(req.params.id);
  db.prepare('DELETE FROM rosters WHERE id = ?').run(rid);
  audit(req.user.id, 'roster.delete', { rosterId: rid });
  res.json({ ok: true });
});

api.post('/rosters/:id/students', (req, res) => {
  const rid = id(req.params.id);
  const { full_name, code, grade, section, level } = req.body || {};
  if (!String(full_name || '').trim()) throw httpError(400, 'Indique el nombre completo.');
  const max = db.prepare('SELECT COALESCE(MAX(order_idx),0) m FROM students WHERE roster_id = ?').get(rid).m;
  const r = db.prepare('INSERT INTO students(roster_id, row_index, order_idx, full_name, code, level, grade, section, source) VALUES(?,?,?,?,?,?,?,?,?)')
    .run(rid, null, max + 1, String(full_name).trim(), code || null, level || null, grade || null, section || null, 'manual');
  refreshMatches(rid);
  res.json({ id: Number(r.lastInsertRowid) });
});

api.delete('/students/:id', (req, res) => {
  const s = db.prepare('SELECT * FROM students WHERE id = ?').get(id(req.params.id));
  if (!s) throw httpError(404, 'Estudiante no encontrado.');
  // Los estudiantes del Excel se marcan como excluidos (el archivo original no se altera);
  // los agregados manualmente se eliminan.
  if (s.source === 'manual') db.prepare('DELETE FROM students WHERE id = ?').run(s.id);
  else db.prepare('UPDATE students SET deleted = 1 WHERE id = ?').run(s.id);
  refreshMatches(s.roster_id);
  res.json({ ok: true });
});

api.post('/students/:id/restore', (req, res) => {
  const s = db.prepare('SELECT * FROM students WHERE id = ?').get(id(req.params.id));
  if (!s) throw httpError(404, 'Estudiante no encontrado.');
  db.prepare('UPDATE students SET deleted = 0 WHERE id = ?').run(s.id);
  refreshMatches(s.roster_id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- Google Drive
api.get('/drive/status', (req, res) => res.json(drive.driveStatus()));

api.get('/drive/oauth/start', (req, res) => startOAuth(res, req.user.id, false));

api.post('/drive/oauth/ticket', (req, res) => {
  sweep(oauthTickets);
  const ticket = randomToken(24);
  oauthTickets.set(ticket, { userId: req.user.id, expires: Date.now() + 2 * 60_000 });
  res.json({ url: `${config.publicUrl}/api/drive/oauth/start-ticket?ticket=${ticket}` });
});

api.post('/drive/disconnect', async (req, res) => {
  await drive.disconnect();
  audit(req.user.id, 'drive.disconnect');
  res.json({ ok: true });
});

api.get('/drive/folders', async (req, res) => {
  res.json(await drive.listFolders({ parentId: req.query.parent || 'root', search: req.query.search || '', sharedWithMe: req.query.shared === '1' }));
});

api.post('/drive/folder', async (req, res) => {
  const folderId = drive.parseFolderId(req.body?.folder);
  if (!folderId) throw httpError(400, 'Indique un enlace o identificador de carpeta válido.');
  const folder = await drive.selectFolder(folderId);
  const summary = await drive.syncFolder();
  refreshAllMatches();
  audit(req.user.id, 'drive.folder', { folder: folder.id });
  res.json({ folder, summary });
});

api.post('/drive/sync', async (req, res) => {
  const summary = await drive.syncFolder();
  refreshAllMatches();
  res.json(summary);
});

api.get('/drive/files', (req, res) => {
  res.json(filesWithMatches(req.query.roster_id ? id(req.query.roster_id) : null));
});

api.post('/drive/files/:fileId/assign', (req, res) => {
  const { roster_id, student_id, ignore } = req.body || {};
  const rid = id(roster_id);
  const fileId = String(req.params.fileId);
  if (ignore) ignoreFile({ fileId, rosterId: rid });
  else if (student_id) {
    db.prepare(`INSERT INTO file_matches(file_id, roster_id, student_id, status, score, reason) VALUES(?,?,?,'manual',1,'Asignación manual del docente')
      ON CONFLICT(file_id, roster_id) DO UPDATE SET student_id=excluded.student_id, status='manual', score=1, reason=excluded.reason, updated_at=datetime('now')`)
      .run(fileId, rid, id(student_id));
  } else {
    db.prepare('DELETE FROM file_matches WHERE file_id = ? AND roster_id = ?').run(fileId, rid);
    refreshMatches(rid);
  }
  res.json({ ok: true });
});

api.get('/drive/files/:fileId/content', async (req, res) => {
  const f = db.prepare('SELECT * FROM drive_files WHERE id = ?').get(String(req.params.fileId));
  if (!f) throw httpError(404, 'Archivo no encontrado.');
  const buf = await getPdfBuffer(f.id, drive.fileVersion(f));
  res.type('application/pdf');
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(f.name)}`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.send(buf);
});

// ---------------------------------------------------------------- Configuración académica
function activityFromBody(b) {
  const level = String(b.level || '');
  if (!isValidLevel(level)) throw httpError(400, 'Seleccione un nivel educativo válido.');
  if (b.grade && !LEVELS[level].includes(b.grade)) throw httpError(400, 'El grado no corresponde al nivel seleccionado.');
  const name = String(b.name || '').trim();
  const subject = String(b.subject || '').trim();
  if (!name) throw httpError(400, 'Indique el nombre de la actividad.');
  if (!subject) throw httpError(400, 'Indique la materia o área curricular.');
  const scaleMax = Number(b.scale_max ?? 100);
  const passMark = Number(b.pass_mark ?? 60);
  if (!(scaleMax > 0)) throw httpError(400, 'La escala de calificación debe ser mayor que 0.');
  if (!(passMark >= 0 && passMark <= scaleMax)) throw httpError(400, `La nota mínima debe estar entre 0 y ${scaleMax}.`);
  return {
    name, level, subject, grade: b.grade || null, section: b.section ? String(b.section).trim() : null,
    description: b.description || '', objectives: b.objectives || '', instructions: b.instructions || '',
    due_date: b.due_date || null, scale_max: scaleMax, pass_mark: passMark,
    rubric_id: b.rubric_id ? id(b.rubric_id) : null, roster_id: b.roster_id ? id(b.roster_id) : null,
    file_keyword: b.file_keyword ? String(b.file_keyword).trim() : null,
  };
}
const ACT_FIELDS = ['name', 'level', 'subject', 'grade', 'section', 'description', 'objectives', 'instructions', 'due_date', 'scale_max', 'pass_mark', 'rubric_id', 'roster_id', 'file_keyword'];

api.get('/activities', (req, res) => {
  res.json(db.prepare(`SELECT a.*, r.name AS rubric_name, ro.name AS roster_name,
      (SELECT id FROM runs WHERE activity_id = a.id ORDER BY id DESC LIMIT 1) AS last_run_id,
      (SELECT status FROM runs WHERE activity_id = a.id ORDER BY id DESC LIMIT 1) AS last_run_status
    FROM activities a LEFT JOIN rubrics r ON r.id = a.rubric_id LEFT JOIN rosters ro ON ro.id = a.roster_id ORDER BY a.updated_at DESC`).all());
});
api.get('/activities/:id', (req, res) => {
  const a = db.prepare('SELECT * FROM activities WHERE id = ?').get(id(req.params.id));
  if (!a) throw httpError(404, 'Actividad no encontrada.');
  res.json(a);
});
api.post('/activities', (req, res) => {
  const a = activityFromBody(req.body || {});
  const r = db.prepare(`INSERT INTO activities(${ACT_FIELDS.join(',')}) VALUES(${ACT_FIELDS.map(() => '?').join(',')})`).run(...ACT_FIELDS.map((f) => a[f]));
  res.json({ id: Number(r.lastInsertRowid) });
});
api.put('/activities/:id', (req, res) => {
  const a = activityFromBody(req.body || {});
  db.prepare(`UPDATE activities SET ${ACT_FIELDS.map((f) => `${f}=?`).join(',')}, updated_at=datetime('now') WHERE id=?`).run(...ACT_FIELDS.map((f) => a[f]), id(req.params.id));
  res.json({ ok: true });
});
api.post('/activities/:id/duplicate', (req, res) => {
  const a = db.prepare('SELECT * FROM activities WHERE id = ?').get(id(req.params.id));
  if (!a) throw httpError(404, 'Actividad no encontrada.');
  a.name = `${a.name} (copia)`;
  const r = db.prepare(`INSERT INTO activities(${ACT_FIELDS.join(',')}) VALUES(${ACT_FIELDS.map(() => '?').join(',')})`).run(...ACT_FIELDS.map((f) => a[f]));
  res.json({ id: Number(r.lastInsertRowid) });
});
api.delete('/activities/:id', (req, res) => {
  db.prepare('DELETE FROM activities WHERE id = ?').run(id(req.params.id));
  res.json({ ok: true });
});

// Verificación previa a «Iniciar evaluación».
api.get('/activities/:id/check', (req, res) => {
  const a = db.prepare('SELECT * FROM activities WHERE id = ?').get(id(req.params.id));
  if (!a) throw httpError(404, 'Actividad no encontrada.');
  const integrations = integrationStatus();
  const problems = [];
  const warnings = [];
  if (!integrations.ai.configured) problems.push('La API de IA no está configurada en el servidor (ANTHROPIC_API_KEY).');
  if (!a.roster_id) problems.push('Asigne un listado de estudiantes a la actividad.');
  let rubric = null;
  if (!a.rubric_id) problems.push('Asigne una rúbrica a la actividad.');
  else {
    const row = db.prepare('SELECT * FROM rubrics WHERE id = ?').get(a.rubric_id);
    try { rubric = normalizeRubric(rowToRubric(row)); } catch (e) { problems.push(`Rúbrica no válida: ${e.message}`); }
  }
  const ds = drive.driveStatus();
  if (!ds.connected || !ds.folder) problems.push('Conecte Google Drive y seleccione la carpeta de tareas.');
  let plan = { students: 0, withDocument: 0, withoutDocument: 0, multiple: 0, unresolved: 0, files: 0 };
  if (a.roster_id) {
    const students = studentsInScope(a);
    const p = planDocuments(a, students);
    const counts = students.map((s) => (p.byStudent.get(s.id) || []).length);
    plan = {
      students: students.length,
      withDocument: counts.filter((c) => c === 1).length,
      multiple: counts.filter((c) => c > 1).length,
      withoutDocument: counts.filter((c) => c === 0).length,
      unresolved: p.unresolved.length,
      files: p.totalFiles,
    };
    if (!students.length) problems.push('No hay estudiantes en el listado para el grado/sección de la actividad.');
    if (plan.unresolved) warnings.push(`${plan.unresolved} documento(s) sin identificar con certeza irán a Incidencias.`);
    if (plan.multiple) warnings.push(`${plan.multiple} estudiante(s) tienen varios documentos; deberá elegir cuál evaluar en Incidencias.`);
  }
  if (ds.lastSync && Date.now() - Date.parse(ds.lastSync) > 60 * 60_000) warnings.push('La carpeta de Drive no se sincroniza desde hace más de una hora.');
  res.json({ ok: problems.length === 0, problems, warnings, plan, rubric: rubric ? { name: rubric.name, criteria: rubric.criteria.length } : null });
});

// ---------------------------------------------------------------- Rúbricas
api.get('/rubrics', (req, res) => res.json(db.prepare('SELECT * FROM rubrics ORDER BY is_template DESC, updated_at DESC').all().map(rowToRubric)));
api.get('/rubrics/:id', (req, res) => {
  const r = rowToRubric(db.prepare('SELECT * FROM rubrics WHERE id = ?').get(id(req.params.id)));
  if (!r) throw httpError(404, 'Rúbrica no encontrada.');
  res.json(r);
});
api.post('/rubrics', (req, res) => res.json({ id: saveRubric(req.body || {}) }));
api.put('/rubrics/:id', (req, res) => res.json({ id: saveRubric(req.body || {}, id(req.params.id)) }));
api.post('/rubrics/:id/duplicate', (req, res) => {
  const r = rowToRubric(db.prepare('SELECT * FROM rubrics WHERE id = ?').get(id(req.params.id)));
  if (!r) throw httpError(404, 'Rúbrica no encontrada.');
  res.json({ id: saveRubric({ ...r, name: `${r.name} (copia)`, is_template: req.body?.as_template ? 1 : 0 }) });
});
api.delete('/rubrics/:id', (req, res) => {
  db.prepare('DELETE FROM rubrics WHERE id = ?').run(id(req.params.id));
  res.json({ ok: true });
});
api.post('/rubrics/import', upload.single('file'), (req, res) => {
  if (!req.file) throw httpError(400, 'Seleccione un archivo (.json, .xlsx o .xls).');
  let data;
  if (/\.json$/i.test(req.file.originalname)) {
    try { data = normalizeRubric(JSON.parse(req.file.buffer.toString('utf8'))); } catch (e) { throw httpError(400, e.status ? e.message : 'El JSON no es válido.'); }
  } else if (/\.(xlsx|xls)$/i.test(req.file.originalname)) {
    data = rubricFromExcel(req.file.buffer, req.body.name || req.file.originalname.replace(/\.(xlsx|xls)$/i, ''));
  } else throw httpError(400, 'Formato no admitido.');
  res.json({ id: saveRubric(data) });
});
api.get('/rubrics/:id/export', (req, res) => {
  const r = rowToRubric(db.prepare('SELECT * FROM rubrics WHERE id = ?').get(id(req.params.id)));
  if (!r) throw httpError(404, 'Rúbrica no encontrada.');
  const { name, description, level, subject, activity, pass_mark, criteria } = r;
  res.setHeader('Content-Disposition', `attachment; filename="rubrica_${r.id}.json"`);
  res.json({ name, description, level, subject, activity, pass_mark, criteria });
});

// ---------------------------------------------------------------- Evaluaciones
api.post('/runs', (req, res) => {
  const runId = createRun(id(req.body?.activity_id), { force: Boolean(req.body?.force), userId: req.user.id });
  audit(req.user.id, 'run.start', { runId });
  res.json({ id: runId });
});
api.get('/runs', (req, res) => res.json(historyList()));
api.get('/runs/active', (req, res) => {
  const runs = db.prepare("SELECT id, activity_snapshot, status, error FROM runs WHERE status IN ('running','paused','queued') OR (finished_at IS NOT NULL AND finished_at > datetime('now','-1 minute')) ORDER BY id").all();
  res.json(runs.map((r) => ({ id: r.id, status: r.status, error: r.error, activity: json.parse(r.activity_snapshot, {}).name, ...runSummary(r.id) })));
});
api.get('/runs/:id', (req, res) => {
  const data = runItems(id(req.params.id));
  if (!data) throw httpError(404, 'Evaluación no encontrada.');
  res.json({ ...data, summary: runSummary(data.run.id) });
});
api.post('/runs/:id/:action', (req, res) => {
  if (!['pause', 'resume', 'cancel'].includes(req.params.action)) throw httpError(404, 'Acción no encontrada.');
  setRunStatus(id(req.params.id), req.params.action);
  res.json({ ok: true });
});
api.delete('/runs/:id', (req, res) => {
  const r = db.prepare('SELECT status FROM runs WHERE id = ?').get(id(req.params.id));
  if (!r) throw httpError(404, 'Evaluación no encontrada.');
  if (['running', 'queued'].includes(r.status)) throw httpError(409, 'Pause o cancele la evaluación antes de eliminarla.');
  db.prepare('DELETE FROM runs WHERE id = ?').run(id(req.params.id));
  audit(req.user.id, 'run.delete', { runId: Number(req.params.id) });
  res.json({ ok: true });
});
api.get('/runs/:id/export', async (req, res) => {
  const out = await buildRunWorkbook(id(req.params.id));
  if (!out) throw httpError(404, 'Evaluación no encontrada.');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${out.filename}"`);
  await out.workbook.xlsx.write(res);
  res.end();
});

api.post('/items/:id/reevaluate', (req, res) => {
  requeueItem(id(req.params.id), { force: true });
  res.json({ ok: true });
});
api.post('/items/:id/grade', (req, res) => {
  overrideGrade(id(req.params.id), { score: req.body?.score, reason: req.body?.reason, userId: req.user.id });
  res.json({ ok: true });
});
api.get('/items/:id/changes', (req, res) => {
  res.json(db.prepare(`SELECT g.*, u.display_name AS user_name FROM grade_changes g LEFT JOIN users u ON u.id = g.user_id
    WHERE g.item_id = ? ORDER BY g.id DESC`).all(id(req.params.id)));
});

// ---------------------------------------------------------------- Incidencias
api.get('/incidents', (req, res) => {
  const status = req.query.status || 'open';
  const params = [];
  let where = '1=1';
  if (status !== 'all') { where += ' AND i.status = ?'; params.push(status); }
  if (req.query.run_id) { where += ' AND i.run_id = ?'; params.push(id(req.query.run_id)); }
  const rows = db.prepare(`SELECT i.*, s.full_name AS student_name, r.activity_snapshot, r.status AS run_status, f.web_view_link
    FROM incidents i LEFT JOIN students s ON s.id = i.student_id LEFT JOIN runs r ON r.id = i.run_id LEFT JOIN drive_files f ON f.id = i.file_id
    WHERE ${where} ORDER BY i.id DESC LIMIT 1000`).all(...params);
  res.json(rows.map((r) => {
    const act = json.parse(r.activity_snapshot, {});
    const detail = json.parse(r.detail, null);
    const { activity_snapshot, ...rest } = r;
    return {
      ...rest,
      type_label: INCIDENT_TYPES[r.type] || r.type,
      activity: act.name,
      roster_id: act.roster_id,
      message: detail && typeof detail === 'object' ? detail.message : r.detail,
      candidates: detail?.candidates || [],
      files: detail?.files || [],
    };
  }));
});

api.get('/runs/:id/students', (req, res) => {
  const run = db.prepare('SELECT activity_snapshot FROM runs WHERE id = ?').get(id(req.params.id));
  if (!run) throw httpError(404, 'Evaluación no encontrada.');
  res.json(db.prepare(`SELECT i.student_id AS id, i.student_name AS full_name, i.status, i.file_name FROM run_items i WHERE i.run_id = ? AND i.student_id IS NOT NULL ORDER BY i.order_idx`).all(id(req.params.id)));
});

api.post('/incidents/:id/assign', (req, res) => {
  const inc = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id(req.params.id));
  if (!inc) throw httpError(404, 'Incidencia no encontrada.');
  const fileId = req.body?.file_id || inc.file_id;
  const studentId = req.body?.student_id ? id(req.body.student_id) : inc.student_id;
  if (!fileId || !studentId) throw httpError(400, 'Indique el estudiante y el documento.');
  assignFile({ runId: inc.run_id, fileId, studentId, incidentId: inc.id });
  audit(req.user.id, 'incident.assign', { incident: inc.id, fileId, studentId });
  res.json({ ok: true });
});
api.post('/incidents/:id/retry', (req, res) => {
  const inc = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id(req.params.id));
  if (!inc) throw httpError(404, 'Incidencia no encontrada.');
  if (!inc.item_id) throw httpError(409, 'Esta incidencia no está ligada a un estudiante; asigne el documento primero.');
  requeueItem(inc.item_id, { force: true });
  res.json({ ok: true });
});
api.post('/incidents/:id/ignore', (req, res) => {
  const inc = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id(req.params.id));
  if (!inc) throw httpError(404, 'Incidencia no encontrada.');
  tx(() => {
    db.prepare("UPDATE incidents SET status='ignored', resolution=?, resolved_at=datetime('now') WHERE id=?").run(req.body?.note || 'Descartada por el docente', inc.id);
    if (inc.file_id && !inc.item_id && req.body?.remember) {
      const act = json.parse(db.prepare('SELECT activity_snapshot FROM runs WHERE id = ?').get(inc.run_id)?.activity_snapshot, {});
      if (act.roster_id) ignoreFile({ fileId: inc.file_id, rosterId: act.roster_id });
    }
  });
  res.json({ ok: true });
});

// ---------------------------------------------------------------- Ajustes, retención y seguridad
api.get('/settings', (req, res) => {
  res.json({
    retention_days: Number(getSetting('retention.cacheDays', '30')),
    history_days: Number(getSetting('retention.historyDays', '0')),
    integrations: integrationStatus(),
    cache: cacheInfo(),
  });
});
api.put('/settings', (req, res) => {
  const rd = Number(req.body?.retention_days);
  const hd = Number(req.body?.history_days);
  if (!(rd >= 0 && rd <= 3650)) throw httpError(400, 'Días de retención no válidos.');
  if (!(hd >= 0 && hd <= 36500)) throw httpError(400, 'Días de historial no válidos.');
  setSetting('retention.cacheDays', rd);
  setSetting('retention.historyDays', hd);
  audit(req.user.id, 'settings.retention', { rd, hd });
  res.json({ ok: true, applied: applyRetention() });
});
api.post('/settings/purge-cache', (req, res) => {
  const n = purgeCache(0);
  audit(req.user.id, 'settings.purgeCache', { n });
  res.json({ deleted: n });
});
api.get('/audit', (req, res) => {
  res.json(db.prepare('SELECT a.*, u.display_name AS user_name FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT 200').all());
});

function cacheInfo() {
  const files = fs.readdirSync(config.cacheDir).filter((f) => f.endsWith('.pdf'));
  const size = files.reduce((a, f) => a + fs.statSync(path.join(config.cacheDir, f)).size, 0);
  return { files: files.length, bytes: size };
}
