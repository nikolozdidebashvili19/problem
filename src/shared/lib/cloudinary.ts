import { createHash } from 'node:crypto';

import { ALLOWED_IMAGE_FORMATS, CLOUDINARY_FOLDER, CLOUDINARY_PENDING_TAG } from '@/shared/const/uploads.const';
import { env } from '@/shared/lib/env';

type CloudinaryCredentials = {
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
};

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  tags: string;
  allowedFormats: string;
};

export type UploadedImage = {
  publicId: string;
  url: string;
  width: number;
  height: number;
};

// Browser uploads go straight to Cloudinary with a server signature, never through a Next.js function
// (Vercel's 4.5 MB body limit — PRODUCT §12.1). Only the resulting publicIds reach our API.
class CloudinaryClient {
  constructor(private readonly credentials?: CloudinaryCredentials) {}

  private get config(): CloudinaryCredentials {
    return (
      this.credentials ?? {
        cloudName: env.get('CLOUDINARY_CLOUD_NAME'),
        apiKey: env.get('CLOUDINARY_API_KEY'),
        apiSecret: env.get('CLOUDINARY_API_SECRET'),
      }
    );
  }

  isConfigured(): boolean {
    const { cloudName, apiKey, apiSecret } = this.config;
    return Boolean(cloudName && apiKey && apiSecret);
  }

  signUpload(now = Date.now()): UploadSignature | null {
    const { cloudName, apiKey, apiSecret } = this.config;
    if (!cloudName || !apiKey || !apiSecret) return null;

    const params = {
      allowed_formats: ALLOWED_IMAGE_FORMATS.join(','),
      folder: CLOUDINARY_FOLDER,
      tags: CLOUDINARY_PENDING_TAG,
      timestamp: Math.floor(now / 1000),
    };
    return {
      cloudName,
      apiKey,
      timestamp: params.timestamp,
      signature: this.sign(params, apiSecret),
      folder: params.folder,
      tags: params.tags,
      allowedFormats: params.allowed_formats,
    };
  }

  // Rejects images that were not uploaded to our own folder (e.g. arbitrary URLs posted to the API)
  isOwnedImage(image: UploadedImage): boolean {
    const { cloudName } = this.config;
    if (!cloudName) return false;
    return (
      image.publicId.startsWith(`${CLOUDINARY_FOLDER}/`) &&
      image.url.startsWith(`https://res.cloudinary.com/${cloudName}/image/upload/`)
    );
  }

  // Cloudinary signature: sha1 of alphabetically sorted `key=value` pairs joined by `&`, then the secret
  private sign(params: Record<string, string | number>, apiSecret: string): string {
    const payload = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');
    return createHash('sha1').update(payload + apiSecret).digest('hex');
  }
}

export const cloudinary = new CloudinaryClient();
export { CloudinaryClient };
