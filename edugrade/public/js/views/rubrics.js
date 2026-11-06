import { api, esc, toast, modal, confirmDialog, options, setActions, state, $, $$ } from '../core.js';

export async function rubricsView(el, { navigate }) {
  const rubrics = await api('/rubrics');
  setActions(`<button class="btn secondary" id="impBtn">⬆ Importar</button><button class="btn" id="newBtn">＋ Crear desde cero</button>`);
  $('#newBtn').onclick = () => editor(null, navigate);
  $('#impBtn').onclick = () => importDialog(navigate);

  const card = (r) => {
    const sum = r.criteria.reduce((a, c) => a + Number(c.weight), 0);
    return `<div class="list-card"><div class="grow" style="min-width:240px">
      <h4>${r.is_template ? '⭐ ' : ''}${esc(r.name)}</h4>
      <div class="muted small">${esc(r.description || '')}</div>
      <div class="chips">${r.level ? `<span class="badge blue">${esc(r.level)}</span>` : ''}${r.subject ? `<span class="badge gray">${esc(r.subject)}</span>` : ''}${r.activity ? `<span class="badge gray">${esc(r.activity)}</span>` : ''}
        <span class="badge ${Math.abs(sum - 100) < 0.001 ? 'green' : 'red'}">${r.criteria.length} criterios · ${sum}%</span>${r.pass_mark != null ? `<span class="badge gray">Mínimo ${r.pass_mark}</span>` : ''}</div>
      <div class="muted small mt">${r.criteria.map((c) => `${esc(c.name)} (${c.weight}%)`).join(' · ')}</div></div>
      <div class="row">
        ${r.is_template ? `<button class="btn small" data-use="${r.id}">Usar plantilla</button>` : ''}
        <button class="btn secondary small" data-edit="${r.id}">Editar</button>
        <button class="btn secondary small" data-dup="${r.id}">Duplicar</button>
        <a class="btn secondary small" href="/api/rubrics/${r.id}/export">Exportar</a>
        <button class="btn danger small" data-del="${r.id}">Eliminar</button></div></div>`;
  };
  const templates = rubrics.filter((r) => r.is_template);
  const own = rubrics.filter((r) => !r.is_template);
  el.innerHTML = `
    <div class="card mb"><div class="card-head"><h3>Mis rúbricas</h3></div>${own.length ? own.map(card).join('') : '<p class="muted">Aún no tiene rúbricas propias. Cree una desde cero, importe un archivo o use una plantilla.</p>'}</div>
    <div class="card"><div class="card-head"><h3>Plantillas</h3><span class="muted small">Puntos de partida por nivel educativo</span></div>${templates.map(card).join('') || '<p class="muted">Sin plantillas.</p>'}</div>`;

  el.onclick = async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    try {
      if (b.dataset.edit) editor(await api(`/rubrics/${b.dataset.edit}`), navigate);
      if (b.dataset.use) {
        const r = await api(`/rubrics/${b.dataset.use}`);
        editor({ ...r, id: null, is_template: false, name: r.name.replace(/^.*?–\s*/, '') }, navigate);
      }
      if (b.dataset.dup) { await api(`/rubrics/${b.dataset.dup}/duplicate`, { method: 'POST' }); toast('Rúbrica duplicada.', 'ok'); navigate('#/rubricas'); }
      if (b.dataset.del && await confirmDialog('¿Eliminar esta rúbrica? Las evaluaciones anteriores conservan una copia de la rúbrica usada.', { okLabel: 'Eliminar', danger: true })) {
        await api(`/rubrics/${b.dataset.del}`, { method: 'DELETE' }); navigate('#/rubricas');
      }
    } catch (err) { toast(err.message, 'err'); }
  };
}

const blankCriterion = (i) => ({
  id: `c${Date.now().toString(36)}${i}`, name: '', description: '', weight: 0, max_score: 4, indicators: [],
  levels: [{ name: 'Excelente', score: 4, descriptor: '' }, { name: 'Bueno', score: 3, descriptor: '' }, { name: 'En proceso', score: 2, descriptor: '' }, { name: 'Inicial', score: 1, descriptor: '' }],
});

function editor(rubric, navigate) {
  const r = rubric ? structuredClone(rubric) : { name: '', description: '', level: '', subject: '', activity: '', pass_mark: 60, is_template: false, criteria: [blankCriterion(0)] };
  const m = modal({
    title: rubric?.id ? 'Editar rúbrica' : 'Nueva rúbrica',
    wide: true,
    body: `<div class="form-grid">
        <div class="field full"><label>Nombre *</label><input id="rName" value="${esc(r.name)}"></div>
        <div class="field full"><label>Descripción</label><input id="rDesc" value="${esc(r.description || '')}"></div>
        <div class="field"><label>Nivel educativo</label><select id="rLevel">${options(Object.keys(state.meta.levels), r.level, { empty: 'Cualquier nivel' })}</select></div>
        <div class="field"><label>Materia</label><input id="rSubject" value="${esc(r.subject || '')}"></div>
        <div class="field"><label>Actividad</label><input id="rActivity" value="${esc(r.activity || '')}"></div>
        <div class="field"><label>Nota mínima de aprobación sugerida</label><input id="rPass" type="number" step="any" value="${r.pass_mark ?? ''}"></div>
        <div class="field full"><label class="row"><input type="checkbox" id="rTpl" ${r.is_template ? 'checked' : ''}> Guardar como plantilla reutilizable</label></div>
      </div>
      <div class="row between mb"><h3 style="margin:0">Criterios</h3><span>Suma de ponderaciones: <span id="wsum" class="weight-sum"></span></span></div>
      <div id="crits"></div>
      <button class="btn secondary" id="addCrit">＋ Agregar criterio</button>`,
    actions: [{ label: 'Cancelar', class: 'secondary' }, {
      label: 'Guardar rúbrica', onClick: async (close) => {
        collect();
        const body = { ...r, name: $('#rName', m.el).value, description: $('#rDesc', m.el).value, level: $('#rLevel', m.el).value || null,
          subject: $('#rSubject', m.el).value, activity: $('#rActivity', m.el).value, pass_mark: $('#rPass', m.el).value, is_template: $('#rTpl', m.el).checked };
        if (rubric?.id) await api(`/rubrics/${rubric.id}`, { method: 'PUT', body });
        else await api('/rubrics', { method: 'POST', body });
        close(); toast('Rúbrica guardada.', 'ok'); navigate('#/rubricas');
      },
    }],
  });

  function collect() {
    r.criteria = $$('.crit', m.el).map((c) => ({
      id: c.dataset.id,
      name: $('[data-k=name]', c).value,
      description: $('[data-k=description]', c).value,
      weight: Number($('[data-k=weight]', c).value),
      max_score: Number($('[data-k=max_score]', c).value),
      indicators: $('[data-k=indicators]', c).value.split('\n').map((s) => s.trim()).filter(Boolean),
      levels: $$('tr[data-level]', c).map((tr) => ({ name: $('[data-l=name]', tr).value, score: Number($('[data-l=score]', tr).value), descriptor: $('[data-l=descriptor]', tr).value })),
    }));
  }
  function updateSum() {
    const sum = $$('[data-k=weight]', m.el).reduce((a, i) => a + (Number(i.value) || 0), 0);
    const ws = $('#wsum', m.el);
    ws.textContent = `${Math.round(sum * 100) / 100}%`;
    ws.className = `weight-sum ${Math.abs(sum - 100) < 0.001 ? 'ok' : 'bad'}`;
  }
  function draw() {
    $('#crits', m.el).innerHTML = r.criteria.map((c, i) => `<div class="crit" data-id="${esc(c.id)}">
      <div class="crit-head">
        <div class="field" style="margin:0"><label>Criterio ${i + 1} *</label><input data-k="name" value="${esc(c.name)}" placeholder="Nombre del criterio"></div>
        <div class="field" style="margin:0"><label>Ponderación %</label><input data-k="weight" type="number" step="any" min="0" value="${c.weight}"></div>
        <div class="field" style="margin:0"><label>Puntuación máx.</label><input data-k="max_score" type="number" step="any" min="0" value="${c.max_score}"></div>
        <button class="icon-btn" data-rm="${i}" title="Eliminar criterio">🗑</button>
      </div>
      <div class="form-grid mt">
        <div class="field"><label>Descripción</label><textarea data-k="description" rows="2">${esc(c.description || '')}</textarea></div>
        <div class="field"><label>Indicadores de cumplimiento (uno por línea)</label><textarea data-k="indicators" rows="2">${esc((c.indicators || []).join('\n'))}</textarea></div>
      </div>
      <label>Niveles de desempeño</label>
      <div class="table-wrap"><table class="levels-table"><thead><tr><th style="width:24%">Nivel</th><th style="width:14%">Puntos</th><th>Descriptor</th><th></th></tr></thead><tbody>
        ${(c.levels || []).map((l, j) => `<tr data-level><td><input data-l="name" value="${esc(l.name)}"></td><td><input data-l="score" type="number" step="any" value="${l.score}"></td>
          <td><input data-l="descriptor" value="${esc(l.descriptor || '')}"></td><td><button class="icon-btn" data-rml="${i}:${j}" title="Quitar nivel">✕</button></td></tr>`).join('')}
      </tbody></table></div>
      <button class="btn small secondary mt" data-addl="${i}">＋ Nivel</button>
    </div>`).join('');
    updateSum();
  }
  m.el.addEventListener('input', (e) => { if (e.target.dataset.k === 'weight') updateSum(); });
  m.el.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.rm !== undefined) { collect(); r.criteria.splice(Number(b.dataset.rm), 1); draw(); }
    if (b.dataset.addl !== undefined) { collect(); const c = r.criteria[Number(b.dataset.addl)]; c.levels.push({ name: '', score: 0, descriptor: '' }); draw(); }
    if (b.dataset.rml !== undefined) { collect(); const [i, j] = b.dataset.rml.split(':').map(Number); r.criteria[i].levels.splice(j, 1); draw(); }
    if (b.id === 'addCrit') { collect(); r.criteria.push(blankCriterion(r.criteria.length)); draw(); }
  });
  draw();
}

function importDialog(navigate) {
  modal({
    title: 'Importar rúbrica',
    body: `<div class="field"><label>Archivo (.json o .xlsx/.xls)</label><input type="file" id="rf" accept=".json,.xlsx,.xls"></div>
      <div class="notice small"><strong>Formato Excel:</strong> primera fila con encabezados <code>Criterio</code>, <code>Descripción</code>, <code>Ponderación</code>, <code>Puntuación máxima</code>, <code>Indicadores</code> (separados por «;») y <code>Niveles</code> con el formato <code>Excelente:4:descriptor | Bueno:3:descriptor</code>.<br>
      <strong>JSON:</strong> el mismo formato que produce «Exportar».</div>`,
    actions: [{ label: 'Cancelar', class: 'secondary' }, {
      label: 'Importar', onClick: async (close, m) => {
        const f = $('#rf', m).files[0];
        if (!f) throw new Error('Seleccione un archivo.');
        const fd = new FormData();
        fd.append('file', f);
        await api('/rubrics/import', { method: 'POST', form: fd });
        close(); toast('Rúbrica importada.', 'ok'); navigate('#/rubricas');
      },
    }],
  });
}
