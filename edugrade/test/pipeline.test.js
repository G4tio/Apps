// Prueba de integración del flujo completo: importar Excel → documentos → actividad →
// evaluación en cola → incidencias → exportación. La API de IA y la descarga de Drive se
// sustituyen por dobles de prueba (no hay credenciales reales en CI).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { makePdf } from './helpers.js';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'edugrade-test-'));
process.env.DATA_DIR = tmp;
process.env.EVAL_CONCURRENCY = '3';

const { createApp } = await import('../server.js');
const { db } = await import('../src/db.js');
const engine = await import('../src/engine.js');
const { seedTemplates } = await import('../src/rubrics.js');
const { TransientAIError } = await import('../src/ai-evaluator.js');

let server;
let base;
let cookie = '';
const calls = [];
const pdfs = {
  f_ana: makePdf('Tarea de Ana Lopez: 3/4 = 6/8'),
  f_carlos: makePdf('Carlos Perez fracciones'),
  f_maria: makePdf('Maria Gonzalez trabajo'),
  f_jose: makePdf('Jose Ramirez'),
  f_vacio: makePdf(''),
  f_danado: Buffer.from('esto no es un pdf'),
  f_dudoso: makePdf('Pedro'),
};
let transientOnce = true;

async function call(method, url, body, form) {
  const res = await fetch(base + url, {
    method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), cookie, origin: base },
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  const sc = res.headers.get('set-cookie');
  if (sc && sc.includes('edugrade_session=')) cookie = sc.split(';')[0];
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('json') ? await res.json() : Buffer.from(await res.arrayBuffer());
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status} ${JSON.stringify(data)}`);
  return data;
}

before(async () => {
  seedTemplates();
  engine._setTestHooks({
    download: async (id) => pdfs[id],
    evaluate: async ({ rubric, studentName, pdfInfo }) => {
      calls.push(studentName);
      if (studentName === 'Carlos Pérez' && transientOnce) { transientOnce = false; throw new TransientAIError('529 overloaded'); }
      assert.ok(pdfInfo.pages >= 1);
      const ratio = studentName === 'María González' ? 0.25 : 0.9;
      return {
        criteria: rubric.criteria.map((c) => ({ criterion_id: c.id, name: c.name, weight: c.weight, max_score: c.max_score, score: c.max_score * ratio, level_name: 'Bueno', evidence: ['Ejercicio 1'], justification: 'Correcto' })),
        strengths: ['Orden'], difficulties: [], recommendations: ['Practicar'], observation: `Buen trabajo, ${studentName}.`, meta: { model: 'test' },
      };
    },
  });
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  engine.stopEngine();
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('flujo completo de evaluación automática', async () => {
  // 1. Cuenta inicial
  await call('POST', '/api/auth/setup', { username: 'docente', password: 'secreto123' });
  assert.equal((await call('GET', '/api/me')).username, 'docente');

  // 2. Importar Excel con fila de título, encabezados y un duplicado
  const ws = XLSX.utils.aoa_to_sheet([
    ['Colegio Demo — Listado 2026'],
    ['No.', 'Nombre completo', 'Código', 'Grado', 'Sección'],
    [1, 'Ana López', 'E001', 'Cuarto Primaria', 'A'],
    [2, 'Carlos Pérez', 'E002', 'Cuarto Primaria', 'A'],
    [3, 'María González', 'E003', 'Cuarto Primaria', 'A'],
    [4, 'José Ramírez', 'E004', 'Cuarto Primaria', 'A'],
    [5, 'Lucía Méndez', 'E005', 'Cuarto Primaria', 'A'],
    [6, 'Pedro Castillo', 'E006', 'Cuarto Primaria', 'A'],
    [7, 'Pedro Castañeda', 'E007', 'Cuarto Primaria', 'A'],
    [8, 'Andrés Vásquez', 'E008', 'Cuarto Primaria', 'B'],
    [9, 'Ana López', 'E009', 'Cuarto Primaria', 'A'],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Alumnos');
  const xbuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const form = () => { const f = new FormData(); f.append('file', new Blob([xbuf]), 'cuarto.xlsx'); return f; };
  const prev = await call('POST', '/api/rosters/preview', null, form());
  assert.equal(prev.mapping.headerRow, 1);
  assert.equal(prev.headers[prev.mapping.name], 'Nombre completo');
  assert.equal(prev.headers[prev.mapping.code], 'Código');
  assert.equal(prev.students.length, 9);
  assert.equal(prev.students.filter((s) => s.duplicate).length, 2);
  // Quitar el duplicado y conservar el orden
  const f2 = form(); f2.append('sheet', prev.sheet); f2.append('mapping', JSON.stringify(prev.mapping)); f2.append('name', 'Cuarto A');
  const roster = await call('POST', '/api/rosters', null, f2);
  const rdet = await call('GET', `/api/rosters/${roster.id}`);
  assert.deepEqual(rdet.students.map((s) => s.order_idx), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  await call('DELETE', `/api/students/${rdet.students[8].id}`);
  const original = await call('GET', `/api/rosters/${roster.id}/original`);
  assert.ok(original.equals(xbuf), 'el Excel original se conserva intacto');

  // 3. Documentos en la carpeta (simulación de la sincronización de Drive)
  const ins = db.prepare("INSERT INTO drive_files(id, folder_id, name, md5, modified_time, sync_state) VALUES(?, 'fold', ?, ?, '2026-11-01', 'new')");
  ins.run('f_ana', 'Ana_Lopez_Tarea1.pdf', 'm1');
  ins.run('f_carlos', 'Carlos_Perez_tarea1.pdf', 'm2');
  ins.run('f_maria', 'Tarea1_Maria_Gonzalez.pdf', 'm3');
  ins.run('f_jose', 'E004_tarea1.pdf', 'm4');
  ins.run('f_vacio', 'Lucia_Mendez_Tarea1.pdf', 'm5');
  ins.run('f_danado', 'Pedro_Castaneda_tarea1.pdf', 'm6');
  ins.run('f_andres', 'Andres_Vasquez_tarea1.pdf', 'm9');
  ins.run('f_dudoso', 'Pedro_Tarea1.pdf', 'm7');
  ins.run('f_otra', 'Ana_Lopez_Tarea2.pdf', 'm8');

  // 4. Actividad (solo sección A, solo archivos «tarea1»)
  const rubrics = await call('GET', '/api/rubrics');
  const rub = rubrics.find((r) => r.level === 'Primaria');
  const act = await call('POST', '/api/activities', {
    name: 'Tarea 1', level: 'Primaria', grade: 'Cuarto Primaria', section: 'A', subject: 'Matemáticas',
    scale_max: 100, pass_mark: 60, rubric_id: rub.id, roster_id: roster.id, file_keyword: 'tarea1',
  });
  await assert.rejects(call('POST', '/api/activities', { name: 'x', level: 'Primaria', grade: 'Primero Básico', subject: 'M' }), /no corresponde/);

  // 5. Ejecutar
  const run = await call('POST', '/api/runs', { activity_id: act.id });
  await engine.drain();
  const r1 = await call('GET', `/api/runs/${run.id}`);
  const by = Object.fromEntries(r1.items.map((i) => [i.name, i]));
  assert.equal(r1.items.length, 7, 'Andrés (sección B) y el duplicado quedan fuera');
  assert.equal(by['Ana López'].display_status, 'APROBADO');
  assert.equal(by['Ana López'].score, 90);
  assert.equal(by['Carlos Pérez'].display_status, 'APROBADO', 'reintento automático tras fallo temporal');
  assert.equal(by['María González'].display_status, 'NO APROBADO');
  assert.equal(by['María González'].score, 25);
  assert.equal(by['José Ramírez'].display_status, 'APROBADO', 'identificado por código');
  assert.equal(by['Lucía Méndez'].display_status, 'REVISIÓN NECESARIA', 'PDF vacío');
  assert.equal(by['Pedro Castillo'].display_status, 'SIN DOCUMENTO');
  assert.equal(by['Pedro Castañeda'].display_status, 'REVISIÓN NECESARIA', 'archivo dañado');
  assert.equal(r1.run.status, 'completed');

  const incidents = await call('GET', `/api/incidents?run_id=${run.id}`);
  const types = incidents.map((i) => i.type).sort();
  assert.deepEqual(types, ['archivo_danado', 'coincidencia_dudosa', 'documento_vacio'], 'el PDF de la sección B no genera incidencia');
  assert.ok(!calls.includes('Lucía Méndez'), 'no se envía a la IA un documento vacío');

  // 6. Resolver la incidencia dudosa asignando el documento a Pedro Castillo
  const dudosa = incidents.find((i) => i.type === 'coincidencia_dudosa');
  const pedro = rdet.students.find((s) => s.full_name === 'Pedro Castillo');
  await call('POST', `/api/incidents/${dudosa.id}/assign`, { student_id: pedro.id });
  await engine.drain();
  const r2 = await call('GET', `/api/runs/${run.id}`);
  assert.equal(r2.items.find((i) => i.name === 'Pedro Castillo').display_status, 'APROBADO');

  // 7. Nota manual con registro de cambios
  await call('POST', `/api/items/${by['María González'].id}/grade`, { score: 61, reason: 'Revisión docente' });
  const changes = await call('GET', `/api/items/${by['María González'].id}/changes`);
  assert.equal(changes[0].change_type, 'manual');
  assert.equal(changes[0].old_score, 25);

  // 8. Segunda ejecución: los documentos sin cambios no se reevalúan
  const before = calls.length;
  const run2 = await call('POST', '/api/runs', { activity_id: act.id });
  await engine.drain();
  assert.equal(calls.length, before, 'sin llamadas nuevas a la IA');
  const r3 = await call('GET', `/api/runs/${run2.id}`);
  assert.ok(r3.items.find((i) => i.name === 'Ana López').reused_from);
  assert.equal(r3.items.find((i) => i.name === 'Pedro Castillo').display_status, 'APROBADO', 'asignación manual recordada');

  // 9. Exportación Excel
  const xlsx = await call('GET', `/api/runs/${run.id}/export`);
  const out = new ExcelJS.Workbook();
  await out.xlsx.load(xlsx);
  assert.deepEqual(out.worksheets.map((w) => w.name), ['Resultados generales', 'Desglose de rúbrica', 'Retroalimentación', 'Estadísticas', 'Incidencias']);
  const s1 = out.getWorksheet('Resultados generales');
  assert.equal(s1.getCell('A1').value, 'Colegio Demo — Listado 2026');
  assert.deepEqual(s1.getRow(2).values.slice(1), ['No.', 'Nombre completo', 'Código', 'Grado', 'Sección', 'Nota final', 'Resultado', 'Estado de evaluación', 'Observaciones']);
  assert.equal(s1.getCell('B3').value, 'Ana López');
  assert.equal(s1.getCell('F3').value, 90);
  assert.equal(s1.getCell('G3').value, 'APROBADO');
  assert.equal(s1.getCell('F5').value, 61, 'nota modificada manualmente');
  assert.equal(s1.getCell('H10').value, 'NO INCLUIDO EN ESTA ACTIVIDAD');
  assert.equal(s1.getCell('H11').value, 'EXCLUIDO DEL LISTADO');

  // 10. Dashboard e historial
  const dash = await call('GET', `/api/dashboard?activity=${act.id}`);
  assert.equal(dash.totals.evaluated, 5);
  assert.equal(dash.totals.approved, 5);
  const hist = await call('GET', '/api/runs');
  assert.equal(hist.length, 2);
});

test('sin rúbrica se registra la incidencia y no se califica', async () => {
  const roster = db.prepare('SELECT id FROM rosters LIMIT 1').get();
  const act = await call('POST', '/api/activities', { name: 'Sin rúbrica', level: 'Primaria', subject: 'Lenguaje', roster_id: roster.id });
  const run = await call('POST', '/api/runs', { activity_id: act.id });
  const r = await call('GET', `/api/runs/${run.id}`);
  assert.equal(r.run.status, 'failed');
  assert.ok(r.items.every((i) => i.display_status === 'REVISIÓN NECESARIA' && i.score === null));
  const inc = await call('GET', `/api/incidents?run_id=${run.id}`);
  assert.equal(inc[0].type, 'rubrica_no_configurada');
});

test('la suma de ponderaciones debe ser 100 %', async () => {
  await assert.rejects(call('POST', '/api/rubrics', { name: 'Mala', criteria: [{ name: 'A', weight: 50, max_score: 4 }, { name: 'B', weight: 40, max_score: 4 }] }), /exactamente 100/);
  const ok = await call('POST', '/api/rubrics', { name: 'Buena', criteria: [{ name: 'A', weight: 60, max_score: 4 }, { name: 'B', weight: 40, max_score: 4 }] });
  assert.ok(ok.id);
});

test('rechaza peticiones sin sesión y de otro origen', async () => {
  const r = await fetch(`${base}/api/rubrics`);
  assert.equal(r.status, 401);
  const r2 = await fetch(`${base}/api/rubrics`, { method: 'POST', headers: { cookie, origin: 'https://evil.example', 'content-type': 'application/json' }, body: '{}' });
  assert.equal(r2.status, 403);
});

test('el archivo HTML descargado funciona con token y CORS (sin cookies)', async () => {
  const pre = await fetch(`${base}/api/runs`, { method: 'OPTIONS', headers: { origin: 'null', 'access-control-request-method': 'POST', 'access-control-request-headers': 'authorization,content-type' } });
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get('access-control-allow-origin'), '*');
  const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { origin: 'null', 'content-type': 'application/json' }, body: JSON.stringify({ username: 'docente', password: 'secreto123' }) });
  const { token } = await login.json();
  assert.ok(token);
  const h = { origin: 'null', authorization: `Bearer ${token}`, 'content-type': 'application/json' };
  const me = await fetch(`${base}/api/me`, { headers: h });
  assert.equal((await me.json()).username, 'docente');
  const created = await fetch(`${base}/api/rubrics`, { method: 'POST', headers: h, body: JSON.stringify({ name: 'Token', criteria: [{ name: 'A', weight: 100, max_score: 4 }] }) });
  assert.equal(created.status, 200);
  // Sin token, otro origen no puede modificar datos aunque envíe la cookie de sesión.
  const csrf = await fetch(`${base}/api/rubrics`, { method: 'POST', headers: { origin: 'null', cookie, 'content-type': 'application/json' }, body: '{}' });
  assert.equal(csrf.status, 403);
  // Ticket de un solo uso para conectar Google desde el archivo
  const t = await (await fetch(`${base}/api/drive/oauth/ticket`, { method: 'POST', headers: h })).json();
  assert.match(t.url, /start-ticket\?ticket=/);
});
