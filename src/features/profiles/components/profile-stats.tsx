import { ArrowBigUp, CircleCheckBig, FileText, MessageSquare, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ProfileStats as ProfileStatsData } from '@/features/profiles/types/profile.types';
import { cn } from '@/shared/lib/utils';

type ProfileStatsProps = {
  stats: ProfileStatsData;
};

const STAT_ICONS: Record<keyof ProfileStatsData, LucideIcon> = {
  reports: FileText,
  fixed: CircleCheckBig,
  upvotes: ArrowBigUp,
  comments: MessageSquare,
};

const STAT_ORDER: (keyof ProfileStatsData)[] = ['fixed', 'reports', 'upvotes', 'comments'];

export const ProfileStats = ({ stats }: ProfileStatsProps) => {
  const t = useTranslations('profile.stats');

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
      {STAT_ORDER.map((stat) => {
        const Icon = STAT_ICONS[stat];
        const isFixed = stat === 'fixed';
        return (
          <div key={stat} className="flex flex-col-reverse gap-1 bg-card p-3 sm:p-4">
            <dt className="text-xs text-muted-foreground">{t(stat)}</dt>
            <dd
              className={cn(
                'flex items-center gap-1.5 text-2xl font-semibold text-foreground',
                isFixed && 'text-emerald-700 dark:text-emerald-300'
              )}
            >
              <Icon aria-hidden="true" className={cn('size-5 shrink-0', !isFixed && 'text-muted-foreground')} />
              {stats[stat]}
            </dd>
          </div>
        );
      })}
    </dl>
  );
};
