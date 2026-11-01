# T-032 — Error, removed, 404 pages + empty states

Phase 1 · Status: todo · Depends on: 001

## Steps
1. `not-found.tsx`, `error.tsx`, `global-error.tsx` at app root.
2. `RemovedReport` component (reason category, link back to feed).
3. Offline page (used by PWA in T-036).
4. Empty states for: feed with filters, district with no reports, Fixed feed, profile with no reports.

## AC (PRODUCT §20)
- No raw 500 for removed reports; all empty states have a CTA.
