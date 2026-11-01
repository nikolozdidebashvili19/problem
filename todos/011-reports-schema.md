# T-011 — Reports schema, indexes, shortId, hotScore

Phase 1 · Status: **in-progress** · Depends on: 006, 007

## Steps
1. `src/features/reports/schema/report.schema.ts` per PRODUCT §9: `shortId` (unique, 8 chars), `slug`, `authorId`, `title`, `description`, `categoryId`, `severity?`, `locationIds { region, municipality, neighborhood? }`, `locationMismatch` (pin vs chosen location), `point` (GeoJSON `[lng, lat]`), `addressHint?`, `images [{ publicId, url, width, height }]`, `status`, `upvoteCount`, `hotScore`, `flagCount`, `hidden`, `mergedInto?`, `officialResponses[]`, `fixedAt?`, `daysToFix?`, `idempotencyKey` (unique, sparse), `editHistory[]`.
2. All indexes from PRODUCT §9 (incl. `text` index with `default_language: 'none'`).
3. `src/shared/const/report-status.const.ts`: statuses, `OPEN_STATUSES`, `PUBLIC_STATUSES`, bilingual labels.
4. Pure, tested utils in `src/shared/utils/` (features have no `utils/` folder): `short-id.ts` (nanoid-style, url-safe alphabet), `slugify.ts` (Georgian → Latin transliteration), `hot-score.ts` (`log10(max(v,1)) + (t − 1735689600) / 172800`).
5. Zod `PointSchema` with `[lng, lat]` order test (lng 40–47, lat 41–44 for Georgia).

## AC
- Index list matches PRODUCT §9; `syncIndexes` script documented.
- Georgian titles produce readable Latin slugs.

## Implementation notes (partial)
- Done: schema + all indexes, `report-status.const.ts`, `short-id.ts`, `slugify.ts` (Georgian romanization), `hot-score.ts`, all with specs.
- Category and locations are stored **by slug** (`categorySlug`, `location.{region,municipality,neighborhood}`) instead of ObjectIds — stable, URL-friendly, filterable without joins.
- Open: `syncIndexes` script, zod `PointSchema` usage in the create API (T-013), `editHistory` field (T-027).
