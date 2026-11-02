'use client';
import { useState } from 'react';

import { ProfileCommentPage } from '@/features/profiles/types/profile.types';
import { http } from '@/shared/lib/http';

export const useProfileComments = (userId: string, initial: ProfileCommentPage) => {
  const [items, setItems] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const loadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    setFailed(false);
    try {
      const page = await http.get<ProfileCommentPage>(`/users/${userId}/comments`, { params: { after: cursor } });
      setItems((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return { items, hasMore: cursor !== null, loading, failed, loadMore };
};
