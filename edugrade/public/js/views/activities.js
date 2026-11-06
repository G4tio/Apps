import { api, esc, toast, modal, confirmDialog, formValues, options, setActions, state, $, runStatusBadge } from '../core.js';

export async function activitiesView(el, { navigate, query }) {
  const [acts, rubrics, rosters] = await Promise.all([api('/activities'), api('/rubrics'), api('/rosters')]);
  setActions('<button class="btn" id="newAct">＋ Nueva actividad</button>');
  $('#newAct').onclick = () => activityForm(null, { rubrics, rosters, navigate });

  el.innerHTML = acts.length ? `
    <div class="notice mb">Configure cada actividad con su nivel, grado, rúbrica y listado. Luego presione <strong>INICIAR EVALUACIÓN</strong>: la IA procesará automáticamente todos los documentos.</div>
    ${acts.map((a) => `<div class="list-card">
      <div class="grow" style="min-width:240px">
        <h4>${esc(a.name)}</h4>
        <div class="muted small">${esc(a.subject)} · ${esc(a.level)}${a.grade ? ` · ${esc(a.grade)}` : ''}${a.section ? ` · Sección ${esc(a.section)}` : ''}${a.due_date ? ` · Entrega: ${esc(a.due_date)}` : ''}</div>
        <div class="chips">
          <span class="badge ${a.rubric_id ? 'blue' : 'red'}">📋 ${esc(a.rubric_name || 'Sin rúbrica')}</span>
          <span class="badge ${a.roster_id ? 'blue' : 'red'}">👥 ${esc(a.roster_name || 'Sin listado')}</span>
          <span class="badge gray">Escala 0–${a.scale_max} · mínimo ${a.pass_mark}</span>
          ${a.file_keyword ? `<span class="badge gray">Archivos con «${esc(a.file_keyword)}»</span>` : ''}
          ${a.last_run_id ? `<a href="#/resultados/${a.last_run_id}">${runStatusBadge(a.last_run_status)}</a>` : ''}
        </div>
      </div>
      <div class="row">
        <button class="btn green" data-start="${a.id}">▶ INICIAR EVALUACIÓN</button>
        <button class="btn secondary small" data-edit="${a.id}">Editar</button>
        <button class="btn secondary small" data-dup="${a.id}">Duplicar</button>
        <button class="btn danger small" data-del="${a.id}">Eliminar</button>
      </div></div>`).join('')}`
    : `<div class="card"><div class="empty"><div class="big">🎓</div><h3>Sin actividades configuradas</h3><p>Cree una actividad para definir qué se evalúa, con qué rúbrica y para qué estudiantes.</p>
      <button class="btn" id="newAct2">Crear actividad</button></div></div>`;
  $('#newAct2')?.addEventListener('click', () => activityForm(null, { rubrics, rosters, navigate }));

  el.onclick = async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    try {
      if (t.dataset.edit) activityForm(await api(`/activities/${t.dataset.edit}`), { rubrics, rosters, navigate });
      if (t.dataset.dup) { await api(`/activities/${t.dataset.dup}/duplicate`, { method: 'POST' }); toast('Actividad duplicada.', 'ok'); navigate('#/actividades'); }
      if (t.dataset.del && await confirmDialog('¿Eliminar esta configuración? El historial de evaluaciones se conserva.', { okLabel: 'Eliminar', danger: true })) {
        await api(`/activities/${t.dataset.del}`, { method: 'DELETE' }); navigate('#/actividades');
      }
      if (t.dataset.start) startEvaluation(Number(t.dataset.start), navigate);
    } catch (err) { toast(err.message, 'err'); }
  };
  if (query.get('new')) activityForm(null, { rubrics, rosters, navigate });
}

function activityForm(a, { rubrics, rosters, navigate }) {
  const levels = state.meta.levels;
  a = a || { level: 'Primaria', scale_max: 100, pass_mark: 60 };
  const m = modal({
    title: a.id ? 'Editar actividad' : 'Nueva actividad',
    wide: true,
    body: `<form class="form-grid" id="af">
      <div class="field full"><label>Nombre de la actividad *</label><input name="name" value="${esc(a.name || '')}" placeholder="Tarea 1: Fracciones equivalentes"></div>
      <div class="field"><label>Nivel educativo *</label><select name="level">${options(Object.keys(levels), a.level)}</select></div>
      <div class="field"><label>Grado</label><select name="grade" id="gradeSel"></select></div>
      <div class="field"><label>Sección</label><input name="section" value="${esc(a.section || '')}" placeholder="A"></div>
      <div class="field"><label>Materia o área curricular *</label><input name="subject" value="${esc(a.subject || '')}" placeholder="Matemáticas"></div>
      <div class="field full"><label>Descripción de la actividad</label><textarea name="description">${esc(a.description || '')}</textarea></div>
      <div class="field full"><label>Objetivos de aprendizaje</label><textarea name="objectives">${esc(a.objectives || '')}</textarea></div>
      <div class="field full"><label>Instrucciones de la tarea</label><textarea name="instructions" rows="4">${esc(a.instructions || '')}</textarea>
        <div class="hint">La IA usa estas instrucciones para comprender qué debía hacer el estudiante.</div></div>
      <div class="field"><label>Fecha de entrega</label><input type="date" name="due_date" value="${esc(a.due_date || '')}"></div>
      <div class="field"><label>Escala de calificación (nota máxima) *</label><input type="number" step="any" min="1" name="scale_max" value="${a.scale_max}"></div>
      <div class="field"><label>Nota mínima de aprobación *</label><input type="number" step="any" min="0" name="pass_mark" value="${a.pass_mark}"></div>
      <div class="field"><label>Rúbrica *</label><select name="rubric_id" id="rubSel">${options(rubrics.map((r) => ({ value: r.id, label: `${r.is_template ? '⭐ ' : ''}${r.name}${r.level ? ` (${r.level})` : ''}` })), a.rubric_id, { empty: '— Seleccione —' })}</select>
        <div class="hint"><a href="#/rubricas">Crear o editar rúbricas</a></div></div>
      <div class="field"><label>Listado de estudiantes *</label><select name="roster_id">${options(rosters.map((r) => ({ value: r.id, label: `${r.name} (${r.students})` })), a.roster_id ?? rosters[0]?.id, { empty: '— Seleccione —' })}</select></div>
      <div class="field full"><label>Palabra clave en el nombre de los archivos (opcional)</label><input name="file_keyword" value="${esc(a.file_keyword || '')}" placeholder="Ej.: Tarea1, fracciones">
        <div class="hint">Si la carpeta contiene trabajos de varias actividades, solo se evaluarán los PDF cuyo nombre contenga esta palabra (varias separadas por coma). Déjelo vacío para usar todos los PDF.</div></div>
    </form>`,
    actions: [{ label: 'Cancelar', class: 'secondary' }, {
      label: 'Guardar actividad', onClick: async (close, mm) => {
        const body = formValues($('#af', mm));
        if (a.id) await api(`/activities/${a.id}`, { method: 'PUT', body });
        else await api('/activities', { method: 'POST', body });
        close(); toast('Actividad guardada.', 'ok'); navigate('#/actividades');
      },
    }],
  });
  const lvl = $('[name=level]', m.el);
  const fillGrades = () => { $('#gradeSel', m.el).innerHTML = options(levels[lvl.value], a.grade, { empty: '— Todos —' }); };
  lvl.onchange = () => {
    fillGrades();
    const match = rubrics.find((r) => r.level === lvl.value);
    if (match && !$('#rubSel', m.el).value) $('#rubSel', m.el).value = match.id;
  };
  $('#rubSel', m.el).onchange = (e) => {
    const r = rubrics.find((x) => String(x.id) === e.target.value);
    if (r?.pass_mark != null && !a.id) $('[name=pass_mark]', m.el).value = r.pass_mark;
  };
  fillGrades();
}

export async function startEvaluation(activityId, navigate) {
  const check = await api(`/activities/${activityId}/check`);
  const p = check.plan;
  modal({
    title: 'Iniciar evaluación automática',
    body: `
      ${check.problems.length ? `<div class="notice err mb"><strong>No se puede iniciar todavía:</strong><ul>${check.problems.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
      <div class="grid two mb">
        <div class="kpi"><div class="label">Estudiantes</div><div class="value">${p.students}</div></div>
        <div class="kpi green"><div class="label">Con documento identificado</div><div class="value">${p.withDocument}</div></div>
        <div class="kpi"><div class="label">Sin documento</div><div class="value">${p.withoutDocument}</div></div>
        <div class="kpi amber"><div class="label">Documentos por revisar</div><div class="value">${p.unresolved + p.multiple}</div></div>
      </div>
      ${check.warnings.length ? `<div class="notice warn mb"><ul>${check.warnings.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
      ${check.rubric ? `<p class="muted small">Rúbrica: <strong>${esc(check.rubric.name)}</strong> (${check.rubric.criteria} criterios).</p>` : ''}
      <p class="muted small">La evaluación se ejecuta en el servidor: puede cerrar esta ventana y seguir el progreso en la barra superior. Los documentos que ya fueron evaluados sin cambios no se procesan de nuevo.</p>
      <label class="row"><input type="checkbox" id="force"> Volver a evaluar todos los documentos, aunque no hayan cambiado</label>`,
    actions: [{ label: 'Cancelar', class: 'secondary' }, ...(check.ok ? [{
      label: '▶ INICIAR EVALUACIÓN', class: 'green', onClick: async (close, m) => {
        const r = await api('/runs', { method: 'POST', body: { activity_id: activityId, force: $('#force', m).checked } });
        close();
        toast('Evaluación iniciada. Recibirá una notificación al finalizar.', 'ok');
        navigate(`#/resultados/${r.id}`);
      },
    }] : [])],
  });
}

