import { api, esc, toast, modal, formValues, $, fmtDate, confirmDialog, state } from '../core.js';

export async function settingsView(el, { navigate }) {
  const [s, users, auditLog] = await Promise.all([api('/settings'), state.local ? [] : api('/users'), state.local ? [] : api('/audit')]);
  const ai = s.integrations.ai;
  const dr = s.integrations.drive;
  const integrationsHtml = state.local ? `
    <div class="card"><h3>Conexiones</h3>
      <div class="notice mb">Todo funciona en este navegador. Sus claves y los datos de los estudiantes se guardan <strong>solo en este dispositivo</strong>.</div>
      <form id="intForm" class="form-grid">
        <div class="field full"><label>Clave de la API de IA (Anthropic) ${ai.configured ? '<span class="badge green">Guardada</span>' : '<span class="badge red">Falta</span>'}</label>
          <input name="ai_key" type="password" autocomplete="off" placeholder="${ai.configured ? '•••••••• (deje vacío para conservarla)' : 'sk-ant-…'}">
          <div class="hint">Créela en <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a> → API Keys. Se usa para leer y calificar los PDF.</div></div>
        <div class="field"><label>Modelo de IA</label><input name="ai_model" value="${esc(s.ai_model || ai.model)}"></div>
        <div class="field"><label>Google «Client ID» (opcional, para Google Drive) ${dr.configured ? '<span class="badge green">Guardado</span>' : ''}</label>
          <input name="google_client_id" value="${esc(s.google_client_id || '')}" placeholder="123…apps.googleusercontent.com"></div>
        <div class="full hint" style="margin:-6px 0 12px">Sin Google Drive también puede subir los PDF desde el teléfono en la sección «Documentos». Para usar Drive: en
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">Google Cloud</a> habilite «Google Drive API», cree un «ID de cliente OAuth» de tipo
          <em>Aplicación web</em> y en «Orígenes de JavaScript autorizados» agregue <code>${esc(location.origin === 'null' || location.protocol === 'file:' ? 'la dirección donde publicó esta página' : location.origin)}</code>.</div>
      </form>
      <div class="row"><button class="btn" id="saveInt">Guardar conexiones</button>${ai.configured ? '<button class="btn danger small" id="delKey">Borrar clave de IA</button>' : ''}</div>
    </div>
    <div class="card mt"><h3>Respaldo de los datos</h3>
      <p class="muted small" style="margin-top:0">Los datos viven en este navegador. Descargue un respaldo de vez en cuando; también le sirve para pasarlos a otro dispositivo.</p>
      <div class="row"><a class="btn secondary" href="/api/backup">⬇ Descargar respaldo</a>
        <label class="btn secondary" style="margin:0">⬆ Restaurar respaldo<input type="file" id="restore" accept=".sqlite,.db" class="hidden"></label></div>
    </div>` : `
    <div class="grid two">
      <div class="card"><h3>Inteligencia artificial</h3>
        ${ai.configured ? `<div class="notice ok">✅ Configurada · Modelo <code>${esc(ai.model)}</code></div>`
          : '<div class="notice err">No configurada. Defina <code>ANTHROPIC_API_KEY</code> en el archivo <code>.env</code> del servidor y reinicie.</div>'}
        <p class="muted small mt">La clave de la API vive solo en el servidor y nunca se envía al navegador. Cada PDF se envía completo al modelo multimodal, que lee texto, tablas, imágenes, dibujos y escritura a mano (OCR).</p>
      </div>
      <div class="card"><h3>Google Drive</h3>
        ${dr.configured ? '<div class="notice ok">✅ Credenciales OAuth configuradas</div>' : '<div class="notice err">No configurado. Defina <code>GOOGLE_CLIENT_ID</code> y <code>GOOGLE_CLIENT_SECRET</code>.</div>'}
        <p class="muted small mt">URI de redirección autorizado: <code>${esc(dr.redirectUri)}</code><br>Permiso: solo lectura (<code>drive.readonly</code>). Los tokens se guardan cifrados (AES-256-GCM).</p>
      </div>
    </div>
    <div class="card mt"><div class="card-head"><h3>Versión para el navegador</h3>
        <a class="btn" href="/edugrade.html" download="edugrade.html">⬇ Descargar edugrade.html</a></div>
      <p class="muted small" style="margin:0">Un único archivo que funciona sin servidor: se abre en cualquier navegador (también en el teléfono) y guarda los datos en ese dispositivo.</p>
    </div>`;
  el.innerHTML = `
    ${integrationsHtml}
    <div class="card mt"><h3>Retención y eliminación de documentos</h3>
      <form id="ret" class="form-grid">
        <div class="field"><label>Conservar copias locales de los PDF (días)</label><input type="number" min="0" name="retention_days" value="${s.retention_days}">
          <div class="hint">0 = conservar indefinidamente. Las copias solo se usan para evaluar y para «Abrir PDF»; el original sigue en Drive.</div></div>
        <div class="field"><label>Conservar historial de evaluaciones (días)</label><input type="number" min="0" name="history_days" value="${s.history_days}">
          <div class="hint">0 = conservar siempre. Al vencer se eliminan notas, retroalimentación e incidencias de evaluaciones finalizadas.</div></div>
      </form>
      <div class="row"><button class="btn" id="saveRet">Guardar política</button>
        <button class="btn danger" id="purge">Eliminar ahora todas las copias locales (${s.cache.files} PDF · ${(s.cache.bytes / 1048576).toFixed(1)} MB)</button></div>
    </div>
    ${state.local ? '' : `<div class="grid two mt">
      <div class="card"><div class="card-head"><h3>Docentes con acceso</h3><button class="btn small" id="addUser">＋ Agregar</button></div>
        <ul>${users.map((u) => `<li><strong>${esc(u.display_name || u.username)}</strong> <span class="muted small">(${esc(u.username)})</span></li>`).join('')}</ul>
        <button class="btn secondary small" id="pwd">Cambiar mi contraseña</button></div>
      <div class="card"><h3>Registro de actividad</h3>
        <div class="table-wrap" style="max-height:260px"><table><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th></tr></thead><tbody>
        ${auditLog.map((a) => `<tr><td class="nowrap small">${fmtDate(a.created_at)}</td><td class="small">${esc(a.user_name || '—')}</td><td class="small">${esc(a.action)}</td></tr>`).join('')}
        </tbody></table></div></div>
    </div>`}`;

  $('#saveRet').onclick = async () => {
    try {
      const r = await api('/settings', { method: 'PUT', body: formValues($('#ret')) });
      toast(`Política guardada. Se eliminaron ${r.applied.cache} copias y ${r.applied.runs} evaluaciones vencidas.`, 'ok');
      navigate('#/ajustes');
    } catch (e) { toast(e.message, 'err'); }
  };
  $('#purge').onclick = async () => {
    if (!(await confirmDialog('¿Eliminar todas las copias locales de los PDF? Se volverán a descargar de Drive si se necesitan.', { okLabel: 'Eliminar', danger: true }))) return;
    const r = await api('/settings/purge-cache', { method: 'POST' });
    toast(`${r.deleted} copias eliminadas.`, 'ok');
    navigate('#/ajustes');
  };
  $('#saveInt')?.addEventListener('click', async () => {
    try {
      await api('/settings/integrations', { method: 'PUT', body: formValues($('#intForm')) });
      toast('Conexiones guardadas en este dispositivo.', 'ok');
      state.meta = await api('/meta');
      navigate('#/ajustes');
    } catch (e) { toast(e.message, 'err'); }
  });
  $('#delKey')?.addEventListener('click', async () => {
    if (!(await confirmDialog('¿Borrar la clave de IA de este dispositivo?', { okLabel: 'Borrar', danger: true }))) return;
    await api('/settings/integrations', { method: 'PUT', body: { ai_key: null } });
    navigate('#/ajustes');
  });
  $('#restore')?.addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f || !(await confirmDialog('¿Restaurar este respaldo? Reemplazará todos los datos actuales de este dispositivo.', { okLabel: 'Restaurar', danger: true }))) return;
    try {
      const fd = new FormData();
      fd.append('file', f);
      await api('/backup', { method: 'POST', form: fd });
      toast('Respaldo restaurado. Recargando…', 'ok');
      setTimeout(() => location.reload(), 800);
    } catch (err) { toast(err.message, 'err'); }
  });
  if (state.local) return;
  $('#addUser').onclick = () => modal({
    title: 'Agregar docente',
    body: '<div class="field"><label>Nombre</label><input name="display_name"></div><div class="field"><label>Usuario</label><input name="username"></div><div class="field"><label>Contraseña (mín. 8)</label><input type="password" name="password"></div>',
    actions: [{ label: 'Cancelar', class: 'secondary' }, { label: 'Crear', onClick: async (close, m) => { await api('/users', { method: 'POST', body: formValues(m) }); close(); toast('Docente agregado.', 'ok'); navigate('#/ajustes'); } }],
  });
  $('#pwd').onclick = () => modal({
    title: 'Cambiar contraseña',
    body: '<div class="field"><label>Contraseña actual</label><input type="password" name="current"></div><div class="field"><label>Nueva contraseña</label><input type="password" name="password"></div>',
    actions: [{ label: 'Cancelar', class: 'secondary' }, { label: 'Guardar', onClick: async (close, m) => { await api('/users/me/password', { method: 'POST', body: formValues(m) }); close(); toast('Contraseña actualizada.', 'ok'); } }],
  });
}
