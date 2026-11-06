import { api, esc, fmtNum, options, setActions, statusBadge } from '../core.js';

const C = { navy: '#0B1F3A', electric: '#1E6BFF', green: '#22C55E', red: '#EF4444', amber: '#F59E0B', grid: '#E2E8F0' };

export async function dashboardView(el) {
  const [filters, drive, rosters, activities, rubrics] = await Promise.all([
    api('/filters'), api('/drive/status'), api('/rosters'), api('/activities'), api('/rubrics'),
  ]);
  const f = {};
  const charts = [];
  setActions('<a class="btn green" href="#/actividades">▶ INICIAR EVALUACIÓN</a>');

  const steps = [
    { done: rosters.length > 0, title: 'Importar Excel de estudiantes', href: '#/estudiantes' },
    { done: drive.connected && drive.folder, title: 'Conectar carpeta de Google Drive', href: '#/drive' },
    { done: activities.some((a) => a.rubric_id && a.roster_id) && rubrics.length > 0, title: 'Configurar actividad y rúbrica', href: '#/actividades' },
    { done: activities.some((a) => a.last_run_id), title: 'Presionar «Iniciar evaluación»', href: '#/actividades' },
  ];

  el.innerHTML = `
    <div class="card mb">
      <div class="card-head"><h3>Flujo de trabajo</h3><span class="muted small">El sistema hace el resto automáticamente</span></div>
      <div class="steps">${steps.map((s, i) => `<a class="step ${s.done ? 'done' : ''}" href="${s.href}" style="text-decoration:none;color:inherit">
        <div class="num">${s.done ? '✓' : i + 1}</div><strong>${esc(s.title)}</strong></a>`).join('')}</div>
    </div>
    <div class="card mb">
      <div class="filters">
        <div class="field"><label>Nivel</label><select data-f="level">${options(filters.levels, '', { empty: 'Todos' })}</select></div>
        <div class="field"><label>Grado</label><select data-f="grade">${options(filters.grades, '', { empty: 'Todos' })}</select></div>
        <div class="field"><label>Sección</label><select data-f="section">${options(filters.sections, '', { empty: 'Todas' })}</select></div>
        <div class="field"><label>Materia</label><select data-f="subject">${options(filters.subjects, '', { empty: 'Todas' })}</select></div>
        <div class="field"><label>Actividad</label><select data-f="activity">${options(filters.activities.map((a) => ({ value: a.id, label: a.name })), '', { empty: 'Todas' })}</select></div>
      </div>
    </div>
    <div id="dash"></div>`;

  async function load() {
    const q = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
    const d = await api(`/dashboard?${q}`);
    charts.splice(0).forEach((c) => c.destroy());
    const t = d.totals;
    const avg = t.average === null ? '—' : t.average_scale ? `${fmtNum(t.average)}<span class="small muted">/${t.average_scale}</span>` : `${fmtNum(t.average_percent, 1)}%`;
    document.getElementById('dash').innerHTML = `
      <div class="grid kpis">
        ${kpi('Alumnos registrados', t.students, 'navy')}
        ${kpi('Documentos encontrados', t.documents)}
        ${kpi('Identificados', t.identified, '', t.documents ? `${Math.round((t.identified / t.documents) * 100)}% de los documentos` : '')}
        ${kpi('Tareas evaluadas', t.evaluated, 'green')}
        ${kpi('Tareas pendientes', t.pending, 'amber')}
        ${kpi('Con incidencias', t.incidents, 'amber')}
        ${kpi('Aprobados', t.approved, 'green')}
        ${kpi('No aprobados', t.failed, 'red')}
        ${kpi('Promedio general', avg, 'navy')}
        ${kpi('% de aprobación', t.pass_rate === null ? '—' : `${fmtNum(t.pass_rate, 1)}%`, 'green')}
      </div>
      ${t.evaluated === 0 ? '<div class="card mt"><div class="empty"><div class="big">📈</div>Los gráficos aparecerán cuando existan tareas evaluadas.</div></div>' : `
      <div class="grid two mt">
        <div class="card"><h3>Distribución de calificaciones</h3><div class="chart-box"><canvas id="chDist"></canvas></div></div>
        <div class="card"><h3>Aprobados frente a no aprobados</h3><div class="chart-box"><canvas id="chPass"></canvas></div></div>
        <div class="card"><h3>Rendimiento por criterio de evaluación</h3><div class="chart-box"><canvas id="chCrit"></canvas></div></div>
        <div class="card"><h3>Comparación de resultados por grado</h3><div class="chart-box"><canvas id="chGrade"></canvas></div></div>
      </div>`}
      <div class="card mt">
        <div class="card-head"><h3>Alumnos que necesitan reforzamiento</h3><span class="muted small">No aprobados o cerca de la nota mínima</span></div>
        ${d.reinforcement.length ? `<div class="table-wrap"><table><thead><tr><th>Estudiante</th><th>Grado / Sección</th><th>Actividad</th><th>Nota</th><th>Criterio más débil</th><th>Resultado</th></tr></thead><tbody>
          ${d.reinforcement.map((r) => `<tr><td><a href="#/resultados/${r.run_id}?item=${r.item_id}">${esc(r.name)}</a></td><td>${esc(r.grade || '—')} ${esc(r.section || '')}</td><td>${esc(r.activity)}</td>
          <td><strong>${fmtNum(r.score)}</strong>/${r.scale_max}</td><td>${esc(r.weakest || '—')}</td><td>${statusBadge(r.result)}</td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted">No hay estudiantes en riesgo con los filtros actuales.</p>'}
      </div>`;
    if (t.evaluated > 0 && window.Chart) drawCharts(d);
  }

  function drawCharts(d) {
    const Chart = window.Chart;
    Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
    Chart.defaults.color = '#475569';
    const base = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: C.grid } } } };
    charts.push(new Chart(document.getElementById('chDist'), {
      type: 'bar',
      data: { labels: d.charts.distribution.map((x) => x.label), datasets: [{ label: 'Estudiantes', data: d.charts.distribution.map((x) => x.count), backgroundColor: d.charts.distribution.map((_, i) => (i < 6 ? C.electric : C.green)), borderRadius: 6 }] },
      options: { ...base, scales: { ...base.scales, y: { ...base.scales.y, ticks: { precision: 0 } } } },
    }));
    charts.push(new Chart(document.getElementById('chPass'), {
      type: 'doughnut',
      data: { labels: ['Aprobados', 'No aprobados'], datasets: [{ data: [d.charts.passFail.approved, d.charts.passFail.failed], backgroundColor: [C.green, C.red], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom' } } },
    }));
    charts.push(new Chart(document.getElementById('chCrit'), {
      type: 'bar',
      data: { labels: d.charts.criteria.map((x) => x.name), datasets: [{ label: '% de logro', data: d.charts.criteria.map((x) => x.average), backgroundColor: C.navy, borderRadius: 6 }] },
      options: { ...base, indexAxis: 'y', scales: { x: { min: 0, max: 100, grid: { color: C.grid } }, y: { grid: { display: false } } } },
    }));
    charts.push(new Chart(document.getElementById('chGrade'), {
      type: 'bar',
      data: {
        labels: d.charts.byGrade.map((x) => x.grade),
        datasets: [
          { label: 'Promedio (%)', data: d.charts.byGrade.map((x) => x.average), backgroundColor: C.electric, borderRadius: 6 },
          { label: '% aprobación', data: d.charts.byGrade.map((x) => x.pass_rate), backgroundColor: C.green, borderRadius: 6 },
        ],
      },
      options: { ...base, plugins: { legend: { display: true, position: 'bottom' } }, scales: { ...base.scales, y: { min: 0, max: 100, grid: { color: C.grid } } } },
    }));
  }

  el.querySelectorAll('[data-f]').forEach((s) => s.addEventListener('change', () => { f[s.dataset.f] = s.value; load(); }));
  await load();
  const onPoll = (e) => { if (e.detail.runs.some((r) => r.status === 'running')) load(); };
  window.addEventListener('edugrade:poll', onPoll);
  return () => { window.removeEventListener('edugrade:poll', onPoll); charts.forEach((c) => c.destroy()); };
}

function kpi(label, value, cls = '', sub = '') {
  return `<div class="kpi ${cls}"><div class="label">${esc(label)}</div><div class="value">${value}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>`;
}
