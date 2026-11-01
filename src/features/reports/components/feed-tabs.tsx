import { CircleCheckBig, Clock, Flame, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { FeedTab } from '@/features/reports/types/report.types';
import { FEED_TABS } from '@/shared/const/feed.const';
import { cn } from '@/shared/lib/utils';
import { buildFeedHref, FeedLinkParams } from '@/shared/utils/feed-href';

export const FEED_TAB_ICONS: Record<FeedTab, LucideIcon> = {
  popular: Flame,
  new: Clock,
  fixed: CircleCheckBig,
};

type FeedTabsProps = {
  active: FeedTab;
  query: FeedLinkParams;
};

export const FeedTabs = ({ active, query }: FeedTabsProps) => {
  const t = useTranslations('feed');

  return (
    <nav aria-label={t('sortLabel')} className="flex gap-1 rounded-lg border border-border bg-card p-1">
      {FEED_TABS.map((tab) => {
        const Icon = FEED_TAB_ICONS[tab];
        const isActive = tab === active;
        return (
          <Link
            key={tab}
            href={buildFeedHref(query, { tab })}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-1.5 text-sm font-medium',
              'transition-colors sm:flex-none sm:px-3',
              isActive ? 'bg-link/10 text-link' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon aria-hidden="true" className="hidden size-4 shrink-0 sm:block" />
            <span className="truncate">{t(`tabs.${tab}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
};
