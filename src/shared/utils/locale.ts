import { Locale } from '@/features/auth/types/auth.types';
import { DEFAULT_LOCALE, LOCALES } from '@/shared/const/roles.const';

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (LOCALES as readonly string[]).includes(value);
}

// Georgian unless the visitor explicitly picked another language
export function resolveLocale(cookieValue: string | undefined): Locale {
  return isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;
}

export function localizedName(item: { nameKa: string; nameEn: string }, locale: string): string {
  return locale === 'en' ? item.nameEn : item.nameKa;
}
