# T-002 — Brand basics + env validation

Phase 0 · Status: **done** · Depends on: —

## Goal
Rename the template to Problem.ge and fail fast when required env vars are missing (PRODUCT §12.6).

## Steps
1. `src/shared/const/app.const.ts`: `APP_NAME = 'Problem.ge'`, product description.
2. `src/shared/lib/env.ts`: `EnvConfig` class (OOP lib rule) that parses `process.env` with zod and exposes a typed `get(key)`; export singleton `env`.
   - Required now: `MONGO_URI`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
   - Optional (become required when their ticket lands): Cloudinary, Upstash, Turnstile, Resend, `CRON_SECRET`.
   - Validation is lazy (first access) so `next build` without secrets still works; the error lists every invalid key.
3. `src/shared/lib/env.spec.ts`.
4. `.env.example`: every var with comments; DB name `problem-ge`.
5. `package.json` name → `problem-ge`.

## AC
- Missing required var → clear error naming the var(s).
- No secret is exposed through `NEXT_PUBLIC_*`.

## Implementation notes
- Validation runs once at server start from `src/instrumentation.ts`: throws in production, logs in development (so the dev server still starts without a `.env`).
- `auth.ts` still reads Google creds from `process.env` directly (NextAuth config is built at import time); instrumentation guarantees they exist in production.
- Footer copy still mentions the template stack — replaced during the UI work after T-001.
