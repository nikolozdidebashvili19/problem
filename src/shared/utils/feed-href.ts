import { DEFAULT_FEED_TAB } from '@/shared/const/feed.const';

export type FeedLinkParams = {
  tab?: string;
  category?: string;
  location?: string;
  q?: string;
};

// Filters live in the URL so every filtered view is shareable (PRODUCT §8)
export function buildFeedHref(current: FeedLinkParams, patch: FeedLinkParams = {}): string {
  const merged = { ...current, ...patch };
  const params = new URLSearchParams();
  if (merged.tab && merged.tab !== DEFAULT_FEED_TAB) params.set('tab', merged.tab);
  if (merged.category) params.set('category', merged.category);
  if (merged.location) params.set('location', merged.location);
  if (merged.q) params.set('q', merged.q);
  const query = params.toString();
  return query ? `/?${query}` : '/';
}
