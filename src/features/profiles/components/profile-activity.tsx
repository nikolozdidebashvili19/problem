import { getTranslations } from 'next-intl/server';

import { ProfileCommentList } from '@/features/profiles/components/profile-comment-list';
import { listProfileCommentsService, listProfileReportsService } from '@/features/profiles/service/profile.service';
import { ProfileTab } from '@/features/profiles/types/profile.types';
import { FeedList } from '@/features/reports/components/feed-list';
import { getViewerId } from '@/shared/middleware/get-viewer';

type ProfileActivityProps = {
  userId: string;
  tab: ProfileTab;
};

const EMPTY_PAGE = { items: [], nextCursor: null };

export const ProfileActivity = async ({ userId, tab }: ProfileActivityProps) => {
  const t = await getTranslations('profile.empty');
  const empty = (
    <p className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
      {t(tab)}
    </p>
  );

  if (tab === 'comments') {
    const result = await listProfileCommentsService(userId, {});
    const page = 'items' in result.data ? result.data : EMPTY_PAGE;
    return page.items.length === 0 ? empty : <ProfileCommentList userId={userId} initial={page} />;
  }

  const result = await listProfileReportsService(userId, { tab }, await getViewerId());
  const page = 'items' in result.data ? result.data : EMPTY_PAGE;
  return page.items.length === 0 ? (
    empty
  ) : (
    <FeedList
      key={tab}
      endpoint={`/users/${userId}/reports`}
      query={{ tab }}
      initialItems={page.items}
      initialCursor={page.nextCursor}
    />
  );
};
