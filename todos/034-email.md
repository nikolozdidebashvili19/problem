# T-034 — Email notifications (Resend)

Phase 1.5 · Status: todo · Depends on: 033

## Steps
1. `npm i resend`; `src/shared/lib/mailer.ts` (class + spec).
2. `notifications` collection: queued events per user (status changed, official response, fix claim, fixed).
3. Daily digest cron: max 1 email/day/user, respects `emailNotifications`; signed unsubscribe link.
4. Voters opt-in to "report fixed" emails.

## AC (PRODUCT §4.11)
- Every email has a working unsubscribe link.
