import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchFile, normalizeText, fileMatchesKeyword } from '../src/matching.js';

const S = [
  { id: 1, full_name: 'Ana López' },
  { id: 2, full_name: 'Carlos Pérez' },
  { id: 3, full_name: 'María González' },
  { id: 4, full_name: 'José Ramírez', code: 'A1234' },
  { id: 5, full_name: 'Ana María López Castillo' },
];

test('normaliza mayúsculas, tildes, guiones y camelCase', () => {
  assert.equal(normalizeText('Tarea_María-GONZÁLEZ.pdf'), 'tarea maria gonzalez');
  assert.equal(normalizeText('AnaLopez2.pdf'), 'ana lopez 2');
});

test('ejemplos del enunciado se confirman', () => {
  assert.deepEqual(['Ana_Lopez_Tarea1.pdf', 'Carlos_Perez.pdf', 'Tarea_Maria_Gonzalez.pdf', 'Jose_Ramirez_Actividad.pdf'].map((f) => {
    const r = matchFile(f, S);
    return [r.status, r.studentId];
  }), [['confirmed', 1], ['confirmed', 2], ['confirmed', 3], ['confirmed', 4]]);
});

test('código del estudiante confirma la identidad', () => {
  const r = matchFile('A1234-tarea.pdf', S);
  assert.equal(r.status, 'confirmed');
  assert.equal(r.studentId, 4);
});

test('las coincidencias dudosas nunca se confirman', () => {
  assert.equal(matchFile('carlos.pdf', S).status, 'probable');            // un solo nombre
  assert.equal(matchFile('Jose_Ramires.pdf', S).status, 'probable');      // variación ortográfica
  assert.equal(matchFile('AnaMariaLopez.pdf', S).status, 'probable');     // dos estudiantes compatibles
  assert.equal(matchFile('escaneo_001.pdf', S).status, 'none');
});

test('homónimos exactos quedan como probables', () => {
  const r = matchFile('Luis_Gomez.pdf', [{ id: 1, full_name: 'Luis Gómez' }, { id: 2, full_name: 'Luis Gómez' }]);
  assert.equal(r.status, 'probable');
});

test('filtro por palabra clave de actividad', () => {
  assert.ok(fileMatchesKeyword('Ana_Lopez_Tarea1.pdf', 'tarea1'));
  assert.ok(fileMatchesKeyword('Ana_Lopez_Tarea 1.pdf', 'Tarea1'));
  assert.ok(!fileMatchesKeyword('Ana_Lopez_Tarea2.pdf', 'tarea1'));
  assert.ok(fileMatchesKeyword('x.pdf', ''));
});
