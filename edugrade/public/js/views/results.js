import { api, esc, toast, modal, confirmDialog, options, setActions, $, statusBadge, runStatusBadge, fmtNum, fmtDate, progressBar } from '../core.js';

export async function resultsView(el, { params, query, navigate }) {
  const history = await api('/runs');
  if (!history.length) {
    el.innerHTML = `<div class="card"><div class="empty"><div class="big">✅</div><h3>Aún no hay evaluaciones</h3>
      <p>Configure una actividad y presione «Iniciar evaluación».</p><a class="btn" href="#/actividades">Ir a configuración académica</a></div></div>`;
    return;
  }
  const runId = Number(params[0]) || history[0].id;
  let data = await api(`/runs/${runId}`);
  const sort = { key: 'number', dir: 1 };
  const f = { q: '', grade: '', section: '', status: '' };

  setActions(`<a class="btn green" href="/api/runs/${runId}/export">⬇ Descargar Excel</a>`);
  el.innerHTML = `
    <div class="card mb">
      <div class="row between">
        <div class="field" style="margin:0;min-width:280px;flex:1"><label>Evaluación (actividad)</label>
          <select id="runSel">${options(history.map((h) => ({ value: h.id, label: `#${h.id} · ${h.activity} · ${h.grade || ''} ${h.section || ''} · ${fmtDate(h.date)}` })), runId)}</select></div>
        <div class="row" id="runCtl"></div>
      </div>
      <div id="sum" class="mt"></div>
    </div>
    <div class="card">
      <div class="filters mb">
        <div class="field"><label>Buscar por nombre</label><input id="fq" placeholder="Nombre del estudiante…"></div>
        <div class="field"><label>Grado</label><select id="fg"></select></div>
        <div class="field"><label>Sección</label><select id="fs"></select></div>
        <div class="field"><label>Estado</label><select id="fst">${options(['APROBADO', 'NO APROBADO', 'PENDIENTE', 'SIN DOCUMENTO', 'REVISIÓN NECESARIA'], '', { empty: 'Todos' })}</select></div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th class="sortable" data-sort="number">No. ⇅</th><th class="sortable" data-sort="name">Nombre completo ⇅</th><th>Nivel</th><th>Grado</th><th>Sección</th><th>Actividad</th>
          <th class="sortable" data-sort="score">Nota ⇅</th><th>Resultado</th><th>Estado de evaluación</th><th>Observaciones</th><th></th>
        </tr></thead><tbody id="rtb"></tbody></table></div>
    </div>`;

  $('#runSel').onchange = (e) => navigate(`#/resultados/${e.target.value}`);
  $('#fq').oninput = (e) => { f.q = e.target.value.toLowerCase(); draw(); };
  $('#fg').onchange = (e) => { f.grade = e.target.value; draw(); };
  $('#fs').onchange = (e) => { f.section = e.target.value; draw(); };
  $('#fst').onchange = (e) => { f.status = e.target.value; draw(); };
  el.querySelectorAll('[data-sort]').forEach((th) => th.addEventListener('click', () => {
    if (sort.key === th.dataset.sort) sort.dir *= -1; else { sort.key = th.dataset.sort; sort.dir = th.dataset.sort === 'score' ? -1 : 1; }
    draw();
  }));

  function header() {
    const { run, summary: s } = data;
    const a = run.activity;
    $('#runCtl').innerHTML = `${runStatusBadge(run.status)}
      ${run.status === 'running' ? '<button class="btn secondary small" data-ctl="pause">⏸ Pausar</button>' : ''}
      ${run.status === 'paused' ? '<button class="btn green small" data-ctl="resume">▶ Continuar</button>' : ''}
      ${['running', 'paused'].includes(run.status) ? '<button class="btn danger small" data-ctl="cancel">Cancelar</button>' : ''}`;
    $('#sum').innerHTML = `
      <p class="muted small" style="margin:0 0 10px">${esc(a.subject)} · ${esc(a.level)}${a.grade ? ` · ${esc(a.grade)}` : ''}${a.section ? ` · Sección ${esc(a.section)}` : ''} · Rúbrica: <strong>${esc(run.rubric?.name || '—')}</strong> · Escala 0–${a.scale_max} · Nota mínima ${a.pass_mark}</p>
      ${run.error ? `<div class="notice ${run.status === 'failed' ? 'err' : 'warn'} mb">${esc(run.error)}</div>` : ''}
      ${progressBar(s)}
      <div class="row mt small">
        <span class="badge blue">Procesados ${s.evaluated + s.errors + s.no_document}/${s.total}</span>
        <span class="badge green">Evaluados ${s.evaluated}</span><span class="badge blue">Pendientes ${s.pending}</span>
        <span class="badge amber">Con incidencias ${s.errors}</span><span class="badge gray">Sin documento ${s.no_document}</span>
        <span class="badge green">Aprobados ${s.approved}</span><span class="badge red">No aprobados ${s.failed}</span>
        <span class="badge gray">Promedio ${fmtNum(s.average)}</span><span class="badge gray">Aprobación ${s.pass_rate ?? '—'}%</span>
        ${s.open_incidents ? `<a class="badge amber" href="#/incidencias?run=${run.id}">${s.open_incidents} incidencias abiertas →</a>` : ''}
      </div>`;
    const uniq = (k) => [...new Set(data.items.map((i) => i[k]).filter(Boolean))];
    $('#fg').innerHTML = options(uniq('grade'), f.grade, { empty: 'Todos' });
    $('#fs').innerHTML = options(uniq('section'), f.section, { empty: 'Todas' });
  }

  function draw() {
    const rows = data.items
      .filter((i) => (!f.q || i.name.toLowerCase().includes(f.q)) && (!f.grade || i.grade === f.grade) && (!f.section || i.section === f.section) && (!f.status || i.display_status === f.status))
      .sort((a, b) => {
        const va = a[sort.key] ?? (sort.key === 'score' ? -1 : '');
        const vb = b[sort.key] ?? (sort.key === 'score' ? -1 : '');
        return (typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es')) * sort.dir;
      });
    $('#rtb').innerHTML = rows.map((i) => `<tr>
      <td>${i.number}</td><td><strong>${esc(i.name)}</strong>${i.code ? `<div class="muted small">${esc(i.code)}</div>` : ''}</td>
      <td>${esc(i.level || '—')}</td><td>${esc(i.grade || '—')}</td><td>${esc(i.section || '—')}</td><td>${esc(i.activity)}</td>
      <td class="nowrap">${i.status === 'done' ? `<strong>${fmtNum(i.score)}</strong><span class="muted">/${data.run.activity.scale_max}</span>` : '—'}</td>
      <td>${statusBadge(i.display_status)}</td>
      <td class="small">${esc(i.evaluation_state)}${i.status === 'pending' && i.error ? `<div class="muted">${esc(i.error)}</div>` : ''}</td>
      <td class="small"><div class="clip">${esc(i.feedback?.observation || i.error || '')}</div></td>
      <td class="right"><button class="btn small secondary" data-detail="${i.id}">Detalle</button></td></tr>`).join('')
      || '<tr><td colspan="11" class="center muted">Sin resultados con los filtros actuales.</td></tr>';
  }

  el.onclick = async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    try {
      if (b.dataset.ctl) {
        if (b.dataset.ctl === 'cancel' && !(await confirmDialog('¿Cancelar la evaluación? Los resultados ya guardados se conservan.', { okLabel: 'Cancelar evaluación', danger: true }))) return;
        await api(`/runs/${runId}/${b.dataset.ctl}`, { method: 'POST' });
        await refresh();
      }
      if (b.dataset.detail) detail(data.items.find((i) => i.id === Number(b.dataset.detail)));
    } catch (err) { toast(err.message, 'err'); }
  };

  async function refresh() {
    data = await api(`/runs/${runId}`);
    header();
    draw();
  }

  function detail(it) {
    const a = data.run.activity;
    const fb = it.feedback || {};
    const list = (arr) => (arr?.length ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="muted small">—</p>');
    const m = modal({
      title: it.name,
      wide: true,
      body: `
        <div class="row between mb">
          <div>${it.status === 'done' ? `<span class="score-big">${fmtNum(it.score)}</span><span class="muted"> / ${a.scale_max}</span> · ${fmtNum(it.percent, 1)}%` : ''}
            <div class="mt">${statusBadge(it.display_status)} <span class="muted small">${esc(it.evaluation_state)}</span></div></div>
          <div class="row">
            ${it.file_id ? `<a class="btn secondary small" target="_blank" rel="noopener" href="/api/drive/files/${encodeURIComponent(it.file_id)}/content">📄 Abrir PDF</a>` : ''}
            ${it.web_view_link ? `<a class="btn secondary small" target="_blank" rel="noopener" href="${esc(it.web_view_link)}">Ver en Drive</a>` : ''}
          </div>
        </div>
        ${it.file_name ? `<p class="muted small">Documento: ${esc(it.file_name)}${it.ai_meta?.pages ? ` · ${it.ai_meta.pages} pág.` : ''}${it.ai_meta?.model ? ` · Modelo: ${esc(it.ai_meta.model)}` : ''}${it.reused_from ? ' · Resultado reutilizado (documento sin cambios)' : ''}</p>` : ''}
        ${it.error && it.status !== 'done' ? `<div class="notice warn mb">${esc(it.error)}</div>` : ''}
        ${it.criteria?.length ? `<h3 class="mb">Desglose de la rúbrica</h3>${it.criteria.map((c) => `<div class="crit-result">
          <div class="row between"><strong>${esc(c.name)}</strong><span><strong>${fmtNum(c.score)}</strong>/${c.max_score} · ${esc(c.level_name || '')} · peso ${c.weight}%</span></div>
          <div class="small">${esc(c.justification)}</div>
          ${c.evidence?.length ? `<div class="small muted mt">Evidencias:</div><ul class="small">${c.evidence.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</div>`).join('')}` : ''}
        ${it.status === 'done' && it.feedback ? `<div class="grid three mt">
          <div><h4>💪 Fortalezas</h4>${list(fb.strengths)}</div><div><h4>🧩 Dificultades</h4>${list(fb.difficulties)}</div><div><h4>🎯 Recomendaciones</h4>${list(fb.recommendations)}</div></div>
          <div class="notice mt"><strong>Observación:</strong> ${esc(fb.observation || '')}</div>` : ''}
        <details class="mt"><summary><strong>Modificar nota manualmente</strong></summary>
          <div class="form-grid mt"><div class="field"><label>Nueva nota (0–${a.scale_max})</label><input id="ovScore" type="number" step="any" min="0" max="${a.scale_max}" value="${it.score ?? ''}"></div>
          <div class="field"><label>Motivo *</label><input id="ovReason" placeholder="Ej.: revisión del docente"></div></div>
          <button class="btn small" id="ovSave">Guardar nota</button></details>
        <details class="mt" id="chg"><summary><strong>Historial de cambios de nota</strong></summary><div id="chgList" class="small mt">Cargando…</div></details>`,
      actions: [
        ...(it.file_id && !['pending', 'processing'].includes(it.status) && !['cancelled', 'failed'].includes(data.run.status) ? [{ label: '↻ Volver a evaluar', class: 'secondary', onClick: async (close) => { await api(`/items/${it.id}/reevaluate`, { method: 'POST' }); close(); toast('Documento enviado a la cola de evaluación.', 'ok'); refresh(); } }] : []),
        { label: 'Cerrar', class: 'secondary' },
      ],
    });
    $('#ovSave', m.el).onclick = async () => {
      try {
        await api(`/items/${it.id}/grade`, { method: 'POST', body: { score: $('#ovScore', m.el).value, reason: $('#ovReason', m.el).value } });
        m.close(); toast('Nota actualizada y registrada en el historial.', 'ok'); refresh();
      } catch (e) { toast(e.message, 'err'); }
    };
    $('#chg', m.el).addEventListener('toggle', async () => {
      const ch = await api(`/items/${it.id}/changes`);
      $('#chgList', m.el).innerHTML = ch.length ? `<div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Antes</th><th>Después</th><th>Motivo</th><th>Usuario</th></tr></thead><tbody>
        ${ch.map((c) => `<tr><td>${fmtDate(c.created_at)}</td><td>${{ ai: 'IA', manual: 'Manual', reevaluation: 'Reevaluación' }[c.change_type] || c.change_type}</td><td>${fmtNum(c.old_score)} ${esc(c.old_result || '')}</td><td>${fmtNum(c.new_score)} ${esc(c.new_result || '')}</td><td>${esc(c.reason || '')}</td><td>${esc(c.user_name || 'Sistema')}</td></tr>`).join('')}
        </tbody></table></div>` : 'Sin cambios registrados.';
    }, { once: true });
  }

  header();
  draw();
  const target = Number(query.get('item'));
  if (target) { const it = data.items.find((i) => i.id === target); if (it) detail(it); }

  const onPoll = (e) => { if (e.detail.runs.some((r) => r.id === runId)) refresh().catch(() => {}); };
  window.addEventListener('edugrade:poll', onPoll);
  return () => window.removeEventListener('edugrade:poll', onPoll);
}
