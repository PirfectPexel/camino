# Camino Portugués PWA — Diseño

**Fecha:** 2026-05-15
**Autor:** Brainstorming session (dagonco + Claude)
**Estado:** Aprobado, listo para implementación

---

## 1. Objetivo

Construir una **PWA estática** que sirva como guía completa para el Camino Portugués (Tui → Santiago, 16-23 mayo 2026). Reemplaza los `.md` y PDFs como interfaz de consulta durante el viaje. **Para uso personal, único peregrino, durante 8 días — luego se archiva.**

La experiencia debe sentirse como **"un agente local te ha preparado el viaje"**: cada pueblo trae sus curiosidades, ruta turística sugerida, dónde comer, miradores, contemplación. Todo accesible desde el móvil, **funcionando sin cobertura en pueblos rurales gallegos**.

## 2. Restricciones

- **Single user:** dagonco. No hay multi-cuenta, sync, sharing.
- **Mobile-first:** se usa exclusivamente desde el móvil durante el viaje.
- **Offline-first:** debe funcionar sin internet una vez instalada (4G falla en muchos tramos rurales del Camino Portugués).
- **Idioma:** español.
- **Vida útil:** ~10 días (16-25 mayo 2026). Tras eso se archiva el repo.
- **Sin alcohol:** ignorar referencias a vinos en el contenido fuente.
- **Hosting:** GitHub Pages bajo `https://pirfectpexel.github.io/camino/`.
- **Resiliencia > sofisticación:** preferir HTML hand-written y JS mínimo a build pipelines o frameworks. Si algo se rompe a mitad del viaje, debe ser fácil de arreglar desde el móvil editando un fichero en GitHub web.

## 3. Stack técnico

| Pieza | Decisión |
|-------|----------|
| Framework | **Ninguno** — vanilla HTML/CSS/JS |
| Build step | **Ninguno** — el HTML se escribe a mano una vez |
| Hosting | GitHub Pages (HTTPS gratuito = requisito PWA) |
| Mapas | Leaflet 1.9 (~40 KB minified) servido localmente |
| Tiles | OpenStreetMap, **descargados al repo** y servidos como recursos estáticos |
| Service Worker | Vanilla, ~40 líneas, estrategia cache-first |
| Iconos UI | Emoji nativos del sistema (🍴 📍 🛏 👁) |
| Fuentes | System fonts (San Francisco / Roboto) — sin descargas externas |
| Iconos PWA | 2 PNGs (192x192 y 512x512) generados a mano |

**Razones para vanilla:**
- Sin dependencias npm que puedan fallar
- Sin build pipeline que pueda romperse
- Editable desde GitHub web UI en el móvil si algo falla durante el viaje
- Tamaño mínimo del bundle = carga instantánea
- Las ventajas de un framework (componentes reutilizables, escalabilidad) son irrelevantes para un proyecto de 10 días

## 4. Estructura del repositorio

```
camino/
├── index.html              ← home (Today-first)
├── etapas.html             ← timeline de las 7 etapas
├── etapa-0.html            ← Llegada Tui (sábado tarde, sin caminata)
├── etapa-1.html            ← Tui → O Porriño (domingo)
├── etapa-2.html            ← O Porriño → Redondela
├── etapa-3.html            ← Redondela → Pontevedra
├── etapa-4.html            ← Pontevedra → Caldas
├── etapa-5.html            ← Caldas → Padrón
├── etapa-6.html            ← Padrón → Santiago (incluye sub-rutas Santiago)
├── equipaje.html
├── antes.html              ← consejos generales (sin vinos)
├── bastones.html
├── 404.html
│
├── css/
│   └── style.css           ← un solo CSS para todo
│
├── js/
│   ├── app.js              ← acordeón + nav + utilidades + getCurrentStage()
│   ├── progress.js         ← localStorage etapas completadas
│   └── map.js              ← bootstrap de Leaflet
│
├── leaflet/
│   ├── leaflet.js          ← v1.9.x descargado
│   └── leaflet.css
│
├── tiles/                  ← OpenStreetMap tiles precargados (~30 MB)
│   └── {z}/{x}/{y}.png     ← estructura estándar Leaflet
│
├── rutas/                  ← GeoJSON con el trayecto de cada etapa caminada
│   ├── etapa-1.geojson     ← Tui → O Porriño
│   ├── etapa-2.geojson     ← Porriño → Redondela
│   ├── etapa-3.geojson     ← Redondela → Pontevedra
│   ├── etapa-4.geojson     ← Pontevedra → Caldas
│   ├── etapa-5.geojson     ← Caldas → Padrón
│   └── etapa-6.geojson     ← Padrón → Santiago
│
├── icons/                  ← iconos PWA
│   ├── icon-192.png
│   └── icon-512.png
│
├── content/                ← .md fuente (NO servidos en runtime, solo archivo)
│   ├── etapas/01_tui.md … 07_padron_santiago.md
│   ├── equipaje.md
│   ├── antes.md
│   └── bastones.md
│
├── scripts/                ← scripts de un solo uso (NO se sirven)
│   └── download-tiles.sh   ← descarga inicial de tiles OSM al directorio /tiles/
│
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service Worker
├── README.md
└── .nojekyll               ← evita procesamiento Jekyll de GitHub Pages

NOTA SOBRE NOMENCLATURA: 7 etapas numeradas 0 a 6.
- Etapa 0 = sábado en Tui (llegada, sin caminata)
- Etapas 1-6 = caminadas, una por día desde domingo a viernes
Tratadas todas como "etapa" para mantener uniformidad. La etapa 0 simplemente no
tiene mapa Leaflet (ver §6.3) ni hora de salida sugerida.
```

## 5. Información del contenido

### 5.1 Origen del contenido

El contenido se vuelca **una vez** desde los `.md` actuales:

- `etapas/01_tui.md` → `etapa-0.html` (Tui llegada, sin caminata)
- `etapas/02_tui_porrino.md` → `etapa-1.html` (Tui → O Porriño, domingo)
- `etapas/03_porrino_redondela.md` → `etapa-2.html` (Porriño → Redondela)
- `etapas/04_redondela_pontevedra.md` → `etapa-3.html` (Redondela → Pontevedra)
- `etapas/05_pontevedra_caldas.md` → `etapa-4.html` (Pontevedra → Caldas)
- `etapas/06_caldas_padron.md` → `etapa-5.html` (Caldas → Padrón)
- `etapas/07_padron_santiago.md` → `etapa-6.html` (Padrón → Santiago, incluye 2 sub-rutas Santiago: viernes tarde + sábado mañana)
- `etapas/00_indice.md` → repartido entre `index.html` (10 momentos imprescindibles) y `antes.html` (consejos generales, **menos vinos**)
- `guia_camino_portugues.md` sección equipaje → `equipaje.html`
- `bastones.md` → `bastones.html`

### 5.2 Inconsistencias del contenido fuente a normalizar

Todas las etapas caminadas (etapa-1 a etapa-6) deben seguir esta estructura de 11 secciones de acordeón, en este orden:

1. **📋 Resumen** — distancia, dificultad, perfil
2. **🥾 Antes de salir** — desayuno, provisiones, hora de salida sugerida
3. **🛤 Durante la etapa** — hitos del trayecto + bares/servicios en ruta + **MAPA Leaflet aquí**
4. **🏛 Al llegar al pueblo** — descripción + contexto histórico
5. **👁 Qué ver** — POIs principales del destino
6. **✨ Curiosidades** — historia local, anécdotas, datos peculiares
7. **🍴 Gastronomía típica** — productos del pueblo, platos a probar (sin vinos)
8. **📍 Ruta recomendada del pueblo** — tabla de paseo turístico paso a paso
9. **🍽 Dónde comer** — restaurantes recomendados con menú peregrino, dirección, precio
10. **🛏 Hotel** — alojamiento de la noche: nombre, dirección, link Booking, teléfono
11. **📸 Fotografía y contemplación** — spots de foto y lugares para parar a respirar

La página `etapa-0.html` (Tui llegada sábado) usa la misma estructura **excepto la sección 3** (no hay etapa caminada → no hay mapa Leaflet) y la sección 2 ("Antes de salir" → omitida o adaptada a "Antes de llegar a Tui: tren desde Vigo").

La página `etapa-6.html` (Padrón → Santiago) añade 2 sub-acordeones DENTRO de "Al llegar al pueblo":
- Ruta Santiago viernes tarde
- Ruta Santiago sábado mañana (con misa del peregrino + botafumeiro)

Eliminar de los `.md` fuente al volcar:
- Sección "Sellar la credencial" (info común → consolidada en `antes.html`)
- Sección "Teléfonos y servicios útiles" (info común → consolidada en `antes.html`)
- Cualquier referencia a vinos / alcohol

Etapa especial: `etapa-6.html` (Padrón → Santiago) mantiene sus dos sub-rutas (viernes tarde + sábado mañana con misa del peregrino) como sub-acordeones dentro de la sección 4 "Al llegar al pueblo".

## 6. Arquitectura de páginas

### 6.1 `index.html` — Home (Today-first)

**Comportamiento dinámico:** al cargar, JS calcula la fecha actual y determina cuál es la "etapa de hoy" y "etapa próxima" comparando con el calendario:

| Fecha real | Etapa "hoy" | Etapa "próxima" |
|------------|-------------|------------------|
| Antes 16 may | "Comienza en X días" | Etapa 0 (Tui llegada) |
| Sáb 16 may | Etapa 0 (Tui) | Etapa 1 (Tui→Porriño) |
| Dom 17 may | Etapa 1 | Etapa 2 |
| Lun 18 may | Etapa 2 | Etapa 3 |
| Mar 19 may | Etapa 3 | Etapa 4 |
| Mié 20 may | Etapa 4 | Etapa 5 |
| Jue 21 may | Etapa 5 | Etapa 6 |
| Vie 22 may | Etapa 6 (a Santiago) | "¡Has llegado!" |
| Sáb 23 may | "Santiago + vuelta a casa" | — |
| Después 23 may | "Buen Camino completado" | — |

**Layout:**
- Header verde gradient con título "Camino Portugués"
- Hero card: badge "HOY", título de la etapa, km (si aplica), fecha, hora de salida sugerida (si aplica)
- 4 quick actions en grid 2x2: **Ruta y mapa**, **Dónde comer**, **Hotel de hoy**, **Qué ver**
- Cada quick action es un deep-link a la sección correspondiente del acordeón:
  - Ruta y mapa → `etapa-N.html#durante` (sección 3, donde está el mapa)
  - Dónde comer → `etapa-N.html#comer` (sección 9)
  - Hotel de hoy → `etapa-N.html#hotel` (sección 10)
  - Qué ver → `etapa-N.html#ver` (sección 5)
- Card "PRÓXIMA": resumen mini de la siguiente etapa (lectura desde su HTML o hard-coded)
- Footer nav: Etapas · Equipaje · Antes · Bastones

**Nota:** si la etapa actual es 0 (Tui sábado llegada), el quick action "Ruta y mapa" enlaza a la ruta turística por el pueblo (sección 8 "Ruta recomendada del pueblo") porque no hay etapa caminada que mapear.

### 6.2 `etapas.html` — Timeline

Lista de las 7 etapas (0 a 6):
- Cada item: número (0 a 6), fecha, tramo, km (la etapa 0 muestra "—" en km)
- La etapa 0 lleva un sub-label "Llegada" para distinguirla visualmente del resto
- Visual: completadas tachadas (lectura desde localStorage), actual destacada con badge "HOY", futuras opacas
- Tap en cualquier etapa abre `etapa-N.html`
- Barra de progreso superior: "X de 7 etapas completadas"

### 6.3 `etapa-N.html` — Detalle (acordeón)

Cubre las 7 etapas (`etapa-0.html` a `etapa-6.html`).

**Layout:**
- Topbar: ← back + título de la etapa
- Hero card: badge (etapa N · HOY/PRÓXIMA/COMPLETADA), título tramo, km (si aplica), fecha
- Acordeón con las 11 secciones definidas en 5.2 (todas colapsadas por defecto, salvo la indicada en el hash de la URL)
- Botón inferior: **"Marcar como completada"** (toggle, persiste en localStorage)
- Hash deep-linking soportado para todas las secciones:

| Hash | Sección |
|------|---------|
| `#resumen` | 1. Resumen |
| `#antes` | 2. Antes de salir |
| `#durante` | 3. Durante la etapa (con mapa) |
| `#llegar` | 4. Al llegar al pueblo |
| `#ver` | 5. Qué ver |
| `#curiosidades` | 6. Curiosidades |
| `#gastronomia` | 7. Gastronomía típica |
| `#ruta-pueblo` | 8. Ruta recomendada del pueblo |
| `#comer` | 9. Dónde comer |
| `#hotel` | 10. Hotel |
| `#fotos` | 11. Fotografía y contemplación |

### 6.4 `equipaje.html`

Lista de equipaje extraída de `guia_camino_portugues.md`. Renderizada como secciones por categoría (Grandes / Ropa caminar / Ropa tardes / Para dormir / Higiene / Botiquín / Hidratación / Electrónica / Documentación / Varios / Neceser de baño). **Sin checkboxes interactivos** — solo lectura. Items ya marcados con [x] aparecen tachados con check verde, [ ] aparecen como pendientes.

### 6.5 `antes.html` — Consejos generales

Una sola página con secciones:
- Vocabulario gallego básico
- Horarios gallegos (comida 13:30-15:30, cena 20:30-22:30)
- Menú del peregrino
- Credencial del peregrino (cómo, dónde, cuándos sellos)
- Aviso de estafas
- Agua del grifo, propinas
- Teléfonos importantes (112, Cruz Roja, Oficina del Peregrino)
- Apps recomendadas
- Supermercados (Gadis/Froiz cierran domingos)

**Sin sección de vinos.**

### 6.6 `bastones.html`

Contenido de `bastones.md` tal cual: cómo regular altura, técnica de uso, ajustes según terreno, errores comunes. Tabla referencia.

### 6.7 `404.html`

Página 404 simple consistente con el resto del diseño.

## 7. Diseño visual

**Mood: Naturaleza gallega.** Validado en mockup `visual-mood.html`.

### Paleta

```
Verde Camino oscuro    #2c5f3d   (header, CTAs primarios)
Verde Camino medio     #5a8d6e   (gradients, hover)
Verde claro            #f0f4ed   (fondos de sección suaves)
Dorado peregrino       #c89a3c   (badges "HOY", acentos)
Crema fondo            #f5f7f4   (background general)
Texto principal        #1d2e1f
Texto secundario       #5a6e5c
Texto deshabilitado    #999
Borde sutil            #e0e0e0
```

### Tipografía

- Sistema: `-apple-system, system-ui, "Segoe UI", Roboto, sans-serif`
- Tamaños base:
  - Body: 14-15px
  - Títulos H3 (etapa): 18-20px
  - Labels uppercase: 10-11px tracked

### Componentes

- **Cards:** background blanco, `border-radius: 12px`, `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`
- **Hero card del día:** gradient verde, esquina dorada con badge
- **Acordeón:** items full-width, header con flecha rotativa, body con padding interno
- **Quick action:** background `#f0f4ed`, color verde oscuro, emoji + texto, padding generoso
- **Botones primarios:** background verde oscuro, texto blanco, sin border-radius extremo

### Iconos

Emoji nativos del sistema: 🍴 (comer), 📍 (ruta), 🛏 (hotel), 👁 (ver), 📸 (fotos), 🥾 (caminar), 🛤 (durante etapa), 🏛 (al llegar), ✨ (curiosidades), 📋 (resumen), 🦯 (bastones), 🎒 (equipaje).

## 8. Funcionalidad JavaScript

JS estrictamente mínimo. Las páginas son legibles **sin JS** (graceful degradation).

### 8.1 `app.js`

- **Acordeón:** `toggleSection(headerEl)` — añade/quita clase `.open` al item, animación CSS
- **Nav inicial al hash:** si la URL tiene `#comer` u otro, abrir esa sección y scroll
- **Detección de etapa actual:** `getCurrentStage()` — devuelve número de etapa según `Date.now()`

### 8.2 `progress.js`

- `markCompleted(stageId)` → guarda `camino:completed:N` en localStorage
- `unmarkCompleted(stageId)` → elimina la entrada
- `getCompletedStages()` → array de IDs completadas
- Aplicado en `etapa-N.html` (botón) y leído en `etapas.html` y `index.html` (visualización)

### 8.3 `map.js`

- Inicializa Leaflet sobre el div `#mapa`
- Tile layer apuntando a `/tiles/{z}/{x}/{y}.png` (recursos locales)
- Carga el GeoJSON de la etapa correspondiente y lo dibuja como polyline dorada
- Marcadores en pueblos clave del trayecto
- Zoom inicial ajustado a `bounds` del trayecto
- Solo se inicializa cuando la sección "Durante la etapa" se expande (lazy init para ahorrar batería)

## 9. Mapa offline (Leaflet + tiles)

### Estrategia de tiles

- **Servidor:** ninguno. Los tiles viven en el repo bajo `/tiles/{z}/{x}/{y}.png`.
- **Bounding box del corredor:**
  - Sur: 42.04° N (Tui)
  - Norte: 42.90° N (Santiago)
  - Oeste: -8.70° W
  - Este: -8.30° W
- **Niveles de zoom:** 11 a 15 (vista regional a vista calle peatonal).
- **Estimación tiles:** ~1500-2500 archivos PNG ≈ 25-35 MB total.

### Generación de tiles

Script puntual `scripts/download-tiles.sh` (ejecutado **una sola vez** al construir el repo):
- Usa `wget` o `curl` con la URL pública de tiles OSM (`tile.openstreetmap.org`)
- Respeta la [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) — descarga lenta con `--wait=1`, User-Agent identificable
- Atribución de OSM mostrada en el mapa (requisito legal)

### GeoJSON de rutas

Archivos en `/rutas/etapa-N.geojson` con el trayecto de cada etapa **caminada** (1 a 6) como `LineString`. La etapa 0 (Tui llegada) no tiene GeoJSON porque no hay caminata. Origen: trazado oficial del Camino Portugués (descargable de Wikiloc o WikiVoyage). **Una sola vez al inicio.**

## 10. PWA y estrategia offline

### `manifest.json`

```json
{
  "name": "Camino Portugués",
  "short_name": "Camino",
  "start_url": "/camino/",
  "scope": "/camino/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#2c5f3d",
  "theme_color": "#2c5f3d",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### `sw.js`

- **Versionado por constante:** `const CACHE = 'camino-v1'`. Bump manual cuando cambie contenido.
- **Pre-cache exhaustivo:** todos los HTMLs, CSS, JS, JSON, GeoJSON, todos los tiles, iconos.
- **Estrategia fetch:** cache-first con fallback a red. Si el recurso no está en caché y no hay red, devuelve `404.html`.
- **Limpieza:** en `activate`, borra cachés con nombre distinto al actual.

### Instalación esperada por el usuario

1. Antes del 16 may, abrir en Chrome móvil: `https://pirfectpexel.github.io/camino/`
2. Chrome ofrece "Instalar app" (porque hay manifest + SW + HTTPS)
3. Aceptar instalación
4. Service worker descarga **todo** (~35 MB)
5. Confirmar offline: activar modo avión, abrir la app desde el icono → debe funcionar idéntica
6. **Antes del viaje:** abrir 1 vez la app desde el icono para confirmar que arranca sin red

### Actualizaciones durante el viaje

Si hay cobertura y se hace un push al repo:
- El SW detecta cambio en `sw.js` (por el bump de versión) en la siguiente carga
- Re-cachea
- Próxima vez que se abre la app, contenido actualizado

Si no hay cobertura → sigue funcionando con la versión cacheada.

## 11. Fuera de scope (decisión explícita)

Lo siguiente NO se implementa:

- ❌ **Billetes de tren / QR.** Se gestionan con la app de Renfe + Apple Wallet del usuario directamente. Los PDFs no se incluyen en la PWA.
- ❌ **Checklist interactivo de equipaje.** La página de equipaje es solo lectura.
- ❌ **Notas durante el viaje.** Sin formularios.
- ❌ **Fotos del usuario.** No hay upload, gallery propia.
- ❌ **Sync entre dispositivos.** Single device, single user.
- ❌ **Multi-idioma.** Solo español.
- ❌ **Modo oscuro.** Una sola paleta clara (se camina de día).
- ❌ **Vinos / alcohol.** El usuario no consume.
- ❌ **Compartir progreso en redes.** Privado.
- ❌ **Notificaciones push.** No aporta nada relevante para este caso.

## 12. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|:-:|:-:|---|
| Service Worker no instala / no cachea bien | Baja | Alta | Test manual antes del viaje. Modo avión + abrir app. Si falla, fallback es Chrome con caché normal — sigue funcionando con la mayoría del contenido. |
| Tiles del mapa pesan demasiado para la SD del móvil | Muy baja | Media | Estimación 35 MB. Cualquier móvil moderno tiene > 32 GB libres. Si hay problema, reducir zoom máximo a 14 (1/4 del peso). |
| GitHub Pages cae durante la instalación | Muy baja | Alta | Ya está cacheado tras primera carga. Si la PWA está instalada, no depende de GitHub Pages. |
| Bug en JS rompe una página durante el viaje | Baja | Media | HTMLs son legibles sin JS (graceful degradation). Acordeón se ve abierto, mapa no aparece, resto OK. Editable desde GitHub web en el móvil. |
| OSM bloquea descarga masiva de tiles | Media | Baja | Hacer descarga durante días previos con `wait` + User-Agent identificable. Si bloquean, usar tiles alternativos (Stamen, CartoDB Voyager). |
| Bateria del móvil con uso intenso de la app + Leaflet | Media | Media | Map se inicializa lazy (solo al expandir sección). Sin polling, sin animaciones en background. |
| Cambia el contenido y olvido bumpear `CACHE` | Media | Baja | Comentario destacado en `sw.js`. Documentar en README. |

## 13. Criterios de éxito

- ✅ Instalación PWA antes del 16 may funciona en el móvil del usuario (iPhone o Android)
- ✅ Modo avión + abrir app → contenido completo accesible
- ✅ Cada etapa caminada (1 a 6) tiene mapa visible con la ruta dibujada
- ✅ "Marcar como completada" persiste tras cerrar la app
- ✅ Quick actions de la home llevan a la sección correcta del acordeón
- ✅ Desde el móvil se puede editar un HTML en GitHub web y ver el cambio tras refresh con cobertura
- ✅ Tiempo de carga inicial de cualquier página < 200ms una vez instalada (lectura local)

## 14. Calendario de implementación sugerido

Dado que el viaje empieza **el 16 mayo (mañana en el momento de escribir esto, 15 mayo 2026)**: la implementación debería completarse **HOY**.

Plan de plan (a detallar en la fase `writing-plans`):

1. Setup repo + estructura básica
2. Generar HTMLs de etapas a partir de `.md` fuente
3. Páginas auxiliares (equipaje, antes, bastones, 404)
4. Home (Today-first) con lógica de fecha
5. Timeline (etapas.html) con localStorage
6. Estilos: paleta verde + dorado, acordeón, cards
7. Leaflet + GeoJSON rutas + descarga tiles OSM
8. PWA: manifest + service worker + iconos
9. Deploy a GitHub Pages, test instalación PWA en móvil real
10. QA: modo avión, deep links, marcar completadas
