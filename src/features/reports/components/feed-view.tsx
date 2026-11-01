import { getTranslations } from 'next-intl/server';

import { ActiveFilters } from '@/features/reports/components/active-filters';
import { FeedEmptyState } from '@/features/reports/components/feed-empty-state';
import { FeedList } from '@/features/reports/components/feed-list';
import { FeedTabs } from '@/features/reports/components/feed-tabs';
import { getFeedFilterLabelsService } from '@/features/reports/service/feed-navigation.service';
import { listFeedService } from '@/features/reports/service/feed.service';
import { FeedQuerySchema, FeedQueryType } from '@/features/reports/validations/report.validation';
import { HeaderSearch } from '@/shared/components/layout/header-search';
import { getViewerId } from '@/shared/middleware/get-viewer';
import { buildFeedHref, FeedLinkParams } from '@/shared/utils/feed-href';

type FeedViewProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function parseQuery(searchParams: FeedViewProps['searchParams']): FeedQueryType {
  const flat = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  // The first page never starts from a cursor; invalid params fall back to the default feed
  const parsed = FeedQuerySchema.safeParse({ ...flat, after: undefined });
  return parsed.success ? parsed.data : FeedQuerySchema.parse({});
}

export const FeedView = async ({ searchParams }: FeedViewProps) => {
  const t = await getTranslations('feed');
  const query = parseQuery(searchParams);
  const linkQuery: FeedLinkParams = { tab: query.tab, category: query.category, location: query.location, q: query.q };
  const filtered = Boolean(query.category || query.location || query.q);

  const [feed, labels] = await Promise.all([
    listFeedService(query, await getViewerId()),
    getFeedFilterLabelsService(query),
  ]);
  const page = 'items' in feed.data ? feed.data : { items: [], nextCursor: null };

  return (
    <section aria-labelledby="feed-heading" className="flex flex-col gap-4">
      <HeaderSearch className="md:hidden" />

      <div className="flex flex-col gap-1">
        <h1 id="feed-heading" className="text-2xl">
          {t(`tabs.${query.tab}`)}
        </h1>
        <p className="text-sm text-muted-foreground">{t(`descriptions.${query.tab}`)}</p>
      </div>

      <FeedTabs active={query.tab} query={linkQuery} />
      <ActiveFilters query={linkQuery} labels={labels} />

      {page.items.length === 0 ? (
        <FeedEmptyState filtered={filtered} clearHref={buildFeedHref({ tab: query.tab })} />
      ) : (
        <FeedList
          key={buildFeedHref(linkQuery)}
          query={linkQuery}
          initialItems={page.items}
          initialCursor={page.nextCursor}
        />
      )}
    </section>
  );
};
