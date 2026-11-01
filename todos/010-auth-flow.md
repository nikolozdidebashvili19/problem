# T-010 — Google-only sign-in + terms acceptance

Phase 0 · Status: todo · Depends on: 001, 004, 009

## Steps
1. Remove the Credentials provider, `/sign-up`, `/api/auth/register` and password utils (PRODUCT §4.1: Google now, magic link in Phase 2).
2. Sign-in page: single "Continue with Google" button; `callbackUrl` preserved (needed for "vote after login").
3. First sign-in → `/welcome`: accept Terms + Privacy (store `termsAcceptedVersion` + `termsAcceptedAt`) and pick a display name. `TERMS_VERSION` in `src/shared/const/legal.const.ts`.
4. `requireUser` returns 403 `TERMS_NOT_ACCEPTED` for mutations until accepted.
5. Sign-out on all tabs.
6. Replace `/dashboard` as the post-login landing with the feed.

## AC (PRODUCT §4.1)
- Session persists across reloads; sign-out works on all tabs.
- Terms acceptance is stored with version + timestamp.
