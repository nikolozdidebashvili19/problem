# T-038 — Launch checklist

Phase 1 · Status: todo · Depends on: all Phase 1 tickets

Copied from PRODUCT §20 — tick in the launch PR.

- [ ] All Phase 1 acceptance criteria pass.
- [ ] Tested on iPhone Safari and Android Chrome, on slow 3G throttling.
- [ ] HEIC upload, rotated photo, 10 MB photo, denied geolocation, offline submit — all tested.
- [ ] Double-click vote/submit tested (no duplicates).
- [ ] Indexes created in production (`syncIndexes` run).
- [ ] Production env vars set; Google OAuth production callback added.
- [ ] Separate prod database; backups running; restore tested.
- [ ] Rate limits and Turnstile active.
- [ ] Terms, Privacy Policy, content policy, takedown contact published.
- [ ] Moderators assigned and trained; flag queue checked daily.
- [ ] Usage alerts configured on Atlas, Cloudinary, Vercel.
- [ ] OG previews verified on Facebook and Telegram.
- [ ] 404/500/removed-report pages designed.
- [ ] Seed with 20–30 real reports before announcing.

## Open questions to resolve before launch (PRODUCT §21)
1. Anonymous reporting ("Citizen" publicly)?
2. Threshold tuning (3 confirmations / 72h / 5 flags).
3. Occupied territories handling (currently: listed, reporting disabled).
4. Automatic face/plate blurring vs moderator-applied.
5. First moderators + legal escalation path.
6. Official-response channel before verified official accounts exist.
