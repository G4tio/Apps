import { api, esc, toast, modal, confirmDialog, formValues, options, setActions, fmtDate, $, state } from '../core.js';

export async function studentsView(el, { params, navigate }) {
  const rosters = await api('/rosters');
  setActions('<button class="btn" id="importBtn">⬆ Importar Excel</button>');
  $('#importBtn').onclick = () => importWizard(navigate);

  if (!rosters.length) {
    el.innerHTML = `<div class="card"><div class="empty"><div class="big">📄</div><h3>Aún no hay listados de estudiantes</h3>
      <p>Importe un archivo Excel (.xlsx o .xls). El archivo original se conserva intacto.</p>
      <button class="btn" id="importBtn2">Importar Excel</button></div></div>`;
    $('#importBtn2').onclick = () => importWizard(navigate);
    return;
  }
  const currentId = Number(params[0]) || rosters[0].id;
  const roster = await api(`/rosters/${currentId}`);
  const active = roster.students.filter((s) => !s.deleted);
  const dups = active.filter((s) => s.duplicate).length;

  el.innerHTML = `
    <div class="card mb"><div class="row between">
      <div class="row"><div class="field" style="margin:0;min-width:260px"><label>Listado</label>
        <select id="rosterSel">${options(rosters.map((r) => ({ value: r.id, label: `${r.name} (${r.students})` })), currentId)}</select></div></div>
      <div class="row">
        <a class="btn secondary" href="/api/rosters/${roster.id}/original">⬇ Excel original</a>
        <button class="btn secondary" id="renameBtn">Renombrar</button>
        <button class="btn danger" id="delRoster">Eliminar listado</button>
      </div></div>
      <p class="muted small" style="margin:10px 0 0">Archivo: <strong>${esc(roster.original_filename)}</strong> · Hoja: ${esc(roster.sheet_name)} · Importado: ${fmtDate(roster.created_at)}
      · <strong>${active.length}</strong> estudiantes activos</p>
      ${dups ? `<div class="notice warn mt">⚠ Se detectaron ${dups} registros posiblemente duplicados (resaltados). Revíselos: los duplicados pueden impedir la identificación automática de documentos.</div>` : ''}
    </div>
    <div class="card">
      <div class="card-head"><h3>Estudiantes</h3>
        <div class="row"><input id="q" placeholder="Buscar por nombre o código…" style="width:240px"><button class="btn small" id="addBtn">＋ Agregar estudiante</button></div></div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Nombre completo</th><th>Código</th><th>Nivel</th><th>Grado</th><th>Sección</th><th>Origen</th><th></th></tr></thead>
      <tbody id="tb"></tbody></table></div>
    </div>`;

  const draw = () => {
    const q = $('#q').value.toLowerCase();
    $('#tb').innerHTML = roster.students
      .filter((s) => !q || s.full_name.toLowerCase().includes(q) || String(s.code || '').toLowerCase().includes(q))
      .map((s) => `<tr class="${s.deleted ? 'deleted' : s.duplicate ? 'dup' : ''}">
        <td>${s.order_idx}</td><td><strong>${esc(s.full_name)}</strong>${s.duplicate && !s.deleted ? ' <span class="badge amber">Duplicado</span>' : ''}</td>
        <td>${esc(s.code || '—')}</td><td>${esc(s.level || '—')}</td><td>${esc(s.grade || '—')}</td><td>${esc(s.section || '—')}</td>
        <td>${s.source === 'manual' ? '<span class="badge blue">Manual</span>' : `<span class="badge gray">Excel fila ${s.row_index + 1}</span>`}</td>
        <td class="right">${s.deleted ? `<button class="btn small secondary" data-restore="${s.id}">Restaurar</button>` : `<button class="btn small danger" data-del="${s.id}">Quitar</button>`}</td></tr>`).join('');
  };
  draw();
  $('#q').oninput = draw;
  $('#rosterSel').onchange = (e) => navigate(`#/estudiantes/${e.target.value}`);
  $('#tb').onclick = async (e) => {
    const del = e.target.closest('[data-del]');
    const res = e.target.closest('[data-restore]');
    try {
      if (del && await confirmDialog('¿Quitar este estudiante del listado? El Excel original no se modifica.', { okLabel: 'Quitar', danger: true })) {
        await api(`/students/${del.dataset.del}`, { method: 'DELETE' });
        navigate(`#/estudiantes/${roster.id}`);
      }
      if (res) { await api(`/students/${res.dataset.restore}/restore`, { method: 'POST' }); navigate(`#/estudiantes/${roster.id}`); }
    } catch (err) { toast(err.message, 'err'); }
  };
  $('#addBtn').onclick = () => modal({
    title: 'Agregar estudiante',
    body: `<div class="form-grid"><div class="field full"><label>Nombre completo *</label><input name="full_name"></div>
      <div class="field"><label>Código</label><input name="code"></div><div class="field"><label>Nivel</label><select name="level">${options(Object.keys(state.meta.levels), '', { empty: '—' })}</select></div>
      <div class="field"><label>Grado</label><input name="grade"></div><div class="field"><label>Sección</label><input name="section"></div></div>`,
    actions: [{ label: 'Cancelar', class: 'secondary' }, {
      label: 'Agregar', onClick: async (close, m) => {
        await api(`/rosters/${roster.id}/students`, { method: 'POST', body: formValues(m) });
        close(); toast('Estudiante agregado', 'ok'); navigate(`#/estudiantes/${roster.id}`);
      },
    }],
  });
  $('#delRoster').onclick = async () => {
    if (await confirmDialog(`¿Eliminar el listado «${roster.name}» y sus estudiantes de EduGrade AI? Las evaluaciones históricas se conservan.`, { okLabel: 'Eliminar', danger: true })) {
      await api(`/rosters/${roster.id}`, { method: 'DELETE' });
      navigate('#/estudiantes');
    }
  };
  $('#renameBtn').onclick = () => modal({
    title: 'Renombrar listado', body: `<div class="field"><label>Nombre</label><input name="name" value="${esc(roster.name)}"></div>`,
    actions: [{ label: 'Cancelar', class: 'secondary' }, { label: 'Guardar', onClick: async (close, m) => { await api(`/rosters/${roster.id}`, { method: 'PATCH', body: formValues(m) }); close(); navigate(`#/estudiantes/${roster.id}`); } }],
  });
}

const MAP_FIELDS = [
  ['name', 'Nombre completo'],
  ['firstName', 'Nombres (si están separados)'],
  ['lastName', 'Apellidos (si están separados)'],
  ['code', 'Código del estudiante'],
  ['level', 'Nivel'],
  ['grade', 'Grado'],
  ['section', 'Sección'],
];

function importWizard(navigate) {
  let file = null;
  let preview = null;
  const m = modal({
    title: 'Importar listado de estudiantes',
    wide: true,
    body: `<div class="field"><label>Archivo Excel (.xlsx, .xls)</label><input type="file" id="xf" accept=".xlsx,.xls"></div><div id="wz"></div>`,
    actions: [{ label: 'Cancelar', class: 'secondary' }, {
      label: 'Importar listado', onClick: async (close) => {
        if (!preview) throw new Error('Seleccione un archivo.');
        const fd = new FormData();
        fd.append('file', file);
        fd.append('sheet', preview.sheet);
        fd.append('mapping', JSON.stringify(currentMapping()));
        fd.append('name', $('#rname', m.el).value);
        const r = await api('/rosters', { method: 'POST', form: fd });
        close();
        toast(`Listado importado: ${r.count} estudiantes.`, 'ok');
        navigate(`#/estudiantes/${r.id}`);
      },
    }],
  });

  function currentMapping() {
    const map = { headerRow: Number($('#hdr', m.el).value) - 1 };
    for (const [k] of MAP_FIELDS) map[k] = Number($(`[data-map=${k}]`, m.el).value);
    return map;
  }

  async function loadPreview(sheet, mapping) {
    const fd = new FormData();
    fd.append('file', file);
    if (sheet) fd.append('sheet', sheet);
    if (mapping) fd.append('mapping', JSON.stringify(mapping));
    preview = await api('/rosters/preview', { method: 'POST', form: fd });
    draw();
  }

  function draw() {
    const p = preview;
    const colOpts = [{ value: -1, label: '— No usar —' }, ...p.headers.map((h, i) => ({ value: i, label: `${String.fromCharCode(65 + (i % 26))}${i >= 26 ? Math.floor(i / 26) : ''}: ${h || '(sin encabezado)'}` }))];
    const dupCount = p.students.filter((s) => s.duplicate).length;
    $('#wz', m.el).innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Hoja</label><select id="sheetSel">${options(p.sheets, p.sheet)}</select></div>
        <div class="field"><label>Fila de encabezados</label><input id="hdr" type="number" min="1" value="${p.mapping.headerRow + 1}"></div>
        <div class="field full"><label>Nombre del listado</label><input id="rname" value="${esc(file.name.replace(/\.(xlsx|xls)$/i, ''))}"></div>
      </div>
      <h4 class="mb">Columnas detectadas</h4>
      <div class="form-grid">${MAP_FIELDS.map(([k, label]) => `<div class="field"><label>${label}</label><select data-map="${k}">${options(colOpts, p.mapping[k])}</select></div>`).join('')}</div>
      <div class="notice ${p.students.length ? 'ok' : 'err'} mb">${p.students.length} estudiantes encontrados${dupCount ? ` · <strong>${dupCount} posibles duplicados</strong>` : ''}. Se mantendrá el orden original.</div>
      <div class="table-wrap" style="max-height:320px"><table><thead><tr><th>Fila</th><th>Nombre completo</th><th>Código</th><th>Nivel</th><th>Grado</th><th>Sección</th></tr></thead><tbody>
        ${p.students.slice(0, 200).map((s) => `<tr class="${s.duplicate ? 'dup' : ''}"><td>${s.row_index + 1}</td><td>${esc(s.full_name)}${s.duplicate ? ' <span class="badge amber">Duplicado</span>' : ''}</td><td>${esc(s.code || '')}</td><td>${esc(s.level || '')}</td><td>${esc(s.grade || '')}</td><td>${esc(s.section || '')}</td></tr>`).join('')}
      </tbody></table></div>`;
    $('#sheetSel', m.el).onchange = (e) => loadPreview(e.target.value).catch((err) => toast(err.message, 'err'));
    const remap = () => loadPreview(p.sheet, currentMapping()).catch((err) => toast(err.message, 'err'));
    $('#hdr', m.el).onchange = remap;
    m.el.querySelectorAll('[data-map]').forEach((s) => { s.onchange = remap; });
  }

  $('#xf', m.el).onchange = async (e) => {
    file = e.target.files[0];
    if (!file) return;
    try { await loadPreview(); } catch (err) { toast(err.message, 'err'); }
  };
}
