# T-028 — Profile + settings + account deletion

Phase 1 · Status: todo · Depends on: 010

## Steps
1. Public `/u/[id]`: displayName, avatar, join date, reports created, fixes contributed.
2. `/settings`: displayName, language, email notifications (react-hook-form).
3. `PATCH /api/me`, `GET /api/me/export` (JSON data export).
4. `DELETE /api/me` `{ keepReports: boolean }`: wipe personal data (name, email → tombstone, avatar), set `deletedAt`; reports either remain as "Deleted user" or are soft-deleted.

## AC (PRODUCT §4.8, §14)
- Public pages never show email.
