// Retención en el navegador: copias de Drive y, opcionalmente, historial antiguo.
import { db, getSetting } from './db.js';
import { purgeCacheOlderThan } from './file-store.js';

export const purgeCache = (days) => purgeCacheOlderThan(days);

export async function applyRetention() {
  const cacheDays = Number(getSetting('retention.cacheDays', '30'));
  const historyDays = Number(getSetting('retention.historyDays', '0'));
  const cache = cacheDays > 0 ? await purgeCache(cacheDays) : 0;
  let runs = 0;
  if (historyDays > 0) {
    runs = Number(db.prepare(`DELETE FROM runs WHERE status IN ('completed','cancelled','failed') AND created_at < datetime('now', ?)`).run(`-${historyDays} days`).changes);
  }
  return { cache, runs };
}

export function startRetentionJob() {
  applyRetention().catch((e) => console.error('[retention]', e));
}
