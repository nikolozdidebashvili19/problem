# T-028 — Profile + settings + account deletion

Phase 1 · Status: **in-progress** · Depends on: 010

## Steps
1. Public `/u/[id]`: displayName, avatar, join date, reports created, fixes contributed.
2. `/settings`: displayName, language, email notifications (react-hook-form).
3. `PATCH /api/me`, `GET /api/me/export` (JSON data export).
4. `DELETE /api/me` `{ keepReports: boolean }`: wipe personal data (name, email → tombstone, avatar), set `deletedAt`; reports either remain as "Deleted user" or are soft-deleted.

## AC (PRODUCT §4.8, §14)
- Public pages never show email.

## Implementation notes (partial)
- Done: public `/u/[id]` with name, avatar, join date, counts (problems fixed, reported, upvotes received, comments) and Reported / Fixed / Comments activity tabs. Names on cards, report pages and comments link to it; the header avatar links to your own. Never exposes email; deleted accounts are 404.
- "Problems fixed" counts reports where `fixEvidence.by` is this user, i.e. they marked it fixed. Counts are computed live, indexed.
- Open: `/settings` (display name, language, email notifications), `PATCH /api/me`, data export, account deletion.
