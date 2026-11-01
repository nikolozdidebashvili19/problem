# T-003 — Mongo connection hardening + DB health check

Phase 0 · Status: **done** · Depends on: 002

## Goal
Avoid "too many connections" on serverless (PRODUCT §12.2) and give the uptime monitor a real signal (§17).

## Steps
1. `MongoClientManager`: cache the in-flight connection promise on `globalThis` so hot reloads and concurrent requests share one connection; `maxPoolSize: 10`; read the URI via `env`.
2. Add `ping()` → admin ping on the active connection.
3. `GET /api/health`: `{ status: 'ok', db: 'up' }` or 503 `{ status: 'degraded', db: 'down' }`.
4. Update `mongo.spec.ts`.

## AC
- Concurrent `connect()` calls open exactly one connection.
- `/api/health` returns 503 when the DB is unreachable.

## Implementation notes
- Cache lives on `globalThis.__mongoCache`; the manager takes the cache as a constructor arg so tests get an isolated one.
- A failed connection clears the cached promise, so the next request retries instead of reusing a rejected promise.
