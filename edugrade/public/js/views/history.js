import { api, esc, toast, confirmDialog, fmtDate, fmtNum, runStatusBadge } from '../core.js';

export async function historyView(el, { navigate }) {
  const runs = await api('/runs');
  if (!runs.length) {
    el.innerHTML = '<div class="card"><div class="empty"><div class="big">🕘</div>Aún no hay evaluaciones registradas.</div></div>';
    return;
  }
  el.innerHTML = `<div class="card"><div class="table-wrap"><table>
    <thead><tr><th>#</th><th>Fecha</th><th>Actividad</th><th>Materia</th><th>Grado</th><th>Sección</th><th>Rúbrica</th><th>Estudiantes</th><th>Promedio</th><th>Aprobados</th><th>No aprobados</th><th>Incidencias</th><th>Estado</th><th></th></tr></thead>
    <tbody>${runs.map((r) => `<tr>
      <td>${r.id}</td><td class="nowrap">${fmtDate(r.date)}</td><td><strong>${esc(r.activity)}</strong></td><td>${esc(r.subject || '—')}</td>
      <td>${esc(r.grade || '—')}</td><td>${esc(r.section || '—')}</td><td>${esc(r.rubric)}</td><td>${r.total}</td><td>${fmtNum(r.average)}</td>
      <td><span class="badge green">${r.approved}</span></td><td><span class="badge red">${r.failed}</span></td><td><span class="badge amber">${r.open_incidents + r.no_document}</span></td>
      <td>${runStatusBadge(r.status)}</td>
      <td class="nowrap right"><a class="btn small secondary" href="#/resultados/${r.id}">Ver</a> <a class="btn small green" href="/api/runs/${r.id}/export">Excel</a>
        <button class="btn small danger" data-del="${r.id}">🗑</button></td></tr>`).join('')}</tbody></table></div></div>`;
  el.onclick = async (e) => {
    const b = e.target.closest('[data-del]');
    if (!b) return;
    if (!(await confirmDialog('¿Eliminar esta evaluación del historial? Se borrarán sus notas e incidencias.', { okLabel: 'Eliminar', danger: true }))) return;
    try { await api(`/runs/${b.dataset.del}`, { method: 'DELETE' }); navigate('#/historial'); } catch (err) { toast(err.message, 'err'); }
  };
}
