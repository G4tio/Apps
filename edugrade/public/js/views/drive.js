import { api, esc, toast, modal, options, setActions, fmtDate, $, confirmDialog, state } from '../core.js';

const MATCH = {
  confirmed: ['Coincidencia confirmada', 'green'],
  manual: ['Asignado manualmente', 'green'],
  probable: ['Coincidencia probable', 'amber'],
  none: ['Sin coincidencia', 'red'],
  ignored: ['Ignorado', 'gray'],
};

export async function driveView(el, { query, navigate }) {
  if (query.get('drive_connected')) toast('Cuenta de Google conectada correctamente.', 'ok');
  if (query.get('drive_error')) toast(`Google Drive: ${query.get('drive_error')}`, 'err', 9000);
  const st = await api('/drive/status');
  const rosters = await api('/rosters');

  const setupHelp = state.local
    ? `<p class="muted">Para usar Google Drive, ingrese el «Client ID» de Google en <a href="#/ajustes">Ajustes</a>. Mientras tanto puede subir los PDF desde este dispositivo.</p>`
    : `<div class="notice warn">El administrador debe crear credenciales OAuth 2.0 en Google Cloud y definir <code>GOOGLE_CLIENT_ID</code> y <code>GOOGLE_CLIENT_SECRET</code>.</div>
      <ol class="mt small">
        <li>En <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank" rel="noopener">Google Cloud Console</a>, habilite <strong>Google Drive API</strong>.</li>
        <li>Configure la pantalla de consentimiento OAuth con el alcance <code>…/auth/drive.readonly</code>.</li>
        <li>Cree un <strong>ID de cliente OAuth</strong> («Aplicación web») con el URI de redirección <code>${esc(st.redirectUri || `${location.origin}/api/drive/oauth/callback`)}</code>.</li>
        <li>Copie el ID y el secreto en el archivo <code>.env</code> y reinicie EduGrade AI.</li>
      </ol>`;

  setActions(st.connected && st.folder ? '<button class="btn" id="syncBtn">⟳ Sincronizar Drive</button>' : '');
  const rosterId = Number(query.get('roster')) || rosters[0]?.id || null;

  el.innerHTML = `
    <div class="card mb"><div class="card-head"><h3>📤 Subir PDF desde este dispositivo</h3>${st.localCount ? `<span class="badge blue">${st.localCount} subidos</span>` : ''}</div>
      <p class="muted small" style="margin-top:0">Seleccione los trabajos en PDF (puede elegir varios a la vez). Nómbrelos con el nombre del estudiante, por ejemplo <code>Ana_Lopez_Tarea1.pdf</code>.</p>
      <label class="btn">Elegir archivos PDF<input type="file" id="upl" accept="application/pdf,.pdf" multiple class="hidden"></label>
      <span class="muted small" id="uplMsg"></span>
    </div>
    <div class="grid two">
      <div class="card"><h3>Cuenta de Google</h3>
        ${!st.configured ? setupHelp : st.connected ? `<p>✅ Conectada${st.email ? ` como <strong>${esc(st.email)}</strong>` : ''}</p>
          <p class="muted small">Permiso solicitado: solo lectura de Drive (<code>drive.readonly</code>). EduGrade AI nunca modifica ni elimina sus archivos.</p>
          <button class="btn danger small" id="discBtn">Desconectar</button>`
        : `<p class="muted">${st.email ? `La sesión de ${esc(st.email)} expiró. ` : ''}Conecte la cuenta de Google donde está la carpeta con las tareas en PDF.</p>
          <a class="btn" href="/api/drive/oauth/start">Conectar cuenta Google</a>`}
      </div>
      <div class="card"><h3>Carpeta de tareas en Drive</h3>
        ${st.folder ? `<p>📁 <strong>${esc(st.folder.name)}</strong></p>
          <p class="muted small">Última sincronización: ${fmtDate(st.lastSync)} · Se exploran también las subcarpetas.</p>` : '<p class="muted">No hay carpeta seleccionada.</p>'}
        ${st.connected ? `<button class="btn secondary small" id="pickBtn">${st.folder ? 'Cambiar carpeta' : 'Seleccionar carpeta'}</button>` : ''}
      </div>
    </div>
    ${st.pdfCount ? `<div class="card mt">
      <div class="card-head"><h3>Documentos e identificación de estudiantes</h3>
        <div class="row"><span class="badge blue">${st.pdfCount} PDF</span>${st.newCount ? `<span class="badge green">${st.newCount} nuevos</span>` : ''}${st.modifiedCount ? `<span class="badge amber">${st.modifiedCount} modificados</span>` : ''}
        ${rosters.length ? `<select id="rosterSel" style="width:auto">${options(rosters.map((r) => ({ value: r.id, label: `Listado: ${r.name}` })), rosterId)}</select>` : ''}
        <select id="mf" style="width:auto">${options([{ value: '', label: 'Todos los estados' }, ...Object.entries(MATCH).map(([k, v]) => ({ value: k, label: v[0] }))], '')}</select></div></div>
      ${rosters.length ? '' : '<div class="notice warn mb">Importe un listado de estudiantes para identificar los documentos.</div>'}
      <div id="summary" class="row mb"></div>
      <div class="table-wrap"><table><thead><tr><th>Archivo</th><th>Estado</th><th>Identificación</th><th>Estudiante</th><th></th></tr></thead><tbody id="ftb"></tbody></table></div>
    </div>` : ''}`;

  $('#upl').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    $('#uplMsg').textContent = ` Subiendo ${files.length} archivo(s)…`;
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      const r = await api('/drive/upload', { method: 'POST', form: fd });
      toast(`${r.total} PDF cargados (${r.nuevos} nuevos, ${r.modificados} actualizados).`, 'ok');
      navigate(`#/drive?roster=${rosterId || ''}`);
    } catch (err) { toast(err.message, 'err'); $('#uplMsg').textContent = ''; }
  });
  $('#discBtn')?.addEventListener('click', async () => {
    if (await confirmDialog('¿Desconectar la cuenta de Google? Se revocará el acceso de EduGrade AI.', { okLabel: 'Desconectar', danger: true })) {
      await api('/drive/disconnect', { method: 'POST' });
      navigate('#/drive');
    }
  });
  $('#pickBtn')?.addEventListener('click', () => folderPicker(navigate));
  $('#syncBtn')?.addEventListener('click', async (e) => {
    e.target.disabled = true;
    try {
      const s = await api('/drive/sync', { method: 'POST' });
      toast(`Sincronizado: ${s.total} PDF · ${s.nuevos} nuevos · ${s.modificados} modificados · ${s.eliminados} eliminados`, 'ok');
      navigate(`#/drive?roster=${rosterId || ''}`);
    } catch (err) { toast(err.message, 'err'); e.target.disabled = false; }
  });
  if (!st.pdfCount) return;

  let students = [];
  if (rosterId) students = (await api(`/rosters/${rosterId}`)).students.filter((s) => !s.deleted);
  const files = await api(`/drive/files${rosterId ? `?roster_id=${rosterId}` : ''}`);
  const counts = files.reduce((a, f) => { a[f.match_status || 'none'] = (a[f.match_status || 'none'] || 0) + 1; return a; }, {});
  $('#summary').innerHTML = Object.entries(MATCH).filter(([k]) => counts[k]).map(([k, [label, cls]]) => `<span class="badge ${cls}">${label}: ${counts[k]}</span>`).join('');
  $('#rosterSel')?.addEventListener('change', (e) => navigate(`#/drive?roster=${e.target.value}`));

  const draw = () => {
    const mf = $('#mf').value;
    const rows = files.filter((f) => !mf || (f.match_status || 'none') === mf);
    $('#ftb').innerHTML = rows.map((f) => {
      const [label, cls] = MATCH[f.match_status || 'none'];
      const sync = { new: ['Nuevo', 'green'], modified: ['Modificado', 'amber'], unchanged: ['Sin cambios', 'gray'] }[f.sync_state] || [f.sync_state, 'gray'];
      const shown = f.match_status === 'probable' ? (f.candidates[0]?.name ? `¿${f.candidates[0].name}?` : '') : f.student_name;
      return `<tr><td><a href="${f.web_view_link ? esc(f.web_view_link) : `/api/drive/files/${encodeURIComponent(f.id)}/content`}" target="_blank" rel="noopener">📄 ${esc(f.name)}</a>${f.path ? `<div class="muted small">${esc(f.path)}</div>` : ''}</td>
        <td><span class="badge ${sync[1]}">${sync[0]}</span></td>
        <td><span class="badge ${cls}">${label}</span>${f.match_reason ? `<div class="muted small">${esc(f.match_reason)}</div>` : ''}</td>
        <td>${esc(shown || '—')}</td>
        <td class="right nowrap">${rosterId ? `<button class="btn small secondary" data-assign="${esc(f.id)}">Asignar</button>` : ''}
          ${f.folder_id === 'local' ? `<button class="btn small danger" data-remove="${esc(f.id)}" title="Quitar">🗑</button>` : ''}</td></tr>`;
    }).join('') || '<tr><td colspan="5" class="muted center">No hay documentos.</td></tr>';
  };
  draw();
  $('#mf').onchange = draw;
  $('#ftb').onclick = async (e) => {
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      if (await confirmDialog('¿Quitar este documento subido?', { okLabel: 'Quitar', danger: true })) {
        try { await api(`/drive/files/${encodeURIComponent(rm.dataset.remove)}`, { method: 'DELETE' }); navigate(`#/drive?roster=${rosterId || ''}`); } catch (err) { toast(err.message, 'err'); }
      }
      return;
    }
    const b = e.target.closest('[data-assign]');
    if (!b) return;
    const f = files.find((x) => x.id === b.dataset.assign);
    modal({
      title: 'Asignar documento',
      body: `<p>📄 <strong>${esc(f.name)}</strong></p>
        ${f.candidates?.length ? `<p class="muted small">Sugerencias: ${f.candidates.map((c) => `${esc(c.name)} (${Math.round(c.score * 100)}%)`).join(', ')}</p>` : ''}
        <div class="field"><label>Estudiante</label><select name="student_id">${options(students.map((s) => ({ value: s.id, label: s.full_name })), f.student_id || f.candidates?.[0]?.studentId, { empty: '— Seleccione —' })}</select></div>`,
      actions: [
        { label: 'Ignorar documento', class: 'secondary', onClick: async (close) => { await api(`/drive/files/${encodeURIComponent(f.id)}/assign`, { method: 'POST', body: { roster_id: rosterId, ignore: true } }); close(); navigate(`#/drive?roster=${rosterId}`); } },
        { label: 'Restablecer automático', class: 'secondary', onClick: async (close) => { await api(`/drive/files/${encodeURIComponent(f.id)}/assign`, { method: 'POST', body: { roster_id: rosterId } }); close(); navigate(`#/drive?roster=${rosterId}`); } },
        { label: 'Asignar', onClick: async (close, m) => {
          const sid = $('[name=student_id]', m).value;
          if (!sid) throw new Error('Seleccione un estudiante.');
          await api(`/drive/files/${encodeURIComponent(f.id)}/assign`, { method: 'POST', body: { roster_id: rosterId, student_id: sid } });
          close(); toast('Documento asignado.', 'ok'); navigate(`#/drive?roster=${rosterId}`);
        } },
      ],
    });
  };
}

function folderPicker(navigate) {
  const trail = [{ id: 'root', name: 'Mi unidad' }];
  let mode = 'root';
  const m = modal({
    title: 'Seleccionar carpeta de Google Drive',
    wide: true,
    body: `<div class="field"><label>Pegar enlace o ID de la carpeta</label><div class="row"><input id="furl" class="grow" placeholder="https://drive.google.com/drive/folders/…" style="flex:1"><button class="btn" id="useUrl">Usar</button></div></div>
      <div class="row mb"><button class="btn small secondary" id="mine">Mi unidad</button><button class="btn small secondary" id="shared">Compartido conmigo</button>
      <input id="fsearch" placeholder="Buscar carpeta por nombre…" style="flex:1;min-width:160px"></div>
      <div class="crumbs" id="crumbs"></div><div class="folder-list" id="flist"></div>
      <div class="row mt between"><span class="muted small" id="cur"></span><button class="btn green" id="chooseCur">Seleccionar esta carpeta</button></div>`,
  });
  const choose = async (folder) => {
    const btns = m.el.querySelectorAll('button');
    btns.forEach((b) => { b.disabled = true; });
    try {
      const r = await api('/drive/folder', { method: 'POST', body: { folder } });
      m.close();
      toast(`Carpeta «${r.folder.name}» seleccionada: ${r.summary.total} PDF encontrados.`, 'ok');
      navigate('#/drive');
    } catch (e) {
      toast(e.message, 'err');
      btns.forEach((b) => { b.disabled = false; });
    }
  };
  const load = async (opts = {}) => {
    $('#flist', m.el).innerHTML = '<div class="empty">Cargando…</div>';
    const cur = trail[trail.length - 1];
    $('#crumbs', m.el).innerHTML = mode === 'root' ? trail.map((t, i) => `<a href="#" data-crumb="${i}">${esc(t.name)}</a>`).join(' › ') : esc(mode === 'shared' ? 'Compartido conmigo' : 'Resultados de búsqueda');
    $('#cur', m.el).textContent = mode === 'root' && cur.id !== 'root' ? `Carpeta actual: ${cur.name}` : '';
    $('#chooseCur', m.el).classList.toggle('hidden', !(mode === 'root' && cur.id !== 'root'));
    try {
      const q = new URLSearchParams(opts.search ? { search: opts.search } : mode === 'shared' ? { shared: '1' } : { parent: cur.id });
      const folders = await api(`/drive/folders?${q}`);
      $('#flist', m.el).innerHTML = folders.map((f) => `<button data-open="${esc(f.id)}" data-name="${esc(f.name)}">📁 <span class="grow">${esc(f.name)}</span><span class="btn small secondary" data-pick="${esc(f.id)}">Elegir</span></button>`).join('')
        || '<div class="empty">No hay subcarpetas.</div>';
    } catch (e) {
      $('#flist', m.el).innerHTML = `<div class="notice err">${esc(e.message)}</div>`;
    }
  };
  m.el.addEventListener('click', (e) => {
    const pick = e.target.closest('[data-pick]');
    if (pick) { e.stopPropagation(); return choose(pick.dataset.pick); }
    const open = e.target.closest('[data-open]');
    if (open) { if (mode !== 'root') { trail.splice(1); mode = 'root'; } trail.push({ id: open.dataset.open, name: open.dataset.name }); return load(); }
    const crumb = e.target.closest('[data-crumb]');
    if (crumb) { e.preventDefault(); trail.splice(Number(crumb.dataset.crumb) + 1); load(); }
  });
  $('#useUrl', m.el).onclick = () => choose($('#furl', m.el).value);
  $('#mine', m.el).onclick = () => { mode = 'root'; trail.splice(1); load(); };
  $('#shared', m.el).onclick = () => { mode = 'shared'; load(); };
  $('#chooseCur', m.el).onclick = () => choose(trail[trail.length - 1].id);
  let t;
  $('#fsearch', m.el).oninput = (e) => { clearTimeout(t); t = setTimeout(() => { if (e.target.value.trim()) { mode = 'search'; load({ search: e.target.value.trim() }); } else { mode = 'root'; load(); } }, 350); };
  load();
}
