# T-006 — Categories feature + seed

Phase 0 · Status: **done** · Depends on: 003

## Goal
Categories live in the DB, bilingual, with an `active` flag (PRODUCT §7).

## Steps
1. `src/features/categories/schema/category.schema.ts`: `slug` (unique), `nameKa`, `nameEn`, `icon` (lucide name), `order`, `active`.
2. `repository/category.repository.ts`: `findActive`, `findBySlug`, `findById`, `upsertBySlug`.
3. `service/category.service.ts`: `listCategoriesService`, `seedCategoriesService`.
4. Seed data (14 categories) in `src/shared/const/categories.const.ts`.
5. `GET /api/categories` (public, active only, sorted by `order`).
6. Seed is idempotent (upsert by slug); run via `POST /api/admin/seed` (admin only) — see T-007.

## AC
- Retired categories (`active: false`) are hidden from pickers but old reports still resolve them.

## Implementation notes
- `GET /api/categories` is `force-dynamic` with a `Cache-Control: s-maxage=300` header — a static `revalidate` would make `next build` query the DB.
