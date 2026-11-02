import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ProfileTab } from '@/features/profiles/types/profile.types';
import { PROFILE_TABS } from '@/shared/const/profile.const';
import { ROUTES } from '@/shared/const/routes.const';
import { cn } from '@/shared/lib/utils';

type ProfileTabsProps = {
  userId: string;
  active: ProfileTab;
};

export const ProfileTabs = ({ userId, active }: ProfileTabsProps) => {
  const t = useTranslations('profile');

  return (
    <nav aria-label={t('activityLabel')} className="flex gap-1 rounded-lg border border-border bg-card p-1">
      {PROFILE_TABS.map((tab) => (
        <Link
          key={tab}
          href={ROUTES.profile(userId, tab)}
          aria-current={tab === active ? 'page' : undefined}
          className={cn(
            'inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-md px-1.5 text-sm font-medium',
            'transition-colors sm:flex-none sm:px-3',
            tab === active ? 'bg-link/10 text-link' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <span className="truncate">{t(`tabs.${tab}`)}</span>
        </Link>
      ))}
    </nav>
  );
};
