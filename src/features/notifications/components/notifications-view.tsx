import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { NotificationList } from '@/features/notifications/components/notification-list';
import { listNotificationsService } from '@/features/notifications/service/notification.service';
import { PageHeader } from '@/shared/components/layout/page-header';
import { ROUTES } from '@/shared/const/routes.const';
import { getViewerId } from '@/shared/middleware/get-viewer';

export const NotificationsView = async () => {
  const viewerId = await getViewerId();
  if (!viewerId) redirect(`${ROUTES.signIn}?callbackUrl=${encodeURIComponent(ROUTES.notifications)}`);

  const [t, result] = await Promise.all([getTranslations('notifications'), listNotificationsService(viewerId, {})]);
  const initial = 'items' in result.data ? result.data : { items: [], nextCursor: null };

  return (
    <section className="flex flex-col gap-5">
      <PageHeader title={t('title')} description={t('description')} />
      <NotificationList initial={initial} />
    </section>
  );
};
