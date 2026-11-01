import { Geist_Mono, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { type ReactNode } from 'react';

import { APP_NAME } from '@/shared/const/app.const';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import { ValidationLocaleProvider } from '@/shared/providers/validation-locale-provider';

import type { Metadata } from 'next';

import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// Inter has no Georgian glyphs; the font stack falls back to Noto per character.
// Self-hosted (Georgian subset, variable weight, OFL — see ./fonts/OFL.txt) because next/font/google
// intermittently gets `/l/font?kit=` URLs for this family, which Turbopack dev cannot resolve.
const notoGeorgian = localFont({
  variable: '--font-georgian',
  src: './fonts/noto-sans-georgian-variable.woff2',
  weight: '100 900',
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return {
    title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
    description: t('appDescription'),
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${notoGeorgian.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <ValidationLocaleProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </ValidationLocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
