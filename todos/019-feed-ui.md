# T-019 — Feed UI

Phase 1 · Status: **in-progress** · Depends on: 001, 009, 018

## Steps
1. Home `/` = main feed. Tabs Trending/Top/New/Near me (Map tab in T-035).
2. `FeedFilters` (location cascade, category, status, period) synced to URL search params.
3. `ReportCard`: fixed aspect ratio thumbnail (no CLS), title, category, neighborhood, status badge, upvote button, relative time (client-only).
4. Infinite scroll with "Load more" fallback; cursor + scroll position kept in URL state for back navigation.
5. Designed empty state: "Be the first to report" CTA.

## AC (PRODUCT §16)
- Feed JS < 200 KB gzipped (map not loaded on the feed).
- Guests can browse and filter.

## Implementation notes (partial)
- Done: app shell (sticky header with search, left sidebar with feeds / Tbilisi districts / categories, mobile slide-in drawer, about + 112 rail on xl), feed tabs, active filter chips, report cards, "Load more" pagination, empty / error / loading states.
- Cards are not links yet — the detail page is T-017.
- Open: status/period filters UI, scroll restoration, mobile bottom nav (add once Report / Map / Profile pages exist).
- UI strings are English until T-009 (i18n) moves them to message files.
- Dev preview without the report form: as admin, `POST /api/admin/seed` `{ "targets": ["categories", "locations", "demo-reports"] }` (demo seed refused in production).
