// Tests para progress.js — gestión de etapas completadas en localStorage
// Run: node --test tests/progress.test.js

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock de localStorage para Node (sin jsdom)
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
};

const { markCompleted, unmarkCompleted, isCompleted, getCompletedStages, KEY_PREFIX } =
  await import('../js/progress.js');

beforeEach(() => store.clear());

test('isCompleted devuelve false por defecto', () => {
  assert.equal(isCompleted(3), false);
});

test('markCompleted persiste en localStorage', () => {
  markCompleted(3);
  assert.equal(isCompleted(3), true);
  assert.equal(localStorage.getItem(KEY_PREFIX + '3'), '1');
});

test('unmarkCompleted elimina del localStorage', () => {
  markCompleted(2);
  unmarkCompleted(2);
  assert.equal(isCompleted(2), false);
  assert.equal(localStorage.getItem(KEY_PREFIX + '2'), null);
});

test('getCompletedStages devuelve array ordenado de IDs marcados', () => {
  markCompleted(1);
  markCompleted(4);
  markCompleted(2);
  assert.deepEqual(getCompletedStages(), [1, 2, 4]);
});

test('getCompletedStages devuelve [] si no hay nada marcado', () => {
  assert.deepEqual(getCompletedStages(), []);
});

test('marcar etapa 0 también funciona', () => {
  markCompleted(0);
  assert.equal(isCompleted(0), true);
});
