export const FEED_TABS = ['popular', 'new', 'fixed'] as const;

export const DEFAULT_FEED_TAB = 'popular';

export const FEED_PAGE_SIZE = 20;

export const FEED_EXCERPT_LENGTH = 220;

// hotScore = log10(max(votes, 1)) + (createdAtSeconds − EPOCH) / DECAY — one order of magnitude of votes ≈ 2 days
export const HOT_SCORE_EPOCH_S = 1735689600;

export const HOT_SCORE_DECAY_S = 172800;
