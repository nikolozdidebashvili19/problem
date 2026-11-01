# T-033 — Cron jobs

Phase 1.5 · Status: todo · Depends on: 023, 024, 012

## Steps
1. `src/shared/middleware/require-cron.ts`: checks `Authorization: Bearer ${CRON_SECRET}`.
2. `/api/cron/fix-claims` — auto-resolve claims older than 72h (T-023 rules).
3. `/api/cron/stats` — refresh stats cache.
4. `/api/cron/orphan-images` — delete Cloudinary assets tagged `pending` older than 24h.
5. `/api/cron/reconcile-votes` (weekly) — recompute `upvoteCount` from votes.
6. Schedule: Vercel Cron (Hobby = daily) or a GitHub Actions workflow hitting the endpoints.

## AC
- Cron endpoints without the secret return 401.
