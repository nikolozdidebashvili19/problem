# T-014 — Duplicate / nearby check API

Phase 1 · Status: todo · Depends on: 011

## Steps
1. `GET /api/reports/nearby?lat&lng&category` (public, IP rate limit).
2. Repository `findNearby(point, categoryId, maxMeters = 50)` using `$near` on `point`, open statuses only, not hidden, limit 5.
3. Return lightweight cards (shortId, slug, title, thumbnail, upvoteCount, status).

## AC (PRODUCT §4.9)
- Same-category open reports within 50 m are returned; the create flow shows "Is this the same problem? Upvote it instead."
