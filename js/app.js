// app.js — utilidades comunes del Camino PWA
// Acordeón + cálculo de etapa actual + nav-from-hash

// === CALENDARIO ===
const STAGES = [
  { id: 0, date: '2026-05-16', titulo: 'Llegada a Tui', km: null },
  { id: 1, date: '2026-05-17', titulo: 'Tui → O Porriño', km: 16 },
  { id: 2, date: '2026-05-18', titulo: 'O Porriño → Redondela', km: 16 },
  { id: 3, date: '2026-05-19', titulo: 'Redondela → Pontevedra', km: 20 },
  { id: 4, date: '2026-05-20', titulo: 'Pontevedra → Caldas', km: 22 },
  { id: 5, date: '2026-05-21', titulo: 'Caldas → Padrón', km: 19 },
  { id: 6, date: '2026-05-22', titulo: 'Padrón → Santiago', km: 25 }
];

// === getCurrentStage(now) ===
// Devuelve { stageId, label, daysToStart, nextStageId, isLast }
// label ∈ 'pre' | 'today' | 'santiago' | 'post'
export function getCurrentStage(now = new Date()) {
  // Use local date to avoid UTC shift issues across timezones
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = ymd(now);
  const startDate = STAGES[0].date;    // '2026-05-16'
  const santiagoDate = '2026-05-23';

  if (today < startDate) {
    const start = new Date(startDate + 'T00:00:00');
    const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return {
      stageId: null,
      label: 'pre',
      daysToStart: diff,
      nextStageId: 0,
      isLast: false
    };
  }

  if (today === santiagoDate) {
    return {
      stageId: 6,
      label: 'santiago',
      daysToStart: 0,
      nextStageId: null,
      isLast: true
    };
  }

  if (today > santiagoDate) {
    return {
      stageId: null,
      label: 'post',
      daysToStart: 0,
      nextStageId: null,
      isLast: false
    };
  }

  // Día caminado o llegada Tui
  const stage = STAGES.find(s => s.date === today);
  if (stage) {
    const isLast = stage.id === 6;
    return {
      stageId: stage.id,
      label: 'today',
      daysToStart: 0,
      nextStageId: isLast ? null : stage.id + 1,
      isLast
    };
  }

  // Caso teórico inalcanzable (fechas entre startDate y santiagoDate todas cubiertas)
  return { stageId: null, label: 'pre', daysToStart: 0, nextStageId: 0, isLast: false };
}

// === Acordeón ===
export function toggleAcc(headerEl) {
  const item = headerEl.closest('.acc-item');
  if (!item) return;
  item.classList.toggle('open');

  // Lazy-init mapa si la sección abierta lo contiene
  if (item.classList.contains('open')) {
    const mapaEl = item.querySelector('.mapa[data-etapa]');
    if (mapaEl && !mapaEl.dataset.initialized) {
      if (window.initMapa) window.initMapa(mapaEl);
      mapaEl.dataset.initialized = '1';
    }
  }
}

// === Auto-init ===
// 1. Listeners de acordeón en .acc-head
// 2. Si la URL trae #seccion, abrir esa sección y scroll
function init() {
  document.querySelectorAll('.acc-head').forEach(h => {
    h.addEventListener('click', () => toggleAcc(h));
  });

  // POI card expand/collapse
  document.querySelectorAll('.poi-head').forEach(h => {
    h.addEventListener('click', () => {
      const poi = h.closest('.poi');
      if (poi) poi.classList.toggle('open');
    });
  });

  const hash = location.hash.slice(1);
  if (hash) {
    const target = document.getElementById(hash);
    if (target && target.classList.contains('acc-item')) {
      target.classList.add('open');
      const mapaEl = target.querySelector('.mapa[data-etapa]');
      if (mapaEl && !mapaEl.dataset.initialized) {
        if (window.initMapa) window.initMapa(mapaEl);
        mapaEl.dataset.initialized = '1';
      }
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
