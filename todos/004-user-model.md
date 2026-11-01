# T-004 — User model for Problem.ge roles

Phase 0 · Status: **done** · Depends on: 002

## Goal
Bring the user document in line with PRODUCT §3 and §9.

## Steps
1. `user.schema.ts` fields: `email` (unique), `name`, `displayName`, `avatar`, `role: citizen|moderator|admin` (default citizen), `status: active|banned`, `banReason`, `locale: ka|en` (default ka), `emailNotifications` (default true), `termsAcceptedVersion`, `termsAcceptedAt`, `reportsCount` (default 0), `deletedAt`. Keep `passwordHash` optional until T-010 removes credentials.
2. Role/status/locale constants in `src/shared/const/roles.const.ts`.
3. Update the `User` type, auth service and `auth.ts` callbacks; token/session also carry `status`.
4. New OAuth users: `role: citizen`, `status: active`, `displayName = name`.
5. Update specs.

## AC
- New users get `role: "citizen"`, `status: "active"`.
- Session exposes `id`, `role`, `status`, `avatar` (inline cast, no `next-auth.d.ts`).

## Implementation notes
- Legacy `role: 'user'` documents (from the template) fail `hasRole` and are treated as having no role. If any exist, migrate: `db.users.updateMany({ role: 'user' }, { $set: { role: 'citizen' } })`.
- The first admin is set manually in Atlas: `db.users.updateOne({ email: '<you>' }, { $set: { role: 'admin' } })`.
