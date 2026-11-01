# T-026 — Moderator queue + audit log

Phase 1 · Status: todo · Depends on: 021, 025

## Steps
1. `src/features/moderation/schema/audit-log.schema.ts`: `{ actorId, action, targetType, targetId, meta }`; every mod/admin action writes one.
2. `/mod` protected route (moderator+): queue sorted by flag count and age; location-mismatch reports; pending fix claims.
3. Actions: hide/unhide, set status (rejected/removed with reason), resolve flags, blur image region (Cloudinary `e_pixelate_region` / `e_blur_faces` — stored as a transformation on the image entry), merge duplicate.
4. Merge duplicate (transaction): move votes to the original (dedupe by user), recompute counts, duplicate → `status: duplicate`, `mergedInto`.
5. Admin: change roles, ban/unban users, manage categories/locations.

## AC
- All moderator actions are in the audit log.
