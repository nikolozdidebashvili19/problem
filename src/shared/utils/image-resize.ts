import { MAX_IMAGE_DIMENSION, UPLOAD_JPEG_QUALITY } from '@/shared/const/uploads.const';

export function scaledSize(width: number, height: number, max = MAX_IMAGE_DIMENSION): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const ratio = max / longest;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

// Browser only. Re-encoding through a canvas resizes to 2048px, applies EXIF orientation and strips all
// metadata (incl. GPS) before the photo leaves the phone (PRODUCT §4.2, §12.1). Formats the browser cannot
// decode (e.g. HEIC outside Safari) are uploaded as-is and converted by Cloudinary.
export async function resizeImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file;
  }

  const { width, height } = scaledSize(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', UPLOAD_JPEG_QUALITY));
  return blob ?? file;
}
