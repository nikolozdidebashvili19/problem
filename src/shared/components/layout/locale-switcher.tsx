'use client';
import { Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui/button';
import { useSwitchLocale } from '@/shared/hooks/use-switch-locale';

export const LocaleSwitcher = () => {
  const t = useTranslations('language');
  const { pending, switchLocale } = useSwitchLocale();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      disabled={pending}
      aria-label={t('switchLabel')}
      title={t('switchLabel')}
      lang={t('switchLang')}
      className="h-10 gap-1.5 px-2.5 text-muted-foreground hover:text-foreground"
    >
      <Languages aria-hidden="true" className="hidden size-4 sm:block" />
      <span className="text-sm font-semibold">{t('short')}</span>
    </Button>
  );
};
