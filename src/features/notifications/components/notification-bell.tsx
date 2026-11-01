'use client';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ROUTES } from '@/shared/const/routes.const';
import { cn } from '@/shared/lib/utils';

const MAX_BADGE = 9;

type NotificationBellProps = {
  count: number;
  className?: string;
};

export const NotificationBell = ({ count, className }: NotificationBellProps) => {
  const t = useTranslations('nav');
  const label = count > 0 ? `${t('notifications')} — ${t('unread', { count })}` : t('notifications');

  return (
    <Link
      href={ROUTES.notifications}
      aria-label={label}
      title={t('notifications')}
      className={cn(
        'relative inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none',
        'hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
        className
      )}
    >
      <Bell aria-hidden="true" className="size-5" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1',
            'text-xs font-semibold leading-none text-primary-foreground'
          )}
        >
          {count > MAX_BADGE ? `${MAX_BADGE}+` : count}
        </span>
      )}
    </Link>
  );
};
