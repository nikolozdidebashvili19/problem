# T-039 — Comments

Phase 1 (owner request, moved up from Phase 2) · Status: **done** · Depends on: 011, 040

## Goal
Signed-in users can discuss a report. PRODUCT §2 listed comments as a Phase 2 non-goal because of moderation
load; the owner asked for them in v1 (2026-11-02).

## Implementation
- `src/features/comments/` — schema (`reportId`, `authorId`, `body` ≤ 1000, soft `deletedAt`), repository, service, hooks, `CommentSection`.
- `GET/POST /api/reports/[shortId]/comments` (oldest first, keyset cursor, 50 per page), `DELETE /api/comments/[id]`.
- Plain text only: `<` and `>` are stripped on save; rendered as text with preserved line breaks.
- `report.commentCount` kept in sync (`$inc`); a double delete cannot decrement twice.
- Author of the comment or a moderator can delete. New comments notify the report author (T-040).

## Open
- Rate limit comments (T-008), flagging comments (T-025), moderator queue entry (T-026).
- Replies/threads are out of scope.
- Replies: one level deep (`parentId`). A reply to a reply joins the same thread and prefills an @mention. Notifies the person replied to (`comment_reply`). Deleting a comment keeps its replies under a "comment deleted" placeholder.
