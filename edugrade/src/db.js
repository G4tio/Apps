// Capa de persistencia de EduGrade AI (SQLite integrado en Node.js >= 22.13).
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { SCHEMA } from './schema.js';

fs.mkdirSync(config.dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(config.dataDir, 'edugrade.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');

db.exec(SCHEMA);

export function getSetting(key, fallback = null) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}
export function setSetting(key, value) {
  if (value === null || value === undefined) {
    db.prepare('DELETE FROM settings WHERE key = ?').run(key);
  } else {
    db.prepare('INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .run(key, String(value));
  }
}

export function tx(fn) {
  db.exec('BEGIN');
  try {
    const r = fn();
    db.exec('COMMIT');
    return r;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

export function audit(userId, action, detail) {
  db.prepare('INSERT INTO audit_log(user_id, action, detail) VALUES(?, ?, ?)')
    .run(userId ?? null, action, detail ? JSON.stringify(detail) : null);
}

export const json = {
  parse(s, fallback = null) {
    if (s === null || s === undefined) return fallback;
    try { return JSON.parse(s); } catch { return fallback; }
  },
};
