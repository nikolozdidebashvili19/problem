# T-024 — Fixed feed + stats cache

Phase 1 · Status: todo · Depends on: 018, 023

## Steps
1. `src/features/stats/schema/stats-cache.schema.ts`: `{ _id: 'global' | locationSlug, totalFixed, fixedThisMonth, medianDaysToFix, districtLeaderboard[], computedAt }`.
2. `refreshStatsService` (aggregation) — runs from cron and lazily when `computedAt` > 10 min old.
3. `GET /api/stats` reads the cache only.
4. `/fixed` page: before/after cards sorted by `fixedAt` desc, location/category filters, header stats.

## AC (PRODUCT §4.7)
- Stats are never aggregated per page view.
