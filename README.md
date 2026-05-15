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

Push a `main` → GitHub Pages despliega automáticamente (~30s).

Tras editar contenido, recordar bumpear la constante `CACHE_VERSION` en `sw.js` para
que el service worker invalide la caché en el siguiente acceso con cobertura.

## Instalación previa al viaje (importante)

Hay que hacer esto **antes del 16 may** (idealmente la noche del 15 may con WiFi):

1. Abre en Chrome del móvil: https://pirfectpexel.github.io/camino/
2. Menú ⋮ del navegador → **"Añadir a pantalla de inicio"** (Android)
   o botón compartir → **"Añadir a pantalla de inicio"** (iOS Safari)
3. Confirma la instalación. Aparece icono "Camino" en la home del móvil
4. **Espera 60 segundos con la app abierta** para que el service worker precargue
   todos los HTML, CSS, JS, manifest, iconos, GeoJSON
5. Para precargar también los tiles del mapa (no se cachean automáticamente al
   instalar — solo al primer fetch):
   - Abre la app desde el icono
   - Entra en **Etapas → cada etapa (1 a 6) → expande "Durante la etapa"**
   - El mapa se inicializa y los tiles visibles se cachean
6. **Test final:** activa modo avión, cierra el navegador, abre la PWA desde el
   icono. Si todo el contenido y los mapas funcionan sin red, está lista para
   acompañarte 8 días sin cobertura.

## Tests

```bash
node --test tests/app.test.js tests/progress.test.js
```

(12 tests: getCurrentStage para 6 fechas + localStorage progress para 6 casos)

