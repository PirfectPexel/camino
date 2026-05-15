// Tests para app.js — getCurrentStage()
// Run: node --test tests/app.test.js

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCurrentStage } from '../js/app.js';

test('antes del 16 may → stageId null y daysToStart positivo', () => {
  const r = getCurrentStage(new Date('2026-05-10T12:00:00'));
  assert.equal(r.stageId, null);
  assert.equal(r.label, 'pre');
  assert.equal(r.daysToStart, 6);
  assert.equal(r.nextStageId, 0);
});

test('sábado 16 may → etapa 0 (Tui llegada)', () => {
  const r = getCurrentStage(new Date('2026-05-16T10:00:00'));
  assert.equal(r.stageId, 0);
  assert.equal(r.label, 'today');
  assert.equal(r.nextStageId, 1);
});

test('domingo 17 may → etapa 1 (Tui→Porriño)', () => {
  const r = getCurrentStage(new Date('2026-05-17T08:00:00'));
  assert.equal(r.stageId, 1);
  assert.equal(r.nextStageId, 2);
});

test('viernes 22 may → etapa 6 (Padrón→Santiago)', () => {
  const r = getCurrentStage(new Date('2026-05-22T15:00:00'));
  assert.equal(r.stageId, 6);
  assert.equal(r.nextStageId, null);
  assert.equal(r.isLast, true);
});

test('sábado 23 may → label "santiago" (día Santiago + vuelta)', () => {
  const r = getCurrentStage(new Date('2026-05-23T11:00:00'));
  assert.equal(r.label, 'santiago');
  assert.equal(r.stageId, 6);  // sigue mostrando etapa 6 con sub-rutas Santiago
});

test('después del 23 may → label "post" (Camino completado)', () => {
  const r = getCurrentStage(new Date('2026-05-25T12:00:00'));
  assert.equal(r.label, 'post');
  assert.equal(r.stageId, null);
});
