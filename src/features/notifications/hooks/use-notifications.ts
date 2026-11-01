'use client';
import { useState } from 'react';

import { NOTIFICATIONS_CHANGED_EVENT } from '@/features/notifications/hooks/use-unread-count';
import { NotificationPage, NotificationView } from '@/features/notifications/types/notification.types';
import { http } from '@/shared/lib/http';

export const useNotifications = (initial: NotificationPage) => {
  const [items, setItems] = useState<NotificationView[]>(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  const announce = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await http.get<NotificationPage>('/notifications', { params: { after: cursor } });
      setItems((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  };

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    await http.post('/notifications/read', {}).catch(() => undefined);
    announce();
  };

  // Fire-and-forget: opening a notification should never wait on this request
  const markRead = (id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
    void http.post('/notifications/read', { ids: [id] }).then(announce, () => undefined);
  };

  return {
    items,
    hasMore: cursor !== null,
    loadingMore,
    loadMore,
    markAllRead,
    markRead,
    hasUnread: items.some((item) => !item.read),
  };
};
