'use client';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ReportCard } from '@/features/reports/components/report-card';
import { useFeedPagination } from '@/features/reports/hooks/use-feed-pagination';
import { ReportCard as ReportCardData } from '@/features/reports/types/report.types';
import { Button } from '@/shared/components/ui/button';
import { FeedLinkParams } from '@/shared/utils/feed-href';

type FeedListProps = {
  query: FeedLinkParams;
  initialItems: ReportCardData[];
  initialCursor: string | null;
  endpoint?: string;
};

export const FeedList = ({ query, initialItems, initialCursor, endpoint }: FeedListProps) => {
  const t = useTranslations('feed');
  const { items, hasMore, loading, failed, loadMore } = useFeedPagination({ query, initialItems, initialCursor, endpoint });

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {items.map((report) => (
          <li key={report.id}>
            <ReportCard report={report} />
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
          {loading ? t('loading') : t('loadMore')}
        </Button>
      )}
    </div>
  );
};
