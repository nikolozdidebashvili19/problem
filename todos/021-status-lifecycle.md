# T-021 — Status lifecycle + status events

Phase 1 · Status: **in-progress** · Depends on: 011

## Steps
1. `ALLOWED_TRANSITIONS` map in `src/shared/const/report-status.const.ts` exactly per PRODUCT §5 diagram, plus who may perform each (system / citizen-with-photo / moderator).
2. `src/features/reports/schema/status-event.schema.ts`: `{ reportId, actorId, from, to, note?, evidenceImages? }`.
3. Service `changeStatusService(report, to, actor, note?, evidence?)` — single entry point; validates transition (400 `INVALID_TRANSITION`), writes event, sets `fixedAt`/`daysToFix` when → fixed.
4. `POST /api/reports/[shortId]/status` (moderator).
5. Exhaustive unit tests for the transition map.

## AC
- Any transition not in the map returns 400.
- Every status change creates a status event.

## Implementation notes (partial)
- `statusEvents` collection is live and written on create / fixed / removed; timeline shown on the report page.
- Open: `ALLOWED_TRANSITIONS` map + moderator `setStatus` endpoint.
