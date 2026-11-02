'use client';
import { useState } from 'react';

import { CommentPage, CommentView } from '@/features/comments/types/comment.types';
import { http } from '@/shared/lib/http';

export const useComments = (shortId: string, initial: CommentPage) => {
  const [items, setItems] = useState<CommentView[]>(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);
  // Comments added/removed in this session, applied on top of the server total
  const [delta, setDelta] = useState(0);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await http.get<CommentPage>(`/reports/${shortId}/comments`, { params: { after: cursor } });
      // A comment posted in this session can come back in a later page
      setItems((current) => {
        const known = new Set(current.map((comment) => comment.id));
        return [...current, ...page.items.filter((comment) => !known.has(comment.id))];
      });
      setCursor(page.nextCursor);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoadingMore(false);
    }
  };

  // Returns true when posted so the form can reset
  const add = async (body: string, parentId?: string): Promise<boolean> => {
    setError(null);
    try {
      const comment = await http.post<CommentView>(`/reports/${shortId}/comments`, { body, parentId });
      setItems((current) => [...current, comment]);
      setDelta((value) => value + 1);
      return true;
    } catch (postError) {
      setError(postError);
      return false;
    }
  };

  const remove = async (id: string) => {
    setError(null);
    const previous = items;
    setItems((current) => current.filter((comment) => comment.id !== id));
    setDelta((value) => value - 1);
    try {
      await http.delete(`/comments/${id}`);
    } catch (deleteError) {
      setItems(previous);
      setDelta((value) => value + 1);
      setError(deleteError);
    }
  };

  return { items, delta, hasMore: cursor !== null, loadingMore, loadMore, add, remove, error };
};
