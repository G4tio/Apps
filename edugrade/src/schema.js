// Esquema de la base de datos (compartido por el servidor y la versión de navegador).
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  pass_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
CREATE TABLE IF NOT EXISTS rosters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  original_file BLOB NOT NULL,
  sheet_name TEXT NOT NULL,
  header_row INTEGER NOT NULL,
  mapping TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roster_id INTEGER NOT NULL REFERENCES rosters(id) ON DELETE CASCADE,
  row_index INTEGER,              -- fila (0-based) en la hoja original; NULL si se agregó manualmente
  order_idx INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  code TEXT,
  level TEXT,
  grade TEXT,
  section TEXT,
  source TEXT NOT NULL DEFAULT 'excel',
  deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_students_roster ON students(roster_id, order_idx);
CREATE TABLE IF NOT EXISTS drive_files (
  id TEXT PRIMARY KEY,
  folder_id TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT,
  md5 TEXT,
  modified_time TEXT,
  size INTEGER,
  web_view_link TEXT,
  sync_state TEXT NOT NULL DEFAULT 'new',     -- new | modified | unchanged | removed
  first_seen TEXT NOT NULL DEFAULT (datetime('now')),
  last_synced TEXT
);
CREATE TABLE IF NOT EXISTS file_matches (
  file_id TEXT NOT NULL REFERENCES drive_files(id) ON DELETE CASCADE,
  roster_id INTEGER NOT NULL REFERENCES rosters(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
  status TEXT NOT NULL,          -- confirmed | probable | none | manual | ignored
  score REAL,
  reason TEXT,
  candidates TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (file_id, roster_id)
);
CREATE TABLE IF NOT EXISTS rubrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  level TEXT,
  subject TEXT,
  activity TEXT,
  is_template INTEGER NOT NULL DEFAULT 0,
  pass_mark REAL,
  criteria TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  grade TEXT,
  section TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  objectives TEXT,
  instructions TEXT,
  due_date TEXT,
  scale_max REAL NOT NULL DEFAULT 100,
  pass_mark REAL NOT NULL DEFAULT 60,
  rubric_id INTEGER REFERENCES rubrics(id) ON DELETE SET NULL,
  roster_id INTEGER REFERENCES rosters(id) ON DELETE SET NULL,
  file_keyword TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity_id INTEGER REFERENCES activities(id) ON DELETE SET NULL,
  activity_snapshot TEXT NOT NULL,
  rubric_snapshot TEXT,
  status TEXT NOT NULL DEFAULT 'queued',   -- queued | running | paused | completed | cancelled | failed
  force_reevaluate INTEGER NOT NULL DEFAULT 0,
  eval_hash TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  started_at TEXT,
  finished_at TEXT,
  error TEXT
);
CREATE TABLE IF NOT EXISTS run_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  order_idx INTEGER NOT NULL,
  file_id TEXT,
  file_name TEXT,
  file_version TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | processing | done | incident | no_document
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL DEFAULT 0,
  force INTEGER NOT NULL DEFAULT 0,
  score REAL,
  percent REAL,
  result TEXT,                             -- APROBADO | NO APROBADO
  criteria_scores TEXT,
  feedback TEXT,
  ai_meta TEXT,
  error TEXT,
  reused_from INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_items_run ON run_items(run_id, status);
CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER REFERENCES runs(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES run_items(id) ON DELETE CASCADE,
  file_id TEXT,
  file_name TEXT,
  student_id INTEGER,
  type TEXT NOT NULL,
  detail TEXT,
  status TEXT NOT NULL DEFAULT 'open',     -- open | resolved | ignored
  resolution TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status, run_id);
CREATE TABLE IF NOT EXISTS grade_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES run_items(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL,      -- ai | manual | reevaluation
  old_score REAL,
  new_score REAL,
  old_result TEXT,
  new_result TEXT,
  reason TEXT,
  user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;
