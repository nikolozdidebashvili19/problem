'use client';
import { useTranslations } from 'next-intl';

type HttpError = Error & { status?: number };

// Maps API error codes (`{ error: 'PHOTO_REQUIRED' }`) to a translated sentence, with a generic fallback
export const useErrorMessage = () => {
  const t = useTranslations('errors');

  return (error: unknown): string => {
    const code = error instanceof Error ? (error as HttpError).message : typeof error === 'string' ? error : '';
    return code && t.has(code) ? t(code) : t('GENERIC');
  };
};
