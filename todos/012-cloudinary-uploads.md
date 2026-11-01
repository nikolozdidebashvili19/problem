# T-012 — Cloudinary signed direct uploads

Phase 1 · Status: **in-progress** · Depends on: 005, 008

## Goal
Images never pass through a Next.js function (Vercel 4.5 MB body limit — PRODUCT §12.1).

## Steps
1. `npm i cloudinary`; env `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
2. `src/shared/lib/cloudinary.ts` (class + singleton + spec): `signUpload({ userId })` → `{ signature, timestamp, apiKey, folder, tags: ['pending'], allowedFormats }`; `verifyPublicId(publicId)` (must be in our folder); `deleteAssets`; `removePendingTag`.
3. `GET /api/cloudinary/sign` — citizen, rate limit `sign` 30/h.
4. Client util `src/shared/utils/image-resize.ts`: resize to 2048px long edge using `createImageBitmap(file, { imageOrientation: 'from-image' })` → WebP/JPEG blob; read EXIF GPS before stripping (offer "Use photo location?").
5. Upload hook `src/features/reports/hooks/use-image-upload.ts`: progress, retry with backoff.
6. Delivery URL helper: `f_auto,q_auto,a_auto`, feed thumbnails `w_600`; `next/image` uses a Cloudinary loader (don't burn Vercel optimizations).

## AC
- Signed uploads only; signature restricted to folder, formats, max size.
- Stored images have no EXIF (verified).

## Implementation notes (partial)
- Done: `CloudinaryClient` (SHA-1 signing, no SDK) + spec, `GET /api/uploads/sign`, client resize to 2048px with EXIF stripping via canvas, `useImageUpload` + `ImageUploader`, server check that every image belongs to our cloud + folder.
- Uploads switch on automatically once `CLOUDINARY_*` env vars are set; until then reports post without photos and the UI says so. With uploads on, a photo is required.
- Open: orphan cleanup of `pending`-tagged assets (T-033), Cloudinary delivery transformations (`f_auto,q_auto,w_600`), EXIF-GPS "use photo location", retry with backoff.
