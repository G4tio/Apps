// Integración con Google Drive (OAuth 2.0 + Drive API v3).
// Alcance mínimo necesario para leer y descargar los PDF: drive.readonly.
import { drive as driveApi } from '@googleapis/drive';
import { OAuth2Client } from 'google-auth-library';
import { config } from './config.js';
import { db, getSetting, setSetting, tx } from './db.js';
import { encrypt, decrypt } from './security.js';

export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'openid',
  'email',
];

const FOLDER_MIME = 'application/vnd.google-apps.folder';

export function driveConfigured() {
  return Boolean(config.google.clientId && config.google.clientSecret);
}

function newClient() {
  if (!driveConfigured()) {
    const err = new Error('Google Drive no está configurado: defina GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el servidor.');
    err.status = 503;
    throw err;
  }
  return new OAuth2Client(config.google.clientId, config.google.clientSecret, config.google.redirectUri);
}

function storedTokens() {
  const raw = decrypt(getSetting('drive.tokens'));
  return raw ? JSON.parse(raw) : null;
}

function saveTokens(tokens) {
  const prev = storedTokens() || {};
  setSetting('drive.tokens', encrypt(JSON.stringify({ ...prev, ...tokens })));
}

export function authorizedClient() {
  const client = newClient();
  const tokens = storedTokens();
  if (!tokens) {
    const err = new Error('No hay una cuenta de Google conectada.');
    err.status = 409;
    throw err;
  }
  client.setCredentials(tokens);
  client.on('tokens', (t) => saveTokens(t));
  return client;
}

function drive() {
  return driveApi({ version: 'v3', auth: authorizedClient() });
}

export function getAuthUrl(state) {
  return newClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: DRIVE_SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function handleOAuthCallback(code) {
  const client = newClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  let email = null;
  if (tokens.id_token) {
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: config.google.clientId });
    email = ticket.getPayload()?.email || null;
  }
  saveTokens(tokens);
  setSetting('drive.email', email);
  return { email };
}

export async function disconnect() {
  const tokens = storedTokens();
  if (tokens && driveConfigured()) {
    try { await newClient().revokeToken(tokens.refresh_token || tokens.access_token); } catch { /* el token pudo expirar */ }
  }
  setSetting('drive.tokens', null);
  setSetting('drive.email', null);
}

export function driveStatus() {
  const folderId = getSetting('drive.folderId');
  const counts = folderId
    ? db.prepare(`SELECT COUNT(*) total,
        SUM(sync_state='new') nuevos, SUM(sync_state='modified') modificados
        FROM drive_files WHERE folder_id = ? AND sync_state != 'removed'`).get(folderId)
    : { total: 0, nuevos: 0, modificados: 0 };
  return {
    configured: driveConfigured(),
    connected: Boolean(storedTokens()),
    email: getSetting('drive.email'),
    folder: folderId ? { id: folderId, name: getSetting('drive.folderName') } : null,
    lastSync: getSetting('drive.lastSync'),
    pdfCount: counts.total || 0,
    newCount: counts.nuevos || 0,
    modifiedCount: counts.modificados || 0,
    scopes: DRIVE_SCOPES,
    redirectUri: config.google.redirectUri,
  };
}

export function parseFolderId(input) {
  const s = String(input || '').trim();
  const m = s.match(/folders\/([a-zA-Z0-9_-]{10,})/) || s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(s)) return s;
  return null;
}

function escapeQ(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export async function listFolders({ parentId = 'root', search = '', sharedWithMe = false } = {}) {
  let q = `mimeType='${FOLDER_MIME}' and trashed=false`;
  if (search) q += ` and name contains '${escapeQ(search)}'`;
  else if (sharedWithMe) q += ' and sharedWithMe';
  else q += ` and '${escapeQ(parentId)}' in parents`;
  const res = await drive().files.list({
    q,
    fields: 'files(id,name,parents,modifiedTime)',
    orderBy: 'name',
    pageSize: 200,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return res.data.files || [];
}

export async function getFolder(folderId) {
  const res = await drive().files.get({ fileId: folderId, fields: 'id,name,mimeType,trashed', supportsAllDrives: true });
  if (res.data.mimeType !== FOLDER_MIME) {
    const err = new Error('El identificador indicado no corresponde a una carpeta.');
    err.status = 400;
    throw err;
  }
  return res.data;
}

export async function selectFolder(folderId) {
  const folder = await getFolder(folderId);
  const prev = getSetting('drive.folderId');
  setSetting('drive.folderId', folder.id);
  setSetting('drive.folderName', folder.name);
  if (prev && prev !== folder.id) setSetting('drive.lastSync', null);
  return folder;
}

/** Recorre la carpeta (y sus subcarpetas) y devuelve todos los PDF. */
export async function listPdfsRecursive(folderId) {
  const d = drive();
  const out = [];
  const queue = [{ id: folderId, path: '' }];
  const seen = new Set();
  while (queue.length) {
    const { id, path } = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    let pageToken;
    do {
      const res = await d.files.list({
        q: `'${escapeQ(id)}' in parents and trashed=false and (mimeType='application/pdf' or mimeType='${FOLDER_MIME}')`,
        fields: 'nextPageToken, files(id,name,mimeType,md5Checksum,modifiedTime,size,webViewLink)',
        pageSize: 1000,
        pageToken,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      for (const f of res.data.files || []) {
        if (f.mimeType === FOLDER_MIME) queue.push({ id: f.id, path: path ? `${path}/${f.name}` : f.name });
        else out.push({ ...f, path });
      }
      pageToken = res.data.nextPageToken;
    } while (pageToken);
  }
  return out;
}

/** Sincroniza la carpeta seleccionada: detecta documentos nuevos, modificados y eliminados. */
export async function syncFolder() {
  const folderId = getSetting('drive.folderId');
  if (!folderId) {
    const err = new Error('Primero seleccione una carpeta de Google Drive.');
    err.status = 409;
    throw err;
  }
  const files = await listPdfsRecursive(folderId);
  const now = new Date().toISOString();
  const summary = { total: files.length, nuevos: 0, modificados: 0, sinCambios: 0, eliminados: 0 };

  tx(() => {
    const existing = new Map(db.prepare('SELECT * FROM drive_files WHERE folder_id = ?').all(folderId).map((r) => [r.id, r]));
    const upsert = db.prepare(`INSERT INTO drive_files(id, folder_id, name, path, md5, modified_time, size, web_view_link, sync_state, last_synced)
      VALUES(?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET folder_id=excluded.folder_id, name=excluded.name, path=excluded.path, md5=excluded.md5,
        modified_time=excluded.modified_time, size=excluded.size, web_view_link=excluded.web_view_link,
        sync_state=excluded.sync_state, last_synced=excluded.last_synced`);
    for (const f of files) {
      const prev = existing.get(f.id);
      let state;
      if (!prev || prev.sync_state === 'removed') { state = 'new'; summary.nuevos++; }
      else if ((f.md5Checksum && prev.md5 !== f.md5Checksum) || (!f.md5Checksum && prev.modified_time !== f.modifiedTime)) { state = 'modified'; summary.modificados++; }
      else { state = 'unchanged'; summary.sinCambios++; }
      upsert.run(f.id, folderId, f.name, f.path || '', f.md5Checksum || null, f.modifiedTime || null,
        f.size ? Number(f.size) : null, f.webViewLink || null, state, now);
      existing.delete(f.id);
    }
    const markRemoved = db.prepare("UPDATE drive_files SET sync_state='removed', last_synced=? WHERE id=?");
    for (const gone of existing.values()) {
      if (gone.sync_state !== 'removed') { markRemoved.run(now, gone.id); summary.eliminados++; }
    }
  });
  setSetting('drive.lastSync', now);
  return summary;
}

export async function getFileMeta(fileId) {
  const res = await drive().files.get({ fileId, fields: 'id,name,md5Checksum,modifiedTime,size,webViewLink,trashed', supportsAllDrives: true });
  return res.data;
}

export async function downloadFile(fileId) {
  const res = await drive().files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' },
  );
  return Buffer.from(res.data);
}

export function fileVersion(file) {
  return file.md5 || file.md5Checksum || file.modified_time || file.modifiedTime || '';
}
