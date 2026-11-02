'use client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { useProfileComments } from '@/features/profiles/hooks/use-profile-comments';
import { ProfileCommentPage } from '@/features/profiles/types/profile.types';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/const/routes.const';
import { formatReportDate } from '@/shared/utils/format';

type ProfileCommentListProps = {
  userId: string;
  initial: ProfileCommentPage;
};

export const ProfileCommentList = ({ userId, initial }: ProfileCommentListProps) => {
  const t = useTranslations('profile');
  const locale = useLocale();
  const { items, hasMore, loading, failed, loadMore } = useProfileComments(userId, initial);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
        {items.map((comment) => (
          <li key={comment.id} className="flex flex-col gap-1 p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <span>
                {t.rich('commentedOn', {
                  title: comment.report.title,
                  report: (chunks) => (
                    <Link
                      href={ROUTES.report(comment.report.shortId, comment.report.slug)}
                      className="rounded-sm font-medium text-foreground outline-none hover:text-link focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
              <span aria-hidden="true">·</span>
              <time dateTime={comment.createdAt}>{formatReportDate(comment.createdAt, locale)}</time>
            </div>
            <p className="whitespace-pre-line break-words text-sm text-foreground">{comment.body}</p>
          </li>
        ))}
      </ul>

      {failed && (
        <p role="alert" className="text-center text-sm text-destructive">
          {t('loadMoreError')}
        </p>
      )}

      {hasMore && (
        <Button variant="outline" onClick={loadMore} disabled={loading} className="h-11 w-full">
          {loading && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
          {t('loadMore')}
        </Button>
      )}
    </div>
  );
};
