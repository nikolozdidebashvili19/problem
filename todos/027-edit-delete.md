# T-027 — Edit / delete own report

Phase 1 · Status: **done** · Depends on: 013, 021

## Steps
1. `PATCH /api/reports/[shortId]`: author within 24h **and** before the first status change, or moderator. Save previous values to `editHistory`. Regenerate slug (old links still resolve by shortId).
2. `DELETE /api/reports/[shortId]`: soft delete → `hidden: true`, `status: removed` via `changeStatusService`.
3. Edit page reuses the create-flow form components.

## AC (PRODUCT §10, §12.3)
- Popular reports can't be edited into something else after the window.

## Implementation notes
- `PATCH /api/reports/[shortId]` (author while status is `reported`, moderators always): title, description, category, address hint, severity; previous version pushed to `editHistory`; slug regenerated.
- `DELETE /api/reports/[shortId]` (author or moderator): soft delete (`hidden`, `removed`) + status event. Inline confirm on the report page.
- Location and photos are not editable after publishing.
