// sw.js — Service Worker del Camino Portugués PWA
// Estrategia: cache-first con fallback a red.
// IMPORTANTE: bumpear CACHE_VERSION cada vez que cambies contenido para forzar update.

const CACHE_VERSION = 'camino-v8';
const SCOPE = '/camino';

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
  `${SCOPE}/pueblo-ribadelouro.html`,
  `${SCOPE}/pueblo-orbenlle.html`,
  `${SCOPE}/pueblo-mos.html`,
  `${SCOPE}/pueblo-saxamonde.html`,
  `${SCOPE}/pueblo-cesantes.html`,
  `${SCOPE}/pueblo-arcade.html`,
  `${SCOPE}/pueblo-ponte-sampaio.html`,
  `${SCOPE}/pueblo-san-amaro.html`,
  `${SCOPE}/pueblo-briallos.html`,
  `${SCOPE}/pueblo-carracedo.html`,
  `${SCOPE}/pueblo-pontecesures.html`,
  `${SCOPE}/pueblo-a-escravitude.html`,
  `${SCOPE}/pueblo-picarana.html`,
  `${SCOPE}/pueblo-teo.html`,
  `${SCOPE}/pueblo-o-milladoiro.html`,
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
  // Imágenes de POIs (Wikimedia Commons, descargadas localmente)
  `${SCOPE}/img/catedral-tui.jpg`,
  `${SCOPE}/img/puente-internacional.jpg`,
  `${SCOPE}/img/porrino-concello.jpg`,
  `${SCOPE}/img/redondela-iglesia.jpg`,
  `${SCOPE}/img/mos-pazo.jpg`,
  `${SCOPE}/img/santo-domingo-pontevedra.jpg`,
  `${SCOPE}/img/pontevedra-alameda.jpg`,
  `${SCOPE}/img/arcade-estatua.jpg`,
  `${SCOPE}/img/caldas-santa-maria.jpg`,
  `${SCOPE}/img/padron-iglesia-santiago.jpg`,
  `${SCOPE}/img/catedral-santiago.jpg`,
  `${SCOPE}/img/obradoiro.jpg`,
  `${SCOPE}/img/milladoiro.jpg`,
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
      await cache.addAll(PRECACHE_URLS);
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

  if (!url.pathname.startsWith(SCOPE + '/') && url.pathname !== SCOPE) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const fresh = await fetch(event.request);
      if (fresh.ok && (url.pathname.startsWith(SCOPE + '/tiles/') ||
                       url.pathname.startsWith(SCOPE + '/rutas/'))) {
        cache.put(event.request, fresh.clone());
      }
      return fresh;
    } catch (e) {
      const fallback = await cache.match(`${SCOPE}/404.html`);
      return fallback || new Response('Offline y sin caché', { status: 503 });
    }
  })());
});
