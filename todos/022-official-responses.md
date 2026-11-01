# T-022 — Official responses (moderator)

Phase 1 · Status: todo · Depends on: 021, 026

## Steps
1. `OfficialResponseSchema`: `body` (responding body, e.g. "Saburtalo District Administration"), `text`, `sourceUrl?`, `sourceImage?` (Cloudinary publicId), `date`.
2. `POST /api/reports/[shortId]/official-responses` (moderator): push to `officialResponses`, move `reported|reopened → acknowledged` via `changeStatusService`, write audit log.
3. Filter `hasOfficialResponse` in the feed (T-018).

## AC (PRODUCT §4.5)
- Response appears on the report page with source and date.
