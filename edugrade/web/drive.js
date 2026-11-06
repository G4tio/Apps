// Google Drive desde el navegador (Google Identity Services + Drive API v3).
// Permiso mínimo: solo lectura (drive.readonly). El token vive en este dispositivo.
import { db, getSetting, setSetting, tx } from './db.js';

export const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.readonly', 'openid', 'email'];
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const API = 'https://www.googleapis.com/drive/v3';

const err = (status, message, extra = {}) => Object.assign(new Error(message), { status, ...extra });
export const driveConfigured = () => Boolean(getSetting('google.clientId'));

function token() {
  const t = getSetting('drive.token');
  const exp = Number(getSetting('drive.tokenExpires', '0'));
  return t && exp > Date.now() + 30_000 ? t : null;
}

export function loadGoogleScript() {
  if (globalThis.google?.accounts?.oauth2) return Promise.resolve();
  if (!loadGoogleScript.p) {
    loadGoogleScript.p = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { loadGoogleScript.p = null; reject(err(503, 'No se pudo cargar el inicio de sesión de Google. Revise la conexión a internet.')); };
      document.head.appendChild(s);
    });
  }
  return loadGoogleScript.p;
}

/** Abre la ventana de Google para autorizar el acceso de solo lectura. Debe llamarse desde un clic. */
export function connect() {
  const clientId = getSetting('google.clientId');
  if (!clientId) return Promise.reject(err(400, 'Primero ingrese el «Client ID» de Google en Ajustes.'));
  const start = () => new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPES.join(' '),
      callback: async (r) => {
        if (r.error) return reject(err(400, r.error_description || r.error));
        setSetting('drive.token', r.access_token);
        setSetting('drive.tokenExpires', Date.now() + Number(r.expires_in || 3600) * 1000);
        try {
          const info = await (await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${r.access_token}` } })).json();
          setSetting('drive.email', info.email || null);
        } catch { /* el correo es opcional */ }
        resolve({ email: getSetting('drive.email') });
      },
      error_callback: (e) => reject(err(400, e?.type === 'popup_closed' ? 'Se cerró la ventana de Google antes de terminar.' : (e?.message || 'No se pudo conectar con Google.'))),
    });
    client.requestAccessToken({ prompt: getSetting('drive.email') ? '' : 'consent' });
  });
  if (globalThis.google?.accounts?.oauth2) return start();
  return loadGoogleScript().then(start);
}

export async function disconnect() {
  const t = getSetting('drive.token');
  if (t && globalThis.google?.accounts?.oauth2) { try { google.accounts.oauth2.revoke(t); } catch { /* ya expiró */ } }
  setSetting('drive.token', null);
  setSetting('drive.tokenExpires', null);
  setSetting('drive.email', null);
}

async function gfetch(url, { binary = false } = {}) {
  const t = token();
  if (!t) throw err(409, 'La conexión con Google Drive expiró. Vuelva a conectar la cuenta en «Google Drive» y luego continúe.', { permanent: true });
  const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` } });
  if (res.status === 401) {
    setSetting('drive.tokenExpires', '0');
    throw err(409, 'La conexión con Google Drive expiró. Vuelva a conectar la cuenta en «Google Drive» y luego continúe.', { permanent: true });
  }
  if (!res.ok) {
    let msg = `Google Drive respondió ${res.status}`;
    try { msg = `Google: ${(await res.json()).error.message}`; } catch { /* sin detalle */ }
    throw err(res.status, msg);
  }
  return binary ? Buffer.from(new Uint8Array(await res.arrayBuffer())) : res.json();
}

const q = (params) => new URLSearchParams({ supportsAllDrives: 'true', ...params }).toString();
const escapeQ = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

export function driveStatus() {
  const folderId = getSetting('drive.folderId');
  const c = db.prepare(`SELECT COUNT(*) total, SUM(folder_id = 'local') locales, SUM(sync_state='new') nuevos, SUM(sync_state='modified') modificados
    FROM drive_files WHERE sync_state != 'removed'`).get();
  return {
    configured: driveConfigured(),
    connected: Boolean(token()),
    email: getSetting('drive.email'),
    folder: folderId ? { id: folderId, name: getSetting('drive.folderName') } : null,
    lastSync: getSetting('drive.lastSync'),
    pdfCount: c.total || 0,
    localCount: c.locales || 0,
    newCount: c.nuevos || 0,
    modifiedCount: c.modificados || 0,
    scopes: DRIVE_SCOPES,
    redirectUri: '',
    origin: location.origin,
  };
}

export function parseFolderId(input) {
  const s = String(input || '').trim();
  const m = s.match(/folders\/([a-zA-Z0-9_-]{10,})/) || s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  return /^[a-zA-Z0-9_-]{10,}$/.test(s) ? s : null;
}

export async function listFolders({ parentId = 'root', search = '', sharedWithMe = false } = {}) {
  let query = `mimeType='${FOLDER_MIME}' and trashed=false`;
  if (search) query += ` and name contains '${escapeQ(search)}'`;
  else if (sharedWithMe) query += ' and sharedWithMe';
  else query += ` and '${escapeQ(parentId)}' in parents`;
  const r = await gfetch(`${API}/files?${q({ q: query, fields: 'files(id,name,parents,modifiedTime)', orderBy: 'name', pageSize: '200', includeItemsFromAllDrives: 'true' })}`);
  return r.files || [];
}

export async function getFolder(folderId) {
  const f = await gfetch(`${API}/files/${encodeURIComponent(folderId)}?${q({ fields: 'id,name,mimeType' })}`);
  if (f.mimeType !== FOLDER_MIME) throw err(400, 'El identificador indicado no corresponde a una carpeta.');
  return f;
}

export async function selectFolder(folderId) {
  const folder = await getFolder(folderId);
  const prev = getSetting('drive.folderId');
  setSetting('drive.folderId', folder.id);
  setSetting('drive.folderName', folder.name);
  if (prev && prev !== folder.id) {
    setSetting('drive.lastSync', null);
    db.prepare("UPDATE drive_files SET sync_state = 'removed' WHERE folder_id NOT IN (?, 'local')").run(folder.id);
  }
  return folder;
}

export async function listPdfsRecursive(folderId) {
  const out = [];
  const queue = [{ id: folderId, path: '' }];
  const seen = new Set();
  while (queue.length) {
    const { id, path } = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    let pageToken = '';
    do {
      const r = await gfetch(`${API}/files?${q({
        q: `'${escapeQ(id)}' in parents and trashed=false and (mimeType='application/pdf' or mimeType='${FOLDER_MIME}')`,
        fields: 'nextPageToken, files(id,name,mimeType,md5Checksum,modifiedTime,size,webViewLink)',
        pageSize: '1000', includeItemsFromAllDrives: 'true', ...(pageToken ? { pageToken } : {}),
      })}`);
      for (const f of r.files || []) {
        if (f.mimeType === FOLDER_MIME) queue.push({ id: f.id, path: path ? `${path}/${f.name}` : f.name });
        else out.push({ ...f, path });
      }
      pageToken = r.nextPageToken || '';
    } while (pageToken);
  }
  return out;
}

export async function syncFolder() {
  const folderId = getSetting('drive.folderId');
  if (!folderId) throw err(409, 'Primero seleccione una carpeta de Google Drive.');
  const files = await listPdfsRecursive(folderId);
  const now = new Date().toISOString();
  const summary = { total: files.length, nuevos: 0, modificados: 0, sinCambios: 0, eliminados: 0 };
  tx(() => {
    const existing = new Map(db.prepare('SELECT * FROM drive_files WHERE folder_id = ?').all(folderId).map((r) => [r.id, r]));
    const up = db.prepare(`INSERT INTO drive_files(id, folder_id, name, path, md5, modified_time, size, web_view_link, sync_state, last_synced)
      VALUES(?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET folder_id=excluded.folder_id, name=excluded.name, path=excluded.path, md5=excluded.md5,
        modified_time=excluded.modified_time, size=excluded.size, web_view_link=excluded.web_view_link, sync_state=excluded.sync_state, last_synced=excluded.last_synced`);
    for (const f of files) {
      const prev = existing.get(f.id);
      let state;
      if (!prev || prev.sync_state === 'removed') { state = 'new'; summary.nuevos++; }
      else if ((f.md5Checksum && prev.md5 !== f.md5Checksum) || (!f.md5Checksum && prev.modified_time !== f.modifiedTime)) { state = 'modified'; summary.modificados++; }
      else { state = 'unchanged'; summary.sinCambios++; }
      up.run(f.id, folderId, f.name, f.path || '', f.md5Checksum || null, f.modifiedTime || null, f.size ? Number(f.size) : null, f.webViewLink || null, state, now);
      existing.delete(f.id);
    }
    for (const gone of existing.values()) {
      if (gone.sync_state !== 'removed') { db.prepare("UPDATE drive_files SET sync_state='removed', last_synced=? WHERE id=?").run(now, gone.id); summary.eliminados++; }
    }
  });
  setSetting('drive.lastSync', now);
  return summary;
}

export const downloadFile = (fileId) => gfetch(`${API}/files/${encodeURIComponent(fileId)}?${q({ alt: 'media' })}`, { binary: true });
export const fileVersion = (file) => file.md5 || file.md5Checksum || file.modified_time || file.modifiedTime || '';
export const getAuthUrl = () => { throw err(400, 'Use el botón «Conectar cuenta Google».'); };
export const handleOAuthCallback = () => { throw err(400, 'No disponible en la versión de navegador.'); };
