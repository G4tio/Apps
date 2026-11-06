// PDF guardados en el dispositivo (IndexedDB): documentos subidos y copias de Google Drive.
import { idb } from './idb.js';
import { downloadFile } from './drive.js';

export const isUpload = (fileId) => String(fileId).startsWith('local_');
const cacheKey = (fileId, version) => `cache:${fileId}:${version}`;

export async function getPdfBuffer(fileId, version, download = downloadFile) {
  if (isUpload(fileId)) {
    const rec = await idb.get('files', `up:${fileId}`);
    if (!rec) throw Object.assign(new Error('El documento subido ya no está en este dispositivo. Vuelva a subirlo.'), { status: 404 });
    return Buffer.from(rec.data);
  }
  const rec = await idb.get('files', cacheKey(fileId, version));
  if (rec) return Buffer.from(rec.data);
  const buf = await download(fileId);
  await idb.set('files', cacheKey(fileId, version), { data: new Uint8Array(buf), at: Date.now() });
  return buf;
}

export async function saveUpload(fileId, buffer) {
  await idb.set('files', `up:${fileId}`, { data: new Uint8Array(buffer), at: Date.now() });
}
export async function removeUpload(fileId) {
  await idb.del('files', `up:${fileId}`);
}

export async function cacheInfo() {
  const keys = (await idb.keys('files')).filter((k) => String(k).startsWith('cache:'));
  let bytes = 0;
  for (const k of keys) bytes += (await idb.get('files', k))?.data?.length || 0;
  return { files: keys.length, bytes };
}

export async function purgeCacheOlderThan(days) {
  const limit = Date.now() - days * 86400_000;
  let n = 0;
  for (const k of await idb.keys('files')) {
    if (!String(k).startsWith('cache:')) continue;
    const rec = await idb.get('files', k);
    if (days === 0 || !rec || rec.at < limit) { await idb.del('files', k); n++; }
  }
  return n;
}
