# Camino Portugués PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una PWA estática (vanilla HTML/CSS/JS) que sirva como guía completa offline del Camino Portugués (Tui → Santiago, 16-23 mayo 2026), desplegada en GitHub Pages.

**Architecture:** Sitio estático puro en `/Users/cx02795/Downloads/camino/`, sin build step, sin frameworks. JS mínimo para acordeón + localStorage + Leaflet. Service Worker con estrategia cache-first para offline total. Tiles OSM precargados al repo. Una página HTML por etapa (etapa-0.html a etapa-6.html), home Today-first dinámica por fecha.

**Tech Stack:** Vanilla HTML/CSS/JS, Leaflet 1.9 (vendored), tiles OSM precargados, Service Worker vanilla, GitHub Pages para hosting. Tests unitarios con `node --test` (built-in, sin dependencias).

**Spec base:** `docs/superpowers/specs/2026-05-15-camino-pwa-design.md`

**Working directory:** `/Users/cx02795/Downloads/camino/`

**GitHub repo:** https://github.com/PirfectPexel/camino

---

## File Structure (final)

```
camino/                                    ← root del repo
├── .git/                                  ← creado en Task 1
├── .gitignore                             ← creado en Task 1
├── .nojekyll                              ← creado en Task 1 (evita Jekyll en GH Pages)
├── README.md                              ← creado en Task 1
├── index.html                             ← Task 9 (home Today-first)
├── etapas.html                            ← Task 10 (timeline)
├── etapa-0.html                           ← Task 8 (Tui llegada, sin mapa)
├── etapa-1.html                           ← Task 8 (Tui→Porriño, con mapa)
├── etapa-2.html                           ← Task 8 (Porriño→Redondela, con mapa)
├── etapa-3.html                           ← Task 8 (Redondela→Pontevedra, con mapa)
├── etapa-4.html                           ← Task 8 (Pontevedra→Caldas, con mapa)
├── etapa-5.html                           ← Task 8 (Caldas→Padrón, con mapa)
├── etapa-6.html                           ← Task 8 (Padrón→Santiago, con mapa + sub-rutas)
├── equipaje.html                          ← Task 11
├── antes.html                             ← Task 11
├── bastones.html                          ← Task 11
├── 404.html                               ← Task 11
├── manifest.json                          ← Task 14
├── sw.js                                  ← Task 14
├── css/
│   └── style.css                          ← Task 4
├── js/
│   ├── app.js                             ← Task 5 (acordeón + getCurrentStage + nav)
│   ├── progress.js                        ← Task 6 (localStorage)
│   └── map.js                             ← Task 13 (Leaflet bootstrap)
├── leaflet/
│   ├── leaflet.js                         ← Task 12 (vendored 1.9.x)
│   ├── leaflet.css                        ← Task 12
│   └── images/                            ← Task 12 (markers de leaflet)
├── tiles/                                 ← Task 13 (OSM tiles precargados ~30MB)
│   └── {z}/{x}/{y}.png
├── rutas/                                 ← Task 12
│   ├── etapa-1.geojson
│   ├── etapa-2.geojson
│   ├── etapa-3.geojson
│   ├── etapa-4.geojson
│   ├── etapa-5.geojson
│   └── etapa-6.geojson
├── icons/                                 ← Task 14
│   ├── icon-192.png
│   └── icon-512.png
├── content/                               ← Task 2 (.md fuente, no servidos)
│   ├── etapas/
│   │   ├── 01_tui.md
│   │   ├── 02_tui_porrino.md
│   │   ├── 03_porrino_redondela.md
│   │   ├── 04_redondela_pontevedra.md
│   │   ├── 05_pontevedra_caldas.md
│   │   ├── 06_caldas_padron.md
│   │   └── 07_padron_santiago.md
│   ├── equipaje.md
│   ├── antes.md
│   └── bastones.md
├── scripts/                               ← Task 13 (one-shot scripts)
│   └── download-tiles.sh
├── tests/                                 ← Tasks 5, 6
│   ├── progress.test.js
│   └── app.test.js
└── docs/superpowers/                      ← spec + plan (existente)
    ├── specs/2026-05-15-camino-pwa-design.md
    └── plans/2026-05-15-camino-pwa.md
```

---

## Task 1: Setup repo, gitignore y archivos base

**Files:**
- Create: `/Users/cx02795/Downloads/camino/.gitignore`
- Create: `/Users/cx02795/Downloads/camino/.nojekyll`
- Create: `/Users/cx02795/Downloads/camino/README.md`

- [ ] **Step 1: Verificar que el directorio aún NO es repo git**

```bash
cd /Users/cx02795/Downloads/camino
ls -la .git 2>&1 | head -3
```

Expected: `ls: .git: No such file or directory` (si ya existe `.git/`, saltar `git init`).

- [ ] **Step 2: Inicializar git y configurar default branch a `main`**

```bash
cd /Users/cx02795/Downloads/camino
git init -b main
```

Expected: `Initialized empty Git repository in /Users/cx02795/Downloads/camino/.git/`

- [ ] **Step 3: Añadir remote a GitHub**

```bash
cd /Users/cx02795/Downloads/camino
git remote add origin https://github.com/PirfectPexel/camino.git
git remote -v
```

Expected output incluye:
```
origin	https://github.com/PirfectPexel/camino.git (fetch)
origin	https://github.com/PirfectPexel/camino.git (push)
```

- [ ] **Step 4: Crear `.gitignore`**

Write to `/Users/cx02795/Downloads/camino/.gitignore`:

```gitignore
# macOS
.DS_Store
.AppleDouble
.LSOverride

# Visual companion artifacts (brainstorming)
.superpowers/

# PDFs personales (billetes de tren - fuera de la web por decisión de spec)
*.pdf

# Editor
.vscode/
.idea/
*.swp

# Node (por si en algún momento se añade)
node_modules/
npm-debug.log*

# Tiles temporales durante descarga
tiles/.tmp/
```

- [ ] **Step 5: Crear `.nojekyll`**

```bash
touch /Users/cx02795/Downloads/camino/.nojekyll
```

(Archivo vacío. Indica a GitHub Pages que no procese con Jekyll.)

- [ ] **Step 6: Crear `README.md`**

Write to `/Users/cx02795/Downloads/camino/README.md`:

```markdown
# Camino Portugués PWA

Guía personal del Camino de Santiago Portugués (Tui → Santiago, 16-23 mayo 2026).
Vanilla PWA estática, instalable en móvil, funciona offline.

## URL desplegada

https://pirfectpexel.github.io/camino/

## Estructura

- `index.html` — home Today-first
- `etapa-N.html` — detalle por etapa (acordeón)
- `etapas.html` — timeline
- `equipaje.html`, `antes.html`, `bastones.html` — referencia
- `content/` — markdown fuente (no servido)
- `tiles/` — OpenStreetMap tiles precargados para mapa offline
- `rutas/` — GeoJSON con el trayecto de cada etapa caminada

## Diseño y plan

Ver `docs/superpowers/specs/` y `docs/superpowers/plans/`.

## Despliegue

Push a `main` → GitHub Pages despliega automáticamente.

Tras editar contenido, recordar bumpear la constante `CACHE` en `sw.js` para que el
service worker invalide la caché en el siguiente acceso con cobertura.
```

- [ ] **Step 7: Crear estructura de carpetas vacías**

```bash
cd /Users/cx02795/Downloads/camino
mkdir -p css js leaflet/images tiles rutas icons content/etapas scripts tests
```

- [ ] **Step 8: Verificar estructura creada**

```bash
cd /Users/cx02795/Downloads/camino
ls -la
ls -la content/
```

Expected: ver `.gitignore`, `.nojekyll`, `README.md`, y carpetas `css/`, `js/`, `leaflet/`, `tiles/`, `rutas/`, `icons/`, `content/`, `scripts/`, `tests/`.

- [ ] **Step 9: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add .gitignore .nojekyll README.md
git commit -m "chore: init repo with gitignore, nojekyll, README"
```

---

## Task 2: Migrar contenido fuente a `/content/`

**Files:**
- Move: `etapas/0[1-7]_*.md` → `content/etapas/`
- Move: `bastones.md` → `content/bastones.md`
- Create: `content/equipaje.md` (extraído de `guia_camino_portugues.md`)
- Create: `content/antes.md` (extraído de `etapas/00_indice.md`, sin vinos)

- [ ] **Step 1: Mover etapas markdown**

```bash
cd /Users/cx02795/Downloads/camino
mv etapas/01_tui.md content/etapas/
mv etapas/02_tui_porrino.md content/etapas/
mv etapas/03_porrino_redondela.md content/etapas/
mv etapas/04_redondela_pontevedra.md content/etapas/
mv etapas/05_pontevedra_caldas.md content/etapas/
mv etapas/06_caldas_padron.md content/etapas/
mv etapas/07_padron_santiago.md content/etapas/
mv etapas/00_indice.md content/etapas/_indice.md
rmdir etapas
```

- [ ] **Step 2: Mover bastones**

```bash
cd /Users/cx02795/Downloads/camino
mv bastones.md content/bastones.md
```

- [ ] **Step 3: Crear `content/equipaje.md` extrayendo solo la sección "Equipo y mochila" de `guia_camino_portugues.md`**

Lee `/Users/cx02795/Downloads/camino/guia_camino_portugues.md` y extrae únicamente las secciones bajo `## Equipo y mochila` (subsecciones: Grandes / Ropa para caminar / Ropa para las tardes / Para dormir / Higiene / Botiquín / Hidratación / Electrónica / Documentación / Varios / Neceser de baño).

Write to `/Users/cx02795/Downloads/camino/content/equipaje.md` con esa estructura, manteniendo los `[x]` y `[ ]` originales (se renderizarán como check verde / pendiente en HTML).

- [ ] **Step 4: Crear `content/antes.md` desde `_indice.md` SIN sección de vinos**

Lee `/Users/cx02795/Downloads/camino/content/etapas/_indice.md` y extrae las secciones que no son etapa-específicas:
- Horarios gallegos (comida/cena)
- Menú del peregrino
- ❌ NO incluir "Vinos" (decisión spec: sin alcohol)
- Teléfonos importantes
- Agua del grifo
- Propinas
- AVISO ESTAFAS
- Credencial del peregrino
- Farmacias
- Supermercados (Gadis/Froiz, ojo domingos)
- App recomendada
- Vocabulario gallego básico

Write a `/Users/cx02795/Downloads/camino/content/antes.md`. Mantener el "10 momentos imprescindibles" en `_indice.md` para que el home pueda referenciarlo si quiere.

- [ ] **Step 5: Mover el calendario de viaje y supermercados-por-etapa a `content/_calendario.md` para futuro uso**

```bash
cd /Users/cx02795/Downloads/camino
# Editar manualmente: del guia_camino_portugues.md, mover las secciones
# "Calendario", "Supermercados por etapa", "Pendiente por cerrar"
# a un archivo nuevo /content/_calendario.md
```

Lee `/Users/cx02795/Downloads/camino/guia_camino_portugues.md`, copia las secciones `## Calendario`, `## Comida durante el camino`, `## Supermercados por etapa`, `## Pendiente por cerrar` a `/Users/cx02795/Downloads/camino/content/_calendario.md`. Luego elimina `guia_camino_portugues.md` (ya queda repartido entre `equipaje.md`, `antes.md` y `_calendario.md`).

```bash
rm /Users/cx02795/Downloads/camino/guia_camino_portugues.md
```

- [ ] **Step 6: Verificar inventario final de `/content/`**

```bash
cd /Users/cx02795/Downloads/camino
find content -type f | sort
```

Expected:
```
content/_calendario.md
content/antes.md
content/bastones.md
content/equipaje.md
content/etapas/01_tui.md
content/etapas/02_tui_porrino.md
content/etapas/03_porrino_redondela.md
content/etapas/04_redondela_pontevedra.md
content/etapas/05_pontevedra_caldas.md
content/etapas/06_caldas_padron.md
content/etapas/07_padron_santiago.md
content/etapas/_indice.md
```

- [ ] **Step 7: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add content/
git rm guia_camino_portugues.md  # ya borrado físicamente
git commit -m "chore: migrate source markdown to /content/, normalize structure"
```

---

## Task 3: Plantilla HTML compartida + CSS reset

**Files:**
- Create: `/Users/cx02795/Downloads/camino/css/style.css`

- [ ] **Step 1: Decidir plantilla común para todas las páginas HTML**

Todas las páginas seguirán esta plantilla mental (no es un fichero — se replica a mano):

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#2c5f3d">
  <title>[Título · Camino Portugués]</title>
  <link rel="manifest" href="/camino/manifest.json">
  <link rel="stylesheet" href="/camino/css/style.css">
  <link rel="icon" type="image/png" sizes="192x192" href="/camino/icons/icon-192.png">
</head>
<body>
  <!-- contenido específico de la página -->
  <script src="/camino/js/app.js" defer></script>
  <script src="/camino/js/progress.js" defer></script>
  <!-- páginas de etapa con caminata: + map.js + leaflet -->
  <script>
    // Registro del Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('/camino/sw.js'));
    }
  </script>
</body>
</html>
```

**Nota:** todas las rutas son absolutas con prefijo `/camino/` porque GitHub Pages
servirá desde `https://pirfectpexel.github.io/camino/`.

- [ ] **Step 2: Crear `css/style.css` completo**

Write to `/Users/cx02795/Downloads/camino/css/style.css`:

```css
/* ========================================================================
   CAMINO PORTUGUÉS PWA — STYLE
   Mood: Naturaleza gallega (verde + dorado peregrino)
   ======================================================================== */

/* === RESET === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  color: #1d2e1f;
  background: #f5f7f4;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  padding-bottom: env(safe-area-inset-bottom);
}
img { max-width: 100%; display: block; }
button { font: inherit; cursor: pointer; border: none; background: none; color: inherit; }
a { color: #2c5f3d; text-decoration: none; }
ul, ol { padding-left: 20px; }

/* === PALETA (variables CSS) === */
:root {
  --verde-oscuro: #2c5f3d;
  --verde-medio: #5a8d6e;
  --verde-claro: #f0f4ed;
  --dorado: #c89a3c;
  --dorado-claro: #e8c98a;
  --crema: #f5f7f4;
  --texto: #1d2e1f;
  --texto-suave: #5a6e5c;
  --texto-disabled: #999;
  --borde: #e0e0e0;
  --blanco: #ffffff;
}

/* === TOPBAR === */
.topbar {
  background: var(--verde-oscuro);
  color: white;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 100;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.topbar .back {
  font-size: 20px;
  line-height: 1;
  padding: 4px 8px;
  margin-left: -8px;
}
.topbar .title {
  font-size: 15px;
  font-weight: 600;
  flex: 1;
}

/* === HERO CARD (etapa de hoy) === */
.hero {
  background: linear-gradient(135deg, var(--verde-medio), var(--verde-oscuro));
  color: white;
  padding: 18px 16px;
}
.hero .badge {
  display: inline-block;
  background: var(--dorado);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  letter-spacing: 0.5px;
}
.hero h1 {
  font-size: 22px;
  margin: 8px 0 4px;
  font-weight: 700;
  line-height: 1.2;
}
.hero .meta {
  font-size: 13px;
  opacity: 0.9;
}

/* === QUICK ACTIONS (grid 2x2) === */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 12px 16px 16px;
  background: linear-gradient(135deg, var(--verde-medio), var(--verde-oscuro));
}
.quick-action {
  background: rgba(255,255,255,0.15);
  color: white;
  padding: 14px 8px;
  border-radius: 10px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.15s;
}
.quick-action:active { background: rgba(255,255,255,0.3); }
.quick-action .ic { font-size: 18px; display: block; margin-bottom: 4px; }

/* === CARD genérica === */
.card {
  background: var(--blanco);
  border-radius: 12px;
  margin: 12px 16px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* === SECCIÓN "PRÓXIMA" === */
.next-section {
  padding: 16px;
}
.section-label {
  font-size: 11px;
  color: var(--texto-suave);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  margin-bottom: 8px;
}

/* === ACORDEÓN === */
.accordion {
  background: white;
  margin-top: 12px;
}
.acc-item {
  border-bottom: 1px solid var(--borde);
}
.acc-head {
  width: 100%;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 600;
  color: var(--verde-oscuro);
  text-align: left;
  background: white;
}
.acc-head .ic { margin-right: 8px; font-size: 18px; }
.acc-head .chev {
  color: var(--texto-disabled);
  font-size: 18px;
  transition: transform 0.2s;
}
.acc-item.open .acc-head .chev {
  transform: rotate(90deg);
  color: var(--dorado);
}
.acc-body {
  padding: 0 16px 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--texto);
  display: none;
}
.acc-item.open .acc-body { display: block; }
.acc-body p { margin-bottom: 12px; }
.acc-body ul, .acc-body ol { margin-bottom: 12px; }
.acc-body li { margin-bottom: 4px; }
.acc-body strong { color: var(--verde-oscuro); }
.acc-body h4 {
  font-size: 14px;
  color: var(--verde-oscuro);
  margin-top: 12px;
  margin-bottom: 6px;
}
.acc-body table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 8px 0;
}
.acc-body th, .acc-body td {
  padding: 8px 6px;
  border-bottom: 1px solid var(--borde);
  text-align: left;
}
.acc-body th {
  background: var(--verde-claro);
  color: var(--verde-oscuro);
  font-size: 12px;
}

/* === ITEM (restaurante / POI) === */
.item {
  background: var(--verde-claro);
  border-left: 3px solid var(--dorado);
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
}
.item .name { font-weight: 600; color: var(--verde-oscuro); }
.item .det { font-size: 12px; color: var(--texto-suave); margin-top: 2px; }

/* === MAPA Leaflet === */
.mapa {
  height: 300px;
  width: 100%;
  border-radius: 8px;
  margin: 8px 0 12px;
}

/* === BOTÓN PRIMARIO (marcar completada) === */
.btn-primary {
  width: calc(100% - 32px);
  margin: 16px;
  padding: 14px;
  background: var(--verde-oscuro);
  color: white;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  display: block;
}
.btn-primary.completed {
  background: var(--verde-claro);
  color: var(--verde-oscuro);
  border: 1px solid var(--verde-medio);
}

/* === TIMELINE etapas.html === */
.progress-bar {
  height: 6px;
  background: var(--borde);
  margin: 16px;
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--dorado), var(--verde-oscuro));
  transition: width 0.3s;
}
.timeline { padding: 0 16px 16px; }
.t-item {
  background: white;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.t-item.today {
  background: #fff8e8;
  border: 2px solid var(--dorado);
}
.t-item.done { opacity: 0.55; }
.t-num {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--verde-oscuro);
  color: white;
  display: grid;
  place-items: center;
  font-weight: 700;
  flex-shrink: 0;
}
.t-num.today { background: var(--dorado); }
.t-num.done { background: var(--texto-disabled); }
.t-info { flex: 1; }
.t-info .t-titulo { font-weight: 600; font-size: 14px; }
.t-info .t-meta { font-size: 12px; color: var(--texto-suave); }

/* === FOOTER NAV (links menores) === */
.footer-nav {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--texto-suave);
}
.footer-nav a {
  color: var(--verde-oscuro);
  margin: 0 8px;
}

/* === EQUIPAJE: lista checkboxes (read-only) === */
.eq-section {
  background: white;
  margin: 12px 16px;
  border-radius: 10px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.eq-section h3 {
  font-size: 14px;
  color: var(--verde-oscuro);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.eq-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  font-size: 14px;
}
.eq-item .check {
  width: 18px; height: 18px;
  border: 2px solid var(--borde);
  border-radius: 4px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--verde-oscuro);
}
.eq-item.done .check {
  background: var(--verde-oscuro);
  color: white;
  border-color: var(--verde-oscuro);
}
.eq-item.done .label { text-decoration: line-through; color: var(--texto-suave); }

/* === ESTADOS GLOBALES === */
.hidden { display: none !important; }
```

- [ ] **Step 3: Verificar tamaño**

```bash
wc -c /Users/cx02795/Downloads/camino/css/style.css
```

Expected: 5000-7000 bytes aprox.

- [ ] **Step 4: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add css/style.css
git commit -m "feat: add main CSS with Naturaleza Gallega palette"
```

---

## Task 4: JS — `app.js` (acordeón + getCurrentStage + nav)

**Files:**
- Create: `/Users/cx02795/Downloads/camino/js/app.js`
- Create: `/Users/cx02795/Downloads/camino/tests/app.test.js`

- [ ] **Step 1: Escribir el test ANTES de la implementación**

Write to `/Users/cx02795/Downloads/camino/tests/app.test.js`:

```javascript
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
```

- [ ] **Step 2: Correr el test, debe fallar (módulo no existe)**

```bash
cd /Users/cx02795/Downloads/camino
node --test tests/app.test.js 2>&1 | head -10
```

Expected: error tipo "Cannot find module '../js/app.js'" o similar.

- [ ] **Step 3: Implementar `js/app.js`**

Write to `/Users/cx02795/Downloads/camino/js/app.js`:

```javascript
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
  const ymd = (d) => d.toISOString().slice(0, 10);
  const today = ymd(now);
  const startDate = STAGES[0].date;        // '2026-05-16'
  const lastWalkDate = STAGES[6].date;     // '2026-05-22'
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
```

- [ ] **Step 4: Correr tests, deben pasar todos**

```bash
cd /Users/cx02795/Downloads/camino
node --test tests/app.test.js 2>&1
```

Expected: `# pass 6` (6 tests pasan).

- [ ] **Step 5: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add js/app.js tests/app.test.js
git commit -m "feat(js): app.js with getCurrentStage + accordion (tested)"
```

---

## Task 5: JS — `progress.js` (localStorage)

**Files:**
- Create: `/Users/cx02795/Downloads/camino/js/progress.js`
- Create: `/Users/cx02795/Downloads/camino/tests/progress.test.js`

- [ ] **Step 1: Escribir el test antes**

Write to `/Users/cx02795/Downloads/camino/tests/progress.test.js`:

```javascript
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
```

- [ ] **Step 2: Correr test, debe fallar**

```bash
cd /Users/cx02795/Downloads/camino
node --test tests/progress.test.js 2>&1 | head -10
```

Expected: fallo por módulo no encontrado.

- [ ] **Step 3: Implementar `js/progress.js`**

Write to `/Users/cx02795/Downloads/camino/js/progress.js`:

```javascript
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
```

- [ ] **Step 4: Correr tests, deben pasar todos**

```bash
cd /Users/cx02795/Downloads/camino
node --test tests/progress.test.js 2>&1
```

Expected: `# pass 6`.

- [ ] **Step 5: Correr ambos test files juntos**

```bash
cd /Users/cx02795/Downloads/camino
node --test tests/ 2>&1 | tail -20
```

Expected: `# pass 12` (6 de app + 6 de progress).

- [ ] **Step 6: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add js/progress.js tests/progress.test.js
git commit -m "feat(js): progress.js with localStorage persistence (tested)"
```

---

## Task 6: Plantilla canónica de página de etapa (etapa-1.html)

Esta es la plantilla a la que las demás páginas etapa-N se ajustan. Construir
**etapa-1.html (Tui→Porriño)** primero como referencia.

**Files:**
- Create: `/Users/cx02795/Downloads/camino/etapa-1.html`

- [ ] **Step 1: Leer el .md fuente para extraer contenido**

```bash
cat /Users/cx02795/Downloads/camino/content/etapas/02_tui_porrino.md
```

Identificar las secciones del markdown y mapearlas a las 11 secciones del acordeón
(ver spec §5.2).

- [ ] **Step 2: Escribir `etapa-1.html`**

Write to `/Users/cx02795/Downloads/camino/etapa-1.html` con esta estructura completa:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#2c5f3d">
  <title>Etapa 1 · Tui → O Porriño · Camino Portugués</title>
  <link rel="manifest" href="/camino/manifest.json">
  <link rel="stylesheet" href="/camino/css/style.css">
  <link rel="stylesheet" href="/camino/leaflet/leaflet.css">
  <link rel="icon" type="image/png" sizes="192x192" href="/camino/icons/icon-192.png">
</head>
<body>
  <header class="topbar">
    <a href="/camino/etapas.html" class="back" aria-label="Volver">←</a>
    <div class="title">Etapa 1 · Tui → O Porriño</div>
  </header>

  <section class="hero">
    <span class="badge">ETAPA 1</span>
    <h1>Tui → O Porriño</h1>
    <div class="meta">16 km · Domingo 17 mayo · Salida ~9:00</div>
  </section>

  <div class="accordion">

    <article class="acc-item" id="resumen">
      <button class="acc-head"><span><span class="ic">📋</span>Resumen</span><span class="chev">›</span></button>
      <div class="acc-body">
        <!-- Resumen de la etapa, extraído del .md -->
      </div>
    </article>

    <article class="acc-item" id="antes">
      <button class="acc-head"><span><span class="ic">🥾</span>Antes de salir</span><span class="chev">›</span></button>
      <div class="acc-body">
        <!-- Contenido "Antes de salir de Tui" -->
      </div>
    </article>

    <article class="acc-item" id="durante">
      <button class="acc-head"><span><span class="ic">🛤</span>Durante la etapa</span><span class="chev">›</span></button>
      <div class="acc-body">
        <div class="mapa" id="mapa-1" data-etapa="1"></div>
        <!-- Hitos del trayecto + bares/servicios en ruta del .md -->
      </div>
    </article>

    <article class="acc-item" id="llegar">
      <button class="acc-head"><span><span class="ic">🏛</span>Al llegar a O Porriño</span><span class="chev">›</span></button>
      <div class="acc-body">
        <!-- Sección "Al llegar a O Porriño" -->
      </div>
    </article>

    <article class="acc-item" id="ver">
      <button class="acc-head"><span><span class="ic">👁</span>Qué ver</span><span class="chev">›</span></button>
      <div class="acc-body">
        <!-- Sección "Qué ver" del .md -->
      </div>
    </article>

    <article class="acc-item" id="curiosidades">
      <button class="acc-head"><span><span class="ic">✨</span>Curiosidades de O Porriño</span><span class="chev">›</span></button>
      <div class="acc-body">
        <!-- Sección "Curiosidades de O Porriño" del .md -->
      </div>
    </article>

    <article class="acc-item" id="gastronomia">
      <button class="acc-head"><span><span class="ic">🍴</span>Gastronomía típica</span><span class="chev">›</span></button>
      <div class="acc-body">
        <!-- Sección "Gastronomía típica de O Porriño" — SIN VINOS -->
      </div>
    </article>

    <article class="acc-item" id="ruta-pueblo">
      <button class="acc-head"><span><span class="ic">📍</span>Ruta recomendada del pueblo</span><span class="chev">›</span></button>
      <div class="acc-body">
        <table>
          <thead><tr><th>#</th><th>Punto</th><th>Distancia</th></tr></thead>
          <tbody>
            <!-- Filas del .md "Ruta recomendada" -->
          </tbody>
        </table>
      </div>
    </article>

    <article class="acc-item" id="comer">
      <button class="acc-head"><span><span class="ic">🍽</span>Dónde comer</span><span class="chev">›</span></button>
      <div class="acc-body">
        <!-- Cada restaurante como <div class="item"> -->
      </div>
    </article>

    <article class="acc-item" id="hotel">
      <button class="acc-head"><span><span class="ic">🛏</span>Hotel de hoy</span><span class="chev">›</span></button>
      <div class="acc-body">
        <div class="item">
          <div class="name">Malladoura Passive House</div>
          <div class="det">O Porriño · 70 €</div>
          <p style="margin-top:8px"><a href="https://www.booking.com/hotel/es/malladoura-passive-house.es.html?checkin=2026-05-17&checkout=2026-05-18&group_adults=1&no_rooms=1" target="_blank" rel="noopener">Ver en Booking →</a></p>
        </div>
      </div>
    </article>

    <article class="acc-item" id="fotos">
      <button class="acc-head"><span><span class="ic">📸</span>Fotografía y contemplación</span><span class="chev">›</span></button>
      <div class="acc-body">
        <!-- Sección "Fotografía y contemplación" del .md -->
      </div>
    </article>

  </div>

  <button class="btn-primary" id="btn-toggle-completed" data-stage-id="1">
    Marcar como completada
  </button>

  <script type="module" src="/camino/js/app.js"></script>
  <script type="module" src="/camino/js/progress.js"></script>
  <script src="/camino/leaflet/leaflet.js"></script>
  <script type="module" src="/camino/js/map.js"></script>
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('/camino/sw.js'));
    }
  </script>
</body>
</html>
```

- [ ] **Step 3: Volcar contenido real del .md a las secciones**

Para cada sección del acordeón, lee el `.md` correspondiente, convierte el markdown a HTML simple a mano (párrafos, listas, tablas) y pégalo dentro del `<div class="acc-body">` correspondiente.

**Convenciones de conversión:**
- `## Heading del .md` → `<h4>` dentro del body si es un sub-heading dentro de la sección
- Párrafos → `<p>...</p>`
- Listas con `-` → `<ul><li>...</li></ul>`
- Tablas → `<table>` con `<thead>` + `<tbody>`
- `**bold**` → `<strong>`
- Restaurantes (sección "Dónde comer") → cada uno en `<div class="item"><div class="name">Nombre</div><div class="det">descripción</div></div>`
- POIs / atracciones (sección "Qué ver") → mismo patrón con `<div class="item">` o párrafos según convenga
- **NO incluir nada de vinos / alcohol** aunque aparezca en el .md

- [ ] **Step 4: Verificar visualmente abriendo en el navegador**

```bash
open /Users/cx02795/Downloads/camino/etapa-1.html
```

Expected: la página abre, se ve la cabecera verde, el hero con badge, el acordeón con
las 11 secciones colapsadas. Click en cada cabecera abre/cierra. (El mapa no aparece
todavía porque no existe `map.js` ni los tiles — eso viene en Tasks 12-13.)

- [ ] **Step 5: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add etapa-1.html
git commit -m "feat(content): add etapa-1.html (Tui → Porriño) — canonical template"
```

---

## Task 7: Resto de páginas de etapa (etapa-0, etapa-2 a etapa-6)

**Files:**
- Create: `/Users/cx02795/Downloads/camino/etapa-0.html` (Tui llegada — sin sección "Durante" con mapa)
- Create: `/Users/cx02795/Downloads/camino/etapa-2.html` (Porriño → Redondela)
- Create: `/Users/cx02795/Downloads/camino/etapa-3.html` (Redondela → Pontevedra)
- Create: `/Users/cx02795/Downloads/camino/etapa-4.html` (Pontevedra → Caldas)
- Create: `/Users/cx02795/Downloads/camino/etapa-5.html` (Caldas → Padrón)
- Create: `/Users/cx02795/Downloads/camino/etapa-6.html` (Padrón → Santiago, con sub-rutas)

- [ ] **Step 1: Crear etapa-0.html (Tui llegada — sin caminata, sin mapa)**

Idéntica estructura a etapa-1.html PERO:
- Título: "Etapa 0 · Llegada a Tui"
- Hero: badge "ETAPA 0 · LLEGADA", título "Llegada a Tui", meta "Sábado 16 mayo · Tarde"
- Sección "🥾 Antes de salir" → renombrar a "🚆 Antes de llegar a Tui" con info del tren Vigo→Tui
- Sección "🛤 Durante la etapa" → **omitir completamente** (no hay caminata)
- Sección "🏛 Al llegar a [pueblo]" → "🏛 Llegando a Tui"
- Resto idéntico (Qué ver, Curiosidades, Gastronomía, Ruta del pueblo, Dónde comer, Hotel, Fotografía)
- Hotel: Fortuna Tui — C/ Martínez Padín 136 — 73€
- Botón inferior: `data-stage-id="0"`

Volcar contenido desde `content/etapas/01_tui.md`.

- [ ] **Step 2: Crear etapa-2.html (Porriño → Redondela)**

Misma plantilla que etapa-1.html. Cambios:
- Título: "Etapa 2 · O Porriño → Redondela"
- Hero: badge "ETAPA 2", meta "16 km · Lunes 18 mayo"
- `data-etapa="2"` en `<div class="mapa">`
- Hotel: Bahía de San Simón (link Booking del calendario)
- `data-stage-id="2"` en botón
- Volcar contenido desde `content/etapas/03_porrino_redondela.md`

- [ ] **Step 3: Crear etapa-3.html (Redondela → Pontevedra)**

- Hero: "ETAPA 3", "20 km · Martes 19 mayo"
- `data-etapa="3"`, `data-stage-id="3"`
- Hotel: Hotel Madrid (link Booking)
- Volcar `content/etapas/04_redondela_pontevedra.md`

- [ ] **Step 4: Crear etapa-4.html (Pontevedra → Caldas)**

- Hero: "ETAPA 4", "22 km · Miércoles 20 mayo"
- `data-etapa="4"`, `data-stage-id="4"`
- Hotel: Tierra (link Booking)
- Volcar `content/etapas/05_pontevedra_caldas.md`. Caldas tiene secciones extra
  ("Termas — qué opciones hay", "Fiestas destacadas") — incluirlas dentro de "Qué ver" como h4.

- [ ] **Step 5: Crear etapa-5.html (Caldas → Padrón)**

- Hero: "ETAPA 5", "19 km · Jueves 21 mayo"
- `data-etapa="5"`, `data-stage-id="5"`
- Hotel: Apartamento Doña Elena II (link Booking)
- Volcar `content/etapas/06_caldas_padron.md`. Padrón tiene secciones extra
  ("POIs adicionales importantes", "Los pimientos de Padrón — la historia completa",
  "Fiestas destacadas") — incluirlas dentro de "Qué ver" + "Curiosidades" + "Gastronomía".

- [ ] **Step 6: Crear etapa-6.html (Padrón → Santiago — caso especial con sub-rutas)**

- Hero: "ETAPA 6 · ¡A SANTIAGO!", "25 km · Viernes 22 mayo"
- `data-etapa="6"`, `data-stage-id="6"`
- Hotel: Loop Inn Santiago (link Booking)
- Volcar `content/etapas/07_padron_santiago.md`

**Caso especial:** este .md tiene 2 sub-rutas (viernes tarde + sábado mañana).
Ambas se renderizan como sub-acordeones DENTRO de la sección "🏛 Al llegar a Santiago":

```html
<article class="acc-item" id="llegar">
  <button class="acc-head"><span><span class="ic">🏛</span>Al llegar a Santiago</span><span class="chev">›</span></button>
  <div class="acc-body">
    <div class="accordion" style="margin-top:8px">
      <article class="acc-item">
        <button class="acc-head"><span>📅 Ruta viernes tarde (17:00 - 20:30)</span><span class="chev">›</span></button>
        <div class="acc-body">
          <!-- Contenido del bloque "RUTA 1 — VIERNES TARDE" -->
        </div>
      </article>
      <article class="acc-item">
        <button class="acc-head"><span>⛪ Ruta sábado mañana (con misa peregrino + botafumeiro)</span><span class="chev">›</span></button>
        <div class="acc-body">
          <!-- Contenido de "RUTA 2 — SÁBADO MAÑANA" con bloques A, fijo, B -->
        </div>
      </article>
    </div>
  </div>
</article>
```

- [ ] **Step 7: Smoke test — abrir las 7 páginas en el navegador**

```bash
cd /Users/cx02795/Downloads/camino
for i in 0 1 2 3 4 5 6; do open etapa-$i.html; done
```

Verificar visualmente que cada una carga, hero correcto, acordeón funciona, botón
"Marcar como completada" presente.

- [ ] **Step 8: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add etapa-0.html etapa-2.html etapa-3.html etapa-4.html etapa-5.html etapa-6.html
git commit -m "feat(content): add etapas 0, 2, 3, 4, 5, 6 (Tui llegada + caminadas)"
```

---

## Task 8: Páginas auxiliares — equipaje, antes, bastones, 404

**Files:**
- Create: `/Users/cx02795/Downloads/camino/equipaje.html`
- Create: `/Users/cx02795/Downloads/camino/antes.html`
- Create: `/Users/cx02795/Downloads/camino/bastones.html`
- Create: `/Users/cx02795/Downloads/camino/404.html`

- [ ] **Step 1: Crear `equipaje.html`**

Estructura: topbar + secciones por categoría (cada categoría es una `<section class="eq-section">` con `<h3>` y `<ul>` de items). Cada item es:

```html
<li class="eq-item done">
  <span class="check">✓</span>
  <span class="label">Mochila: Deuter Futura 32</span>
</li>
```

- `done` para items con `[x]`
- sin clase `done` para items con `[ ]`

Write to `/Users/cx02795/Downloads/camino/equipaje.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#2c5f3d">
  <title>Equipaje · Camino Portugués</title>
  <link rel="manifest" href="/camino/manifest.json">
  <link rel="stylesheet" href="/camino/css/style.css">
  <link rel="icon" type="image/png" sizes="192x192" href="/camino/icons/icon-192.png">
</head>
<body>
  <header class="topbar">
    <a href="/camino/" class="back" aria-label="Volver">←</a>
    <div class="title">🎒 Equipaje</div>
  </header>

  <!-- Una <section class="eq-section"> por cada categoría del .md:
       Grandes / Ropa para caminar / Ropa para las tardes / Para dormir /
       Higiene / Botiquín / Hidratación / Electrónica / Documentación / Varios /
       Neceser de baño -->

  <script type="module" src="/camino/js/app.js"></script>
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('/camino/sw.js'));
    }
  </script>
</body>
</html>
```

Volcar contenido leyendo `content/equipaje.md`. Mantener el orden y agrupación.

- [ ] **Step 2: Crear `antes.html`**

Topbar + acordeón con secciones (las mismas categorías de `content/antes.md`):

- 📞 Teléfonos importantes (112, Cruz Roja, Oficina Peregrino)
- 🥬 Horarios gallegos
- 🍽 Menú del peregrino
- 📖 Credencial del peregrino (cómo, dónde sellar, mínimo 2/día)
- ⚠️ Aviso de estafas
- 💧 Agua del grifo
- 💶 Propinas
- 💊 Farmacias
- 🛒 Supermercados (Gadis/Froiz cierran domingos)
- 📱 Apps recomendadas
- 🗣 Vocabulario gallego básico

**SIN sección de vinos.**

Estructura igual que las páginas de etapa pero sin hero, solo topbar + acordeón.

- [ ] **Step 3: Crear `bastones.html`**

Topbar + acordeón con secciones de `content/bastones.md`:
- 📏 Regulación de altura
- 🤝 Empuñadura y correa de muñeca
- 🥾 Técnica básica (oposición / paralelo)
- ⛰ Subidas y bajadas
- ⚠️ Errores comunes
- 🔧 Mantenimiento

- [ ] **Step 4: Crear `404.html`**

Página simple consistente con el resto:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#2c5f3d">
  <title>Página no encontrada · Camino Portugués</title>
  <link rel="stylesheet" href="/camino/css/style.css">
</head>
<body>
  <header class="topbar">
    <a href="/camino/" class="back" aria-label="Inicio">←</a>
    <div class="title">404</div>
  </header>
  <div style="padding:48px 24px;text-align:center">
    <div style="font-size:64px;margin-bottom:16px">🥾</div>
    <h2 style="color:#2c5f3d;margin-bottom:8px">Te has desviado del camino</h2>
    <p style="color:#5a6e5c;margin-bottom:24px">Esta página no existe.</p>
    <a href="/camino/" style="display:inline-block;padding:12px 24px;background:#2c5f3d;color:white;border-radius:8px">Volver al inicio</a>
  </div>
</body>
</html>
```

- [ ] **Step 5: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add equipaje.html antes.html bastones.html 404.html
git commit -m "feat(content): add equipaje, antes, bastones, 404 pages"
```

---

## Task 9: Home — `index.html` (Today-first dinámico)

**Files:**
- Create: `/Users/cx02795/Downloads/camino/index.html`

- [ ] **Step 1: Escribir `index.html`**

Write to `/Users/cx02795/Downloads/camino/index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#2c5f3d">
  <title>Camino Portugués</title>
  <link rel="manifest" href="/camino/manifest.json">
  <link rel="stylesheet" href="/camino/css/style.css">
  <link rel="icon" type="image/png" sizes="192x192" href="/camino/icons/icon-192.png">
</head>
<body>
  <section class="hero" id="hero">
    <!-- Inyectado por JS según getCurrentStage() -->
  </section>

  <div class="quick-actions" id="quick-actions">
    <!-- Inyectado por JS — 4 deep-links a etapa-N.html#seccion -->
  </div>

  <section class="next-section" id="next-section">
    <!-- "PRÓXIMA" + tarjeta resumen — inyectado por JS si aplica -->
  </section>

  <nav class="footer-nav">
    <a href="/camino/etapas.html">📅 Etapas</a>
    <a href="/camino/equipaje.html">🎒 Equipaje</a>
    <a href="/camino/antes.html">📋 Antes</a>
    <a href="/camino/bastones.html">🦯 Bastones</a>
  </nav>

  <script type="module">
    import { getCurrentStage } from '/camino/js/app.js';

    const STAGES_INFO = [
      { id: 0, titulo: 'Llegada a Tui', km: null, fecha: 'Sábado 16 mayo', salida: null },
      { id: 1, titulo: 'Tui → O Porriño', km: 16, fecha: 'Domingo 17 mayo', salida: '~9:00' },
      { id: 2, titulo: 'O Porriño → Redondela', km: 16, fecha: 'Lunes 18 mayo', salida: '~9:00' },
      { id: 3, titulo: 'Redondela → Pontevedra', km: 20, fecha: 'Martes 19 mayo', salida: '~9:00' },
      { id: 4, titulo: 'Pontevedra → Caldas', km: 22, fecha: 'Miércoles 20 mayo', salida: '~8:30' },
      { id: 5, titulo: 'Caldas → Padrón', km: 19, fecha: 'Jueves 21 mayo', salida: '~9:00' },
      { id: 6, titulo: 'Padrón → Santiago', km: 25, fecha: 'Viernes 22 mayo', salida: '~8:00' }
    ];

    const r = getCurrentStage();
    const hero = document.getElementById('hero');
    const qa = document.getElementById('quick-actions');
    const next = document.getElementById('next-section');

    function renderHero(stage, label) {
      const badgeText =
        label === 'today' ? 'HOY' :
        label === 'santiago' ? '¡EN SANTIAGO!' : '';
      const km = stage.km ? `${stage.km} km · ` : '';
      const salida = stage.salida ? ` · Salida ${stage.salida}` : '';
      hero.innerHTML = `
        <span class="badge">${badgeText} · ETAPA ${stage.id}</span>
        <h1>${stage.titulo}</h1>
        <div class="meta">${km}${stage.fecha}${salida}</div>
      `;
    }

    function renderQuickActions(stageId) {
      // El "Ruta y mapa" para etapa 0 (sin caminata) apunta a la ruta del pueblo
      const rutaHash = stageId === 0 ? '#ruta-pueblo' : '#durante';
      qa.innerHTML = `
        <a class="quick-action" href="/camino/etapa-${stageId}.html${rutaHash}"><span class="ic">📍</span>Ruta y mapa</a>
        <a class="quick-action" href="/camino/etapa-${stageId}.html#comer"><span class="ic">🍴</span>Dónde comer</a>
        <a class="quick-action" href="/camino/etapa-${stageId}.html#hotel"><span class="ic">🛏</span>Hotel de hoy</a>
        <a class="quick-action" href="/camino/etapa-${stageId}.html#ver"><span class="ic">👁</span>Qué ver</a>
      `;
    }

    function renderNext(nextId) {
      if (nextId === null || nextId === undefined) {
        next.innerHTML = `
          <div class="section-label">Felicidades</div>
          <div class="card"><strong>¡Has terminado el Camino!</strong></div>
        `;
        return;
      }
      const ns = STAGES_INFO[nextId];
      const km = ns.km ? `${ns.km} km · ` : '';
      next.innerHTML = `
        <div class="section-label">Próxima</div>
        <a class="card" href="/camino/etapa-${ns.id}.html" style="display:block;text-decoration:none;color:inherit">
          <div style="font-weight:600;color:#2c5f3d">Etapa ${ns.id} · ${ns.titulo}</div>
          <div style="font-size:13px;color:#5a6e5c;margin-top:2px">${km}${ns.fecha}</div>
        </a>
      `;
    }

    if (r.label === 'pre') {
      hero.innerHTML = `
        <span class="badge">EN ${r.daysToStart} ${r.daysToStart === 1 ? 'DÍA' : 'DÍAS'}</span>
        <h1>Comienza el Camino</h1>
        <div class="meta">Sábado 16 mayo · Llegada a Tui</div>
      `;
      qa.style.display = 'none';
      renderNext(0);
    } else if (r.label === 'post') {
      hero.innerHTML = `
        <span class="badge">¡COMPLETADO!</span>
        <h1>Buen Camino terminado</h1>
        <div class="meta">Tui → Santiago de Compostela</div>
      `;
      qa.style.display = 'none';
      next.innerHTML = `
        <div class="section-label">Recuerdo</div>
        <a class="card" href="/camino/etapas.html" style="display:block;text-decoration:none;color:inherit">
          <div style="font-weight:600;color:#2c5f3d">Ver las 7 etapas</div>
        </a>
      `;
    } else {
      const stage = STAGES_INFO[r.stageId];
      renderHero(stage, r.label);
      renderQuickActions(r.stageId);
      renderNext(r.nextStageId);
    }
  </script>

  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('/camino/sw.js'));
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Probar en navegador con la fecha del sistema actual**

```bash
open /Users/cx02795/Downloads/camino/index.html
```

Expected (a 2026-05-15): badge "EN 1 DÍA", hero "Comienza el Camino", quick actions
ocultos, sección "Próxima" con tarjeta de Etapa 0.

- [ ] **Step 3: Probar diferentes fechas modificando `getCurrentStage` con `?date=2026-05-20` (manual)**

Para test manual, abrir DevTools console y ejecutar:
```javascript
const m = await import('/camino/js/app.js');
console.log(m.getCurrentStage(new Date('2026-05-20')));
```

Expected: `{ stageId: 4, label: 'today', nextStageId: 5, ... }`.

- [ ] **Step 4: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add index.html
git commit -m "feat(home): index.html with Today-first dynamic by date"
```

---

## Task 10: Timeline — `etapas.html`

**Files:**
- Create: `/Users/cx02795/Downloads/camino/etapas.html`

- [ ] **Step 1: Escribir `etapas.html`**

Write to `/Users/cx02795/Downloads/camino/etapas.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#2c5f3d">
  <title>Etapas · Camino Portugués</title>
  <link rel="manifest" href="/camino/manifest.json">
  <link rel="stylesheet" href="/camino/css/style.css">
  <link rel="icon" type="image/png" sizes="192x192" href="/camino/icons/icon-192.png">
</head>
<body>
  <header class="topbar">
    <a href="/camino/" class="back" aria-label="Inicio">←</a>
    <div class="title">📅 Las 7 etapas</div>
  </header>

  <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
  <div style="text-align:center;margin-top:-8px;font-size:12px;color:#5a6e5c" id="progress-text">0 de 7 etapas completadas</div>

  <div class="timeline" id="timeline">
    <!-- Inyectado por JS -->
  </div>

  <script type="module">
    import { getCurrentStage } from '/camino/js/app.js';
    import { isCompleted, getCompletedStages } from '/camino/js/progress.js';

    const STAGES_INFO = [
      { id: 0, sub: 'Llegada', tramo: 'Tui (sábado tarde)', km: null, fecha: 'Sáb 16 may' },
      { id: 1, sub: '1', tramo: 'Tui → O Porriño',     km: 16, fecha: 'Dom 17 may' },
      { id: 2, sub: '2', tramo: 'O Porriño → Redondela', km: 16, fecha: 'Lun 18 may' },
      { id: 3, sub: '3', tramo: 'Redondela → Pontevedra', km: 20, fecha: 'Mar 19 may' },
      { id: 4, sub: '4', tramo: 'Pontevedra → Caldas', km: 22, fecha: 'Mié 20 may' },
      { id: 5, sub: '5', tramo: 'Caldas → Padrón',     km: 19, fecha: 'Jue 21 may' },
      { id: 6, sub: '6', tramo: 'Padrón → Santiago',   km: 25, fecha: 'Vie 22 may' }
    ];

    const r = getCurrentStage();
    const todayId = (r.label === 'today' || r.label === 'santiago') ? r.stageId : null;

    const tl = document.getElementById('timeline');
    tl.innerHTML = STAGES_INFO.map(s => {
      const done = isCompleted(s.id);
      const isToday = todayId === s.id;
      const cls = ['t-item'];
      if (done) cls.push('done');
      if (isToday) cls.push('today');

      const numCls = ['t-num'];
      if (done) numCls.push('done');
      if (isToday) numCls.push('today');

      const numContent = done ? '✓' : s.sub;
      const km = s.km ? `${s.km} km · ` : '';
      const todayBadge = isToday ? ' <span style="color:#c89a3c;font-weight:700">· HOY</span>' : '';

      return `
        <a href="/camino/etapa-${s.id}.html" class="${cls.join(' ')}" style="text-decoration:none;color:inherit;display:flex">
          <div class="${numCls.join(' ')}">${numContent}</div>
          <div class="t-info">
            <div class="t-titulo">${s.tramo}${todayBadge}</div>
            <div class="t-meta">${km}${s.fecha}</div>
          </div>
        </a>
      `;
    }).join('');

    const completed = getCompletedStages();
    const pct = Math.round((completed.length / 7) * 100);
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-text').textContent =
      `${completed.length} de 7 etapas completadas`;
  </script>

  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('/camino/sw.js'));
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Probar en navegador**

```bash
open /Users/cx02795/Downloads/camino/etapas.html
```

Expected: las 7 etapas listadas, barra de progreso a 0%, texto "0 de 7 etapas completadas".

- [ ] **Step 3: Probar marcar etapa completada**

Manualmente abrir `etapa-1.html` → click en "Marcar como completada" → volver a `etapas.html` → verificar que la etapa 1 aparece tachada y la barra a 14%.

- [ ] **Step 4: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add etapas.html
git commit -m "feat: etapas.html timeline with localStorage progress"
```

---

## Task 11: Vendor Leaflet (descargar v1.9.x al repo)

**Files:**
- Create: `/Users/cx02795/Downloads/camino/leaflet/leaflet.js`
- Create: `/Users/cx02795/Downloads/camino/leaflet/leaflet.css`
- Create: `/Users/cx02795/Downloads/camino/leaflet/images/marker-icon.png`
- Create: `/Users/cx02795/Downloads/camino/leaflet/images/marker-icon-2x.png`
- Create: `/Users/cx02795/Downloads/camino/leaflet/images/marker-shadow.png`

- [ ] **Step 1: Descargar Leaflet 1.9.4 desde unpkg**

```bash
cd /Users/cx02795/Downloads/camino/leaflet
curl -L -o leaflet.js https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
curl -L -o leaflet.css https://unpkg.com/leaflet@1.9.4/dist/leaflet.css
mkdir -p images
curl -L -o images/marker-icon.png https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png
curl -L -o images/marker-icon-2x.png https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png
curl -L -o images/marker-shadow.png https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png
curl -L -o images/layers.png https://unpkg.com/leaflet@1.9.4/dist/images/layers.png
curl -L -o images/layers-2x.png https://unpkg.com/leaflet@1.9.4/dist/images/layers-2x.png
```

- [ ] **Step 2: Verificar tamaño y contenido**

```bash
ls -la /Users/cx02795/Downloads/camino/leaflet/
ls -la /Users/cx02795/Downloads/camino/leaflet/images/
```

Expected: `leaflet.js` ~140KB, `leaflet.css` ~14KB, 5 PNGs de markers (~10-30KB total).

- [ ] **Step 3: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add leaflet/
git commit -m "vendor: add Leaflet 1.9.4 (js + css + marker images)"
```

---

## Task 12: GeoJSON de las 6 rutas caminadas

**Files:**
- Create: `/Users/cx02795/Downloads/camino/rutas/etapa-1.geojson` … `etapa-6.geojson`

Las rutas del Camino Portugués Tui→Santiago están bien documentadas. Hay dos vías de
obtenerlas:

**Opción A (preferida):** descargar GPX de Wikiloc/Camino oficial y convertir a GeoJSON.

**Opción B (fallback si falla):** crear LineString simplificado a mano con los waypoints
mayores (suficiente como visualización contextual).

- [ ] **Step 1: Intentar descargar GPX oficial**

El sitio oficial del Camino (Galicia) y Wikiloc publican tracks. Probar:

```bash
cd /Users/cx02795/Downloads/camino/rutas
# Buscar GPX públicos de cada etapa
# (URLs concretas pueden cambiar; alternativa: usar un track conocido de OpenStreetMap
# vía Overpass API, o una librería como https://github.com/gigantt/camino-de-santiago-routes)

# Si no encontramos un GPX directo, fallback a Option B
```

- [ ] **Step 2: (Si Opción A funcionó) Convertir GPX a GeoJSON**

```bash
# Si tenemos los GPX en /tmp/etapa-N.gpx, usar gpx2geojson o similar.
# Si no hay herramienta instalada:
# brew install gdal  # provee ogr2ogr
# ogr2ogr -f GeoJSON etapa-1.geojson /tmp/etapa-1.gpx
```

- [ ] **Step 3: (Fallback Opción B si A falla) Crear GeoJSON simplificado a mano por etapa**

Cada GeoJSON es un FeatureCollection con un LineString del trayecto principal y opcionalmente Points en pueblos hito.

Ejemplo `etapa-1.geojson` (Tui → O Porriño, 16 km, ruta aproximada por Orbenlle):

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "etapa": 1, "nombre": "Tui → O Porriño" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-8.6435, 42.0463], [-8.6388, 42.0532], [-8.6312, 42.0641],
          [-8.6248, 42.0714], [-8.6184, 42.0792], [-8.6120, 42.0871],
          [-8.6064, 42.0945], [-8.6010, 42.1018], [-8.5965, 42.1083],
          [-8.5921, 42.1147], [-8.5879, 42.1208], [-8.5840, 42.1265]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "tipo": "inicio", "nombre": "Tui" },
      "geometry": { "type": "Point", "coordinates": [-8.6435, 42.0463] }
    },
    {
      "type": "Feature",
      "properties": { "tipo": "fin", "nombre": "O Porriño" },
      "geometry": { "type": "Point", "coordinates": [-8.5840, 42.1265] }
    }
  ]
}
```

Repetir para etapa-2 a etapa-6 con coordenadas plausibles entre los waypoints
extraídos de los `.md` (Mos, Redondela, Arcade, Pontevedra, Caldas, Padrón, Santiago).

**Tip:** si la ruta resulta visualmente mal, refinarla añadiendo más puntos
intermedios. Para "lo más estable y resiliente", aceptar simplificación.

- [ ] **Step 4: Verificar JSON válido**

```bash
cd /Users/cx02795/Downloads/camino/rutas
for f in etapa-*.geojson; do
  echo "=== $f ==="
  python3 -m json.tool "$f" > /dev/null && echo "valid" || echo "INVALID"
done
```

Expected: cada uno imprime "valid".

- [ ] **Step 5: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add rutas/
git commit -m "feat(map): add GeoJSON routes for walking stages 1-6"
```

---

## Task 13: `map.js` — bootstrap Leaflet con tiles offline

**Files:**
- Create: `/Users/cx02795/Downloads/camino/js/map.js`

- [ ] **Step 1: Implementar `js/map.js`**

Write to `/Users/cx02795/Downloads/camino/js/map.js`:

```javascript
// map.js — Leaflet bootstrap con tiles offline + GeoJSON routes
// Window-global (no module) porque Leaflet es UMD y se carga vía <script>

window.initMapa = async function initMapa(mapaEl) {
  if (!window.L) return;
  const etapa = mapaEl.dataset.etapa;
  if (!etapa) return;

  const map = L.map(mapaEl, {
    zoomControl: true,
    attributionControl: true
  });

  // Tile layer apuntando a tiles locales precargados
  L.tileLayer('/camino/tiles/{z}/{x}/{y}.png', {
    minZoom: 11,
    maxZoom: 15,
    attribution: '© OpenStreetMap',
    errorTileUrl: '/camino/leaflet/images/marker-shadow.png' // fallback gris si falta tile
  }).addTo(map);

  // Cargar GeoJSON de la ruta
  try {
    const res = await fetch(`/camino/rutas/etapa-${etapa}.geojson`);
    const gj = await res.json();
    const layer = L.geoJSON(gj, {
      style: (feat) => ({
        color: '#c89a3c',
        weight: 4,
        opacity: 0.85
      }),
      pointToLayer: (feat, latlng) => {
        const tipo = feat.properties && feat.properties.tipo;
        const color = tipo === 'inicio' ? '#2c5f3d' : tipo === 'fin' ? '#c89a3c' : '#5a8d6e';
        return L.circleMarker(latlng, {
          radius: 6, fillColor: color, color: '#fff',
          weight: 2, opacity: 1, fillOpacity: 1
        }).bindPopup(feat.properties.nombre || '');
      }
    }).addTo(map);

    map.fitBounds(layer.getBounds(), { padding: [20, 20] });
  } catch (e) {
    console.warn('No se pudo cargar GeoJSON etapa', etapa, e);
    // Centrado fallback aproximado en el corredor
    map.setView([42.5, -8.5], 11);
  }
};
```

- [ ] **Step 2: Verificar que las páginas etapa-1 a etapa-6 cargan map.js**

```bash
grep -l 'js/map.js' /Users/cx02795/Downloads/camino/etapa-*.html
```

Expected: imprime etapa-1.html a etapa-6.html (NO etapa-0.html, que no tiene mapa).

- [ ] **Step 3: Smoke test sin tiles aún (mostraría grid gris pero sin errores JS)**

```bash
open /Users/cx02795/Downloads/camino/etapa-1.html
```

Abrir DevTools console. Expandir sección "Durante la etapa". Expected: no hay errores
de JS; el contenedor del mapa aparece (vacío/gris). La ruta dorada se dibuja sobre el
gris si el GeoJSON cargó bien.

- [ ] **Step 4: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add js/map.js
git commit -m "feat(map): map.js Leaflet bootstrap with local tiles + GeoJSON routes"
```

---

## Task 14: Descarga de tiles OSM (script + ejecución)

**Files:**
- Create: `/Users/cx02795/Downloads/camino/scripts/download-tiles.sh`

- [ ] **Step 1: Crear script de descarga de tiles**

Write to `/Users/cx02795/Downloads/camino/scripts/download-tiles.sh`:

```bash
#!/usr/bin/env bash
# download-tiles.sh — descarga tiles OpenStreetMap del corredor Tui→Santiago
# Una sola ejecución. Respeta tile usage policy con --wait y User-Agent identificable.
#
# Uso: ./scripts/download-tiles.sh
# Output: tiles/{z}/{x}/{y}.png

set -euo pipefail

DEST="$(dirname "$0")/../tiles"
UA="CaminoPortuguesPWA/1.0 (+https://github.com/PirfectPexel/camino; personal use)"

# Bounding box del corredor Tui→Santiago (lat lon)
LAT_MIN=42.04
LAT_MAX=42.90
LON_MIN=-8.70
LON_MAX=-8.30

ZOOMS="11 12 13 14 15"

# Función lon→tile X y lat→tile Y según convención slippy maps
deg2num() {
  python3 -c "
import math
lat, lon, z = $1, $2, $3
lat_rad = math.radians(lat)
n = 2 ** z
x = int((lon + 180) / 360 * n)
y = int((1 - math.asinh(math.tan(lat_rad)) / math.pi) / 2 * n)
print(x, y)
"
}

mkdir -p "$DEST"
total=0; downloaded=0; skipped=0; failed=0

for z in $ZOOMS; do
  read x_min y_max <<< "$(deg2num $LAT_MIN $LON_MIN $z)"
  read x_max y_min <<< "$(deg2num $LAT_MAX $LON_MAX $z)"
  [ "$x_min" -gt "$x_max" ] && { tmp=$x_min; x_min=$x_max; x_max=$tmp; }
  [ "$y_min" -gt "$y_max" ] && { tmp=$y_min; y_min=$y_max; y_max=$tmp; }
  echo ">>> Zoom $z: tiles X=$x_min..$x_max Y=$y_min..$y_max"

  for x in $(seq $x_min $x_max); do
    mkdir -p "$DEST/$z/$x"
    for y in $(seq $y_min $y_max); do
      total=$((total+1))
      out="$DEST/$z/$x/$y.png"
      if [ -s "$out" ]; then skipped=$((skipped+1)); continue; fi
      url="https://tile.openstreetmap.org/$z/$x/$y.png"
      if curl -sSL -A "$UA" --max-time 30 -o "$out" "$url"; then
        downloaded=$((downloaded+1))
      else
        failed=$((failed+1))
        rm -f "$out"
      fi
      sleep 0.3   # respetar tile policy: <2 req/s
    done
  done
done

echo ""
echo "Tiles total: $total · Descargados: $downloaded · Skipped (cache): $skipped · Failed: $failed"
echo "Tamaño total:"
du -sh "$DEST"
```

```bash
chmod +x /Users/cx02795/Downloads/camino/scripts/download-tiles.sh
```

- [ ] **Step 2: Estimar volumen antes de descargar**

```bash
python3 -c "
import math
def tiles_for_zoom(z, lat_min, lat_max, lon_min, lon_max):
    def deg2num(lat, lon, z):
        n = 2 ** z
        x = int((lon + 180) / 360 * n)
        y = int((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n)
        return x, y
    x1, y2 = deg2num(lat_min, lon_min, z)
    x2, y1 = deg2num(lat_max, lon_max, z)
    return abs(x2-x1+1) * abs(y2-y1+1)

total = sum(tiles_for_zoom(z, 42.04, 42.90, -8.70, -8.30) for z in [11,12,13,14,15])
print(f'Tiles totales: {total}')
print(f'Estimación tamaño (25KB/tile media): {total*25/1024:.1f} MB')
print(f'Tiempo estimado a 0.3s/tile: {total*0.3/60:.0f} min')
"
```

Si el resultado supera ~3000 tiles o ~80 MB, **bajar el zoom máximo a 14** editando
`ZOOMS="11 12 13 14"` en el script y reestimar.

- [ ] **Step 3: Ejecutar la descarga**

```bash
cd /Users/cx02795/Downloads/camino
./scripts/download-tiles.sh
```

Expected: progreso por zoom; al final imprime totales y tamaño en `/tiles/`. Esto puede tardar 10-30 min según volumen y red.

- [ ] **Step 4: Verificar muestreo de tiles descargados**

```bash
cd /Users/cx02795/Downloads/camino
ls tiles/13/ | head -5
file tiles/13/$(ls tiles/13/ | head -1)/$(ls tiles/13/$(ls tiles/13/ | head -1) | head -1)
du -sh tiles/
```

Expected: `file` reporta "PNG image", `du -sh` muestra total < 100 MB ideal.

- [ ] **Step 5: Probar mapa en navegador con tiles**

```bash
open /Users/cx02795/Downloads/camino/etapa-1.html
```

Expandir "Durante la etapa". Expected: el mapa OSM se renderiza, la línea dorada de la
ruta se dibuja, hay markers de inicio/fin. Si el mapa aparece en gris, ver consola
para errores de carga de tiles.

- [ ] **Step 6: Commit (incluye script + tiles)**

```bash
cd /Users/cx02795/Downloads/camino
git add scripts/download-tiles.sh tiles/
git commit -m "feat(map): download OSM tiles for offline corridor Tui-Santiago (z11-15)"
```

**Nota:** `git add tiles/` añadirá ~1500-3000 archivos PNG. El commit puede tardar
30-60 segundos. Es esperado.

---

## Task 15: PWA — manifest.json + sw.js + iconos

**Files:**
- Create: `/Users/cx02795/Downloads/camino/manifest.json`
- Create: `/Users/cx02795/Downloads/camino/sw.js`
- Create: `/Users/cx02795/Downloads/camino/icons/icon-192.png`
- Create: `/Users/cx02795/Downloads/camino/icons/icon-512.png`

- [ ] **Step 1: Crear `manifest.json`**

Write to `/Users/cx02795/Downloads/camino/manifest.json`:

```json
{
  "name": "Camino Portugués",
  "short_name": "Camino",
  "description": "Guía personal del Camino Portugués (Tui → Santiago, mayo 2026)",
  "start_url": "/camino/",
  "scope": "/camino/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#2c5f3d",
  "theme_color": "#2c5f3d",
  "lang": "es",
  "icons": [
    {
      "src": "/camino/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/camino/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 2: Crear iconos PWA**

Crear dos PNGs (192x192 y 512x512) con un diseño minimalista: vieira blanca o flecha
amarilla del Camino sobre fondo verde `#2c5f3d`.

Opción rápida con ImageMagick (instalar si falta: `brew install imagemagick`):

```bash
cd /Users/cx02795/Downloads/camino/icons

# 512x512 base con fondo verde + emoji vieira centrado
magick -size 512x512 xc:'#2c5f3d' \
  -font 'Apple-Color-Emoji' -pointsize 320 \
  -gravity center -annotate +0+0 '🐚' \
  icon-512.png

# Resize 192x192
magick icon-512.png -resize 192x192 icon-192.png

# Verificar
identify icon-192.png icon-512.png
```

Si ImageMagick no soporta emoji color (versiones antiguas), alternativa: usar SVG
inline a PNG con `rsvg-convert` o crearlos a mano con un editor. Como fallback simple,
puedes usar PNG sólido verde con texto blanco "C" (mientras no haya algo mejor):

```bash
magick -size 512x512 xc:'#2c5f3d' \
  -font 'Helvetica-Bold' -pointsize 320 -fill white \
  -gravity center -annotate +0+0 'C' \
  icon-512.png
magick icon-512.png -resize 192x192 icon-192.png
```

- [ ] **Step 3: Crear `sw.js` (Service Worker)**

Write to `/Users/cx02795/Downloads/camino/sw.js`:

```javascript
// sw.js — Service Worker del Camino Portugués PWA
// Estrategia: cache-first con fallback a red.
// IMPORTANTE: bumpear CACHE_VERSION cada vez que cambies contenido para forzar update.

const CACHE_VERSION = 'camino-v1';
const SCOPE = '/camino';

// Lista exhaustiva de recursos a precargar al instalar.
// Si añades una página o asset, añadirlo aquí.
const PRECACHE_URLS = [
  `${SCOPE}/`,
  `${SCOPE}/index.html`,
  `${SCOPE}/etapas.html`,
  `${SCOPE}/etapa-0.html`,
  `${SCOPE}/etapa-1.html`,
  `${SCOPE}/etapa-2.html`,
  `${SCOPE}/etapa-3.html`,
  `${SCOPE}/etapa-4.html`,
  `${SCOPE}/etapa-5.html`,
  `${SCOPE}/etapa-6.html`,
  `${SCOPE}/equipaje.html`,
  `${SCOPE}/antes.html`,
  `${SCOPE}/bastones.html`,
  `${SCOPE}/404.html`,
  `${SCOPE}/manifest.json`,
  `${SCOPE}/css/style.css`,
  `${SCOPE}/js/app.js`,
  `${SCOPE}/js/progress.js`,
  `${SCOPE}/js/map.js`,
  `${SCOPE}/leaflet/leaflet.js`,
  `${SCOPE}/leaflet/leaflet.css`,
  `${SCOPE}/leaflet/images/marker-icon.png`,
  `${SCOPE}/leaflet/images/marker-icon-2x.png`,
  `${SCOPE}/leaflet/images/marker-shadow.png`,
  `${SCOPE}/leaflet/images/layers.png`,
  `${SCOPE}/leaflet/images/layers-2x.png`,
  `${SCOPE}/icons/icon-192.png`,
  `${SCOPE}/icons/icon-512.png`,
  `${SCOPE}/rutas/etapa-1.geojson`,
  `${SCOPE}/rutas/etapa-2.geojson`,
  `${SCOPE}/rutas/etapa-3.geojson`,
  `${SCOPE}/rutas/etapa-4.geojson`,
  `${SCOPE}/rutas/etapa-5.geojson`,
  `${SCOPE}/rutas/etapa-6.geojson`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      // Precargar páginas/JS/CSS en lote
      await cache.addAll(PRECACHE_URLS);

      // Precargar tiles individualmente (no fallar el install si alguno no responde)
      // Los tiles se descubren del directorio /tiles/
      // Nota: Service Workers no pueden listar directorios; se precargan al primer uso.
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Solo gestionamos peticiones del propio scope
  if (!url.pathname.startsWith(SCOPE + '/') && url.pathname !== SCOPE) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const fresh = await fetch(event.request);
      // Cachear tiles y otros recursos al vuelo (lazy)
      if (fresh.ok && (url.pathname.startsWith(SCOPE + '/tiles/') ||
                       url.pathname.startsWith(SCOPE + '/rutas/'))) {
        cache.put(event.request, fresh.clone());
      }
      return fresh;
    } catch (e) {
      // Sin red y sin caché → 404
      const fallback = await cache.match(`${SCOPE}/404.html`);
      return fallback || new Response('Offline y sin caché', { status: 503 });
    }
  })());
});
```

- [ ] **Step 4: Verificar registro del SW en una página**

```bash
grep -A 3 "serviceWorker" /Users/cx02795/Downloads/camino/index.html
```

Expected: bloque con `navigator.serviceWorker.register('/camino/sw.js')`. Verificar que
también está en cada etapa-N.html, equipaje.html, antes.html, bastones.html, etapas.html.

```bash
grep -L "serviceWorker.register" /Users/cx02795/Downloads/camino/*.html
```

Expected: ningún fichero listado (todos tienen el registro). Si alguno falta,
añadirlo antes de cerrar `</body>`.

- [ ] **Step 5: Commit**

```bash
cd /Users/cx02795/Downloads/camino
git add manifest.json sw.js icons/
git commit -m "feat(pwa): add manifest, service worker (cache-first), icons"
```

---

## Task 16: Push inicial a GitHub + activar GitHub Pages

- [ ] **Step 1: Confirmar que el commit count es razonable**

```bash
cd /Users/cx02795/Downloads/camino
git log --oneline | head -20
git status
```

Expected: ~15 commits, working tree clean.

- [ ] **Step 2: Comprobar tamaño del repo (sobre todo /tiles/)**

```bash
cd /Users/cx02795/Downloads/camino
du -sh .git
du -sh tiles/
```

Si `.git/` o `tiles/` superan 500 MB, considerar reducir tiles (zoom máx 14 vs 15).

- [ ] **Step 3: Push a `main`**

```bash
cd /Users/cx02795/Downloads/camino
git push -u origin main
```

Expected: push exitoso. Si pide credenciales, usar token GitHub. Si el repo remoto no
está vacío (tiene README inicial), hacer `git pull --rebase origin main` antes.

- [ ] **Step 4: Activar GitHub Pages vía API**

```bash
gh api -X POST "repos/PirfectPexel/camino/pages" \
  -f source.branch=main -f source.path=/ 2>&1 | head -10
```

Si `gh` no está autenticado: `gh auth login`. Si la web ya tiene Pages activado,
actualizar:

```bash
gh api -X PUT "repos/PirfectPexel/camino/pages" \
  -f source.branch=main -f source.path=/
```

Alternativa GUI: GitHub web → Settings → Pages → Source = `main / (root)`.

- [ ] **Step 5: Esperar despliegue y verificar URL**

```bash
sleep 60
curl -sIL https://pirfectpexel.github.io/camino/ | head -5
```

Expected: `HTTP/2 200`. Si 404, esperar otro minuto o revisar Settings → Pages.

- [ ] **Step 6: Visitar la URL desde el escritorio**

```bash
open https://pirfectpexel.github.io/camino/
```

Expected: la home carga con el hero "EN 1 DÍA · Comienza el Camino". Probar la
navegación: etapas, equipaje, antes, bastones.

---

## Task 17: QA en móvil real (instalación PWA + offline)

- [ ] **Step 1: Abrir la URL en Chrome del móvil**

En el móvil personal, abrir: `https://pirfectpexel.github.io/camino/`

Expected: la home carga, se ve el hero verde, navegación funciona.

- [ ] **Step 2: Instalar la PWA**

- En Chrome Android: menú ⋮ → "Añadir a la pantalla de inicio" → confirmar
- En Safari iOS: botón compartir → "Añadir a pantalla de inicio"

Expected: aparece el icono "Camino" en la pantalla de inicio del móvil.

- [ ] **Step 3: Esperar precarga del SW**

Tras instalar, dejar el navegador abierto 30-60 segundos para que el Service Worker
precargue todos los assets (incluidos tiles en lazy mode al navegar a una etapa con
mapa).

- [ ] **Step 4: Activar modo avión y reabrir**

- Activar modo avión / desactivar wifi y datos
- Cerrar la app del navegador completamente
- Abrir la PWA desde el icono de la pantalla de inicio

Expected: la app abre sin pantalla en blanco. Home funciona. Navegar a una etapa
funciona. Acordeón abre. Si el mapa de esa etapa ya estaba cacheado (por previa visita
con red), se ve; si no, se ve gris (los tiles que no se visitaron antes no están en
caché aún).

- [ ] **Step 5: Test deep links**

Aún en modo avión, abrir directamente: navegar a la app y desde la home pulsar "Dónde
comer" en quick actions. Expected: abre `etapa-N.html` con la sección "Dónde comer"
expandida y scroll hasta ella.

- [ ] **Step 6: Test marcar completada persiste**

Marcar etapa 1 como completada. Cerrar la app. Reabrir. Expected: etapa 1 sigue
marcada. En etapas.html, la barra de progreso muestra ~14% y la etapa 1 aparece
tachada.

- [ ] **Step 7: Verificar tile precache walkthrough**

Con red, abrir cada `etapa-N.html` (1 a 6) y expandir la sección "Durante la etapa"
para que el mapa se inicialice y los tiles visibles se cacheen. Esto "calienta" la
caché para uso offline posterior.

- [ ] **Step 8: Test final completo en modo avión**

Repetir Step 4 después del Step 7. Expected: ahora todos los mapas de las etapas se
ven correctamente sin red.

- [ ] **Step 9: Documentar en README los pasos de instalación previa al viaje**

Añadir al final de `README.md`:

```markdown
## Instalación previa al viaje (importante)

1. Antes del 16 may, abrir https://pirfectpexel.github.io/camino/ en Chrome móvil
2. Menú → "Añadir a pantalla de inicio"
3. Esperar 1 min con la app abierta para que precargue
4. Recorrer cada etapa-N abriendo "Durante la etapa" para cachear los tiles
5. Test final: modo avión + abrir desde el icono. Debe funcionar todo sin red.
```

```bash
cd /Users/cx02795/Downloads/camino
git add README.md
git commit -m "docs: add pre-trip PWA installation steps"
git push origin main
```

---

## Self-Review (post-redacción del plan)

**1. Spec coverage:**

- ✅ §3 Tech stack (vanilla, no framework, Leaflet 1.9, vanilla SW): Tasks 3-15 lo respetan.
- ✅ §4 Estructura del repo: Task 1 + estructura final mostrada arriba.
- ✅ §5.1 Mapping `.md` → `etapa-N.html`: Task 7 lo aplica con el offset (01_tui→0, 02→1, ...).
- ✅ §5.2 Normalización 11 secciones: Task 6 plantilla canónica, Task 7 aplica.
- ✅ §6.1 Home Today-first dinámica: Task 9 implementa con tabla de fechas en JS.
- ✅ §6.2 Timeline: Task 10.
- ✅ §6.3 Acordeón con hash deep links: Task 4 (init en hash) + Task 6 (estructura).
- ✅ §6.4 Equipaje: Task 8.
- ✅ §6.5 Antes (sin vinos): Task 8 + Task 2 explícito.
- ✅ §6.6 Bastones: Task 8.
- ✅ §6.7 404: Task 8.
- ✅ §7 Visual: Task 3 CSS con paleta exacta.
- ✅ §8 JS: Tasks 4 (app.js + tests), 5 (progress.js + tests), 13 (map.js).
- ✅ §9 Mapa offline + GeoJSON: Tasks 11-14.
- ✅ §10 PWA manifest + SW + iconos: Task 15.
- ✅ §11 Out of scope respetado: no billetes, no equipaje interactivo, no notas.
- ✅ §12 Riesgos: Task 14 incluye estimación previa para ajustar zoom; Task 17 valida offline.
- ✅ §13 Criterios de éxito: Task 17 cubre todos.

**2. Placeholder scan:**

- "TBD"/"TODO": ninguno.
- "Add appropriate error handling": no.
- "Similar to Task N": Task 7 dice "Idéntica estructura a etapa-1.html PERO" con cambios explícitos. Aceptable porque la plantilla canónica está totalmente desarrollada en Task 6. ✅

**3. Type/name consistency:**

- `getCurrentStage(now)` retorna `{ stageId, label, daysToStart, nextStageId, isLast }`: usado consistentemente en Task 9 (home), Task 10 (timeline). ✅
- `markCompleted(stageId)` / `unmarkCompleted(stageId)` / `isCompleted(stageId)` / `getCompletedStages()`: usados en Task 5 (definición), Task 10 (lectura). ✅
- `data-etapa` (atributo HTML para id de etapa en mapa): definido en Task 6, leído en Task 13. ✅
- `data-stage-id` (atributo del botón completar): definido en Task 6, leído en Task 5 (`progress.js`). ✅
- `KEY_PREFIX = 'camino:completed:'`: definido en Task 5, exportado y testeado. ✅
- `CACHE_VERSION = 'camino-v1'`: en Task 15. Se documenta en README (Task 1) que hay que bumpearlo si se actualiza. ✅
- Rutas `/camino/...` con prefijo: consistente en CSS, JS imports, manifest, SW. ✅

**4. Riesgos cubiertos por una task:**
- Tiles policy de OSM: Task 14 incluye `--wait` y User-Agent. ✅
- SW no instala en dev: Task 17 valida en device. ✅
- ImageMagick puede no tener emoji color: Task 15 ofrece fallback texto "C". ✅
- GeoJSON oficial puede no estar disponible: Task 12 ofrece Opción B con LineStrings simplificados a mano. ✅
