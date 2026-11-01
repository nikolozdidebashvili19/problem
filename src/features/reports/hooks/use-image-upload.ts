'use client';
import { useRef, useState } from 'react';

import { ReportImage } from '@/features/reports/types/report.types';
import { MAX_REPORT_IMAGES } from '@/shared/const/reports.const';
import { MAX_UPLOAD_SOURCE_BYTES } from '@/shared/const/uploads.const';
import type { UploadSignature } from '@/shared/lib/cloudinary';
import { http } from '@/shared/lib/http';
import { resizeImage } from '@/shared/utils/image-resize';


export type UploadItem = {
  id: string;
  previewUrl: string;
  status: 'uploading' | 'done' | 'error';
  error?: string;
  image?: ReportImage;
};

type CloudinaryUploadResponse = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
};

async function uploadToCloudinary(file: Blob): Promise<ReportImage> {
  const signature = await http.get<UploadSignature>('/uploads/sign');
  const body = new FormData();
  body.append('file', file);
  body.append('api_key', signature.apiKey);
  body.append('timestamp', String(signature.timestamp));
  body.append('signature', signature.signature);
  body.append('folder', signature.folder);
  body.append('tags', signature.tags);
  body.append('allowed_formats', signature.allowedFormats);

  // Direct browser → Cloudinary upload; our server never handles the image bytes
  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: 'POST',
    body,
  });
  if (!response.ok) throw new Error('UPLOAD_FAILED');
  const uploaded = (await response.json()) as CloudinaryUploadResponse;
  return { publicId: uploaded.public_id, url: uploaded.secure_url, width: uploaded.width, height: uploaded.height };
}

// Keeps per-photo upload state; `onChange` receives the finished images so the form owns the value
export const useImageUpload = (onChange: (images: ReportImage[]) => void) => {
  const [items, setItems] = useState<UploadItem[]>([]);
  // Latest list for async callbacks, so a photo removed mid-upload is not resurrected when its upload ends
  const itemsRef = useRef<UploadItem[]>([]);

  const publish = (next: UploadItem[]) => {
    itemsRef.current = next;
    setItems(next);
    onChange(next.flatMap((item) => (item.status === 'done' && item.image ? [item.image] : [])));
  };

  const updateItem = (id: string, update: Partial<UploadItem>) =>
    publish(itemsRef.current.map((item) => (item.id === id ? { ...item, ...update } : item)));

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const room = MAX_REPORT_IMAGES - itemsRef.current.length;
    const selected = Array.from(files).slice(0, Math.max(room, 0));
    if (selected.length === 0) return;

    const added: UploadItem[] = selected.map((file) => {
      const tooLarge = file.size > MAX_UPLOAD_SOURCE_BYTES;
      return {
        id: crypto.randomUUID(),
        previewUrl: URL.createObjectURL(file),
        status: tooLarge ? 'error' : 'uploading',
        error: tooLarge ? 'IMAGE_TOO_LARGE' : undefined,
      };
    });
    publish([...itemsRef.current, ...added]);

    await Promise.all(
      selected.map(async (file, index) => {
        const item = added[index];
        if (item.status === 'error') return;
        try {
          updateItem(item.id, { status: 'done', image: await uploadToCloudinary(await resizeImage(file)) });
        } catch (error) {
          updateItem(item.id, { status: 'error', error: error instanceof Error ? error.message : 'UPLOAD_FAILED' });
        }
      })
    );
  };

  const remove = (id: string) => {
    const removed = itemsRef.current.find((item) => item.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    publish(itemsRef.current.filter((item) => item.id !== id));
  };

  return { items, addFiles, remove };
};
