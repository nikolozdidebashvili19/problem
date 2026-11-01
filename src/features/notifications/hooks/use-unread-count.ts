'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { NOTIFICATION_POLL_MS } from '@/shared/const/notifications.const';
import { http } from '@/shared/lib/http';

// Fired by the notifications page after marking items read, so the badge updates immediately
export const NOTIFICATIONS_CHANGED_EVENT = 'notifications:changed';

export const useUnreadCount = (enabled: boolean) => {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const refresh = () => {
      // Skip polling in background tabs to save requests on the free tier
      if (document.visibilityState === 'hidden') return;
      http
        .get<{ count: number }>('/notifications/unread-count')
        .then((response) => {
          if (!cancelled) setCount(response.count);
        })
        .catch(() => undefined);
    };

    refresh();
    const interval = window.setInterval(refresh, NOTIFICATION_POLL_MS);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [enabled, pathname]);

  return enabled ? count : 0;
};
