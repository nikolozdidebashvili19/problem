# T-018 — Feed API: tabs, filters, cursor pagination

Phase 1 · Status: **in-progress** · Depends on: 011

## Steps
1. `FeedQuerySchema`: `tab (trending|top|new|near)`, `region`, `municipality`, `neighborhood`, `category`, `status (open|all|<status>)`, `period (7d|30d|all)`, `hasOfficialResponse`, `after` cursor, `lat/lng` for near.
2. Cursor encoding per tab: `<sortValue>_<_id>`; queries use `{ $or: [{ sort < v }, { sort = v, _id < id }] }`. **Never `skip`.** Page size 20.
3. `GET /api/reports` public, IP rate limit, response cacheable (`revalidate: 30`).
4. Near tab → `$geoNear` with distance cursor.
5. Repository returns cards only (no description body) to keep payloads small.
6. Verify each tab query uses an index from PRODUCT §9 (`explain()`), note results in the PR.

## AC (PRODUCT §8)
- Filters combine with AND and are reflected in the URL.
- Hidden / duplicate / rejected / removed never appear.

## Implementation notes (partial)
- Done: `GET /api/reports` with tabs `popular | new | fixed`, `category`, `location` (matches any level), `q` (`$text`), keyset cursor, page size 20, viewer vote state.
- The brief's three feeds map to: Popular = Trending (hotScore), Newest = New, Fixed = Fixed feed.
- Open: Near-me tab, `status`/`period`/`hasOfficialResponse` filters, IP rate limit (T-008), `explain()` check.
