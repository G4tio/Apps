// Almacenamiento de los PDF en el servidor: copias temporales de Google Drive (data/cache)
// y documentos subidos desde el dispositivo (data/uploads).
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { sha256 } from './security.js';
import { downloadFile } from './drive.js';

const uploadsDir = path.join(config.dataDir, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const safeId = (id) => String(id).replace(/[^a-zA-Z0-9_-]/g, '');
const cachePath = (fileId, version) => path.join(config.cacheDir, `${safeId(fileId)}_${sha256(String(version)).slice(0, 12)}.pdf`);
const uploadPath = (fileId) => path.join(uploadsDir, `${safeId(fileId)}.pdf`);

export function isUpload(fileId) {
  return String(fileId).startsWith('local_');
}

export async function getPdfBuffer(fileId, version, download = downloadFile) {
  if (isUpload(fileId)) {
    const p = uploadPath(fileId);
    if (!fs.existsSync(p)) throw Object.assign(new Error('El documento subido ya no está disponible. Vuelva a subirlo.'), { status: 404 });
    return fs.readFileSync(p);
  }
  const p = cachePath(fileId, version);
  if (fs.existsSync(p)) return fs.readFileSync(p);
  const buf = await download(fileId);
  fs.writeFileSync(p, buf, { mode: 0o600 });
  return buf;
}

export async function saveUpload(fileId, buffer) {
  fs.writeFileSync(uploadPath(fileId), buffer, { mode: 0o600 });
}

export async function removeUpload(fileId) {
  try { fs.unlinkSync(uploadPath(fileId)); } catch { /* ya no existe */ }
}

export async function cacheInfo() {
  const files = fs.readdirSync(config.cacheDir).filter((f) => f.endsWith('.pdf'));
  const bytes = files.reduce((a, f) => a + fs.statSync(path.join(config.cacheDir, f)).size, 0);
  return { files: files.length, bytes };
}
