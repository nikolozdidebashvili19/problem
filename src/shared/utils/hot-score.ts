import { HOT_SCORE_DECAY_S, HOT_SCORE_EPOCH_S } from '@/shared/const/feed.const';

// Mirrored by the aggregation pipeline in reportRepository.incrementUpvotes — keep both in sync
export function computeHotScore(upvoteCount: number, createdAt: Date): number {
  const seconds = createdAt.getTime() / 1000;
  return Math.log10(Math.max(upvoteCount, 1)) + (seconds - HOT_SCORE_EPOCH_S) / HOT_SCORE_DECAY_S;
}
