# T-013 — Create report API

Phase 1 · Status: **done** · Depends on: 011, 012, 008

## Steps
1. `CreateReportSchema` in `src/features/reports/validations/report.validation.ts` (PRODUCT §4.2 field rules: title 5–80, description 10–1000 plain text, 1–4 images by `publicId`, category slug, location slugs, point, addressHint ≤ 120, severity, idempotencyKey uuid). Strip HTML on save.
2. `POST /api/reports`: `requireUser` → `rateLimit('report')` → `validateBody` → `createReportService`.
3. Service:
   - Idempotency: existing report with the same key → return it (200), don't create.
   - New-account rule (< 24h old → max 2/day).
   - Point inside Georgia; location not `reportingDisabled`; category active.
   - `resolvePointService` vs chosen location → set `locationMismatch` (flag for review).
   - Verify every `publicId` belongs to our folder; remove `pending` tag.
   - Generate `shortId`, `slug`, initial `hotScore`, `status: reported`, `upvoteCount: 0`.
   - Create `statusEvents` entry (`from: null → reported`), `$inc` author `reportsCount`.
4. Response: `{ shortId, slug }` → client navigates to `/r/{shortId}/{slug}`.

## AC (PRODUCT §4.2)
- Double submit with the same idempotency key creates exactly one report.
- Pins outside Georgia → 400.

## Implementation notes
- `POST /api/reports` → `createReportService`: idempotency key, 5 reports/hour + new-account 2/day (DB counts, no Redis yet), photo rules, active category, location chain (`getLocationChainService`), occupied-territory and Georgia-bbox checks, point = GPS or the chosen location's centroid, status event, `reportsCount` increment.
- Location mismatch flagging and Turnstile are still open (T-007 boundaries, T-031).
