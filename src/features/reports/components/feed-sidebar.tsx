'use client';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { type ReactNode } from 'react';

import { CategoryIcon } from '@/features/categories/components/category-icon';
import { CategorySummary } from '@/features/categories/types/category.types';
import { LocationSummary } from '@/features/locations/types/location.types';
import { FEED_TAB_ICONS } from '@/features/reports/components/feed-tabs';
import { DEFAULT_FEED_TAB, FEED_TABS } from '@/shared/const/feed.const';
import { cn } from '@/shared/lib/utils';
import { buildFeedHref, FeedLinkParams } from '@/shared/utils/feed-href';
import { localizedName } from '@/shared/utils/locale';

type FeedSidebarProps = {
  categories: CategorySummary[];
  districts: LocationSummary[];
};

type SidebarLinkProps = {
  href: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
};

const SidebarLink = ({ href, active, icon, children }: SidebarLinkProps) => (
  <li>
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
        active ? 'bg-link/10 font-medium text-link' : 'text-foreground hover:bg-accent'
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </Link>
  </li>
);

const SidebarSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <h2 className="px-3 pb-1 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </h2>
    <ul className="flex flex-col gap-0.5">{children}</ul>
  </div>
);

export const FeedSidebar = ({ categories, districts }: FeedSidebarProps) => {
  const t = useTranslations('feed');
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onFeed = pathname === '/';
  const current: FeedLinkParams = onFeed
    ? {
      tab: searchParams.get('tab') ?? DEFAULT_FEED_TAB,
      category: searchParams.get('category') ?? undefined,
      location: searchParams.get('location') ?? undefined,
      q: searchParams.get('q') ?? undefined,
    }
    : {};

  return (
    <nav aria-label={t('browseLabel')} className="flex flex-col gap-6">
      <SidebarSection title={t('sections.feeds')}>
        {FEED_TABS.map((tab) => {
          const Icon = FEED_TAB_ICONS[tab];
          return (
            <SidebarLink
              key={tab}
              href={buildFeedHref(current, { tab })}
              active={onFeed && current.tab === tab}
              icon={<Icon aria-hidden="true" className="size-4 shrink-0" />}
            >
              {t(`tabs.${tab}`)}
            </SidebarLink>
          );
        })}
      </SidebarSection>

      {districts.length > 0 && (
        <SidebarSection title={t('sections.tbilisi')}>
          {districts.map((district) => {
            const active = current.location === district.slug;
            return (
              <SidebarLink
                key={district.slug}
                href={buildFeedHref(current, { location: active ? undefined : district.slug })}
                active={active}
                icon={<MapPin aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}
              >
                {localizedName(district, locale)}
              </SidebarLink>
            );
          })}
        </SidebarSection>
      )}

      {categories.length > 0 && (
        <SidebarSection title={t('sections.categories')}>
          {categories.map((category) => {
            const active = current.category === category.slug;
            return (
              <SidebarLink
                key={category.slug}
                href={buildFeedHref(current, { category: active ? undefined : category.slug })}
                active={active}
                icon={<CategoryIcon icon={category.icon} className="text-muted-foreground" />}
              >
                {localizedName(category, locale)}
              </SidebarLink>
            );
          })}
        </SidebarSection>
      )}
    </nav>
  );
};
