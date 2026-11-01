'use client';
import { Bell, House, Plus, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ROUTES } from '@/shared/const/routes.const';
import { cn } from '@/shared/lib/utils';

type MobileNavProps = {
  unreadCount: number;
};

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };

// Thumb-reachable primary actions on phones (PRODUCT §1 "mobile first")
export const MobileNav = ({ unreadCount }: MobileNavProps) => {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: ROUTES.home, label: t('home'), icon: House },
    { href: ROUTES.newReport, label: t('reportShort'), icon: Plus },
    { href: ROUTES.notifications, label: t('notifications'), icon: Bell, badge: unreadCount },
  ];

  return (
    <nav
      aria-label={t('mainNav')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-3">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = href === ROUTES.home ? pathname === href : pathname.startsWith(href);
          const isReport = href === ROUTES.newReport;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors outline-none',
                  'focus-visible:bg-accent',
                  active ? 'text-link' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'relative inline-flex items-center justify-center',
                    isReport && 'size-8 rounded-full bg-primary text-primary-foreground'
                  )}
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {badge !== undefined && badge > 0 && (
                    <span
                      className={cn(
                        'absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1',
                        'text-xs font-semibold leading-none text-primary-foreground'
                      )}
                    >
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
