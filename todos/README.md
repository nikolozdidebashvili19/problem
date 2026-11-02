in-progress |done |in-progress |done |in-progress |done |in-progress |# Problem.ge — Implementation Tickets

Step-by-step implementation plan derived from [PRODUCT.md](../PRODUCT.md).
Each ticket is a self-contained unit of work with steps, files and acceptance criteria (AC).
Work top to bottom — tickets list their dependencies.

**Conventions**
- All code follows [CLAUDE.md](../CLAUDE.md): feature folders, API routes + `validateBody`, services return `ServiceResult`, repositories are the only Mongoose callers.
- PRODUCT.md talks about "server actions"; this codebase uses **API routes** (§6 of CLAUDE.md) for every mutation. Same auth/role/zod/rate-limit rules apply.
- Status: `todo` · `in-progress` · `done` · `blocked` (needs a decision from the owner).

## Phase 0 — Foundations

| # | Ticket | Status |
|---|---|---|
| 001 | [Design direction for Problem.ge](001-design-direction.md) | done |
| 002 | [Brand basics + env validation](002-brand-and-env.md) | done |
| 003 | [Mongo connection hardening + DB health check](003-mongo-hardening.md) | done |
| 004 | [User model for Problem.ge roles](004-user-model.md) | done |
| 005 | [Server-side auth guards (session, role, banned)](005-auth-guards.md) | done |
| 006 | [Categories feature + seed](006-categories.md) | done |
| 007 | [Locations feature + seed + point resolve](007-locations.md) | done |
| 008 | [Rate limiting (Upstash)](008-rate-limiting.md) | todo |
| 009 | [i18n with next-intl (ka default, en)](009-i18n.md) | done |
| 010 | [Google-only sign-in + terms acceptance](010-auth-flow.md) | todo |

## Phase 1 — MVP (launch in Tbilisi)

| # | Ticket | Status |
|---|---|---|
| 011 | [Reports schema, indexes, shortId, hotScore](011-reports-schema.md) | in-progress |
| 012 | [Cloudinary signed direct uploads](012-cloudinary-uploads.md) | in-progress |
| 013 | [Create report API](013-create-report-api.md) | done |
| 014 | [Duplicate / nearby check API](014-nearby-api.md) | todo |
| 015 | [Map component (Leaflet)](015-map-component.md) | todo |
| 016 | [Create report UI flow](016-create-report-ui.md) | in-progress |
| 017 | [Report detail page + OG tags](017-report-detail.md) | done |
| 018 | [Feed API: tabs, filters, cursor pagination](018-feed-api.md) | in-progress |
| 019 | [Feed UI](019-feed-ui.md) | in-progress |
| 020 | [Upvotes](020-upvotes.md) | in-progress |
| 021 | [Status lifecycle + status events](021-status-lifecycle.md) | in-progress |
| 022 | [Official responses (moderator)](022-official-responses.md) | todo |
| 023 | [Fix claims + verification + reopen](023-fix-claims.md) | in-progress |
| 024 | [Fixed feed + stats cache](024-fixed-feed.md) | todo |
| 025 | [Flagging + auto-hide](025-flagging.md) | todo |
| 026 | [Moderator queue + audit log](026-moderation.md) | todo |
| 027 | [Edit / delete own report](027-edit-delete.md) | done |
| 028 | [Profile + settings + account deletion](028-profile.md) | in-progress |
| 029 | [Search](029-search.md) | todo |
| 030 | [Legal pages + emergency disclaimer](030-legal.md) | todo |
| 031 | [Security headers + Turnstile](031-security.md) | todo |
| 032 | [Error, removed, 404 pages + empty states](032-error-pages.md) | todo |
| 039 | [Comments](039-comments.md) | done |
| 040 | [In-app notifications](040-notifications.md) | done |

## Phase 1.5 and later

| # | Ticket | Status |
|---|---|---|
| 033 | [Cron jobs (fix auto-resolve, stats, orphan images)](033-cron.md) | todo |
| 034 | [Email notifications (Resend)](034-email.md) | todo |
| 035 | [Map view with clustering](035-map-view.md) | todo |
| 036 | [PWA](036-pwa.md) | todo |
| 037 | [Observability, backups, runbook](037-observability.md) | todo |
| 038 | [Launch checklist](038-launch.md) | todo |
