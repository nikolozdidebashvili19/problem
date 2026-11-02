'use client';
import { BellOff, CheckCheck, CircleCheckBig, Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { useNotifications } from '@/features/notifications/hooks/use-notifications';
import { NotificationPage, NotificationView } from '@/features/notifications/types/notification.types';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/const/routes.const';
import { cn } from '@/shared/lib/utils';
import { formatReportDate } from '@/shared/utils/format';

type NotificationListProps = {
  initial: NotificationPage;
};

export const NotificationList = ({ initial }: NotificationListProps) => {
  const t = useTranslations('notifications');
  const tReport = useTranslations('report');
  const locale = useLocale();
  const { items, hasMore, loadingMore, loadMore, markAllRead, markRead, hasUnread } = useNotifications(initial);

  const message = (item: NotificationView) => {
    const title = item.report?.title ?? t('removedReport');
    if (item.type === 'report_fixed') return t('reportFixed', { title });
    const actor = item.actorName ?? tReport('deletedUser');
    return item.type === 'comment_reply' ? t('commentReply', { title, actor }) : t('comment', { title, actor });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <BellOff aria-hidden="true" className="size-6" />
        </span>
        <h2 className="text-lg">{t('empty')}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t('emptyDescription')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {hasUnread && (
        <Button variant="outline" onClick={markAllRead} className="h-10 self-end rounded-full px-4">
          <CheckCheck aria-hidden="true" className="size-4" />
          {t('markAllRead')}
        </Button>
      )}

      <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {items.map((item) => {
          const fixed = item.type === 'report_fixed';
          const Icon = fixed ? CircleCheckBig : MessageSquare;
          const content = (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full',
                  fixed
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-link/10 text-link'
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={cn('text-sm', item.read ? 'text-muted-foreground' : 'font-medium text-foreground')}>
                  {message(item)}
                </span>
                <time dateTime={item.createdAt} className="text-xs text-muted-foreground">
                  {formatReportDate(item.createdAt, locale)}
                </time>
              </span>
              {!item.read && (
                <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary">
                  <span className="sr-only">{t('unread')}</span>
                </span>
              )}
            </>
          );

          return (
            <li key={item.id} className={cn(!item.read && 'bg-link/5')}>
              {item.report ? (
                <Link
                  href={ROUTES.report(item.report.shortId, item.report.slug)}
                  onClick={() => markRead(item.id)}
                  className="flex gap-3 p-3 transition-colors outline-none hover:bg-accent focus-visible:bg-accent sm:p-4"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex gap-3 p-3 sm:p-4">{content}</div>
              )}
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="h-10">
          {loadingMore && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
          {t('loadMore')}
        </Button>
      )}
    </div>
  );
};
