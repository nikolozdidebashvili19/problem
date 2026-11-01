# T-015 — Map component (Leaflet)

Phase 1 · Status: todo · Depends on: 001

## Steps
1. `npm i leaflet react-leaflet` (+ `@types/leaflet`). Env `NEXT_PUBLIC_MAP_TILE_URL` (MapTiler/Stadia key in prod; OSM only in dev).
2. `src/shared/components/map/` — `MapPicker` (draggable pin, "Use my location", address search via Nominatim with 1 req/s debounce + User-Agent), `MapPreview` (static small map on report page).
3. Load with `next/dynamic(..., { ssr: false })`.
4. Import marker icons explicitly and set `L.Icon.Default` (avoid prod 404s).
5. Geolocation denied → fallback to the selected municipality centroid.

## AC (PRODUCT §12.4)
- No `window is not defined` on SSR; markers render in production build.
