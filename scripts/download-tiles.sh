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

ZOOMS="11 12 13 14"

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
      sleep 0.3
    done
  done
done

echo ""
echo "Tiles total: $total · Descargados: $downloaded · Skipped (cache): $skipped · Failed: $failed"
echo "Tamaño total:"
du -sh "$DEST"
