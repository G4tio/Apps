// Base de datos SQLite en el navegador (sql.js / WebAssembly) con la misma interfaz que
// node:sqlite, persistida en IndexedDB. Permite reutilizar el código del servidor.
import initSqlJs from 'sql.js/dist/sql-wasm-browser.js';
import wasmBinary from 'sql.js/dist/sql-wasm-browser.wasm';
import { SCHEMA } from '../src/schema.js';
import { idb } from './idb.js';

let raw = null;
let dirty = false;
let inTx = 0;

const norm = (params) => params.map((v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v));
const rowsOf = (stmt) => {
  const out = [];
  while (stmt.step()) out.push(stmt.getAsObject());
  return out;
};

class Statement {
  constructor(sql) { this.sql = sql; }
  all(...params) {
    const st = raw.prepare(this.sql);
    try { st.bind(norm(params)); return rowsOf(st); } finally { st.free(); }
  }
  get(...params) {
    return this.all(...params)[0];
  }
  run(...params) {
    raw.run(this.sql, norm(params));
    const changes = raw.getRowsModified();
    const lastInsertRowid = raw.exec('SELECT last_insert_rowid()')[0].values[0][0];
    dirty = true;
    return { changes, lastInsertRowid };
  }
}

export const db = {
  prepare: (sql) => new Statement(sql),
  exec: (sql) => {
    const s = sql.trim().toUpperCase();
    if (s === 'BEGIN') inTx++;
    if (s === 'COMMIT' || s === 'ROLLBACK') inTx = Math.max(0, inTx - 1);
    raw.exec(sql);
    dirty = true;
  },
};

export async function initDb() {
  const SQL = await initSqlJs({ wasmBinary });
  const saved = await idb.get('kv', 'db').catch(() => null);
  raw = saved ? new SQL.Database(new Uint8Array(saved)) : new SQL.Database();
  raw.exec('PRAGMA foreign_keys = ON;');
  raw.exec(SCHEMA);
  dirty = true;
  await save();
  setInterval(() => { save().catch((e) => console.error('[db]', e)); }, 1500);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
  window.addEventListener('pagehide', () => save());
}

export async function save() {
  if (!raw || !dirty || inTx) return;
  dirty = false;
  const data = raw.export();
  raw.exec('PRAGMA foreign_keys = ON;'); // export() reabre la base y restablece los pragmas
  await idb.set('kv', 'db', data);
}

export function exportDb() {
  const data = raw.export();
  raw.exec('PRAGMA foreign_keys = ON;');
  return data;
}

export async function importDb(bytes) {
  const SQL = await initSqlJs({ wasmBinary });
  const test = new SQL.Database(new Uint8Array(bytes));
  test.exec('SELECT COUNT(*) FROM runs'); // valida que sea un respaldo de EduGrade AI
  test.close();
  await idb.set('kv', 'db', new Uint8Array(bytes));
}

export function getSetting(key, fallback = null) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}
export function setSetting(key, value) {
  if (value === null || value === undefined) db.prepare('DELETE FROM settings WHERE key = ?').run(key);
  else db.prepare('INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, String(value));
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
  db.prepare('INSERT INTO audit_log(user_id, action, detail) VALUES(?, ?, ?)').run(userId ?? null, action, detail ? JSON.stringify(detail) : null);
}
export const json = {
  parse(s, fallback = null) {
    if (s === null || s === undefined) return fallback;
    try { return JSON.parse(s); } catch { return fallback; }
  },
};
