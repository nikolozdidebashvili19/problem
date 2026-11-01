'use client';
import { LogOut, MapPinned, Menu, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { UserRole } from '@/features/auth/types/auth.types';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { HeaderSearch } from '@/shared/components/layout/header-search';
import { LocaleSwitcher } from '@/shared/components/layout/locale-switcher';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { Button } from '@/shared/components/ui/button';
import { APP_NAME } from '@/shared/const/app.const';
import { ROUTES } from '@/shared/const/routes.const';

type SessionUser = {
  name?: string | null;
  avatar?: string | null;
  role?: UserRole;
};

type HeaderProps = {
  // Provided by AppShell to open the mobile navigation drawer
  onOpenMenu?: () => void;
  // Unread notifications; the bell is shown only inside the app shell
  unreadCount?: number;
};

export const Header = ({ onOpenMenu, unreadCount }: HeaderProps) => {
  const t = useTranslations('common');
  const tNav = useTranslations('nav');
  const { data: session } = useSession();
  const { logout } = useLogout();
  const sessionUser = session?.user as SessionUser | undefined;
  const userName = sessionUser?.name ?? '';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-4 lg:px-6">
        {onOpenMenu && (
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onOpenMenu}
            aria-label={t('openNavigation')}
            className="-ml-1 lg:hidden"
          >
            <Menu className="size-5" />
          </Button>
        )}

        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          <span
            aria-hidden="true"
            className="inline-flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <MapPinned className="size-4" />
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground">{APP_NAME}</span>
        </Link>

        <div className="mx-auto hidden w-full max-w-xl md:block">
          <Suspense>
            <HeaderSearch />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
          <Button asChild className="hidden h-10 rounded-full px-4 font-semibold lg:inline-flex">
            <Link href={ROUTES.newReport}>
              <Plus aria-hidden="true" className="size-4" />
              {tNav('report')}
            </Link>
          </Button>
          {sessionUser && unreadCount !== undefined && <NotificationBell count={unreadCount} className="hidden lg:inline-flex" />}
          <LocaleSwitcher />
          <span className="hidden sm:inline-flex">
            <ThemeToggle />
          </span>

          {sessionUser ? (
            <>
              {sessionUser.role === 'admin' && (
                <Button variant="ghost" size="sm" asChild className="hidden text-muted-foreground hover:text-foreground sm:inline-flex">
                  <Link href="/dashboard">{t('dashboard')}</Link>
                </Button>
              )}
              {sessionUser.avatar ? (
                <Image
                  src={sessionUser.avatar}
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 rounded-full border border-border object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground"
                >
                  {initials || 'U'}
                </span>
              )}
              <span className="sr-only">{t('signedInAs', { name: userName })}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label={t('signOut')}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button asChild className="h-10 rounded-full px-4 font-semibold sm:px-5">
              <Link href="/sign-in">{t('signIn')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
