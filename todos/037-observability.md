# T-037 — Observability, backups, runbook

Phase 1.5 · Status: todo · Depends on: 003

## Steps
1. Sentry (`@sentry/nextjs`) for client + server with release tags.
2. Uptime monitor on `/api/health` (DB-aware since T-003).
3. GitHub Actions: daily `mongodump` to private storage; document a restore test.
4. Usage alerts: Atlas storage 70%, Cloudinary credits 70%, Vercel usage emails.
5. `docs/RUNBOOK.md`: DB full, Cloudinary over quota, spam wave, site paused.
6. Admin stats: counts per status, flag queue size, new users/day.
7. Separate Atlas databases for dev / preview / prod.

## AC (PRODUCT §17)
- A forced server error appears in Sentry with the release tag.
