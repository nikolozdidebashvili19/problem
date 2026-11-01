# T-025 — Flagging + auto-hide

Phase 1 · Status: todo · Depends on: 011, 008

## Steps
1. `src/features/flags/schema/flag.schema.ts`: `{ reportId, userId, reason, note?, resolved }`, unique `(userId, reportId)`.
2. Reasons constant: spam, not_public, offensive, personal_info, wrong_location, duplicate, other.
3. `POST /api/reports/[shortId]/flag` (citizen, rate limit `flag`).
4. Service: `$inc flagCount`; when flags from accounts older than 7 days reach 5 → `hidden: true` pending review.

## AC (PRODUCT §4.10)
- Duplicate flag from the same user is a no-op.
