# T-023 — Fix claims + verification + reopen

Phase 1 · Status: **in-progress** · Depends on: 012, 021

## Steps
1. `src/features/fix-claims/schema/fix-claim.schema.ts`: `reportId`, `claimantId`, `images[]`, `note?`, `previousStatus`, `state: pending|approved|rejected`, `confirmations[]`, `disputes[]`, `resolvedAt?`, `resolvedBy?`.
2. `POST /api/reports/[shortId]/fix-claims` (citizen, ≥1 photo): one pending claim per report; if photo GPS > 150 m from the pin → reject; status → `fix_pending`.
3. `POST /api/fix-claims/[id]/respond` `{ action: confirm|dispute }`: not the claimant, one response per user.
4. Resolution rules (pure function `evaluateFixClaim`, fully tested):
   - author claimed/confirmed and 0 disputes after 72h → fixed (cron, T-033);
   - ≥3 confirmations from distinct non-claimants and confirmations − disputes ≥ 3 → fixed;
   - disputes ≥ 3 → back to `previousStatus`.
5. Moderator approve/reject: `POST /api/fix-claims/[id]/moderate`.
6. Reopen: `POST /api/reports/[shortId]/reopen` with photo, only from `fixed` → `reopened`.

## AC (PRODUCT §4.6)
- Claimant can't confirm their own claim; one confirm-or-dispute per user.
- `fixedAt` and `daysToFix` stored.

## Implementation notes (partial — simplified by owner request)
- Done: the **author (or a moderator) marks a report fixed** — `POST /api/reports/[shortId]/fixed` with optional note and "after" photos (required once uploads are on) → `fixed`, `fixedAt`, `daysToFix`, `fixEvidence`, status event, voters notified.
- Open: community fix claims (any citizen), confirm/dispute, 72h auto-resolution, reopen.
