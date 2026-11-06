import { api, esc, toast, modal, formValues, $, fmtDate, confirmDialog } from '../core.js';

export async function settingsView(el, { navigate }) {
  const [s, users, auditLog] = await Promise.all([api('/settings'), api('/users'), api('/audit')]);
  const ai = s.integrations.ai;
  const dr = s.integrations.drive;
  el.innerHTML = `
    <div class="grid two">
      <div class="card"><h3>Inteligencia artificial</h3>
        ${ai.configured ? `<div class="notice ok">✅ Configurada · Modelo <code>${esc(ai.model)}</code></div>`
          : `<div class="notice err">No configurada. Defina <code>ANTHROPIC_API_KEY</code> en el archivo <code>.env</code> del servidor y reinicie.</div>`}
        <p class="muted small mt">La clave de la API vive solo en el servidor y nunca se envía al navegador. Cada PDF se envía completo al modelo multimodal, que lee texto, tablas, imágenes, dibujos y escritura a mano (OCR).</p>
      </div>
      <div class="card"><h3>Google Drive</h3>
        ${dr.configured ? '<div class="notice ok">✅ Credenciales OAuth configuradas</div>' : '<div class="notice err">No configurado. Defina <code>GOOGLE_CLIENT_ID</code> y <code>GOOGLE_CLIENT_SECRET</code>.</div>'}
        <p class="muted small mt">URI de redirección autorizado: <code>${esc(dr.redirectUri)}</code><br>Permiso: solo lectura (<code>drive.readonly</code>). Los tokens se guardan cifrados (AES-256-GCM).</p>
      </div>
    </div>
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
    <div class="grid two mt">
      <div class="card"><div class="card-head"><h3>Docentes con acceso</h3><button class="btn small" id="addUser">＋ Agregar</button></div>
        <ul>${users.map((u) => `<li><strong>${esc(u.display_name || u.username)}</strong> <span class="muted small">(${esc(u.username)})</span></li>`).join('')}</ul>
        <button class="btn secondary small" id="pwd">Cambiar mi contraseña</button></div>
      <div class="card"><h3>Registro de actividad</h3>
        <div class="table-wrap" style="max-height:260px"><table><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th></tr></thead><tbody>
        ${auditLog.map((a) => `<tr><td class="nowrap small">${fmtDate(a.created_at)}</td><td class="small">${esc(a.user_name || '—')}</td><td class="small">${esc(a.action)}</td></tr>`).join('')}
        </tbody></table></div></div>
    </div>`;

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
