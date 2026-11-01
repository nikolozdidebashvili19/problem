# T-020 — Upvotes

Phase 1 · Status: **in-progress** · Depends on: 011, 005, 008

## Steps
1. `src/features/votes/schema/vote.schema.ts`: `{ userId, reportId }`, unique compound index.
2. `POST /api/reports/[shortId]/vote` (toggle): `requireUser` → `rateLimit('vote')` → service.
3. Service (transaction): reject author's own report; reject when status is `fixed`/removed/hidden (count frozen); insert or delete vote; `$inc upvoteCount`; recompute `hotScore`. Duplicate-key error → treat as already voted (no-op).
4. Account age < 24h: vote recorded but does not count toward ranking (store `counts: false`) — PRODUCT §12.3.
5. `GET /api/reports/votes?ids=` → which of the listed reports the current user voted on.
6. `useToggleVote` hook: optimistic update with rollback; guests → sign-in with `callbackUrl` + pending vote applied after login.

## AC (PRODUCT §4.4)
- One vote per user per report; double tap does not double count.
- Authors start at 0 and cannot upvote their own report.

## Implementation notes (partial)
- Done: `votes` collection with unique `(userId, reportId)`, `POST /api/reports/[shortId]/vote` with body `{ voted: boolean }` (sets desired state, so double taps are idempotent), atomic `upvoteCount` + `hotScore` recompute in one pipeline update, own-report and closed-status rules, optimistic `useUpvote` hook with rollback, guests redirected to sign-in.
- No multi-document transaction (works on standalone Mongo); weekly reconciliation in T-033 covers drift.
- Open: rate limit 60/min (T-008), new-account votes not counting toward ranking, applying the pending vote after sign-in.
