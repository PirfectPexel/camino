// progress.js — gestión de etapas completadas en localStorage
export const KEY_PREFIX = 'camino:completed:';
const ALL_STAGE_IDS = [0, 1, 2, 3, 4, 5, 6];

export function markCompleted(stageId) {
  localStorage.setItem(KEY_PREFIX + stageId, '1');
}

export function unmarkCompleted(stageId) {
  localStorage.removeItem(KEY_PREFIX + stageId);
}

export function isCompleted(stageId) {
  return localStorage.getItem(KEY_PREFIX + stageId) === '1';
}

export function getCompletedStages() {
  return ALL_STAGE_IDS.filter(id => isCompleted(id));
}

// === Auto-bind del botón "Marcar completada" en páginas etapa-N ===
function initToggleButton() {
  const btn = document.getElementById('btn-toggle-completed');
  if (!btn) return;
  const stageId = parseInt(btn.dataset.stageId, 10);

  const refresh = () => {
    const done = isCompleted(stageId);
    btn.textContent = done ? '✓ Etapa completada' : 'Marcar como completada';
    btn.classList.toggle('completed', done);
  };

  btn.addEventListener('click', () => {
    if (isCompleted(stageId)) unmarkCompleted(stageId);
    else markCompleted(stageId);
    refresh();
  });

  refresh();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggleButton);
  } else {
    initToggleButton();
  }
}
