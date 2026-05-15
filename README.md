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
