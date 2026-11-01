# T-005 — Server-side auth guards

Phase 0 · Status: **done** · Depends on: 004

## Goal
"Role is checked on the server for every mutation — never trust the client" (PRODUCT §3, §13).

## Steps
1. `src/shared/middleware/require-user.ts`: `requireUser(minRole?)` reads the `auth()` session, loads the fresh user from DB, returns `{ user }` or a `NextResponse` (401 `UNAUTHENTICATED`, 403 `BANNED` / `FORBIDDEN`).
   Usage mirrors `validateBody`: `if (guard instanceof NextResponse) return guard;`
2. Role hierarchy helper `hasRole(userRole, minRole)` in `src/shared/utils/roles.ts` (citizen < moderator < admin).
3. Specs for both.

## AC
- Banned users can browse, but every mutation guarded by `requireUser` returns 403.
- Role checks use DB state, not a stale JWT.

## Implementation notes
- Also added `src/shared/middleware/validate-query.ts` (GET query-string counterpart of `validateBody`).
