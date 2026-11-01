# T-016 — Create report UI flow

Phase 1 · Status: **in-progress** · Depends on: 001, 009, 012, 013, 014, 015

## Steps
1. Route `/report/new` (protected). Wizard: **Photo → Location → Details → Review → Submit**.
2. Zustand store `src/features/reports/store/report-draft-store.ts` + `useReportDraftStore.ts` + register in `store-provider.tsx`; persisted to `localStorage` (draft survives connection loss).
3. Photo step: `<input accept="image/*" capture="environment" multiple>`, 1–4 images, client resize, upload progress, "Use photo location?" when EXIF GPS exists.
4. Location step: `MapPicker`; auto-fill region/municipality/neighborhood from `/api/locations/resolve`; user can override.
5. Details step: react-hook-form + zodResolver; category picker, severity (Dangerous → 112 notice).
6. Review step: show nearby duplicates (T-014) before submit.
7. Submit: button disabled while pending, idempotency key generated once per draft; on success clear draft, go to the report page with share button.

## AC (PRODUCT §2, §4.2)
- A report can be created in under 60 s on a phone.
- Emergency disclaimer is visible on the create screen.

## Implementation notes (partial)
- Done: `/report/new` single-page form (photos → location → details), "Use my location" (geolocation → resolve), region/district/neighborhood selects, dangerous-severity 112 notice, idempotent submit, translated API errors, redirect to the new report.
- Open: map pin (T-015), localStorage draft, nearby-duplicate check before submit (T-014).
