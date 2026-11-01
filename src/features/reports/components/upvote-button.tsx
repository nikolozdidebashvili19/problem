'use client';
import { ArrowBigUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useUpvote } from '@/features/reports/hooks/use-upvote';
import { cn } from '@/shared/lib/utils';

type UpvoteButtonProps = {
  shortId: string;
  title: string;
  initialVoted: boolean;
  initialCount: number;
  canVote: boolean;
};

export const UpvoteButton = ({ shortId, title, initialVoted, initialCount, canVote }: UpvoteButtonProps) => {
  const t = useTranslations('report');
  const { voted, count, pending, toggle } = useUpvote({ shortId, initialVoted, initialCount });

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        onClick={toggle}
        disabled={!canVote || pending}
        aria-pressed={voted}
        aria-label={voted ? t('removeUpvote', { title }) : t('upvote', { title })}
        title={canVote ? undefined : t('votingUnavailable')}
        className={cn(
          'inline-flex size-11 items-center justify-center rounded-md transition-colors outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
          voted ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
        )}
      >
        <ArrowBigUp aria-hidden="true" className={cn('size-6', voted && 'fill-current')} />
      </button>
      <span className={cn('text-sm font-semibold tabular-nums', voted ? 'text-primary' : 'text-foreground')}>
        {count}
      </span>
    </div>
  );
};
