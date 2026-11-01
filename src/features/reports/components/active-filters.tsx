import { X } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { FeedFilterLabels } from '@/features/reports/service/feed-navigation.service';
import { cn } from '@/shared/lib/utils';
import { buildFeedHref, FeedLinkParams } from '@/shared/utils/feed-href';
import { localizedName } from '@/shared/utils/locale';

type ActiveFiltersProps = {
  query: FeedLinkParams;
  labels: FeedFilterLabels;
};

export const ActiveFilters = ({ query, labels }: ActiveFiltersProps) => {
  const t = useTranslations('feed');
  const locale = useLocale();

  const chips = [
    query.location && {
      key: 'location',
      label: labels.location ? localizedName(labels.location, locale) : query.location,
      href: buildFeedHref(query, { location: undefined }),
    },
    query.category && {
      key: 'category',
      label: labels.category ? localizedName(labels.category, locale) : query.category,
      href: buildFeedHref(query, { category: undefined }),
    },
    query.q && { key: 'q', label: `„${query.q}“`, href: buildFeedHref(query, { q: undefined }) },
  ].filter((chip) => typeof chip === 'object');

  if (chips.length === 0) return null;

  return (
    <ul aria-label={t('activeFilters')} className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Link
            href={chip.href}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card pl-3 pr-2',
              'text-sm text-foreground transition-colors hover:border-foreground/30'
            )}
          >
            {chip.label}
            <X aria-hidden="true" className="size-3.5 text-muted-foreground" />
            <span className="sr-only">{t('removeFilter')}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};
