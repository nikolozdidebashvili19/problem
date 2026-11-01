'use client';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';

import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE_S } from '@/shared/const/app.const';

export const useSwitchLocale = () => {
  const router = useRouter();
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const nextLocale = locale === 'en' ? 'ka' : 'en';

  const switchLocale = () => {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE_S}; samesite=lax`;
    // Re-render server components with the new language while keeping the current URL and scroll
    startTransition(() => router.refresh());
  };

  return { locale, nextLocale, pending, switchLocale };
};
