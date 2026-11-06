// Utilidades compartidas del frontend: API, escape HTML, modales, notificaciones.
export const state = { meta: null, user: null, onUnauthorized: null };

export async function api(path, { method = 'GET', body, form } = {}) {
  const opts = { method, headers: {}, credentials: 'same-origin' };
  if (form) opts.body = form;
  else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, opts);
  if (res.status === 401 && !path.startsWith('/auth/')) {
    state.onUnauthorized?.();
    throw new Error('Sesión expirada.');
  }
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error((data && data.error) || `Error ${res.status}`);
  return data;
}

export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function $(sel, root = document) { return root.querySelector(sel); }
export function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

export function toast(message, type = 'info', ms = 4500) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), ms);
}

export function modal({ title, body, wide = false, actions = [], onOpen }) {
  const root = document.getElementById('modalRoot');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
    <div class="modal-head"><h2>${esc(title)}</h2><button class="close-x" aria-label="Cerrar">×</button></div>
    <div class="modal-body">${body}</div>
    ${actions.length ? '<div class="modal-foot"></div>' : ''}
  </div>`;
  const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.close-x').onclick = close;
  const foot = overlay.querySelector('.modal-foot');
  const el = overlay.querySelector('.modal');
  for (const a of actions) {
    const b = document.createElement('button');
    b.className = `btn ${a.class || ''}`;
    b.textContent = a.label;
    b.onclick = async () => {
      if (!a.onClick) return close();
      b.disabled = true;
      try { await a.onClick(close, el); } catch (e) { toast(e.message, 'err'); } finally { b.disabled = false; }
    };
    foot.appendChild(b);
  }
  root.appendChild(overlay);
  onOpen?.(el, close);
  return { el, close };
}

export function confirmDialog(message, { okLabel = 'Confirmar', danger = false } = {}) {
  return new Promise((resolve) => {
    let done = false;
    const m = modal({
      title: 'Confirmar',
      body: `<p>${esc(message)}</p>`,
      actions: [
        { label: 'Cancelar', class: 'secondary', onClick: (close) => { done = true; resolve(false); close(); } },
        { label: okLabel, class: danger ? 'danger' : '', onClick: (close) => { done = true; resolve(true); close(); } },
      ],
    });
    const obs = new MutationObserver(() => { if (!m.el.isConnected) { obs.disconnect(); if (!done) resolve(false); } });
    obs.observe(document.getElementById('modalRoot'), { childList: true });
  });
}

export function formValues(root) {
  const out = {};
  for (const el of $$('[name]', root)) {
    if (el.type === 'checkbox') out[el.name] = el.checked;
    else out[el.name] = el.value;
  }
  return out;
}

export function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s.includes('T') ? s : `${s.replace(' ', 'T')}Z`);
  return d.toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
}

export function fmtNum(n, d = 2) {
  if (n === null || n === undefined || n === '') return '—';
  return Number(n).toLocaleString('es-GT', { maximumFractionDigits: d });
}

export function statusBadge(s) {
  const cls = `st-${String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}`;
  return `<span class="badge ${cls}">${esc(s)}</span>`;
}

export function runStatusBadge(s) {
  const map = { running: ['En curso', 'blue'], paused: ['Pausada', 'amber'], completed: ['Completada', 'green'], cancelled: ['Cancelada', 'gray'], failed: ['Fallida', 'red'], queued: ['En cola', 'blue'] };
  const [label, cls] = map[s] || [s, 'gray'];
  return `<span class="badge ${cls}">${label}</span>`;
}

export function options(list, selected, { empty } = {}) {
  const items = list.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  return (empty !== undefined ? `<option value="">${esc(empty)}</option>` : '')
    + items.map((o) => `<option value="${esc(o.value)}" ${String(o.value) === String(selected ?? '') ? 'selected' : ''}>${esc(o.label)}</option>`).join('');
}

export function setActions(htmlStr) {
  document.getElementById('topActions').innerHTML = htmlStr || '';
}

export function progressBar(s) {
  const t = Math.max(1, s.total);
  const pct = (n) => `${(n / t) * 100}%`;
  return `<div class="progress" title="${s.evaluated} evaluados · ${s.errors} incidencias · ${s.no_document} sin documento · ${s.pending} pendientes">
    <span class="ok" style="width:${pct(s.evaluated)}"></span><span class="err" style="width:${pct(s.errors)}"></span><span class="nodoc" style="width:${pct(s.no_document)}"></span></div>`;
}

export function download(url) {
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
