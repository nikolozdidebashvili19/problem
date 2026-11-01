'use client';
import { AlertCircle, ImagePlus, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { useImageUpload } from '@/features/reports/hooks/use-image-upload';
import { ReportImage } from '@/features/reports/types/report.types';
import { MAX_REPORT_IMAGES } from '@/shared/const/reports.const';
import { useErrorMessage } from '@/shared/hooks/use-error-message';
import { cn } from '@/shared/lib/utils';

type ImageUploaderProps = {
  onChange: (images: ReportImage[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

export const ImageUploader = ({ onChange, onUploadingChange }: ImageUploaderProps) => {
  const t = useTranslations('reportForm');
  const errorMessage = useErrorMessage();
  const inputId = useId();
  const { items, addFiles, remove } = useImageUpload((images) => onChange(images));

  const handleFiles = async (files: FileList | null) => {
    onUploadingChange?.(true);
    await addFiles(files);
    onUploadingChange?.(false);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted">
          <Image src={item.previewUrl} alt="" fill unoptimized className="object-cover" />
          {item.status === 'uploading' && (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/70 text-xs font-medium">
              <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              {t('uploading')}
            </span>
          )}
          {item.status === 'error' && (
            <span
              role="alert"
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/85 p-2 text-center text-xs font-medium text-destructive"
            >
              <AlertCircle aria-hidden="true" className="size-5" />
              {errorMessage(item.error)}
            </span>
          )}
          <button
            type="button"
            onClick={() => remove(item.id)}
            aria-label={t('removePhoto')}
            className={cn(
              'absolute right-1 top-1 inline-flex size-8 items-center justify-center rounded-full bg-background/90',
              'text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
            )}
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      ))}

      {items.length < MAX_REPORT_IMAGES && (
        <label
          htmlFor={inputId}
          className={cn(
            'flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input',
            'text-sm font-medium text-muted-foreground transition-colors hover:border-link hover:text-link',
            'focus-within:ring-2 focus-within:ring-ring/50'
          )}
        >
          <ImagePlus aria-hidden="true" className="size-6" />
          {t('addPhoto')}
          <input
            id={inputId}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="sr-only"
            onChange={(event) => {
              void handleFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
};
