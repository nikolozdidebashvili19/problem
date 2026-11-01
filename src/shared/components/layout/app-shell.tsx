'use client';
import { X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState, type MouseEvent, type ReactNode } from 'react';

import { useUnreadCount } from '@/features/notifications/hooks/use-unread-count';
import { Header } from '@/shared/components/layout/header';
import { MobileNav } from '@/shared/components/layout/mobile-nav';
import { Button } from '@/shared/components/ui/button';
import { APP_NAME } from '@/shared/const/app.const';
import { cn } from '@/shared/lib/utils';

type AppShellProps = {
  sidebar: ReactNode;
  rail?: ReactNode;
  children: ReactNode;
};

export const AppShell = ({ sidebar, rail, children }: AppShellProps) => {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);
  const { status } = useSession();
  // One poller for the whole shell, shared by the header bell and the mobile tab bar
  const unreadCount = useUnreadCount(status === 'authenticated');

  // Close the drawer when any navigation link inside it is followed
  const closeOnLinkClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onOpenMenu={() => setOpen(true)} unreadCount={unreadCount} />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-3 sm:px-4 lg:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-14 max-h-screen overflow-y-auto pb-24 pt-5">{sidebar}</div>
        </aside>

        {/* Bottom padding keeps content clear of the fixed mobile tab bar */}
        <main className="flex min-w-0 flex-1 flex-col gap-8 pb-24 pt-5 lg:pb-5">{children}</main>

        {rail && (
          <aside className="hidden w-72 shrink-0 xl:block">
            <div className="sticky top-14 pt-5">{rail}</div>
          </aside>
        )}
      </div>

      <MobileNav unreadCount={unreadCount} />

      {/* Mobile off-canvas navigation */}
      <div
        className={cn('fixed inset-0 z-50 lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}
        aria-hidden={!open}
        inert={!open}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label={t('closeNavigation')}
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-foreground/40 transition-opacity duration-200 motion-reduce:transition-none',
            open ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('navigation')}
          onClick={closeOnLinkClick}
          className={cn(
            'absolute inset-y-0 left-0 flex w-80 max-w-full flex-col bg-background shadow-xl',
            'transition-transform duration-200 ease-out motion-reduce:transition-none',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <span className="text-base font-semibold">{APP_NAME}</span>
            <Button variant="ghost" size="icon-lg" onClick={() => setOpen(false)} aria-label={t('closeNavigation')}>
              <X className="size-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-4">{sidebar}</div>
        </div>
      </div>
    </div>
  );
};
