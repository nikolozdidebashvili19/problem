import { SearchX, Sprout } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui/button';

type FeedEmptyStateProps = {
  filtered: boolean;
  clearHref: string;
};

export const FeedEmptyState = ({ filtered, clearHref }: FeedEmptyStateProps) => {
  const t = useTranslations('feed.empty');
  const Icon = filtered ? SearchX : Sprout;

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <h2 className="text-lg">{filtered ? t('filteredTitle') : t('title')}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {filtered ? t('filteredDescription') : t('description')}
      </p>
      {filtered && (
        <Button variant="outline" asChild className="mt-1">
          <Link href={clearHref}>{t('clear')}</Link>
        </Button>
      )}
    </div>
  );
};
