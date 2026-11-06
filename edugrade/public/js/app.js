import { api, state, esc, toast, $, $$, formValues, progressBar, setToken, openApiFile } from './core.js';
import { dashboardView } from './views/dashboard.js';
import { studentsView } from './views/students.js';
import { driveView } from './views/drive.js';
import { activitiesView } from './views/activities.js';
import { rubricsView } from './views/rubrics.js';
import { resultsView } from './views/results.js';
import { incidentsView } from './views/incidents.js';
import { historyView } from './views/history.js';
import { settingsView } from './views/settings.js';

const ROUTES = {
  dashboard: ['Dashboard', dashboardView],
  estudiantes: ['Estudiantes', studentsView],
  drive: ['Google Drive', driveView],
  actividades: ['Configuración académica', activitiesView],
  rubricas: ['Rúbricas', rubricsView],
  resultados: ['Resultados', resultsView],
  incidencias: ['Incidencias', incidentsView],
  historial: ['Historial', historyView],
  ajustes: ['Ajustes', settingsView],
};

let cleanup = null;

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [pathPart, query = ''] = h.split('?');
  const [route, ...rest] = pathPart.split('/');
  return { route: ROUTES[route] ? route : 'dashboard', params: rest, query: new URLSearchParams(query) };
}

async function render() {
  const { route, params, query } = parseHash();
  const [title, view] = ROUTES[route];
  document.getElementById('pageTitle').textContent = title;
  document.title = `${title} · EduGrade AI`;
  $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === route));
  document.body.classList.remove('menu-open');
  document.getElementById('modalRoot').innerHTML = '';
  document.getElementById('topActions').innerHTML = '';
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;
  const el = document.getElementById('view');
  el.onclick = null;
  el.oninput = null;
  el.onchange = null;
  el.innerHTML = '<div class="empty"><div class="big">⏳</div>Cargando…</div>';
  try {
    cleanup = await view(el, { params, query, navigate });
  } catch (e) {
    el.innerHTML = `<div class="notice err">${esc(e.message)}</div>`;
  }
}

export function navigate(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

// ---------------------------------------------------------------- Sesión
function brandBlock() {
  return `<div class="brand"><img src="${state.logo}" width="44" height="44" alt=""><div><strong style="font-size:22px">EduGrade</strong> <span class="ai">AI</span><small>Sistema inteligente de evaluación automática</small></div></div>`;
}

// Si el servidor no responde, se muestra un aviso sencillo con opción de reintentar.
function showOffline() {
  document.getElementById('shell').classList.add('hidden');
  const auth = document.getElementById('auth');
  auth.classList.remove('hidden');
  auth.innerHTML = `<div class="auth-card">
    ${brandBlock()}
    <div class="notice warn mb">No se pudo conectar con EduGrade AI. Verifique que el programa esté encendido (<code>npm start</code>) e intente de nuevo.</div>
    <button class="btn big" style="width:100%" id="retryBtn">Reintentar</button>
  </div>`;
  $('#retryBtn').onclick = () => boot();
}

function showAuth(setupRequired) {
  document.getElementById('shell').classList.add('hidden');
  const auth = document.getElementById('auth');
  auth.classList.remove('hidden');
  auth.innerHTML = `<form class="auth-card" id="authForm" autocomplete="on">
    ${brandBlock()}
    ${setupRequired ? '<div class="notice mb">Bienvenido. Cree la cuenta del docente administrador para proteger la información académica.</div>' : ''}
    ${setupRequired ? '<div class="field"><label>Nombre para mostrar</label><input name="display_name" placeholder="Prof. Ana Martínez"></div>' : ''}
    <div class="field"><label>Usuario</label><input name="username" required autocomplete="username"></div>
    <div class="field"><label>Contraseña</label><input name="password" type="password" required minlength="8" autocomplete="${setupRequired ? 'new-password' : 'current-password'}"></div>
    <button class="btn big" style="width:100%">${setupRequired ? 'Crear cuenta e ingresar' : 'Ingresar'}</button>
    <p class="muted small center" id="authErr"></p>
  </form>`;
  $('#authForm').onsubmit = async (e) => {
    e.preventDefault();
    try {
      const r = await api(setupRequired ? '/auth/setup' : '/auth/login', { method: 'POST', body: formValues(e.target) });
      setToken(r.token);
      await boot();
    } catch (err) {
      $('#authErr').textContent = err.message;
    }
  };
}

async function boot() {
  let st;
  try {
    st = await api('/auth/status');
  } catch (e) {
    if (state.standalone) return showOffline();
    throw e;
  }
  if (!st.user) return showAuth(st.setupRequired);
  state.user = st.user;
  state.meta = await api('/meta');
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('shell').classList.remove('hidden');
  document.getElementById('userBox').innerHTML = `👤 ${esc(st.user.display_name || st.user.username)}`;
  render();
  startPolling();
}

state.onUnauthorized = () => {
  stopPolling();
  showAuth(false);
};

document.getElementById('logoutBtn').onclick = async () => {
  try { await api('/auth/logout', { method: 'POST' }); } catch { /* sin conexión */ }
  setToken(null);
  stopPolling();
  showAuth(false);
};

// Enlaces a la API (Excel, PDF, conexión con Google): se abren con la sesión actual,
// también cuando la interfaz se usa como archivo HTML descargado.
document.addEventListener('click', async (e) => {
  const a = e.target.closest('a[href^="/api/"]');
  if (!a) return;
  e.preventDefault();
  const path = a.getAttribute('href').slice(4);
  if (path.startsWith('/drive/oauth/start')) return connectGoogle();
  openApiFile(path, { inline: a.target === '_blank' });
});

async function connectGoogle() {
  if (!state.standalone) { location.href = '/api/drive/oauth/start'; return; }
  const win = window.open('', '_blank');
  try {
    const { url } = await api('/drive/oauth/ticket', { method: 'POST' });
    if (win) win.location.href = url; else location.href = url;
    toast('Complete la autorización de Google en la pestaña nueva. Esta pantalla se actualizará sola.', 'info', 8000);
    const started = Date.now();
    const t = setInterval(async () => {
      if (Date.now() - started > 5 * 60_000) return clearInterval(t);
      try {
        const st = await api('/drive/status');
        if (st.connected) { clearInterval(t); toast('Cuenta de Google conectada.', 'ok'); navigate('#/drive'); }
      } catch { /* reintentar */ }
    }, 3000);
  } catch (err) {
    win?.close();
    toast(err.message, 'err');
  }
}
document.getElementById('menuBtn').onclick = () => document.body.classList.toggle('menu-open');
document.getElementById('backdrop').onclick = () => document.body.classList.remove('menu-open');
window.addEventListener('hashchange', render);

// ---------------------------------------------------------------- Progreso y notificaciones
let pollTimer = null;
const lastStatus = new Map();
let lastIncidents = null;

function stopPolling() {
  clearInterval(pollTimer);
  pollTimer = null;
}

function startPolling() {
  stopPolling();
  poll();
  pollTimer = setInterval(poll, 3000);
}

async function poll() {
  try {
    const [runs, incidents] = await Promise.all([api('/runs/active'), api('/incidents?status=open')]);
    const badge = document.getElementById('incBadge');
    badge.textContent = incidents.length;
    badge.classList.toggle('hidden', incidents.length === 0);
    if (lastIncidents !== null && incidents.length > lastIncidents) {
      toast(`${incidents.length - lastIncidents} nueva(s) incidencia(s) requieren revisión.`, 'warn');
    }
    lastIncidents = incidents.length;

    for (const r of runs) {
      const prev = lastStatus.get(r.id);
      if (prev && prev !== r.status) {
        if (r.status === 'completed') toast(`✅ Evaluación «${r.activity}» completada: ${r.evaluated} evaluados, ${r.approved} aprobados.`, 'ok', 8000);
        if (r.status === 'paused' && r.error) toast(`Evaluación pausada: ${r.error}`, 'err', 10000);
      }
      lastStatus.set(r.id, r.status);
    }
    renderBanner(runs.filter((r) => ['running', 'paused', 'queued'].includes(r.status)));
    window.dispatchEvent(new CustomEvent('edugrade:poll', { detail: { runs } }));
  } catch { /* sin conexión momentánea */ }
}

function renderBanner(runs) {
  const el = document.getElementById('runBanner');
  if (!runs.length) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.innerHTML = runs.map((r) => {
    const done = r.evaluated + r.errors + r.no_document;
    return `<div class="row between"><div><strong>${r.status === 'paused' ? '⏸️ Pausada' : '⚙️ Evaluando'}: ${esc(r.activity)}</strong>
      <div class="small" style="opacity:.85">${done}/${r.total} procesados · ${r.evaluated} evaluados · ${r.pending} pendientes · ${r.errors} con incidencias${r.retrying ? ` · ${r.retrying} reintentando` : ''}</div>
      ${r.error ? `<div class="small" style="color:#fecaca">${esc(r.error)}</div>` : ''}</div>
      <div class="row">
        ${r.status === 'running' ? `<button class="btn secondary small" data-run-action="pause" data-id="${r.id}">Pausar</button>` : `<button class="btn green small" data-run-action="resume" data-id="${r.id}">Continuar</button>`}
        <a class="btn secondary small" href="#/resultados/${r.id}">Ver</a></div></div>
      ${progressBar(r)}`;
  }).join('<hr style="border-color:rgba(255,255,255,.1)">');
}

document.getElementById('runBanner').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-run-action]');
  if (!b) return;
  try {
    await api(`/runs/${b.dataset.id}/${b.dataset.runAction}`, { method: 'POST' });
    poll();
  } catch (err) { toast(err.message, 'err'); }
});

boot().catch((e) => { document.body.innerHTML = `<div class="notice err" style="margin:40px">${esc(e.message)}</div>`; });
