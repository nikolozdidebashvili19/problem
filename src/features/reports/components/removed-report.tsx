import { ArchiveX } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/const/routes.const';

// Shown instead of a 500/404 so shared links to removed reports still explain themselves (PRODUCT §4.3)
export const RemovedReport = () => {
  const t = useTranslations('reportPage');

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-14 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ArchiveX aria-hidden="true" className="size-6" />
      </span>
      <h1 className="text-xl">{t('removedTitle')}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t('removedDescription')}</p>
      <Button variant="outline" asChild className="mt-1">
        <Link href={ROUTES.home}>{t('backToFeed')}</Link>
      </Button>
    </div>
  );
};
