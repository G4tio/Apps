import { api, esc, toast, modal, options, $, fmtDate } from '../core.js';

const ICON = {
  pdf_ilegible: '👓', documento_vacio: '📭', archivo_danado: '💥', alumno_no_identificado: '❓',
  coincidencia_dudosa: '🔀', rubrica_no_configurada: '📋', evidencia_insuficiente: '🔍', error_procesamiento: '⚠️',
};

export async function incidentsView(el, { query, navigate }) {
  const status = query.get('status') || 'open';
  const runFilter = query.get('run') || '';
  const [list, runs] = await Promise.all([
    api(`/incidents?status=${status}${runFilter ? `&run_id=${runFilter}` : ''}`),
    api('/runs'),
  ]);
  const types = [...new Set(list.map((i) => i.type))];

  el.innerHTML = `
    <div class="card mb"><div class="filters">
      <div class="field"><label>Estado</label><select id="st">${options([{ value: 'open', label: 'Abiertas' }, { value: 'resolved', label: 'Resueltas' }, { value: 'ignored', label: 'Descartadas' }, { value: 'all', label: 'Todas' }], status)}</select></div>
      <div class="field"><label>Evaluación</label><select id="rn">${options(runs.map((r) => ({ value: r.id, label: `#${r.id} · ${r.activity}` })), runFilter, { empty: 'Todas' })}</select></div>
      <div class="field"><label>Tipo</label><select id="tp">${options(types.map((t) => ({ value: t, label: list.find((x) => x.type === t).type_label })), '', { empty: 'Todos' })}</select></div>
    </div>
    <p class="muted small" style="margin:10px 0 0">Las incidencias no detienen la evaluación del resto de estudiantes. Resuélvalas asignando el documento correcto o volviendo a ejecutar la evaluación. Nunca se asigna una nota inventada.</p></div>
    <div id="ilist"></div>`;

  const go = () => navigate(`#/incidencias?status=${$('#st').value}${$('#rn').value ? `&run=${$('#rn').value}` : ''}`);
  $('#st').onchange = go;
  $('#rn').onchange = go;

  const draw = () => {
    const tp = $('#tp').value;
    const rows = list.filter((i) => !tp || i.type === tp);
    $('#ilist').innerHTML = rows.length ? rows.map((i) => {
      const open = i.status === 'open';
      const runOpen = !['cancelled', 'failed'].includes(i.run_status);
      const canAssign = open && runOpen && ((!i.item_id && i.file_id) || i.files.length);
      return `<div class="list-card">
        <div class="grow" style="min-width:260px">
          <h4>${ICON[i.type] || '⚠️'} ${esc(i.type_label)}${i.student_name ? ` · ${esc(i.student_name)}` : ''}</h4>
          <div class="muted small">Evaluación #${i.run_id} · ${esc(i.activity || '')} · ${fmtDate(i.created_at)}</div>
          ${i.file_name ? `<div class="small mt">📄 ${i.file_id ? `<a target="_blank" rel="noopener" href="/api/drive/files/${encodeURIComponent(i.file_id)}/content">${esc(i.file_name)}</a>` : esc(i.file_name)}</div>` : ''}
          <div class="small mt">${esc(i.message || '')}</div>
          ${i.candidates?.length ? `<div class="chips">${i.candidates.map((c) => `<span class="badge gray">${esc(c.name)} · ${Math.round(c.score * 100)}%</span>`).join('')}</div>` : ''}
          ${!open ? `<div class="small mt"><span class="badge ${i.status === 'resolved' ? 'green' : 'gray'}">${i.status === 'resolved' ? 'Resuelta' : 'Descartada'}</span> ${esc(i.resolution || '')}</div>` : ''}
        </div>
        ${open ? `<div class="row">
          ${canAssign ? `<button class="btn small" data-assign="${i.id}">${i.files.length ? 'Elegir documento' : 'Asignar estudiante'}</button>` : ''}
          ${i.item_id && i.file_id && runOpen ? `<button class="btn small secondary" data-retry="${i.id}">↻ Reintentar evaluación</button>` : ''}
          ${i.type === 'rubrica_no_configurada' ? '<a class="btn small secondary" href="#/actividades">Configurar rúbrica</a>' : ''}
          ${i.item_id ? `<a class="btn small secondary" href="#/resultados/${i.run_id}?item=${i.item_id}">Nota manual</a>` : ''}
          <button class="btn small danger" data-ignore="${i.id}">Descartar</button>
        </div>` : ''}
      </div>`;
    }).join('') : `<div class="card"><div class="empty"><div class="big">🎉</div>No hay incidencias ${status === 'open' ? 'abiertas' : ''}.</div></div>`;
  };
  $('#tp').onchange = draw;
  draw();

  el.onclick = async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const inc = list.find((x) => x.id === Number(b.dataset.assign || b.dataset.retry || b.dataset.ignore));
    if (!inc) return;
    try {
      if (b.dataset.retry) {
        await api(`/incidents/${inc.id}/retry`, { method: 'POST' });
        toast('Documento enviado nuevamente a la cola.', 'ok'); go();
      }
      if (b.dataset.ignore) {
        modal({
          title: 'Descartar incidencia',
          body: `<div class="field"><label>Nota (opcional)</label><input name="note" placeholder="Ej.: documento de otra actividad"></div>
            ${inc.file_id && !inc.item_id ? '<label class="row"><input type="checkbox" id="remember"> Ignorar este documento también en futuras evaluaciones</label>' : ''}`,
          actions: [{ label: 'Cancelar', class: 'secondary' }, { label: 'Descartar', class: 'danger', onClick: async (close, m) => {
            await api(`/incidents/${inc.id}/ignore`, { method: 'POST', body: { note: $('[name=note]', m).value, remember: $('#remember', m)?.checked } });
            close(); go();
          } }],
        });
      }
      if (b.dataset.assign) {
        const students = await api(`/runs/${inc.run_id}/students`);
        modal({
          title: inc.files.length ? 'Elegir el documento a evaluar' : 'Asignar documento a un estudiante',
          body: inc.files.length
            ? `<p>${esc(inc.student_name || '')} tiene varios documentos. Seleccione cuál corresponde a esta actividad:</p>
               <div class="field"><select name="file_id">${options(inc.files.map((f) => ({ value: f.id, label: f.name })), '')}</select></div>
               <input type="hidden" name="student_id" value="${inc.student_id}">`
            : `<p>📄 <strong>${esc(inc.file_name)}</strong></p>
               <div class="field"><label>Estudiante</label><select name="student_id">${options(students.map((s) => ({ value: s.id, label: `${s.full_name}${s.file_name ? ` (ya tiene: ${s.file_name})` : ''}` })), inc.candidates?.[0]?.studentId || inc.student_id, { empty: '— Seleccione —' })}</select></div>
               <p class="muted small">El documento se evaluará de inmediato y la asignación se recordará para próximas evaluaciones.</p>`,
          actions: [{ label: 'Cancelar', class: 'secondary' }, { label: 'Asignar y evaluar', onClick: async (close, m) => {
            const sid = $('[name=student_id]', m).value;
            if (!sid) throw new Error('Seleccione un estudiante.');
            await api(`/incidents/${inc.id}/assign`, { method: 'POST', body: { student_id: sid, file_id: $('[name=file_id]', m)?.value } });
            close(); toast('Documento asignado y enviado a evaluación.', 'ok'); go();
          } }],
        });
      }
    } catch (err) { toast(err.message, 'err'); }
  };
}
