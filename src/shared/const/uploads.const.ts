export const CLOUDINARY_FOLDER = 'problem-ge/reports';

export const CLOUDINARY_PENDING_TAG = 'pending';

export const ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'heic'] as const;

// Client-side resize before upload (PRODUCT §4.2)
export const MAX_IMAGE_DIMENSION = 2048;

export const MAX_UPLOAD_SOURCE_BYTES = 10 * 1024 * 1024;

export const UPLOAD_JPEG_QUALITY = 0.85;
