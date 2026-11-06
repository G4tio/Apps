// Política de retención: elimina las copias locales de los PDF descargados y,
// opcionalmente, el historial de evaluaciones antiguas.
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { db, getSetting } from './db.js';

export async function purgeCache(olderThanDays) {
  const limit = Date.now() - olderThanDays * 86400_000;
  let n = 0;
  for (const f of fs.readdirSync(config.cacheDir)) {
    const p = path.join(config.cacheDir, f);
    try {
      if (f.endsWith('.pdf') && (olderThanDays === 0 || fs.statSync(p).mtimeMs < limit)) {
        fs.unlinkSync(p);
        n++;
      }
    } catch { /* archivo en uso o ya eliminado */ }
  }
  return n;
}

export async function applyRetention() {
  const cacheDays = Number(getSetting('retention.cacheDays', '30'));
  const historyDays = Number(getSetting('retention.historyDays', '0'));
  const cache = cacheDays > 0 ? await purgeCache(cacheDays) : 0;
  let runs = 0;
  if (historyDays > 0) {
    runs = Number(db.prepare(`DELETE FROM runs WHERE status IN ('completed','cancelled','failed')
      AND created_at < datetime('now', ?)`).run(`-${historyDays} days`).changes);
  }
  return { cache, runs };
}

export function startRetentionJob() {
  applyRetention().catch((e) => console.error('[retention]', e));
  const t = setInterval(() => {
    applyRetention().catch((e) => console.error('[retention]', e));
  }, 6 * 3600_000);
  t.unref?.();
}
