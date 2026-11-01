# T-007 — Locations feature + seed + point resolve

Phase 0 · Status: **done** · Depends on: 003, 005

## Goal
Region → municipality/district → neighborhood hierarchy with geo lookup (PRODUCT §6).

## Steps
1. `src/features/locations/schema/location.schema.ts`: `slug` (unique), `nameKa`, `nameEn`, `level: region|municipality|neighborhood`, `parentSlug`, `boundary` (GeoJSON Polygon/MultiPolygon, optional until imported), `centroid` (Point `[lng, lat]`), `reportingDisabled` (occupied territories). Indexes: `boundary: 2dsphere` (sparse), `centroid: 2dsphere`, `parentSlug`.
2. Seed constants `src/shared/const/locations.const.ts`: 12 top-level units (Tbilisi, 9 regions, 2 autonomous republics), Tbilisi's 10 districts with centroids, starter Tbilisi neighborhoods (Dighomi Massive, Vake Park area, Bagebi, Nutsubidze Plateau, Varketili, ...).
3. Georgia bounding box + `isInsideGeorgiaBBox(lng, lat)` (coarse pre-check; polygon check once boundaries are imported).
4. Repository: `findByParent`, `findRoots`, `findContaining(point)` (`$geoIntersects`), `findNearestByCentroid(point, level)`, `upsertBySlug`.
5. Service: `listLocationsService(parent?)`, `resolvePointService(lng, lat)` → `{ region, municipality, neighborhood }`; falls back to nearest centroid while boundaries are missing.
6. Routes: `GET /api/locations?parent=`, `GET /api/locations/resolve?lat&lng`, `POST /api/admin/seed` (admin).
7. Follow-up (separate PR): import OSM admin boundaries (Overpass export → GeoJSON) for Tbilisi districts.

## AC
- Coordinates are `[lng, lat]` everywhere — validated by zod with a test.
- Points outside Georgia are rejected with 400 `OUTSIDE_GEORGIA`.
- Occupied territories appear in the hierarchy with `reportingDisabled: true`.

## Implementation notes
- Steps 1–6 done. **Step 7 (OSM boundary import) is still open** — until then resolution uses the nearest-centroid fallback (`source: 'centroid'` in the response).
- Parent references use `parentSlug` instead of `parentId`, so the seed is order-independent and idempotent.
- Neighborhood → district assignments in `locations.const.ts` are starter data; verify against OSM (e.g. Dighomi Massive follows PRODUCT §6's example under Saburtalo).
- Tskhinvali region is not a separate admin unit in the seed (it falls under Shida Kartli); decide handling with PRODUCT §21 Q3.
- Seed: `POST /api/admin/seed` `{ "targets": ["categories", "locations"] }` as an admin.
