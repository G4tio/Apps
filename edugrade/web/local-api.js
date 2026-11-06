// «Servidor» dentro del navegador: ejecuta las mismas rutas de la API de EduGrade AI
// (src/routes/api.js) sobre la base de datos local y devuelve objetos Response.
import { initDb, exportDb, importDb, save } from './db.js';
import { api } from '../src/routes/api.js';
import { seedTemplates } from '../src/rubrics.js';
import { startEngine } from '../src/engine.js';
import { startRetentionJob } from './retention.js';
import { connect as connectDrive, loadGoogleScript, driveConfigured } from './drive.js';
import { db } from './db.js';

const TYPES = { html: 'text/html; charset=utf-8', text: 'text/plain; charset=utf-8', json: 'application/json' };

function makeRes() {
  const headers = new Headers();
  let status = 200;
  let body = null;
  let done = false;
  const res = {
    get headersSent() { return done; },
    status(c) { status = c; return res; },
    setHeader(k, v) { headers.set(k, v); return res; },
    append(k, v) { headers.append(k, v); return res; },
    type(t) { headers.set('Content-Type', TYPES[t] || t); return res; },
    json(o) { headers.set('Content-Type', 'application/json'); body = JSON.stringify(o); done = true; return res; },
    send(x) {
      if (x instanceof Uint8Array) body = new Uint8Array(x);
      else if (typeof x === 'object' && x !== null) return res.json(x);
      else body = x ?? '';
      done = true;
      return res;
    },
    redirect(url) { status = 302; headers.set('Location', url); done = true; return res; },
    end() { done = true; return res; },
    toResponse() { return new Response(status === 204 ? null : body, { status, headers }); },
  };
  return res;
}

function runFns(fns, req, res) {
  return fns.reduce((p, fn) => p.then((go) => {
    if (!go || res.headersSent) return false;
    return new Promise((resolve, reject) => {
      let called = false;
      const next = (e) => { called = true; if (e) reject(e); else resolve(true); };
      Promise.resolve(fn(req, res, next)).then(() => { if (!called) resolve(false); }, reject);
    });
  }), Promise.resolve(true));
}

async function dispatch(method, path, req, res) {
  for (const layer of api.stack) {
    if (res.headersSent) return;
    if (layer.method === 'USE') {
      if (!path.startsWith(layer.prefix)) continue;
      const go = await runFns(layer.fns, req, res);
      if (!go) return;
      continue;
    }
    if (layer.method !== method) continue;
    const m = path.match(layer.re);
    if (!m) continue;
    req.params = Object.fromEntries(layer.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    await runFns(layer.fns, req, res);
    return;
  }
  if (!res.headersSent) res.status(404).json({ error: 'Ruta no encontrada.' });
}

const ready = (async () => {
  await initDb();
  seedTemplates();
  if (!db.prepare('SELECT id FROM users WHERE id = 1').get()) {
    db.prepare("INSERT INTO users(id, username, display_name, pass_hash) VALUES(1, 'docente', 'Docente', 'local')").run();
  }
  startEngine();
  startRetentionJob();
  if (driveConfigured()) loadGoogleScript().catch(() => {});
})();

async function localFetch(pathWithQuery, opts = {}) {
  await ready;
  const url = new URL(pathWithQuery, 'http://local');
  const method = (opts.method || 'GET').toUpperCase();
  const res = makeRes();
  try {
    // Respaldo de los datos de este dispositivo
    if (url.pathname === '/backup' && method === 'GET') {
      await save();
      return new Response(exportDb(), { headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename="edugrade-respaldo-${new Date().toISOString().slice(0, 10)}.sqlite"` } });
    }
    if (url.pathname === '/backup' && method === 'POST') {
      const f = opts.body?.get?.('file');
      if (!f) throw Object.assign(new Error('Seleccione el archivo de respaldo.'), { status: 400 });
      await importDb(new Uint8Array(await f.arrayBuffer()));
      return new Response(JSON.stringify({ ok: true, reload: true }), { headers: { 'Content-Type': 'application/json' } });
    }
    const req = {
      method,
      path: url.pathname,
      url: pathWithQuery,
      query: Object.fromEntries(url.searchParams),
      params: {},
      headers: {},
      ip: 'local',
      body: {},
    };
    if (opts.body instanceof FormData) {
      req._form = opts.body;
      for (const [k, v] of opts.body.entries()) if (typeof v === 'string') req.body[k] = v;
    } else if (typeof opts.body === 'string' && opts.body) {
      req.body = JSON.parse(opts.body);
    }
    await dispatch(method, url.pathname, req, res);
  } catch (e) {
    const status = e.status || 500;
    if (status >= 500) console.error('[api]', e);
    return new Response(JSON.stringify({ error: e.message || 'Error interno.' }), { status, headers: { 'Content-Type': 'application/json' } });
  }
  return res.toResponse();
}

window.EDUGRADE_LOCAL_API = { ready, fetch: localFetch, connectGoogle: connectDrive };
