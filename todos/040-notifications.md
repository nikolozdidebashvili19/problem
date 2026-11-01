# T-040 — In-app notifications

Phase 1 (owner request) · Status: **done** · Depends on: 011

## Goal
A notifications tab so users learn about activity on their reports without email (email digests stay in T-034).

## Implementation
- `src/features/notifications/` — schema with 90-day TTL index, repository, service, hooks, bell + list components.
- Types: `comment` (someone commented on your report) and `report_fixed` (a report you upvoted was fixed, up to 500 voters).
- Never notifies users about their own actions; notification failures never fail the action that caused them.
- `GET /api/notifications` (cursor), `GET /api/notifications/unread-count`, `POST /api/notifications/read` (`ids` or all).
- `/notifications` page; unread badge on the header bell (desktop) and the mobile tab bar, polled every 60 s while the tab is visible and refreshed immediately after marking read.

## Open
- Status-change notifications once moderators can change status (T-021/T-022).
- Email digest of unread notifications (T-034).
