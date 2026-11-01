# T-029 — Search

Phase 1 · Status: todo · Depends on: 018

## Steps
1. `q` param on `GET /api/reports` → `$text` search (index created in T-011 with `default_language: 'none'`), sorted by text score, combinable with filters.
2. Search box in the feed header; debounced (`use-debounce`).
3. Note: exact-word matching only for Georgian — Atlas Search is Phase 2.

## AC (PRODUCT §4.12)
- Searching a Georgian word returns reports containing that exact word.
