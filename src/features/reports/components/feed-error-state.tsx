'use client';
import { CloudOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui/button';

type FeedErrorStateProps = {
  onRetry: () => void;
};

export const FeedErrorState = ({ onRetry }: FeedErrorStateProps) => {
  const t = useTranslations('feed.error');

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-14 text-center"
    >
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CloudOff aria-hidden="true" className="size-6" />
      </span>
      <h2 className="text-lg">{t('title')}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{t('description')}</p>
      <Button onClick={onRetry} className="mt-1 h-10 rounded-full px-5 font-semibold">
        {t('retry')}
      </Button>
    </div>
  );
};
