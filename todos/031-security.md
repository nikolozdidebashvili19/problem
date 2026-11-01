# T-031 — Security headers + Turnstile

Phase 1 · Status: todo · Depends on: 013

## Steps
1. `next.config.ts` `headers()`: CSP (self, Cloudinary, tile provider, Google, Turnstile), `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS, `Permissions-Policy` (geolocation=self, camera=self).
2. Cloudflare Turnstile: widget on create report + first sign-in; `src/shared/lib/turnstile.ts` (class + spec) verifies tokens server-side.
3. Audit every route: session + role + ownership + zod (`.strict()` or default stripping) — tick the PRODUCT §13 checklist in the PR.
4. Dependabot config + `npm audit` in CI.

## AC
- Report creation without a valid Turnstile token → 400.
