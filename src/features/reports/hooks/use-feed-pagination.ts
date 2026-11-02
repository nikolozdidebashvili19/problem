'use client';
import { useState } from 'react';

import { FeedPage, ReportCard } from '@/features/reports/types/report.types';
import { http } from '@/shared/lib/http';
import { FeedLinkParams } from '@/shared/utils/feed-href';

type UseFeedPaginationOptions = {
  query: FeedLinkParams;
  initialItems: ReportCard[];
  initialCursor: string | null;
  endpoint?: string;
};

export const useFeedPagination = ({ query, initialItems, initialCursor, endpoint = '/reports' }: UseFeedPaginationOptions) => {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const loadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    setFailed(false);
    try {
      const page = await http.get<FeedPage>(endpoint, { params: { ...query, after: cursor } });
      // Dedupe in case a report moved between pages while scrolling
      setItems((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...page.items.filter((item) => !seen.has(item.id))];
      });
      setCursor(page.nextCursor);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return { items, hasMore: cursor !== null, loading, failed, loadMore };
};
