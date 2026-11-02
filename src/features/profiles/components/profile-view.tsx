import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { ProfileActivity } from '@/features/profiles/components/profile-activity';
import { ProfileStats } from '@/features/profiles/components/profile-stats';
import { ProfileTabs } from '@/features/profiles/components/profile-tabs';
import { loadProfilePageService } from '@/features/profiles/service/profile-page.service';
import { ProfileTab } from '@/features/profiles/types/profile.types';
import { DEFAULT_PROFILE_TAB, PROFILE_TABS } from '@/shared/const/profile.const';
import { formatReportDate, getInitials } from '@/shared/utils/format';

type ProfileViewProps = {
  id: string;
  tab: string | undefined;
};

const parseTab = (tab: string | undefined): ProfileTab =>
  PROFILE_TABS.find((candidate) => candidate === tab) ?? DEFAULT_PROFILE_TAB;

export const ProfileView = async ({ id, tab }: ProfileViewProps) => {
  const result = await loadProfilePageService(id);
  if ('error' in result.data) notFound();
  const profile = result.data;

  const [t, locale] = await Promise.all([getTranslations('profile'), getLocale()]);
  const activeTab = parseTab(tab);

  return (
    <section aria-labelledby="profile-heading" className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {profile.avatar ? (
          <Image
            src={profile.avatar}
            alt=""
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xl font-semibold text-foreground"
          >
            {getInitials(profile.name) || '?'}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <h1 id="profile-heading" className="break-words text-2xl">
            {profile.name}
          </h1>
          <p className="text-sm text-muted-foreground">{t('joined', { date: formatReportDate(profile.joinedAt, locale) })}</p>
        </div>
      </div>

      <ProfileStats stats={profile.stats} />
      <ProfileTabs userId={profile.id} active={activeTab} />
      <ProfileActivity userId={profile.id} tab={activeTab} />
    </section>
  );
};
