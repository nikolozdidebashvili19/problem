# T-017 — Report detail page + OG tags

Phase 1 · Status: **done** · Depends on: 011, 015, 021

## Steps
1. `GET /api/reports/[shortId]` + service `getReportByShortIdService` (author displayName, category, locations joined in one query/batch — no N+1).
2. Page `/r/[shortId]/[slug]`: server-rendered; wrong/old slug → `redirect` to canonical slug.
3. Components in `src/features/reports/components/`: `ReportGallery`, `StatusBadge` (text + color), `StatusTimeline`, `LocationBreadcrumb`, `OfficialResponseList`, `FixEvidence` (before/after slider), `ReportActions` (Upvote, Share, Flag, author Edit/Delete, Propose fixed, Confirm/Dispute).
4. `generateMetadata`: OG title, first image (Cloudinary 1200×630), status in description.
5. Hidden/removed → "This report was removed" page with reason; `duplicate` → redirect to `mergedInto`.

## AC (PRODUCT §4.3)
- Shared links preview correctly on Facebook/Telegram.
- Slug edits never break old links.

## Implementation notes
- `/r/[shortId]/[[...slug]]`: canonical-slug redirect (real 307), 404 for unknown, removed page for hidden reports, OG metadata, gallery, status badge + history timeline, proof of fix, upvote, share (native share sheet / copy), owner actions, comments.
- The feed's loading skeleton lives in `(main)/(feed)/` so report pages are not streamed — otherwise redirects/404s degrade to client-side with HTTP 200.
