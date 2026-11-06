// Coincidencias persistentes archivo ↔ estudiante para cada listado (vista del módulo Drive).
import { db, tx } from './db.js';
import { matchFile } from './matching.js';

export function refreshMatches(rosterId) {
  const students = db.prepare('SELECT * FROM students WHERE roster_id = ? AND deleted = 0').all(rosterId);
  const files = db.prepare("SELECT * FROM drive_files WHERE sync_state != 'removed'").all();
  const keep = new Map(db.prepare("SELECT * FROM file_matches WHERE roster_id = ? AND status IN ('manual','ignored')").all(rosterId).map((m) => [m.file_id, m]));
  const counts = { confirmed: 0, probable: 0, none: 0, manual: 0, ignored: 0 };
  tx(() => {
    const up = db.prepare(`INSERT INTO file_matches(file_id, roster_id, student_id, status, score, reason, candidates, updated_at)
      VALUES(?,?,?,?,?,?,?,datetime('now'))
      ON CONFLICT(file_id, roster_id) DO UPDATE SET student_id=excluded.student_id, status=excluded.status, score=excluded.score,
        reason=excluded.reason, candidates=excluded.candidates, updated_at=excluded.updated_at`);
    for (const f of files) {
      const k = keep.get(f.id);
      if (k && (k.status === 'ignored' || students.some((s) => s.id === k.student_id))) { counts[k.status]++; continue; }
      const r = matchFile(f.name, students);
      // Solo las coincidencias confirmadas quedan asignadas; las probables muestran un candidato sugerido.
      up.run(f.id, rosterId, r.studentId, r.status, r.score, r.reason, JSON.stringify(r.candidates));
      counts[r.status]++;
    }
  });
  return counts;
}

export function refreshAllMatches() {
  for (const r of db.prepare('SELECT id FROM rosters').all()) refreshMatches(r.id);
}

export function filesWithMatches(rosterId) {
  return db.prepare(`SELECT f.*, m.status AS match_status, m.student_id, m.score AS match_score, m.reason AS match_reason, m.candidates,
      s.full_name AS student_name
    FROM drive_files f
    LEFT JOIN file_matches m ON m.file_id = f.id AND m.roster_id = ?
    LEFT JOIN students s ON s.id = m.student_id
    WHERE f.sync_state != 'removed'
    ORDER BY f.name`).all(rosterId || 0).map((f) => ({ ...f, candidates: f.candidates ? JSON.parse(f.candidates) : [] }));
}
