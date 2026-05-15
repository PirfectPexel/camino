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
    maxZoom: 14,
    attribution: '© OpenStreetMap',
    errorTileUrl: '/camino/leaflet/images/marker-shadow.png'
  }).addTo(map);

  // Cargar GeoJSON de la ruta
  try {
    const res = await fetch(`/camino/rutas/etapa-${etapa}.geojson`);
    const gj = await res.json();
    const layer = L.geoJSON(gj, {
      style: () => ({
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
    map.setView([42.5, -8.5], 11);
  }
};
