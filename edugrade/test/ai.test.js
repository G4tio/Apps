// Verifica la petición real que el motor envía a la API de Anthropic (contra un servidor
// local que imita la API con streaming SSE) y el procesamiento de la respuesta.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { makePdf } from './helpers.js';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'edugrade-ai-'));
process.env.ANTHROPIC_API_KEY = 'test-key';

let received = null;
let reply = null;
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    received = { url: req.url, headers: req.headers, body: JSON.parse(body) };
    res.writeHead(200, { 'content-type': 'text/event-stream' });
    const text = JSON.stringify(reply);
    const ev = (type, data) => res.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`);
    ev('message_start', { message: { id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [], stop_reason: null, usage: { input_tokens: 10, output_tokens: 0 } } });
    ev('content_block_start', { index: 0, content_block: { type: 'text', text: '' } });
    ev('content_block_delta', { index: 0, delta: { type: 'text_delta', text } });
    ev('content_block_stop', { index: 0 });
    ev('message_delta', { delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 50 } });
    ev('message_stop', {});
    res.end();
  });
});

let ai;
const activity = { level: 'Primaria', grade: 'Cuarto Primaria', subject: 'Matemáticas', name: 'Fracciones', instructions: 'Resolver 5 ejercicios', scale_max: 10, pass_mark: 6 };
const rubric = { name: 'R', criteria: [
  { id: 'a', name: 'Operaciones', weight: 70, max_score: 4, levels: [{ name: 'Excelente', score: 4 }] },
  { id: 'b', name: 'Orden', weight: 30, max_score: 4, levels: [] },
] };

before(async () => {
  await new Promise((r) => server.listen(0, r));
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${server.address().port}`;
  ai = await import('../src/ai-evaluator.js');
});
after(() => server.close());

test('envía el PDF como documento con salida estructurada y calcula la nota', async () => {
  reply = {
    document_status: 'ok', document_status_detail: '', detected_student_name: 'Ana López', identity_check: 'coincide',
    criteria: [
      { criterion_id: 'a', level_name: 'Bueno', score: 3, evidence: ['Ej. 1 correcto'], justification: '4 de 5 correctos' },
      { criterion_id: 'b', level_name: 'Excelente', score: 9, evidence: [], justification: 'Ordenado' },
    ],
    strengths: ['Procedimiento claro'], difficulties: ['Simplificación'], recommendations: ['Practicar'], observation: 'Buen trabajo.',
  };
  const out = await ai.evaluateDocument({ pdfBuffer: makePdf('hola'), activity, rubric, studentName: 'Ana López', pdfInfo: { pages: 1 } });
  const b = received.body;
  assert.equal(b.model, 'claude-opus-5-5');
  assert.equal(b.stream, true);
  assert.equal(b.messages[0].content[0].type, 'document');
  assert.equal(b.messages[0].content[0].source.media_type, 'application/pdf');
  assert.equal(b.output_config.format.type, 'json_schema');
  assert.ok(b.system[0].text.includes('Operaciones'));
  assert.ok(b.system[0].text.includes('Primaria'));
  assert.ok(!('temperature' in b));
  assert.equal(out.criteria[1].score, 4, 'la puntuación se limita al máximo del criterio');
  const g = ai.computeGrade(out.criteria, { scaleMax: 10, passMark: 6 });
  assert.deepEqual(g, { percent: 82.5, score: 8.25, result: 'APROBADO' });
});

test('documento ilegible o de otra persona genera incidencia sin nota', async () => {
  reply = { document_status: 'ilegible', document_status_detail: 'Fotografía borrosa', detected_student_name: '', identity_check: 'no_visible', criteria: [], strengths: [], difficulties: [], recommendations: [], observation: '' };
  await assert.rejects(ai.evaluateDocument({ pdfBuffer: makePdf('x'), activity, rubric, studentName: 'Ana', pdfInfo: { pages: 1 } }), (e) => e.incidentType === 'pdf_ilegible');
  reply = { ...reply, document_status: 'ok', identity_check: 'no_coincide', detected_student_name: 'Carlos Pérez' };
  await assert.rejects(ai.evaluateDocument({ pdfBuffer: makePdf('x'), activity, rubric, studentName: 'Ana', pdfInfo: { pages: 1 } }), (e) => e.incidentType === 'coincidencia_dudosa');
});

test('criterios faltantes provocan reintento', async () => {
  reply = { document_status: 'ok', document_status_detail: '', detected_student_name: '', identity_check: 'no_visible', criteria: [{ criterion_id: 'a', level_name: 'x', score: 1, evidence: [], justification: '' }], strengths: [], difficulties: [], recommendations: [], observation: '' };
  await assert.rejects(ai.evaluateDocument({ pdfBuffer: makePdf('x'), activity, rubric, studentName: 'Ana', pdfInfo: { pages: 1 } }), ai.TransientAIError);
});
