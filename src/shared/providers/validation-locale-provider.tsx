'use client';
import { useLocale } from 'next-intl';
import { type ReactNode } from 'react';
import { z } from 'zod';

type ValidationLocaleProviderProps = {
  children: ReactNode;
};

// Form validation messages (zod) follow the UI language. Browser only: zod's config is a module
// global, so setting it during SSR would leak between concurrent requests and API validation.
export const ValidationLocaleProvider = ({ children }: ValidationLocaleProviderProps) => {
  const locale = useLocale();
  if (typeof window !== 'undefined') {
    z.config(locale === 'en' ? z.locales.en() : z.locales.ka());
  }
  return children;
};
