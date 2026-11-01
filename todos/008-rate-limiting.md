# T-008 — Rate limiting (Upstash)

Phase 0 · Status: todo · Depends on: 002, 005

## Steps
1. `npm i @upstash/ratelimit @upstash/redis`; env `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
2. `src/shared/lib/rate-limiter.ts`: `RateLimiter` class with named policies (PRODUCT §13): `report` 5/h, `vote` 60/min, `flag` 20/h, `sign` 30/h per user; `read` per IP for guests. No-op limiter when env is missing in dev.
3. `src/shared/middleware/rate-limit.ts`: `rateLimit(policy, key)` → 429 `NextResponse` with `Retry-After`, or `null`.
4. Spec with mocked Upstash.
5. New-account limit (PRODUCT §4.1): accounts younger than 24h → max 2 reports/day (checked in the report service, not Redis).

## AC
- Exceeding a limit returns 429, never 500.
